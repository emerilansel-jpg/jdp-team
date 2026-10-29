const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');

// =========================================================================
// 1. HEADER: SINGLE DOMINANT CTA TO /services.html (REMOVE BOOK INTRO CALL)
// =========================================================================
const oldHeaderDesktopCta = `<div class="hidden sm:flex items-center gap-3">
        <a href="/contact.html" class="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-slate-300 btn-motion">
          Book Intro Call
        </a>
        <a href="/services.html" class="px-4.5 py-2.5 rounded-xl text-xs font-extrabold bg-brand-600 hover:bg-brand-700 text-white btn-motion shadow-md flex items-center gap-1.5">
          <span>🛒</span>
          <span>White-Label Storefront</span>
        </a>
      </div>`;

const newHeaderDesktopCta = `<div class="hidden sm:flex items-center gap-3">
        <a href="/services.html" class="px-5 py-2.5 rounded-xl text-xs font-black bg-brand-600 hover:bg-brand-500 text-white btn-motion shadow-md shadow-brand-600/20 flex items-center gap-2 transition hover:scale-105 active:scale-95">
          <span>🛒 Browse Storefront &amp; Rates</span>
          <span>→</span>
        </a>
      </div>`;

html = html.replace(oldHeaderDesktopCta, newHeaderDesktopCta);

// Mobile drawer header buttons
const oldMobileDrawerBtns = `<div class="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2.5">
        <a href="/contact.html" class="w-full py-3 min-touch rounded-xl text-xs font-bold text-slate-800 border border-slate-300 hover:bg-slate-50 text-center flex items-center justify-center shadow-xs">
          Book Intro Call
        </a>
        <a href="/services.html" class="w-full py-3 min-touch rounded-xl text-xs font-extrabold bg-brand-600 hover:bg-brand-700 text-white text-center flex items-center justify-center gap-1.5 shadow-md">
          <span>🛒</span>
          <span>White-Label Storefront</span>
        </a>
      </div>`;

const newMobileDrawerBtns = `<div class="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
        <a href="/services.html" class="w-full py-3.5 min-touch rounded-xl text-sm font-black bg-brand-600 hover:bg-brand-700 text-white text-center flex items-center justify-center gap-2 shadow-md">
          <span>🛒 Browse 40+ Services &amp; Rates</span>
          <span>→</span>
        </a>
      </div>`;

html = html.replace(oldMobileDrawerBtns, newMobileDrawerBtns);

// =========================================================================
// 2. HERO: SINGLE UNIFIED CTA + RISK REVERSAL MICRO-COPY
// =========================================================================
const oldHeroCtaGroup = `<div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto mb-10 w-full px-2">
        <a href="/services.html" class="w-full sm:w-auto px-7 py-4 rounded-xl text-sm sm:text-base font-extrabold bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-600/25 btn-motion min-touch flex items-center justify-center gap-2.5">
          <span>🛒 Browse 40+ White-Label Wholesale Services</span>
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </a>
        <a href="/contact.html" class="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-bold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm btn-motion min-touch flex items-center justify-center gap-2">
          <span>Hire a Dedicated Pod →</span>
        </a>
      </div>`;

const newHeroCtaGroup = `<div class="max-w-xl mx-auto mb-10 w-full px-2 flex flex-col items-center">
        <a href="/services.html" class="w-full sm:w-auto px-9 py-4.5 rounded-2xl text-base sm:text-lg font-black bg-brand-600 hover:bg-brand-500 text-white shadow-2xl shadow-brand-600/35 btn-motion min-touch flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <span>🛒 Browse 40+ White-Label Services &amp; Rates</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </a>
        <!-- High-Converting Risk Reversal Micro-Copy -->
        <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-500 font-semibold mt-4">
          <span class="flex items-center gap-1"><span class="text-emerald-500 font-bold">✓</span> As low as $3/hr</span>
          <span class="flex items-center gap-1"><span class="text-emerald-500 font-bold">✓</span> 100% White-Label NDA</span>
          <span class="flex items-center gap-1"><span class="text-emerald-500 font-bold">✓</span> No Monthly Retainer Required</span>
        </div>
      </div>`;

html = html.replace(oldHeroCtaGroup, newHeroCtaGroup);

// =========================================================================
// 3. AI BRIDGE CTA: SINGLE DESTINATION TO /services.html
// =========================================================================
const oldAiBridgeCtas = `<div class="flex flex-wrap items-center gap-3 pt-2">
            <a href="/contact.html?service=AI-Agent-Bridge" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm transition shadow-sm">
              <span>Connect your agent or workflow →</span>
            </a>
            <a href="#pricing" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition border border-slate-700">
              <span>See Pricing</span>
            </a>
          </div>`;

const newAiBridgeCtas = `<div class="flex flex-wrap items-center gap-3 pt-2">
            <a href="/services.html" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs sm:text-sm transition shadow-lg shadow-brand-600/25">
              <span>🛒 Browse AI Conductor &amp; Human Tasks →</span>
            </a>
          </div>`;

html = html.replace(oldAiBridgeCtas, newAiBridgeCtas);

// =========================================================================
// 4. FEATURED OFFERS CARDS: CONSISTENT CTAS TO /services.html#catalog
// =========================================================================
html = html.replace(/<a href="\/contact\.html\?service=AI-Conductor-VA" class="text-xs font-extrabold bg-brand-600 hover:bg-brand-500 text-white px-3\.5 py-2 rounded-xl transition shadow-xs">Hire VA →<\/a>/g,
  `<a href="/services.html#catalog" class="text-xs font-black bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl transition shadow-xs">View Scope &amp; Rates →</a>`);

