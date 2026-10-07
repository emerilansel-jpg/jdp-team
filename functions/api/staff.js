// GET /api/staff — directory of managers & crew (for assignment dropdowns)
import { json, requireRole } from '../shared/auth-helpers.js';

export async function onRequestGet(context) {
  const { error } = await requireRole(context.env, context.request, ['manager', 'admin']);
  if (error) return error;

  const rows = await context.env.DB.prepare(
    `SELECT id, display_name, email, role FROM users
      WHERE role IN ('manager','crew') ORDER BY role, display_name`
  ).all();
  return json({ staff: rows.results || [] });
}
