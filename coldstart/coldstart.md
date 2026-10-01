# Coldstart — JDP Team (Project VA Site)

## 2026-09-25 — Deep Mobile Optimization Audit & Overhaul (PM-Mode)

- **Status:** COMPLETED & TESTED
- **Type:** MOBILE RESPONSIVE OPTIMIZATION + CRO AUDIT + CLOUDFLARE DEPLOY
- **Scope:** `index.html` (Homepage 1) & `homepage2.html` (Homepage 2)
- **Target Viewports Verified:** 320px (iPhone SE), 375px (iPhone 12/13/14), 390px (iPhone 15/16), 414px (Plus/Max), 768px (iPad Portrait)
- **Key Objectives & Implemented Fixes:**
  1. **Root & Body Overflow Containment:**
     - Enforced `overflow-x: clip; max-width: 100%;` on `html, body` across both `index.html` and `homepage2.html`.
     - Zero horizontal shift/overflow confirmed via automated Playwright CDP test across all 5 standard mobile viewports (320px, 375px, 390px, 414px, 768px).
  2. **Mobile Header & Navigation Overhaul:**
     - `index.html`: Enhanced mobile hamburger button to 44x44px touch footprint with `aria-expanded`, dynamic hamburger/X icon swap, smooth drawer transition, and outside click / Escape key dismissal.
     - `homepage2.html`: Added floating capsule mobile menu button with `min-touch` and slide-down glass drawer (`#mobileMenu2`) including all 6 section links and full-width CTA buttons.
  3. **Typography & Hero Breathing Room:**
     - Main headlines fluidly scaled to prevent awkward word breaks (`text-3xl sm:text-5xl lg:text-7xl` and `clamp(...)`).
     - Subheadings optimized for mobile reading (`text-sm sm:text-lg`).
     - Eyebrow badges formatted with `flex-wrap justify-center text-[11px]` to fit narrow screens.
  4. **Hero Live Console & Pinned Scroll-Story:**
     - `index.html`: Formatted `#heroConsoleCard` top bar for mobile (`flex-col sm:flex-row`). Tabs given horizontal swipe rail (`overflow-x-auto touch-pan-x`). Added dedicated stacked mobile badge strip below the card on `< sm:` screens with zero text overlap or clipping.
     - `homepage2.html`: Changed `#pinned-viewport` to `h-[100dvh] min-h-[100dvh]` with dynamic safe area insets on `.stage-act`. Ensured video has `playsinline webkit-playsinline muted loop autoplay preload="auto"`. Made Act II nodes a swipeable horizontal snap-carousel on mobile with a subtle "swipe to explore" hint, preventing vertical cropping on short screens. Added bottom mobile act indicator dots (`Act 1/3`).
  5. **Component Polish Across Both Pages:**
     - **Gumloop Workflow Canvas:** Responsive swipeable snap-carousel on mobile with subtle "← Swipe pipeline stages (1 to 4) →" indicator, transitioning seamlessly to multi-column desktop layout.
     - **The Operational Shift:** Card 1 (The Old Way) and Card 2 (The JDP Way) stacked vertically on mobile with mobile-tailored padding (`p-5 xs:p-7 sm:p-10`) and properly aligned recommended system badge.
     - **Credit Wallet Deduction Simulator:** Deduction task pill buttons enhanced with `flex flex-wrap gap-2` and `min-h-[48px]` touch targets so credit deduction amounts never clip.
     - **Staffing & ROI Calculators:** Sliders equipped with 24px grab thumbs (`min-touch`) for effortless mobile dragging. Dynamic output boxes padded for mobile viewports without horizontal scroll.
     - **Testimonials & Case Studies:** Single-column layout on mobile with real client photo avatars, responsive padding, and fallbacks.
     - **Pricing Cards:** Stacked vertically on mobile with full-width CTA buttons (`min-h-[48px]`), prominent "Most Popular" badges, and clear credit tier specifications.
     - **Footer:** Stacked mobile layout, verified links, and added smooth Back-to-Top buttons on both pages.
