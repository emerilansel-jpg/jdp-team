const fs = require('fs');
const path = require('path');

let indexHtml = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');

// =========================================================================
// 1. TIGHTLY CONNECT NODE 3 (Execution Specialists) & NODE 4 (White-Label Delivery)
// =========================================================================
const oldWorkflowSectionRegex = /<!-- 1 Dedicated PM Workflow Diagram -->[\s\S]*?<!-- The Operational Shift: Side-by-Side Contrast Comparison -->/;

const newWorkflowSection = `<!-- 1 Dedicated PM Workflow Diagram -->
  <section class="py-16 md:py-24 bg-surface-subtle border-b border-slate-200 reveal-on-scroll">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <span class="text-xs uppercase tracking-widest font-bold text-brand-600">The Fulfillment Pipeline</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-2 tracking-tight">
          How Work Moves from Brief to Client-Ready
        </h2>
        <p class="text-slate-600 mt-3 text-base">
          You talk to one Dedicated PM. Your PM commands the specialist pod, runs strict QA, and hands over 100% white-label deliverables.
        </p>
      </div>

      <!-- Visual Workflow Diagram Box with Gumloop-Style Interactive Node Canvas -->
      <div class="workflow-canvas-container p-4 sm:p-10 mb-8 relative">
        <!-- Mobile Swipe Indicator Hint -->
        <div class="md:hidden text-xs font-semibold text-brand-600 mb-3 px-1">
          <span class="inline-flex items-center gap-1.5 text-[11px] bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full border border-brand-200">
            <span>←</span> Swipe to inspect stages <span>→</span>
          </span>
        </div>

        <!-- Connecting SVG Pulse Network Layer -->
        <svg class="flow-svg-layer hidden lg:block" viewBox="0 0 1100 240" fill="none" preserveAspectRatio="none">
          <!-- Path 1: Client Input to Dedicated PM -->
          <path class="flow-path-base" d="M 235 120 C 270 120, 280 120, 315 120" />
          <path class="flow-path-pulse" d="M 235 120 C 270 120, 280 120, 315 120" />

          <!-- Path 2: Dedicated PM to Execution Pod -->
          <path class="flow-path-base" d="M 545 120 C 575 120, 585 120, 615 120" />
          <path class="flow-path-pulse" d="M 545 120 C 575 120, 585 120, 615 120" />

          <!-- Path 3: Execution Pod to Dedicated PM QA Bridge -->
          <path class="flow-path-base" d="M 845 120 C 875 120, 885 120, 915 120" />
          <path class="flow-path-pulse" d="M 845 120 C 875 120, 885 120, 915 120" />
        </svg>

        <!-- 4-Stage Interactive Gumloop Nodes Grid -->
        <div class="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:pb-0 items-stretch relative z-10 no-scrollbar touch-pan-x">

          <!-- Node 1: Client Task Input -->
          <div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1">
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
                Drop briefs via Slack, Loom, ClickUp, or API webhook. No rigid ticketing forms.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>10-sec submission</span>
            </div>
          </div>

          <!-- Node 2: Dedicated PM Hub -->
          <div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1">
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
                Your single contact. Translates your goals into strict SOPs, manages timezones, and coordinates specialists.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-medium text-accent-300">
              <span class="w-2 h-2 rounded-full bg-accent-400 task-pulse inline-block"></span>
              <span>Zero client micromanagement</span>
            </div>
          </div>

          <!-- Node 3: Specialist Pod Execution -->
          <div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-white border border-indigo-200 shadow-sm flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1">
            <span class="node-port absolute -left-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <span class="node-port absolute -right-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">Stage 03 · Execution</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xl mb-3 font-bold">
                🛠️
              </div>
              <h3 class="font-extrabold text-slate-950 text-base">Specialist Execution Pod</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Vetted Indonesian VAs, AI Conductors, video editors &amp; SEO writers execute raw production overnight (GMT+7).
              </p>
            </div>
            <!-- Direct Handoff Link to Stage 04 -->
            <div class="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-[11px] font-bold text-indigo-700 bg-indigo-50/50 -mx-2 px-2 py-1 rounded">
              <span class="flex items-center gap-1"><span>↳</span> Hands off to PM QA</span>
              <span class="text-[10px] text-slate-500 font-normal">Never directly to client</span>
            </div>
          </div>

          <!-- Node 4: White-Label Delivery Gate -->
          <div class="workflow-node card-clean rounded-2xl p-5 sm:p-6 bg-white border-2 border-emerald-500 shadow-md flex flex-col justify-between relative cursor-pointer min-w-[260px] xs:min-w-[285px] md:min-w-0 snap-center shrink-0 md:shrink flex-1">
            <span class="node-port absolute -left-1.5 top-1/2 -translate-y-1/2 hidden lg:block"></span>
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">Stage 04 · The QA Gate</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl mb-3 font-bold">
                📦
              </div>
              <h3 class="font-extrabold text-slate-950 text-base">White-Label Delivery</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Your PM audits quality, scrubs 100% of vendor metadata, attaches your logo, and delivers client-ready proof.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>100% Unbranded</span>
              <span class="text-[10px] text-emerald-600 font-extrabold">Zero Leak NDA</span>
            </div>
          </div>

        </div>

        <!-- Connection Explainer Banner (The explicit bridge between Stage 3 & 4) -->
        <div class="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold uppercase text-[10px] border border-brand-500/30">The White-Label Bridge</span>
            <span>Specialists never contact your clients. Your Dedicated PM audits the raw output, sanitizes all vendor traces, and hands you client-ready files.</span>
          </div>
          <span class="text-emerald-400 font-bold whitespace-nowrap flex items-center gap-1">
            <span>🛡️</span> Strict Agency NDA Protection
          </span>
        </div>
      </div>

      <!-- INTERACTIVE PLAYGROUND: White-Label Dispatcher & Reseller Simulator (Visitor Can Play!) -->
      <div class="mt-12 rounded-3xl bg-slate-950 p-6 sm:p-10 text-white border border-slate-800 shadow-2xl relative overflow-hidden" id="dispatcherPlayground">
        <div class="absolute inset-0 opacity-[0.05] pointer-events-none" style="background-image: radial-gradient(#93c5fd 1px, transparent 1px); background-size: 24px 24px;"></div>
        
        <div class="relative z-10">
          <!-- Playground Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
                🎮 Interactive Fulfillment Sandbox · Try It Now
              </div>
              <h3 class="text-xl sm:text-2xl font-black text-white">
                Simulate a White-Label Order &amp; Calculate Your Agency Profit
              </h3>
              <p class="text-xs sm:text-sm text-slate-400 mt-1">
                Pick a real service from our catalog, drag the price slider to what you bill your client, and watch the fulfillment pipeline in action.
              </p>
            </div>
            <div class="shrink-0 flex items-center gap-2">
              <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Ready to Dispatch</span>
              </span>
            </div>
          </div>

          <!-- Step 1: Pick an Authentic Service -->
          <div class="py-6 border-b border-slate-800/80">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Step 1: Choose a Core Service (from jetdigitalpro.com &amp; Notion)</span>
              <span class="text-[11px] text-brand-400 font-medium">Click any service to test</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <!-- Service 0: Indonesian VA AI Conductor (Notion Core) -->
              <button type="button" onclick="selectPlaygroundService(0)" id="playBtn0" class="playground-card text-left p-3.5 rounded-2xl border-2 border-brand-500 bg-brand-950/30 hover:border-brand-400 transition flex flex-col justify-between">
                <div>
                  <div class="text-lg mb-1">🤖</div>
                  <div class="text-xs font-black text-white leading-snug">Indonesian VA (AI Conductor)</div>
                  <div class="text-[10px] text-slate-400 mt-1">Runs Manus, OpenClaws &amp; Cowork</div>
                </div>
                <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span class="text-slate-400">Wholesale:</span>
                  <span class="font-black text-emerald-400">$3.00/hr</span>
                </div>
              </button>

              <!-- Service 1: SEO Writing Subscription (JDP Core) -->
              <button type="button" onclick="selectPlaygroundService(1)" id="playBtn1" class="playground-card text-left p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition flex flex-col justify-between">
                <div>
                  <div class="text-lg mb-1">✍️</div>
                  <div class="text-xs font-black text-white leading-snug">SEO Writing Subscription</div>
                  <div class="text-[10px] text-slate-400 mt-1">SurferSEO 85+ score + CMS publish</div>
                </div>
                <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span class="text-slate-400">Wholesale:</span>
                  <span class="font-black text-emerald-400">$15.00/art</span>
                </div>
              </button>

              <!-- Service 2: Digital PR Journalist Pitching (JDP Core) -->
              <button type="button" onclick="selectPlaygroundService(2)" id="playBtn2" class="playground-card text-left p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition flex flex-col justify-between">
                <div>
                  <div class="text-lg mb-1">📰</div>
                  <div class="text-xs font-black text-white leading-snug">Digital PR &amp; Journalist Pitch</div>
                  <div class="text-[10px] text-slate-400 mt-1">Real editorial newsroom backlinks</div>
                </div>
                <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span class="text-slate-400">Wholesale:</span>
                  <span class="font-black text-emerald-400">$105.00/camp</span>
                </div>
              </button>

              <!-- Service 3: Creative Video Editor VA (JDP Core) -->
              <button type="button" onclick="selectPlaygroundService(3)" id="playBtn3" class="playground-card text-left p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition flex flex-col justify-between">
                <div>
                  <div class="text-lg mb-1">🎬</div>
                  <div class="text-xs font-black text-white leading-snug">Creative Video Editor VA</div>
                  <div class="text-[10px] text-slate-400 mt-1">Reels, Shorts &amp; TikToks overnight</div>
                </div>
                <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span class="text-slate-400">Wholesale:</span>
                  <span class="font-black text-emerald-400">$5.00/hr</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Step 2: Interactive Margin & Resell Calculator -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6 border-b border-slate-800/80 items-center">
            <div class="lg:col-span-7 space-y-4">
              <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Step 2: Drag Slider — What will you bill your client?</span>
                <span class="text-brand-400 font-mono text-sm" id="playgroundClientPriceDisplay">$150</span>
              </div>
              <input type="range" id="playgroundMarginSlider" min="20" max="600" step="5" value="150" oninput="updatePlaygroundMargin()" class="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500">
              
              <div class="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Low Margin ($20)</span>
                <span>Standard Agency Rate ($150)</span>
                <span>High Ticket ($600)</span>
              </div>

              <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div class="text-xs">
                  <span class="text-slate-400 block text-[10px] uppercase font-bold">Assigned Specialist:</span>
                  <span class="font-extrabold text-white" id="playgroundSpecName">Indonesian Creative VA · Bagus P.</span>
                </div>
                <div class="text-xs text-right">
                  <span class="text-slate-400 block text-[10px] uppercase font-bold">Timezone / Execution:</span>
                  <span class="font-extrabold text-brand-300">GMT+7 (Overnight Delivery)</span>
                </div>
              </div>
            </div>

            <!-- Reseller Math Card -->
            <div class="lg:col-span-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 space-y-3">
              <div class="text-[11px] font-black uppercase tracking-wider text-brand-400">Your Reseller Economics:</div>
              <div class="flex justify-between text-xs pb-2 border-b border-slate-800">
                <span class="text-slate-400">Your JDP Wholesale Cost:</span>
                <span class="font-mono font-bold text-white" id="playgroundWholesaleCost">$30.00</span>
              </div>
              <div class="flex justify-between text-xs pb-2 border-b border-slate-800">
                <span class="text-slate-400">You Bill Your Client:</span>
                <span class="font-mono font-bold text-white" id="playgroundClientBill">$150.00</span>
              </div>
              <div class="flex justify-between items-center pt-1">
                <span class="text-xs font-bold text-emerald-400 uppercase">Your Net Profit:</span>
                <div class="text-right">
                  <div class="text-2xl font-black text-emerald-400 font-mono" id="playgroundNetProfit">+$120.00</div>
                  <div class="text-[10px] text-emerald-300 font-semibold" id="playgroundMarkupRate">80.0% Profit Margin</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Trigger Dispatch Simulation Button -->
          <div class="pt-6">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div class="text-xs text-slate-400">
                <strong class="text-white">Step 3: Test the White-Label Handoff</strong> — Click button to simulate real task assignment, QA audit, and unbranded client packaging.
              </div>
              <button type="button" onclick="runDispatchSimulation()" id="simulateDispatchBtn" class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-black text-sm transition shadow-lg shadow-brand-900/50 flex items-center justify-center gap-2">
                <span>🚀 Simulate White-Label Dispatch</span>
              </button>
            </div>

            <!-- Simulated Pipeline Live Progress Tracker (Animates on click) -->
            <div id="simPipelineBox" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs" id="simStepIndicators">
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-400" id="stepPill1">
                  <span class="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-300">1</span>
                  <span class="font-semibold truncate">Task Brief Received</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-400" id="stepPill2">
                  <span class="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-300">2</span>
                  <span class="font-semibold truncate">Specialist Executes</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-400" id="stepPill3">
                  <span class="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-300">3</span>
                  <span class="font-semibold truncate">Dedicated PM QA</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-400" id="stepPill4">
                  <span class="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-300">4</span>
                  <span class="font-semibold truncate">White-Label Ready</span>
                </div>
              </div>

              <!-- Client-Ready Output Card Preview -->
              <div class="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4" id="simClientReadyCard">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div class="flex items-center gap-2.5">
                    <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                    <span class="text-xs font-mono font-bold text-slate-300" id="simOrderHeader">Order #WL-8092 · 100% White-Label Sanitized</span>
                  </div>
                  <div class="text-[11px] text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span>✓</span> Zero JDP / Zero Freelancer Metadata
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 block text-[10px] uppercase font-bold mb-1">Delivered Scope:</span>
                    <div class="text-white font-medium" id="simDeliverableDesc">
                      Daily AI agent execution in Manus &amp; Cowork + SOP error-monitoring log + clean CRM updates.
                    </div>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10px] uppercase font-bold mb-1">Proof-of-Work Included:</span>
                    <div class="text-slate-300 space-y-1 text-[11px]" id="simProofPoints">
                      <div>✓ Unbranded Loom walkthrough link ready for client</div>
                      <div>✓ Time-stamped execution sheet with screenshots</div>
                      <div>✓ Client-ready email summary template</div>
                    </div>
                  </div>
                </div>

                <!-- One-click Copy Client Delivery Note -->
                <div class="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <span class="text-xs text-slate-400">Ready to forward straight to your client without touching a file.</span>
                  <button type="button" onclick="copyClientHandoverText()" id="copyHandoverBtn" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 flex items-center gap-1.5">
                    <span>📋 Copy Ready Client Email</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>`;

