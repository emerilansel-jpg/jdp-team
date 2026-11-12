import crypto from 'node:crypto';
import { getDb, id } from '../db.js';
import { sendMagicLinkEmail } from '../services/email.js';
import { config } from '../config.js';

export function extractReferralCode(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const str = raw.trim();
  if (!str) return null;

  // 1. JSON parse attempt e.g. {"ref":"james"} or {"referral_code":"james"}
  if ((str.startsWith('{') && str.endsWith('}')) || (str.startsWith('{"') && str.includes('}'))) {
    try {
      const parsed = JSON.parse(str);
      if (parsed.ref) return String(parsed.ref).trim().toLowerCase();
      if (parsed.referral_code) return String(parsed.referral_code).trim().toLowerCase();
      if (parsed.code) return String(parsed.code).trim().toLowerCase();
    } catch {}
  }

  // 2. Key-value format e.g. ref:james, ref=james, referral:james
  const kvMatch = str.match(/(?:ref|referral|referral_code|affiliate)[:=]([a-zA-Z0-9_-]+)/i);
  if (kvMatch) {
    return kvMatch[1].trim().toLowerCase();
  }

  // 3. Plain identifier (alphanumeric, dash, underscore, 2-40 chars, not an email)
  if (!str.includes('@') && /^[a-zA-Z0-9_-]{2,40}$/.test(str)) {
    return str.toLowerCase();
  }

  return null;
}

