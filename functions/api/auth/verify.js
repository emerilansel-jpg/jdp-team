// GET /api/auth/verify?token=...
// Redeems a magic link, creates a session, redirects to the client dashboard.
import { createSession, sessionCookie } from '../../shared/auth-helpers.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';

  const fail = (msg) => Response.redirect(`${url.origin}/dashboard/login.html?error=${encodeURIComponent(msg)}`, 302);
  if (!token) return fail('Missing token');

  const row = await env.DB.prepare(
    `SELECT token, user_id, expires_at, used_at FROM magic_links WHERE token = ?`
  ).bind(token).first();

  if (!row) return fail('Invalid link');
  if (row.used_at) return fail('This link was already used');
  if (row.expires_at < new Date().toISOString()) return fail('This link has expired');

  // Mark used
  await env.DB.prepare(`UPDATE magic_links SET used_at = datetime('now') WHERE token = ?`).bind(token).run();
  // Track login
  await env.DB.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).bind(row.user_id).run();

  const { token: sessionToken, expires } = await createSession(env, row.user_id, request);

  return new Response(null, {
    status: 302,
    headers: {
      location: '/dashboard/client.html',
      'set-cookie': sessionCookie(sessionToken, expires),
    },
  });
}