indexHtml = indexHtml.replace(oldWorkflowSectionRegex, newWorkflowSection);

// =========================================================================
// 2. REPLACE FEATURED SERVICES WITH AUTHENTIC OFFERS (JETDIGITALPRO.COM + NOTION)
// =========================================================================
const oldPricingRegex = /<!-- Featured Services Preview \(White-Label Wholesale Storefront\) -->[\s\S]*?<!-- Interactive Mini Task Calculator Preview -->/;

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
          From hands-off SEO subscriptions to Indonesian VAs trained as AI Conductors — buy proven services at pure wholesale rates, slap your agency logo on them, and deliver like a pro.
        </p>
      </div>

      <!-- 6 Authentic Services Grid from JetDigitalPro.com + Indonesian VA Notion -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">

        <!-- Card 1: Indonesian VA as AI Conductor (CORE NOTION OFFER) -->
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
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Translates agency SOPs into AI prompts</span></li>
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
                <span class="text-xs text-slate-400 block -mb-0.5">Wholesale Rate</span>
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
              We run your client blogs hands-off. Keyword topical maps, SurferSEO 85+ score, custom graphics, and CMS upload.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>1,500+ words rank-ready article + schema</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Royalty-free graphic + alt tags included</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Formatted &amp; scheduled in WordPress/CMS</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">100% White-Label</span>
              <span class="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">🏆 Award Winner</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5">Wholesale Rate</span>
                <span class="text-lg font-black text-slate-950">$15.00 <span class="text-xs font-normal text-slate-500">/ article</span></span>
              </div>
              <div class="flex items-center gap-2">
                <a href="/services.html#catalog" class="text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl transition shadow-xs">Order →</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 3: GEO Multimedia Refresh (AI Search Citation) (jetdigitalpro.com) -->
        <div class="group relative rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">Visibility &amp; AI</span>
              <span class="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">AI Grounded</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">GEO Multimedia Refresh</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">Get Cited by ChatGPT &amp; Perplexity</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              One article → YouTube video, podcast audio, infographic + rich schema. AI engines cite multimedia entity nodes.
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
                <span class="text-xs text-slate-400 block -mb-0.5">Wholesale Rate</span>
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
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">Digital PR &amp; Journalist Pitch</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">Real Editorial Newsroom Backlinks</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Stats article + targeted outreach to journalists. Agencies charge $5,000 — we fulfill wholesale for under $200.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Editorial links from verified media publications</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Stats roundup article researched &amp; written</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Unbranded coverage report with live DO-FOLLOW URLs</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">100% White-Label</span>
              <span class="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">📰 DR 50–90</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5">Wholesale Rate</span>
                <span class="text-lg font-black text-slate-950">$105 <span class="text-xs font-normal text-slate-500">/ campaign</span></span>
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
              <span class="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Overnight Turnaround</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">Creative Video Editor VA</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">Indonesian Creative Culture</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Indonesian creative talent (from the culture that created the Minions &amp; Hollywood animators). Fast vertical video editing.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Fast-paced TikToks, Reels &amp; Shorts</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Engaging captions, B-roll &amp; sound effects</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Submit at 5pm US → Wake up to finished edits</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">100% White-Label</span>
              <span class="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">🎬 High Retention</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5">Wholesale Rate</span>
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
              For agencies with SEO strategy but zero bandwidth. Senior strategist conducts QA while junior executor implements fixes.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Full technical crawl audit &amp; internal link repair</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Title tags, meta descriptions &amp; H-tag optimization</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Integrated directly into your ClickUp or Slack</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">100% White-Label</span>
              <span class="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">⚡ Full Turnkey</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5">Wholesale Rate</span>
                <span class="text-lg font-black text-slate-950">$7.00 <span class="text-xs font-normal text-slate-500">/ hour pair</span></span>
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
            High-authority PR distribution (PressWires.net), niche guest posts, local citations, deep SEO audits, custom developer tasks, or full-time pods — everything delivered 100% under your brand.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3.5">
            <a href="/services.html" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-sm sm:text-base transition shadow-xl shadow-brand-900/50">
              <span>🛒 Explore All 40+ Services in Storefront</span>
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

