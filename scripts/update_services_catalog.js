const fs = require('fs');

let servicesHtml = fs.readFileSync('services.html', 'utf8').replace(/\r\n/g, '\n');

// 1. Add VA & AI Talent chip
const oldChips = `<button type="button" data-cat="agent" class="chip-btn px-4 py-2 rounded-full text-xs font-bold border transition-all bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white">AI Agent Tasks</button>`;
const newChips = `<button type="button" data-cat="va" class="chip-btn px-4 py-2 rounded-full text-xs font-bold border transition-all bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white">VA &amp; AI Talent</button>
        <button type="button" data-cat="agent" class="chip-btn px-4 py-2 rounded-full text-xs font-bold border transition-all bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white">AI Agent Tasks</button>`;

servicesHtml = servicesHtml.replace(oldChips, newChips);

// 2. Insert the authentic cards right at the beginning of #catalog-grid
const topNewCards = `        <!-- Core 1: Indonesian VA as AI Conductor (Notion Core) -->
        <article class="service-card group rounded-2xl border-2 border-brand-500 bg-white p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-brand-600 relative"
          data-category="va agent" data-agent="true" data-title="Indonesian VA (AI Conductor)" data-tags="va virtual assistant ai conductor manus openclaws cowork prompt automation indonesian talent">
          <div class="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand-600 text-white shadow-xs">
            ⭐ Core Offer
          </div>
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">VA &amp; AI Talent</span>
            <span class="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Immediate</span>
          </div>
          <h3 class="text-base font-extrabold text-slate-950 group-hover:text-brand-700 transition mb-1.5">Indonesian VA (AI Conductor)</h3>
          <p class="text-xs text-slate-500 mb-3">Orchestrate Manus, OpenClaws &amp; Cowork daily. Vetted creative Indonesian talent with async English fluency.</p>
          <ul class="text-xs text-slate-600 space-y-1 mb-4 flex-1">
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Runs Manus, OpenClaws &amp; Cowork setups</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Translates agency SOPs into AI prompt flows</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Audits output quality &amp; catches hallucinations</li>
          </ul>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">🏷️ 100% White-Label</span>
            <span class="text-[9px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">🤖 AI Stack Layer</span>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <span class="text-sm font-black text-slate-950">$3.00/hr</span>
            <div class="flex gap-2">
              <a href="/contact.html?service=AI-Conductor-VA" class="text-[11px] font-bold bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition">Hire VA</a>
            </div>
          </div>
        </article>

        <!-- Core 2: SEO Writing Subscription (jetdigitalpro.com) -->
        <article class="service-card group rounded-2xl border border-slate-200 bg-white p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300"
          data-category="content" data-agent="false" data-title="SEO Writing Subscription" data-tags="seo writing blog articles content marketing surferseo topical map keywords">
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">Content &amp; SEO</span>
            <span class="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Turnkey Blog</span>
          </div>
          <h3 class="text-base font-extrabold text-slate-950 group-hover:text-brand-700 transition mb-1.5">SEO Writing Subscription</h3>
          <p class="text-xs text-slate-500 mb-3">We run your client blogs end-to-end. Keywords, writing, SurferSEO 85+ score, custom graphics &amp; CMS upload.</p>
          <ul class="text-xs text-slate-600 space-y-1 mb-4 flex-1">
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>1,500+ words rank-ready article + schema</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Custom royalty-free images &amp; WebP optimization</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Direct staging to WordPress / Webflow</li>
          </ul>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">🏷️ 100% White-Label</span>
            <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">🏆 Award Winning</span>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <span class="text-sm font-black text-slate-950">From $15/art</span>
            <div class="flex gap-2">
              <a href="/contact.html?service=SEO-Writing-Subscription" class="text-[11px] font-bold bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition">Order Service</a>
            </div>
          </div>
        </article>

        <!-- Core 3: GEO Multimedia Refresh (jetdigitalpro.com) -->
        <article class="service-card group rounded-2xl border border-slate-200 bg-white p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300"
          data-category="content agent" data-agent="true" data-title="GEO Multimedia Refresh" data-tags="geo generative engine optimization perplexity chatgpt claude multimedia youtube podcast schema">
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">Visibility &amp; AI</span>
            <span class="ml-auto text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">AI Grounded</span>
          </div>
          <h3 class="text-base font-extrabold text-slate-950 group-hover:text-brand-700 transition mb-1.5">GEO Multimedia Refresh</h3>
          <p class="text-xs text-slate-500 mb-3">One article → YouTube video, podcast audio, infographic + rich schema so ChatGPT and Perplexity cite your domain.</p>
          <ul class="text-xs text-slate-600 space-y-1 mb-4 flex-1">
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Audio podcast snippet + YouTube video</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Infographic asset + structured entity JSON-LD</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Optimized for Perplexity, ChatGPT &amp; Gemini</li>
          </ul>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">🏷️ 100% White-Label</span>
            <span class="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">🤖 GEO Engine</span>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <span class="text-sm font-black text-slate-950">From $15/refresh</span>
            <div class="flex gap-2">
              <a href="/contact.html?service=GEO-Multimedia-Refresh" class="text-[11px] font-bold bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition">Order Service</a>
            </div>
          </div>
        </article>

        <!-- Core 4: Digital PR: Journalist Pitching (jetdigitalpro.com) -->
        <article class="service-card group rounded-2xl border border-slate-200 bg-white p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300"
          data-category="backlinks" data-agent="false" data-title="Digital PR & Journalist Pitching" data-tags="digital pr backlinks journalist outreach media placements press news editorial">
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">PR &amp; Authority</span>
            <span class="ml-auto text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">Editorial Links</span>
          </div>
          <h3 class="text-base font-extrabold text-slate-950 group-hover:text-brand-700 transition mb-1.5">Digital PR &amp; Journalist Pitching</h3>
          <p class="text-xs text-slate-500 mb-3">Stats article + targeted outreach to journalists. Agencies charge $5K — we fulfill wholesale for under $200.</p>
          <ul class="text-xs text-slate-600 space-y-1 mb-4 flex-1">
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Editorial links from real media newsrooms</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Original stats roundup article written</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Unbranded media coverage PDF report</li>
          </ul>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">🏷️ 100% White-Label</span>
            <span class="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">📰 DR 50–90</span>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <span class="text-sm font-black text-slate-950">~$105–$175</span>
            <div class="flex gap-2">
              <a href="/contact.html?service=Digital-PR-Pitching" class="text-[11px] font-bold bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition">Order Service</a>
            </div>
          </div>
        </article>

        <!-- Core 5: Creative Video Editor VA (jetdigitalpro.com + Notion) -->
        <article class="service-card group rounded-2xl border border-slate-200 bg-white p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300"
          data-category="va" data-agent="false" data-title="Creative Video Editor VA" data-tags="video editor va reels tiktok shorts captions indonesian talent creative culture">
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">Creative VA</span>
            <span class="ml-auto text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Overnight</span>
          </div>
          <h3 class="text-base font-extrabold text-slate-950 group-hover:text-brand-700 transition mb-1.5">Creative Video Editor VA</h3>
          <p class="text-xs text-slate-500 mb-3">Creative Indonesian video editors at $5/hr. Work async overnight — wake up to finished TikToks, Reels, and Shorts.</p>
          <ul class="text-xs text-slate-600 space-y-1 mb-4 flex-1">
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Fast-paced TikToks, Reels &amp; Shorts editing</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Engaging captions, motion graphics &amp; sound hooks</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Overnight delivery in GMT+7</li>
          </ul>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">🏷️ 100% White-Label</span>
            <span class="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">🎬 High Retention</span>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <span class="text-sm font-black text-slate-950">$5.00/hr</span>
            <div class="flex gap-2">
              <a href="/contact.html?service=Video-Editor-VA" class="text-[11px] font-bold bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition">Hire Editor</a>
            </div>
          </div>
        </article>

        <!-- Core 6: SEO Super Team VA (jetdigitalpro.com) -->
        <article class="service-card group rounded-2xl border border-slate-200 bg-white p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300"
          data-category="va technical" data-agent="false" data-title="SEO Super Team VA" data-tags="seo super team va senior qc junior pair audits onpage fixes cms uploads managed">
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">Agency Pod</span>
            <span class="ml-auto text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Managed Pair</span>
          </div>
          <h3 class="text-base font-extrabold text-slate-950 group-hover:text-brand-700 transition mb-1.5">SEO Super Team VA</h3>
          <p class="text-xs text-slate-500 mb-3">Senior QC + Junior Exec pair. Full site audits, on-page fixes, keyword research &amp; CMS uploads — managed.</p>
          <ul class="text-xs text-slate-600 space-y-1 mb-4 flex-1">
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Dual-check quality assurance by Senior QC</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Technical crawl repairs &amp; internal link fixes</li>
            <li class="flex gap-1.5"><span class="text-brand-600 font-bold">✓</span>Integrated directly into your ClickUp or Slack</li>
          </ul>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">🏷️ 100% White-Label</span>
            <span class="text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">⚡ Managed Pair</span>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <span class="text-sm font-black text-slate-950">$7.00/hr pair</span>
            <div class="flex gap-2">
              <a href="/contact.html?service=SEO-Super-Team" class="text-[11px] font-bold bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition">Book Pod</a>
            </div>
          </div>
        </article>
`;

servicesHtml = servicesHtml.replace('<div id="catalog-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">\n', '<div id="catalog-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">\n' + topNewCards + '\n');

fs.writeFileSync('services.html', servicesHtml, 'utf8');
console.log("services.html updated with authentic JDP + Notion services!");
