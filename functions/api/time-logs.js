// GET  /api/time-logs?order_id=...  — crew: own logs; manager/admin: all
// POST /api/time-logs               — crew logs minutes against an order item
import { json, requireRole, newId } from '../shared/auth-helpers.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await requireRole(env, request, ['crew', 'manager', 'admin']);
  if (error) return error;

  const orderId = new URL(request.url).searchParams.get('order_id');
  let rows;
  if (user.role === 'crew') {
    rows = await env.DB.prepare(
      `SELECT t.id, t.minutes, t.note, t.logged_at, t.item_id
         FROM time_logs t
        WHERE t.crew_id = ? ${orderId ? 'AND t.item_id IN (SELECT id FROM order_items WHERE order_id = ?)' : ''}
        ORDER BY t.logged_at DESC LIMIT 100`
    ).bind(...(orderId ? [user.id, orderId] : [user.id])).all();
  } else {
    rows = await env.DB.prepare(
      `SELECT t.id, t.minutes, t.note, t.logged_at, t.item_id, u.display_name AS crew_name
         FROM time_logs t JOIN users u ON u.id = t.crew_id
        ${orderId ? 'WHERE t.item_id IN (SELECT id FROM order_items WHERE order_id = ?)' : ''}
        ORDER BY t.logged_at DESC LIMIT 200`
    ).bind(...(orderId ? [orderId] : [])).all();
  }
  return json({ time_logs: rows.results || [] });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { user, error } = await requireRole(env, request, ['crew']);
  if (error) return error;

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const minutes = Math.max(1, Math.min(24 * 60, Math.round(Number(body.minutes) || 0)));
  const note = (body.note || '').trim().slice(0, 500);
  const itemId = body.item_id;
  if (!itemId || !minutes) return json({ error: 'item_id and minutes required' }, 400);

  // Crew can only log against items assigned to them
  const item = await env.DB.prepare(
    `SELECT id FROM order_items WHERE id = ? AND assigned_crew_id = ?`
  ).bind(itemId, user.id).first();
  if (!item) return json({ error: 'Item not assigned to you' }, 403);

  const id = newId('tlog');
  await env.DB.prepare(
    `INSERT INTO time_logs (id, crew_id, item_id, minutes, note) VALUES (?, ?, ?, ?, ?)`
  ).bind(id, user.id, itemId, minutes, note).run();
  return json({ ok: true, id }, 201);
}
