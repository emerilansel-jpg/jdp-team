// setup-dns.js — Automated Cloudflare DNS Configurator for jdp.team
const ZONE_ID = '4236e6b681c08d0b9285ccbb7b5339b2';
const TARGET_IP = '45.13.232.184';
const TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.argv[2];

if (!TOKEN) {
  console.error('Usage: node setup-dns.js <CLOUDFLARE_API_TOKEN>');
  console.error('Or set CLOUDFLARE_API_TOKEN environment variable.');
  process.exit(1);
}

const DESIRED_RECORDS = [
  {
    type: 'A',
    name: 'portal.jdp.team',
    content: TARGET_IP,
    proxied: false,
    ttl: 1 // auto
  },
  {
    type: 'A',
    name: 'reply.jdp.team',
    content: TARGET_IP,
    proxied: false,
    ttl: 1
  },
  {
    type: 'MX',
    name: 'reply.jdp.team',
    content: 'portal.jdp.team',
    priority: 10,
    ttl: 1
  },
  {
    type: 'TXT',
    name: 'reply.jdp.team',
    content: `v=spf1 mx ip4:${TARGET_IP} ~all`,
    ttl: 1
  },
  {
    type: 'TXT',
    name: '_dmarc.reply.jdp.team',
    content: 'v=DMARC1; p=quarantine; rua=mailto:admin@jdp.team',
    ttl: 1
  },
  {
    type: 'TXT',
    name: 'default._domainkey.reply.jdp.team',
    content: 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtV2kK7ZUo37yTnz6pjPvJSLaxzNoS3mObWonoMBvomYte7JVOHVEY7RqdLzWqDSZEh5f7dQqK/BQNQIh5DhGqdsFBV9BrLlytat0b1QYKCu6GgnwbfSJJBAirko8QVp09Pd+vD9abAnVOg0kgsXmYiS/uXOzoGe2mJlFrGayxjaMiFQyQkhGCnidZwq7chW9VJ4q6e/tqMPA2x6mEiUbJd8dZjNJ4cP1CMlpVi11WiSxJsWcrTJoC0C3o3qMfdERFxivyyjtEGejarJWjDZS+L57jpzxMeHJMqK7bwmKSVuPZW/yYfQqoYEbdqXbEcsA8OyLEfKYMHGq+xJk//PxoQIDAQAB',
    ttl: 1
  }
];

async function cfRequest(path, method = 'GET', body = null) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  console.log(`Zone ID: ${ZONE_ID} (jdp.team)`);
  console.log('Fetching existing DNS records...');
  
  const { status, data } = await cfRequest('/dns_records?per_page=100');
  if (!data.success) {
    console.error(`Error fetching records (${status}):`, data.errors);
    process.exit(1);
  }

  const existing = data.result || [];
  console.log(`Found ${existing.length} existing records.`);

  for (const rec of DESIRED_RECORDS) {
    const match = existing.find(e => 
      e.type === rec.type && 
      e.name.toLowerCase() === rec.name.toLowerCase()
    );

    if (match) {
      console.log(`Updating ${rec.type} ${rec.name} (id: ${match.id})...`);
      const updateRes = await cfRequest(`/dns_records/${match.id}`, 'PUT', rec);
      if (updateRes.data.success) {
        console.log(`  ✓ Updated ${rec.type} ${rec.name}`);
      } else {
        console.error(`  ✗ Failed to update ${rec.type} ${rec.name}:`, updateRes.data.errors);
      }
    } else {
      console.log(`Creating ${rec.type} ${rec.name}...`);
      const createRes = await cfRequest('/dns_records', 'POST', rec);
      if (createRes.data.success) {
        console.log(`  ✓ Created ${rec.type} ${rec.name}`);
      } else {
        console.error(`  ✗ Failed to create ${rec.type} ${rec.name}:`, createRes.data.errors);
      }
    }
  }

  console.log('\nAll DNS operations finished.');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