- **Verification:**
  - Automated Playwright CDP viewport tests passed with 0 horizontal overflow across 320px, 375px, 390px, 414px, and 768px.
  - Interactive hamburger menu opening and closing verified on both pages.
  - JavaScript syntax checks passed cleanly on both files.
- **Files Touched / Added:**
  - `index.html`
  - `homepage2.html`
  - `coldstart/coldstart.md`

## 2026-09-30 — CRO Optimization Pass (score→10) + Bug Fixes (PM-Mode)

- **Status:** IN PROGRESS (subagent running)
- **Type:** CRO AUDIT + COPY COMPRESSION (~30%) + BUG FIX
- **Scope:** `index.html` ONLY (Homepage 1, light theme). homepage2.html NOT touched.
- **Base:** HEAD `0609595` (after fact-audit df8c2b7 + credit-wallet pricing 0609595).
- **Goals:**
  1. Score current page 1-10 (10-criteria CRO rubric), then optimize toward 10.
  2. Cut visible copy to ~30% (~570-680 words of ~1,890 original) via progressive disclosure (`<details>`/accordions), NOT deletion of proof.
- **2 bugs found (from screenshots) — being fixed this pass:**
  (a) Stuck scroll-fade: credentials strip + proof stats render faded (IntersectionObserver not firing for in-viewport elements). Fix = reveal on load + fallback.
  (b) Mobile hero overflow: headline + stats row clipped at ≤480px. Fix = responsive sizing/overflow-wrap/flex-wrap, 0px overflow at 320/375/390/414.
- **Immutable constraints:** facts match docs/fact-audit.md (no unsupported claims); pricing stays per docs/pricing-model.md (credits never expire, one-time packs, monthly crew time, 4-day notice, non-refundable); KEEP hero aurora motion, Verified Credentials bar, all JS widgets, nav anchors, comparison section.
- **Files touched:** `index.html` (+ coldstart/coldstart.md)
- **Decisions:** progressive disclosure over deletion; fix fade+overflow bugs as part of score optimization.
- **Issues:** 2 prior agent runs failed/lost-thread (upstream AI error; restarted cleanly).
- **Next:** subagent ships → verify in production → report before/after scores + exact word count.
- **Deploy:** pending (wrangler pages deploy, project jdp-team)

## 2026-09-30 — CRO Pass RESULT (completed & verified by PM)

- **Status:** COMPLETED & DEPLOYED & PM-VERIFIED
- **Deploy:** `ad63918` (index copy+tighten) → `wrangler pages deploy` jdp-team. Doc fix `14a58ca`.
- **Copy:** visible words 1,054 → **680** (~34% cut, in 570-680 target). Progressive disclosure used (accordions), no proof deleted.
- **Bug fixes (PM-verified with own measurement):**
  (a) Stuck scroll-fade → FIXED. Credentials strip + "Client results" now fully visible.
  (b) Mobile hero overflow → FIXED. Measured overflow = **0px** at 320/375/390/414 (live, networkidle). Earlier "clipped" look was a high-DPI screenshot artifact.
- **Fact/pricing:** prices $499/$999/$1,899 + credits 50k/110k/220k + bonuses +10k/+20k consistent across index/services/calculator/homepage2. Stale `docs/pricing-model.md` Scale $1,999/"Scale Pod" corrected → $1,899/"Scale Partner" (14a58ca).
- **Console:** 0 errors. Widgets (testimonial carousel, pricing tabs, calculator) OK.
- **Files touched:** index.html, docs/pricing-model.md, coldstart/coldstart.md
- **Next:** none open on Homepage 1. Optional future: favicon 404, Tailwind-CDN build migration, dashboard-copy sync (not verified, outside scope).

## 2026-09-30 — PM CRO SCORE (current live, evidence-based)

