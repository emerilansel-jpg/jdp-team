const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');

// =========================================================================
// 1. WORKFLOW SECTION: TIGHT STAGE 03 -> STAGE 04 CONNECTION WITH DATA ATTRIBUTES
//    & COMPACT PLAYABLE 5-SECOND DEMO
// =========================================================================
const workflowRegex = /<!-- 1 Dedicated PM Workflow Diagram -->[\s\S]*?<!-- The Operational Shift: Side-by-Side Contrast Comparison -->/;

const newWorkflowSection = `<!-- 1 Dedicated PM Workflow Diagram -->
  <section class="py-16 md:py-24 bg-surface-subtle border-b border-slate-200 reveal-on-scroll">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="text-xs uppercase tracking-widest font-bold text-brand-600">How It Works</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-2 tracking-tight">
          One PM, everything
        </h2>
        <p class="text-slate-600 mt-2 text-sm sm:text-base">
          Drop a brief to your Dedicated PM. Our specialists execute in the background. Your PM scrubs all vendor traces and delivers 100% white-label work to your client.
        </p>
      </div>

      <!-- Visual Workflow Diagram Box with Connected SVG Flow Layer -->
      <div class="workflow-canvas-container p-4 sm:p-8 mb-8 relative">
        <!-- Connecting SVG Pulse Network Layer -->
        <svg class="flow-svg-layer hidden lg:block" viewBox="0 0 1100 240" fill="none" preserveAspectRatio="none">
          <!-- Path 1: Client Input to Dedicated PM -->
          <path class="flow-path-base" d="M 235 120 C 270 120, 280 120, 315 120" />
          <path class="flow-path-pulse" d="M 235 120 C 270 120, 280 120, 315 120" />

          <!-- Path 2: Dedicated PM to Execution Pod -->
          <path class="flow-path-base" d="M 545 120 C 575 120, 585 120, 615 120" />
          <path class="flow-path-pulse" d="M 545 120 C 575 120, 585 120, 615 120" />

          <!-- Path 3: Execution Pod directly connected to White-Label Delivery via PM QA -->
          <path class="flow-path-base" d="M 845 120 C 875 120, 885 120, 915 120" />
          <path class="flow-path-pulse" d="M 845 120 C 875 120, 885 120, 915 120" />
        </svg>

        <!-- 4-Stage Interactive Gumloop Nodes Grid -->
        <div class="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:pb-0 items-stretch relative z-10 no-scrollbar touch-pan-x">

          <!-- Node 1: Client Task Input -->
          <div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1"
            data-node-id="node-input" data-downstream="node-pm,node-exec,node-delivery">
            <span class="node-port absolute -right-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">Stage 01</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center text-xl mb-3 font-bold">
                📥
              </div>
              <h3 class="font-extrabold text-slate-950 text-base">Client Task Input</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Drop your task brief via Slack, Loom, ClickUp, or API webhook. No clunky ticketing forms.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>10-sec brief handoff</span>
            </div>
          </div>

          <!-- Node 2: Dedicated PM Hub -->
          <div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1"
            data-node-id="node-pm" data-downstream="node-exec,node-delivery">
            <span class="node-port absolute -left-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <span class="node-port absolute -right-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-accent-500 text-slate-950">Core Hub</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center text-xl mb-3 shadow-inner">
                👔
              </div>
              <h3 class="font-extrabold text-white text-base">1 Dedicated PM Hub</h3>
              <p class="text-xs text-slate-300 mt-1 leading-relaxed">
                Your single operational brain. Scopes the brief, translates SOPs, and coordinates the Indonesian specialists.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-medium text-accent-300">
              <span class="w-2 h-2 rounded-full bg-accent-400 task-pulse inline-block"></span>
              <span>Zero client micromanagement</span>
            </div>
          </div>

          <!-- Node 3: Execution Specialists (Directly Wired to Node 4) -->
          <div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-white border border-indigo-200 shadow-sm flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1"
            data-node-id="node-exec" data-downstream="node-delivery">
            <span class="node-port absolute -left-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <span class="node-port absolute -right-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">Stage 03 · Execution</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xl mb-3 font-bold">
                🛠️
              </div>
              <h3 class="font-extrabold text-slate-950 text-base">Execution Specialists</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Vetted Indonesian VAs, AI Conductors &amp; SEO writers execute raw production overnight (GMT+7).
              </p>
            </div>
            <!-- Explicit Visual Connection Link to Node 4 -->
            <div class="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-[11px] font-bold text-indigo-700 bg-indigo-50/70 -mx-2 px-2.5 py-1.5 rounded-lg">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>Passes to PM QA Gate</span>
              <span class="text-[10px] text-indigo-600 font-extrabold">→ Connects to Stage 04</span>
            </div>
          </div>

          <!-- Node 4: White-Label Delivery (Connected Destination) -->
          <div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-white border-2 border-emerald-500 shadow-md flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1"
            data-node-id="node-delivery" data-downstream="">
            <span class="node-port absolute -left-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">Stage 04 · Delivery</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl mb-3 font-bold">
                📦
              </div>
              <h3 class="font-extrabold text-slate-950 text-base">White-Label Delivery</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Your PM audits quality, strips 100% of vendor metadata, and returns client-ready files under your agency brand.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-[11px] font-bold text-emerald-700 bg-emerald-50/70 -mx-2 px-2.5 py-1.5 rounded-lg">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>100% Unbranded</span>
              <span class="text-[10px] text-emerald-700 font-extrabold">Zero Leak NDA</span>
            </div>
          </div>

        </div>

        <!-- Connection Explainer Banner -->
        <div class="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold uppercase text-[10px] border border-brand-500/30">The White-Label Bridge</span>
            <span>Specialists never communicate with your client. Your Dedicated PM audits the work, removes all JDP metadata, and delivers under your agency brand.</span>
          </div>
          <span class="text-emerald-400 font-bold whitespace-nowrap flex items-center gap-1">
            <span>🛡️</span> 100% Confidential Agency NDA
          </span>
        </div>
      </div>

      <!-- COMPACT INTERACTIVE DEMO (Short, Simple, Playful) -->
      <div class="mt-10 rounded-2xl bg-slate-950 p-5 sm:p-7 text-white border border-slate-800 shadow-xl" id="compactDemoWidget">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                ⚡ Quick Interactive Demo
              </span>
              <span class="text-xs text-slate-400 font-medium">Click a task to test live white-label dispatch:</span>
            </div>
            <div class="text-sm sm:text-base font-extrabold text-white" id="demoTitle">
              🤖 Indonesian VA (AI Conductor) · $3.00/hr
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5" id="demoPipelineStatus">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Delivered · Ready for Client</span>
            </span>
          </div>
        </div>

        <!-- Interactive Chips (Visitor Can Play!) -->
        <div class="py-3.5 border-b border-slate-800 flex flex-wrap gap-2 items-center">
          <span class="text-xs font-bold text-slate-400 mr-1">Choose Service:</span>
          <button type="button" onclick="quickSelectDemo(0)" id="qChip0" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white transition shadow-sm">🤖 AI Conductor ($3/hr)</button>
          <button type="button" onclick="quickSelectDemo(1)" id="qChip1" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition">✍️ SEO Article ($15)</button>
          <button type="button" onclick="quickSelectDemo(2)" id="qChip2" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition">🎬 Video Reel ($5/hr)</button>
          <button type="button" onclick="quickSelectDemo(3)" id="qChip3" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition">📰 Digital PR ($105)</button>
        </div>

        <!-- Compact Delivery Preview & Economics in 1 Clean Grid -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 items-center">
          <!-- Left: White-Label Deliverable Preview -->
          <div class="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div class="flex items-center justify-between text-[11px] pb-2 border-b border-slate-800">
              <span class="text-slate-400">Delivered As: <strong class="text-white">Your Agency Brand</strong></span>
              <span class="text-emerald-400 font-bold">✓ 0% JDP Vendor Metadata</span>
            </div>
            <div class="text-xs text-slate-300 leading-relaxed font-medium" id="demoDeliverableText">
              Daily AI agent execution in Manus &amp; Cowork + SOP prompt optimization + zero-hallucination QA audit.
            </div>
            <div class="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
              <span>👤 Assigned: <strong class="text-slate-200" id="demoOperatorText">Indonesian Specialist · Bagus P.</strong></span>
              <span>⏱️ Turnaround: <strong class="text-brand-300">Overnight (GMT+7)</strong></span>
            </div>
          </div>

          <!-- Right: Instant Reseller Profit Math -->
          <div class="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div class="text-[10px] font-black uppercase tracking-wider text-brand-400 mb-2">Agency Reseller Economics:</div>
            <div class="flex justify-between items-baseline mb-2">
              <div class="text-xs text-slate-400">Wholesale: <strong class="text-white font-mono" id="demoCostText">$30.00</strong></div>
              <div class="text-xs text-slate-400">You Bill: <strong class="text-slate-200 font-mono" id="demoBillText">$150.00</strong></div>
            </div>
            <div class="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span class="text-xs font-bold text-emerald-400 uppercase">Your Profit:</span>
              <div class="text-right">
                <span class="text-lg font-black text-emerald-400 font-mono" id="demoProfitText">+$120.00</span>
                <span class="text-[10px] text-emerald-300 block font-semibold" id="demoMarginText">80% Margin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>`;