html = html.replace(/<a href="\/contact\.html\?service=Video-Editor-VA" class="text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-3\.5 py-2 rounded-xl transition shadow-xs">Hire Editor →<\/a>/g,
  `<a href="/services.html#catalog" class="text-xs font-black bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition shadow-xs">View Scope &amp; Rates →</a>`);

html = html.replace(/<a href="\/contact\.html\?service=SEO-Super-Team" class="text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-3\.5 py-2 rounded-xl transition shadow-xs">Book Pod →<\/a>/g,
  `<a href="/services.html#catalog" class="text-xs font-black bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition shadow-xs">View Scope &amp; Rates →</a>`);

html = html.replace(/<a href="\/services\.html#catalog" class="text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-3\.5 py-2 rounded-xl transition shadow-xs">Order →<\/a>/g,
  `<a href="/services.html#catalog" class="text-xs font-black bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition shadow-xs">View Scope &amp; Rates →</a>`);

// =========================================================================
// 5. WHOLESALE STOREFRONT BANNER: SINGLE DOMINANT CTA
// =========================================================================
const oldBannerCtas = `<div class="flex flex-wrap items-center justify-center gap-3.5">
            <a href="/services.html" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-sm sm:text-base transition shadow-xl shadow-brand-900/50">
              <span>🛒 Explore All Services in Storefront</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/></svg>
            </a>
            <a href="/contact.html" class="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base transition border border-slate-700">
              <span>Custom Scope / Dedicated Pod →</span>
            </a>
          </div>`;

const newBannerCtas = `<div class="flex flex-col items-center justify-center gap-3">
            <a href="/services.html" class="inline-flex items-center gap-2.5 px-9 py-4.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-base sm:text-lg transition shadow-2xl shadow-brand-900/60 hover:scale-105 active:scale-95">
              <span>🛒 Open 40+ Services Storefront &amp; Pricing</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/></svg>
            </a>
            <span class="text-xs text-slate-400">
              Need custom volume or a dedicated enterprise pod? <a href="/contact.html" class="underline text-brand-300 hover:text-white font-semibold">Talk to operations →</a>
            </span>
          </div>`;

html = html.replace(oldBannerCtas, newBannerCtas);

// =========================================================================
// 6. FINAL BOTTOM SECTION CTA: SINGLE DOMINANT CTA TO /services.html
// =========================================================================
const oldFinalCtas = `<div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="/services.html#pricing" class="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-600/30 btn-motion">
          See Services & Pricing
        </a>
        <a href="/contact.html" class="min-touch inline-flex items-center justify-center px-3 py-2 text-sm font-semibold text-slate-400 hover:text-white underline underline-offset-4 decoration-slate-600 hover:decoration-white transition-colors">
          Book intro call →
        </a>
      </div>`;

const newFinalCtas = `<div class="mt-10 flex flex-col items-center justify-center gap-3.5">
        <a href="/services.html" class="w-full sm:w-auto px-10 py-5 rounded-2xl text-lg font-black bg-brand-600 hover:bg-brand-500 text-white shadow-2xl shadow-brand-600/40 btn-motion flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95">
          <span>🛒 Browse 40+ White-Label Services &amp; Rates</span>
          <span>→</span>
        </a>
        <div class="text-xs text-slate-400">
          Prefer a direct consultation first? <a href="/contact.html" class="underline text-brand-400 hover:text-white font-semibold">Book an intro call →</a>
        </div>
      </div>`;

html = html.replace(oldFinalCtas, newFinalCtas);

// =========================================================================
// 7. STICKY MOBILE CONVERSION BAR (CRO 10/10)
// =========================================================================
const stickyMobileBarHtml = `
  <!-- Sticky Mobile Conversion Bar (CRO 10/10 Focus) -->
  <aside id="stickyMobileCta" aria-label="Quick Action" class="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 sm:hidden transition-transform duration-300 translate-y-full shadow-2xl">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <div class="text-xs font-black text-white truncate">100% White-Label Fulfillment</div>
        <div class="text-[10px] text-brand-400 font-bold truncate">As low as $3/hr · 0% vendor leak</div>
      </div>
      <a href="/services.html" class="shrink-0 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs shadow-md shadow-brand-600/30 flex items-center gap-1.5 active:scale-95 transition">
        <span>🛒 Storefront</span>
        <span>→</span>
      </a>
    </div>
  </aside>
`;

// Insert sticky bar before </body>
html = html.replace('</body>', stickyMobileBarHtml + '\n</body>');

// Add scroll listener for sticky mobile bar inside the last script tag
const oldScriptEnd = '</script>\n</body>';
const newScriptEnd = `
  // Sticky Mobile CTA Bar visibility trigger
  window.addEventListener('scroll', function() {
    var bar = document.getElementById('stickyMobileCta');
    if (!bar) return;
    if (window.scrollY > 350) {
      bar.classList.remove('translate-y-full');
    } else {
      bar.classList.add('translate-y-full');
    }
  }, { passive: true });
</script>
</body>`;

html = html.replace(oldScriptEnd, newScriptEnd);

fs.writeFileSync('index.html', html, 'utf8');
console.log("CRO EXPERT OVERHAUL COMPLETE: 10/10 Unified Funnel to /services.html applied!");
