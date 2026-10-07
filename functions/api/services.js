// GET  /api/services — active storefront catalog (all roles)
// PATCH /api/services — admin: toggle active / adjust price
import { json, requireRole } from '../shared/auth-helpers.js';

export async function onRequestGet(context) {
  const { error } = await requireRole(context.env, context.request, ['client', 'manager', 'crew', 'admin']);
  if (error) return error;
  const rows = await context.env.DB.prepare(
    `SELECT id, slug, name, category, unit, price_cents, monthly, active, sort_order
       FROM services ORDER BY sort_order`
  ).all();
  return json({ services: rows.results || [] });
}

export async function onRequestPatch(context) {
  const { request, env } = context;
  const { error } = await requireRole(env, request, ['admin']);
  if (error) return error;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const { id, active, price_cents } = body;
  if (!id) return json({ error: 'id required' }, 400);
  if (active !== undefined) {
    await env.DB.prepare(`UPDATE services SET active = ? WHERE id = ?`).bind(active ? 1 : 0, id).run();
  }
  if (price_cents !== undefined) {
    await env.DB.prepare(`UPDATE services SET price_cents = ? WHERE id = ?`).bind(Math.max(0, Math.round(price_cents)), id).run();
  }
  return json({ ok: true });
}
