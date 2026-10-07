// GET /api/auth/me — current session user (used by dashboards on load)
import { json, getSessionUser } from '../../shared/auth-helpers.js';

export async function onRequestGet(context) {
  const user = await getSessionUser(context.env, context.request);
  if (!user) return json({ error: 'Not authenticated' }, 401);
  return json({
    id: user.id,
    email: user.email,
    role: user.role,
    display_name: user.display_name,
  });
}
