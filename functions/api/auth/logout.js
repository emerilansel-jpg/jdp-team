// POST /api/auth/logout — destroy session, clear cookie
import { json, destroySession, clearSessionCookie } from '../../shared/auth-helpers.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  await destroySession(env, request);
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
}
