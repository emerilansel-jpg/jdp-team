const fs = require('fs');
const path = require('path');

console.log("=== STARTING COMPLETE CRO & FEEDBACK OVERHAUL ===");

// =========================================================================
// 1. UPDATE CLEAN ROUTING & REDIRECTS
// =========================================================================
fs.writeFileSync('_redirects', `/services.html  /services  301\n/services/index.html  /services  301\n`, 'utf8');

if (!fs.existsSync('services')) {
  fs.mkdirSync('services', { recursive: true });
}

// =========================================================================
// 2. OVERHAUL INDEX.HTML
// =========================================================================
let index = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');

// 2.1 SLEEK LOGO (Wordmarks.net / Modern tech agency grade)
const newLogo = `<a href="/" class="flex items-center gap-3 group py-1 min-touch select-none" aria-label="JDP.team Home">
        <div class="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-950 text-white shadow-md shadow-slate-950/20 group-hover:scale-105 transition-all overflow-hidden border border-slate-800">
          <div class="absolute inset-0 bg-gradient-to-tr from-brand-600/40 via-transparent to-cyan-400/30 opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <svg class="w-5 h-5 relative z-10 text-white" viewBox="0 0 24 24" fill="none">
            <path d="M5 6H19V8H5V6Z" fill="white" />
            <path d="M11 8H13V15C13 16.6569 11.6569 18 10 18H7V16H10C10.5523 16 11 15.5523 11 15V8Z" fill="#38bdf8" />
            <circle cx="17" cy="16.5" r="2.2" fill="#2563eb" />
          </svg>
        </div>
        <div class="flex flex-col">
          <div class="flex items-baseline gap-1">
            <span class="text-xl sm:text-[1.45rem] font-black tracking-[-0.055em] text-slate-950 font-sans leading-none">
              jdp<span class="text-brand-600 font-black">.team</span>
            </span>
          </div>
          <span class="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-400 group-hover:text-brand-600 transition-colors mt-0.5 leading-none">
            Wholesale Engine
          </span>
        </div>
      </a>`;

// Replace Header Logo
index = index.replace(
  /<a href="\/" class="flex items-center gap-2 group min-touch" aria-label="JDP\.team Home">[\s\S]*?<\/a>/,
  newLogo
);

// 2.2 CLEAN INTERNAL URLS: Replace /services.html with /services
index = index.replace(/href="\/services\.html(#?[^"]*)"/g, 'href="/services$1"');

// 2.3 HERO SUBHEADLINE: Cut 2x shorter, punchy, no fluff
const oldSubheadline = `<p class="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-3 break-words">
        The secret fulfillment engine for digital agencies and founders. Buy fixed-scope White-Label Wholesale Services like an online store, hire a dedicated pod, or let your AI Agent dispatch manual grunt work directly to our humans. 100% under your brand.
      </p>`;

const newSubheadline = `<p class="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed px-2 font-medium">
        Wholesale remote team for agencies. Buy turnkey SEO, GEO multimedia &amp; Indonesian AI conductors at production cost — delivered unbranded under your logo.
      </p>`;

index = index.replace(oldSubheadline, newSubheadline);

// 2.4 HERO MOBILE VIEW: HIDE CROWDED BENEFIT BOXES & MICRO-COPY ON MOBILE
const oldHeroBenefits = `<div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto text-left">`;
const newHeroBenefits = `<div class="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto text-left mt-8">`;
index = index.replace(oldHeroBenefits, newHeroBenefits);

// Remove "No Monthly Retainer Required" false claim & reduce white-label stuffing
index = index.replace(
  `<span class="flex items-center gap-1"><span class="text-emerald-500 font-bold">✓</span> No Monthly Retainer Required</span>`,
  `<span class="flex items-center gap-1"><span class="text-emerald-500 font-bold">✓</span> 24-48h SLA Turnaround</span>`
);

