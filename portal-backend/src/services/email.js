import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

let transporter = null;

export function getTransporter() {
  if (transporter) return transporter;

  const transportOptions = {};

  if (config.outbound.host) {
    transportOptions.host = config.outbound.host;
    transportOptions.port = config.outbound.port;
    transportOptions.secure = config.outbound.secure;
    if (config.outbound.user) {
      transportOptions.auth = {
        user: config.outbound.user,
        pass: config.outbound.pass
      };
    }
  } else {
    // Development fallback: stream / json transport for logging
    console.log('[Email] No external OUTBOUND_SMTP_HOST provided. Using development direct transport with console logging.');
    transportOptions.streamTransport = true;
    transportOptions.buffer = true;
  }

  // Attach DKIM if key exists
  if (fs.existsSync(config.dkim.privateKeyPath)) {
    try {
      const privateKey = fs.readFileSync(config.dkim.privateKeyPath, 'utf8');
      transportOptions.dkim = {
        domainName: config.dkim.domainName,
        keySelector: config.dkim.keySelector,
        privateKey
      };
      console.log(`[Email] DKIM signing enabled for domain: ${config.dkim.domainName} (selector: ${config.dkim.keySelector})`);
    } catch (err) {
      console.warn('[Email] Warning: Failed to load DKIM private key:', err.message);
    }
  } else {
    console.log(`[Email] DKIM private key not found at ${config.dkim.privateKeyPath} (DKIM signing disabled). Run npm run gen-dkim to generate.`);
  }

  transporter = nodemailer.createTransport(transportOptions);
  return transporter;
}

export async function sendMail(options) {
  const mailer = getTransporter();
  const info = await mailer.sendMail(options);
  if (info.message) {
    console.log(`[Email Sent - Dev Stream] To: ${options.to} | Subject: ${options.subject}`);
  } else {
    console.log(`[Email Sent] MessageId: ${info.messageId} | To: ${options.to}`);
  }
  return info;
}

export async function sendMagicLinkEmail({ email, token, nextUrl }) {
  const loginUrl = `${config.appUrl}/auth/verify?token=${encodeURIComponent(token)}${nextUrl ? '&next=' + encodeURIComponent(nextUrl) : ''}`;
  
  const subject = 'Your JDP Team Portal Login Link';
  const text = `Hello,

Click the link below to securely sign in to your JDP Team Portal:
${loginUrl}

This link is valid for 24 hours and can be used once.

If you did not request this link, you can safely ignore this email.

— JDP Team
${config.appUrl}
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 40px 20px; }
    .card { max-width: 540px; margin: 0 auto; background-color: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; }
    .brand { font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 24px; }
    .brand span { color: #4f46e5; }
    .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 24px 0; }
    .footer { font-size: 12px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">JDP<span>.team</span></div>
    <h2 style="margin-top:0; color:#ffffff;">Sign in to your Portal</h2>
    <p style="color:#cbd5e1; font-size:15px; line-height:1.6;">Click the button below to sign in to your JDP Team client portal. No password required.</p>
    <a href="${loginUrl}" class="btn">Sign In to JDP Portal</a>
    <p style="color:#64748b; font-size:13px;">Or copy and paste this link into your browser:<br><span style="color:#818cf8; word-break:break-all;">${loginUrl}</span></p>
    <div class="footer">This magic link expires in 24 hours. If you did not request this, please ignore this email.</div>
  </div>
</body>
</html>
`;

  return sendMail({
    from: `"${config.outbound.fromName}" <${config.outbound.fromAddress}>`,
    to: email,
    subject,
    text,
    html
  });
}

export async function sendRelayedEmail({ toRealEmail, maskedFromEmail, subject, textBody, orderId, isToClient = true }) {
  const portalUrl = `${config.appUrl}/orders/${orderId}`;
  const banner = isToClient 
    ? `[Message from your JDP Team Manager / Specialist]\nReply directly to this email or visit your portal: ${portalUrl}\n------------------------------------------------------------\n\n`
    : `[Message from Client via Masked Relay]\nReply directly to this email to respond back to the client.\n------------------------------------------------------------\n\n`;

  const fullText = banner + textBody;

  const htmlBanner = isToClient
    ? `<div style="background:#1e1b4b; border-left:4px solid #6366f1; padding:12px 16px; margin-bottom:20px; font-size:13px; color:#c7d2fe; border-radius:4px;">
        <strong>Message from your JDP Team Dedicated Specialist</strong><br>
        You can reply directly to this email to respond, or <a href="${portalUrl}" style="color:#818cf8; text-decoration:underline;">view in Portal</a>.
       </div>`
    : `<div style="background:#064e3b; border-left:4px solid #10b981; padding:12px 16px; margin-bottom:20px; font-size:13px; color:#a7f3d0; border-radius:4px;">
        <strong>New message from client for Order #${orderId}</strong><br>
        Reply directly to this email to send an anonymized response to the client.
       </div>`;

  const fullHtml = `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; background:#020617; color:#f8fafc; padding:24px;">
  <div style="max-width:600px; margin:0 auto; background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:24px;">
    ${htmlBanner}
    <div style="white-space:pre-wrap; font-size:14px; line-height:1.6; color:#f1f5f9;">${escapeHtml(textBody)}</div>
    <div style="margin-top:28px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.08); font-size:12px; color:#64748b;">
      Secure 2-way masked relay &bull; Order #${orderId} &bull; <a href="${portalUrl}" style="color:#818cf8;">Open in Portal</a>
    </div>
  </div>
</body>
</html>`;

  return sendMail({
    from: `"JDP Team" <${maskedFromEmail}>`,
    replyTo: maskedFromEmail,
    to: toRealEmail,
    subject: subject.startsWith('Re:') ? subject : `Re: [Order #${orderId}] ${subject}`,
    text: fullText,
    html: fullHtml
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
