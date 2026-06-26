/* case-study.js - the expand-from-card case-study experience.

   The lead internship's right-hand K-line card is the SOURCE element. Clicking
   the lead block (or its persistent "View Case Study ↗" CTA) FLIP-expands a
   frosted-glass detail layer out of that card's exact rect, up to ~88% of the
   viewport, then reveals a USAFacts-style long-form article that scrolls inside
   the layer (the chart scrolls away naturally (it is not sticky)). Closing runs
   the expansion in reverse, collapsing the layer back into the card. No route
   change, no white flash, no centred modal. Vanilla JS + a FLIP transform. */
(function () {
  "use strict";

  const OPEN_MS = 620;
  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  const esc = (s) => String(s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  let overlay, layer, backdrop, scroller, slotEl;
  let clipEl, panEl, chartHome, chartNext;          // the REAL K-line, borrowed during a case
  let borrowEl, elHome, elNext, phEl;               // a borrowed DOM element (dd-graph) during a case
  let textFly = null;                               // floating clone of the centre-node name during a text morph
  let activeId = "sifra", morphKind = "chart", activePaper = null;
  let isOpen = false, animating = false, savedScrollY = 0;
  let startRect = null, flyStart = 0, flyDir = 1, trackId = 0, lastSlot = null;

  // ── content: case-study copy + data (objective voice, no first/second person) ──
  function caseData() {
    if (activeId === "gaoke") return caseDataGaoke();
    if (activeId === "yinhua") return caseDataYinhua();
    if (activeId === "sinosafe") return caseDataSinosafe();
    if (activeId === "redsea") return caseDataRedsea();
    if (activeId === "ailabor") return caseDataAilabor();
    if (activeId === "socialcapital") return caseDataSocialCapital();
    if (activeId === "paper") return caseDataPaper();
    if (activeId === "aicycle") return caseDataAiCycle();
    if (activeId === "paperfactory") return caseDataPaperFactory();
    if (activeId === "productfactory") return caseDataProductFactory();
    if (activeId === "quantfactor") return caseDataQuantFactor();
    if (activeId === "decisionengine") return caseDataDecisionEngine();
    if (activeId === "rclab") return caseDataRclab();
    if (activeId === "investmentviews") return caseDataInvestmentViews();
    if (activeId === "competitions") return caseDataCompetitions();
    return caseDataSifra();
  }
  function caseDataRclab() {
    return { rclab: true, morph: "plain" };
  }
  function caseDataInvestmentViews() {
    return { investmentviews: true, morph: "plain" };
  }
  function caseDataCompetitions() {
    return { competitions: true, morph: "plain" };
  }
  function caseDataDecisionEngine() {
    return { decisionengine: true, morph: "plain" };
  }
  function caseDataQuantFactor() {
    return { quantfactor: true, morph: "plain" };
  }
  function caseDataProductFactory() {
    return { productfactory: true, morph: "plain" };
  }
  function caseDataPaperFactory() {
    return { paperfactory: true, morph: "plain" };
  }
  function caseDataAiCycle() {
    return { aicycle: true, morph: "plain" };
  }
  function caseDataPaper() {
    return { paper: true, morph: "plain", slug: activePaper };
  }
  function caseDataSocialCapital() {
    return {
      socialcapital: true,
      morph: "plain",
      disclaimer: "Behavioral and field economics research design. Field figures describe the tutoring program scale. Interactive widgets show illustrative model logic, not final empirical estimates.",
      it: { companyShort: "Social Capital Formation" }
    };
  }
  function caseDataAilabor() {
    return {
      ailabor: true,
      morph: "plain",
      disclaimer: "Theoretical model and labor-market closure developed within a research-assistant role. Empirical implementation in progress. Interactive widgets show illustrative comparative statics and conceptual model responses; no estimated parameters, impulse responses, or empirical results are shown.",
      it: { companyShort: "AI and Structural Unemployment" }
    };
  }
  function caseDataRedsea() {
    return {
      redsea: true,
      morph: "plain",
      disclaimer: "All figures, coefficients, tables, and equations are reproduced from the supplied working paper. Nothing is fabricated, estimated, or approximated. Objective summary, not investment or policy advice.",
      it: { companyShort: "Red Sea Port Adjustment" }
    };
  }
  function caseDataSinosafe() {
    const D = window.SITE_DATA;
    if (!D) return null;
    const it = D.internships.find((x) => x.id === "sinosafe") || D.internships[0];
    return {
      it: it,
      sinosafe: true,
      morph: "plain",
      figtag: "",
      disclaimer: "All content on this page has been reviewed to ensure that it contains no confidential or proprietary information and complies with all applicable non-disclosure agreements. The valuation model is an illustrative structure; figures are neutral placeholders, not company estimates.",
      kicker: "Fundamental Equity Research",
      title: "From Financial Statements to Long-Term Investment Judgment",
      dek: "At Sinosafe's asset-management team, I analyzed Hong Kong-listed companies across consumer, property, financials, and internet sectors, connecting earnings, operating drivers, valuation, and new information to long-term investment views.",
      metaLine: "Long-Horizon Equity Research \u00b7 Hong Kong-Listed Companies \u00b7 Fundamentals & Valuation"
    };
  }
  function caseDataYinhua() {
    const D = window.SITE_DATA;
    if (!D) return null;
    const it = D.internships.find((x) => x.id === "yinhua") || D.internships[0];
    return {
      it: it,
      morph: "plain",
      yinhua: true,
      figtag: "",
      disclaimer: "All content on this page has been reviewed to ensure that it contains no confidential or proprietary information and complies with all applicable non-disclosure agreements. All performance figures are historical backtest results, not live or audited returns.",
      kicker: "Systematic Equity Research",
      title: "From Signal to Portfolio",
      dek: "At Yinhua Fund Management, I replicated and evaluated more than twenty systematic A-share strategies and developed daily-frequency stock-selection and momentum ETF-rotation prototypes.",
      metaLine: "2013-2023 Stock-Selection Backtest \u00b7 Daily Frequency \u00b7 Costs & Slippage Included"
    };
  }
  function caseDataSifra() {
    const D = window.SITE_DATA;
    if (!D) return null;
    const it = D.internships.find((x) => x.id === "sifra") || D.internships[0];
    return {
      it: it,
      morph: "chart", source: "chart-host",
      figtag: "Strategy Book \u00b7 anchored by nowcast",
      figcap: "<b>Illustrative strategy book anchored by the macro nowcast.</b> This is not a live track record.",
      disclaimer: "All content on this page has been reviewed to ensure that it contains no confidential or proprietary information and complies with all applicable non-disclosure agreements.",
      kicker: "Macro Nowcasting",
      title: "Most macro data is backward-looking.",
      dek: "A real-time view of China's economy designed to anchor systematic strategies.",
      meta: ["Macro Research", "June to September 2025", "Shenzhen"],
      inputs: ["Daily / weekly prices", "Oil · coal · freight rates", "HF pork · vegetable · fruit prices", "Online retail prices", "DR007 · bills · NCD yields", "Govt-bond · IRS · credit spreads", "FX", "Northbound flows", "Property sales", "PMI sub-components", "Export-chain HF proxies"],
      layer1: ["GDP", "CPI", "Core CPI", "PPI", "Credit Impulse", "Property Activity", "Export Sentiment"],
      layer2: ["Growth Level", "Growth Revision", "Inflation Level", "Inflation Revision", "Growth and Inflation Regime", "Policy Gap", "Announcement Surprise", "Confidence Band"],
      headline: [
        { v: "20", l: "strategy families backtested" },
        { v: "+0.33", l: "Sharpe uplift: all-weather / cross-asset" },
        { v: "\u2248+0.05", l: "pure microstructure" }
      ],
      ranked: [
        { name: "All-Weather / Cross-Asset Rotation", v: 0.33, d: "macro", note: "fastest to benefit" },
        { name: "Rates Duration Timing", v: 0.28, d: "macro" },
        { name: "A-Share Index Macro Timing", v: 0.25, d: "macro" },
        { name: "Index-Futures Timing / Equity CTA", v: 0.25, d: "equity" },
        { name: "Inflation / Resource Chain", v: 0.25, d: "macro" },
        { name: "ETF / Thematic Rotation", v: 0.20, d: "equity" },
        { name: "Long-Only Multi-Factor", v: 0.18, d: "equity" },
        { name: "Equity / Bond Switching", v: 0.18, d: "macro" },
        { name: "Commodity CTA (regime filter)", v: 0.18, d: "macro" },
        { name: "Macro Risk-Parity", v: 0.18, d: "macro" },
        { name: "Equity Market-Neutral", v: 0.10, d: "equity" },
        { name: "Intraday / T0 / Stat-Arb", v: 0.05, d: "equity", note: "pure microstructure" }
      ],
      sections: [
        { h: "Why", sub: "Today's strategies often rely on last quarter's data", p: [
          "Most macroeconomic inputs arrive with a delay. GDP is released several weeks after the reference period and may be revised for months. CPI, trade, and credit data also tend to be published after the market moves they are expected to explain. As a result, a systematic strategy that relies on official macro data may respond to a regime that has already changed.",
          "The relevant question is how much of this delay can be reduced. A near-real-time view of Chinese growth and inflation does more than describe the economy sooner; it also allows a strategy book to adjust its positioning earlier."
        ] },
        { h: "The idea", sub: "A nowcast as a macro anchor", p: [
          "A nowcast estimates an official series before publication using higher-frequency indicators that become available earlier. By itself, this is a forecasting exercise. Within a trading framework, however, the nowcast can serve as a relatively stable macro signal that helps guide a faster-moving strategy.",
          "The chart above illustrates this relationship. The candlesticks represent a strategy book, while the nowcast provides the macro signal used to scale exposure. When the real-time indicators for growth and inflation are supportive, the strategy can take more risk. When they deteriorate, exposure can be reduced before the change appears in the official data."
        ] },
        { h: "Under the hood", sub: "A mixed-frequency factor model built for ragged-edge data", viz: "arch", p: [
          "The system combines a mixed-frequency dynamic factor model with LASSO for variable selection and MIDAS for mapping daily and weekly indicators to monthly and quarterly targets. It is designed for a ragged-edge dataset in which each indicator is released on a different schedule. In the inflation model, the largest weights fall on food and energy variables, particularly pork, fresh vegetables, fresh fruit, and oil."
        ] },
        { h: "The payoff", sub: "How the macro anchor changes a strategy book", viz: "ranked", p: [
          "Used as an overlay, the real-time macro signal changes the strategy's overall risk exposure rather than its individual trades. Exposure increases when the growth and inflation signals become supportive and decreases when they weaken, based on the timing of the nowcast rather than the official data release.",
          "The overlay was applied to roughly twenty strategy families and backtested from 2014 to 2024 across China A-shares, futures, and options. Each strategy was compared with an appropriate mainstream benchmark. The results show a clear pattern: strategies with greater exposure to macroeconomic conditions benefit more from the nowcast.",
          "The improvement in the Sharpe ratio ranges from +0.33 for all-weather and cross-asset rotation strategies to about +0.05 for pure microstructure strategies. The overlay does not improve every strategy equally; its value lies in identifying where a real-time macro signal is most useful."
        ] },
        { h: "What was hard", sub: "The harder problem was the data, not the model", p: [
          "Model specification was only part of the challenge. Most of the work went into building the data panel: reconciling indicator definitions, aligning release calendars, applying seasonal adjustments, and handling revisions consistently. A nowcast may look convincing in hindsight yet remain too unstable to guide positioning. For this purpose, the revision path of each estimate matters more than any single point estimate."
        ] },
        { h: "Where it goes next", sub: "", p: [
          "The prototype treats macroeconomic conditions as a continuously updated state rather than a sequence of isolated releases. The next steps are to expand the indicator set, incorporate revision behaviour into the confidence band, and test the framework across a wider range of strategy styles to determine where real-time macro information adds the most value."
        ] }
      ]
    };
  }

  function caseDataGaoke() {
    const D = window.SITE_DATA;
    if (!D) return null;
    const it = D.internships.find((x) => x.id === "gaoke");
    if (!it) return null;
    const ev = it.evidence || {};
    return {
      it: it,
      morph: "text", source: "dd-graph",
      disclaimer: "All content on this page has been reviewed to ensure that it contains no confidential or proprietary information and complies with all applicable non-disclosure agreements.",
      kicker: "Risk \u00d7 Engineering",
      title: "Humanoid Robotics",
      note: "A representative engagement involving an unnamed humanoid robotics company. For illustrative purposes only.",
      dek: "Pre-investment due diligence on a humanoid robotics company, supported by a structured, AI-assisted risk review workflow.",
      meta: [it.role, it.period, it.location],
      keyGroups: it.keyGroups || [],
      customBody: true,
      sections: []
    };
  }

  function chip(t) { return '<span class="ca-chip">' + esc(t) + "</span>"; }

  function quadrantSVG() {
    return '<svg class="ca-quad" viewBox="0 0 200 200" role="img" aria-label="Growth by inflation regime quadrant">' +
      '<line x1="100" y1="20" x2="100" y2="180" class="ca-qax"/>' +
      '<line x1="20" y1="100" x2="180" y2="100" class="ca-qax"/>' +
      '<text x="150" y="48" class="ca-qlab" text-anchor="middle">Reflation</text>' +
      '<text x="150" y="158" class="ca-qlab" text-anchor="middle">Goldilocks</text>' +
      '<text x="52" y="48" class="ca-qlab" text-anchor="middle">Stagflation</text>' +
      '<text x="52" y="158" class="ca-qlab" text-anchor="middle">Slowdown</text>' +
      '<text x="186" y="113" class="ca-qax-t" text-anchor="end">Growth \u2192</text>' +
      '<text x="104" y="28" class="ca-qax-t" text-anchor="start">Inflation \u2191</text>' +
      '<circle cx="143" cy="64" r="5" class="ca-qdot"/>' +
      '</svg>';
  }

  function buildArch(data) {
    const chips = data.inputs.map((t) => '<span class="ca-ip">' + esc(t) + "</span>").join("");
    const l1 = data.layer1.map((t) => '<span class="ca-node">' + esc(t) + "</span>").join("");
    const l2 = data.layer2.map((t) => '<span class="ca-node alt">' + esc(t) + "</span>").join("");
    return (
      '<div class="ca-arch">' +
        '<div class="ca-arch-inputs">' +
          '<div class="ca-arch-k">Inputs \u00b7 ragged edge</div>' +
          '<div class="ca-ips">' + chips + "</div>" +
        "</div>" +
        '<div class="ca-flow">' +
          '<div class="ca-stage"><div class="ca-stage-k">Layer 1</div><div class="ca-stage-t">Interpretable nowcasts</div><div class="ca-nodes">' + l1 + "</div></div>" +
          '<div class="ca-arrow" aria-hidden="true">\u2192</div>' +
          '<div class="ca-stage"><div class="ca-stage-k">Layer 2</div><div class="ca-stage-t">Tradable factors</div><div class="ca-nodes">' + l2 + "</div></div>" +
          '<div class="ca-arrow" aria-hidden="true">\u2192</div>' +
          '<div class="ca-stage anchor"><div class="ca-stage-k">Anchor</div><div class="ca-stage-t">Macro regime used for positioning</div>' + quadrantSVG() + "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function rankedSVG(rows) {
    const n = rows.length, W = 760, rowH = 33, padTop = 50, padBot = 16;
    const H = padTop + n * rowH + padBot;
    const labelW = 312, x0 = labelW, x1 = W - 64, maxV = 0.36;
    const xOf = (v) => x0 + (v / maxV) * (x1 - x0);
    let ticks = "";
    [0, 0.1, 0.2, 0.3].forEach((t) => {
      const x = xOf(t);
      ticks += '<line x1="' + x + '" y1="' + (padTop - 10) + '" x2="' + x + '" y2="' + (H - padBot) + '" class="ca-grid"/>';
      ticks += '<text x="' + x + '" y="' + (padTop - 18) + '" class="ca-axt" text-anchor="middle">+' + t.toFixed(1) + "</text>";
    });
    let bars = "";
    rows.forEach((r, i) => {
      const y = padTop + i * rowH + rowH / 2;
      const x = xOf(r.v);
      const cls = r.d === "macro" ? "macro" : "equity";
      const hi = (i === 0 || i === n - 1);
      const d = (0.05 + i * 0.05).toFixed(2);
      bars += '<g class="ca-row" style="--d:' + d + 's">';
      bars += '<rect x="0" y="' + (y - rowH / 2) + '" width="' + W + '" height="' + rowH + '" class="ca-rowhit"/>';
      bars += '<text x="' + (labelW - 16) + '" y="' + y + '" class="ca-rlab' + (hi ? " hi" : "") + '" text-anchor="end" dominant-baseline="middle">' + esc(r.name) + "</text>";
      bars += '<line x1="' + x0 + '" y1="' + y + '" x2="' + x + '" y2="' + y + '" pathLength="1" class="ca-stem ' + cls + '"/>';
      bars += '<circle cx="' + x + '" cy="' + y + '" r="' + (hi ? 6 : 4.6) + '" class="ca-dot ' + cls + (hi ? " big" : "") + '"/>';
      bars += '<text x="' + (x + 13) + '" y="' + y + '" class="ca-rval' + (hi ? " hi" : "") + '" dominant-baseline="middle">+' + r.v.toFixed(2) + "</text>";
      bars += "</g>";
    });
    return '<div class="ca-chartwrap"><svg class="ca-ranked" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Sharpe uplift by strategy family">' + ticks + bars + "</svg>" +
      '<div class="ca-legend"><span class="lg macro">Macro strategies</span><span class="lg equity">A-share quant</span></div></div>';
  }

  function buildRanked(data) {
    const stats = data.headline.map((sx) => '<div class="ca-stat"><div class="ca-stat-v">' + esc(sx.v) + '</div><div class="ca-stat-l">' + esc(sx.l) + "</div></div>").join("");
    return (
      '<div class="ca-stats">' + stats + "</div>" +
      rankedSVG(data.ranked) +
      '<div class="ca-srcline">Backtested improvement in the Sharpe ratio relative to a mainstream benchmark, using China A-shares, futures, and options from 2014 to 2024.</div>'
    );
  }

  function buildKeys(data) {
    if (!data.keyGroups || !data.keyGroups.length) return "";
    return '<div class="ca-keys">' + data.keyGroups.map((g) =>
      '<div class="ca-keygroup"><div class="ca-arch-k">' + esc(g.label) + "</div>" +
      '<div class="ca-ips">' + g.items.map((t) => '<span class="ca-ip">' + esc(t) + "</span>").join("") + "</div></div>"
    ).join("") + "</div>";
  }

  function buildEvidence(data) {
    const ev = (data.it && data.it.evidence) || {};
    const stats = (ev.stats || []).map((s) => '<div class="ca-stat"><div class="ca-stat-v">' + esc(s.v) + '</div><div class="ca-stat-l">' + esc(s.l) + "</div></div>").join("");
    const blocks = (ev.blocks || []).map((b) => {
      let inner = "";
      if (b.kind === "flow") {
        inner = '<div class="ca-flow-line">' + b.items.map((t, i) => (i ? '<span class="ca-arrow" aria-hidden="true">\u2192</span>' : "") + '<span class="ca-node">' + esc(t) + "</span>").join("") + "</div>";
      } else if (b.kind === "list") {
        inner = '<ul class="ca-elist">' + b.items.map((t) => "<li>" + esc(t) + "</li>").join("") + "</ul>";
      } else {
        inner = '<div class="ca-ips">' + b.items.map((t) => '<span class="ca-ip">' + esc(t) + "</span>").join("") + "</div>";
      }
      return '<div class="ca-eblock"><div class="ca-arch-k">' + esc(b.label) + "</div>" + inner + "</div>";
    }).join("");
    return (stats ? '<div class="ca-stats">' + stats + "</div>" : "") + '<div class="ca-evidence">' + blocks + "</div>";
  }

  function buildPipeline() {
    const stages = [
      { k: "1", t: "Ingestion", d: "Public records and market data collected and combined into one working panel.", layer: "Financial technology", chips: ["Tianyancha", "Wind", "Normalize"] },
      { k: "2", t: "AI extraction", d: "A Qwen API harness reads records and documents through a fixed workflow.", layer: "AI workflow", chips: ["Entities", "Litigation", "Terms"] },
      { k: "3", t: "Structuring", d: "Extracted items scored and tagged into comparable risk fields.", layer: "Quantitative", chips: ["Score", "Tag", "Compare"] },
      { k: "4", t: "Risk read-out", d: "Structured fields feed the risk register and diligence pack.", layer: "Risk engineering", chips: ["Risk register", "DD pack"], accent: true }
    ];
    const cell = stages.map((s) =>
      '<div class="ca-pstage' + (s.accent ? " accent" : "") + '">' +
        '<div class="ca-pnode">' + s.k + '</div>' +
        '<div class="ca-player">' + s.layer + '</div>' +
        '<div class="ca-pt">' + s.t + '</div>' +
        '<div class="ca-pd">' + s.d + '</div>' +
        '<div class="ca-pchips">' + s.chips.map((c) => '<span class="ca-pchip">' + c + '</span>').join("") + '</div>' +
      '</div>'
    ).join("");
    return '<div class="ca-pipe"><div class="ca-pflow">' + cell + '</div></div>';
  }

  function buildDimensions() {
    const dims = [
      ["Team and technical depth", "Founder and engineering background, and the credibility of the technical roadmap."],
      ["Technology and moat", "The technical approach versus the field, and whether its advantages are defensible."],
      ["BOM and cost trajectory", "The bill of materials and the expected path of unit cost as production scales."],
      ["Supply chain", "Dependence on critical components such as actuators, harmonic reducers, and sensors."],
      ["Order pipeline quality", "Signed orders versus letters of intent, pilots, and other early commitments."],
      ["Cap table and equity structure", "Ownership concentration, pledged equity, and related-party arrangements."],
      ["IP and litigation", "Patent position, pending disputes, and litigation or regulatory exposure."],
      ["Regulatory and compliance", "Filings and checklist items against internal and external requirements."]
    ];
    return '<div class="ca-dims">' + dims.map((d, i) =>
      '<div class="ca-dim"><div class="ca-dim-n">' + String(i + 1).padStart(2, "0") + '</div>' +
      '<div class="ca-dim-body"><div class="ca-dim-h">' + d[0] + '</div><div class="ca-dim-d">' + d[1] + '</div></div></div>'
    ).join("") + '</div>';
  }

  function buildGaokeBody(data) {
    const sub = function (h, p) { return '<div class="ca-sub2"><h4 class="ca-subh">' + h + '</h4><p class="ca-p">' + p + '</p></div>'; };
    return (
      '<section class="ca-section">' +
        '<div class="ca-h">The engagement</div>' +
        '<p class="ca-p">The subject was an early-stage company in the humanoid robotics sector. The work was conducted during the pre-investment phase of a venture capital transaction and involved both the investment and risk-control functions of the fund.</p>' +
        '<p class="ca-p">The scope covered three areas: due diligence on the target company, a risk and compliance review, and an assessment of the equity repurchase, or redemption, terms.</p>' +
      '</section>' +
      '<section class="ca-section">' +
        '<div class="ca-h">What was done</div>' +
        '<p class="ca-p">Four workstreams were carried out in parallel.</p>' +
        '<ul class="ca-list">' +
          '<li>Mapping the company\'s public footprint: corporate structure, capitalization table, shareholders, affiliates, litigation history, patents, and supply-chain relationships.</li>' +
          '<li>Building an AI-assisted workflow to convert fragmented public information into structured, comparable risk items.</li>' +
          '<li>Assessing the transaction against a consistent set of due-diligence dimensions.</li>' +
          '<li>Producing the final deliverables: a due-diligence pack, a risk register, and a review of the equity repurchase terms.</li>' +
        '</ul>' +
      '</section>' +
      '<section class="ca-section">' +
        '<div class="ca-h">How it worked</div>' +
        '<p class="ca-p">The core of the work was an engineering one: turning unstructured public data into a structured risk read on a repeatable basis. The workflow consisted of four stages.</p>' +
        buildPipeline() +
        sub("01 \u00b7 Ingestion", "Corporate records, capitalization data, and litigation information were collected from Tianyancha. Market, financial, and filing data were obtained from Wind. The data were then cleaned, standardized, and combined into a single working dataset.") +
        sub("02 \u00b7 Extraction", "A lightweight workflow built around the Qwen, or Tongyi Qianwen, API processed company records and legal documents using a fixed extraction framework. It identified relevant entities, ownership relationships, litigation matters, and key provisions in contracts and equity repurchase agreements.") +
        sub("03 \u00b7 Structuring", "The extracted information was classified, tagged, and scored across a set of comparable risk fields. This step imposed a consistent framework on qualitative material drawn from different sources and diligence dimensions.") +
        sub("04 \u00b7 Read-out", "The structured fields were incorporated into the risk register and due-diligence pack. Individual items could therefore be reviewed, traced, and updated without requiring the underlying documents to be read again in full.") +
        '<p class="ca-p">The workflow combined four layers. Data ingestion and process automation formed the financial-technology layer. The Qwen harness supported the AI-assisted extraction. Scoring and classification provided the quantitative layer. The risk register served as the final risk-engineering output.</p>' +
      '</section>' +
      '<section class="ca-section">' +
        '<div class="ca-h">Dimensions assessed</div>' +
        '<p class="ca-p">The transaction was assessed against a fixed set of dimensions to maintain consistency across the review.</p>' +
        buildDimensions() +
      '</section>' +
      '<section class="ca-section">' +
        '<div class="ca-h">Tools and outputs</div>' +
        buildKeys(data) +
        '<p class="ca-p"><b>Tools:</b> Tianyancha, Wind, Excel, Python, and the Qwen API through a lightweight LLM harness.</p>' +
        '<p class="ca-p"><b>Outputs:</b> a due-diligence pack, a risk register, and a review of the equity repurchase terms.</p>' +
      '</section>' +
      '<section class="ca-section">' +
        '<div class="ca-h">Method note</div>' +
        '<p class="ca-p">The framework and assessment dimensions shown here are representative. Specific companies, figures, transaction details, and conclusions have been omitted to preserve confidentiality.</p>' +
      '</section>'
    );
  }

  // ── Yinhua case study: a scroll-driven visual research case study ───────────
  function yFigs(arr) {
    return '<div class="ca-figs">' + arr.map((f) =>
      '<div class="ca-fig' + (f.neg ? " neg" : "") + '"><div class="ca-fig-v ca-cu">' + f.v + '</div><div class="ca-fig-l">' + f.l + '</div></div>'
    ).join("") + "</div>";
  }
  function yMetrics(arr) {
    return '<div class="ca-metrics">' + arr.map((m) =>
      '<div class="ca-metric"><span class="ca-metric-v">' + m.v + '</span><span class="ca-metric-l">' + m.l + '</span></div>'
    ).join("") + "</div>";
  }
  function yChips(arr, cls) {
    return '<div class="ca-ychips">' + arr.map((c) => '<span class="ca-ychip ' + (cls || "") + '">' + c + "</span>").join("") + "</div>";
  }
  function yRobMatrix(arr) {
    return '<div class="ca-rob">' + arr.map((r) =>
      '<div class="ca-rob-cell"><span class="ca-rob-dot"></span><span class="ca-rob-l">' + r + "</span></div>"
    ).join("") + "</div>";
  }
  function yExposure(rows) {
    const max = 0.24;
    return '<div class="ca-exp">' + rows.map((r) => {
      const w = Math.min(1, Math.abs(r.v) / max) * 50; // % of half-track
      const side = r.v >= 0
        ? '<span class="ca-exp-fill pos" style="left:50%;width:' + w + '%"></span>'
        : '<span class="ca-exp-fill neg" style="right:50%;width:' + w + '%"></span>';
      return '<div class="ca-exp-row"><span class="ca-exp-l">' + r.l + '</span>' +
        '<span class="ca-exp-track"><span class="ca-exp-mid"></span>' + side + "</span></div>";
    }).join("") + "</div>";
  }
  function ySurface() {
    const cols = 7, rows = 4; let cells = "";
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      // a smooth, stable central region (methodological, not fabricated data)
      const dx = (c - (cols - 1) / 2) / cols, dy = (r - (rows - 1) / 2) / rows;
      const stab = Math.max(0, 1 - (dx * dx * 7 + dy * dy * 9));
      const a = (0.08 + 0.5 * stab).toFixed(3);
      cells += '<span class="ca-surf-cell" style="background:rgba(214,0,108,' + a + ')"></span>';
    }
    return '<div class="ca-surface" style="grid-template-columns:repeat(' + cols + ',1fr)">' + cells + "</div>";
  }
  // ── Sinosafe case study: the fundamental-investment workbook, expanded ──────
  function snSheet(rows) {
    return rows.map((r) => '<span class="ca-ws-cell">' + r + "</span>").join("");
  }
  function buildSinosafeArticle(data) {
    const tabs = ["OVERVIEW", "FUNDAMENTALS", "VALUATION", "MEITUAN_CASE", "THESIS_LOG"];
    const tabNav = '<nav class="ca-wbtabs" aria-label="Workbook sheets">' +
      tabs.map((t, i) => '<a class="ca-wbtab' + (i === 0 ? " active" : "") + '" href="#sn-' + i + '" data-i="' + i + '">' + t + "</a>").join("") +
      "</nav>";

    const scope = [
      { v: "80+", l: "Companies Reviewed" },
      { v: "30+", l: "Monitoring Reports" },
      { v: "4", l: "Sectors Covered" }
    ];

    // FUNDAMENTALS — the one three-stage relationship
    const stmt = ["Revenue", "Gross Margin", "Operating Profit", "Free Cash Flow", "ROIC", "Working Capital", "Balance-Sheet Strength"];
    const drivers = ["Pricing", "Volume", "Customer Growth", "Product Mix", "Market Share", "Cost Structure", "Capital Intensity"];
    const interp = ["Earnings Durability", "Competitive Position", "Catalyst", "Downside Risk", "Thesis Status"];

    // VALUATION
    const assumptions = [
      ["Revenue Growth", "8.0%"], ["Operating Margin", "21.0%"], ["Tax Rate", "16.5%"],
      ["Reinvestment", "34%"], ["Free Cash Flow", "Derived"], ["WACC", "9.2%"], ["Terminal Growth", "2.5%"]
    ];
    const outputs = [
      ["PV of Forecast FCF", "·"], ["Terminal Value", "·"], ["Implied Equity Value", "·"],
      ["Current Market Value", "·"], ["Implied Upside / Downside", "·"], ["Margin of Safety", "·"]
    ];
    const sensCols = ["2.0%", "2.5%", "3.0%"];
    const sensRows = [
      ["8.7%", ["+6%", "+11%", "+17%"]],
      ["9.2%", ["−2%", "+3%", "+8%"]],
      ["9.7%", ["−9%", "−5%", "0%"]]
    ];
    const sens = '<table class="ca-sens"><thead><tr><th>WACC \\ g</th>' + sensCols.map((c) => "<th>" + c + "</th>").join("") + "</tr></thead><tbody>" +
      sensRows.map((r) => '<tr><th>' + r[0] + "</th>" + r[1].map((v, i) => '<td' + (r[0] === "9.2%" && sensCols[i] === "2.5%" ? ' class="mid"' : "") + ">" + v + "</td>").join("") + "</tr>").join("") +
      "</tbody></table>";

    // MEITUAN refs
    const mtnRefs = ["Order Density", "Merchant Network", "Dispatch Capability", "Instant Retail", "Last-Mile Fulfilment", "Drone-Delivery Optionality"];

    // THESIS LOG
    const logRows = [
      ["Q1", "Earnings release", "Volume-led beat, mix stable", "Estimates +", "STRENGTHENING"],
      ["Q2", "Margin change", "Input costs, not pricing", "Range held", "WATCH"],
      ["Q3", "Policy development", "Demand-side support", "Modest +", "THESIS INTACT"],
      ["Q4", "Disclosure issue", "Receivables timing", "Under review", "UNDER REVIEW"]
    ];
    const logTable = '<div class="ca-log"><div class="ca-log-head"><span>Period</span><span>New Information</span><span>Fundamental Interpretation</span><span>Valuation Impact</span><span>Thesis Status</span></div>' +
      logRows.map((r, i) => '<div class="ca-log-row' + (i === 2 ? " hot" : "") + '"><span>' + r[0] + "</span><span>" + r[1] + "</span><span>" + r[2] + "</span><span>" + r[3] + '</span><span class="ca-log-st">' + r[4] + "</span></div>").join("") +
      "</div>";

    return (
      '<button class="case-close" type="button" aria-label="Close case study"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll ca-sn"><article class="case-article">' +

        // static Excel-style header (no animation) + editorial hero
        '<section class="ca-sn-head case-reveal d1">' +
          '<div class="ca-xl">' +
            '<div class="ca-xl-bar"><span class="ca-xl-ref">A1</span><span class="ca-xl-fx">fx</span><span class="ca-xl-formula">= Fundamental Research Record</span></div>' +
            '<div class="ca-xl-cols"><span></span>' + ["A","B","C","D"].map((c) => "<span>" + c + "</span>").join("") + "</div>" +
            '<div class="ca-xl-grid">' +
              '<div class="ca-xl-title">FUNDAMENTAL EQUITY RESEARCH</div>' +
              '<div class="ca-xl-rows">' +
                [["Company","Sinosafe General Insurance"],["Role","Equity Research Intern"],["Research Focus","Long-Horizon Fundamental Investing"],["Market","Hong Kong-Listed Equities"],["Coverage","Consumer \u00b7 Property \u00b7 Financials \u00b7 Internet"],["Research Scope","80+ Companies Reviewed"],["Output","30+ Monitoring Reports"],["Methods","Financial Analysis \u00b7 Valuation \u00b7 Thesis Monitoring"],["Period", esc(data.it.period || "")],["Location", esc(data.it.location || "")]].map((r, i) =>
                  '<div class="ca-xl-row"><span class="ca-xl-n">' + (i + 2) + '</span><span class="ca-xl-f">' + r[0] + '</span><span class="ca-xl-v">' + r[1] + "</span></div>"
                ).join("") +
              "</div>" +
              '<div class="ca-xl-dcf"><div class="ca-xl-dcf-h">DCF \u00b7 Illustrative model structure</div>' +
                [["Revenue Growth","8.0%"],["Operating Margin","21.0%"],["WACC","9.2%"],["Terminal Growth","2.5%"],["Implied Value","118.4"]].map((r) =>
                  '<div class="ca-xl-dcf-row"><span>' + r[0] + '</span><span class="v">' + r[1] + "</span></div>"
                ).join("") +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="ca-hero-text">' +
            '<div class="ca-disclaimer">' + esc(data.disclaimer) + "</div>" +
            '<div class="ca-kicker">' + esc(data.kicker) + " \u00b7 Case Study</div>" +
            '<h1 class="ca-title">' + esc(data.title) + "</h1>" +
            '<p class="ca-dek">' + esc(data.dek) + "</p>" +
            '<div class="ca-ymeta">' + esc(data.metaLine) + "</div>" +
          "</div>" +
        "</section>" +

        '<div class="ca-body">' +

          // FUNDAMENTALS
          '<section class="ca-section ca-sn-sec" id="sn-1" data-i="1">' +
            '<div class="ca-h">The Investment Framework</div>' +
            '<h3 class="ca-sub">Reading the Business Behind the Numbers</h3>' +
            '<p class="ca-p">Financial statements show the outcome; the research task is to explain what produced it. I traced changes in revenue, margins, cash flow, capital returns, and balance-sheet quality to company-specific operating drivers and industry conditions.</p>' +
            '<p class="ca-p">The same earnings growth can have very different investment implications. It may reflect durable operating improvement, or it may result from one-off gains, a low comparison base, or temporary cost compression. Understanding the underlying business change is necessary before judging whether earnings are sustainable.</p>' +
            '<div class="ca-flow3">' +
              '<div class="ca-flow3-col"><div class="ca-flow3-k">Reported Numbers</div><div class="ca-ws-list">' + snSheet(stmt) + "</div></div>" +
              '<div class="ca-flow3-arrow" aria-hidden="true">\u2192</div>' +
              '<div class="ca-flow3-col"><div class="ca-flow3-k">Business Drivers</div><div class="ca-ws-list">' + snSheet(drivers) + "</div></div>" +
              '<div class="ca-flow3-arrow" aria-hidden="true">\u2192</div>' +
              '<div class="ca-flow3-col accent"><div class="ca-flow3-k">Investment View</div><div class="ca-ws-list">' + snSheet(interp) + "</div></div>" +
            "</div>" +
            '<div class="ca-sel"><div class="ca-sel-bar"><span class="ca-sel-ref">C12</span><span class="ca-sel-fx">fx</span><span class="ca-sel-formula">= Product Mix + Pricing \u2212 Input Costs \u2212 Competition</span></div>' +
              '<div class="ca-sel-cell"><span class="ca-sel-label">Gross Margin</span><span class="ca-sel-val">\u22122.1 pp</span></div>' +
              '<div class="ca-sel-note"><b>Interpretation:</b> test whether margin pressure reflects temporary input costs or structural competitive deterioration.</div>' +
            "</div>" +
          "</section>" +

          // VALUATION
          '<section class="ca-section ca-sn-sec" id="sn-2" data-i="2">' +
            '<div class="ca-h">Valuation</div>' +
            '<h3 class="ca-sub">Valuation as a Constraint</h3>' +
            '<p class="ca-p">A strong company is not automatically an attractive investment. I used earnings forecasts, peer comparison, scenario analysis, and simplified cash-flow models to examine what growth, margins, and risk assumptions were already embedded in the market price.</p>' +
            '<p class="ca-p">Valuation was not an appendix added after the company analysis. It constrained the investment conclusion by asking whether expected return and margin of safety were sufficient relative to the downside case.</p>' +
            '<div class="ca-dcf2">' +
              '<div class="ca-dcf2-col"><div class="ca-ws-h">Operating Assumptions</div>' + assumptions.map((a) => '<div class="ca-ws-row"><span>' + a[0] + '</span><span class="v">' + a[1] + "</span></div>").join("") + "</div>" +
              '<div class="ca-dcf2-col"><div class="ca-ws-h">Valuation Outputs</div>' + outputs.map((a) => '<div class="ca-ws-row"><span>' + a[0] + '</span><span class="v">' + a[1] + "</span></div>").join("") + "</div>" +
              '<div class="ca-dcf2-col sens"><div class="ca-ws-h">WACC \u00d7 Terminal Growth</div>' + sens + '<div class="ca-sens-note">Illustrative model structure</div></div>' +
            "</div>" +
          "</section>" +

          // MEITUAN
          '<section class="ca-section ca-sn-sec" id="sn-3" data-i="3">' +
            '<div class="ca-h">Differentiated Observation</div>' +
            '<h3 class="ca-sub">Meituan: Looking Beyond the Immediate Competitive Threat</h3>' +
            '<p class="ca-p">In 2022, market attention centered on Douyin\'s expansion into local services and the resulting pressure on Meituan\'s traffic, merchant share, and margins.</p>' +
            '<p class="ca-p">Alongside these risks, I also tracked Meituan\'s early drone-delivery trials in Shenzhen as a possible extension of its instant-retail and fulfilment infrastructure. Rather than treating the program as an isolated technology concept, I considered how it could interact with order density, dispatch systems, merchant coverage, and last-mile efficiency.</p>' +
            '<p class="ca-p">The purpose was not to predict the low-altitude economy as a future market theme. It was to identify a longer-duration operational capability that was receiving less attention than the immediate competitive threat.</p>' +
            '<div class="ca-mtn">' +
              '<div class="ca-mtn-focus"><div class="ca-mtn-k">Market Focus \u00b7 2022</div><ul class="ca-mtn-list">' +
                ["Douyin\u2019s expansion into local services", "Pressure on traffic acquisition", "Merchant competition", "Margin uncertainty", "Potential share loss in local commerce"].map((x) => "<li>" + x + "</li>").join("") +
              "</ul></div>" +
              '<div class="ca-mtn-note"><div class="ca-mtn-k accent">Additional Observation</div>' +
                '<div class="ca-mtn-note-t">Early drone-delivery deployment in Shenzhen</div>' +
                '<div class="ca-mtn-refs">' + mtnRefs.map((r) => '<span class="ca-ychip lead">' + r + "</span>").join("") + "</div>" +
              "</div>" +
            "</div>" +
            '<div class="ca-hist">Subsequent developments provided directional validation, not certainty at the time of the original analysis.</div>' +
          "</section>" +

          // THESIS LOG
          '<section class="ca-section ca-sn-sec" id="sn-4" data-i="4">' +
            '<div class="ca-h">Thesis Monitoring</div>' +
            '<h3 class="ca-sub">Updating the Investment Thesis</h3>' +
            '<p class="ca-p">Long-term investing does not mean holding an unchanged opinion. After each earnings release, operating update, company disclosure, or policy development, I reassessed the earnings outlook, valuation range, catalysts, and downside case.</p>' +
            '<p class="ca-p">The purpose of monitoring was not to repeat newly released information. It was to determine what had changed, why it mattered, and whether the original holding thesis remained valid.</p>' +
            logTable +
            '<div class="ca-hist">Illustrative monitoring log. Connects to the 30+ fundamental and post-investment reports produced during the internship.</div>' +
          "</section>" +

          // RESEARCH OUTPUT
          '<section class="ca-section ca-sn-sec" id="sn-5" data-i="4">' +
            '<div class="ca-h">Research Output</div>' +
            '<p class="ca-p">The work covered more than eighty Hong Kong-listed companies and produced over thirty fundamental and post-investment monitoring reports across consumer, property, financials, and internet sectors.</p>' +
            '<div class="ca-archive">' +
              '<div class="ca-arch-item"><div class="ca-arch-v ca-cu">80+</div><div class="ca-arch-l">Hong Kong-Listed Companies Reviewed</div></div>' +
              '<div class="ca-arch-item"><div class="ca-arch-v ca-cu">30+</div><div class="ca-arch-l">Fundamental & Post-Investment Reports</div></div>' +
              '<div class="ca-arch-item"><div class="ca-arch-sectors">Consumer \u00b7 Property \u00b7 Financials \u00b7 Internet</div></div>' +
            "</div>" +
            '<p class="ca-close-line">The objective was not simply to summarize financial information, but to determine whether new evidence changed a company\'s long-term earnings power, valuation basis, or holding thesis.</p>' +
          "</section>" +

        "</div>" +
        '<div class="ca-foot"><span>Case Study \u00b7 ' + esc(data.it.companyShort || "") + '</span><span>Zhenyuan Pan \u00b7 2026</span></div>' +
      "</article></div>"
    );
  }

  function buildYinhuaArticle(data) {
    const JQ = "https://www.joinquant.com/view/community/detail/431c238af560b90ced584b91e6750aa1";
    const heroStrip = [
      { v: "20+", l: "Strategy Studies" },
      { v: "2", l: "Original Prototypes" },
      { v: "10-Year", l: "Stock-Selection Backtest" }
    ];
    const ssDominant = [
      { v: "22.55%", l: "Annualized Return" },
      { v: "1,489.58%", l: "Cumulative Return" },
      { v: "1.166", l: "Information Ratio" },
      { v: "-37.13%", l: "Maximum Drawdown", neg: true }
    ];
    const ssSecondary = [
      { v: "1,556.56%", l: "Cumulative Excess" },
      { v: "-4.04%", l: "Benchmark Return" },
      { v: "0.219", l: "Alpha" },
      { v: "0.785", l: "Beta" },
      { v: "0.722", l: "Sharpe Ratio" },
      { v: "1.080", l: "Sortino Ratio" },
      { v: "25.7%", l: "Ann. Volatility" },
      { v: "64.2%", l: "Trade Win Rate" },
      { v: "10.455", l: "Profit / Loss Ratio" },
      { v: "-36.79%", l: "Excess Max Drawdown" }
    ];
    const etfDominant = [
      { v: "11.13%", l: "Annualized Return" },
      { v: "+6.56%", l: "Annualized Excess" },
      { v: "0.75", l: "Sharpe Ratio" },
      { v: "-22.35%", l: "Maximum Drawdown", neg: true }
    ];
    const etfSecondary = [
      { v: "15.28%", l: "Ann. Volatility" },
      { v: "0.55", l: "Calmar Ratio" }
    ];
    const rob = ["Cross-Universe Validation", "Alternative Benchmarks", "CSI 300 Final Benchmark", "Daily Frequency", "Transaction Costs", "Slippage", "Point-in-Time Data", "Parameter Sensitivity"];
    const exposures = [
      { l: "Industry", v: 0.04 }, { l: "Size", v: -0.11 }, { l: "Value", v: 0.16 },
      { l: "Momentum", v: 0.21 }, { l: "Volatility", v: -0.07 }, { l: "Liquidity", v: 0.03 }
    ];
    const methods = ["Data Cleaning &amp; Winsorization", "Cross-Sectional Standardization", "Industry &amp; Size Neutralization", "Rank IC &amp; IC Decay", "Portfolio Sorting", "Event-Window Analysis", "Cross-Sectional Regression", "Fama-MacBeth Regression", "Newey-West Adjustment", "Barra Exposure Analysis", "Walk-Forward Testing", "Out-of-Sample Validation", "Parameter Sensitivity", "Cost &amp; Slippage Stress Tests"];
    const areas = [
      { k: "01", t: "Factor Research", labels: ["Profitability", "Earnings Revision", "Dividend Yield", "Valuation"] },
      { k: "02", t: "Event-Driven Signals", labels: ["Earnings Surprise", "Event Drift"] },
      { k: "03", t: "Stock Selection", labels: ["Momentum", "Relative Strength"], lead: true },
      { k: "04", t: "Industry Rotation", labels: ["Sector Momentum"], lead: true }
    ];

    return (
      '<button class="case-close" type="button" aria-label="Close case study"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll"><article class="case-article ca-y">' +

        // 1 — Hero (its own case study; the preview is NOT transferred in)
        '<section class="ca-yhero">' +
          '<div class="ca-hero-text case-reveal d1">' +
            '<div class="ca-disclaimer">' + esc(data.disclaimer) + "</div>" +
            '<div class="ca-kicker">' + esc(data.kicker) + " \u00b7 Case Study</div>" +
            '<h1 class="ca-title">' + esc(data.title) + "</h1>" +
            '<p class="ca-dek">' + esc(data.dek) + "</p>" +
            '<div class="ca-ymeta">' + esc(data.metaLine) + "</div>" +
            '<div class="ca-ystrip">' + heroStrip.map((f) =>
              '<div class="ca-ystat"><div class="ca-ystat-v ca-cu">' + f.v + '</div><div class="ca-ystat-l">' + f.l + "</div></div>"
            ).join("") + "</div>" +
          "</div>" +
        "</section>" +

        '<div class="ca-body">' +

          // 2 — Research Universe
          '<section class="ca-section">' +
            '<div class="ca-h">Research Universe</div>' +
            '<p class="ca-p">The work covered factor, event-driven, stock-selection, and industry-allocation strategies. Each study was rebuilt from its investment logic, data timing, portfolio rules, benchmark choice, and risk assumptions.</p>' +
            '<div class="ca-areas">' + areas.map((a) =>
              '<div class="ca-area' + (a.lead ? " lead" : "") + '"><div class="ca-area-k">' + a.k + '</div><div class="ca-area-t">' + a.t + "</div>" +
              yChips(a.labels, a.lead ? "lead" : "") + "</div>"
            ).join("") + "</div>" +
            '<div class="ca-areas-note">Two prototypes were taken furthest: <b>daily-frequency stock selection</b> and <b>momentum ETF rotation</b>.</div>' +
          "</section>" +

          // 3 — Daily-Frequency A-Share Stock Selection
          '<section class="ca-section">' +
            '<div class="ca-h">Daily-Frequency A-Share Stock Selection</div>' +
            '<p class="ca-p">Company fundamentals, earnings expectations, and valuation information were converted into cross-sectional signals and mapped into a long-only A-share portfolio.</p>' +
            yFigs(ssDominant) +
            '<p class="ca-p ca-pquiet">The strategy was tested from 2013 to 2023 at a daily frequency. Robustness checks covered alternative stock universes and benchmarks, with CSI 300 used for the final presentation. Transaction costs and slippage were included, and point-in-time data handling was used to control look-ahead bias and reduce overfitting risk.</p>' +
            '<details class="ca-more"><summary>Full backtest metrics</summary>' + yMetrics(ssSecondary) + "</details>" +
            '<div class="ca-rob-head">Robustness diagnostics</div>' +
            yRobMatrix(rob) +
            '<a class="ca-jq" href="' + JQ + '" target="_blank" rel="noopener noreferrer">View published strategy on JoinQuant <span aria-hidden="true">\u2197</span></a>' +
            '<div class="ca-hist">Historical backtest results, 2013 to 2023. Not live or audited returns.</div>' +
          "</section>" +

          // 4 — Momentum ETF Rotation
          '<section class="ca-section">' +
            '<div class="ca-h">Momentum ETF Rotation</div>' +
            '<p class="ca-p">Momentum and relative-strength signals were used to rank industry ETFs and adjust sector exposure over time.</p>' +
            yFigs(etfDominant) +
            '<p class="ca-p ca-pquiet">The model was evaluated across alternative lookback windows, rebalance settings, transaction-cost assumptions, and market regimes. The five-year backtest used CSI 300 as the comparison benchmark.</p>' +
            '<details class="ca-more"><summary>Full backtest metrics</summary>' + yMetrics(etfSecondary) + "</details>" +
            '<div class="ca-hist">Historical backtest results vs CSI 300. Not live or audited returns.</div>' +
          "</section>" +

          // 5 — Risk, Methods, and Robustness
          '<section class="ca-section">' +
            '<div class="ca-h">Risk and Robustness</div>' +
            '<p class="ca-p">Signals were evaluated with point-in-time data, alternative universes and benchmarks, exposure analysis, parameter-sensitivity tests, and realistic trading assumptions. These checks were used to identify results driven by persistent signals and separate them from market exposure, fragile parameters, or favorable backtest conditions.</p>' +
            '<div class="ca-rr">' +
              '<div class="ca-rr-block"><div class="ca-rr-h">Exposure control <span>Illustrative</span></div>' + yExposure(exposures) + "</div>" +
              '<div class="ca-rr-block"><div class="ca-rr-h">Parameter-stability map <span>Illustrative</span></div>' + ySurface() +
                '<div class="ca-surf-cap">Performance is read across a region of specifications, not a single parameter point.</div></div>' +
            "</div>" +
            '<div class="ca-rob-head">Methods</div>' +
            yChips(methods, "method") +
            '<div class="ca-hist">Designed to control look-ahead bias and reduce overfitting risk.</div>' +
          "</section>" +

          // 6 — Research Output and Community Use
          '<section class="ca-section">' +
            '<div class="ca-h">Research Output</div>' +
            '<p class="ca-p">The work produced more than twenty strategy studies, a daily-frequency A-share stock-selection prototype, and a momentum ETF rotation prototype.</p>' +
            '<div class="ca-out">' +
              '<div class="ca-out-item"><div class="ca-out-v ca-cu">20+</div><div class="ca-out-l">Strategy Studies</div></div>' +
              '<div class="ca-out-item"><div class="ca-out-v">1</div><div class="ca-out-l">Daily-Frequency A-Share Selection Prototype</div></div>' +
              '<div class="ca-out-item"><div class="ca-out-v">1</div><div class="ca-out-l">Momentum ETF Rotation Prototype</div></div>' +
            "</div>" +
            '<p class="ca-p">Selected research was published on JoinQuant, receiving more than 5,000 views, 200 clones, and 2,000 community points through code reuse.</p>' +
            '<div class="ca-bigfigs">' +
              '<div class="ca-bigfig"><div class="ca-bigfig-v ca-cu">5,000+</div><div class="ca-bigfig-l">Views</div></div>' +
              '<div class="ca-bigfig hero"><div class="ca-bigfig-v ca-cu">200+</div><div class="ca-bigfig-l">Clones \u00b7 actual reuse</div></div>' +
              '<div class="ca-bigfig"><div class="ca-bigfig-v ca-cu">2,000+</div><div class="ca-bigfig-l">Community Points</div></div>' +
            "</div>" +
            '<p class="ca-close-line">The result was a repeatable process for moving from an investment idea to a testable, risk-aware portfolio.</p>' +
          "</section>" +

        "</div>" +
        '<div class="ca-foot"><span>Case Study \u00b7 ' + esc(data.it.companyShort || "") + '</span><span>Zhenyuan Pan \u00b7 2026</span></div>' +
      "</article></div>"
    );
  }

  function buildArticle() {
    const data = caseData();
    if (!data) return "";
    if (data.yinhua) return buildYinhuaArticle(data);
    if (data.sinosafe) return buildSinosafeArticle(data);
    if (data.redsea && window.__redseaArticle) return window.__redseaArticle(data);
    if (data.ailabor && window.__ailaborArticle) return window.__ailaborArticle(data);
    if (data.socialcapital && window.__socialCapitalArticle) return window.__socialCapitalArticle(data);
    if (data.paper && window.__paperArticle) return window.__paperArticle(data);
    if (data.aicycle && window.__aicycleArticle) return window.__aicycleArticle(data);
    if (data.paperfactory && window.__paperFactoryArticle) return window.__paperFactoryArticle(data);
    if (data.productfactory && window.__productFactoryArticle) return window.__productFactoryArticle(data);
    if (data.quantfactor && window.__quantFactorArticle) return window.__quantFactorArticle(data);
    if (data.decisionengine && window.__decisionEngineArticle) return window.__decisionEngineArticle(data);
    if (data.rclab && window.__rclArticle) return window.__rclArticle(data);
    if (data.investmentviews && window.__investmentViewsArticle) return window.__investmentViewsArticle(data);
    if (data.competitions && window.__competitionsArticle) return window.__competitionsArticle(data);
    const meta = data.meta.filter(Boolean).map(chip).join("");
    const sections = data.sections.map((s) => {
      let viz = "";
      if (s.viz === "arch") viz = buildArch(data);
      else if (s.viz === "ranked") viz = buildRanked(data);
      else if (s.viz === "keys") viz = buildKeys(data);
      else if (s.viz === "evidence") viz = buildEvidence(data);
      return '<section class="ca-section">' +
        '<div class="ca-h">' + esc(s.h) + "</div>" +
        (s.sub ? '<h3 class="ca-sub">' + esc(s.sub) + "</h3>" : "") +
        (s.p || []).map((para) => '<p class="ca-p">' + para + "</p>").join("") +
        viz +
      "</section>";
    }).join("");

    if (data.morph === "text") {
      return (
        '<button class="case-close" type="button" aria-label="Close case study"><span>Close</span><span class="x">\u2715</span></button>' +
        '<div class="case-scroll"><article class="case-article">' +
          '<div class="ca-hero ca-hero-solo">' +
            '<div class="ca-hero-text">' +
              '<div class="ca-disclaimer">' + esc(data.disclaimer) + "</div>" +
              '<div class="ca-kicker">' + esc(data.kicker) + " \u00b7 Case Study</div>" +
              (data.title ? '<h1 class="ca-title ca-title-lg">' + esc(data.title) + "</h1>" : "") +
              (data.note ? '<div class="ca-note">' + esc(data.note) + "</div>" : "") +
              '<p class="ca-dek">' + esc(data.dek) + "</p>" +
              '<div class="ca-meta">' + meta + "</div>" +
            "</div>" +
          "</div>" +
          '<div class="ca-body case-reveal d3">' + (data.customBody ? buildGaokeBody(data) : sections) + "</div>" +
          '<div class="ca-foot case-reveal d4"><span>Case Study \u00b7 ' + esc(data.it.companyShort || "") + '</span><span>Zhenyuan Pan \u00b7 2026</span></div>' +
        "</article></div>"
      );
    }

    return (
      '<button class="case-close" type="button" aria-label="Close case study"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll"><article class="case-article">' +
        '<div class="ca-hero">' +
          '<div class="ca-hero-text case-reveal d1">' +
            '<div class="ca-disclaimer">' + esc(data.disclaimer) + "</div>" +
            '<div class="ca-kicker">' + esc(data.kicker) + " \u00b7 Case Study</div>" +
            (data.title ? '<h1 class="ca-title">' + esc(data.title) + "</h1>" : "") +
            '<p class="ca-dek">' + esc(data.dek) + "</p>" +
            '<div class="ca-meta">' + meta + "</div>" +
          "</div>" +
          '<div class="ca-figure case-reveal d2">' +
            '<div class="ca-chart" id="case-figure-slot"><span class="ca-figtag">' + esc(data.figtag || "") + "</span></div>" +
            '<div class="ca-figcap">' + (data.figcap || "") + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="ca-body case-reveal d3">' + sections + "</div>" +
        '<div class="ca-foot case-reveal d4"><span>Case Study \u00b7 ' + esc(data.it.companyShort || "") + '</span><span>Zhenyuan Pan \u00b7 2026</span></div>' +
      "</article></div>"
    );
  }

  // ── article entrance animations (scroll-reveal + count-up + chart draw) ─────
  function countUp(el) {
    const raw = el.getAttribute("data-target") || el.textContent;
    const m = raw.match(/^(\D*)(-?\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    const pre = m[1], end = parseFloat(m[2]), post = m[3];
    const dec = (m[2].split(".")[1] || "").length;
    const dur = 900, t0 = performance.now();
    function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (end * e).toFixed(dec) + post;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = pre + end.toFixed(dec) + post;
    }
    requestAnimationFrame(step);
  }
  function countUpRich(el, delay) {
    const raw = el.getAttribute("data-cu") || el.textContent;
    const m = raw.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    const pre = m[1], digits = m[2].replace(/,/g, ""), post = m[3];
    const end = parseFloat(digits);
    const dec = (digits.split(".")[1] || "").length;
    const hadComma = m[2].indexOf(",") >= 0;
    const fmt = function (n) {
      let str = Math.abs(n).toFixed(dec);
      if (hadComma) { const parts = str.split("."); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); str = parts.join("."); }
      return pre + (n < 0 ? "-" : (pre.indexOf("+") >= 0 ? "" : "")) + str + post;
    };
    el.setAttribute("data-cu", raw);
    const dur = 1100, t0 = performance.now() + (delay || 0);
    el.textContent = fmt(0);
    function step(now) {
      const p = now < t0 ? 0 : Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = raw;
    }
    requestAnimationFrame(step);
  }
  function wireWorkbookTabs() {
    if (!scroller) return;
    const nav = scroller.querySelector(".ca-wbtabs");
    if (!nav) return;
    const tabs = [].slice.call(nav.querySelectorAll(".ca-wbtab"));
    const secs = [].slice.call(scroller.querySelectorAll(".ca-sn-sec"));
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        const i = +tab.getAttribute("data-i");
        const target = scroller.querySelector('#sn-' + i);
        if (target) scroller.scrollTo({ top: target.offsetTop - 8, behavior: "smooth" });
      });
    });
    let ticking = false;
    function setActive() {
      const top = scroller.scrollTop + nav.offsetHeight + 40;
      let active = 0;
      secs.forEach(function (s) { if (s.offsetTop <= top) active = +s.getAttribute("data-i"); });
      tabs.forEach(function (t) { t.classList.toggle("active", +t.getAttribute("data-i") === active); });
    }
    scroller.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; setActive(); });
    }, { passive: true });
    setActive();
  }
  function animateArticle() {
    if (!scroller) return;
    const targets = [].slice.call(scroller.querySelectorAll(".ca-section, .ca-arch, .ca-stats, .ca-chartwrap"));
    function reveal(t) {
      if (t.__revealed) return;
      t.__revealed = true;
      t.classList.add("in");
      const rk = t.querySelector && t.querySelector(".ca-ranked");
      if (rk) rk.classList.add("drawn");
      if (t.classList.contains("ca-stats")) {
        t.querySelectorAll(".ca-stat-v").forEach(function (v, i) {
          v.setAttribute("data-target", v.textContent);
          setTimeout(function () { countUp(v); }, 80 + i * 110);
        });
      }
      const cu = t.querySelectorAll ? t.querySelectorAll(".ca-cu") : [];
      for (let i = 0; i < cu.length; i++) countUpRich(cu[i], 90 + i * 80);
    }
    function check() {
      const R = scroller.getBoundingClientRect();
      const trigger = R.bottom - R.height * 0.10;   // reveal a touch before fully in view
      let pending = false;
      targets.forEach(function (t) {
        if (t.__revealed) return;
        pending = true;
        const r = t.getBoundingClientRect();
        if (r.top < trigger && r.bottom > R.top) reveal(t);
      });
      return pending;
    }
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        if (!check()) scroller.removeEventListener("scroll", onScroll);  // all revealed → stop listening
      });
    }
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.__caCheck = check;
    wireWorkbookTabs();
    if (window.__redseaViz) window.__redseaViz.init(scroller);
    if (window.__ailaborViz) window.__ailaborViz.init(scroller);
    if (window.__socialCapitalViz) window.__socialCapitalViz.init(scroller);
    if (window.__aicycleViz) window.__aicycleViz.init(scroller);
    if (window.__paperFactoryViz) window.__paperFactoryViz.init(scroller);
    if (window.__productFactoryViz) window.__productFactoryViz.init(scroller);
    if (window.__quantFactorViz) window.__quantFactorViz.init(scroller);
    if (window.__decisionEngineViz) window.__decisionEngineViz.init(scroller);
    if (window.__rclViz) window.__rclViz.init(scroller);
    if (window.__investmentViewsViz) window.__investmentViewsViz.init(scroller);
    requestAnimationFrame(function () { requestAnimationFrame(check); });
  }

  // ── shared-element open / close ─────────────────────────────────────────────
  // The case study borrows the REAL on-screen K-line (#chart-clip): it is
  // reparented to <body>, fixed to the viewport, and flown (FLIP) from its
  // Screen-2 card into the article's figure slot while the frosted page expands
  // in place from that same card. No second chart, no white pop-up. Closing
  // flies the chart back and returns it to the scroll-morph engine.
  function sourceRect() {
    const d = caseData() || {};
    if (d.morph === "el" || d.morph === "text") {
      const el = phEl || document.getElementById(d.source);
      return el ? el.getBoundingClientRect() : null;
    }
    const host = document.getElementById("chart-host");
    return host ? host.getBoundingClientRect() : null;
  }
  function setElRect(R) {
    if (!borrowEl) return;
    borrowEl.style.left = R.left + "px";
    borrowEl.style.top = R.top + "px";
    borrowEl.style.width = R.width + "px";
    borrowEl.style.height = R.height + "px";
    if (window.__ddGraph && window.__ddGraph.resize && borrowEl && borrowEl.id === "dd-graph") window.__ddGraph.resize();
    if (window.__equityFlow && window.__equityFlow.resize && borrowEl && borrowEl.id === "equity-flow") window.__equityFlow.resize();
    if (window.__workbook && window.__workbook.resize && borrowEl && borrowEl.id === "workbook") window.__workbook.resize();
  }
  function lerpRect(a, b, t) {
    return {
      left: a.left + (b.left - a.left) * t,
      top: a.top + (b.top - a.top) * t,
      width: a.width + (b.width - a.width) * t,
      height: a.height + (b.height - a.height) * t,
    };
  }
  function intersect(R, P) {
    const x1 = Math.max(R.left, P.left), y1 = Math.max(R.top, P.top);
    const x2 = Math.min(R.left + R.width, P.left + P.width);
    const y2 = Math.min(R.top + R.height, P.top + P.height);
    return { left: x1, top: y1, width: Math.max(0, x2 - x1), height: Math.max(0, y2 - y1) };
  }
  // place the (viewport-fixed) chart so its full frame maps into rect R, clipped to C
  function applyChartToRect(R, C) {
    const W = window.innerWidth, H = window.innerHeight;
    const sFit = Math.max(R.width / W, R.height / H);
    const tx = R.left + R.width / 2 - (W * sFit) / 2;
    const ty = R.top + R.height / 2 - (H * sFit) / 2;
    panEl.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + sFit + ")";
    const c = C || R;
    const top = Math.max(0, c.top), left = Math.max(0, c.left);
    const right = Math.max(0, W - (c.left + c.width)), bottom = Math.max(0, H - (c.top + c.height));
    clipEl.style.clipPath = "inset(" + top + "px " + right + "px " + bottom + "px " + left + "px round 14px)";
  }
  function trackFrame() {
    if (!isOpen) return;
    const now = performance.now();
    let prog = flyDir > 0
      ? Math.min(1, (now - flyStart) / OPEN_MS)
      : Math.max(0, 1 - (now - flyStart) / OPEN_MS);
    const e = easeInOut(prog);
    const slot = slotEl ? slotEl.getBoundingClientRect() : startRect;
    // once settled (not flying), skip the costly transform+clip work unless the
    // slot actually moved (i.e. the article scrolled), kills idle-scroll jank
    const settled = (flyDir > 0 && prog >= 1);
    const moved = !lastSlot || Math.abs(slot.top - lastSlot.top) > 0.5 || Math.abs(slot.left - lastSlot.left) > 0.5 ||
      Math.abs(slot.width - lastSlot.width) > 0.5 || Math.abs(slot.height - lastSlot.height) > 0.5;
    if (!settled || moved) {
      const R = lerpRect(startRect, slot, e);
      const panel = scroller ? scroller.getBoundingClientRect() : layer.getBoundingClientRect();
      if (morphKind === "chart") {
        applyChartToRect(R, intersect(R, panel));
      } else {
        setElRect(R);
        const C = intersect(R, panel);
        const ct = Math.max(0, C.top - R.top), cl = Math.max(0, C.left - R.left);
        const cr = Math.max(0, (R.left + R.width) - (C.left + C.width)), cb = Math.max(0, (R.top + R.height) - (C.top + C.height));
        borrowEl.style.clipPath = "inset(" + ct + "px " + cr + "px " + cb + "px " + cl + "px round 14px)";
      }
      lastSlot = { top: slot.top, left: slot.left, width: slot.width, height: slot.height };
    }
    if (flyDir < 0 && prog <= 0) { finishClose(); return; }
    trackId = requestAnimationFrame(trackFrame);
  }
  function startTrack() { cancelAnimationFrame(trackId); trackId = requestAnimationFrame(trackFrame); }

  // text morph (block 02): the dd-graph's centre-node name flies out and grows
  // into the article's floating headline; the network stays in its card behind
  // the frosted layer (its centre label is suppressed during the flight).
  function flyTextIn() {
    const titleEl = layer.querySelector(".ca-title");
    const info = (window.__ddGraph && window.__ddGraph.targetInfo) ? window.__ddGraph.targetInfo() : null;
    if (!titleEl) return;
    if (!info) { titleEl.classList.add("ca-title-float"); return; }
    const tr = titleEl.getBoundingClientRect();
    const cs = getComputedStyle(titleEl);
    const endFs = parseFloat(cs.fontSize) || 64;
    const scale = Math.max(0.08, info.fs / endFs);
    const fly = document.createElement("div");
    fly.textContent = titleEl.textContent;
    fly.style.cssText = "position:fixed;margin:0;white-space:nowrap;pointer-events:none;z-index:62;transform-origin:0 0;";
    fly.style.left = tr.left + "px"; fly.style.top = tr.top + "px";
    fly.style.fontFamily = cs.fontFamily; fly.style.fontWeight = cs.fontWeight;
    fly.style.fontSize = cs.fontSize; fly.style.letterSpacing = cs.letterSpacing;
    fly.style.lineHeight = cs.lineHeight; fly.style.color = cs.color;
    document.body.appendChild(fly);
    textFly = fly;
    titleEl.style.visibility = "hidden";
    const dx = info.x - tr.left, dy = (info.y - info.fs / 2) - tr.top;
    fly.style.transition = "none";
    fly.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + scale + ")";
    void fly.offsetWidth;
    fly.style.transition = "transform " + OPEN_MS + "ms " + EASE;
    fly.style.transform = "none";
    setTimeout(function () {
      titleEl.style.visibility = ""; titleEl.classList.add("ca-title-float");
      if (textFly && textFly.parentNode) textFly.parentNode.removeChild(textFly);
      textFly = null;
    }, OPEN_MS + 20);
  }
  function flyTextOut(done) {
    const titleEl = layer.querySelector(".ca-title");
    const info = (window.__ddGraph && window.__ddGraph.targetInfo) ? window.__ddGraph.targetInfo() : null;
    if (!titleEl || !info) { setTimeout(done, OPEN_MS); return; }
    titleEl.classList.remove("ca-title-float");
    const tr = titleEl.getBoundingClientRect();
    const cs = getComputedStyle(titleEl);
    const endFs = parseFloat(cs.fontSize) || 64;
    const scale = Math.max(0.08, info.fs / endFs);
    const fly = document.createElement("div");
    fly.textContent = titleEl.textContent;
    fly.style.cssText = "position:fixed;margin:0;white-space:nowrap;pointer-events:none;z-index:62;transform-origin:0 0;";
    fly.style.left = tr.left + "px"; fly.style.top = tr.top + "px";
    fly.style.fontFamily = cs.fontFamily; fly.style.fontWeight = cs.fontWeight;
    fly.style.fontSize = cs.fontSize; fly.style.letterSpacing = cs.letterSpacing;
    fly.style.lineHeight = cs.lineHeight; fly.style.color = cs.color;
    document.body.appendChild(fly);
    textFly = fly;
    titleEl.style.visibility = "hidden";
    const dx = info.x - tr.left, dy = (info.y - info.fs / 2) - tr.top;
    void fly.offsetWidth;
    fly.style.transition = "transform " + OPEN_MS + "ms " + EASE;
    fly.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + scale + ")";
    setTimeout(function () { if (textFly && textFly.parentNode) textFly.parentNode.removeChild(textFly); textFly = null; done(); }, OPEN_MS);
  }

  function open(id) {
    if (isOpen || animating) return;
    if (id) { activeId = id; morphKind = (caseData() || {}).morph || "chart"; }
    const S = (morphKind === "plain") ? null : sourceRect();
    if (morphKind !== "plain" && !S) return;
    animating = true; isOpen = true;
    savedScrollY = window.scrollY;
    startRect = S;
    lastSlot = null;

    // borrow the shared element: the K-line chart, or the dd-graph network
    if (morphKind === "chart") {
      window.__caseOpen = true;
      clipEl = document.getElementById("chart-clip");
      panEl = document.getElementById("chart-pan");
      chartHome = clipEl.parentNode;
      chartNext = clipEl.nextSibling;
      document.body.appendChild(clipEl);
      clipEl.style.position = "fixed";
      clipEl.style.inset = "0";
      clipEl.style.zIndex = "61";
      clipEl.style.pointerEvents = "none";
      applyChartToRect(S, S); // hold exactly where it was, no jump
    } else if (morphKind === "el") {
      borrowEl = document.getElementById((caseData() || {}).source);
      elHome = borrowEl.parentNode;
      elNext = borrowEl.nextSibling;
      phEl = document.createElement("div");
      phEl.className = "viz-ph";
      phEl.style.width = S.width + "px";
      phEl.style.height = S.height + "px";
      elHome.insertBefore(phEl, borrowEl);
      document.body.appendChild(borrowEl);
      borrowEl.style.position = "fixed";
      borrowEl.style.zIndex = "61";
      borrowEl.style.margin = "0";
      borrowEl.style.pointerEvents = "none";
      setElRect(S);
    } else if (morphKind === "text") {
      if (window.__ddGraph && window.__ddGraph.setHideTarget) window.__ddGraph.setHideTarget(true);
    } else if (morphKind === "plain") {
      if (window.__equityFlow && window.__equityFlow.pause) window.__equityFlow.pause();
      if (window.__workbook && window.__workbook.pause) window.__workbook.pause();
    }

    // build the article + expand the frosted page from the same card rect
    overlay.classList.add("is-active");
    layer.innerHTML = buildArticle();
    backdrop = overlay.querySelector(".case-backdrop");
    scroller = layer.querySelector(".case-scroll");
    slotEl = layer.querySelector("#case-figure-slot");

    layer.style.transition = "none";
    const L = layer.getBoundingClientRect();
    layer.style.opacity = "1";
    if (morphKind === "plain") {
      layer.style.clipPath = "none";
      layer.style.opacity = "0";
      layer.style.transform = "translateY(18px)";
    } else if (morphKind === "text") {
      const ti = (window.__ddGraph && window.__ddGraph.targetInfo) ? window.__ddGraph.targetInfo() : null;
      const ox = ti ? ti.x : (S.left + S.width / 2), oy = ti ? ti.y : (S.top + S.height / 2);
      layer.__cx = Math.round(ox - L.left);
      layer.__cy = Math.round(oy - L.top);
      layer.style.clipPath = "circle(0px at " + layer.__cx + "px " + layer.__cy + "px)";
    } else {
      const t = Math.max(0, S.top - L.top), l = Math.max(0, S.left - L.left);
      const r = Math.max(0, L.right - S.right), b = Math.max(0, L.bottom - S.bottom);
      layer.style.clipPath = "inset(" + t + "px " + r + "px " + b + "px " + l + "px round 14px)";
    }
    document.body.style.overflow = "hidden";

    void layer.offsetWidth;
    const release = function () {
      if (morphKind === "plain") {
        layer.style.transition = "opacity 380ms ease, transform 400ms " + EASE;
        overlay.classList.add("is-open");
        layer.style.opacity = "1";
        layer.style.transform = "none";
        return;
      }
      layer.style.transition = "clip-path " + OPEN_MS + "ms " + EASE;
      overlay.classList.add("is-open");
      if (morphKind === "text") {
        layer.style.clipPath = "circle(175% at " + layer.__cx + "px " + layer.__cy + "px)";
      } else {
        layer.style.clipPath = "inset(0px 0px 0px 0px round 26px)";
      }
    };
    requestAnimationFrame(release);
    setTimeout(function () { if (!overlay.classList.contains("is-open")) release(); }, 60);

    // fly the chart into the figure slot, then keep it tracking the slot (so it
    // scrolls away with the article)
    if (morphKind === "text") { requestAnimationFrame(flyTextIn); }
    else if (morphKind !== "plain") { flyDir = 1; flyStart = performance.now(); startTrack(); }

    setTimeout(function () { overlay.classList.add("is-shown"); animateArticle(); }, OPEN_MS * 0.32);
    setTimeout(function () { animating = false; }, OPEN_MS + 40);
    bindCloseHandlers();
  }

  function close() {
    if (!isOpen || animating) return;
    animating = true;
    if (scroller) scroller.scrollTop = 0;   // bring the figure back to its hero spot for a clean fly-back
    const S = sourceRect() || startRect;
    startRect = S;

    overlay.classList.remove("is-shown");
    const L = layer.getBoundingClientRect();
    if (morphKind === "plain") {
      layer.style.transition = "opacity 320ms ease, transform 340ms " + EASE;
      requestAnimationFrame(function () {
        overlay.classList.remove("is-open");
        layer.style.opacity = "0";
        layer.style.transform = "translateY(18px)";
      });
      setTimeout(finishClose, 340);
      return;
    }
    layer.style.transition = "clip-path " + OPEN_MS + "ms " + EASE;
    if (morphKind === "text") {
      const cxp = layer.__cx || 0, cyp = layer.__cy || 0;
      requestAnimationFrame(function () {
        overlay.classList.remove("is-open");
        layer.style.clipPath = "circle(0px at " + cxp + "px " + cyp + "px)";
      });
    } else {
      const t = Math.max(0, S.top - L.top), l = Math.max(0, S.left - L.left);
      const r = Math.max(0, L.right - S.right), b = Math.max(0, L.bottom - S.bottom);
      requestAnimationFrame(function () {
        overlay.classList.remove("is-open");
        layer.style.clipPath = "inset(" + t + "px " + r + "px " + b + "px " + l + "px round 14px)";
      });
    }

    // fly the chart back to its Screen-2 card; finishClose() fires when it lands
    if (morphKind === "text") { flyTextOut(finishClose); }
    else { flyDir = -1; flyStart = performance.now(); startTrack(); }
  }

  function finishClose() {
    // return the borrowed element home
    if (morphKind === "chart") {
      if (clipEl) {
        clipEl.style.position = ""; clipEl.style.inset = ""; clipEl.style.zIndex = "";
        clipEl.style.pointerEvents = "";
        if (chartNext && chartNext.parentNode === chartHome) chartHome.insertBefore(clipEl, chartNext);
        else chartHome.appendChild(clipEl);
      }
    } else if (morphKind === "el" && borrowEl) {
      borrowEl.style.position = ""; borrowEl.style.zIndex = ""; borrowEl.style.margin = "";
      borrowEl.style.pointerEvents = ""; borrowEl.style.left = ""; borrowEl.style.top = "";
      borrowEl.style.width = ""; borrowEl.style.height = ""; borrowEl.style.clipPath = "";
      if (elNext && elNext.parentNode === elHome) elHome.insertBefore(borrowEl, elNext);
      else if (elHome) elHome.appendChild(borrowEl);
      if (phEl && phEl.parentNode) phEl.parentNode.removeChild(phEl);
      phEl = null;
      if (window.__ddGraph && window.__ddGraph.resize && borrowEl && borrowEl.id === "dd-graph") window.__ddGraph.resize();
      if (window.__equityFlow && window.__equityFlow.resize && borrowEl && borrowEl.id === "equity-flow") window.__equityFlow.resize();
      if (window.__workbook && window.__workbook.resize && borrowEl && borrowEl.id === "workbook") window.__workbook.resize();
      borrowEl = null;
    } else if (morphKind === "text") {
      if (window.__ddGraph && window.__ddGraph.setHideTarget) window.__ddGraph.setHideTarget(false);
    } else if (morphKind === "plain") {
      if (window.__equityFlow && window.__equityFlow.resume) window.__equityFlow.resume();
      if (window.__workbook && window.__workbook.resume) window.__workbook.resume();
    }
    overlay.classList.remove("is-active", "is-open", "is-shown");
    if (layer) { layer.innerHTML = ""; layer.style.transition = ""; layer.style.clipPath = ""; layer.style.opacity = ""; layer.style.transform = ""; }
    document.body.style.overflow = "";
    window.__caseOpen = false;            // resume the scroll-morph
    if (window.__morphMeasure) window.__morphMeasure();
    isOpen = false; animating = false;
  }

  function bindCloseHandlers() {
    const btn = layer.querySelector(".case-close");
    if (btn) btn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);
  }

  // ── shell + triggers ───────────────────────────────────────────────────────
  function relinkShell() {
    overlay = document.getElementById("case-overlay");
    layer = document.getElementById("case-layer");
    backdrop = overlay ? overlay.querySelector(".case-backdrop") : null;
  }
  function onKey(e) { if (e.key === "Escape" && isOpen) close(); }

  function wireTriggers() {
    // only the lead title (or its CTA) opens the case study, not the body copy
    document.addEventListener("click", function (e) {
      if (isOpen || animating) return;
      const hit = e.target.closest(".blk.has-case .blk-title, .blk.has-case .case-cta");
      if (hit) {
        const blk = hit.closest(".blk");
        e.preventDefault();
        open((blk ? blk.getAttribute("data-case-id") : null) || "sifra");
        return;
      }
      const card = e.target.closest(".rx-card[data-case]");
      if (card) { e.preventDefault(); open(card.getAttribute("data-case")); return; }
      const tile = e.target.closest(".vl-tile[data-paper]");
      if (tile) { e.preventDefault(); activePaper = tile.getAttribute("data-paper"); open("paper"); return; }
      const sysrow = e.target.closest(".sys-row[data-sys]");
      if (sysrow) { const m = { "ai-cycle": "aicycle", "paper-harness": "paperfactory", "pm-harness": "productfactory", "quant-harness": "quantfactor", "decision-engine": "decisionengine", "rcl": "rclab" }[sysrow.getAttribute("data-sys")]; if (m) { e.preventDefault(); open(m); } return; }
      const mqcard = e.target.closest("[data-mq]");
      if (mqcard) { const m = { "views": "investmentviews", "competitions": "competitions" }[mqcard.getAttribute("data-mq")]; if (m) { e.preventDefault(); open(m); } return; }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      const tile = e.target && e.target.closest && e.target.closest(".vl-tile[data-paper]");
      if (tile) { e.preventDefault(); activePaper = tile.getAttribute("data-paper"); open("paper"); return; }
      const sysrow = e.target && e.target.closest && e.target.closest(".sys-row[data-sys]");
      if (sysrow) { const m = { "ai-cycle": "aicycle", "paper-harness": "paperfactory", "pm-harness": "productfactory", "quant-harness": "quantfactor", "decision-engine": "decisionengine", "rcl": "rclab" }[sysrow.getAttribute("data-sys")]; if (m) { e.preventDefault(); open(m); } return; }
      const mqcard = e.target && e.target.closest && e.target.closest("[data-mq]");
      if (mqcard) { const m = { "views": "investmentviews", "competitions": "competitions" }[mqcard.getAttribute("data-mq")]; if (m) { e.preventDefault(); open(m); } }
    });
    window.addEventListener("keydown", onKey);
    // keep the overlay's source mapping correct if the viewport changes mid-open
    window.addEventListener("resize", function () { if (isOpen && !animating) { /* layout reflows; rest state is responsive */ } });
  }

  function boot() {
    relinkShell();
    if (!overlay) return;
    wireTriggers();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.__caseStudy = { open, close };
})();
