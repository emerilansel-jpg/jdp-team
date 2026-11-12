import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { config } from '../config.js';
import { getDb, id } from '../db.js';
import { sendRelayedEmail } from './email.js';

let smtpServerInstance = null;

// Pattern: order-<orderId>-<role>@<domain>
// where role is 'v' (visitor/client) or 'c' (crew/manager)
export function parseRelayAddress(address) {
  if (!address) return null;
  const clean = address.trim().toLowerCase();
  const domain = config.smtpDomain.toLowerCase();
  
  // order-ord_12345-v@reply.jdp.team or order-12345-c@reply.jdp.team
  const regex = new RegExp(`^order-([a-zA-Z0-9_-]+)-(v|c)@${domain.replace('.', '\\.')}$`, 'i');
  const match = clean.match(regex);
  if (!match) return null;

  return {
    orderId: match[1],
    roleTag: match[2].toLowerCase(), // 'v' or 'c'
    rawAddress: clean
  };
}

export function createSmtpServer() {
  const server = new SMTPServer({
    banner: 'JDP Team Secure Mail Relay',
    disabledCommands: ['AUTH', 'STARTTLS'],
    authOptional: true,
    size: 25 * 1024 * 1024, // 25 MB max

    onConnect(session, callback) {
      console.log(`[SMTP-Inbound] Client connected from ${session.remoteAddress}`);
      callback();
    },

    onMailFrom(address, session, callback) {
      // Accept all senders at envelope level
      callback();
    },

    onRcptTo(address, session, callback) {
      const parsed = parseRelayAddress(address.address);
      if (!parsed) {
        console.warn(`[SMTP-Inbound] Rejected RCPT TO: ${address.address} (does not match relay pattern)`);
        return callback(new Error('Relay address format invalid. Expected order-<id>-<v|c>@' + config.smtpDomain));
      }

      const db = getDb();
      // Check if order exists (try exact id or ord_<id>)
      let order = db.prepare('SELECT id FROM orders WHERE id = ?').get(parsed.orderId);
      if (!order && !parsed.orderId.startsWith('ord_')) {
        order = db.prepare('SELECT id FROM orders WHERE id = ?').get('ord_' + parsed.orderId);
      }

      if (!order) {
        console.warn(`[SMTP-Inbound] Rejected RCPT TO: ${address.address} (order not found: ${parsed.orderId})`);
        return callback(new Error('Order not found'));
      }

      // Store normalized order id for onData
      session.orderId = order.id;
      session.roleTag = parsed.roleTag;
      session.matchedRecipient = address.address;

      callback();
    },

    async onData(stream, session, callback) {
      try {
        const parsed = await simpleParser(stream);
        const fromAddress = parsed.from?.value?.[0]?.address || 'unknown';
        const subject = parsed.subject || 'New Message';
        const bodyText = parsed.text || (parsed.html ? parsed.html.replace(/<[^>]+>/g, ' ') : '');

        console.log(`[SMTP-Inbound] Processing email from ${fromAddress} for Order ${session.orderId} (Tag: ${session.roleTag})`);

        await handleInboundRelayMessage({
          orderId: session.orderId,
          roleTag: session.roleTag,
          fromAddress,
          subject,
          bodyText
        });

        callback();
      } catch (err) {
        console.error('[SMTP-Inbound] Error processing email stream:', err);
        callback(err);
      }
    }
  });

  server.on('error', (err) => {
    console.error('[SMTP-Inbound Server Error]:', err.message);
  });

  return server;
}

