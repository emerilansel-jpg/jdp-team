import { getDb, id } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

function maskEmail(email) {
  if (!email || !email.includes('@')) return 'Client';
  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  const maskedName = name[0] + '*'.repeat(Math.min(name.length - 2, 5)) + name[name.length - 1];
  return `${maskedName}@${domain}`;
}

export async function affiliateRoutes(fastify, options) {
  // 1. POST /api/affiliates/join - Public Affiliate Onboarding
  fastify.post('/api/affiliates/join', async (req, reply) => {
    const {
      name,
      email,
      paypal_email,
      code
    } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return reply.status(400).send({ error: 'Full name is required (minimum 2 characters)' });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return reply.status(400).send({ error: 'Valid notification email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPaypalEmail = paypal_email && typeof paypal_email === 'string' && paypal_email.includes('@')
      ? paypal_email.trim().toLowerCase()
      : cleanEmail;

    if (!code || typeof code !== 'string') {
      return reply.status(400).send({ error: 'Desired referral code is required' });
    }

    const cleanCode = code.trim().toLowerCase();
    if (!/^[a-z0-9_-]{2,30}$/.test(cleanCode)) {
      return reply.status(400).send({
        error: 'Referral code must be 2-30 characters long and contain only letters, numbers, hyphens, and underscores'
      });
    }

    const db = getDb();

    // Check case-insensitive uniqueness
    const existing = db.prepare('SELECT id FROM affiliates WHERE code = ? COLLATE NOCASE').get(cleanCode);
    if (existing) {
      return reply.status(400).send({ error: 'Referral code is already taken. Please choose another code.' });
    }

    const affId = id('aff');
    db.prepare(`
      INSERT INTO affiliates (id, code, name, email, paypal_email, commission_rate, status)
      VALUES (?, ?, ?, ?, ?, 0.20, 'active')
    `).run(affId, cleanCode, name.trim(), cleanEmail, cleanPaypalEmail);

    return reply.status(201).send({
      ok: true,
      affiliate: {
        id: affId,
        code: cleanCode,
        name: name.trim(),
        email: cleanEmail,
        paypal_email: cleanPaypalEmail,
        commission_rate: 0.20,
        status: 'active',
        dashboard_url: `/affiliate.html?code=${cleanCode}`,
        links: {
          bfcm: `https://jdp.team/bfcm?ref=${cleanCode}`,
          home: `https://jdp.team/?ref=${cleanCode}`
        }
      }
    });
  });

  // 2. GET /api/affiliates/:code - Partner Dashboard Profile, Metrics & Ledger
  fastify.get('/api/affiliates/:code', async (req, reply) => {
    const rawCode = (req.params.code || '').trim();
    if (!rawCode) {
      return reply.status(400).send({ error: 'Affiliate code parameter is required' });
    }

    const db = getDb();
    const aff = db.prepare('SELECT * FROM affiliates WHERE code = ? COLLATE NOCASE').get(rawCode);
    if (!aff) {
      return reply.status(404).send({ error: 'Affiliate not found' });
    }

    // Total referred orders count
    const totalOrdersRow = db.prepare('SELECT COUNT(*) as count FROM orders WHERE affiliate_id = ?').get(aff.id);
    const totalReferredOrders = totalOrdersRow ? totalOrdersRow.count : 0;

    // Active subscriptions count
    const activeSubsRow = db.prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE affiliate_id = ?
        AND billing_cycle = 'monthly'
        AND status IN ('paid', 'intake_submitted', 'in_progress', 'approval_progress')
    `).get(aff.id);
    const activeSubscriptions = activeSubsRow ? activeSubsRow.count : 0;

    // Financial summaries
    const grossRow = db.prepare(`
      SELECT COALESCE(SUM(gross_amount_cents), 0) as total
      FROM affiliate_commissions
      WHERE affiliate_id = ? AND status != 'voided'
    `).get(aff.id);

    const pendingRow = db.prepare(`
      SELECT COALESCE(SUM(commission_amount_cents), 0) as total
      FROM affiliate_commissions
      WHERE affiliate_id = ? AND status = 'pending'
    `).get(aff.id);

    const approvedRow = db.prepare(`
      SELECT COALESCE(SUM(commission_amount_cents), 0) as total
      FROM affiliate_commissions
      WHERE affiliate_id = ? AND status = 'approved'
    `).get(aff.id);

    const paidRow = db.prepare(`
      SELECT COALESCE(SUM(commission_amount_cents), 0) as total
      FROM affiliate_commissions
      WHERE affiliate_id = ? AND status = 'paid'
    `).get(aff.id);

    // Commission ledger with client masking
    const commRows = db.prepare(`
      SELECT c.*, o.brief as order_brief, o.billing_cycle, u.email as client_email, u.display_name as client_name
      FROM affiliate_commissions c
      JOIN orders o ON c.order_id = o.id
      LEFT JOIN users u ON o.client_id = u.id
      WHERE c.affiliate_id = ?
      ORDER BY c.created_at DESC
    `).all(aff.id);

    const nowIso = new Date().toISOString();
    const ledger = commRows.map(row => {
      // Determine if H+7 payout is currently eligible
      const isEligibleForPayout = row.payout_due_at <= nowIso;
      return {
        id: row.id,
        order_id: row.order_id,
        service: row.order_brief || 'Fulfillment Package',
        type: row.type, // 'initial' or 'renewal'
        client_masked: maskEmail(row.client_email),
        gross_amount: (row.gross_amount_cents / 100).toFixed(2),
        commission_rate: row.commission_rate,
        commission_amount: (row.commission_amount_cents / 100).toFixed(2),
        currency: row.currency || 'USD',
        status: row.status,
        is_payout_eligible: isEligibleForPayout,
        payout_due_at: row.payout_due_at,
        paid_at: row.paid_at,
        notes: row.notes,
        created_at: row.created_at
      };
    });

    return reply.send({
      ok: true,
      affiliate: {
        id: aff.id,
        code: aff.code,
        name: aff.name,
        email: aff.email,
        paypal_email: aff.paypal_email,
        commission_rate: aff.commission_rate,
        status: aff.status,
        created_at: aff.created_at,
        links: {
          bfcm: `https://jdp.team/bfcm?ref=${aff.code}`,
          home: `https://jdp.team/?ref=${aff.code}`
        }
      },
      metrics: {
        total_referred_orders: totalReferredOrders,
        active_subscriptions: activeSubscriptions,
        gross_volume_usd: (grossRow.total / 100).toFixed(2),
        pending_commissions_usd: (pendingRow.total / 100).toFixed(2),
        approved_commissions_usd: (approvedRow.total / 100).toFixed(2),
        total_unpaid_usd: ((pendingRow.total + approvedRow.total) / 100).toFixed(2),
        total_paid_usd: (paidRow.total / 100).toFixed(2)
      },
      commissions: ledger
    });
  });

  // 3. GET /api/admin/affiliates - Staff & Admin Affiliate Management Overview
  fastify.get('/api/admin/affiliates', { preHandler: requireRole('admin', 'manager') }, async (req, reply) => {
    const db = getDb();

    const affiliates = db.prepare(`
      SELECT a.*,
        (SELECT COUNT(*) FROM orders o WHERE o.affiliate_id = a.id) as referred_orders_count,
        (SELECT COALESCE(SUM(c.gross_amount_cents), 0) FROM affiliate_commissions c WHERE c.affiliate_id = a.id AND c.status != 'voided') as total_gross_cents,
        (SELECT COALESCE(SUM(c.commission_amount_cents), 0) FROM affiliate_commissions c WHERE c.affiliate_id = a.id AND c.status IN ('pending', 'approved')) as unpaid_commissions_cents,
        (SELECT COALESCE(SUM(c.commission_amount_cents), 0) FROM affiliate_commissions c WHERE c.affiliate_id = a.id AND c.status = 'paid') as paid_commissions_cents
      FROM affiliates a
      ORDER BY a.created_at DESC
    `).all();

    const unpaidLedger = db.prepare(`
      SELECT c.*, a.code as affiliate_code, a.name as affiliate_name, a.paypal_email as affiliate_paypal,
             o.brief as order_brief, u.email as client_email
      FROM affiliate_commissions c
      JOIN affiliates a ON c.affiliate_id = a.id
      JOIN orders o ON c.order_id = o.id
      LEFT JOIN users u ON o.client_id = u.id
      WHERE c.status IN ('pending', 'approved')
      ORDER BY c.payout_due_at ASC
    `).all();

    return reply.send({
      ok: true,
      affiliates: affiliates.map(a => ({
        id: a.id,
        code: a.code,
        name: a.name,
        email: a.email,
        paypal_email: a.paypal_email,
        commission_rate: a.commission_rate,
        status: a.status,
        referred_orders_count: a.referred_orders_count,
        total_gross_usd: (a.total_gross_cents / 100).toFixed(2),
        unpaid_commissions_usd: (a.unpaid_commissions_cents / 100).toFixed(2),
        paid_commissions_usd: (a.paid_commissions_cents / 100).toFixed(2),
        created_at: a.created_at
      })),
      unpaid_commissions: unpaidLedger.map(c => ({
        id: c.id,
        affiliate_id: c.affiliate_id,
        affiliate_code: c.affiliate_code,
        affiliate_name: c.affiliate_name,
        affiliate_paypal: c.affiliate_paypal,
        order_id: c.order_id,
        service: c.order_brief,
        client_email: c.client_email,
        type: c.type,
        gross_amount_usd: (c.gross_amount_cents / 100).toFixed(2),
        commission_amount_usd: (c.commission_amount_cents / 100).toFixed(2),
        status: c.status,
        payout_due_at: c.payout_due_at,
        created_at: c.created_at
      }))
    });
  });

  // 4. POST /api/admin/commissions/:id/pay - Mark commission as paid
  fastify.post('/api/admin/commissions/:id/pay', { preHandler: requireRole('admin', 'manager') }, async (req, reply) => {
    const commId = req.params.id;
    const db = getDb();

    const comm = db.prepare('SELECT * FROM affiliate_commissions WHERE id = ?').get(commId);
    if (!comm) {
      return reply.status(404).send({ error: 'Commission record not found' });
    }

    db.prepare(`
      UPDATE affiliate_commissions
      SET status = 'paid', paid_at = datetime('now')
      WHERE id = ?
    `).run(commId);

    const updated = db.prepare('SELECT * FROM affiliate_commissions WHERE id = ?').get(commId);

    return reply.send({
      ok: true,
      commission_id: commId,
      status: updated.status,
      paid_at: updated.paid_at
    });
  });
}