indexHtml = indexHtml.replace(oldPricingRegex, newPricingSection);

// =========================================================================
// 3. JAVASCRIPT FOR THE PLAYGROUND INTERACTION
// =========================================================================
const playgroundScript = `
  // =====================================================================
  // Interactive White-Label Dispatcher & Reseller Simulator Playground
  // =====================================================================
  const playgroundServices = [
    {
      id: "ai-conductor",
      name: "Indonesian VA (AI Conductor)",
      tag: "Orchestrates Manus, OpenClaws & Cowork",
      wholesaleRate: 3.00,
      wholesaleUnit: "/ hour",
      defaultUnits: 10, // 10 hours
      defaultClientBill: 150,
      minBill: 40,
      maxBill: 500,
      specName: "Indonesian AI Conductor · Bagus P.",
      specTime: "GMT+7 (Overnight Execution)",
      orderNumber: "Order #WL-AI-902",
      deliverableDesc: "Daily AI agent execution in Manus & Cowork + SOP prompt optimization + zero-hallucination QA audit.",
      proofs: [
        "✓ Clean daily execution log with zero AI hallucinations",
        "✓ Unbranded Loom walkthrough showing completed agent tasks",
        "✓ 100% unbranded summary ready for your client"
      ],
      clientTemplate: "Hi team, your AI automation workflows for this week have been completed and quality-verified. All outputs are staged and live: [Client-Link]. Let us know if you need any adjustments!"
    },
    {
      id: "seo-writing",
      name: "SEO Writing Subscription",
      tag: "End-to-End Blog Fulfillment",
      wholesaleRate: 15.00,
      wholesaleUnit: "/ article",
      defaultUnits: 2, // 2 articles
      defaultClientBill: 160,
      minBill: 40,
      maxBill: 600,
      specName: "SEO Specialist · Anisa W.",
      specTime: "GMT+7 (24h SLA)",
      orderNumber: "Order #WL-SEO-418",
      deliverableDesc: "2x 1,500-word rank-ready pillar articles + SurferSEO 85+ score + formatted directly into WordPress draft.",
      proofs: [
        "✓ SurferSEO score 85+ verified screenshot",
        "✓ Formatted in WordPress with custom royalty-free WebP images",
        "✓ Zero AI watermarks · 100% human-edited polish"
      ],
      clientTemplate: "Hi team, your new SEO blog articles have been drafted and uploaded directly into your WordPress staging. Ready for your review: [Client-Link]."
    },
    {
      id: "digital-pr",
      name: "Digital PR & Journalist Pitch",
      tag: "Editorial Media Backlinks",
      wholesaleRate: 105.00,
      wholesaleUnit: "/ campaign",
      defaultUnits: 1, // 1 campaign
      defaultClientBill: 450,
      minBill: 150,
      maxBill: 1200,
      specName: "PR Media Lead · Jonathan R.",
      specTime: "7-10 Business Days",
      orderNumber: "Order #WL-PR-751",
      deliverableDesc: "Stats-driven press campaign pitched to 150+ journalists with live high-DR editorial placements.",
      proofs: [
        "✓ Verified DO-FOLLOW live editorial backlinks (DR 50-80)",
        "✓ Full unbranded media coverage clipping PDF",
        "✓ Google Analytics referral traffic snapshot"
      ],
      clientTemplate: "Hi team, great news! Your latest press campaign has been picked up by major industry publications. Here is your unbranded media coverage report: [Client-Link]."
    },
    {
      id: "video-editor",
      name: "Creative Video Editor VA",
      tag: "Reels, Shorts & TikToks Overnight",
      wholesaleRate: 5.00,
      wholesaleUnit: "/ hour",
      defaultUnits: 8, // 8 hours
      defaultClientBill: 200,
      minBill: 50,
      maxBill: 600,
      specName: "Creative Editor · Dimas K.",
      specTime: "GMT+7 (Overnight Delivery)",
      orderNumber: "Order #WL-VID-330",
      deliverableDesc: "8 vertical TikTok / Instagram Reels edited with dynamic captions, sound design, and B-roll hooks.",
      proofs: [
        "✓ 8x 9:16 1080p rendered MP4 videos ready to post",
        "✓ High-retention subtitle animations + sound effects",
        "✓ Downloadable Google Drive folder (unbranded)"
      ],
      clientTemplate: "Hi team, your batch of short-form vertical videos for this week is ready for posting! You can review and download the clean files here: [Client-Link]."
    }
  ];

  let currentPlaygroundIdx = 0;

  function selectPlaygroundService(idx) {
    currentPlaygroundIdx = idx;
    const serv = playgroundServices[idx];
    if (!serv) return;

    // Update button styles
    [0, 1, 2, 3].forEach(i => {
      const b = document.getElementById('playBtn' + i);
      if (b) {
        if (i === idx) {
          b.className = "playground-card text-left p-3.5 rounded-2xl border-2 border-brand-500 bg-brand-950/30 hover:border-brand-400 transition flex flex-col justify-between";
        } else {
          b.className = "playground-card text-left p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition flex flex-col justify-between";
        }
      }
    });

    // Update slider bounds & value
    const slider = document.getElementById('playgroundMarginSlider');
    if (slider) {
      slider.min = serv.minBill;
      slider.max = serv.maxBill;
      slider.value = serv.defaultClientBill;
    }

    // Update specialist info
    const specEl = document.getElementById('playgroundSpecName');
    if (specEl) specEl.textContent = serv.specName;

    // Update preview card
    const headerEl = document.getElementById('simOrderHeader');
    const descEl = document.getElementById('simDeliverableDesc');
    const proofsEl = document.getElementById('simProofPoints');

    if (headerEl) headerEl.textContent = serv.orderNumber + " · 100% White-Label Sanitized";
    if (descEl) descEl.textContent = serv.deliverableDesc;
    if (proofsEl) {
      proofsEl.innerHTML = serv.proofs.map(p => '<div>' + p + '</div>').join('');
    }

    updatePlaygroundMargin();
  }

  function updatePlaygroundMargin() {
    const serv = playgroundServices[currentPlaygroundIdx];
    if (!serv) return;

    const slider = document.getElementById('playgroundMarginSlider');
    const clientPrice = slider ? parseFloat(slider.value) : serv.defaultClientBill;
    const wholesaleTotal = serv.wholesaleRate * serv.defaultUnits;
    const profit = Math.max(0, clientPrice - wholesaleTotal);
    const margin = clientPrice > 0 ? ((profit / clientPrice) * 100).toFixed(1) : 0;

    const disp = document.getElementById('playgroundClientPriceDisplay');
    const wCost = document.getElementById('playgroundWholesaleCost');
    const cBill = document.getElementById('playgroundClientBill');
    const nProfit = document.getElementById('playgroundNetProfit');
    const mRate = document.getElementById('playgroundMarkupRate');

    if (disp) disp.textContent = '$' + clientPrice.toLocaleString();
    if (wCost) wCost.textContent = '$' + wholesaleTotal.toFixed(2);
    if (cBill) cBill.textContent = '$' + clientPrice.toFixed(2);
    if (nProfit) nProfit.textContent = '+$' + profit.toFixed(2);
    if (mRate) mRate.textContent = margin + '% Agency Margin (' + ((clientPrice / wholesaleTotal)).toFixed(1) + 'x Markup)';
  }

  function runDispatchSimulation() {
    const btn = document.getElementById('simulateDispatchBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⚡ Dispatching Pipeline...</span>';
    }

    const pills = [1, 2, 3, 4].map(n => document.getElementById('stepPill' + n));
    pills.forEach(p => {
      if (p) p.className = "p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-400";
    });

    setTimeout(() => {
      if (pills[0]) pills[0].className = "p-3 rounded-xl bg-brand-950/60 border border-brand-500 text-brand-300 font-bold flex items-center gap-2";
    }, 200);

    setTimeout(() => {
      if (pills[1]) pills[1].className = "p-3 rounded-xl bg-indigo-950/60 border border-indigo-500 text-indigo-300 font-bold flex items-center gap-2";
    }, 500);

    setTimeout(() => {
      if (pills[2]) pills[2].className = "p-3 rounded-xl bg-amber-950/60 border border-amber-500 text-amber-300 font-bold flex items-center gap-2";
    }, 800);

    setTimeout(() => {
      if (pills[3]) pills[3].className = "p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-bold flex items-center gap-2";
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>✓ Dispatched! Click to Re-run</span>';
      }
      const card = document.getElementById('simClientReadyCard');
      if (card) {
        card.classList.add('ring-2', 'ring-emerald-400', 'transition-all');
        setTimeout(() => card.classList.remove('ring-2', 'ring-emerald-400'), 1500);
      }
    }, 1100);
  }

  function copyClientHandoverText() {
    const serv = playgroundServices[currentPlaygroundIdx];
    if (!serv) return;
    const text = serv.clientTemplate;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyHandoverBtn');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span class="text-emerald-400 font-bold">✓ Copied to Clipboard!</span>';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      }
    }).catch(() => {
      alert("Template: " + text);
    });
  }
`;

// Replace old demo script with new playground script
indexHtml = indexHtml.replace(/\/\/ Interactive Service Fulfillment Demo Switcher[\s\S]*?function switchServiceDemo[\s\S]*?\}\n  \}/, playgroundScript);

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log("index.html updated with authentic offers and interactive playground!");
