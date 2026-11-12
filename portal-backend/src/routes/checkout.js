import crypto from 'node:crypto';
import { getDb, id } from '../db.js';
import { config } from '../config.js';

export async function checkoutRoutes(fastify, options) {
  // GET /api/checkout/packages - List available simulation packages & wholesale rate card
  fastify.get('/api/checkout/packages', async (req, reply) => {
    return reply.send({
      ok: true,
      packages: [
        {
          id: 'tripwire-1usd',
          name: '$1 "Prove It" Agency Test Task (BFCM Special)',
          category: 'BFCM Exclusive',
          price_cents: 100,
          price_display: '$1',
          rate_hourly: 'Loss Leader Test',
          billing_cycle: 'one_time',
          badge: '🔥 $1 Prove It Task',
          description: 'Zero-risk test task. Hand off 1 real client deliverable. 24–48h SLA turnaround with dedicated English PM.',
          deliverables: [
            'Choice: Topical Map, GEO Article, Entity Audit, or Tech VA Sprint',
            '24 to 48 Hours SLA Delivery',
            '1 Dedicated English PM Communication',
            '100% White-Label Client-Ready Deliverable'
          ]
        },
        {
          id: 'junior-pod-bogo',
          name: 'Junior Pod BOGO — 2X Output (80h/mo)',
          category: 'BFCM Exclusive',
          price_cents: 18200,
          price_display: '$182/mo',
          rate_hourly: 'BOGO (2x Output)',
          billing_cycle: 'monthly',
          badge: '🎁 2x Output For Life',
          description: 'BOGO on Junior Pod. Normally 40 hrs -> Now 80 hrs/mo locked in for life. Dedicated English PM + full white-label.',
          deliverables: [
            '80 Dedicated Hours / Month (Normally 40 hrs)',
            '2x Velocity On Outreach, Scraping, Listicles & CRM',
            'Lead English PM Oversight & Slack Sync',
            'Rate Locked In For Life While Active'
          ]
        },
        {
          id: 'senior-conductor-bogo',
          name: 'Senior Conductor BOGO — 2X Output (240h/mo)',
          category: 'BFCM Exclusive',
          price_cents: 52900,
          price_display: '$529/mo',
          rate_hourly: 'BOGO (2x Output)',
          billing_cycle: 'monthly',
          badge: '🚀 Double AI Velocity',
          description: 'BOGO on Senior AI Conductor Pod. Normally 120 hrs -> Now 240 hrs/mo. n8n, AI content factory & custom agents.',
          deliverables: [
            '240 Dedicated Engineering Hours / Month',
            'Custom AI Pipelines & Lead Scraping Agents',
            'Dedicated English PM & Direct Slack Sync',
            'Rate Locked In For Life While Active'
          ]
        },
        {
          id: 'junior-pod',
          name: 'Dedicated Junior Pod (160h/mo)',
          category: 'Pod Staffing',
          price_cents: 48000,
          price_display: '$480/mo',
          rate_hourly: '$3.00/hr',
          billing_cycle: 'monthly',
          badge: 'Most Popular Wholesale',
          description: '1 Dedicated Junior Specialist + Lead PM oversight. Perfect for SEO outreach, link insertions, data scraping & CRM hygiene.',
          deliverables: [
            '160 Dedicated Hours / Month',
            'Lead PM English Interface & Daily SLA',
            'Full White-Label Execution & Reporting',
            '2-Way Anonymized Email Relay'
          ]
        },
        {
          id: 'senior-conductor',
          name: 'Senior AI Conductor Pod (160h/mo)',
          category: 'Pod Staffing',
          price_cents: 80000,
          price_display: '$800/mo',
          rate_hourly: '$5.00/hr',
          billing_cycle: 'monthly',
          badge: 'High Value Automation',
          description: '1 Senior AI Workflow Specialist + Custom Agent Pipelines (n8n / Python / Make / OpenClaw).',
          deliverables: [
            '160 Dedicated Engineering Hours',
            'Custom Lead Gen & Scraping Agents',
            'AI Content Factory with Quality Gates',
            'Direct Slack / In-Portal Ticket Sync'
          ]
        },
        {
          id: 'fullstack-dev',
          name: 'Full-Stack Developer Pod (160h/mo)',
          category: 'Pod Staffing',
          price_cents: 64000,
          price_display: '$640/mo',
          rate_hourly: '$4.00/hr',
          billing_cycle: 'monthly',
          badge: 'Engineering',
          description: '1 Dedicated Full-Stack Engineer (React, Vue, Node.js, Python, Fastify, WordPress/Headless).',
          deliverables: [
            '160 Dedicated Dev Hours',
            'Git PR Workflow & Code Reviews',
            'Bug Fixing, Integrations & API Builds',
            'Lead Tech Lead Verification'
          ]
        },
        {
          id: 'topical-pack',
          name: 'Topical Authority 5-Pack Sprint',
          category: 'A La Carte Sprints',
          price_cents: 15000,
          price_display: '$150',
          rate_hourly: 'Fixed Fee',
          billing_cycle: 'one_time',
          badge: 'Turnkey Sprint',
          description: '5 Long-Form (2,500+ words) Semantic Entity-Optimized Articles with custom diagrams & schema markup.',
          deliverables: [
            '5 Deep Entity-Rich Content Pieces',
            'Surfer / Neuron / InLinks Semantic Grade A+',
            'Custom Branded Infographics & Visuals',
            'Turnkey CMS Draft or Markdown Export'
          ]
        },
        {
          id: 'tier1-pr',
          name: 'Tier-1 PR Wire Distribution',
          category: 'A La Carte Sprints',
          price_cents: 24000,
          price_display: '$240',
          rate_hourly: 'Fixed Fee',
          billing_cycle: 'one_time',
          badge: 'Authority Blast',
          description: 'Guaranteed syndication across Associated Press (AP News), Yahoo Finance, MarketWatch, and 300+ affiliate news outlets.',
          deliverables: [
            'AP News & Major News Syndication',
            'High DA/DR Dofollow Brand Citations',
            'Full PDF Proof-of-Placement Live Report',
            'Permanent Live Links & Indexing'
          ]
        }
      ],
      orderBumps: [
        {
          id: 'bump-topical',
          name: 'Add Topical Authority 5-Pack Sprint',
          price_cents: 15000,
          price_display: '+$150',
          description: 'Supercharge your pod with 5 high-converting entity-rich articles ready for publishing.'
        },
        {
          id: 'bump-concierge',
          name: 'Add Priority 24/7 Slack Concierge',
          price_cents: 9000,
          price_display: '+$90/mo',
          description: 'Private agency Slack channel with direct <15 min response time from Senior Ops.'
        }
      ]
    });
  });

  // POST /api/checkout/simulate - Instant Sandbox Purchase & Seamless Portal Login
  fastify.post('/api/checkout/simulate', async (req, reply) => {
    const {
      email,
      name,
      company,
      service_name,
      total_cents,
      billing_cycle = 'monthly',
      items = [],
      ref,
      referral_code
    } = req.body || {};

    if (!email || !email.includes('@')) {
      return reply.status(400).send({ error: 'Valid client email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0];
    const brief = (service_name && service_name.trim()) || 'Dedicated Junior Pod (160h/mo)';
    const amountCents = typeof total_cents === 'number' && total_cents > 0 ? total_cents : 48000;
    const cycle = billing_cycle === 'one_time' ? 'one_time' : 'monthly';

    const db = getDb();

    // Check referral code
    const refCode = (ref || referral_code || '').trim();
    let affiliate = null;
    if (refCode) {
      affiliate = db.prepare("SELECT * FROM affiliates WHERE code = ? COLLATE NOCASE AND status = 'active'").get(refCode);
    }

    // 1. Resolve or provision client user
    let user = db.prepare('SELECT id, email, role, display_name FROM users WHERE email = ?').get(cleanEmail);
    if (!user) {
      const userId = id('usr');
      db.prepare(`
        INSERT INTO users (id, email, role, display_name)
        VALUES (?, ?, 'client', ?)
      `).run(userId, cleanEmail, cleanName);
      user = { id: userId, email: cleanEmail, role: 'client', display_name: cleanName };
    } else if (cleanName && user.display_name !== cleanName) {
      db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(cleanName, user.id);
      user.display_name = cleanName;
    }

    // 2. Generate Order Record
    const orderId = id('ord');
    const mockPaypalOrderId = 'SIM_PP_' + crypto.randomBytes(6).toString('hex').toUpperCase();
    const mockPaypalSubId = cycle === 'monthly' ? 'I-SIM-' + crypto.randomBytes(6).toString('hex').toUpperCase() : null;

    db.prepare(`
      INSERT INTO orders (id, client_id, status, brief, total_cents, paypal_order_id, paypal_subscription_id, billing_cycle, affiliate_id, referral_code)
      VALUES (?, ?, 'paid', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      user.id,
      brief,
      amountCents,
      mockPaypalOrderId,
      mockPaypalSubId,
      cycle,
      affiliate ? affiliate.id : null,
      affiliate ? affiliate.code : (refCode || null)
    );

    // Initial commission for affiliate
    if (affiliate && amountCents > 0) {
      const commRate = affiliate.commission_rate || 0.20;
      const commAmount = Math.round(amountCents * commRate);
      const commId = id('comm');
      db.prepare(`
        INSERT INTO affiliate_commissions (
          id, affiliate_id, order_id, paypal_event_id, gross_amount_cents,
          commission_rate, commission_amount_cents, currency, type, status,
          payout_due_at, notes
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, 'USD', 'initial', 'pending',
          datetime('now', '+7 days'), ?
        )
      `).run(
        commId,
        affiliate.id,
        orderId,
        mockPaypalOrderId,
        amountCents,
        commRate,
        commAmount,
        `Simulated checkout commission (Ref: ${affiliate.code})`
      );
    }

    // 3. Create Order Line Items
    if (Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        const itemId = id('item');
        db.prepare(`
          INSERT INTO order_items (id, order_id, service_name, qty, status, notes)
          VALUES (?, ?, ?, ?, 'queued', ?)
        `).run(itemId, orderId, it.name || it.service_name || brief, it.qty || 1, it.notes || '');
      }
    } else {
      const itemId = id('item');
      db.prepare(`
        INSERT INTO order_items (id, order_id, service_name, qty, status, notes)
        VALUES (?, ?, ?, 1, 'queued', 'Initial line item from simulated checkout')
      `).run(itemId, orderId, brief);
    }

    // 4. Create initial welcome notification message
    const msgId = id('msg');
    const fromMasked = `order-${orderId}-c@${config.smtpDomain}`;
    const toMasked = `order-${orderId}-v@${config.smtpDomain}`;
    const formattedAmount = '$' + (amountCents / 100).toFixed(2);
    const welcomeText =
      `🎉 Welcome to JDP Team! Payment simulation confirmed (${formattedAmount} via PayPal Sandbox).\n\n` +
      `Your dedicated fulfillment pod is now reserved. Next step: Please fill out the Project Intake Brief tab with your target requirements, guidelines, and access so your lead PM can schedule the kickoff sprint.`;

    db.prepare(`
      INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
      VALUES (?, ?, ?, ?, ?, ?, 'client')
    `).run(msgId, orderId, user.id, welcomeText, fromMasked, toMasked);

    // 5. Create user session & set auth cookie for immediate seamless portal access
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, ip, ua)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionToken, user.id, expiresAt, req.ip, req.headers['user-agent'] || '');

    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

    reply.setCookie('jdp_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60
    });

    return reply.send({
      ok: true,
      order_id: orderId,
      redirect_url: `/orders/${orderId}`,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role
      },
      message: 'Simulated payment completed! Redirecting to client portal...'
    });
  });
}
