import bcrypt from 'bcryptjs';
import { getDb, id } from '../db.js';
import { config } from '../config.js';

console.log('--- Seeding Demo Data for JDP Team Portal ---');

const db = getDb();

function seedStaff(email, role, name, password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  let user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) {
    const userId = id('usr');
    db.prepare(`
      INSERT INTO users (id, email, role, display_name, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, email, role, name, hash);
    console.log(`Created ${role}: ${email} (Password: ${password})`);
    return userId;
  } else {
    db.prepare(`
      UPDATE users SET password_hash = ?, role = ?, display_name = ? WHERE id = ?
    `).run(hash, role, name, user.id);
    console.log(`Updated ${role}: ${email} (Password: ${password})`);
    return user.id;
  }
}

const adminId = seedStaff(config.admin.email, 'admin', 'JDP Admin', config.admin.password || 'jdp123');
const managerId = seedStaff('manager@jdp.team', 'manager', 'Alex Rivera (PM)', 'jdp123');
const crewId = seedStaff('specialist@jdp.team', 'crew', 'David Chen (SEO Specialist)', 'jdp123');

// Demo Client
let client = db.prepare('SELECT id FROM users WHERE email = ?').get('client@growthagency.com');
let clientId = client ? client.id : null;
if (!client) {
  clientId = id('usr');
  db.prepare(`
    INSERT INTO users (id, email, role, display_name)
    VALUES (?, ?, 'client', 'Sarah Jenkins (Growth Agency)')
  `).run(clientId, 'client@growthagency.com');
  console.log(`Created demo client: client@growthagency.com`);
}

// Demo Order 1: In Progress
const order1Id = 'ord_demo_seo_001';
const existing1 = db.prepare('SELECT id FROM orders WHERE id = ?').get(order1Id);
if (!existing1) {
  const intakePayload = JSON.stringify({
    target_urls: 'https://growthagency.com, https://competitor.com',
    keywords: 'b2b appointment setting, cold email infrastructure',
    drive_links: 'https://drive.google.com/drive/folders/demo-assets',
    access_notes: 'WordPress author role granted to specialist@jdp.team',
    extra_details: 'Need 4 deep-dive articles with technical diagrams.'
  });

  db.prepare(`
    INSERT INTO orders (id, client_id, manager_id, status, brief, intake_data, total_cents, billing_cycle)
    VALUES (?, ?, ?, 'in_progress', 'SEO Authority & Backlink Fulfillment Pod', ?, 50000, 'monthly')
  `).run(order1Id, clientId, managerId, intakePayload);

  // Line item
  db.prepare(`
    INSERT INTO order_items (id, order_id, service_name, qty, assigned_crew_id, status, notes)
    VALUES (?, ?, 'Monthly Senior Specialist Pod (40 hrs)', 1, ?, 'working', 'Keyword clustering complete.')
  `).run(id('item'), order1Id, crewId);

  // Messages
  db.prepare(`
    INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
    VALUES (?, ?, ?, 'Welcome to JDP Team! We have commenced work on your backlink strategy.', ?, ?, 'client')
  `).run(id('msg'), order1Id, managerId, `order-${order1Id}-c@${config.smtpDomain}`, `order-${order1Id}-v@${config.smtpDomain}`);

  console.log(`Created sample Order: ${order1Id}`);
}

console.log('Seeding completed successfully!');
