import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { config } from './config.js';

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const dbDir = path.dirname(config.dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new Database(config.dbPath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  initSchema(dbInstance);
  seedInitialData(dbInstance);

  return dbInstance;
}

function initSchema(db) {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      role          TEXT NOT NULL CHECK (role IN ('client', 'manager', 'crew', 'admin')),
      display_name  TEXT,
      password_hash TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- Magic Links for passwordless client auth
    CREATE TABLE IF NOT EXISTS magic_links (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      email      TEXT NOT NULL COLLATE NOCASE,
      expires_at TEXT NOT NULL,
      used_at    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);
    CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON magic_links(expires_at);

    -- User Sessions
    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      ip         TEXT,
      ua         TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

    -- Affiliates
    CREATE TABLE IF NOT EXISTS affiliates (
      id              TEXT PRIMARY KEY,
      code            TEXT UNIQUE NOT NULL COLLATE NOCASE,
      name            TEXT NOT NULL,
      email           TEXT NOT NULL,
      paypal_email    TEXT,
      commission_rate REAL NOT NULL DEFAULT 0.20,
      status          TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'paused', 'inactive')),
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
    CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id                     TEXT PRIMARY KEY,
      client_id              TEXT NOT NULL REFERENCES users(id),
      manager_id             TEXT REFERENCES users(id),
      affiliate_id           TEXT REFERENCES affiliates(id),
      referral_code          TEXT,
      status                 TEXT NOT NULL DEFAULT 'paid'
                             CHECK (status IN ('paid', 'intake_submitted', 'in_progress', 'approval_progress', 'delivered', 'completed')),
      brief                  TEXT,
      intake_data            TEXT,
      total_cents            INTEGER NOT NULL DEFAULT 0,
      paypal_subscription_id TEXT,
      paypal_order_id        TEXT,
      billing_cycle          TEXT DEFAULT 'one_time',
      created_at             TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrate existing orders table if columns are missing
  try {
    const cols = db.prepare("PRAGMA table_info(orders)").all().map(c => c.name);
    if (!cols.includes('affiliate_id')) {
      db.exec('ALTER TABLE orders ADD COLUMN affiliate_id TEXT REFERENCES affiliates(id)');
    }
    if (!cols.includes('referral_code')) {
      db.exec('ALTER TABLE orders ADD COLUMN referral_code TEXT');
    }
  } catch (err) {
    // Ignore migration errors
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
    CREATE INDEX IF NOT EXISTS idx_orders_manager ON orders(manager_id);
    CREATE INDEX IF NOT EXISTS idx_orders_affiliate ON orders(affiliate_id);
    CREATE INDEX IF NOT EXISTS idx_orders_refcode ON orders(referral_code);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_paypal_sub ON orders(paypal_subscription_id);
    CREATE INDEX IF NOT EXISTS idx_orders_paypal_ord ON orders(paypal_order_id);

    -- Affiliate Commissions
    CREATE TABLE IF NOT EXISTS affiliate_commissions (
      id                      TEXT PRIMARY KEY,
      affiliate_id            TEXT NOT NULL REFERENCES affiliates(id),
      order_id                TEXT NOT NULL REFERENCES orders(id),
      paypal_event_id         TEXT UNIQUE,
      gross_amount_cents      INTEGER NOT NULL,
      commission_rate         REAL NOT NULL DEFAULT 0.20,
      commission_amount_cents INTEGER NOT NULL,
      currency                TEXT NOT NULL DEFAULT 'USD',
      type                    TEXT NOT NULL DEFAULT 'initial' CHECK(type IN ('initial', 'renewal')),
      status                  TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'paid', 'voided')),
      payout_due_at           TEXT NOT NULL,
      paid_at                 TEXT,
      notes                   TEXT,
      created_at              TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_aff_comm_affiliate ON affiliate_commissions(affiliate_id);
    CREATE INDEX IF NOT EXISTS idx_aff_comm_order ON affiliate_commissions(order_id);
    CREATE INDEX IF NOT EXISTS idx_aff_comm_status ON affiliate_commissions(status);
    CREATE INDEX IF NOT EXISTS idx_aff_comm_payout_due ON affiliate_commissions(payout_due_at);

    -- Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id               TEXT PRIMARY KEY,
      order_id         TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      service_name     TEXT NOT NULL,
      qty              REAL NOT NULL DEFAULT 1,
      assigned_crew_id TEXT REFERENCES users(id),
      status           TEXT NOT NULL DEFAULT 'queued'
                       CHECK (status IN ('queued', 'assigned', 'working', 'review', 'done')),
      deliverable_url  TEXT,
      notes            TEXT,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_crew ON order_items(assigned_crew_id);

    -- Deliverables / Work artifacts
    CREATE TABLE IF NOT EXISTS deliverables (
      id               TEXT PRIMARY KEY,
      order_id         TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      item_id          TEXT REFERENCES order_items(id) ON DELETE SET NULL,
      title            TEXT NOT NULL,
      file_url         TEXT NOT NULL,
      notes            TEXT,
      status           TEXT NOT NULL DEFAULT 'pending_review'
                       CHECK (status IN ('pending_review', 'approved', 'revision_requested')),
      client_feedback  TEXT,
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at      TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_deliverables_order ON deliverables(order_id);

    -- Messages & Anonymized Email Relay log
    CREATE TABLE IF NOT EXISTS messages (
      id                TEXT PRIMARY KEY,
      order_id          TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      author_id         TEXT NOT NULL REFERENCES users(id),
      body              TEXT NOT NULL,
      from_email_masked TEXT,
      to_email_masked   TEXT,
      kind              TEXT NOT NULL DEFAULT 'client'
                        CHECK (kind IN ('client', 'internal')),
      created_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(order_id);
    CREATE INDEX IF NOT EXISTS idx_messages_kind ON messages(kind);
  `);

  // Seed default James De Lacey partner automatically
  db.prepare(`
    INSERT OR IGNORE INTO affiliates (id, code, name, email, paypal_email, commission_rate, status)
    VALUES ('aff_james', 'james', 'James De Lacey', 'james@jdp.team', 'james@jdp.team', 0.20, 'active')
  `).run();
}

function seedInitialData(db) {
  // Check if admin user exists
  const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');
  if (!existingAdmin) {
    const adminId = 'usr_' + crypto.randomBytes(8).toString('hex');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(config.admin.password, salt);
    
    db.prepare(`
      INSERT INTO users (id, email, role, display_name, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, config.admin.email, 'admin', 'JDP Admin', hash);
    
    console.log(`[DB] Created default admin user: ${config.admin.email}`);
  }
}

export function id(prefix = '') {
  return (prefix ? prefix + '_' : '') + crypto.randomBytes(12).toString('hex');
}