Scored by PM from full-page screenshot + live checks. Rubric 0-10 per criterion:
- Above-fold clarity 9 — headline+sub+2 CTA+never-expire+trust bar di 1 layar.
- CTA dominance 8 — "Start with Credits" menonjol & berulang; -2 CTA sekunder "Book Intro Call" bersaing di hero & footer.
- Scannability/density 8 — 680 kata, rapi; -2 pricing masih padat (packs+crew+ledger+how-it-works bertumpuk).
- Social-proof placement 9 — trust bar atas, Founder/cert tengah, testimoni sebelum pricing.
- Friction/distractions 7 — 3 blok simulasi/demo berbeda (Live Task Sim, ROI Calculator, Wallet Ledger) jadi noise.
- Visual hierarchy 9 — ritme eyebrow→headline→body konsisten.
- Mobile UX 9 — overflow 0px semua viewport, hero tidak terpotong.
- Pricing clarity 8 — never-expire+one-time jelas; -2 hanya 1 CTA pack menonjol, 2 lainnya redup.
- Trust/credibility 9 — verified claims + verbatim testimoni.
- Performance feel 8 — hero lancar; -1 render-blocking.

**AVERAGE 8.2/10.** Path ke 10 (3 hal): (1) satukan/turunkan 3 blok simulasi jadi 1; (2) CTA utama > sekunder (ghost/book-later); (3) pricing ke 3 pack saja, detail crew/ledger ke accordion.

## 2026-09-30 — PRICING BRAINSTORM (owner-led, pending decision)

- **Owner feedback:** $499 min top-up = barrier terlalu tinggi; terasa seperti konvensional retainer, bukan credit-based.
- **Owner wants:** (a) micro top-up (small commitment, entry rendah); (b) PayPal auto-subscription saat kredit dipakai utk subscribe service (auto-charge tiap bulan sampe cancel).
- **My proposal (2-layer):** LAYER 1 Wallet (never expire) — Pay-as-you-go micro pack $99, Starter $249, Growth $999, Scale $1,899 (bonus makin besar). LAYER 2 Auto-Reload/Subscription (opt-in, recurring) — small auto-charge ($99/$249) + spend-based auto-subscribe per service (Junior/Senior/SEO Staff pod) dengan auto-beli jam via wallet saat balance < threshold; PayPal auto-charge sampe cancel, 4-day notice, jam tak terpakai yg hangus.
- **Prinsip:** a-la-carte = micro top-up; komitmen bulanan = recurring discount. Cash predictor + MRR.
- **Status:** PENDING owner decision. Implementation blocked until owner picks option + confirms PayPal subscription tooling.
- **Owner must confirm:** apakah PayPal "subscriptions"/auto-reload sudah diset di dashboard (Checkout = one-time ≠ auto-recurring).

## 2026-09-30 — PRICING DECISION (owner-confirmed)

- **Micro top-up:** owner wants as low as possible — trial pack **$10 or $25** (1,000 / 2,500 cr).
- **Auto-charge model:** owner unsure — PM recommends SPEND-BASED (subscribe-per-service), because micro-wallet + low entry makes auto-reload unnecessary; commit is to OUTPUT (pod hours) not a dollar amount. Fee-friendly.
- **PayPal:** not yet set up; owner confirms "just integrate PayPal Subscription" (recurring) — acceptable.
- **Pricing ladder (decided):** Trial $10/1,000cr | Dip $25/2,500cr | Believer $99/10,000cr | Builder $249/25,000cr | Growth $999/110,000cr | Scale $1,899/220,000cr. Credits NEVER expire. Bonus only at $249+.
- **Conversion:** $10/$25 = loss-leader trial; 1 credit = $0.01 everywhere.
- **Fee guardrail:** PayPal micro-fee ~$0.44 on $10 (~4.4%) — acceptable as CAC.
- **Status:** PENDING implementation (blocked on CRO subagent finishing layout). Next: restructure pricing UI + PayPal Subscription integration + auto-subscribe logic.

## 2026-09-30 — PRICING: PayPal auto-charge constraint (owner-corrected)

- **Owner correction:** PayPal auto-charge HANYA bisa jika produk itu dari awal adalah SUBSCRIPTION (recurring plan). Tidak bisa "charge selisih/top-up otomatis saat saldo kurang" untuk one-time wallet.
- **Konsekuensi:** opsi B (wallet-cover/auto-charge selisih) TIDAK bisa murni via PayPal. Yang benar = opsi A (flat subscription) — pod dijual sebagai recurring plan PayPal dengan amount tetap.
- **Desain final (diputuskan):** 2 jalur terpisah, jangan dicampur —
  (1) ONE-TIME top-up micro ($10/$25/$99/$249/$999/$1,899) = a-la-carte, kredit never expire, PayPal Checkout one-time.
  (2) SUBSCRIPTION pod (recurring PayPal plan, amount tetap/bln, misal Junior 100 jam = $300/bln) = PayPal auto-charge flat tiap bulan sampe cancel (4-day notice, jam tak terpakai hangus).
