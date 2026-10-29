const fs = require('fs');
const path = require('path');

const src = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');

// 1. Head and Header up to end of Verified Credentials
const headAndHeaderEndIdx = src.indexOf('<!-- Proof Stat Band (real case-study numbers) -->');
if (headAndHeaderEndIdx === -1) {
  console.error("Marker 1 not found");
  process.exit(1);
}
const headAndHeader = src.substring(0, headAndHeaderEndIdx);

// Extract AI-Human Bridge
const aiBridgeStart = src.indexOf('<!-- AI → Human Bridge (Benefit 2) -->');
const aiBridgeEnd = src.indexOf('<!-- Featured Services Preview (Agency Wholesale Storefront) -->');
if (aiBridgeStart === -1 || aiBridgeEnd === -1) {
  console.error("AI Bridge markers not found");
  process.exit(1);
}
let aiBridge = src.substring(aiBridgeStart, aiBridgeEnd).trim();

// Enhance AI Bridge Step 4 copy for connected white-label delivery
aiBridge = aiBridge.replace(
  '<h3 class="font-extrabold text-white text-base mb-1.5">Delivered Under Your Brand</h3>\n            <p class="text-xs text-slate-400 leading-relaxed">Track progress live in your dashboard. Completed work arrives with timestamps &amp; screenshots — ready to deliver straight to your client.</p>',
  '<h3 class="font-extrabold text-white text-base mb-1.5">White-Label QA &amp; Handover</h3>\n            <p class="text-xs text-slate-400 leading-relaxed">Your Dedicated PM audits SOP quality, scrubs all vendor metadata, and returns client-ready deliverables ready for your agency logo.</p>'
);

// Extract Workflow section (How it works)
const workflowStart = src.indexOf('<!-- 1 Dedicated PM Workflow Diagram -->');
const workflowEnd = src.indexOf('<!-- The Operational Shift: Side-by-Side Contrast Comparison -->');
if (workflowStart === -1 || workflowEnd === -1) {
  console.error("Workflow markers not found");
  process.exit(1);
}
let workflow = src.substring(workflowStart, workflowEnd).trim();

// Update Node 3 & Node 4 in Workflow to be strongly connected
const oldNode3and4 = `<div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1" data-node-id="node-exec" data-downstream="node-delivery">
            <span class="node-port absolute -left-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <span class="node-port absolute -right-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">Stage 03</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xl mb-3 font-bold">
                ⚡
              </div>
              <h3 class="font-extrabold text-slate-950 text-base">Execution Specialists</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Junior, Senior & SEO specialists.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
              <span class="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span>AI Conductors + human rigor</span>
            </div>
          </div>

          <!-- Node 4: White-Label Delivery -->
          <div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1" data-node-id="node-delivery" data-downstream="">
            <span class="node-port absolute -left-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">Final Gate</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl mb-3 font-bold">
                🚀
              </div>
              <h3 class="font-extrabold text-slate-950 text-base">White-Label Delivery</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Client-ready work under your brand.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>100% confidential NDA</span>
            </div>
          </div>`;

const newNode3and4 = `<div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1" data-node-id="node-exec" data-downstream="node-delivery">
            <span class="node-port absolute -left-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <span class="node-port absolute -right-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">Stage 03 · Execution</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xl mb-3 font-bold">
                🛠️
              </div>
              <h3 class="font-extrabold text-slate-950 text-base">Specialist Execution</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Vetted human operators log into client staging or sheets, execute manual tasks, and record timestamped proof.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-indigo-700">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>Pure Execution</span>
              <span class="text-[10px] text-slate-500">Zero client contact</span>
            </div>
          </div>

          <!-- Node 4: White-Label Delivery -->
          <div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-white border-2 border-emerald-400 shadow-sm flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1" data-node-id="node-delivery" data-downstream="">
            <span class="node-port absolute -left-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">Stage 04 · Handover</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl mb-3 font-bold">
                📦
              </div>
              <h3 class="font-extrabold text-slate-950 text-base">White-Label Delivery</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Your PM audits SOP quality, scrubs all vendor metadata, and packages client-ready assets under your agency logo.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>100% Unbranded</span>
              <span class="text-[10px] text-emerald-600 font-bold">Zero Leak NDA</span>
            </div>
          </div>`;

