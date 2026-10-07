// Shared auth helpers for JDP.team dashboards (Cloudflare Pages Functions)
// Password hashing via Web Crypto PBKDF2; sessions are opaque tokens in D1.

const encoder = new TextEncoder();

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

export function newId(prefix) {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const b36 = Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('');
  return `${prefix}_${b36}`.slice(0, prefix.length + 1 + 24);
}

export function newToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// --- PBKDF2 password hashing ---
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' }, key, 256
  );
  const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  return `pbkdf2$100000$${toB64(salt)}$${toB64(bits)}`;
}

export async function verifyPassword(password, stored) {
  try {
    const [scheme, iterStr, saltB64, hashB64] = stored.split('$');
    if (scheme !== 'pbkdf2') return false;
    const iterations = parseInt(iterStr, 10);
    const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const salt = fromB64(saltB64);
    const expected = fromB64(hashB64);
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256
    ));
    if (bits.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ expected[i];
    return diff === 0;
  } catch {
    return false;
  }
}

// --- Sessions ---
export const SESSION_COOKIE = 'jdp_session';
const SESSION_TTL_HOURS = 24 * 14; // 14 days

export async function createSession(env, userId, request) {
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600_000).toISOString();
  await env.DB.prepare(
    `INSERT INTO sessions (token, user_id, expires_at, ip, ua) VALUES (?, ?, ?, ?, ?)`
  ).bind(
    token, userId, expires,
    request.headers.get('cf-connecting-ip') || '',
    (request.headers.get('user-agent') || '').slice(0, 250)
  ).run();
  return { token, expires };
}

export function sessionCookie(token, expires) {
  const maxAge = Math.floor((new Date(expires).getTime() - Date.now()) / 1000);
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readSessionToken(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

export async function getSessionUser(env, request) {
  const token = readSessionToken(request);
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.role, u.display_name, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > datetime('now')`
  ).bind(token).first();
  return row || null;
}

export async function destroySession(env, request) {
  const token = readSessionToken(request);
  if (token) {
    await env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run();
  }
}

// Role guard helper — returns { user } or a Response (401/403)
export async function requireRole(env, request, roles) {
  const user = await getSessionUser(env, request);
  if (!user) return { error: json({ error: 'Not authenticated' }, 401) };
  if (roles && !roles.includes(user.role)) return { error: json({ error: 'Forbidden' }, 403) };
  return { user };
}