// 2.5 REAL AUTHORITY BADGE LOGOS (South-South Medallion SVG, Google, HubSpot, Legiit, Trustpilot)
const oldTrustBar = `<!-- Verified Trust Bar (all items externally verifiable) -->
  <section class="py-6 bg-white border-b border-slate-200 overflow-hidden reveal-on-scroll" aria-label="Verified credentials">
    <div class="max-w-7xl mx-auto px-4 mb-3 text-xs text-slate-500 text-center sm:text-left">
      <span class="font-bold uppercase tracking-wider text-[11px] text-slate-500">Verified credentials:</span>
    </div>
    <div class="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
      <a href="https://www.trustpilot.com/review/jetdigitalpro.com" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap shadow-xs hover:border-brand-300 hover:text-brand-700 transition" title="JetDigitalPro on Trustpilot">
        <span class="text-emerald-500">&#9733;&#9733;&#9733;&#9733;</span><span class="text-slate-300">&#9733;</span> TrustScore 4.2 / 5
      </a>
      <a href="https://southsouthawards.com/2026/us/nationwide/best-seo-content-writing-service/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-amber-300 text-amber-700 text-xs font-semibold whitespace-nowrap shadow-xs hover:border-amber-400 transition" title="Winner: Best SEO Content Writing Service 2026 - South-South Awards">
        <span class="w-2 h-2 rounded-full bg-amber-400"></span> Winner 2026 &middot; South-South Awards
      </a>
      <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap shadow-xs">
        <span class="w-2 h-2 rounded-full bg-orange-500"></span> HubSpot Certified
      </div>
      <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap shadow-xs">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span> Google Certified
      </div>
      <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap shadow-xs">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Legiit Certified
      </div>
    </div>
  </section>`;

const newTrustBar = `<!-- Verified Authority Badges Bar (Real Official Visual Logos from JetDigitalPro) -->
  <section class="py-8 bg-slate-900 border-b border-slate-800 text-white overflow-hidden reveal-on-scroll" aria-label="Verified agency credentials">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="text-center md:text-left">
          <div class="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-1">Parent Agency Backing</div>
          <div class="text-sm font-extrabold text-white">Backed by JetDigitalPro Verified Credentials</div>
        </div>
        
        <!-- Authentic Logos / Medallions Grid -->
        <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <!-- South-South Award Medallion SVG -->
          <a href="https://southsouthawards.com/2026/us/nationwide/best-seo-content-writing-service/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 transition hover:scale-105 shadow-sm group" title="Winner: Best SEO Content Writing Service 2026">
            <img src="/assets/img/badges/south-south-award.svg" alt="South-South Business Awards 2026" class="w-8 h-8 object-contain shrink-0 drop-shadow">
            <div class="text-left">
              <div class="text-[11px] font-black text-amber-300 leading-tight">Winner 2026</div>
              <div class="text-[9px] text-slate-400">South-South Awards</div>
            </div>
          </a>

          <!-- Trustpilot Official Rating Badge -->
          <a href="https://www.trustpilot.com/review/jetdigitalpro.com" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-400 transition hover:scale-105 shadow-sm" title="JetDigitalPro on Trustpilot">
            <div class="w-7 h-7 rounded-lg bg-[#00b67a] text-white flex items-center justify-center font-black text-base shadow-xs">★</div>
            <div class="text-left">
              <div class="text-[11px] font-black text-white leading-tight">TrustScore 4.2 / 5</div>
              <div class="text-[9px] text-emerald-400 font-semibold">Verified Agency Reviews</div>
            </div>
          </a>

          <!-- Google Certified Partner Badge -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <img src="/assets/img/badges/google-certified.png" alt="Google Certified" class="h-6 w-auto object-contain">
            <span class="text-[10px] font-bold text-slate-300">Google Certified</span>
          </div>

          <!-- HubSpot Certified Badge -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <img src="/assets/img/badges/hubspot-certified.png" alt="HubSpot Certified" class="h-6 w-auto object-contain">
            <span class="text-[10px] font-bold text-slate-300">HubSpot Partner</span>
          </div>

          <!-- Legiit Level 4 Certified Agency Badge -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <img src="/assets/img/badges/legiit-certified.png" alt="Legiit Certified Agency" class="h-6 w-auto object-contain">
            <span class="text-[10px] font-bold text-slate-300">Legiit Top-Rated</span>
          </div>
        </div>
      </div>
    </div>
  </section>`;