workflow = workflow.replace(oldNode3and4, newNode3and4);

// Replace the old Task simulation terminal with the rich Service Order Fulfillment Demo
const simStart = workflow.indexOf('<!-- Interactive Live Task Simulation Stream -->');
if (simStart !== -1) {
  const newServiceDemo = `<!-- Live Service Order & Delivery Tracker (Interactive Service Fulfillment Demo) -->
        <div class="mt-12 rounded-3xl bg-slate-950 p-6 sm:p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          <div class="absolute inset-0 opacity-[0.05] pointer-events-none" style="background-image: radial-gradient(#93c5fd 1px, transparent 1px); background-size: 24px 24px;"></div>
          
          <div class="relative z-10">
            <!-- Demo Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    Live Service Fulfillment Demo
                  </span>
                  <span class="text-xs font-mono text-slate-400" id="demoOrderNumber">Order #WL-9421</span>
                </div>
                <h3 class="text-lg sm:text-xl font-black text-white" id="demoServiceName">WordPress Article Staging &amp; Formatting (10 Posts)</h3>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span id="demoOrderStatus">Delivered · 100% White-Label</span>
                </span>
                <span class="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800" id="demoSlaTime">Completed in 4h 15m (24h SLA)</span>
              </div>
            </div>

            <!-- Service Switcher Interactive Tabs -->
            <div class="py-4 border-b border-slate-800/80 flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Try Real Routine Services:</span>
              <button type="button" onclick="switchServiceDemo(0)" id="demoTab0" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white transition shadow-sm">📰 WordPress Staging ($49)</button>
              <button type="button" onclick="switchServiceDemo(1)" id="demoTab1" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition">🧹 CRM Hygiene &amp; Leads ($40)</button>
              <button type="button" onclick="switchServiceDemo(2)" id="demoTab2" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition">⚡ Core Web Vitals Fix ($99)</button>
            </div>

            <!-- Fulfillment Team & Margin Grid -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 border-b border-slate-800/80">
              <!-- Team Pod -->
              <div class="md:col-span-6 space-y-3">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned White-Label Pod:</div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-xl bg-slate-900/90 border border-slate-800 p-3 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-base shrink-0">👔</div>
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-white truncate" id="demoPmName">Sarah M.</div>
                      <div class="text-[10px] text-slate-400 truncate">Dedicated PM · White-Label QA</div>
                    </div>
                  </div>
                  <div class="rounded-xl bg-slate-900/90 border border-slate-800 p-3 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-base shrink-0">🛠️</div>
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-white truncate" id="demoSpecName">Ryan T.</div>
                      <div class="text-[10px] text-slate-400 truncate">Vetted WordPress Specialist</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Margin & Reseller Math -->
              <div class="md:col-span-6 space-y-3">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Agency Reseller Economics:</div>
                <div class="rounded-xl bg-slate-900/90 border border-slate-800 p-3 flex items-center justify-between gap-4">
                  <div>
                    <div class="text-[10px] text-slate-400 font-semibold uppercase">Wholesale Cost</div>
                    <div class="text-base font-black text-white" id="demoWholesalePrice">$49.00</div>
                  </div>
                  <div class="text-slate-600 font-bold">→</div>
                  <div>
                    <div class="text-[10px] text-slate-400 font-semibold uppercase">You Bill Client</div>
                    <div class="text-base font-black text-slate-200" id="demoClientPrice">$250.00</div>
                  </div>
                  <div class="text-slate-600 font-bold">=</div>
                  <div class="text-right">
                    <div class="text-[10px] text-emerald-400 font-bold uppercase">Your Agency Profit</div>
                    <div class="text-base font-black text-emerald-400" id="demoAgencyProfit">+$201.00 (80.4%)</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Real Service Delivery Deliverables / Proof -->
            <div class="pt-5">
              <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Completed Deliverables (What your agency receives):</span>
                <span class="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <span>✓</span> All JDP identity scrubbed
                </span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="demoDeliverablesList">
                <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                  <span class="text-emerald-400 font-bold">✓</span>
                  <span>10 articles formatted into WordPress drafts with H2/H3 styling</span>
                </div>
                <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                  <span class="text-emerald-400 font-bold">✓</span>
                  <span>Featured &amp; body images converted to WebP + alt tags configured</span>
                </div>
                <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                  <span class="text-emerald-400 font-bold">✓</span>
                  <span>Internal links added + Yoast / RankMath green score confirmed</span>
                </div>
                <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                  <span class="text-emerald-400 font-bold">✓</span>
                  <span>Unbranded Loom walkthrough link ready to forward to client</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
  </section>`;

  workflow = workflow.substring(0, simStart) + newServiceDemo;
}

