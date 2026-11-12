import { getDb, id } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { sendRelayedEmail, sendMail } from '../services/email.js';
import { config } from '../config.js';

export async function orderRoutes(fastify, options) {
  // 1. List Orders
  fastify.get('/api/orders', { preHandler: requireAuth }, async (req, reply) => {
    const db = getDb();
    const user = req.user;

    let orders = [];
    if (user.role === 'client') {
      orders = db.prepare(`
        SELECT o.*, 
               (SELECT COUNT(*) FROM messages m WHERE m.order_id = o.id AND m.kind = 'client') as message_count,
               (SELECT COUNT(*) FROM deliverables d WHERE d.order_id = o.id) as deliverable_count
        FROM orders o
        WHERE o.client_id = ?
        ORDER BY o.created_at DESC
      `).all(user.id);
    } else if (user.role === 'crew') {
      orders = db.prepare(`
        SELECT o.*, 
               c.email as client_email, c.display_name as client_name,
               (SELECT COUNT(*) FROM messages m WHERE m.order_id = o.id) as message_count,
               (SELECT COUNT(*) FROM deliverables d WHERE d.order_id = o.id) as deliverable_count
        FROM orders o
        JOIN users c ON o.client_id = c.id
        WHERE o.id IN (SELECT order_id FROM order_items WHERE assigned_crew_id = ?)
           OR o.status IN ('paid', 'intake_submitted', 'in_progress', 'approval_progress')
        ORDER BY o.created_at DESC
      `).all(user.id);
    } else {
      // manager or admin
      orders = db.prepare(`
        SELECT o.*, 
               c.email as client_email, c.display_name as client_name,
               m.email as manager_email, m.display_name as manager_name,
               (SELECT COUNT(*) FROM messages m WHERE m.order_id = o.id) as message_count,
               (SELECT COUNT(*) FROM deliverables d WHERE d.order_id = o.id) as deliverable_count
        FROM orders o
        JOIN users c ON o.client_id = c.id
        LEFT JOIN users m ON o.manager_id = m.id
        ORDER BY o.created_at DESC
      `).all();
    }

    return reply.send({ ok: true, orders });
  });

  // 2. Get Single Order Details
  fastify.get('/api/orders/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id: orderId } = req.params;
    const db = getDb();
    const user = req.user;

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
      return reply.status(404).send({ error: 'Order not found' });
    }

    // Access check
    if (user.role === 'client' && order.client_id !== user.id) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    // Parse intake data JSON safely
    let parsedIntake = {};
    if (order.intake_data) {
      try {
        parsedIntake = JSON.parse(order.intake_data);
      } catch {
        parsedIntake = {};
      }
    }

    // Fetch line items
    const items = db.prepare(`
      SELECT oi.*, u.display_name as assigned_crew_name, u.email as assigned_crew_email
      FROM order_items oi
      LEFT JOIN users u ON oi.assigned_crew_id = u.id
      WHERE oi.order_id = ?
    `).all(orderId);

    // Fetch deliverables
    const deliverables = db.prepare(`
      SELECT * FROM deliverables WHERE order_id = ? ORDER BY created_at DESC
    `).all(orderId);

    // Email relay addresses
    const relayAddresses = {
      clientRelay: `order-${order.id}-v@${config.smtpDomain}`,
      staffRelay: `order-${order.id}-c@${config.smtpDomain}`
    };

    return reply.send({
      ok: true,
      order: {
        ...order,
        intake_parsed: parsedIntake
      },
      items,
      deliverables,
      relayAddresses
    });
  });

  // 3. Client Submit Intake Form
  fastify.post('/api/orders/:id/intake', { preHandler: requireAuth }, async (req, reply) => {
    const { id: orderId } = req.params;
    const db = getDb();
    const user = req.user;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    if (user.role === 'client' && order.client_id !== user.id) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const {
      target_urls = '',
      keywords = '',
      drive_links = '',
      access_notes = '',
      extra_details = ''
    } = req.body || {};

    const intakePayload = {
      target_urls: target_urls.trim(),
      keywords: keywords.trim(),
      drive_links: drive_links.trim(),
      access_notes: access_notes.trim(),
      extra_details: extra_details.trim(),
      submitted_at: new Date().toISOString()
    };

    // Transition status to intake_submitted if currently paid
    const newStatus = order.status === 'paid' ? 'intake_submitted' : order.status;

    db.prepare(`
      UPDATE orders 
      SET intake_data = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(JSON.stringify(intakePayload), newStatus, orderId);

    // Add notification in ticket thread
    const msgId = id('msg');
    const summary = `Project intake submitted by client.\n` +
      `- Target URLs: ${intakePayload.target_urls || 'None'}\n` +
      `- Keywords: ${intakePayload.keywords || 'None'}\n` +
      `- Drive/Assets: ${intakePayload.drive_links || 'None'}\n` +
      `- Notes: ${intakePayload.access_notes || 'None'}`;

    const fromMasked = `order-${order.id}-v@${config.smtpDomain}`;
    const toMasked = `order-${order.id}-c@${config.smtpDomain}`;

    db.prepare(`
      INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
      VALUES (?, ?, ?, ?, ?, ?, 'client')
    `).run(msgId, orderId, user.id, summary, fromMasked, toMasked);

    // Notify staff
    const staffTarget = order.manager_id 
      ? db.prepare('SELECT email FROM users WHERE id = ?').get(order.manager_id)?.email
      : config.admin.email;

    if (staffTarget) {
      await sendRelayedEmail({
        toRealEmail: staffTarget,
        maskedFromEmail: toMasked,
        subject: `Intake Submitted for Order #${order.id}`,
        textBody: summary,
        orderId: order.id,
        isToClient: false
      });
    }

    return reply.send({
      ok: true,
      status: newStatus,
      intake_data: intakePayload
    });
  });

  // 4. Update Order Status (Staff only)
  fastify.patch('/api/orders/:id/status', { preHandler: requireAuth }, async (req, reply) => {
    const { id: orderId } = req.params;
    const { status, note } = req.body || {};
    const db = getDb();
    const user = req.user;

    if (user.role === 'client') {
      return reply.status(403).send({ error: 'Clients cannot modify order status directly' });
    }

    const validStatuses = ['paid', 'intake_submitted', 'in_progress', 'approval_progress', 'delivered', 'completed'];
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = db.prepare(`
      SELECT o.*, c.email as client_email, c.display_name as client_name
      FROM orders o
      JOIN users c ON o.client_id = c.id
      WHERE o.id = ?
    `).get(orderId);

    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, orderId);

    // Record message in thread
    const statusLabel = status.replace(/_/g, ' ').toUpperCase();
    const msgBody = `Order status updated to [${statusLabel}].${note ? '\n' + note : ''}`;
    const msgId = id('msg');
    const fromMasked = `order-${order.id}-c@${config.smtpDomain}`;
    const toMasked = `order-${order.id}-v@${config.smtpDomain}`;

    db.prepare(`
      INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
      VALUES (?, ?, ?, ?, ?, ?, 'client')
    `).run(msgId, orderId, user.id, msgBody, fromMasked, toMasked);

    // Send email notification to client
    await sendRelayedEmail({
      toRealEmail: order.client_email,
      maskedFromEmail: toMasked,
      subject: `Order #${order.id} Status: ${statusLabel}`,
      textBody: msgBody,
      orderId: order.id,
      isToClient: true
    });

    return reply.send({ ok: true, status });
  });

  // 5. Add / Update Order Items & Assign Crew (Staff only)
  fastify.post('/api/orders/:id/items', { preHandler: requireAuth }, async (req, reply) => {
    const { id: orderId } = req.params;
    const { service_name, qty = 1, assigned_crew_id, notes, status = 'queued' } = req.body || {};
    const db = getDb();
    const user = req.user;

    if (user.role === 'client') {
      return reply.status(403).send({ error: 'Only staff can manage items' });
    }

    if (!service_name) {
      return reply.status(400).send({ error: 'service_name is required' });
    }

    const itemId = id('item');
    db.prepare(`
      INSERT INTO order_items (id, order_id, service_name, qty, assigned_crew_id, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(itemId, orderId, service_name, qty, assigned_crew_id || null, status, notes || '');

    return reply.send({ ok: true, item_id: itemId });
  });

  // 6. Add Deliverable (Staff only)
  fastify.post('/api/orders/:id/deliverables', { preHandler: requireAuth }, async (req, reply) => {
    const { id: orderId } = req.params;
    const { title, file_url, notes, item_id } = req.body || {};
    const db = getDb();
    const user = req.user;

    if (user.role === 'client') {
      return reply.status(403).send({ error: 'Only staff can submit deliverables' });
    }

    if (!title || !file_url) {
      return reply.status(400).send({ error: 'title and file_url are required' });
    }

    const order = db.prepare(`
      SELECT o.*, c.email as client_email, c.display_name as client_name
      FROM orders o
      JOIN users c ON o.client_id = c.id
      WHERE o.id = ?
    `).get(orderId);

    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    const delivId = id('dlv');
    db.prepare(`
      INSERT INTO deliverables (id, order_id, item_id, title, file_url, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending_review')
    `).run(delivId, orderId, item_id || null, title, file_url, notes || '');

    // Transition order to approval_progress or delivered
    db.prepare("UPDATE orders SET status = 'approval_progress', updated_at = datetime('now') WHERE id = ?").run(orderId);

    // Notify in thread
    const msgBody = `New deliverable ready for review: [${title}]\nAccess Link: ${file_url}${notes ? '\nNotes: ' + notes : ''}\n\nPlease check the Deliverables tab to download and click Approve or Request Revision.`;
    const msgId = id('msg');
    const fromMasked = `order-${order.id}-c@${config.smtpDomain}`;
    const toMasked = `order-${order.id}-v@${config.smtpDomain}`;

    db.prepare(`
      INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
      VALUES (?, ?, ?, ?, ?, ?, 'client')
    `).run(msgId, orderId, user.id, msgBody, fromMasked, toMasked);

    // Send email to client
    await sendRelayedEmail({
      toRealEmail: order.client_email,
      maskedFromEmail: toMasked,
      subject: `Deliverable Ready for Review: ${title} (Order #${order.id})`,
      textBody: msgBody,
      orderId: order.id,
      isToClient: true
    });

    return reply.send({ ok: true, deliverable_id: delivId });
  });

  // 7. Client Review Deliverable (Approve or Request Revision)
  fastify.post('/api/orders/:id/deliverables/:delivId/review', { preHandler: requireAuth }, async (req, reply) => {
    const { id: orderId, delivId } = req.params;
    const { action, feedback = '' } = req.body || {};
    const db = getDb();
    const user = req.user;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    if (user.role === 'client' && order.client_id !== user.id) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const deliv = db.prepare('SELECT * FROM deliverables WHERE id = ? AND order_id = ?').get(delivId, orderId);
    if (!deliv) {
      return reply.status(404).send({ error: 'Deliverable not found' });
    }

    if (!['approve', 'request_revision'].includes(action)) {
      return reply.status(400).send({ error: 'action must be approve or request_revision' });
    }

    let newDelivStatus = '';
    let newOrderStatus = order.status;
    let reviewMessage = '';

    if (action === 'approve') {
      newDelivStatus = 'approved';
      reviewMessage = `Client approved deliverable: [${deliv.title}].${feedback ? '\nFeedback: ' + feedback : ''}`;
      
      // Check if all deliverables for this order are approved
      db.prepare(`
        UPDATE deliverables 
        SET status = 'approved', client_feedback = ?, reviewed_at = datetime('now')
        WHERE id = ?
      `).run(feedback, delivId);

      const unapproved = db.prepare(`
        SELECT COUNT(*) as count FROM deliverables 
        WHERE order_id = ? AND status != 'approved'
      `).get(orderId).count;

      if (unapproved === 0) {
        newOrderStatus = 'completed';
        db.prepare("UPDATE orders SET status = 'completed', updated_at = datetime('now') WHERE id = ?").run(orderId);
      }
    } else {
      newDelivStatus = 'revision_requested';
      newOrderStatus = 'in_progress';
      reviewMessage = `Client requested revision for [${deliv.title}].\nRevision Notes: ${feedback || 'Please review required modifications.'}`;

      db.prepare(`
        UPDATE deliverables 
        SET status = 'revision_requested', client_feedback = ?, reviewed_at = datetime('now')
        WHERE id = ?
      `).run(feedback, delivId);

      db.prepare("UPDATE orders SET status = 'in_progress', updated_at = datetime('now') WHERE id = ?").run(orderId);
    }

    // Add message to thread
    const msgId = id('msg');
    const fromMasked = `order-${order.id}-v@${config.smtpDomain}`;
    const toMasked = `order-${order.id}-c@${config.smtpDomain}`;

    db.prepare(`
      INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
      VALUES (?, ?, ?, ?, ?, ?, 'client')
    `).run(msgId, orderId, user.id, reviewMessage, fromMasked, toMasked);

    // Notify staff
    const staffTarget = order.manager_id 
      ? db.prepare('SELECT email FROM users WHERE id = ?').get(order.manager_id)?.email
      : config.admin.email;

    if (staffTarget) {
      await sendRelayedEmail({
        toRealEmail: staffTarget,
        maskedFromEmail: toMasked,
        subject: `Deliverable ${action === 'approve' ? 'Approved' : 'Revision Requested'} - Order #${order.id}`,
        textBody: reviewMessage,
        orderId: order.id,
        isToClient: false
      });
    }

    return reply.send({
      ok: true,
      deliverable_status: newDelivStatus,
      order_status: newOrderStatus
    });
  });

  // 8. List Messages for Order
  fastify.get('/api/orders/:id/messages', { preHandler: requireAuth }, async (req, reply) => {
    const { id: orderId } = req.params;
    const db = getDb();
    const user = req.user;

    const order = db.prepare('SELECT client_id FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    if (user.role === 'client' && order.client_id !== user.id) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    let messages = [];
    if (user.role === 'client') {
      // Clients only see public messages
      messages = db.prepare(`
        SELECT m.*, u.display_name as author_name, u.role as author_role
        FROM messages m
        JOIN users u ON m.author_id = u.id
        WHERE m.order_id = ? AND m.kind = 'client'
        ORDER BY m.created_at ASC
      `).all(orderId);
    } else {
      // Staff sees both public and internal notes
      messages = db.prepare(`
        SELECT m.*, u.display_name as author_name, u.role as author_role
        FROM messages m
        JOIN users u ON m.author_id = u.id
        WHERE m.order_id = ?
        ORDER BY m.created_at ASC
      `).all(orderId);
    }

    return reply.send({ ok: true, messages });
  });

  // 9. Post Message in Thread (with 2-Way Email Masking Forwarding)
  fastify.post('/api/orders/:id/messages', { preHandler: requireAuth }, async (req, reply) => {
    const { id: orderId } = req.params;
    const { body, kind = 'client' } = req.body || {};
    const db = getDb();
    const user = req.user;

    if (!body || !body.trim()) {
      return reply.status(400).send({ error: 'Message body cannot be empty' });
    }

    const order = db.prepare(`
      SELECT o.*, c.email as client_email, c.display_name as client_name
      FROM orders o
      JOIN users c ON o.client_id = c.id
      WHERE o.id = ?
    `).get(orderId);

    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    if (user.role === 'client' && order.client_id !== user.id) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    // Clients cannot post internal notes
    const messageKind = user.role === 'client' ? 'client' : (kind === 'internal' ? 'internal' : 'client');

    const msgId = id('msg');
    const fromMasked = user.role === 'client' 
      ? `order-${order.id}-v@${config.smtpDomain}`
      : `order-${order.id}-c@${config.smtpDomain}`;
    
    const toMasked = user.role === 'client'
      ? `order-${order.id}-c@${config.smtpDomain}`
      : `order-${order.id}-v@${config.smtpDomain}`;

    db.prepare(`
      INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(msgId, orderId, user.id, body.trim(), fromMasked, toMasked, messageKind);

    // Forward email via masked relay
    if (messageKind === 'client') {
      if (user.role === 'client') {
        // Forward to assigned crew or manager
        const staffItem = db.prepare(`
          SELECT u.email FROM order_items oi
          JOIN users u ON oi.assigned_crew_id = u.id
          WHERE oi.order_id = ? AND oi.assigned_crew_id IS NOT NULL
          LIMIT 1
        `).get(orderId);

        const targetEmail = staffItem?.email || 
          (order.manager_id ? db.prepare('SELECT email FROM users WHERE id = ?').get(order.manager_id)?.email : null) ||
          config.admin.email;

        await sendRelayedEmail({
          toRealEmail: targetEmail,
          maskedFromEmail: toMasked,
          subject: `New Message for Order #${order.id}`,
          textBody: body.trim(),
          orderId: order.id,
          isToClient: false
        });
      } else {
        // Staff sent message -> Forward to client
        await sendRelayedEmail({
          toRealEmail: order.client_email,
          maskedFromEmail: toMasked,
          subject: `New Message for Order #${order.id}`,
          textBody: body.trim(),
          orderId: order.id,
          isToClient: true
        });
      }
    }

    return reply.send({
      ok: true,
      message: {
        id: msgId,
        order_id: orderId,
        author_id: user.id,
        author_name: user.display_name,
        author_role: user.role,
        body: body.trim(),
        kind: messageKind,
        created_at: new Date().toISOString()
      }
    });
  });

  // 10. List Staff / Crew Users (Manager / Admin only)
  fastify.get('/api/users/staff', { preHandler: requireAuth }, async (req, reply) => {
    if (req.user.role === 'client') {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const db = getDb();
    const staff = db.prepare(`
      SELECT id, email, role, display_name
      FROM users
      WHERE role IN ('manager', 'crew', 'admin')
      ORDER BY role ASC, display_name ASC
    `).all();

    return reply.send({ ok: true, staff });
  });

  // 11. Create Manual Order (Manager / Admin only)
  fastify.post('/api/orders/manual', { preHandler: requireRole('manager', 'admin') }, async (req, reply) => {
    const {
      client_email,
      client_name,
      service_name = 'Dedicated Specialist Pod',
      total_cents = 30000,
      brief = '',
      billing_cycle = 'one_time'
    } = req.body || {};

    if (!client_email || !client_email.includes('@')) {
      return reply.status(400).send({ error: 'Valid client email is required' });
    }

    const db = getDb();
    const cleanEmail = client_email.trim().toLowerCase();
    let user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(cleanEmail);
    if (!user) {
      const userId = id('usr');
      const dName = (client_name || cleanEmail.split('@')[0]).trim();
      db.prepare(`
        INSERT INTO users (id, email, role, display_name)
        VALUES (?, ?, 'client', ?)
      `).run(userId, cleanEmail, dName);
      user = { id: userId, email: cleanEmail };
    }

    const orderId = id('ord');
    db.prepare(`
      INSERT INTO orders (id, client_id, manager_id, status, brief, intake_data, total_cents, billing_cycle)
      VALUES (?, ?, ?, 'paid', ?, '{}', ?, ?)
    `).run(orderId, user.id, req.user.id, brief, total_cents, billing_cycle);

    // Default item
    const itemId = id('item');
    db.prepare(`
      INSERT INTO order_items (id, order_id, service_name, qty, status, notes)
      VALUES (?, ?, ?, 1, 'queued', 'Created via Admin panel')
    `).run(itemId, orderId, service_name);

    return reply.send({ ok: true, order_id: orderId });
  });
}