index = index.replace(oldTrustBar, newTrustBar);

// 2.6 REMOVE USELESS "See Pricing" BUTTON & REPLACE WITH STOREFRONT CTA
const oldSeePricingBtn = `<a href="#pricing" class="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors shadow-lg shadow-emerald-600/20 whitespace-nowrap">
          See Pricing
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5-5 5M6 12h12"></path></svg>
        </a>`;

const newSeePricingBtn = `<a href="/services" class="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-sm font-black transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-brand-600/25 whitespace-nowrap">
          <span>🛒 Browse Storefront &amp; Rates</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5-5 5M6 12h12"></path></svg>
        </a>`;

index = index.replace(oldSeePricingBtn, newSeePricingBtn);

// 2.7 FIX SS1 & SS2: CONNECTING LINE FROM EXECUTION (STAGE 03) TO DELIVERY (STAGE 04)
const oldSvgPaths = `<svg class="flow-svg-layer hidden lg:block" viewBox="0 0 1100 240" fill="none" preserveAspectRatio="none">
          <!-- Path 1: Client Input to Dedicated PM -->
          <path class="flow-path-base" d="M 235 120 C 270 120, 280 120, 315 120" />
          <path class="flow-path-pulse" d="M 235 120 C 270 120, 280 120, 315 120" />

          <!-- Path 2: Dedicated PM to Execution Pod -->
          <path class="flow-path-base" d="M 545 120 C 575 120, 585 120, 615 120" />
          <path class="flow-path-pulse" d="M 545 120 C 575 120, 585 120, 615 120" />

          <!-- Path 3: Execution Pod directly connected to White-Label Delivery via PM QA -->
          <path class="flow-path-base" d="M 845 120 C 875 120, 885 120, 915 120" />
          <path class="flow-path-pulse" d="M 845 120 C 875 120, 885 120, 915 120" />
        </svg>`;

const newSvgPaths = `<svg class="flow-svg-layer hidden lg:block" viewBox="0 0 1100 240" fill="none" preserveAspectRatio="none">
          <!-- Path 1: Client Input to Dedicated PM -->
          <path class="flow-path-base" d="M 260 120 L 305 120" />
          <path class="flow-path-pulse" d="M 260 120 L 305 120" />

          <!-- Path 2: Dedicated PM to Execution Pod -->
          <path class="flow-path-base" d="M 535 120 L 580 120" />
          <path class="flow-path-pulse" d="M 535 120 L 580 120" />

          <!-- Path 3: EXACT GAP BETWEEN STAGE 03 & STAGE 04 (SS1 & SS2 FIX) -->
          <path class="flow-path-base" d="M 800 120 L 850 120" />
          <path class="flow-path-pulse" d="M 800 120 L 850 120" style="stroke: #10b981; stroke-width: 3.5;" />
        </svg>`;

index = index.replace(oldSvgPaths, newSvgPaths);

// Also upgrade the connection banner between Card 3 and 4 in Stage 03 & Stage 04:
const oldCard3Bottom = `<div class="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-[11px] font-bold text-indigo-700 bg-indigo-50/70 -mx-2 px-2.5 py-1.5 rounded-lg">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>Passes to PM QA Gate</span>
              <span class="text-[10px] text-indigo-600 font-extrabold">→ Connects to Stage 04</span>
            </div>`;

