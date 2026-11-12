import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDb, id } from '../db.js';
import { sendMagicLinkEmail } from '../services/email.js';
import { config } from '../config.js';

export async function authRoutes(fastify, options) {
  // 1. Request Magic Link (Clients)
  fastify.post('/api/auth/magic-link', async (req, reply) => {
    const { email, nextUrl } = req.body || {};
    if (!email || !email.includes('@')) {
      return reply.status(400).send({ error: 'Valid email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();

    // Check or auto-provision client user
    let user = db.prepare('SELECT id, email, role, display_name FROM users WHERE email = ?').get(cleanEmail);
    if (!user) {
      const userId = id('usr');
      const defaultName = cleanEmail.split('@')[0];
      db.prepare(`
        INSERT INTO users (id, email, role, display_name)
        VALUES (?, ?, 'client', ?)
      `).run(userId, cleanEmail, defaultName);
      user = { id: userId, email: cleanEmail, role: 'client', display_name: defaultName };
    }

    // Generate token valid for 24 hours
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO magic_links (token, user_id, email, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(token, user.id, cleanEmail, expiresAt);

    await sendMagicLinkEmail({
      email: cleanEmail,
      token,
      nextUrl
    });

    const isDev = config.env !== 'production';
    return reply.send({
      ok: true,
      message: 'Magic login link sent to your email inbox.',
      devToken: isDev ? token : undefined,
      verifyUrl: isDev ? `${config.appUrl}/auth/verify?token=${token}` : undefined
    });
  });

  // 2. Verify Magic Link Token (GET /auth/verify)
  fastify.get('/auth/verify', async (req, reply) => {
    const { token, next } = req.query || {};
    if (!token) {
      return reply.redirect('/login?error=missing_token');
    }

    const db = getDb();
    const link = db.prepare(`
      SELECT m.*, u.id as user_id, u.email as user_email, u.role as user_role, u.display_name
      FROM magic_links m
      JOIN users u ON m.user_id = u.id
      WHERE m.token = ? AND datetime(m.expires_at) > datetime('now') AND m.used_at IS NULL
    `).get(token);

    if (!link) {
      return reply.redirect('/login?error=invalid_or_expired_token');
    }

    // Mark as used
    db.prepare("UPDATE magic_links SET used_at = datetime('now') WHERE token = ?").run(token);

    // Create session (30 days)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, ip, ua)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionToken, link.user_id, expiresAt, req.ip, req.headers['user-agent'] || '');

    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(link.user_id);

    reply.setCookie('jdp_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60
    });

    const targetUrl = next && next.startsWith('/') ? next : '/';
    return reply.redirect(targetUrl);
  });

  // 3. Password Login (Staff: Manager / Crew / Admin)
  fastify.post('/api/auth/login', async (req, reply) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password required' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email.trim().toLowerCase());
    if (!user || !user.password_hash) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, ip, ua)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionToken, user.id, expiresAt, req.ip, req.headers['user-agent'] || '');

    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

    reply.setCookie('jdp_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60
    });

    return reply.send({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        display_name: user.display_name
      }
    });
  });

  // 4. Current user info
  fastify.get('/api/auth/me', async (req, reply) => {
    if (!req.user) {
      return reply.status(401).send({ error: 'Not authenticated' });
    }
    return reply.send(req.user);
  });

  // 5. Logout
  fastify.post('/api/auth/logout', async (req, reply) => {
    const token = req.cookies?.jdp_session;
    if (token) {
      const db = getDb();
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    reply.clearCookie('jdp_session', { path: '/' });
    return reply.send({ ok: true });
  });
}
