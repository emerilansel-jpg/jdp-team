// POST /api/auth/magic-link  { email }
// Creates (or finds) a client user and issues a one-time magic link.
// NOTE: email delivery is not wired yet — in dev we return the link so the
// flow can be tested end-to-end; swap to an email provider before real launch.
import { json, newId, newToken } from '../../shared/auth-helpers.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Valid email required' }, 400);
  }

  // Find or create client user
  let user = await env.DB.prepare(`SELECT id, role FROM users WHERE email = ?`).bind(email).first();
  if (user && user.role !== 'client') {
    // Staff emails use password login instead
    return json({ error: 'This email is registered for staff login. Please sign in with your password.' }, 409);
  }
  if (!user) {
    const id = newId('usr');
    await env.DB.prepare(
      `INSERT INTO users (id, email, role, display_name) VALUES (?, ?, 'client', ?)`
    ).bind(id, email, email.split('@')[0]).run();
    user = { id, role: 'client' };
  }

  const token = newToken();
  const expires = new Date(Date.now() + 15 * 60_000).toISOString(); // 15 min
  await env.DB.prepare(
    `INSERT INTO magic_links (token, user_id, email, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(token, user.id, email, expires).run();

  const url = new URL(request.url);
  const link = `${url.origin}/api/auth/verify?token=${token}`;

  // TODO: send via email provider. For now return link (dev convenience).
  return json({ ok: true, message: 'Magic link sent. Check your email.', dev_link: link });
}