indexHtml = indexHtml.replace(workflowRegex, newWorkflowSection);

// =========================================================================
// 2. FEATURED OFFERS SECTION: ACCURATE PRICING WITH "AS LOW AS $XXX"
//    ACCORDING TO JETDIGITALPRO.COM & NOTION
// =========================================================================
const pricingRegex = /<!-- Featured Services Preview \(White-Label Wholesale Storefront\) -->[\s\S]*?<!-- Interactive Mini Task Calculator Preview -->/;

const newPricingSection = `<!-- Featured Services Preview (White-Label Wholesale Storefront) -->
  <section id="pricing" class="py-16 md:py-24 bg-white border-b border-slate-200 reveal-on-scroll">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-14">
        <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 mb-3">
          🛒 White-Label Wholesale Storefront
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
          Real Fulfillment at Wholesale Rates.<br class="hidden sm:inline">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-700">Resell under your brand. Keep 80%+ margin.</span>
        </h2>
        <p class="text-slate-600 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          From hands-off SEO subscriptions to Indonesian VAs trained as AI Conductors — buy proven services at pure wholesale rates, slap your agency logo on them, and deliver with zero stress.
        </p>
      </div>

      <!-- 6 Authentic Services Grid from JetDigitalPro.com + Indonesian VA Notion -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">

        <!-- Card 1: Indonesian VA as AI Conductor (CORE NOTION & JDP OFFER) -->
        <div class="group relative rounded-2xl border-2 border-brand-500 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-brand-600">
          <div class="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-600 text-white shadow-sm">
            ⭐ Core Offer
          </div>
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">VA &amp; AI Talent</span>
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Immediate Start</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">Indonesian VA (AI Conductor)</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">Trained for Manus, OpenClaws &amp; Cowork</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              AI tools need orchestration. Our creative Indonesian VAs log in daily, assign prompts, catch hallucinations, and clean outputs.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Runs AI agents in Manus, OpenClaws &amp; Cowork</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Translates agency SOPs into AI prompt flows</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Creative Indonesian culture + async English fluency</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">100% White-Label</span>
              <span class="text-[10px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">🤖 Agency AI Layer</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5 font-medium">As low as</span>
                <span class="text-lg font-black text-slate-950">$3.00 <span class="text-xs font-normal text-slate-500">/ hour</span></span>
              </div>
              <div class="flex items-center gap-2">
                <a href="/contact.html?service=AI-Conductor-VA" class="text-xs font-extrabold bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl transition shadow-xs">Hire VA →</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 2: SEO Content Writing Subscription (jetdigitalpro.com) -->
        <div class="group relative rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">Content &amp; SEO</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Turnkey Blog</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">SEO Writing Subscription</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">End-to-End Blog Fulfillment</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              We run your client blogs hands-off. Keywords, writing, SEO, and CMS publishing. You touch nothing.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>1,500+ words rank-ready article + schema</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Custom graphics + alt tags included</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Direct CMS publishing &amp; scheduling</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">100% White-Label</span>
              <span class="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">🏆 Award Winner</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5 font-medium">As low as</span>
                <span class="text-lg font-black text-slate-950">$15.00 <span class="text-xs font-normal text-slate-500">/ article</span></span>
              </div>
              <div class="flex items-center gap-2">
                <a href="/services.html#catalog" class="text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl transition shadow-xs">Order →</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 3: GEO Multimedia Refresh (jetdigitalpro.com) -->
        <div class="group relative rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">Visibility &amp; AI</span>
              <span class="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">AI Grounded</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">GEO Multimedia Refresh</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">Get Cited by ChatGPT &amp; Perplexity</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              One article → YouTube video, podcast audio, infographic + rich schema. AI engines cite pages with media.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Audio podcast snippet + YouTube video</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Infographic asset + structured JSON-LD</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Optimized for Perplexity, ChatGPT &amp; Gemini</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">100% White-Label</span>
              <span class="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">🤖 GEO Engine</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5 font-medium">As low as</span>
                <span class="text-lg font-black text-slate-950">$15.00 <span class="text-xs font-normal text-slate-500">/ refresh</span></span>
              </div>
              <div class="flex items-center gap-2">
                <a href="/services.html#catalog" class="text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl transition shadow-xs">Order →</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 4: Digital PR: Journalist Pitching (jetdigitalpro.com) -->
        <div class="group relative rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">PR &amp; Authority</span>
              <span class="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">Editorial Links</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">Digital PR: Journalist Pitching</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">Editorial Backlinks from Real Journalists</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Stats article + targeted outreach. Agencies charge $5K — we fulfill wholesale for under $200 (~$105–$175 total).
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Verified media newsroom editorial backlinks</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Custom stats roundup article written</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Unbranded media coverage PDF report</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">100% White-Label</span>
              <span class="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">📰 DR 50–90</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5 font-medium">As low as</span>
                <span class="text-lg font-black text-slate-950">$105.00 <span class="text-xs font-normal text-slate-500">/ campaign</span></span>
              </div>
              <div class="flex items-center gap-2">
                <a href="/services.html#catalog" class="text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl transition shadow-xs">Order →</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 5: Creative Video Editor VA (jetdigitalpro.com + Notion) -->
        <div class="group relative rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">Creative VA</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Overnight</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">Creative Video Editor VA</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">Indonesian Creative Culture</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Creative Indonesian video editors at $5/hr. Work async overnight — wake up to finished TikToks, Reels &amp; Shorts.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Fast-paced TikToks, Reels &amp; Shorts editing</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Engaging captions, B-roll &amp; sound effects</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Overnight delivery in GMT+7</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">100% White-Label</span>
              <span class="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">🎬 High Retention</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5 font-medium">As low as</span>
                <span class="text-lg font-black text-slate-950">$5.00 <span class="text-xs font-normal text-slate-500">/ hour</span></span>
              </div>
              <div class="flex items-center gap-2">
                <a href="/contact.html?service=Video-Editor-VA" class="text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl transition shadow-xs">Hire Editor →</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 6: SEO Super Team VA (jetdigitalpro.com) -->
        <div class="group relative rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">Agency Pod</span>
              <span class="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Managed Pair</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">SEO Super Team VA</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">Senior QC + Junior Exec Pair</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Senior QC + Junior Exec pair. Audits, on-page fixes, keyword research, CMS uploads — managed.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Dual-check quality assurance by Senior QC</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Technical crawl fixes &amp; internal link repairs</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>ClickUp &amp; Slack integration</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">100% White-Label</span>
              <span class="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">⚡ Managed Pair</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5 font-medium">As low as</span>
                <span class="text-lg font-black text-slate-950">$7.00 <span class="text-xs font-normal text-slate-500">/ hour (managed)</span></span>
              </div>
              <div class="flex items-center gap-2">
                <a href="/contact.html?service=SEO-Super-Team" class="text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl transition shadow-xs">Book Pod →</a>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Catalog Banner -->
      <div class="rounded-3xl bg-slate-950 border border-slate-800 p-8 sm:p-12 text-center text-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 24px 24px;"></div>
        <div class="relative z-10 max-w-2xl mx-auto">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-3">
            40+ White-Label Wholesale Services
          </span>
          <h3 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
            Looking for more? Open the full catalog.
          </h3>
          <p class="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
            Hands-off PR subscriptions (as low as $80/mo), Vibe Coding super teams (as low as $10/hr), pay-as-you-go micro tasks (as low as $0.70/task), or dedicated Indonesian VAs — everything delivered 100% under your brand.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3.5">
            <a href="/services.html" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-sm sm:text-base transition shadow-xl shadow-brand-900/50">
              <span>🛒 Explore All Services in Storefront</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/></svg>
            </a>
            <a href="/contact.html" class="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base transition border border-slate-700">
              <span>Custom Scope / Dedicated Pod →</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  </section>`;