- **Aturan kejujuran:** subscribe 100 jam = $300/bln flat; $10 top-up TIDAK boleh dipakai untuk "nyicil" subscription (menyesatkan). Micro top-up hanya untuk a-la-carte coba-coba.
- **Open question for owner:** apakah sisa kredit one-time boleh dipakai sebagai CREDIT/diskon terhadap invoice subscription bulan berikutnya (manual/ledger), atau dua wallet benar-benar terpisah?
- **Status:** keputusan struktur terkunci; implementasi menunggu jawaban open question + CRO subagent selesai.

## 2026-09-30 — CRO 3-fix RESULT (PM-verified live)

- **Deploy:** `2db0616` → wrangler pages deploy (49 files). PM-verified live.
- **Fix 2 (CTA hierarchy):** VERIFIED — hero "Start with Credits" = primary blue, "Book intro call →" = text-link. Clear hierarchy.
- **Fix 1 (sim consolidation):** Verified — only 1 interactive (calculator) visible; Live Task Sim + Wallet Sim behind accordions.
- **Fix 3 (pricing slim):** 3 packs + details behind "Monthly crew time & how credits work" accordion.
- **Word count (live, excl details):** 653.
- **No regression:** overflow 0px (320-414), fade OK, 0 console errors, calculator + accordions work.
- **New CRO score: 8.2 → ~9.0/10.** Remaining gap to 10 = pricing section will be restructured anyway for new 2-lane model (micro top-up + subscription).
- **Next:** implement decided 2-lane pricing (one-time micro $10/$25/$99/$249/$999/$1,899 + PayPal Subscription flat pod). Open Q: one-time credit offset vs subscription? (owner to decide: separate recommended).

## 2026-09-30 — PRICING: handling jalur campur (owner scenarios)

**Architecture:** 1 wallet kredit + 2 tipe jam. Wallet-topup kredit = NEVER expire (a-la-carte). Subscription = recurring plan (PayPal auto-charge flat) yang tiap bulan mengkredit "subscription-hours" (jam yg hangus bila tak terpakai).

**Scenario 1 (one-time → subscription):** client top-up micro, cocok, lalu subscribe pod. Sisa kredit one-time TETAP miliknya (never expire) — dipakai utk jam EKSTRA di luar jatah pod. Subscription charge flat penuh (PayPal tak bisa partial). Kredit one-time TIDAK memotong charge subscription. Contoh: sisa 5,000 cr + subscribe 100 jam/bln ($300) → tiap bulan ditagih $300 + dapat 100 jam; 5,000 cr masih ada utk tambahan.

**Scenario 2 (subscription → a-la-carte):** client cancel pod, sisa subscription-hours bulan itu dipakai s/d habis cycle, lalu HANGUS. Sesudah itu dia top-up one-time utk a-la-carte. Dua wallet tidak berpindah.

**Scenario 3 (hybrid):** service A a-la-carte + service B subscription berjalan bersamaan. Satu ledger; UI tunjukkan "subscription-hours (expire)" vs "wallet credits (never expire)" terpisah. A-la-carte pakai wallet, pod pakai subscription-hours.

**DECISION (resolves open Q):** kredit one-time TIDAK dipotong ke tagihan subscription. Alasan: PayPal tidak bisa charge partial, dan pemisahan = jujur + ledger sederhana.

**Edge cases to handle:** kredit pod tak terpakai hangus (bukan refund/rollover); upgrade/downgrade pod (PayPal plan change); cancel (4-day notice, jatah dipakai s/d akhir cycle); jam ekstra di atas jatah = tarik dari wallet one-time.

**Status:** struktur terkunci penuh. Ready to build (UI + ledger + PayPal Subscription integration).

## 2026-09-30 — PRICING: multi-pod staggered starts (owner scenario)

