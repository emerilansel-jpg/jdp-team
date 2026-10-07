// POST /api/auth/login  { email, password }
// Password login for staff roles: manager, crew, admin.
import { json, verifyPassword, createSession, sessionCookie } from '../../shared/auth-helpers.js';

const ROLE_HOME = {
  manager: '/dashboard/manager.html',
  crew: '/dashboard/crew.html',
  admin: '/dashboard/admin.html',
};

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  if (!email || !password) return json({ error: 'Email and password required' }, 400);

  const user = await env.DB.prepare(
    `SELECT id, email, role, password_hash FROM users WHERE email = ?`
  ).bind(email).first();

  // Uniform failure to avoid user enumeration
  if (!user || !user.password_hash || user.role === 'client') {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return json({ error: 'Invalid credentials' }, 401);

  await env.DB.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).bind(user.id).run();
  const { token, expires } = await createSession(env, user.id, request);

  return json({ ok: true, role: user.role, redirect: ROLE_HOME[user.role] || '/dashboard/' }, 200, {
    'set-cookie': sessionCookie(token, expires),
  });
}
