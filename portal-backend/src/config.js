import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dkimDir = path.resolve(dataDir, 'dkim');
if (!fs.existsSync(dkimDir)) {
  fs.mkdirSync(dkimDir, { recursive: true });
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  dataDir,
  dbPath: process.env.DB_PATH || path.resolve(dataDir, 'portal.db'),
  cookieSecret: process.env.COOKIE_SECRET || 'jdp-team-secret-cookie-key-32-chars-long!',
  
  // Inbound SMTP relay
  smtpPort: parseInt(process.env.SMTP_PORT || '25', 10),
  smtpHost: process.env.SMTP_HOST || '0.0.0.0',
  smtpDomain: process.env.SMTP_DOMAIN || 'reply.jdp.team',
  
  // Outbound email & DKIM
  outbound: {
    host: process.env.OUTBOUND_SMTP_HOST || '',
    port: parseInt(process.env.OUTBOUND_SMTP_PORT || '587', 10),
    secure: process.env.OUTBOUND_SMTP_SECURE === 'true',
    user: process.env.OUTBOUND_SMTP_USER || '',
    pass: process.env.OUTBOUND_SMTP_PASS || '',
    fromAddress: process.env.OUTBOUND_FROM || 'support@jdp.team',
    fromName: process.env.OUTBOUND_NAME || 'JDP Team Support'
  },
  dkim: {
    domainName: process.env.DKIM_DOMAIN || 'reply.jdp.team',
    keySelector: process.env.DKIM_SELECTOR || 'default',
    privateKeyPath: process.env.DKIM_KEY_PATH || path.resolve(dkimDir, 'private.key')
  },
  
  // PayPal Webhook
  paypal: {
    webhookId: process.env.PAYPAL_WEBHOOK_ID || ''
  },
  
  // Initial admin credentials
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@jdp.team',
    password: process.env.ADMIN_PASSWORD || 'jdp123'
  }
};
