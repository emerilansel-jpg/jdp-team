import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/server.js';
import { getDb } from '../src/db.js';
import { config } from '../src/config.js';

test('JDP 20% Recurring Affiliate Engine & Partner System Tests', async (t) => {
  const app = await buildApp();
  const db = getDb();

  let adminCookie = '';
  let initialCommId = '';
  let renewalCommId = '';
  const runId = Date.now();

  // Helper to obtain staff/admin session cookie
  const loginAdmin = async () => {
    if (adminCookie) return adminCookie;
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@jdp.team',
        password: config.admin.password || 'jdp123'
      }
    });
    assert.equal(res.statusCode, 200);
    const rawCookie = res.headers['set-cookie'];
    adminCookie = Array.isArray(rawCookie) ? rawCookie[0].split(';')[0] : rawCookie.split(';')[0];
    return adminCookie;
  };

  await t.test('1. James is seeded with 20% rate automatically', () => {
    const james = db.prepare('SELECT * FROM affiliates WHERE code = ? COLLATE NOCASE').get('james');
    assert.ok(james, 'James partner must exist in affiliates table');
    assert.equal(james.id, 'aff_james');
    assert.equal(james.code, 'james');
    assert.equal(james.name, 'James De Lacey');
    assert.equal(james.commission_rate, 0.20, 'Commission rate must be 20% (0.20)');
    assert.equal(james.status, 'active');
  });

  await t.test('2. Public partner join creates new affiliate and blocks duplicate codes', async () => {
    const partnerPayload = {
      name: 'Sarah Connor',
      email: `sarah-${runId}@partneragency.com`,
      paypal_email: `sarah.payout-${runId}@gmail.com`,
      code: `rankingacademy-${runId}`
    };

    // 2.1 Successful registration
    const res = await app.inject({
      method: 'POST',
      url: '/api/affiliates/join',
      payload: partnerPayload
    });

    assert.equal(res.statusCode, 201);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.equal(body.affiliate.code, partnerPayload.code);
    assert.equal(body.affiliate.commission_rate, 0.20);
    assert.equal(body.affiliate.status, 'active');
    assert.equal(body.affiliate.links.bfcm, `https://jdp.team/bfcm?ref=${partnerPayload.code}`);
    assert.equal(body.affiliate.links.home, `https://jdp.team/?ref=${partnerPayload.code}`);

    // 2.2 Duplicate registration blocked (case-insensitive)
    const dupRes = await app.inject({
      method: 'POST',
      url: '/api/affiliates/join',
      payload: {
        name: 'Another User',
        email: 'another@agency.com',
        code: partnerPayload.code.toUpperCase()
      }
    });

    assert.equal(dupRes.statusCode, 400);
    const dupBody = dupRes.json();
    assert.match(dupBody.error, /already taken/i);
  });

  await t.test('3. PayPal initial sale webhook credits 20% with H+7 payout_due_at', async () => {
    const clientEmail = `subscriber-${runId}@clientagency.com`;
    const initialSaleId = `PP-INIT-SALE-${runId}`;
    const agreementId = `I-SUB-TEST-${runId}`;

    const webhookPayload = {
      id: `WH-EVENT-INIT-${runId}`,
      event_type: 'PAYMENT.SALE.COMPLETED',
      resource: {
        id: initialSaleId,
        billing_agreement_id: agreementId,
        amount: {
          total: '480.00',
          currency: 'USD'
        },
        description: 'Dedicated Junior Pod (160h/mo) - BOGO Scale',
        custom_id: '{"ref":"james"}',
        subscriber: {
          email_address: clientEmail,
          name: {
            given_name: 'David',
            surname: 'Miller'
          }
        }
      }
    };

    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/paypal',
      payload: webhookPayload
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.equal(body.status, 'paid');
    assert.ok(body.order_id);

    // Verify order attributed to James
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(body.order_id);
    assert.ok(order);
    assert.equal(order.affiliate_id, 'aff_james');
    assert.equal(order.referral_code, 'james');
    assert.equal(order.total_cents, 48000);

    // Verify initial 20% commission created in affiliate_commissions
    const comm = db.prepare('SELECT * FROM affiliate_commissions WHERE order_id = ? AND type = ?').get(order.id, 'initial');
    assert.ok(comm, 'Initial commission record must exist');
    initialCommId = comm.id;
    assert.equal(comm.affiliate_id, 'aff_james');
    assert.equal(comm.gross_amount_cents, 48000);
    assert.equal(comm.commission_rate, 0.20);
    assert.equal(comm.commission_amount_cents, 9600, '20% of $480.00 must be $96.00 (9600 cents)');
    assert.equal(comm.status, 'pending');
    assert.equal(comm.paypal_event_id, initialSaleId);

    // Verify H+7 payout_due_at is ~7 days ahead of created_at
    const createdTime = new Date(comm.created_at).getTime();
    const dueTime = new Date(comm.payout_due_at).getTime();
    const diffDays = (dueTime - createdTime) / (1000 * 60 * 60 * 24);
    assert.ok(diffDays >= 6.8 && diffDays <= 7.2, `payout_due_at must be ~7 days ahead (got ${diffDays} days)`);
  });

  await t.test('4. PayPal renewal sale webhook credits 20% with H+7 payout_due_at', async () => {
    const renewalSaleId = `PP-RENEWAL-SALE-${runId}`;
    const agreementId = `I-SUB-TEST-${runId}`;

    const renewalPayload = {
      id: `WH-EVENT-RENEW-${runId}`,
      event_type: 'PAYMENT.SALE.COMPLETED',
      resource: {
        id: renewalSaleId,
        billing_agreement_id: agreementId,
        amount: {
          total: '480.00',
          currency: 'USD'
        },
        description: 'Monthly Subscription Renewal'
      }
    };

    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/paypal',
      payload: renewalPayload
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.equal(body.status, 'renewal_processed');
    assert.equal(body.commission_amount_cents, 9600);

    // Verify renewal commission in DB
    const comm = db.prepare('SELECT * FROM affiliate_commissions WHERE paypal_event_id = ?').get(renewalSaleId);
    assert.ok(comm, 'Renewal commission must exist');
    renewalCommId = comm.id;
    assert.equal(comm.affiliate_id, 'aff_james');
    assert.equal(comm.type, 'renewal', 'Commission type must be renewal');
    assert.equal(comm.gross_amount_cents, 48000);
    assert.equal(comm.commission_rate, 0.20);
    assert.equal(comm.commission_amount_cents, 9600);
    assert.equal(comm.status, 'pending');

    const createdTime = new Date(comm.created_at).getTime();
    const dueTime = new Date(comm.payout_due_at).getTime();
    const diffDays = (dueTime - createdTime) / (1000 * 60 * 60 * 24);
    assert.ok(diffDays >= 6.8 && diffDays <= 7.2, 'Renewal payout_due_at must be Net 7');
  });

  await t.test('5. Webhook is idempotent (duplicate event IDs ignored)', async () => {
    const renewalSaleId = `PP-RENEWAL-SALE-${runId}`;
    const agreementId = `I-SUB-TEST-${runId}`;

    const duplicatePayload = {
      id: `WH-EVENT-RENEW-${runId}`,
      event_type: 'PAYMENT.SALE.COMPLETED',
      resource: {
        id: renewalSaleId,
        billing_agreement_id: agreementId,
        amount: {
          total: '480.00',
          currency: 'USD'
        }
      }
    };

    const countBefore = db.prepare('SELECT COUNT(*) as count FROM affiliate_commissions WHERE affiliate_id = ?').get('aff_james').count;

    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/paypal',
      payload: duplicatePayload
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.equal(body.status, 'already_processed');

    const countAfter = db.prepare('SELECT COUNT(*) as count FROM affiliate_commissions WHERE affiliate_id = ?').get('aff_james').count;
    assert.equal(countAfter, countBefore, 'Duplicate webhook event must not create duplicate commission');
  });

  await t.test('6. Admin can mark commission as paid', async () => {
    const cookie = await loginAdmin();

    assert.ok(initialCommId, 'Initial commission ID must be defined');

    const res = await app.inject({
      method: 'POST',
      url: `/api/admin/commissions/${initialCommId}/pay`,
      headers: { cookie }
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.equal(body.commission_id, initialCommId);
    assert.equal(body.status, 'paid');
    assert.ok(body.paid_at);

    // Verify in database
    const updated = db.prepare('SELECT * FROM affiliate_commissions WHERE id = ?').get(initialCommId);
    assert.equal(updated.status, 'paid');
    assert.ok(updated.paid_at);
  });

  await t.test('7. Affiliate dashboard API returns accurate totals and masked client ledger', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/affiliates/james'
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.equal(body.affiliate.code, 'james');
    assert.equal(body.affiliate.name, 'James De Lacey');

    // Metrics verification
    const metrics = body.metrics;
    assert.ok(metrics.total_referred_orders >= 1);
    assert.ok(metrics.active_subscriptions >= 1);
    assert.ok(parseFloat(metrics.gross_volume_usd) >= 960.00, 'Gross volume should include initial + renewal ($960)');
    assert.ok(parseFloat(metrics.total_paid_usd) >= 96.00, 'Paid should include the $96 marked as paid');
    assert.ok(parseFloat(metrics.total_unpaid_usd) >= 96.00, 'Unpaid should include the pending renewal ($96)');

    // Ledger verification
    assert.ok(Array.isArray(body.commissions));
    assert.ok(body.commissions.length >= 2, 'Must have at least initial and renewal in ledger');

    const initialEntry = body.commissions.find(c => c.id === initialCommId);
    assert.ok(initialEntry);
    assert.equal(initialEntry.type, 'initial');
    assert.equal(initialEntry.status, 'paid');
    assert.equal(initialEntry.gross_amount, '480.00');
    assert.equal(initialEntry.commission_amount, '96.00');
    assert.match(initialEntry.client_masked, /\*+/, 'Client email must be masked for privacy');

    const renewalEntry = body.commissions.find(c => c.id === renewalCommId);
    assert.ok(renewalEntry);
    assert.equal(renewalEntry.type, 'renewal');
    assert.equal(renewalEntry.status, 'pending');
    assert.equal(renewalEntry.gross_amount, '480.00');
    assert.equal(renewalEntry.commission_amount, '96.00');
  });

  await t.test('8. Admin affiliate list endpoint returns overview & unpaid ledger', async () => {
    const cookie = await loginAdmin();

    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/affiliates',
      headers: { cookie }
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.ok(Array.isArray(body.affiliates));
    assert.ok(body.affiliates.some(a => a.code === 'james'));
    assert.ok(Array.isArray(body.unpaid_commissions));
    assert.ok(body.unpaid_commissions.some(c => c.id === renewalCommId));
  });

  await t.test('9. Static HTML endpoints for partner and affiliate load successfully', async () => {
    const resPartner = await app.inject({ method: 'GET', url: '/partner.html' });
    assert.equal(resPartner.statusCode, 200);
    assert.match(resPartner.body, /Partner With JDP/i);

    const resAffiliate = await app.inject({ method: 'GET', url: '/affiliate.html' });
    assert.equal(resAffiliate.statusCode, 200);
    assert.match(resAffiliate.body, /Affiliate Partner Dashboard/i);
  });
});
