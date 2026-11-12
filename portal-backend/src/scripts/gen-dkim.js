import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../config.js';

const dkimDir = path.dirname(config.dkim.privateKeyPath);
if (!fs.existsSync(dkimDir)) {
  fs.mkdirSync(dkimDir, { recursive: true });
}

const privateKeyPath = config.dkim.privateKeyPath;
const publicKeyPath = path.resolve(dkimDir, 'public.key');

console.log('========================================================');
console.log('       JDP Team DKIM & DNS Configuration Generator      ');
console.log('========================================================\n');

if (!fs.existsSync(privateKeyPath)) {
  console.log(`Generating new 2048-bit RSA key pair in ${dkimDir}...`);
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicKeyPath, publicKey, { mode: 0o644 });
  console.log('Private and Public keys successfully generated.\n');
} else {
  console.log(`Using existing DKIM keys at ${privateKeyPath}\n`);
}

const pubPem = fs.readFileSync(publicKeyPath, 'utf8');
const pubBase64 = pubPem
  .replace(/-----BEGIN PUBLIC KEY-----/g, '')
  .replace(/-----END PUBLIC KEY-----/g, '')
  .replace(/[\r\n\s]/g, '');

const dkimRecordName = `${config.dkim.keySelector}._domainkey.${config.dkim.domainName}`;
const dkimRecordValue = `v=DKIM1; k=rsa; p=${pubBase64}`;

console.log('--- 1. DKIM TXT RECORD ---');
console.log(`Type:  TXT`);
console.log(`Name:  ${dkimRecordName}`);
console.log(`Value: ${dkimRecordValue}\n`);

console.log('--- 2. SPF TXT RECORD ---');
console.log(`Type:  TXT`);
console.log(`Name:  ${config.smtpDomain}`);
console.log(`Value: v=spf1 mx ~all\n`);

console.log('--- 3. DMARC TXT RECORD ---');
console.log(`Type:  TXT`);
console.log(`Name:  _dmarc.${config.smtpDomain}`);
console.log(`Value: v=DMARC1; p=quarantine; rua=mailto:${config.admin.email}\n`);

console.log('--- 4. INBOUND MX RECORD ---');
console.log(`Type:     MX`);
console.log(`Name:     ${config.smtpDomain}`);
console.log(`Priority: 10`);
console.log(`Target:   portal.jdp.team\n`);

console.log('========================================================');
console.log('Copy the records above into your Cloudflare DNS console.');
console.log('========================================================');