// Extract Comparison section
const compStart = src.indexOf('<!-- The Operational Shift: Side-by-Side Contrast Comparison -->');
const caseStudiesStart = src.indexOf('<section class="py-16 md:py-24 bg-surface-subtle border-b border-slate-200 reveal-on-scroll">\n    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\n      <div class="text-center max-w-3xl mx-auto mb-14">\n        <span class="text-xs uppercase tracking-widest font-bold text-brand-600">Case Studies</span>');
if (compStart === -1 || caseStudiesStart === -1) {
  console.error("Comparison / Case studies start not found");
  process.exit(1);
}
let comparison = src.substring(compStart, caseStudiesStart).trim();

// Extract Storefront section
const storeStart = src.indexOf('<!-- Featured Services Preview (Agency Wholesale Storefront) -->');
const faqStart = src.indexOf('<!-- FAQ Accordion -->');
if (storeStart === -1 || faqStart === -1) {
  console.error("Storefront or FAQ not found");
  process.exit(1);
}
let storefront = src.substring(storeStart, faqStart).trim();

// Clean any accidental extra closing tags in storefront
storefront = storefront.replace(/<\/div>\s*<\/section>\s*<\/div>\s*<\/section>$/, '</div>\n  </section>');

// Update Storefront copy to White-Label Wholesale Services
storefront = storefront.replace(
  '🛒 Agency Wholesale Storefront',
  '🛒 White-Label Wholesale Storefront'
);
storefront = storefront.replace(
  '<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-700">Buy per-task. Instant delivery.</span>',
  '<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-700">Buy per-task at wholesale rates.</span>'
);
storefront = storefront.replace(
  'Why burn 6 hours of your own day or pay $4,000/mo for full-time payroll? Pick the exact deliverable you need right now, checkout in 60 seconds, and our operators fulfill it behind the scenes under your brand.',
  'White-label wholesale pricing — buy fixed-scope deliverables at pure production cost, rebrand 100%, and resell to your clients at 3x–5x margins. Delivered with SLA-guaranteed turnaround.'
);

// Extract Calculator section
const calcStart = src.indexOf('<!-- Interactive Mini Task Calculator Preview -->');
const testStart = src.indexOf('<!-- Featured Testimonials Grid with REAL Client Photo Avatars -->');
if (calcStart === -1 || testStart === -1) {
  console.error("Calculator or Testimonials not found");
  process.exit(1);
}
let calculator = src.substring(calcStart, testStart).trim();
// Ensure id="calculator" on calculator section
calculator = calculator.replace(
  '<section class="py-16 md:py-24 bg-white border-b border-slate-200 reveal-on-scroll">',
  '<section id="calculator" class="py-16 md:py-24 bg-white border-b border-slate-200 reveal-on-scroll">'
);

