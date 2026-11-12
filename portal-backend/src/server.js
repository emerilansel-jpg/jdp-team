import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyFormbody from '@fastify/formbody';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import { config } from './config.js';
import { getDb } from './db.js';
import { authenticate } from './middleware/auth.js';
import { authRoutes } from './routes/auth.js';
import { paypalWebhookRoutes } from './routes/webhook-paypal.js';
import { orderRoutes } from './routes/orders.js';
import { checkoutRoutes } from './routes/checkout.js';
import { affiliateRoutes } from './routes/affiliates.js';
import { startSmtpServer, stopSmtpServer } from './services/smtp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.env === 'production' ? 'info' : 'warn'
    }
  });

  // Ensure DB initialized
  getDb();

  // Plugins
  await app.register(fastifyCookie, {
    secret: config.cookieSecret
  });
  await app.register(fastifyFormbody);

  // Auth decorator / onRequest hook
  app.decorateRequest('user', null);
  app.addHook('onRequest', authenticate);

  // Serve static public assets
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/public/',
    dotfiles: 'ignore'
  });

  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/',
    dotfiles: 'ignore',
    decorateReply: false
  });

  // API Routes
  await app.register(authRoutes);
  await app.register(paypalWebhookRoutes);
  await app.register(orderRoutes);
  await app.register(checkoutRoutes);
  await app.register(affiliateRoutes);

  // Frontend HTML Page Routes
  app.get('/affiliate', (req, reply) => {
    return reply.sendFile('affiliate.html', publicDir);
  });

  app.get('/affiliate.html', (req, reply) => {
    return reply.sendFile('affiliate.html', publicDir);
  });

  app.get('/partner', (req, reply) => {
    return reply.sendFile('partner.html', publicDir);
  });

  app.get('/partner.html', (req, reply) => {
    return reply.sendFile('partner.html', publicDir);
  });

  app.get('/checkout', (req, reply) => {
    return reply.sendFile('checkout.html', publicDir);
  });

  app.get('/checkout.html', (req, reply) => {
    return reply.sendFile('checkout.html', publicDir);
  });

  app.get('/login', (req, reply) => {
    return reply.sendFile('login.html', publicDir);
  });

  app.get('/login.html', (req, reply) => {
    return reply.sendFile('login.html', publicDir);
  });

  app.get('/index.html', (req, reply) => {
    return reply.sendFile('index.html', publicDir);
  });

  app.get('/orders/:id', (req, reply) => {
    return reply.sendFile('index.html', publicDir);
  });

  app.get('/', (req, reply) => {
    return reply.sendFile('index.html', publicDir);
  });

  app.get('/health', (req, reply) => {
    return reply.send({ status: 'ok', service: 'portal.jdp.team', time: new Date().toISOString() });
  });

  app.get('/api/health', (req, reply) => {
    return reply.send({ status: 'ok', service: 'portal.jdp.team', time: new Date().toISOString() });
  });

  // SPA fallback for non-API, non-file GET/HEAD routes
  app.setNotFoundHandler((req, reply) => {
    const urlPath = (req.raw.url || req.url || '/').split('?')[0];
    const isReadMethod = req.method === 'GET' || req.method === 'HEAD';
    const isReservedPrefix =
      urlPath === '/api' ||
      urlPath.startsWith('/api/') ||
      urlPath === '/auth' ||
      urlPath.startsWith('/auth/') ||
      urlPath === '/public' ||
      urlPath.startsWith('/public/');
    const hasFileExtension = path.posix.basename(urlPath).includes('.');

    if (!isReadMethod || isReservedPrefix || hasFileExtension) {
      return reply.code(404).send({
        message: `Route ${req.method}:${req.url} not found`,
        error: 'Not Found',
        statusCode: 404
      });
    }

    return reply.code(200).sendFile('index.html', publicDir);
  });

  return app;
}

async function start() {
  try {
    const app = await buildApp();

    // Start Inbound SMTP Server
    startSmtpServer();

    // Start Fastify Web Server
    await app.listen({ port: config.port, host: config.host });
    console.log(`[JDP Portal] Web Server listening at http://${config.host}:${config.port}`);
    console.log(`[JDP Portal] Public portal URL: ${config.appUrl}`);

    const shutdown = async () => {
      console.log('\n[JDP Portal] Shutting down gracefully...');
      stopSmtpServer();
      await app.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[JDP Portal] Fatal error starting server:', err);
    process.exit(1);
  }
}

// Only start when invoked directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start();
}