export async function paypalWebhookRoutes(fastify, options) {
  fastify.post('/api/webhooks/paypal', async (req, reply) => {
    const payload = req.body || {};
    const eventType = payload.event_type || 'UNKNOWN';
    const resource = payload.resource || {};

    console.log(`[PayPal Webhook] Received event: ${eventType} (ID: ${payload.id || 'N/A'})`);

    // We handle payment completions and subscription activations
    const recognizedEvents = [
      'PAYMENT.SALE.COMPLETED',
      'CHECKOUT.ORDER.APPROVED',
      'PAYMENT.CAPTURE.COMPLETED',
      'BILLING.SUBSCRIPTION.ACTIVATED',
      'BILLING.SUBSCRIPTION.CREATED'
    ];

    if (!recognizedEvents.includes(eventType)) {
      console.log(`[PayPal Webhook] Ignored unhandled event type: ${eventType}`);
      return reply.send({ ok: true, status: 'ignored', eventType });
    }

    // Extract subscription & order references
    const isSubscription = eventType.startsWith('BILLING.SUBSCRIPTION') || Boolean(resource.billing_agreement_id);
    const paypalSubId = isSubscription ? (resource.id?.startsWith('I-') ? resource.id : (resource.billing_agreement_id || resource.id)) : null;
    const paypalOrderId = !isSubscription ? (resource.id || payload.id) : null;

    const db = getDb();

    // Check for existing order
    let existingOrder = null;
    if (paypalSubId) {
      existingOrder = db.prepare('SELECT * FROM orders WHERE paypal_subscription_id = ?').get(paypalSubId);
    }
    if (!existingOrder && paypalOrderId) {
      existingOrder = db.prepare('SELECT * FROM orders WHERE paypal_order_id = ?').get(paypalOrderId);
    }

    // Handle Subscription Renewal for existing subscription order
    if (existingOrder) {
      if (eventType === 'PAYMENT.SALE.COMPLETED' && resource.billing_agreement_id) {
        const eventId = resource.id || payload.id;
        if (eventId) {
          const dup = db.prepare('SELECT id FROM affiliate_commissions WHERE paypal_event_id = ?').get(eventId);
          if (dup) {
            console.log(`[PayPal Webhook] Renewal sale event ${eventId} already processed (idempotent).`);
            return reply.send({ ok: true, status: 'already_processed', event_id: eventId, order_id: existingOrder.id });
          }
        }

        let renewalAmountCents = 0;
        const amtVal = resource.amount?.value || resource.amount?.total || '0';
        try {
          renewalAmountCents = Math.round(parseFloat(amtVal) * 100);
        } catch {
          renewalAmountCents = existingOrder.total_cents || 0;
        }

        let commAmountCents = 0;
        if (existingOrder.affiliate_id) {
          const aff = db.prepare("SELECT * FROM affiliates WHERE id = ?").get(existingOrder.affiliate_id);
          if (aff && aff.status === 'active') {
            const rate = aff.commission_rate || 0.20;
            commAmountCents = Math.round(renewalAmountCents * rate);
            const commId = id('comm');

            db.prepare(`
              INSERT INTO affiliate_commissions (
                id, affiliate_id, order_id, paypal_event_id, gross_amount_cents,
                commission_rate, commission_amount_cents, currency, type, status,
                payout_due_at, notes
              ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, 'renewal', 'pending',
                datetime('now', '+7 days'), ?
              )
            `).run(
              commId,
              aff.id,
              existingOrder.id,
              eventId,
              renewalAmountCents,
              rate,
              commAmountCents,
              resource.amount?.currency || 'USD',
              `Subscription renewal commission (Agreement: ${resource.billing_agreement_id})`
            );
            console.log(`[PayPal Webhook] Recorded renewal commission $${(commAmountCents / 100).toFixed(2)} for affiliate ${aff.code}`);
          }
        }

        return reply.send({
          ok: true,
          status: 'renewal_processed',
          order_id: existingOrder.id,
          commission_amount_cents: commAmountCents
        });
      }

      console.log(`[PayPal Webhook] Order ${existingOrder.id} already exists for PayPal ref.`);
      return reply.send({ ok: true, status: 'already_processed', order_id: existingOrder.id });
    }

    // Extract client email - do NOT let custom_id override payer email
    const rawEmail = resource.subscriber?.email_address ||
                     resource.payer?.email_address ||
                     resource.payer?.payer_info?.email ||
                     (typeof resource.custom_id === 'string' && resource.custom_id.includes('@') ? resource.custom_id : null) ||
                     (typeof resource.custom === 'string' && resource.custom.includes('@') ? resource.custom : null);

    if (!rawEmail) {
      console.warn('[PayPal Webhook] Could not resolve client email address from payload.');
      return reply.status(400).send({ error: 'Client email missing from PayPal payload' });
    }

    const clientEmail = rawEmail.trim().toLowerCase();

    // Extract client name
    let clientName = clientEmail.split('@')[0];
    if (resource.subscriber?.name?.given_name) {
      clientName = `${resource.subscriber.name.given_name} ${resource.subscriber.name.surname || ''}`.trim();
    } else if (resource.payer?.name?.given_name) {
      clientName = `${resource.payer.name.given_name} ${resource.payer.name.surname || ''}`.trim();
    }

    // Extract referral code
    const refCode = extractReferralCode(resource.custom_id) ||
                    extractReferralCode(resource.custom) ||
                    extractReferralCode(payload.custom_id);

    let affiliate = null;
    if (refCode) {
      affiliate = db.prepare("SELECT * FROM affiliates WHERE code = ? COLLATE NOCASE AND status = 'active'").get(refCode);
    }

    // Resolve or provision user
    let user = db.prepare('SELECT id, email, role, display_name FROM users WHERE email = ?').get(clientEmail);
    if (!user) {
      const userId = id('usr');
      db.prepare(`
        INSERT INTO users (id, email, role, display_name)
        VALUES (?, ?, 'client', ?)
      `).run(userId, clientEmail, clientName);
      user = { id: userId, email: clientEmail, role: 'client', display_name: clientName };
      console.log(`[PayPal Webhook] Auto-provisioned new client user: ${clientEmail} (${userId})`);
    }

    // Calculate total amount in cents
    let totalCents = 0;
    const amountVal = resource.amount?.value ||
                      resource.amount?.total ||
                      resource.billing_info?.last_payment?.amount?.value ||
                      '0';
    try {
      totalCents = Math.round(parseFloat(amountVal) * 100);
    } catch {
      totalCents = 0;
    }

    const serviceBrief = resource.description ||
                         (resource.plan_id ? `Subscription Plan (${resource.plan_id})` :
                         'Dedicated Remote Fulfillment Package');

    const orderId = id('ord');
    const billingCycle = isSubscription ? 'monthly' : 'one_time';

    // Insert Order with affiliate attribution
    db.prepare(`
      INSERT INTO orders (id, client_id, status, brief, intake_data, total_cents, paypal_subscription_id, paypal_order_id, billing_cycle, affiliate_id, referral_code)
      VALUES (?, ?, 'paid', ?, '{}', ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      user.id,
      serviceBrief,
      totalCents,
      paypalSubId,
      paypalOrderId,
      billingCycle,
      affiliate ? affiliate.id : null,
      affiliate ? affiliate.code : (refCode || null)
    );

    // Record initial affiliate commission if active affiliate found
    if (affiliate && totalCents > 0) {
      const commRate = affiliate.commission_rate || 0.20;
      const commAmountCents = Math.round(totalCents * commRate);
      const eventId = resource.id || payload.id;
      const commId = id('comm');

      const dupComm = eventId ? db.prepare('SELECT id FROM affiliate_commissions WHERE paypal_event_id = ?').get(eventId) : null;
      if (!dupComm) {
        db.prepare(`
          INSERT INTO affiliate_commissions (
            id, affiliate_id, order_id, paypal_event_id, gross_amount_cents,
            commission_rate, commission_amount_cents, currency, type, status,
            payout_due_at, notes
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, 'initial', 'pending',
            datetime('now', '+7 days'), ?
          )
        `).run(
          commId,
          affiliate.id,
          orderId,
          eventId,
          totalCents,
          commRate,
          commAmountCents,
          resource.amount?.currency || 'USD',
          `Initial order commission (Ref: ${affiliate.code})`
        );
        console.log(`[PayPal Webhook] Recorded initial commission $${(commAmountCents / 100).toFixed(2)} for affiliate ${affiliate.code}`);
      }
    }

    // Insert Default Line Item
    const itemId = id('item');
    db.prepare(`
      INSERT INTO order_items (id, order_id, service_name, qty, status, notes)
      VALUES (?, ?, ?, 1, 'queued', 'Initial provisioning via PayPal webhook')
    `).run(itemId, orderId, serviceBrief);

    // Insert Welcome Message in Ticket Thread
    const msgId = id('msg');
    const fromMasked = `order-${orderId}-c@${config.smtpDomain}`;
    const toMasked = `order-${orderId}-v@${config.smtpDomain}`;
    const welcomeBody = `Welcome to JDP Team! Your order has been successfully activated.
Please fill out your project intake details in the portal so our specialists can begin immediately.
You can reply to this thread directly from your inbox or via the portal dashboard.`;

    db.prepare(`
      INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
      VALUES (?, ?, ?, ?, ?, ?, 'client')
    `).run(msgId, orderId, user.id, welcomeBody, fromMasked, toMasked);

    // Generate Magic Link for Client
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
      INSERT INTO magic_links (token, user_id, email, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(token, user.id, clientEmail, expiresAt);

    // Send Magic Link Email with direct route to their new order
    await sendMagicLinkEmail({
      email: clientEmail,
      token,
      nextUrl: `/orders/${orderId}`
    });

    console.log(`[PayPal Webhook] Successfully created Order ${orderId} for ${clientEmail} with magic link.`);

    return reply.send({
      ok: true,
      order_id: orderId,
      client_email: clientEmail,
      status: 'paid'
    });
  });
}
