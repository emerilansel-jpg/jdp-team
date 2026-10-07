// GET  /api/orders           — list orders (scoped by role)
// POST /api/orders           — client creates an order (brief + items)
// PATCH /api/orders          — staff update status/assignment/total
import { json, requireRole, newId } from '../shared/auth-helpers.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await requireRole(env, request, ['client', 'manager', 'crew', 'admin']);
  if (error) return error;

  let rows;
  if (user.role === 'client') {
    rows = await env.DB.prepare(
      `SELECT id, status, brief, total_cents, billing_cycle, created_at, updated_at
         FROM orders WHERE client_id = ? ORDER BY created_at DESC`
    ).bind(user.id).all();
  } else {
    rows = await env.DB.prepare(
      `SELECT o.id, o.status, o.brief, o.total_cents, o.billing_cycle, o.created_at, o.updated_at,
              u.email AS client_email, u.display_name AS client_name
         FROM orders o JOIN users u ON u.id = o.client_id
        ORDER BY o.updated_at DESC LIMIT 200`
    ).all();
  }

  // Attach items per order
  const orders = [];
  for (const o of rows.results || []) {
    const items = await env.DB.prepare(
      `SELECT i.id, i.qty, i.unit_price_cents, i.status, i.due_at, i.assigned_crew_id,
              s.name AS service_name, s.unit
         FROM order_items i JOIN services s ON s.id = i.service_id
        WHERE i.order_id = ?`
    ).bind(o.id).all();
    orders.push({ ...o, items: items.results || [] });
  }
  return json({ orders });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { user, error } = await requireRole(env, request, ['client']);
  if (error) return error;

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const brief = (body.brief || '').trim().slice(0, 4000);
  const items = Array.isArray(body.items) ? body.items : [];
  if (!brief) return json({ error: 'Brief is required' }, 400);
  if (!items.length) return json({ error: 'At least one service item required' }, 400);

  // Validate services & compute total server-side (never trust client totals)
  let total = 0;
  const validated = [];
  for (const it of items.slice(0, 20)) {
    const svc = await env.DB.prepare(
      `SELECT id, price_cents FROM services WHERE id = ? AND active = 1`
    ).bind(it.service_id).first();
    if (!svc) return json({ error: `Unknown service: ${it.service_id}` }, 400);
    const qty = Math.max(0.5, Math.min(1000, Number(it.qty) || 1));
    total += Math.round(svc.price_cents * qty);
    validated.push({ service_id: svc.id, qty, unit_price_cents: svc.price_cents });
  }

  const orderId = newId('ord');
  const hasMonthly = validated.some(v => v.service_id.includes('pod'));
  await env.DB.prepare(
    `INSERT INTO orders (id, client_id, brief, total_cents, billing_cycle) VALUES (?, ?, ?, ?, ?)`
  ).bind(orderId, user.id, brief, total, hasMonthly ? 'monthly' : 'one_time').run();

  for (const v of validated) {
    await env.DB.prepare(
      `INSERT INTO order_items (id, order_id, service_id, qty, unit_price_cents) VALUES (?, ?, ?, ?, ?)`
    ).bind(newId('itm'), orderId, v.service_id, v.qty, v.unit_price_cents).run();
  }
  return json({ ok: true, order_id: orderId, total_cents: total }, 201);
}

export async function onRequestPatch(context) {
  const { request, env } = context;
  const { user, error } = await requireRole(env, request, ['manager', 'admin']);
  if (error) return error;

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const { order_id, status, manager_id, item_id, assign_crew_id, item_status } = body;
  if (!order_id) return json({ error: 'order_id required' }, 400);

  const VALID_STATUS = ['new','scoping','quoted','in_progress','review','delivered','completed','cancelled'];
  const VALID_ITEM_STATUS = ['queued','assigned','working','review','done'];

  if (status && VALID_STATUS.includes(status)) {
    await env.DB.prepare(
      `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(status, order_id).run();
  }
  if (manager_id !== undefined) {
    await env.DB.prepare(
      `UPDATE orders SET manager_id = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(manager_id || null, order_id).run();
  }
  if (item_id) {
    if (assign_crew_id !== undefined) {
      const st = item_status && VALID_ITEM_STATUS.includes(item_status) ? item_status : 'assigned';
      await env.DB.prepare(
        `UPDATE order_items SET assigned_crew_id = ?, status = ? WHERE id = ? AND order_id = ?`
      ).bind(assign_crew_id || null, st, item_id, order_id).run();
    } else if (item_status && VALID_ITEM_STATUS.includes(item_status)) {
      const doneAt = item_status === 'done' ? `, done_at = datetime('now')` : '';
      await env.DB.prepare(
        `UPDATE order_items SET status = ?${doneAt} WHERE id = ? AND order_id = ?`
      ).bind(item_status, item_id, order_id).run();
    }
  }
  return json({ ok: true });
}