// Extract Proof Stat Band
const proofStatStart = src.indexOf('<!-- Proof Stat Band (real case-study numbers) -->');
const proofStatEnd = src.indexOf('<!-- 1 Dedicated PM Workflow Diagram -->');
const proofStatBand = src.substring(proofStatStart, proofStatEnd).trim();

// Extract Case Studies
const caseStudiesEnd = src.indexOf('<!-- Interactive Mini Task Calculator Preview -->');
const caseStudies = src.substring(caseStudiesStart, caseStudiesEnd).trim();

// Combine Proof Stat Band + Case Studies under one cohesive Proof section
const combinedProof = `<!-- Real Client Proof & Case Studies Section -->
  ${proofStatBand}

  <!-- Real Client Case Studies Grid -->
  ${caseStudies}`;

// Extract Founder Block
const founderStart = src.indexOf('<!-- Real Founder Authority Block: Nell VH -->');
const founderEnd = src.indexOf('<!-- AI → Human Bridge (Benefit 2) -->');
const founder = src.substring(founderStart, founderEnd).trim();

// Extract Testimonials
const testimonialsEnd = src.indexOf('<!-- Real Founder Authority Block: Nell VH -->');
const testimonials = src.substring(testStart, testimonialsEnd).trim();

// Combine Founder + Testimonials into Authority & Social Proof block
const combinedAuthority = `<!-- Founder Authority Block -->
  ${founder}

  <!-- Verified Agency Founder Reviews -->
  ${testimonials}`;

// Extract FAQ, Bottom CTA, Footer, and Scripts
const bottomCtaStart = src.indexOf('<!-- Bottom CTA Section -->');
const footerStart = src.indexOf('<!-- Consistent Footer -->');
const scriptsStart = src.indexOf('<!-- Mini Calculator Logic & Mobile Menu Toggle Script -->');

const faq = src.substring(faqStart, bottomCtaStart).trim();
const bottomCta = src.substring(bottomCtaStart, footerStart).trim();
let footer = src.substring(footerStart, scriptsStart).trim();

// Update Footer logo to Wordmark
footer = footer.replace(
  `<div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-sm">
              J
            </div>
            <span class="font-extrabold text-slate-950 text-base">JDP.team</span>
          </div>`,
  `<div class="flex items-center gap-2">
            <span class="font-black text-slate-950 text-xl tracking-[-0.04em]">JDP<span class="text-brand-600 font-extrabold">.team</span></span>
            <span class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-900 text-white shadow-xs">White-Label</span>
          </div>`
);

let scripts = src.substring(scriptsStart);

