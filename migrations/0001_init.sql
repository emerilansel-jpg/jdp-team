-- JDP.team — Dashboard foundation (direct-service storefront model, NO credits/wallet)
-- Roles: client (magic link) | manager | crew | admin (password)

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('client','manager','crew','admin')),
  display_name  TEXT,
  password_hash TEXT,                 -- NULL for clients (magic link only)
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);
CREATE INDEX idx_users_role ON users(role);

-- One-time magic link tokens (clients)
CREATE TABLE magic_links (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_magic_links_email ON magic_links(email);

-- Sessions for all roles (opaque token in HttpOnly cookie)
CREATE TABLE sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip         TEXT,
  ua         TEXT
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Storefront catalog (seeded from docs/pricing-model.md — dollars, no credits)
CREATE TABLE services (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,        -- 'pod' | 'project'
  unit          TEXT NOT NULL,        -- 'hour' | 'article' | 'release' | 'scope'
  price_cents   INTEGER NOT NULL,     -- one-time / per-unit price
  monthly       INTEGER NOT NULL DEFAULT 0, -- 1 = subscription-eligible (pod), 0 = one-time
  active        INTEGER NOT NULL DEFAULT 1,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

-- Orders: one row per checkout (a pod subscription OR a project purchase)
CREATE TABLE orders (
  id             TEXT PRIMARY KEY,
  client_id      TEXT NOT NULL REFERENCES users(id),
  manager_id     TEXT REFERENCES users(id),
  status         TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','scoping','quoted','in_progress','review','delivered','completed','cancelled')),
  brief          TEXT,
  total_cents    INTEGER NOT NULL DEFAULT 0,
  paypal_ref     TEXT,                -- PayPal order/subscription ID
  billing_cycle  TEXT,                -- 'one_time' | 'monthly'
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Line items within an order
CREATE TABLE order_items (
  id          TEXT PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id  TEXT NOT NULL REFERENCES services(id),
  qty         REAL NOT NULL DEFAULT 1,  -- hours / articles / releases
  unit_price_cents INTEGER NOT NULL,
  assigned_crew_id TEXT REFERENCES users(id),
  status      TEXT NOT NULL DEFAULT 'queued'
              CHECK (status IN ('queued','assigned','working','review','done')),
  due_at      TEXT,
  done_at     TEXT
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_crew ON order_items(assigned_crew_id);

-- Per-order thread (client <-> manager relay; crew sees internal notes via type)
CREATE TABLE messages (
  id         TEXT PRIMARY KEY,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  author_id  TEXT NOT NULL REFERENCES users(id),
  body       TEXT NOT NULL,
  kind       TEXT NOT NULL DEFAULT 'client' CHECK (kind IN ('client','internal')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_messages_order ON messages(order_id);

-- Crew time logs against order items (dollars derive from service rate, not credits)
CREATE TABLE time_logs (
  id         TEXT PRIMARY KEY,
  crew_id    TEXT NOT NULL REFERENCES users(id),
  item_id    TEXT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  minutes    INTEGER NOT NULL,
  note       TEXT,
  logged_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_time_logs_crew ON time_logs(crew_id);
CREATE INDEX idx_time_logs_item ON time_logs(item_id);

-- Seed: storefront catalog from docs/pricing-model.md
INSERT INTO services (id, slug, name, category, unit, price_cents, monthly, sort_order) VALUES
  ('svc_junior_pod',  'junior-pod',      'Junior Remote Staff Pod',  'pod',     'hour',    300, 1, 10),
  ('svc_senior_pod',  'senior-pod',      'Senior Specialist Pod',    'pod',     'hour',    500, 1, 20),
  ('svc_video_pod',   'video-pod',       'Video Editor Pod',         'pod',     'hour',    500, 1, 30),
  ('svc_seo_article', 'seo-content',     'SEO Content Writing',      'project', 'article', 3200, 0, 40),
  ('svc_press_rel',   'press-release',   'Press Release',            'project', 'release', 24000, 0, 50),
  ('svc_tech_seo',    'technical-seo',   'Technical SEO',            'project', 'hour',    700, 0, 60);

-- Seed: one admin (password set via setup endpoint at first deploy; placeholder hash)
INSERT INTO users (id, email, role, display_name) VALUES
  ('usr_admin_root', 'admin@jdp.team', 'admin', 'JDP Admin');
