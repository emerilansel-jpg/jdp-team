-- Bootstrap admin + staff users. Passwords below are temporary — change after first login.
-- Format: hex:<salt>:<pbkdf2-sha256-100k-digest>

-- admin@jdp.team / jdp-admin-bootstrap-2026
INSERT OR IGNORE INTO users (id, email, role, display_name, password_hash) VALUES
  ('usr_admin_0001', 'admin@jdp.team', 'admin', 'JDP Admin',
   'hex:f8460cdb6e1f7c140fd9b539387dc65d:4bf7465411a855639657d333383074bd12565d84b285635e417d2f6e2a6de933');

-- manager@jdp.team / jdp-manager-2026!
INSERT OR IGNORE INTO users (id, email, role, display_name, password_hash) VALUES
  ('usr_manager_001', 'manager@jdp.team', 'manager', 'Priya (PM)',
   'hex:f2fab9cefa4f42b0912914354b857409:0d38a084a792bedc67efd2e77b4c407071d8fca800e2c717537484871931488a');

-- crew@jdp.team / jdp-crew-2026!
INSERT OR IGNORE INTO users (id, email, role, display_name, password_hash) VALUES
  ('usr_crew_001', 'crew@jdp.team', 'crew', 'Sam (Crew)',
   'hex:5a0d3a35c955b95954029cced50402f6:1ab7c955535358ece6d0c4c9a29c54d06eaedc4f5cc108ea00a375035c3174ca');
