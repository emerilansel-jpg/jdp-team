import { getDb } from '../db.js';

export function authenticate(req, reply, done) {
  const token = req.cookies?.jdp_session;
  if (!token) {
    req.user = null;
    return done();
  }

  const db = getDb();
  const session = db.prepare(`
    SELECT s.token, s.expires_at, u.id, u.email, u.role, u.display_name
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
  `).get(token);

  if (!session) {
    // Clear invalid/expired cookie
    reply.clearCookie('jdp_session', { path: '/' });
    req.user = null;
    return done();
  }

  req.user = {
    id: session.id,
    email: session.email,
    role: session.role,
    display_name: session.display_name
  };

  done();
}

export function requireAuth(req, reply, done) {
  if (!req.user) {
    return reply.status(401).send({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
  }
  done();
}

export function requireRole(...roles) {
  return (req, reply, done) => {
    if (!req.user) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
    }
    if (!roles.includes(req.user.role)) {
      return reply.status(403).send({ error: 'Forbidden', code: 'ROLE_FORBIDDEN' });
    }
    done();
  };
}
