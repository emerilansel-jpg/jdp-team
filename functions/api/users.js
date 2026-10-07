// GET  /api/users          — admin: list all users
// POST /api/users          — admin: create staff user (manager/crew) with temp password
import { json, requireRole, newId, hashPassword } from '../shared/auth-helpers.js';

export async function onRequestGet(context) {
  const { error } = await requireRole(context.env, context.request, ['admin']);
  if (error) return error;
  const rows = await context.env.DB.prepare(
    `SELECT id, email, role, display_name, created_at, last_login_at
       FROM users ORDER BY created_at DESC LIMIT 500`
  ).all();
  return json({ users: rows.results || [] });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { error } = await requireRole(env, request, ['admin']);
  if (error) return error;

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const email = (body.email || '').trim().toLowerCase();
  const role = body.role;
  const password = body.password || '';
  const name = (body.display_name || '').trim().slice(0, 120);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Valid email required' }, 400);
  if (!['manager', 'crew', 'admin'].includes(role)) return json({ error: 'Role must be manager, crew, or admin' }, 400);
  if (password.length < 10) return json({ error: 'Password must be at least 10 characters' }, 400);

  const existing = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
  if (existing) return json({ error: 'Email already registered' }, 409);

  const id = newId('usr');
  const hash = await hashPassword(password);
  await env.DB.prepare(
    `INSERT INTO users (id, email, role, display_name, password_hash) VALUES (?, ?, ?, ?, ?)`
  ).bind(id, email, role, name || email.split('@')[0], hash).run();
  return json({ ok: true, id }, 201);
}
