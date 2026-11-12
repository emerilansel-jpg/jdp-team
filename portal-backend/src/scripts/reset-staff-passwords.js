import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';

const newPassword = process.env.NEW_PASSWORD || 'jdp123';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(newPassword, salt);

const db = getDb();
const staffEmails = ['admin@jdp.team', 'manager@jdp.team', 'specialist@jdp.team'];

console.log(`Setting password to '${newPassword}' for staff accounts...`);

for (const email of staffEmails) {
  const user = db.prepare('SELECT id, role, display_name FROM users WHERE email = ? COLLATE NOCASE').get(email);
  if (user) {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
    console.log(`Updated ${user.role} (${email}) -> password set`);
  } else {
    console.log(`User not found: ${email}`);
  }
}

// Also update any user with role admin/manager/crew whose password_hash is not null
const allStaff = db.prepare("SELECT id, email, role FROM users WHERE role IN ('admin', 'manager', 'crew')").all();
for (const s of allStaff) {
  if (!staffEmails.includes(s.email.toLowerCase())) {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, s.id);
    console.log(`Also updated staff ${s.email} (${s.role})`);
  }
}

console.log('Password reset complete.');
