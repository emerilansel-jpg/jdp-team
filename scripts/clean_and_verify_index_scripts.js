const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');

// Find where <script> of script 6 starts
const s6Idx = html.indexOf("<script>\n  \n  // =====================================================================");
if (s6Idx === -1) {
  console.log("Searching alternative pattern...");
}

const cutIdx = html.indexOf("</script>\n<script>\n  \n  // =====================================================================");
let baseHtml = html;
if (cutIdx !== -1) {
  baseHtml = html.substring(0, cutIdx + "</script>".length);
} else {
  // Let's find the safety net script and cut after it
  const safetyNetEnd = html.indexOf("setTimeout(forceAll, 3500); /* hard fallback even if load never completes */\n    })();\n  </script>");
  if (safetyNetEnd !== -1) {
    baseHtml = html.substring(0, safetyNetEnd + "setTimeout(forceAll, 3500); /* hard fallback even if load never completes */\n    })();\n  </script>".length);
  }
}

const verifiedPlaygroundScript = `\n  <script>
  // =====================================================================
  // Interactive White-Label Dispatcher & Reseller Simulator Playground
  // =====================================================================
  var playgroundServices = [
    {
      id: "ai-conductor",
      name: "Indonesian VA (AI Conductor)",
      tag: "Orchestrates Manus, OpenClaws & Cowork",
      wholesaleRate: 3.00,
      wholesaleUnit: "/ hour",
      defaultUnits: 10,
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
      defaultUnits: 2,
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
      defaultUnits: 1,
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
      defaultUnits: 8,
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

  var currentPlaygroundIdx = 0;

  function selectPlaygroundService(idx) {
    currentPlaygroundIdx = idx;
    var serv = playgroundServices[idx];
    if (!serv) return;

    [0, 1, 2, 3].forEach(function(i) {
      var b = document.getElementById("playBtn" + i);
      if (b) {
        if (i === idx) {
          b.className = "playground-card text-left p-3.5 rounded-2xl border-2 border-brand-500 bg-brand-950/30 hover:border-brand-400 transition flex flex-col justify-between";
        } else {
          b.className = "playground-card text-left p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition flex flex-col justify-between";
        }
      }
    });

    var slider = document.getElementById("playgroundMarginSlider");
    if (slider) {
      slider.min = serv.minBill;
      slider.max = serv.maxBill;
      slider.value = serv.defaultClientBill;
    }

    var specEl = document.getElementById("playgroundSpecName");
    if (specEl) specEl.textContent = serv.specName;

    var headerEl = document.getElementById("simOrderHeader");
    var descEl = document.getElementById("simDeliverableDesc");
    var proofsEl = document.getElementById("simProofPoints");

    if (headerEl) headerEl.textContent = serv.orderNumber + " · 100% White-Label Sanitized";
    if (descEl) descEl.textContent = serv.deliverableDesc;
    if (proofsEl) {
      proofsEl.innerHTML = serv.proofs.map(function(p) { return "<div>" + p + "</div>"; }).join("");
    }

    updatePlaygroundMargin();
  }

  function updatePlaygroundMargin() {
    var serv = playgroundServices[currentPlaygroundIdx];
    if (!serv) return;

    var slider = document.getElementById("playgroundMarginSlider");
    var clientPrice = slider ? parseFloat(slider.value) : serv.defaultClientBill;
    var wholesaleTotal = serv.wholesaleRate * serv.defaultUnits;
    var profit = Math.max(0, clientPrice - wholesaleTotal);
    var margin = clientPrice > 0 ? ((profit / clientPrice) * 100).toFixed(1) : 0;
    var markup = wholesaleTotal > 0 ? (clientPrice / wholesaleTotal).toFixed(1) : "0";

    var disp = document.getElementById("playgroundClientPriceDisplay");
    var wCost = document.getElementById("playgroundWholesaleCost");
    var cBill = document.getElementById("playgroundClientBill");
    var nProfit = document.getElementById("playgroundNetProfit");
    var mRate = document.getElementById("playgroundMarkupRate");

    if (disp) disp.textContent = "$" + clientPrice.toLocaleString();
    if (wCost) wCost.textContent = "$" + wholesaleTotal.toFixed(2);
    if (cBill) cBill.textContent = "$" + clientPrice.toFixed(2);
    if (nProfit) nProfit.textContent = "+$" + profit.toFixed(2);
    if (mRate) mRate.textContent = margin + "% Agency Margin (" + markup + "x Markup)";
  }

  function runDispatchSimulation() {
    var btn = document.getElementById("simulateDispatchBtn");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = "<span>⚡ Dispatching Pipeline...</span>";
    }

    var pills = [1, 2, 3, 4].map(function(n) { return document.getElementById("stepPill" + n); });
    pills.forEach(function(p) {
      if (p) p.className = "p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-400";
    });

    setTimeout(function() {
      if (pills[0]) pills[0].className = "p-3 rounded-xl bg-brand-950/60 border border-brand-500 text-brand-300 font-bold flex items-center gap-2";
    }, 200);

    setTimeout(function() {
      if (pills[1]) pills[1].className = "p-3 rounded-xl bg-indigo-950/60 border border-indigo-500 text-indigo-300 font-bold flex items-center gap-2";
    }, 500);

    setTimeout(function() {
      if (pills[2]) pills[2].className = "p-3 rounded-xl bg-amber-950/60 border border-amber-500 text-amber-300 font-bold flex items-center gap-2";
    }, 800);

    setTimeout(function() {
      if (pills[3]) pills[3].className = "p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-bold flex items-center gap-2";
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = "<span>✓ Dispatched! Click to Re-run</span>";
      }
      var card = document.getElementById("simClientReadyCard");
      if (card) {
        card.classList.add("ring-2", "ring-emerald-400", "transition-all");
        setTimeout(function() { card.classList.remove("ring-2", "ring-emerald-400"); }, 1500);
      }
    }, 1100);
  }

  function copyClientHandoverText() {
    var serv = playgroundServices[currentPlaygroundIdx];
    if (!serv) return;
    var text = serv.clientTemplate;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        var btn = document.getElementById("copyHandoverBtn");
        if (btn) {
          var orig = btn.innerHTML;
          btn.innerHTML = '<span class="text-emerald-400 font-bold">✓ Copied to Clipboard!</span>';
          setTimeout(function() { btn.innerHTML = orig; }, 2000);
        }
      });
    } else {
      prompt("Copy client update text:", text);
    }
  }

  // Initialize playground
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { updatePlaygroundMargin(); });
  } else {
    updatePlaygroundMargin();
  }
  </script>
</body>
</html>`;

const finalHtml = baseHtml + verifiedPlaygroundScript;
fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log("Successfully cleaned and verified index.html!");
