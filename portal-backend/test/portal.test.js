import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/server.js';
import { getDb } from '../src/db.js';
import { config } from '../src/config.js';
import { parseRelayAddress, handleInboundRelayMessage } from '../src/services/smtp.js';

test('JDP Portal & Backend Comprehensive Test Suite', async (t) => {
  const app = await buildApp();
  const db = getDb();

  let adminCookie = '';
  let clientCookie = '';
  let testOrderId = '';
  let testDelivId = '';

  await t.test('1. Database seed and default admin initialization', () => {
    const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@jdp.team');
    assert.ok(admin, 'Admin user should exist in DB');
    assert.equal(admin.role, 'admin');
    assert.ok(admin.password_hash, 'Admin should have a password hash');
  });

  await t.test('2. Staff password login', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@jdp.team',
        password: config.admin.password || 'jdp123'
      }
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.equal(body.user.role, 'admin');

    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie, 'Should set session cookie');
    adminCookie = setCookie.split(';')[0];
  });

  await t.test('3. Auth /api/auth/me returns admin identity', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie: adminCookie }
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.email, 'admin@jdp.team');
    assert.equal(body.role, 'admin');
  });

  await t.test('4. PayPal Webhook auto-provisions client and creates order', async () => {
    const runId = Date.now();
    const paypalPayload = {
      id: 'WH-TEST-' + runId,
      event_type: 'PAYMENT.SALE.COMPLETED',
      resource: {
        id: 'PAYPAL-SALE-' + runId,
        billing_agreement_id: 'I-SUB-' + runId,
        amount: {
          total: '500.00',
          currency: 'USD'
        },
        description: 'Monthly Senior Specialist Pod',
        subscriber: {
          email_address: `client-${runId}@agency.com`,
          name: {
            given_name: 'Sarah',
            surname: 'Connor'
          }
        }
      }
    };

    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/paypal',
      payload: paypalPayload
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.ok(body.order_id);
    assert.equal(body.status, 'paid');
    testOrderId = body.order_id;

    // Verify in database
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(testOrderId);
    assert.ok(order);
    assert.equal(order.status, 'paid');
    assert.equal(order.total_cents, 50000);
    assert.equal(order.billing_cycle, 'monthly');

    // Verify magic link created
    const link = db.prepare('SELECT * FROM magic_links WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(order.client_id);
    assert.ok(link);
    assert.ok(link.token);

    // Verify initial welcome message created
    const msg = db.prepare('SELECT * FROM messages WHERE order_id = ?').get(testOrderId);
    assert.ok(msg);
    assert.match(msg.body, /Welcome to JDP Team/i);
  });

  await t.test('5. Magic Link Verification & Client Session Creation', async () => {
    const order = db.prepare('SELECT client_id FROM orders WHERE id = ?').get(testOrderId);
    const link = db.prepare('SELECT token FROM magic_links WHERE user_id = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1').get(order.client_id);
    assert.ok(link, 'Should find unused magic link');

    const res = await app.inject({
      method: 'GET',
      url: `/auth/verify?token=${link.token}&next=/orders/${testOrderId}`
    });

    assert.equal(res.statusCode, 302);
    assert.equal(res.headers.location, `/orders/${testOrderId}`);

    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie, 'Should set client session cookie');
    clientCookie = setCookie.split(';')[0];
  });

  await t.test('6. Client submits project intake form (transitions paid -> intake_submitted)', async () => {
    const intakeData = {
      target_urls: 'https://mysaas.com, https://competitor.io',
      keywords: 'b2b billing, automated invoice',
      drive_links: 'https://drive.google.com/folder/123',
      access_notes: 'Standard WordPress Contributor credentials',
      extra_details: 'Targeting Q4 enterprise buyers.'
    };

    const res = await app.inject({
      method: 'POST',
      url: `/api/orders/${testOrderId}/intake`,
      headers: { cookie: clientCookie },
      payload: intakeData
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.equal(body.status, 'intake_submitted');

    // Verify order in DB
    const order = db.prepare('SELECT status, intake_data FROM orders WHERE id = ?').get(testOrderId);
    assert.equal(order.status, 'intake_submitted');
    const parsed = JSON.parse(order.intake_data);
    assert.equal(parsed.keywords, 'b2b billing, automated invoice');
  });

  await t.test('7. Staff updates order status to in_progress', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/orders/${testOrderId}/status`,
      headers: { cookie: adminCookie },
      payload: {
        status: 'in_progress',
        note: 'Pod assigned. Work has commenced.'
      }
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.equal(body.status, 'in_progress');

    const order = db.prepare('SELECT status FROM orders WHERE id = ?').get(testOrderId);
    assert.equal(order.status, 'in_progress');
  });

  await t.test('8. Staff submits a deliverable (transitions status to approval_progress)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/orders/${testOrderId}/deliverables`,
      headers: { cookie: adminCookie },
      payload: {
        title: 'Initial Deliverable Bundle v1',
        file_url: 'https://drive.google.com/file/d/abc-xyz',
        notes: 'Full copy and video render preview attached.'
      }
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.ok(body.deliverable_id);
    testDelivId = body.deliverable_id;

    // Check order status
    const order = db.prepare('SELECT status FROM orders WHERE id = ?').get(testOrderId);
    assert.equal(order.status, 'approval_progress');
  });

  await t.test('9. Client approves deliverable (transitions status to completed)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/orders/${testOrderId}/deliverables/${testDelivId}/review`,
      headers: { cookie: clientCookie },
      payload: {
        action: 'approve',
        feedback: 'Looks amazing, approved!'
      }
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.equal(body.deliverable_status, 'approved');
    assert.equal(body.order_status, 'completed');

    const order = db.prepare('SELECT status FROM orders WHERE id = ?').get(testOrderId);
    assert.equal(order.status, 'completed');
  });

  await t.test('10. 2-Way Email Masking Address Parser', () => {
    const clientChannel = parseRelayAddress(`order-${testOrderId}-v@reply.jdp.team`);
    assert.ok(clientChannel);
    assert.equal(clientChannel.orderId, testOrderId);
    assert.equal(clientChannel.roleTag, 'v');

    const crewChannel = parseRelayAddress(`order-${testOrderId}-c@reply.jdp.team`);
    assert.ok(crewChannel);
    assert.equal(crewChannel.orderId, testOrderId);
    assert.equal(crewChannel.roleTag, 'c');

    const invalid = parseRelayAddress(`random@reply.jdp.team`);
    assert.equal(invalid, null);
  });

  await t.test('11. Inbound SMTP Relay message processing execution', async () => {
    // Simulate incoming email to client channel (roleTag 'v')
    await handleInboundRelayMessage({
      orderId: testOrderId,
      roleTag: 'v',
      fromAddress: 'client-test@agency.com',
      subject: 'Question on deliverable format',
      bodyText: 'Can we also export in 4K ProRes?\n\nOn Mon, wrote:\n> quoted text'
    });

    // Check that message was recorded in database
    const msg = db.prepare(`
      SELECT * FROM messages 
      WHERE order_id = ? AND body LIKE '%4K ProRes%'
    `).get(testOrderId);

    assert.ok(msg);
    assert.equal(msg.kind, 'client');
    assert.match(msg.from_email_masked, /-v@/);
    assert.match(msg.to_email_masked, /-c@/);
    assert.ok(!msg.body.includes('quoted text'), 'Quoted email reply should be stripped');
  });

  await t.test('12. Web message composer endpoint', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/orders/${testOrderId}/messages`,
      headers: { cookie: clientCookie },
      payload: {
        body: 'Sending a follow up note directly from the web portal.'
      }
    });

    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.ok, true);
    assert.ok(body.message.id);

    // Fetch messages list
    const listRes = await app.inject({
      method: 'GET',
      url: `/api/orders/${testOrderId}/messages`,
      headers: { cookie: clientCookie }
    });
    assert.equal(listRes.statusCode, 200);
    const listBody = listRes.json();
    assert.ok(listBody.messages.length >= 3);
  });

  await t.test('13. Static assets, HTML routes, SPA fallback, and API 404 isolation', async () => {
    for (const url of ['/', '/index.html', '/login', '/login.html', '/orders/sample-id', '/orders/sample-id/tab', '/dashboard']) {
      const getRes = await app.inject({ method: 'GET', url });
      assert.equal(getRes.statusCode, 200, `GET ${url} should return 200`);
      assert.match(getRes.headers['content-type'] || '', /text\/html/, `GET ${url} should be text/html`);

      const headRes = await app.inject({ method: 'HEAD', url });
      assert.equal(headRes.statusCode, 200, `HEAD ${url} should return 200`);
    }

    const loginRes = await app.inject({ method: 'GET', url: '/login.html' });
    assert.match(loginRes.body, /Sign In/i);

    const rootRes = await app.inject({ method: 'GET', url: '/' });
    assert.match(rootRes.body, /Operations & Client Portal/i);

    for (const assetUrl of ['/public/app.js', '/app.js']) {
      const assetRes = await app.inject({ method: 'GET', url: assetUrl });
      assert.equal(assetRes.statusCode, 200, `${assetUrl} should return 200`);
      assert.match(assetRes.headers['content-type'] || '', /javascript/);
    }

    const healthRes = await app.inject({ method: 'GET', url: '/api/health' });
    assert.equal(healthRes.statusCode, 200);
    assert.equal(healthRes.json().status, 'ok');

    for (const notFoundUrl of ['/api/nonexistent', '/auth/nonexistent', '/public/missing.js', '/missing.js']) {
      const missRes = await app.inject({ method: 'GET', url: notFoundUrl });
      assert.equal(missRes.statusCode, 404, `GET ${notFoundUrl} should return 404`);
    }
  });

  await t.test('14. Simulated Checkout package catalog, payment simulation, and auto-login', async () => {
    // 14.1 GET /checkout and /checkout.html return HTML 200
    for (const chkUrl of ['/checkout', '/checkout.html']) {
      const chkRes = await app.inject({ method: 'GET', url: chkUrl });
      assert.equal(chkRes.statusCode, 200, `GET ${chkUrl} should return 200`);
      assert.match(chkRes.headers['content-type'] || '', /text\/html/);
      assert.match(chkRes.body, /Simulated Checkout/i);
    }

    // 14.2 GET /api/checkout/packages
    const pkgRes = await app.inject({ method: 'GET', url: '/api/checkout/packages' });
    assert.equal(pkgRes.statusCode, 200);
    const pkgData = pkgRes.json();
    assert.equal(pkgData.ok, true);
    assert.ok(Array.isArray(pkgData.packages));
    assert.ok(pkgData.packages.length >= 4);

    // 14.3 POST /api/checkout/simulate
    const simEmail = `alex.sim.${Date.now()}@acme-brand.com`;
    const simRes = await app.inject({
      method: 'POST',
      url: '/api/checkout/simulate',
      payload: {
        email: simEmail,
        name: 'Alex Simulation',
        company: 'Acme Brand Media',
        service_name: 'Dedicated Junior Pod (160h/mo)',
        total_cents: 63000,
        billing_cycle: 'monthly',
        items: [
          { name: 'Dedicated Junior Pod (160h/mo)', qty: 1, price_cents: 48000 },
          { name: 'Topical Authority 5-Pack Sprint (Add-on)', qty: 1, price_cents: 15000 }
        ]
      }
    });

    assert.equal(simRes.statusCode, 200);
    const simBody = simRes.json();
    assert.equal(simBody.ok, true);
    assert.ok(simBody.order_id);
    assert.equal(simBody.redirect_url, `/orders/${simBody.order_id}`);

    // Verify session cookie set
    const simCookie = simRes.headers['set-cookie'];
    assert.ok(simCookie, 'Should set jdp_session cookie');
    assert.match(simCookie, /jdp_session=/);

    // Verify order in DB
    const simOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(simBody.order_id);
    assert.ok(simOrder);
    assert.equal(simOrder.status, 'paid');
    assert.equal(simOrder.total_cents, 63000);
    assert.equal(simOrder.billing_cycle, 'monthly');

    // Verify items in DB
    const simItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(simBody.order_id);
    assert.equal(simItems.length, 2);

    // Verify client can immediately access single order detail with their new cookie
    const getOrderRes = await app.inject({
      method: 'GET',
      url: `/api/orders/${simBody.order_id}`,
      headers: { cookie: simCookie.split(';')[0] }
    });
    assert.equal(getOrderRes.statusCode, 200);
    const getOrderBody = getOrderRes.json();
    assert.equal(getOrderBody.order.id, simBody.order_id);
    assert.equal(getOrderBody.order.client_name, 'Alex Simulation');
  });

  await app.close();
});
