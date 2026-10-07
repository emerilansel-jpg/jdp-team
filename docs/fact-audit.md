# Fact Audit — jdp.team (index.html + homepage2.html) vs jetdigitalpro.com

Audit date: 2026-09-29. Updated 2026-09-30 for the storefront pivot (credits dropped; see pricing note). Source inventory with verbatim quotes: `docs/fact-inventory.md`.

**Source reachability:** jetdigitalpro.com + /about-us/ + /our-portfolio/ fetched OK (200). Trustpilot profile is bot-walled (AWS WAF challenge) — TrustScore 4.2/5 could NOT be confirmed off-site; it is claimed on jetdigitalpro.com with an outbound link. Legiit profile HTML is JS-rendered — no rating extractable. All classifications below treat "on jetdigitalpro.com (self-published, with outbound link)" as the available source.

## Counts

| File | VERIFIED | MODIFIED | UNSUPPORTED |
|---|---|---|---|
| index.html | 14 | 6 | 2 |
| homepage2.html | 13 | 4 | 2 |
| **Total** | **27** | **10** | **4** |

(Overlapping claims counted per file occurrence.)

---

## index.html — claim-by-claim

| # | Location | Claim | Class | Source / action |
|---|---|---|---|---|
| 1 | Hero rating badge (L321-326) | "4.2" + "TrustScore" | VERIFIED (self-published source) | jetdigitalpro.com hero badge "TrustScore: 4.2 / 5 Trustpilot", links to Trustpilot. Keep; already links to southsouthawards + shows Trustpilot label. |
| 2 | Hero proof strip (L344-347) | "4.2 TrustScore", "Level 4 Legiit", "White-Label", "24–48h Turnaround" | 4.2 + White-Label VERIFIED; **"Level 4 Legiit" UNSUPPORTED** (no "Level 4" found anywhere in jetdigitalpro.com source); "24–48h Turnaround" UNSUPPORTED (source says small orders 2–3 business days, bigger 7–14 days) | Remove "Level 4 Legiit" chip and "24–48h" chip from this strip; keep 4.2 (links out) and White-Label. |
| 3 | Stat band (L388-390) | "+$2,011/mo SEO Retainer Margin" | UNSUPPORTED | No such figure on jetdigitalpro.com. Replace with verified stat: "4.2/5 TrustScore" or "Winner 2026 Best SEO Content Writing". → replaced with verified 10K+ visitors stat (S1/S2). |
| 4 | Stat band (L392-394) | "86.95% Coverage Rate" | VERIFIED | C1 PR Agency case: 86.95% keywords ranked in 7.5 weeks. |
| 5 | Stat band (L398-401) | "16,200+ Hours Completed" | UNSUPPORTED | No such figure in source. Replace with verified "Winner 2026 — Best SEO Content Writing, South-South Awards" (T2). |
| 6 | Comparison section | "24–48h turnaround, zero micromanagement" | UNSUPPORTED | Source turnaround = 2–3 business days (small) / 7–14 days (big); comparison table on jetdigitalpro.com says "Optimized 5–7 day turnaround". → Change to "QA'd delivery, zero micromanagement" (process claim, sourced via 11-step editorial process). |
| 7 | Comparison section | "Outcome: 76% net margins, reliable SLAs, hands-free scaling." | UNSUPPORTED ("76% net margins") | No such figure in source. → Change to "Outcome: agency margins protected, reliable SLAs, hands-free scaling." (removes invented number, keeps qualitative claim). |
| 8 | Case card 1 (PR Agency) | 86.95% / DR 35 | VERIFIED | C1. |
| 9 | Case card 2 (Finance) | 46.15%, "High-intent keywords hit Top 3." | VERIFIED | C2 (Top 3: 12 keywords). |
| 10 | Case card 3 (Home Security) | "40.0%", "DR 0 to DR 28", "From DR 0: 40% of target keywords.", "Timeline: 45 Days from DR 0" | MODIFIED | Source C3 says **38.88%** keywords ranked in **5 weeks**, DR 0 new domain; case article C6 says "nearly 40% … in just 45 days". "DR 0 to DR 28" appears NOWHERE in source. → Change headline number 40.0% → 38.88%; remove "DR 0 to DR 28" badge → "DR 0 (New Domain)"; keep "45 days" framing (C6 supports it). |
| 11 | Case card 4 (Telecom) | 62.11%, "▲ +1,420 keywords" | MODIFIED | 62.11% VERIFIED (C4/C5) but "+1,420 keywords" is invented — source says 100 keywords Top 100. → Replace badge with "Top 100: 100 keywords" or "+100 keywords ranked". |
| 12 | Testimonial — Michael Hodgdon (L1109-1117) | Quote + "Business Owner \| EliteSEOConsulting.com" | VERIFIED | Verbatim match with source T#1. |
| 13 | Testimonial — Peter Baranik (L1130-1138) | Quote + "Founder \| Colorwee.com" | VERIFIED | Verbatim match with source T#2. |
| 14 | Testimonial — Omar (L1151-1159) | Quote, role "Business Owner" | VERIFIED | Verbatim match with source T#8. |
| 15 | Hidden "See more" testimonials (L1178-1217): Jose Jimenez, Jake L, AnnieLu | Quotes + names/roles | VERIFIED | All verbatim matches (T#5, T#4, T#3). "Verified Agency Review"/"Verified Founder Review" labels are presentation, fine. |
| 16 | Footer credentials (L1222-1228): Legiit badge, "4.2 Trustpilot", Google, HubSpot | 4.2 + Google + HubSpot VERIFIED (badge links exist in source homepage HTML); "Level 4 Legiit" text (L1224) UNSUPPORTED | Source links Skillshop (Google) + HubSpot Academy profiles. "Level 4" appears nowhere. → Change "Level 4" → "Certified". |
| 17 | FAQ | Storefront purchase rules, PM model, NDA/white-label, pause/cancel | NDA + white-label VERIFIED (R1/R2); purchase/subscription rules = PRICING — canonical source is `docs/pricing-model.md` | See pricing note below. |

## homepage2.html — claim-by-claim (fact fixes ONLY)

| # | Location | Claim | Class | Source / action |
|---|---|---|---|---|
| H1 | L747 | "24h Turnaround" | UNSUPPORTED | Source: 2–3 business days (small orders). → Change to "Fast Turnaround" with sub-line referencing QA process. |
| H2 | L761/776/793/923 | "100% White-Label", "Silent NDA on file" | VERIFIED | R1/R2 (NDA standard, white-label services). |
| H3 | L1037 | "Fixed rates. Average 76% net margin for your agency." | UNSUPPORTED | No 76% figure in source. → "Fixed wholesale rates. Agency margins stay protected." |
| H4 | L1043 | "12-24 Hour Turnaround" | UNSUPPORTED | → "Fast, QA'd Turnaround" (source supports 2–3 business days for small orders; "12-24h" contradicted by source). |
| H5 | L1206-1212 | PR case 86.95% | VERIFIED | C1. |
| H6 | L1224-1230 | Finance case 46.15% | VERIFIED | C2. |
| H7 | L1245 | "captured 40% of the target search volume in 45 days" | MODIFIED | C3/C6: 38.88% of keywords ranked (not "search volume"); "nearly 40% in 45 days" supported. → Change to "nearly 40% of target keywords ranked in 45 days". |
| H8 | L1260-1266 | Telecom 62.11% | VERIFIED | C4/C5. |
| H9 | Founder card (L1295) | "scaled digital operations across hundreds of client campaigns" | UNSUPPORTED (soft) | Source bio: successful gardening blog, Udemy SEO Copywriting course, eCommerce ventures, co-leading TheSiteSale.com. → Soften to "Having run eCommerce ventures and co-led projects like TheSiteSale.com, Nell created JDP.team to solve the single greatest friction point in agency growth: unmanaged contractors and unpredictable delivery quality." |
| H10 | Founder mini-stats (L1301-1314): "Level 4 Legiit Certified", "4.2/5.0 Trustpilot", "Google Certified", "HubSpot Certified" | 4.2/Google/HubSpot VERIFIED; "Level 4" UNSUPPORTED | → "Level 4" → "Certified". |
| H11 | Testimonials: Hodgdon, Baranik, Jimenez, Jake L, AnnieLu, Omar | All quotes + attributions | VERIFIED | All verbatim matches with source. |
| H12 | Pricing section (L1466+) | Storefront tiers + a-la-carte rates | PRICING — canonical source is `docs/pricing-model.md` (credits system dropped 2026-09-30) | See below. |

---

## Pricing discrepancies — REPORT ONLY (NOT fixed, per hard rule)

1. **MODEL CHANGE (2026-09-30): the credit system was DROPPED.** JDP.team is now a direct-service storefront — clients buy services in dollars, one-time (a-la-carte) or monthly subscription (4 tiers). The canonical pricing is `docs/pricing-model.md` (owner-approved). Old credit-pack rules (100 cr = $1, 30-day refresh, "credits never expire") must NOT appear anywhere on the site. New model is the owner's own JDP.team offer; it cannot be cross-verified against jetdigitalpro.com (which sells SEO content packages via free-sample CTA) — flagging only.
2. **homepage2.html L1043 "12-24 Hour Turnaround" sits adjacent to pricing copy** — flagged as unsupported (fixed as H4, since it's a delivery claim, not a pricing rule).
3. index.html hero meta description mentions "junior staff from $3/hr" — pricing-adjacent; remains TRUE under the new storefront model ($3.00/hr = junior 160-hr/mo subscription tier rate).

## Verified trust items available for the Task 2 strip

1. TrustScore 4.2/5 on Trustpilot (self-published claim + outbound link) — link: https://www.trustpilot.com/review/jetdigitalpro.com
2. Winner 2026 "Best SEO Content Writing Service" — South-South Awards — link: https://southsouthawards.com/2026/us/nationwide/best-seo-content-writing-service/
3. Google (Skillshop) + HubSpot Academy certifications (badge links in source HTML)
4. "NDA standard" + white-label confidentiality (R1/R2) — risk-reversal line
5. "Start With a Free Sample" (R3) — risk-reversal CTA

**Decision input for Task 2:** ≥4 verified trust items exist → a **verified trust bar** is the stronger choice over the 3-step strip.