// Append switchServiceDemo interactive script before </body>
const serviceDemoScript = `
  // Interactive Service Fulfillment Demo Switcher
  const demoServices = [
    {
      orderNum: "Order #WL-9421",
      name: "WordPress Article Staging & Formatting (10 Posts)",
      sla: "Completed in 4h 15m (24h SLA)",
      status: "Delivered · 100% White-Label",
      pm: "Sarah M.",
      pmRole: "Dedicated PM · White-Label QA",
      spec: "Ryan T.",
      specRole: "Vetted WordPress Specialist",
      wholesale: "$49.00",
      retail: "$250.00",
      profit: "+$201.00 (80.4%)",
      deliverables: [
        "10 articles formatted into WordPress drafts with H2/H3 styling",
        "Featured & body images converted to WebP + alt tags configured",
        "Internal links added + Yoast / RankMath green score confirmed",
        "Unbranded Loom walkthrough link ready to forward to client"
      ]
    },
    {
      orderNum: "Order #WL-9422",
      name: "Lead Scraping & CRM Contact Hygiene (500 Leads)",
      sla: "Completed in 6h 30m (48h SLA)",
      status: "Delivered · 100% White-Label",
      pm: "David L.",
      pmRole: "Dedicated PM · Data Audit",
      spec: "Elena S.",
      specRole: "Senior Data & CRM Specialist",
      wholesale: "$40.00",
      retail: "$200.00",
      profit: "+$160.00 (80.0%)",
      deliverables: [
        "500 verified B2B decision-maker contacts with 0% bounce rate",
        "Cleaned CSV formatted to your client's exact HubSpot/GoHighLevel schema",
        "Enriched with LinkedIn URLs, verified company domains & phone numbers",
        "Unbranded QA summary sheet with bounce-test certificate"
      ]
    },
    {
      orderNum: "Order #WL-9423",
      name: "Core Web Vitals Speed Fix (Mobile 90+ Score)",
      sla: "Completed in 14h 20m (48h SLA)",
      status: "Delivered · 100% White-Label",
      pm: "Sarah M.",
      pmRole: "Dedicated PM · Performance QA",
      spec: "Kevin V.",
      specRole: "Technical Frontend Specialist",
      wholesale: "$99.00",
      retail: "$499.00",
      profit: "+$400.00 (80.2%)",
      deliverables: [
        "LCP & CLS hands-on code fixes applied on staging server",
        "Render-blocking CSS/JS deferred + image compression implemented",
        "Mobile PageSpeed score boosted from 38 to 92 (Green Vitals)",
        "Before/after PageSpeed audit PDF with zero JDP branding"
      ]
    }
  ];

  function switchServiceDemo(idx) {
    const data = demoServices[idx];
    if (!data) return;

    [0, 1, 2].forEach(i => {
      const btn = document.getElementById('demoTab' + i);
      if (btn) {
        if (i === idx) {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white transition shadow-sm";
        } else {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition";
        }
      }
    });

    const elOrder = document.getElementById('demoOrderNumber');
    const elName = document.getElementById('demoServiceName');
    const elSla = document.getElementById('demoSlaTime');
    const elStatus = document.getElementById('demoOrderStatus');
    const elPm = document.getElementById('demoPmName');
    const elSpec = document.getElementById('demoSpecName');
    const elWhole = document.getElementById('demoWholesalePrice');
    const elClient = document.getElementById('demoClientPrice');
    const elProfit = document.getElementById('demoAgencyProfit');
    const list = document.getElementById('demoDeliverablesList');

    if (elOrder) elOrder.textContent = data.orderNum;
    if (elName) elName.textContent = data.name;
    if (elSla) elSla.textContent = data.sla;
    if (elStatus) elStatus.textContent = data.status;
    if (elPm) elPm.textContent = data.pm;
    if (elSpec) elSpec.textContent = data.spec;
    if (elWhole) elWhole.textContent = data.wholesale;
    if (elClient) elClient.textContent = data.retail;
    if (elProfit) elProfit.textContent = data.profit;

    if (list) {
      list.innerHTML = data.deliverables.map(item => \`
        <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
          <span class="text-emerald-400 font-bold">✓</span>
          <span>\${item}</span>
        </div>
      \`).join('');
    }
  }
`;

scripts = scripts.replace('</body>', `<script>${serviceDemoScript}</script>\n</body>`);

// Assemble in perfect AIDA flow:
// ATTENTION:
// 1. Head and Header + Hero Section + Verified Trust Bar
// INTEREST:
// 2. AI → Human Bridge
// 3. 1 Dedicated PM Workflow + Live Service Demo
// 4. Operational Shift (Comparison)
// DESIRE:
// 5. White-Label Wholesale Storefront (#pricing)
// 6. Mini Task Calculator (#calculator)
// 7. Combined Proof & Case Studies (#proof)
// 8. Combined Founder Authority & Client Testimonials
// ACTION:
// 9. FAQ Accordion
// 10. Bottom CTA
// 11. Footer
// 12. Scripts

const fullAidaHtml = [
  headAndHeader,
  aiBridge,
  workflow,
  comparison,
  storefront,
  calculator,
  combinedProof,
  combinedAuthority,
  faq,
  bottomCta,
  footer,
  scripts
].join('\n\n');

fs.writeFileSync('index.html', fullAidaHtml, 'utf8');
console.log("Successfully generated index.html with AIDA flow!");