export async function handleInboundRelayMessage({ orderId, roleTag, fromAddress, subject, bodyText }) {
  const db = getDb();
  
  // 1. Fetch order details with client and crew
  const order = db.prepare(`
    SELECT o.*, 
           c.email as client_email, c.display_name as client_name,
           m.email as manager_email, m.display_name as manager_name
    FROM orders o
    JOIN users c ON o.client_id = c.id
    LEFT JOIN users m ON o.manager_id = m.id
    WHERE o.id = ?
  `).get(orderId);

  if (!order) {
    console.warn(`[Relay] Order ${orderId} missing during relay message execution.`);
    return;
  }

  // 2. Fetch assigned crew if any
  const crewItem = db.prepare(`
    SELECT u.id, u.email, u.display_name
    FROM order_items oi
    JOIN users u ON oi.assigned_crew_id = u.id
    WHERE oi.order_id = ? AND oi.assigned_crew_id IS NOT NULL
    LIMIT 1
  `).get(orderId);

  const cleanBody = stripEmailQuote(bodyText);
  const msgId = id('msg');

  // RoleTag 'v' = client sent to client-facing relay address -> Relay to Crew/Manager
  if (roleTag === 'v') {
    const targetRealEmail = crewItem?.email || order.manager_email || config.admin.email;
    const authorId = order.client_id;
    const fromMasked = `order-${order.id}-v@${config.smtpDomain}`;
    const toMasked = `order-${order.id}-c@${config.smtpDomain}`;

    // Store in DB
    db.prepare(`
      INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
      VALUES (?, ?, ?, ?, ?, ?, 'client')
    `).run(msgId, order.id, authorId, cleanBody, fromMasked, toMasked);

    // Forward to crew's real email
    // When forwarded, From is order-<id>-c so crew replies to 'c'
    await sendRelayedEmail({
      toRealEmail: targetRealEmail,
      maskedFromEmail: toMasked,
      subject,
      textBody: cleanBody,
      orderId: order.id,
      isToClient: false
    });

    console.log(`[Relay] Masked message from Client routed to Crew/Manager (${targetRealEmail})`);
  } 
  // RoleTag 'c' = crew/manager sent to crew-facing relay address -> Relay to Client
  else if (roleTag === 'c') {
    const targetRealEmail = order.client_email;
    let authorUser = db.prepare('SELECT id, role FROM users WHERE email = ? COLLATE NOCASE').get(fromAddress);
    if (!authorUser) {
      authorUser = crewItem || { id: order.manager_id || 'usr_staff' };
    }

    const fromMasked = `order-${order.id}-c@${config.smtpDomain}`;
    const toMasked = `order-${order.id}-v@${config.smtpDomain}`;

    // Store in DB
    db.prepare(`
      INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
      VALUES (?, ?, ?, ?, ?, ?, 'client')
    `).run(msgId, order.id, authorUser.id, cleanBody, fromMasked, toMasked);

    // Forward to client's real email
    // When forwarded, From is order-<id>-v so client replies to 'v'
    await sendRelayedEmail({
      toRealEmail: targetRealEmail,
      maskedFromEmail: toMasked,
      subject,
      textBody: cleanBody,
      orderId: order.id,
      isToClient: true
    });

    console.log(`[Relay] Masked message from Crew/Manager routed to Client (${targetRealEmail})`);
  }
}

// Strip previous quoted replies (e.g. "On Mon, ... wrote:", "> quoted text")
function stripEmailQuote(text) {
  if (!text) return '';
  const lines = text.split(/\r?\n/);
  const result = [];
  for (const line of lines) {
    if (line.trim().startsWith('>')) continue;
    if (line.match(/^On .+ wrote:$/i)) break;
    if (line.match(/^-{3,}.*Original Message.*-{3,}/i)) break;
    if (line.match(/^_{5,}/)) break;
    result.push(line);
  }
  return result.join('\n').trim();
}

export function startSmtpServer() {
  if (smtpServerInstance) return smtpServerInstance;

  smtpServerInstance = createSmtpServer();
  smtpServerInstance.listen(config.smtpPort, config.smtpHost, () => {
    console.log(`[SMTP-Inbound] Server listening on ${config.smtpHost}:${config.smtpPort} (Domain: ${config.smtpDomain})`);
  });

  return smtpServerInstance;
}

export function stopSmtpServer() {
  if (smtpServerInstance) {
    smtpServerInstance.close();
    smtpServerInstance = null;
  }
}
