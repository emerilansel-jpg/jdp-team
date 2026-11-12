# JDP Team — Self-Contained Client Portal & Operations Backend

Production-ready backend, self-hosted web portal, and anonymized 2-way email relay system for `portal.jdp.team`.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v20+ ESM) + Fastify
- **Database**: SQLite (`better-sqlite3`) with WAL journal mode & foreign keys enabled
- **Inbound Email Server**: Built-in `smtp-server` + `mailparser` on port 25 for MX handling
- **Outbound Email**: `nodemailer` with DKIM signing (RSA 2048)
- **Reverse Proxy**: Caddy (automatic Let's Encrypt HTTPS certificates)
- **Frontend**: Responsive Tailwind CSS Dark Theme matching `jdp.team` aesthetic

---

## 🚀 Key Features

### 1. Visual 6-Stage Order Tracker
- Stages: `Paid` &rarr; `Intake Submitted` &rarr; `In Progress` &rarr; `Approval Progress` &rarr; `Delivered` &rarr; `Completed`.
- Real-time visual progress bar with completed checkmarks and current stage glow.

### 2. Anonymized 2-Way Email Masking Relay
- Inbound MX server listens on port 25 for `reply.jdp.team`.
- **Client &rarr; Crew**: Client replies to `order-<orderId>-v@reply.jdp.team`. Parser records the message to the database and forwards to assigned crew/manager's real email with `From: JDP Team <order-<orderId>-c@reply.jdp.team>`.
- **Crew &rarr; Client**: Crew replies to `order-<orderId>-c@reply.jdp.team`. Parser records the message to the database and forwards to client's real email with `From: JDP Team <order-<orderId>-v@reply.jdp.team>`.
- Neither party ever sees the other's real email address.

### 3. PayPal Webhook Auto-Provisioning
- Endpoint: `POST /api/webhooks/paypal`
- Automatically catches:
  - `PAYMENT.SALE.COMPLETED`
  - `CHECKOUT.ORDER.APPROVED`
  - `PAYMENT.CAPTURE.COMPLETED`
  - `BILLING.SUBSCRIPTION.ACTIVATED`
- Auto-provisions new client user account, generates order with status `paid`, and sends a one-click magic link directly to their inbox.

### 4. Deliverables & Review Workflow
- Specialists submit deliverables with download links and notes.
- Clients can directly click **Approve** (transitions order to `completed`) or **Request Revision** with feedback.

---

## 🌐 Cloudflare DNS Setup

Set up the following DNS records in your DNS console:

| Type | Name | Content / Value | TTL / Proxy |
|---|---|---|---|
| **A** | `portal.jdp.team` | `<YOUR_SERVER_PUBLIC_IP>` | DNS Only (Gray Cloud) |
| **A** | `reply.jdp.team` | `<YOUR_SERVER_PUBLIC_IP>` | DNS Only (Gray Cloud) |
| **MX** | `reply.jdp.team` | `portal.jdp.team` (Priority 10) | DNS Only |
| **TXT** | `reply.jdp.team` | `v=spf1 mx ip4:<YOUR_SERVER_PUBLIC_IP> ~all` | Auto |
| **TXT** | `_dmarc.reply.jdp.team` | `v=DMARC1; p=quarantine; rua=mailto:admin@jdp.team` | Auto |
| **TXT** | `default._domainkey.reply.jdp.team` | `v=DKIM1; k=rsa; p=<PUBLIC_KEY_BASE64>` | Auto |

*(Run `npm run gen-dkim` to view your exact DKIM TXT record value).*

---

## 📦 Deployment via Docker Compose

1. Clone or copy `portal-backend` to your production server:
   ```bash
   cd /opt/portal-backend
   cp .env.example .env
   # Edit .env with your SMTP provider credentials and secrets
   ```

2. Generate DKIM keys:
   ```bash
   node src/scripts/gen-dkim.js
   ```

3. Start services with Docker Compose:
   ```bash
   docker compose up -d --build
   ```

4. Verify status:
   ```bash
   docker compose ps
   docker compose logs -f portal-app
   ```

---

## 🔑 Default Administrator Credentials

- **Email**: `admin@jdp.team`
- **Password**: `JdpAdmin2026!#` (Configurable via `ADMIN_PASSWORD` in `.env`)
- Login URL: `https://portal.jdp.team/login` (Staff Login tab)
