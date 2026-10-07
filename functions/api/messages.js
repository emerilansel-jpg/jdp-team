// GET  /api/messages?order_id=...  — list messages for an order
// POST /api/messages               — post a message to an order
import { json, requireRole, newId } from '../shared/auth-helpers.js';

async function canAccessOrder(env, user, orderId) {
  if (user.role === 'manager' || user.role === 'admin') return true;
  if (user.role === 'client') {
    const own = await env.DB.prepare(
      `SELECT id FROM orders WHERE id = ? AND client_id = ?`
    ).bind(orderId, user.id).first();
    return !!own;
  }
  if (user.role === 'crew') {
    const assigned = await env.DB.prepare(
      `SELECT id FROM order_items WHERE order_id = ? AND assigned_crew_id = ? LIMIT 1`
    ).bind(orderId, user.id).first();
    return !!assigned;
  }
  return false;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await requireRole(env, request, ['client', 'manager', 'crew', 'admin']);
  if (error) return error;

  const orderId = new URL(request.url).searchParams.get('order_id');
  if (!orderId) return json({ error: 'order_id required' }, 400);
  if (!(await canAccessOrder(env, user, orderId))) return json({ error: 'Forbidden' }, 403);

  // Clients never see internal notes
  const kindFilter = user.role === 'client' ? `AND m.kind = 'client'` : '';
  const rows = await env.DB.prepare(
    `SELECT m.id, m.body, m.kind, m.created_at, u.display_name, u.role
       FROM messages m JOIN users u ON u.id = m.author_id
      WHERE m.order_id = ? ${kindFilter}
      ORDER BY m.created_at ASC LIMIT 200`
  ).bind(orderId).all();
  return json({ messages: rows.results || [] });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { user, error } = await requireRole(env, request, ['client', 'manager', 'crew', 'admin']);
  if (error) return error;

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const orderId = body.order_id;
  const text = (body.body || '').trim().slice(0, 4000);
  if (!orderId || !text) return json({ error: 'order_id and body required' }, 400);
  if (!(await canAccessOrder(env, user, orderId))) return json({ error: 'Forbidden' }, 403);

  // Clients can only post client-visible messages; staff choose kind
  let kind = 'client';
  if (user.role !== 'client' && body.kind === 'internal') kind = 'internal';

  const id = newId('msg');
  await env.DB.prepare(
    `INSERT INTO messages (id, order_id, author_id, body, kind) VALUES (?, ?, ?, ?, ?)`
  ).bind(id, orderId, user.id, text, kind).run();
  return json({ ok: true, id }, 201);
}