indexHtml = indexHtml.replace(pricingRegex, newPricingSection);

// =========================================================================
// 3. JAVASCRIPT FOR THE COMPACT DEMO WIDGET (Clean, fast, bug-free)
// =========================================================================
const cleanCompactScript = `\n  <script>
  // =====================================================================
  // Compact 5-Second White-Label Delivery Demo
  // =====================================================================
  var compactDemoData = [
    {
      title: "🤖 Indonesian VA (AI Conductor) · $3.00/hr",
      operator: "Indonesian Specialist · Bagus P.",
      desc: "Daily AI agent execution in Manus & Cowork + prompt tuning + zero-hallucination QA audit.",
      cost: "$30.00 (10 hrs)",
      bill: "$150.00",
      profit: "+$120.00",
      margin: "80% Margin"
    },
    {
      title: "✍️ SEO Writing Subscription · $15.00/article",
      operator: "Indonesian SEO Specialist · Anisa W.",
      desc: "1,500-word rank-ready article + SurferSEO 85+ score + formatted in WordPress staging.",
      cost: "$15.00 (1 art)",
      bill: "$120.00",
      profit: "+$105.00",
      margin: "87.5% Margin"
    },
    {
      title: "🎬 Creative Video Editor VA · $5.00/hr",
      operator: "Creative Video Editor · Dimas K.",
      desc: "Short-form vertical Reel / TikTok edited with captions, dynamic hooks & sound effects.",
      cost: "$25.00 (5 hrs)",
      bill: "$150.00",
      profit: "+$125.00",
      margin: "83.3% Margin"
    },
    {
      title: "📰 Digital PR: Journalist Pitching · $105/campaign",
      operator: "PR Outreach Lead · Jonathan R.",
      desc: "Stats-driven press pitch to 150+ journalists with live high-DR editorial newsroom backlinks.",
      cost: "$105.00",
      bill: "$450.00",
      profit: "+$345.00",
      margin: "76.6% Margin"
    }
  ];

  function quickSelectDemo(idx) {
    var data = compactDemoData[idx];
    if (!data) return;

    [0, 1, 2, 3].forEach(function(i) {
      var chip = document.getElementById("qChip" + i);
      if (chip) {
        if (i === idx) {
          chip.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white transition shadow-sm";
        } else {
          chip.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition";
        }
      }
    });

    var titleEl = document.getElementById("demoTitle");
    var opEl = document.getElementById("demoOperatorText");
    var descEl = document.getElementById("demoDeliverableText");
    var costEl = document.getElementById("demoCostText");
    var billEl = document.getElementById("demoBillText");
    var profitEl = document.getElementById("demoProfitText");
    var marginEl = document.getElementById("demoMarginText");
    var statusEl = document.getElementById("demoPipelineStatus");

    if (titleEl) titleEl.textContent = data.title;
    if (opEl) opEl.textContent = data.operator;
    if (descEl) descEl.textContent = data.desc;
    if (costEl) costEl.textContent = data.cost;
    if (billEl) billEl.textContent = data.bill;
    if (profitEl) profitEl.textContent = data.profit;
    if (marginEl) marginEl.textContent = data.margin;

    if (statusEl) {
      statusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span><span>PM Quality Verified</span>';
      setTimeout(function() {
        statusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>Delivered · Ready for Client</span>';
      }, 350);
    }
  }
  </script>
</body>
</html>`;

// Replace script section at bottom
const scriptStartIdx = indexHtml.indexOf("<script>\n  // =====================================================================");
if (scriptStartIdx !== -1) {
  indexHtml = indexHtml.substring(0, scriptStartIdx) + cleanCompactScript;
} else {
  indexHtml = indexHtml.replace(/<\/body>[\s\S]*?<\/html>/, cleanCompactScript);
}

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log("index.html updated with connected stages, compact demo, and accurate As low as pricing!");