const newCard3Bottom = `<div class="mt-4 pt-3 border-t border-indigo-200 flex items-center justify-between text-xs font-black text-indigo-900 bg-indigo-100/90 -mx-2 px-3 py-2 rounded-xl border border-indigo-300 shadow-sm">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
                <span>PM QA &amp; Scrub Gate</span>
              </span>
              <span class="text-indigo-800 font-extrabold flex items-center gap-1">
                <span>Wired to Stage 04</span>
                <span class="text-base leading-none">➔</span>
              </span>
            </div>`;

index = index.replace(oldCard3Bottom, newCard3Bottom);

// 2.8 REPLACE DIGITAL PR WITH GEO YOUTUBE LISTICLE & GEO PRESS RELEASE
const oldCard4DigitalPr = `<!-- Card 4: Digital PR: Journalist Pitching (jetdigitalpro.com) -->
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
                <a href="/services#catalog" class="text-xs font-black bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition shadow-xs">View Scope &amp; Rates →</a>
              </div>
            </div>
          </div>
        </div>`;

const newGeoServices = `<!-- Card 4: GEO YouTube Listicle & Video Mentions (jetdigitalpro.com) -->
        <div class="group relative rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">Video &amp; AI Search</span>
              <span class="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">Guaranteed Placement</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">YouTube Listicle &amp; Video Mentions (GEO)</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">Cited in Google AI Overviews &amp; Perplexity</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Guaranteed placement in ranking niche YouTube listicles. Video search visibility + instant social proof for your clients.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Placement in ranking niche-relevant YouTube listicles</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>High-intent brand mentions &amp; pinned description links</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Engineered for citation in ChatGPT &amp; AI search</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Unbranded Report</span>
              <span class="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">📺 Video Authority</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5 font-medium">As low as</span>
                <span class="text-lg font-black text-slate-950">$127.00 <span class="text-xs font-normal text-slate-500">/ placement</span></span>
              </div>
              <div class="flex items-center gap-2">
                <a href="/services#catalog" class="text-xs font-black bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition shadow-xs">View Scope &amp; Rates →</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 5: GEO Press Release Syndication (jetdigitalpro.com) -->
        <div class="group relative rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">GEO Press Release</span>
              <span class="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">AI Newsjacking</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-950 group-hover:text-brand-700 transition mb-1">GEO Press Release Syndication</h3>
            <div class="text-xs font-bold text-brand-600 mb-2">Hands-Off Distribution + Infographic</div>
            <p class="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Newsjacking PR engineered with specific stats and named sources so LLMs extract your client as the definitive authority.
            </p>
            <ul class="text-xs text-slate-600 space-y-1.5 mb-5">
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>PR copy + custom infographic + companion SEO article</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Syndication to Associated Press, Google News &amp; 200+ outlets</span></li>
              <li class="flex gap-2"><span class="text-brand-600 font-bold shrink-0">✓</span><span>Quotable brand mentions formatted for AI Overviews</span></li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Unbranded Live Report</span>
              <span class="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">📰 Tier-1 Feeds</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span class="text-xs text-slate-400 block -mb-0.5 font-medium">As low as</span>
                <span class="text-lg font-black text-slate-950">$80.00 <span class="text-xs font-normal text-slate-500">/ release</span></span>
              </div>
              <div class="flex items-center gap-2">
                <a href="/services#catalog" class="text-xs font-black bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition shadow-xs">View Scope &amp; Rates →</a>
              </div>
            </div>
          </div>
        </div>`;

// Replace digital PR with both new GEO services
index = index.replace(oldCard4DigitalPr, newGeoServices);

// Also update Card 6 (Creative Video Editor VA) buttons & Card 7 (SEO Super Team VA) buttons
index = index.replace(/href="\/services\.html#catalog"/g, 'href="/services#catalog"');

fs.writeFileSync('index.html', index, 'utf8');
console.log("index.html fully overhauled with feedbacks!");

// =========================================================================
// 3. OVERHAUL SERVICES.HTML (STOREFRONT) & SYNC TO services/index.html
// =========================================================================
let services = fs.readFileSync('services.html', 'utf8').replace(/\r\n/g, '\n');

