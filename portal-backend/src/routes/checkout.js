import crypto from 'node:crypto';
import { getDb, id } from '../db.js';
import { config } from '../config.js';
import { createPayPalOrder, getPayPalOrderDetails, getPayPalAccessToken, paypalApiBase } from '../services/paypal.js';

export const JDP_PACKAGES = [
  // 1. Hands-off PR Subscription (/checkout/pr)
  {
    id: 'pr-pro',
    service_slug: 'pr',
    service_name: 'Hands-off PR Subscription',
    tier_id: 'pro',
    tier_name: 'Pro',
    name: 'Hands-off PR Subscription — Pro (1 PR/mo)',
    category: 'PR Distribution',
    price_cents: 8000,
    price_display: '$80/mo',
    billing_cycle: 'monthly',
    badge: 'Starter Wire',
    description: '1 High-Impact Press Release syndication per month across 300+ major national & local media outlets.',
    deliverables: [
      '1 Professional PR Distribution / Month',
      'Syndication to 300+ Verified News Outlets & AP Affiliates',
      'High DA/DR Dofollow Brand Citations & Permanent Live Links',
      'Full PDF Proof-of-Placement Live URL Report (Within 48h)'
    ]
  },
  {
    id: 'pr-elite',
    service_slug: 'pr',
    service_name: 'Hands-off PR Subscription',
    tier_id: 'elite',
    tier_name: 'Elite',
    name: 'Hands-off PR Subscription — Elite (2 PR/mo)',
    category: 'PR Distribution',
    price_cents: 14000,
    price_display: '$140/mo',
    billing_cycle: 'monthly',
    badge: 'Popular for Growth',
    description: '2 Press Release distributions per month for bi-weekly brand visibility and link velocity.',
    deliverables: [
      '2 Professional PR Distributions / Month (Bi-weekly)',
      'AP News Affiliates, MarketWatch & Google News Syndication',
      'Editorial Formatting & Targeted Industry Geo-Distribution',
      'Full Interactive PDF Live Syndication Reports'
    ]
  },
  {
    id: 'pr-authority',
    service_slug: 'pr',
    service_name: 'Hands-off PR Subscription',
    tier_id: 'authority',
    tier_name: 'Authority',
    name: 'Hands-off PR Subscription — Authority (4 PR/mo)',
    category: 'PR Distribution',
    price_cents: 26000,
    price_display: '$260/mo',
    billing_cycle: 'monthly',
    badge: 'Weekly Syndication',
    description: '4 Press Release distributions per month (weekly releases) for serious brand authority and dominating AEO/GEO.',
    deliverables: [
      '4 Professional PR Distributions / Month (Weekly Releases)',
      'Broad National Syndication & Financial News Feeds',
      'Maximum Brand Entity Anchoring & Image/Logo Embedding',
      'Weekly Verification Reports & Index Monitoring'
    ]
  },
  {
    id: 'pr-authority-plus',
    service_slug: 'pr',
    service_name: 'Hands-off PR Subscription',
    tier_id: 'authority-plus',
    tier_name: 'Authority Plus',
    name: 'Hands-off PR Subscription — Authority Plus (8 PR/mo)',
    category: 'PR Distribution',
    price_cents: 48000,
    price_display: '$480/mo',
    billing_cycle: 'monthly',
    badge: 'Agency Scale',
    description: '8 Press Release distributions per month for multi-client agencies or aggressive authority campaigns.',
    deliverables: [
      '8 Professional PR Distributions / Month (Twice Weekly)',
      'Multi-Brand / Multi-URL Distribution Flexibility',
      'Dedicated Editorial Priority Turnaround (<24 Hours)',
      'White-Label Agency Client PDF Proof Bundles'
    ]
  },

  // 2. Hands-off SEO Content Writing (/checkout/content)
  {
    id: 'content-essential',
    service_slug: 'content',
    service_name: 'Hands-off SEO Content Writing',
    tier_id: 'essential',
    tier_name: 'Essential',
    name: 'Hands-off SEO Content Writing — Essential (1 Post/mo)',
    category: 'SEO Content Writing',
    price_cents: 3700,
    price_display: '$37/mo',
    billing_cycle: 'monthly',
    badge: 'Single Sprint',
    description: '1 Fully researched, entity-optimized long-form blog article (1,500+ words) with custom visuals and schema.',
    deliverables: [
      '1 Long-Form Entity Optimized Article (1,500+ Words)',
      'Primary & Semantic LSI Keyword Research Included',
      'Custom Featured Image & Structured Data Schema',
      'Direct CMS Draft Upload (WordPress/Ghost/Webflow) or Markdown'
    ]
  },
  {
    id: 'content-essential-plus',
    service_slug: 'content',
    service_name: 'Hands-off SEO Content Writing',
    tier_id: 'essential-plus',
    tier_name: 'Essential Plus',
    name: 'Hands-off SEO Content Writing — Essential Plus (4 Posts/mo)',
    category: 'SEO Content Writing',
    price_cents: 12700,
    price_display: '$127/mo',
    billing_cycle: 'monthly',
    badge: 'Weekly Publishing',
    description: '4 Long-form articles per month (1/week cadence) designed to build systematic topical authority.',
    deliverables: [
      '4 Deep-Dive Articles (1,500 to 2,000 Words Each)',
      'Internal Linking Plan & Topical Entity Mapping',
      'Custom Infographics & SEO Meta Descriptions',
      'Full QC Review by Senior Content Strategist'
    ]
  },
  {
    id: 'content-pro',
    service_slug: 'content',
    service_name: 'Hands-off SEO Content Writing',
    tier_id: 'pro',
    tier_name: 'Pro',
    name: 'Hands-off SEO Content Writing — Pro (12 Posts/mo)',
    category: 'SEO Content Writing',
    price_cents: 31700,
    price_display: '$317/mo',
    billing_cycle: 'monthly',
    badge: 'Most Popular',
    description: '12 Long-form articles per month (3/week). Perfect for growing niche sites and ambitious service brands.',
    deliverables: [
      '12 Semantic SEO Articles / Month (18,000+ Total Words)',
      'Comprehensive Keyword Cluster Strategy & Content Plan',
      'Surfer / Neuron / InLinks Semantic Grade A+ Alignment',
      'Direct Turnkey CMS Formatting, Interlinking & Upload'
    ]
  },
  {
    id: 'content-pro-plus',
    service_slug: 'content',
    service_name: 'Hands-off SEO Content Writing',
    tier_id: 'pro-plus',
    tier_name: 'Pro Plus',
    name: 'Hands-off SEO Content Writing — Pro Plus (20 Posts/mo)',
    category: 'SEO Content Writing',
    price_cents: 46700,
    price_display: '$467/mo',
    billing_cycle: 'monthly',
    badge: 'Daily Publishing',
    description: '20 Long-form articles per month (5/week business-day publishing cadence) for fast organic dominance.',
    deliverables: [
      '20 Articles / Month (30,000+ Total Words)',
      'Complete Pillar & Cluster Architecture Deployment',
      'Custom Comparison Tables & Visual Assets',
      'Dedicated English Lead Editor Oversight'
    ]
  },
  {
    id: 'content-elite',
    service_slug: 'content',
    service_name: 'Hands-off SEO Content Writing',
    tier_id: 'elite',
    tier_name: 'Elite',
    name: 'Hands-off SEO Content Writing — Elite (30 Posts/mo)',
    category: 'SEO Content Writing',
    price_cents: 58700,
    price_display: '$587/mo',
    billing_cycle: 'monthly',
    badge: '1 Article / Day',
    description: '30 Articles per month (1 piece every day) for rapid authority velocity across entire niche verticals.',
    deliverables: [
      '30 Comprehensive Articles / Month (45,000+ Words)',
      'Deep Competitor Content Gap Analysis Included',
      'Full White-Label Client Deliverables & Drive Sync',
      'Weekly Performance Review & Pipeline Adjustments'
    ]
  },
  {
    id: 'content-authority',
    service_slug: 'content',
    service_name: 'Hands-off SEO Content Writing',
    tier_id: 'authority',
    tier_name: 'Authority',
    name: 'Hands-off SEO Content Writing — Authority (90 Posts/mo)',
    category: 'SEO Content Writing',
    price_cents: 129700,
    price_display: '$1,297/mo',
    billing_cycle: 'monthly',
    badge: 'Enterprise Factory',
    description: '90 High-volume, programmatic-enhanced editorial articles per month for high-velocity affiliate & agency scale.',
    deliverables: [
      '90 Articles / Month (135,000+ Total Words)',
      'Multi-Author Persona Management & Formatting',
      'Turnkey Automated Publishing Schedule & Quality Gates',
      'Dedicated Senior Content Account Manager'
    ]
  },

  // 3. YouTube Listicle Subscription (/checkout/yt-listicle)
  {
    id: 'yt-pro',
    service_slug: 'yt-listicle',
    service_name: 'YouTube Listicle Subscription',
    tier_id: 'pro',
    tier_name: 'Pro',
    name: 'YouTube Listicle Subscription — Pro (10 Vids/mo)',
    category: 'Video Mentions (GEO)',
    price_cents: 12700,
    price_display: '$127/mo',
    billing_cycle: 'monthly',
    badge: 'Starter GEO Blast',
    description: '10 Guaranteed brand mentions in ranking niche YouTube listicle videos cited in Google AI Overviews & Perplexity.',
    deliverables: [
      '10 Ranked YouTube Listicle Placements / Month',
      'Targeted Keyword-Rich Video Descriptions & Timestamps',
      'Cited in Google AI Overviews, Gemini & Perplexity Search',
      'Direct Placement Live URL Verification Report'
    ]
  },
  {
    id: 'yt-elite',
    service_slug: 'yt-listicle',
    service_name: 'YouTube Listicle Subscription',
    tier_id: 'elite',
    tier_name: 'Elite',
    name: 'YouTube Listicle Subscription — Elite (20 Vids/mo)',
    category: 'Video Mentions (GEO)',
    price_cents: 19700,
    price_display: '$197/mo',
    billing_cycle: 'monthly',
    badge: 'Double Velocity',
    description: '20 Brand mentions across established ranking YouTube video roundups and comparative product listicles.',
    deliverables: [
      '20 Ranked YouTube Listicle Placements / Month',
      'Broader Topical & Commercial Intent Keyword Coverage',
      'Permanent Video Placements & Indexed Links',
      'Detailed Placement Report with Subscriber & View Counts'
    ]
  },
  {
    id: 'yt-authority',
    service_slug: 'yt-listicle',
    service_name: 'YouTube Listicle Subscription',
    tier_id: 'authority',
    tier_name: 'Authority',
    name: 'YouTube Listicle Subscription — Authority (50 Vids/mo)',
    category: 'Video Mentions (GEO)',
    price_cents: 39700,
    price_display: '$397/mo',
    billing_cycle: 'monthly',
    badge: 'High GEO Domination',
    description: '50 Placements across niche YouTube listicles to dominate video carousels and multi-modal generative AI answers.',
    deliverables: [
      '50 Ranked YouTube Listicle Placements / Month',
      'Maximum Penetration across Buying Guide & Review Queries',
      'Multi-Product / Multi-Landing Page Distribution',
      'Weekly Live URL Tracking & Video Snapshot Proof'
    ]
  },
  {
    id: 'yt-authority-plus',
    service_slug: 'yt-listicle',
    service_name: 'YouTube Listicle Subscription',
    tier_id: 'authority-plus',
    tier_name: 'Authority Plus',
    name: 'YouTube Listicle Subscription — Authority Plus (100 Vids/mo)',
    category: 'Video Mentions (GEO)',
    price_cents: 64700,
    price_display: '$647/mo',
    billing_cycle: 'monthly',
    badge: 'Agency Multi-Brand',
    description: '100 YouTube listicle placements per month for massive video search presence and high-ticket affiliate dominance.',
    deliverables: [
      '100 Ranked YouTube Listicle Placements / Month',
      'Dedicated Outreach & Syndication Pipeline',
      'White-Label Reporting Ready for Client Presentation',
      'Fastest Turnaround SLA with Priority Channel Queue'
    ]
  },

  // 4. Brand Entity Stacking (/checkout/entity-stacking)
  {
    id: 'entity-pro',
    service_slug: 'entity-stacking',
    service_name: 'Brand Entity Stacking',
    tier_id: 'pro',
    tier_name: 'Pro',
    name: 'Brand Entity Stacking — Pro',
    category: 'Entity & Knowledge Graph',
    price_cents: 20700,
    price_display: '$207/mo',
    billing_cycle: 'monthly',
    badge: 'Entity Core',
    description: 'Foundational Knowledge Graph establishment, Wikidata/Wikibase mapping, and foundational tier-1 authority node stack.',
    deliverables: [
      '1 Complete High-Authority Brand Entity Stack',
      'Google Knowledge Panel Identification & Wikidata Alignment',
      'SameAs Schema Architecture & WebID Interlinking',
      'Verified Google Cloud Natural Language Entity Score Check'
    ]
  },
  {
    id: 'entity-elite',
    service_slug: 'entity-stacking',
    service_name: 'Brand Entity Stacking',
    tier_id: 'elite',
    tier_name: 'Elite',
    name: 'Brand Entity Stacking — Elite',
    category: 'Entity & Knowledge Graph',
    price_cents: 33700,
    price_display: '$337/mo',
    billing_cycle: 'monthly',
    badge: 'Most Popular Entity',
    description: 'Multi-layer entity stack with citation nodes, Google Drive / Cloud stack syndication, and geo-relevance clustering.',
    deliverables: [
      'Multi-Tier Semantic Entity Stack & Google Cloud Assets',
      'Verified Topical Co-occurrence Alignment with Seed Entities',
      'High DR Profile Foundation & Social Signal Resonance',
      'Complete Schema Graph JSON-LD Injection Blueprint'
    ]
  },
  {
    id: 'entity-authority',
    service_slug: 'entity-stacking',
    service_name: 'Brand Entity Stacking',
    tier_id: 'authority',
    tier_name: 'Authority',
    name: 'Brand Entity Stacking — Authority',
    category: 'Entity & Knowledge Graph',
    price_cents: 65700,
    price_display: '$657/mo',
    billing_cycle: 'monthly',
    badge: 'Deep Knowledge Graph',
    description: 'Deep knowledge graph injection, multi-brand umbrella stacking, and extensive trusted semantic web verification.',
    deliverables: [
      'Enterprise Entity Stacking with Multi-Node Web Verification',
      'Knowledge Panel Triggering & Google Reconciliation Protocol',
      'Cross-Platform Entity Consistency (Crunchbase, Trustpilot, GMB)',
      'Monthly Entity Vector Score & Search Graph Audit Report'
    ]
  },
  {
    id: 'entity-authority-plus',
    service_slug: 'entity-stacking',
    service_name: 'Brand Entity Stacking',
    tier_id: 'authority-plus',
    tier_name: 'Authority Plus',
    name: 'Brand Entity Stacking — Authority Plus',
    category: 'Entity & Knowledge Graph',
    price_cents: 112700,
    price_display: '$1,127/mo',
    billing_cycle: 'monthly',
    badge: 'Maximum Authority',
    description: 'Full-spectrum entity domination across Google, Bing Copilot, ChatGPT Search, and Apple Knowledge Graph.',
    deliverables: [
      'Comprehensive Omni-Engine Knowledge Graph Injection',
      'Custom Entity Authority Nodes & High Authority Syndications',
      'Reputation Defense & Negative Entity Disambiguation',
      'Priority Dedicated Senior Knowledge Graph Engineer'
    ]
  },

  // 5. SEO Virtual Assistant (/checkout/seo-va)
  {
    id: 'va-junior-pt',
    service_slug: 'seo-va',
    service_name: 'SEO Virtual Assistant',
    tier_id: 'junior-pt',
    tier_name: 'Junior SEO VA — Part-Time',
    name: 'Junior SEO VA ($7/hr) — Part-Time (80h/mo)',
    category: 'Dedicated Staffing',
    price_cents: 56000,
    price_display: '$560/mo',
    rate_hourly: '$7.00/hr',
    billing_cycle: 'monthly',
    badge: '$7/hr Dedicated',
    description: '80 Dedicated hours/month (4h/day) of trained Junior SEO execution overseen by an English Lead Project Manager.',
    deliverables: [
      '80 Dedicated Specialist Hours / Month ($7/hr flat)',
      'Link Prospecting, Outreach Sprints & Data Scraping',
      'CMS Formatting, Metadata Uploads & Broken Link Fixes',
      'Daily Task Logging & Dedicated English PM Supervision'
    ]
  },
  {
    id: 'va-junior-ft',
    service_slug: 'seo-va',
    service_name: 'SEO Virtual Assistant',
    tier_id: 'junior-ft',
    tier_name: 'Junior SEO VA — Full-Time',
    name: 'Junior SEO VA ($7/hr) — Full-Time (160h/mo)',
    category: 'Dedicated Staffing',
    price_cents: 112000,
    price_display: '$1,120/mo',
    rate_hourly: '$7.00/hr',
    billing_cycle: 'monthly',
    badge: 'Full-Time Junior',
    description: '160 Dedicated hours/month (8h/day, 40h/week) for complete white-label agency execution and backlink operations.',
    deliverables: [
      '160 Dedicated Specialist Hours / Month ($7/hr flat)',
      'Full-Time Daily Operations: Outreach, CRM, SEO Hygiene',
      'Direct Slack Sync & In-Portal Sprint Management',
      'Lead PM Daily Quality Verification & Time Sheets'
    ]
  },
  {
    id: 'va-super-pt',
    service_slug: 'seo-va',
    service_name: 'SEO Virtual Assistant',
    tier_id: 'super-pt',
    tier_name: 'The Super Team — Part-Time',
    name: 'The Super Team ($10/hr) — Part-Time (80h/mo)',
    category: 'Dedicated Staffing',
    price_cents: 80000,
    price_display: '$800/mo',
    rate_hourly: '$10.00/hr',
    billing_cycle: 'monthly',
    badge: 'Senior QC + Junior Pod',
    description: '80 Hours/month combining senior technical strategy with rapid junior execution for the perfect high-output blend.',
    deliverables: [
      '80 Dedicated Blended Hours / Month ($10/hr flat)',
      'Senior Strategist Oversight + Rapid Junior Fulfillment',
      'Technical SEO Audits, Schema Deployments & Internal Linking',
      'Bi-Weekly Strategy Sync & White-Label Reporting'
    ]
  },
  {
    id: 'va-super-ft',
    service_slug: 'seo-va',
    service_name: 'SEO Virtual Assistant',
    tier_id: 'super-ft',
    tier_name: 'The Super Team — Full-Time',
    name: 'The Super Team ($10/hr) — Full-Time (160h/mo)',
    category: 'Dedicated Staffing',
    price_cents: 160000,
    price_display: '$1,600/mo',
    rate_hourly: '$10.00/hr',
    billing_cycle: 'monthly',
    badge: 'Most Popular Agency Pod',
    description: '160 Hours/month of our flagship Super Team model. Replaces 2 full-time in-house hires with a seamless remote squad.',
    deliverables: [
      '160 Dedicated Blended Hours / Month ($10/hr flat)',
      'Full Stack: Technical Audits, Content QC, PR & Outreach',
      'Autonomous Workflow: Works Directly in ClickUp/Asana/Slack',
      'Guaranteed SLA Turnaround & Dedicated Lead PM'
    ]
  },
  {
    id: 'va-senior-pt',
    service_slug: 'seo-va',
    service_name: 'SEO Virtual Assistant',
    tier_id: 'senior-pt',
    tier_name: 'Senior SEO VA — Part-Time',
    name: 'Senior SEO VA ($13/hr) — Part-Time (80h/mo)',
    category: 'Dedicated Staffing',
    price_cents: 104000,
    price_display: '$1,040/mo',
    rate_hourly: '$13.00/hr',
    billing_cycle: 'monthly',
    badge: 'Elite Technical',
    description: '80 Dedicated hours/month of an Elite Senior SEO Architect (Python, Screaming Frog, Log Analysis, Entity Optimization).',
    deliverables: [
      '80 Dedicated Senior Architect Hours / Month ($13/hr flat)',
      'Advanced Programmatic SEO, Python Scraping & Log Audits',
      'Semantic Search Architecture & AEO Optimization',
      'Direct Technical Leadership & Direct In-Portal Consultation'
    ]
  },
  {
    id: 'va-senior-ft',
    service_slug: 'seo-va',
    service_name: 'SEO Virtual Assistant',
    tier_id: 'senior-ft',
    tier_name: 'Senior SEO VA — Full-Time',
    name: 'Senior SEO VA ($13/hr) — Full-Time (160h/mo)',
    category: 'Dedicated Staffing',
    price_cents: 208000,
    price_display: '$2,080/mo',
    rate_hourly: '$13.00/hr',
    billing_cycle: 'monthly',
    badge: 'Enterprise SEO Lead',
    description: '160 Dedicated hours/month of top-1% senior SEO talent. Direct handling of enterprise migrations, architecture, and team training.',
    deliverables: [
      '160 Dedicated Senior Architect Hours / Month ($13/hr flat)',
      'Complete Autonomous SEO Leadership for High-Value Brands',
      'Custom AI Pipelines, n8n Automations & Data Engineering',
      'Direct White-Label Client Facing Calls (Optional)'
    ]
  },

  // Legacy/Simulated packages for backward test compatibility
  {
    id: 'tripwire-1usd',
    service_slug: 'test',
    service_name: '$1 Prove It Task',
    tier_id: 'tripwire',
    tier_name: 'Prove It',
    name: '$1 "Prove It" Agency Test Task (BFCM Special)',
    category: 'Test Task',
    price_cents: 100,
    price_display: '$1',
    rate_hourly: 'Test Sprint',
    billing_cycle: 'one_time',
    badge: '🔥 $1 Prove It Task',
    description: 'Zero-risk test task. Hand off 1 real client deliverable. 24–48h SLA turnaround with dedicated English PM.',
    deliverables: [
      'Choice: Topical Map, GEO Article, Entity Audit, or Tech VA Sprint',
      '24 to 48 Hours SLA Delivery',
      '1 Dedicated English PM Communication',
      '100% White-Label Client-Ready Deliverable'
    ]
  },
  {
    id: 'junior-pod',
    service_slug: 'seo-va',
    service_name: 'SEO Virtual Assistant',
    tier_id: 'junior-pod',
    tier_name: 'Junior Pod',
    name: 'Dedicated Junior Pod (160h/mo)',
    category: 'Dedicated Staffing',
    price_cents: 48000,
    price_display: '$480/mo',
    rate_hourly: '$3.00/hr',
    billing_cycle: 'monthly',
    badge: 'Wholesale Special',
    description: '1 Dedicated Junior Specialist + Lead PM oversight. Perfect for outreach, link insertions & data scraping.',
    deliverables: [
      '160 Dedicated Hours / Month',
      'Lead PM English Interface & Daily SLA',
      'Full White-Label Execution & Reporting',
      '2-Way Anonymized Email Relay'
    ]
  }
];