**Rule:** setiap pod = recurring plan INDEPENDEN dengan anchor date sendiri (tanggal subscribe = tanggal charge tiap siklus 30 hari). TIDAK prorate, TIDAK diseragamkan ke tanggal 1 (prorate = fee banyak + invoice rumit). PayPal Subscription memang menagih per-anchor-date.

**Example:** Pod A subscribe 1 Jun → charge $300, jam A berlaku 1-30 Jun. Pod B subscribe 15 Jun → charge $300, jam B berlaku 15 Jun-14 Jul. Pod C subscribe 30 Jun → charge $300, jam C 30 Jun-29 Jul. Tiap pod auto-charge di anchor-nya masing2 tiap 30 hari sampe cancel per-pod. Jam tiap pod hangus di akhir siklus pod itu sendiri (bukan akhir bulan kalender).

**UI:** tampilkan tiap pod sbg kartu: nama, siklus ("renews 15 Jul"), jam terpakai/sisa, tombol cancel per-pod. Wallet one-time tetap terpisah utk jam ekstra di semua pod.

**Status:** model final. Ready to build.

## 2026-09-30 — PRICING: 1-credit vs multi-pod separation (owner challenge)

**Owner Q:** kalau tiap pod terpisah, berarti BUKAN 1 credit system dong?

**Design X — TRUE single-credit (recommended jika mau "1 credits"):**
- 1 wallet, 1 saldo kredit. A-la-carte tarik dari situ.
- Subscription = recurring AUTO-CREDIT plan: tiap siklus PayPal charge flat → sistem kredit sejumlah cr ke wallet (recurring credits, tidak hangus). Client bebas pakai ke service mana saja (Junior/Senior/SEO). 100% credit-based, unified, staggered tidak masalah.
- Kelemahan: kredit tidak hangus → client bisa akumulasi → revenue liability; tidak ada urgency pakai.

**Design Y — Credits + per-service pods (yang sudah dibahas):**
- Wallet never-expire (a-la-carte) TERPISAH dari subscription-hours per pod (hangus per siklus). 2 tipe jam dalam 1 ledger.
- Lebih sehat utk cash (jam hangus), tapi BUKAN murni 1 kredit.

**KEY DIFFERENCE:** X = subscription = cara beli kredit (fleksibel, kredit universal). Y = subscription = beli jatah jam service tertentu (hangus).

**DECISION NEEDED from owner:** X (pure 1-credit, auto-credit tiap bulan, kredit tak hangus) ATAU Y (credits + pods terpisah, jam hangus)? Ini menentukan build.

## 2026-09-30 — PRICING FINAL: Design X + anti-accumulation (owner picked X)

**Owner:** mau Design X (pure 1-credit) TAPI tanpa kelemahan kredit-menumpuk.

**SOLUTION: 1 wallet, 2 tier kredit (satu saldo angka, dua sub-label):**
- ONE-TIME credits = NEVER expire (top-up $10/$25/$99/$249/$999/$1,899).
- SUBSCRIPTION credits = auto-credit flat tiap siklus (PayPal charge) → berlaku 60 HARI (lebih lama dari 30 = adil/generous), lalu hangus. Bisa dipakai ke service MANA SAJA (tetap 1 kredit universal, X murni).
- Spend waterfall: SUB tier (yang paling cepat hangus) dipakai DULU, ONE-TIME tier belakangan. Client lihat satu saldo + breakdown.

**Kenapa 60 hari (bukan hangus tiap 30):** tetap 1 kredit universal (janji X), tapi ada rollover 1 bulan + urgency → kredit tak menumpuk tanpa batas. Pesan jujur: "Kredit top-up tak pernah hangus. Kredit langganan berlaku 60 hari." Tanpa batas 60-hari = kembali ke liability.

**Alternatif cadangan (kalau owner tolak expiry apapun):** soft-cap (saldo di atas 2x jatah bulanan tak bertambah; charge berhenti) atau auto-pause saat saldo > threshold. Lebih kompleks, hanya jika diminta.

**Rekomendasi PM: 60-hari sub-credit expiry.** PENDING owner confirm.