// 3.1 Replace /services.html with /services
services = services.replace(/href="\/services\.html(#?[^"]*)"/g, 'href="/services$1"');

// 3.2 Update Logo in services.html
services = services.replace(
  /<a href="\/" class="flex items-center gap-2 group min-touch" aria-label="JDP\.team Home">[\s\S]*?<\/a>/,
  newLogo
);

// 3.3 Add GEO YouTube Listicle as dedicated card in services.html
const youtubeCardHtml = `
        <!-- YouTube Listicle & Video Mentions (GEO) -->
        <article class="service-card group rounded-2xl border border-slate-200 bg-white p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300"
          data-category="content agent" data-agent="true" data-title="YouTube Listicle & Video Mentions (GEO)" data-tags="youtube video listicle mentions geo aeo brand citation visibility">
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">Video &amp; AI GEO</span>
            <span class="ml-auto text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">Guaranteed</span>
          </div>
          <h3 class="text-base font-extrabold text-slate-950 group-hover:text-brand-700 transition mb-1.5">YouTube Listicle &amp; Video Mentions (GEO)</h3>
          <p class="text-xs text-slate-500 mb-3">Guaranteed placement in ranking niche YouTube listicles. Cited in AI Overviews &amp; Perplexity.</p>
          <ul class="text-xs text-slate-600 space-y-1 mb-4 flex-1">
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Placement in ranking niche listicle videos</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>High-intent video brand mention + link in description</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Video SEO optimization for AI search engines</li>
          </ul>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Unbranded Report</span>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <span class="text-sm font-black text-slate-950">As low as $127/mo</span>
            <div class="flex gap-2">
              <button type="button" class="view-scope text-[11px] font-bold text-slate-500 hover:text-brand-600 transition py-1.5">View Scope</button>
              <a href="/contact.html?service=YouTube-Listicle-Mentions" class="text-[11px] font-bold bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition">Order Service</a>
            </div>
          </div>
          <div class="scope-data hidden">
            <p data-field="desc">We secure and place guaranteed brand mentions inside niche-relevant, ranking YouTube listicle videos that Google AI Overviews and Perplexity frequently index for commercial-intent queries.</p>
            <p data-field="deliverables">Guaranteed placement in 1 ranking video per month|Brand mention timestamp + description link|Live YouTube video URL report|AI indexation status audit</p>
            <p data-field="requirements">Target URL + product/brand overview|Target keyword angle|Call to action preference for video description</p>
          </div>
        </article>`;

// Insert this card into services.html catalog grid
services = services.replace('<div id="catalog-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">',
  '<div id="catalog-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">' + youtubeCardHtml);

// 3.4 Update authority bar in services.html to use the real visual logos
services = services.replace(
  /<section class="py-4 bg-slate-900 border-b border-slate-800" aria-label="Verified credentials">[\s\S]*?<\/section>/,
  newTrustBar
);

fs.writeFileSync('services.html', services, 'utf8');
fs.writeFileSync('services/index.html', services, 'utf8');
console.log("services.html and services/index.html updated!");

// =========================================================================
// 4. OVERHAUL CONTACT, CALCULATOR, PROOF INTERNAL URLS
// =========================================================================
['contact.html', 'calculator.html', 'proof.html'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  c = c.replace(/href="\/services\.html(#?[^"]*)"/g, 'href="/services$1"');
  // Update logo
  c = c.replace(/<a href="\/" class="flex items-center gap-2 group min-touch" aria-label="JDP\.team Home">[\s\S]*?<\/a>/, newLogo);
  // Remove "No Monthly Retainer Required" if present
  c = c.replace('No Monthly Retainer Required', '24-48h SLA Turnaround');
  fs.writeFileSync(f, c, 'utf8');
  console.log(`Updated ${f}`);
});

console.log("=== ALL OVERHAUL SCRIPTS COMPLETED SUCCESSFULLY ===");