export const ORDER_BUMPS = [
  {
    id: 'bump-topical',
    name: 'Add Topical Authority 5-Pack Sprint',
    price_cents: 15000,
    price_display: '+$150',
    description: 'Supercharge your pod with 5 high-converting entity-rich articles ready for publishing.'
  },
  {
    id: 'bump-concierge',
    name: 'Add Priority 24/7 Slack Concierge',
    price_cents: 9000,
    price_display: '+$90/mo',
    description: 'Private agency Slack channel with direct <15 min response time from Senior Ops.'
  }
];

export async function checkoutRoutes(fastify, options) {
  // GET /api/checkout/packages - List available service packages & wholesale rate card
  fastify.get('/api/checkout/packages', async (req, reply) => {
    return reply.send({
      ok: true,
      packages: JDP_PACKAGES,
      orderBumps: ORDER_BUMPS
    });
  });

  // GET /api/paypal/config & /api/checkout/config - Public PayPal SDK configuration (client ID only, no secrets!)
  const getPayPalConfig = async (req, reply) => {
    return reply.send({
      ok: true,
      clientId: config.paypal.clientId || '',
      currency: 'USD',
      env: config.paypal.env || 'live'
    });
  };
  fastify.get('/api/paypal/config', getPayPalConfig);
  fastify.get('/api/checkout/config', getPayPalConfig);

  // POST /api/paypal/create-order - Live PayPal v2 Order Creation
  fastify.post('/api/paypal/create-order', async (req, reply) => {
    try {
      const {
        package_id,
        service_name,
        total_cents,
        ref,
        referral_code,
        customer_email,
        customer_name
      } = req.body || {};

      let amountCents = parseInt(total_cents, 10);
      let desc = (service_name && String(service_name).trim()) || '';

      if (package_id) {
        const pkg = JDP_PACKAGES.find(p => p.id === package_id);
        if (pkg) {
          if (!amountCents || amountCents <= 0) {
            amountCents = pkg.price_cents;
          }
          if (!desc) {
            desc = pkg.name;
          }
        }
      }

      if (!amountCents || amountCents <= 0) {
        amountCents = 8000; // default to $80 PR Pro
      }
      if (!desc) {
        desc = 'JDP Team Dedicated Fulfillment Package';
      }

      const refCode = (ref || referral_code || '').trim().toLowerCase();
      const customPayload = JSON.stringify({
        ref: refCode || undefined,
        pkg: package_id || undefined,
        email: customer_email || undefined
      });

      const ppOrder = await createPayPalOrder({
        amountCents,
        currency: 'USD',
        description: desc,
        customId: customPayload
      });

      return reply.send({
        ok: true,
        orderId: ppOrder.id,
        status: ppOrder.status
      });
    } catch (err) {
      console.error('[PayPal Create Order Error]', err);
      return reply.status(500).send({
        error: 'Failed to create PayPal order: ' + err.message
      });
    }
  });

  // POST /api/paypal/capture-order - Capture Approved PayPal Order & Auto-Provision Client
  fastify.post('/api/paypal/capture-order', async (req, reply) => {
    try {
      const {
        order_id: paypalOrderId,
        package_id,
        service_name,
        total_cents,
        billing_cycle = 'monthly',
        ref,
        referral_code,
        customer_email,
        customer_name,
        items = []
      } = req.body || {};

      if (!paypalOrderId) {
        return reply.status(400).send({ error: 'PayPal order_id is required' });
      }

      // Strict validation: PayPal order IDs are alphanumeric (max 32 chars)
      const safeOrderId = String(paypalOrderId).trim();
      if (!/^[A-Z0-9]{1,32}$/i.test(safeOrderId)) {
        return reply.status(400).send({ error: 'Invalid PayPal order_id format.' });
      }

      // Capture the PayPal Order — fully inlined: pinned PayPal host + pre-validated order ID (no SSRF surface)
      const paypalToken = await getPayPalAccessToken();
      const captureUrl = new URL(
        `/v2/checkout/orders/${encodeURIComponent(safeOrderId)}/capture`,
        paypalApiBase()
      );
      const PAYPAL_HOSTS = new Set(['api-m.paypal.com', 'api-m.sandbox.paypal.com']);
      if (captureUrl.protocol !== 'https:' || !PAYPAL_HOSTS.has(captureUrl.hostname)) {
        return reply.status(500).send({ error: 'Internal capture URL validation failed.' });
      }
      const captureHttpRes = await fetch(captureUrl.href, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paypalToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!captureHttpRes.ok) {
        const errBody = await captureHttpRes.text();
        return reply.status(502).send({
          error: `PayPal capture failed (${captureHttpRes.status}): ${errBody}`
        });
      }
      const captureResult = await captureHttpRes.json();

      if (captureResult.status !== 'COMPLETED') {
        return reply.status(400).send({
          error: `PayPal payment not completed. Current status: ${captureResult.status}`,
          details: captureResult
        });
      }

      // Extract client details from PayPal capture payload or request
      const payer = captureResult.payer || {};
      const captureEmail = (customer_email || payer.email_address || '').trim().toLowerCase();

      if (!captureEmail || !captureEmail.includes('@')) {
        return reply.status(400).send({ error: 'Payer email could not be determined from PayPal capture.' });
      }

      let payerDisplayName = (customer_name && customer_name.trim()) || '';
      if (!payerDisplayName && payer.name) {
        payerDisplayName = `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim();
      }
      if (!payerDisplayName) {
        payerDisplayName = captureEmail.split('@')[0];
      }

      // Extract captured amount
      let capturedAmountCents = parseInt(total_cents, 10);
      try {
        const captureUnit = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
        if (captureUnit?.amount?.value) {
          capturedAmountCents = Math.round(parseFloat(captureUnit.amount.value) * 100);
        }
      } catch {}

      if (!capturedAmountCents || capturedAmountCents <= 0) {
        capturedAmountCents = 8000;
      }

      // Determine package & description
      let brief = (service_name && String(service_name).trim()) || '';
      let cycle = billing_cycle === 'one_time' ? 'one_time' : 'monthly';
      if (package_id) {
        const pkg = JDP_PACKAGES.find(p => p.id === package_id);
        if (pkg) {
          if (!brief) brief = pkg.name;
          if (pkg.billing_cycle) cycle = pkg.billing_cycle;
        }
      }
      if (!brief) {
        brief = 'JDP Team Dedicated Remote Fulfillment Package';
      }

      const db = getDb();

      // Check referral code
      const refCode = (ref || referral_code || '').trim().toLowerCase();
      let affiliate = null;
      if (refCode) {
        affiliate = db.prepare("SELECT * FROM affiliates WHERE code = ? COLLATE NOCASE AND status = 'active'").get(refCode);
      }

      // 1. Resolve or provision client user
      let user = db.prepare('SELECT id, email, role, display_name FROM users WHERE email = ?').get(captureEmail);
      if (!user) {
        const userId = id('usr');
        db.prepare(`
          INSERT INTO users (id, email, role, display_name)
          VALUES (?, ?, 'client', ?)
        `).run(userId, captureEmail, payerDisplayName);
        user = { id: userId, email: captureEmail, role: 'client', display_name: payerDisplayName };
        console.log(`[PayPal Live] Auto-provisioned client: ${captureEmail} (${userId})`);
      } else if (payerDisplayName && user.display_name !== payerDisplayName) {
        db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(payerDisplayName, user.id);
        user.display_name = payerDisplayName;
      }

      // 2. Generate Order Record
      const newOrderId = id('ord');
      db.prepare(`
        INSERT INTO orders (id, client_id, status, brief, total_cents, paypal_order_id, billing_cycle, affiliate_id, referral_code)
        VALUES (?, ?, 'paid', ?, ?, ?, ?, ?, ?)
      `).run(
        newOrderId,
        user.id,
        brief,
        capturedAmountCents,
        paypalOrderId,
        cycle,
        affiliate ? affiliate.id : null,
        affiliate ? affiliate.code : (refCode || null)
      );

      // 3. Initial commission for affiliate if present
      if (affiliate && capturedAmountCents > 0) {
        const commRate = affiliate.commission_rate || 0.20;
        const commAmount = Math.round(capturedAmountCents * commRate);
        const commId = id('comm');
        db.prepare(`
          INSERT INTO affiliate_commissions (
            id, affiliate_id, order_id, paypal_event_id, gross_amount_cents,
            commission_rate, commission_amount_cents, currency, type, status,
            payout_due_at, notes
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, 'USD', 'initial', 'pending',
            datetime('now', '+7 days'), ?
          )
        `).run(
          commId,
          affiliate.id,
          newOrderId,
          paypalOrderId,
          capturedAmountCents,
          commRate,
          commAmount,
          `PayPal live checkout commission (Ref: ${affiliate.code})`
        );
      }

      // 4. Create Order Line Items
      if (Array.isArray(items) && items.length > 0) {
        for (const it of items) {
          const itemId = id('item');
          db.prepare(`
            INSERT INTO order_items (id, order_id, service_name, qty, status, notes)
            VALUES (?, ?, ?, ?, 'queued', ?)
          `).run(itemId, newOrderId, it.name || it.service_name || brief, it.qty || 1, it.notes || '');
        }
      } else {
        const itemId = id('item');
        db.prepare(`
          INSERT INTO order_items (id, order_id, service_name, qty, status, notes)
          VALUES (?, ?, ?, 1, 'queued', 'Initial line item from PayPal Live Checkout')
        `).run(itemId, newOrderId, brief);
      }

      // 5. Welcome notification message
      const msgId = id('msg');
      const fromMasked = `order-${newOrderId}-c@${config.smtpDomain}`;
      const toMasked = `order-${newOrderId}-v@${config.smtpDomain}`;
      const formattedAmount = '$' + (capturedAmountCents / 100).toFixed(2);
      const welcomeText =
        `🎉 Welcome to JDP Team! Payment confirmed (${formattedAmount} via PayPal Live).\n\n` +
        `Your dedicated fulfillment pod is now reserved. Next step: Please fill out the Project Intake Brief tab with your target requirements, guidelines, and access so your lead PM can schedule the kickoff sprint.`;

      db.prepare(`
        INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
        VALUES (?, ?, ?, ?, ?, ?, 'client')
      `).run(msgId, newOrderId, user.id, welcomeText, fromMasked, toMasked);

      // 6. Create user session & set auth cookie for immediate seamless portal access
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      db.prepare(`
        INSERT INTO sessions (token, user_id, expires_at, ip, ua)
        VALUES (?, ?, ?, ?, ?)
      `).run(sessionToken, user.id, expiresAt, req.ip, req.headers['user-agent'] || '');

      db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

      reply.setCookie('jdp_session', sessionToken, {
        path: '/',
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60
      });

      return reply.send({
        ok: true,
        order_id: newOrderId,
        redirect_url: `/orders/${newOrderId}`,
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role
        },
        message: 'Payment completed successfully! Redirecting to client portal...'
      });
    } catch (err) {
      console.error('[PayPal Capture Error]', err);
      return reply.status(500).send({
        error: 'Failed to capture PayPal order: ' + err.message
      });
    }
  });

  // POST /api/checkout/simulate - Instant Sandbox Purchase & Seamless Portal Login (for testing)
  fastify.post('/api/checkout/simulate', async (req, reply) => {
    const {
      email,
      name,
      company,
      service_name,
      total_cents,
      billing_cycle = 'monthly',
      items = [],
      ref,
      referral_code
    } = req.body || {};

    if (!email || !email.includes('@')) {
      return reply.status(400).send({ error: 'Valid client email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0];
    const brief = (service_name && service_name.trim()) || 'Dedicated Junior Pod (160h/mo)';
    const amountCents = typeof total_cents === 'number' && total_cents > 0 ? total_cents : 48000;
    const cycle = billing_cycle === 'one_time' ? 'one_time' : 'monthly';

    const db = getDb();

    // Check referral code
    const refCode = (ref || referral_code || '').trim().toLowerCase();
    let affiliate = null;
    if (refCode) {
      affiliate = db.prepare("SELECT * FROM affiliates WHERE code = ? COLLATE NOCASE AND status = 'active'").get(refCode);
    }

    // 1. Resolve or provision client user
    let user = db.prepare('SELECT id, email, role, display_name FROM users WHERE email = ?').get(cleanEmail);
    if (!user) {
      const userId = id('usr');
      db.prepare(`
        INSERT INTO users (id, email, role, display_name)
        VALUES (?, ?, 'client', ?)
      `).run(userId, cleanEmail, cleanName);
      user = { id: userId, email: cleanEmail, role: 'client', display_name: cleanName };
    } else if (cleanName && user.display_name !== cleanName) {
      db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(cleanName, user.id);
      user.display_name = cleanName;
    }

    // 2. Generate Order Record
    const orderId = id('ord');
    const mockPaypalOrderId = 'SIM_PP_' + crypto.randomBytes(6).toString('hex').toUpperCase();
    const mockPaypalSubId = cycle === 'monthly' ? 'I-SIM-' + crypto.randomBytes(6).toString('hex').toUpperCase() : null;

    db.prepare(`
      INSERT INTO orders (id, client_id, status, brief, total_cents, paypal_order_id, paypal_subscription_id, billing_cycle, affiliate_id, referral_code)
      VALUES (?, ?, 'paid', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      user.id,
      brief,
      amountCents,
      mockPaypalOrderId,
      mockPaypalSubId,
      cycle,
      affiliate ? affiliate.id : null,
      affiliate ? affiliate.code : (refCode || null)
    );

    // Initial commission for affiliate
    if (affiliate && amountCents > 0) {
      const commRate = affiliate.commission_rate || 0.20;
      const commAmount = Math.round(amountCents * commRate);
      const commId = id('comm');
      db.prepare(`
        INSERT INTO affiliate_commissions (
          id, affiliate_id, order_id, paypal_event_id, gross_amount_cents,
          commission_rate, commission_amount_cents, currency, type, status,
          payout_due_at, notes
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, 'USD', 'initial', 'pending',
          datetime('now', '+7 days'), ?
        )
      `).run(
        commId,
        affiliate.id,
        orderId,
        mockPaypalOrderId,
        amountCents,
        commRate,
        commAmount,
        `Simulated checkout commission (Ref: ${affiliate.code})`
      );
    }

    // 3. Create Order Line Items
    if (Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        const itemId = id('item');
        db.prepare(`
          INSERT INTO order_items (id, order_id, service_name, qty, status, notes)
          VALUES (?, ?, ?, ?, 'queued', ?)
        `).run(itemId, orderId, it.name || it.service_name || brief, it.qty || 1, it.notes || '');
      }
    } else {
      const itemId = id('item');
      db.prepare(`
        INSERT INTO order_items (id, order_id, service_name, qty, status, notes)
        VALUES (?, ?, ?, 1, 'queued', 'Initial line item from simulated checkout')
      `).run(itemId, orderId, brief);
    }

    // 4. Create initial welcome notification message
    const msgId = id('msg');
    const fromMasked = `order-${orderId}-c@${config.smtpDomain}`;
    const toMasked = `order-${orderId}-v@${config.smtpDomain}`;
    const formattedAmount = '$' + (amountCents / 100).toFixed(2);
    const welcomeText =
      `🎉 Welcome to JDP Team! Payment simulation confirmed (${formattedAmount} via PayPal Sandbox).\n\n` +
      `Your dedicated fulfillment pod is now reserved. Next step: Please fill out the Project Intake Brief tab with your target requirements, guidelines, and access so your lead PM can schedule the kickoff sprint.`;

    db.prepare(`
      INSERT INTO messages (id, order_id, author_id, body, from_email_masked, to_email_masked, kind)
      VALUES (?, ?, ?, ?, ?, ?, 'client')
    `).run(msgId, orderId, user.id, welcomeText, fromMasked, toMasked);

    // 5. Create user session & set auth cookie for immediate seamless portal access
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, ip, ua)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionToken, user.id, expiresAt, req.ip, req.headers['user-agent'] || '');

    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

    reply.setCookie('jdp_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60
    });

    return reply.send({
      ok: true,
      order_id: orderId,
      redirect_url: `/orders/${orderId}`,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role
      },
      message: 'Simulated payment completed! Redirecting to client portal...'
    });
  });
}
