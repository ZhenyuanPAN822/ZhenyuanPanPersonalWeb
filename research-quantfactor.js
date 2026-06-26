/* research-quantfactor.js : "The Quant Factor-Mining Harness" detail page.
   Harness 03 of the AI Systems section. Opens from the .sys-row
   (data-sys="quant-harness") through the shared case-study.js frosted overlay
   (morph "plain"). Self-contained: ships its own scoped qf-* styles and reuses
   the ca-* / ai-* article shell for parity with the other detail pages.

   Exposes:
     window.__quantFactorArticle(data) -> full overlay HTML string
     window.__quantFactorViz.init(scroller) -> sticky index + progress bar,
        looping design-to-build / gate / memory animations, and the interactive
        20-state explorer, gate-script explorer, and factor-funnel explorer.

   No en-dashes or em-dashes in any visible copy (project rule). */
(function () {
  "use strict";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function p(t) { return '<p class="ca-p">' + t + "</p>"; }
  function sec(id, label, title, inner) {
    return '<section class="ca-section ai-sec qf-sec" id="qf-sec-' + id + '" data-qf-label="' + esc(label) + '">' +
      '<div class="ca-h">' + esc(label) + "</div>" +
      (title ? '<h3 class="ca-sub qf-h2">' + esc(title) + "</h3>" : "") + inner + "</section>";
  }
  var IMG = "papers/quant-factor/";

  /* ---------- scoped styles ---------- */
  var STYLE = "<style id=\"qf-style\">" + [
    ".qf-article{--mag:#d6006c;--ink:#14181f;--line:rgba(20,24,31,0.12);--mut:#6b7480;--soft:rgba(214,0,108,0.07);--paper:#faf9f7;}",
    ".qf-h2{max-width:28ch;margin-bottom:20px;}",
    ".qf-sec{padding-top:clamp(8px,1.6vh,22px);}",
    ".qf-lede{font-size:clamp(16px,1.4vw,20px);line-height:1.5;color:#3a4049;max-width:64ch;margin:0 0 8px;font-weight:400;text-wrap:pretty;}",
    ".qf-cap{font-size:12px;line-height:1.5;color:#9098a3;margin-top:12px;font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;}",
    ".qf-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#3f4751;background:var(--paper);border:1px solid var(--line);border-radius:5px;padding:1px 6px;}",
    /* plate */
    ".qf-plate{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff;margin:24px 0 6px;}",
    ".qf-plate img{display:block;width:100%;height:auto;}",
    ".qf-plate-cap{font-size:11.5px;color:#9098a3;padding:9px 13px;border-top:1px solid var(--line);font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;}",
    /* metric strip */
    ".qf-metrics{display:grid;grid-template-columns:repeat(2,1fr);column-gap:40px;row-gap:0;margin:34px 0 10px;}",
    ".qf-mc{border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;padding:15px 2px;display:flex;align-items:baseline;justify-content:space-between;gap:14px;}",
    ".qf-mv{font:800 clamp(19px,2.1vw,26px)/1.05 'Archivo',sans-serif;letter-spacing:-0.02em;color:var(--mag);font-variant-numeric:tabular-nums;flex:none;}",
    ".qf-ml{font-size:11.5px;line-height:1.35;color:var(--mut);margin-top:0;text-align:right;}",
    /* card grids */
    ".qf-cards{display:grid;gap:18px;margin:26px 0;}",
    ".qf-cards.c2{grid-template-columns:repeat(2,1fr);} .qf-cards.c3{grid-template-columns:repeat(3,1fr);}",
    ".qf-card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:19px 18px;border-top:2px solid var(--mag);}",
    ".qf-card-k{font:800 11px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--mut);margin-bottom:8px;}",
    ".qf-card-h{font:800 15px 'Archivo',sans-serif;color:var(--ink);margin:0 0 9px;letter-spacing:-0.01em;}",
    ".qf-card-b{font-size:12.5px;line-height:1.6;color:var(--mut);}",
    ".qf-card-b .qf-mono{display:inline-block;margin:2px 0;}",
    /* design-first state machine */
    ".qf-smflow{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:22px 0;}",
    ".qf-smnode{font:700 12px 'Archivo',sans-serif;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:9px;padding:10px 13px;}",
    ".qf-smnode.code{background:var(--ink);color:#fff;border-color:var(--ink);}",
    ".qf-smnode.gate{background:var(--soft);border-color:var(--mag);color:var(--mag);}",
    ".qf-smarrow{color:var(--mut);font-weight:800;}",
    /* phase lanes / states */
    ".qf-lanes{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:start;margin:24px 0;}",
    ".qf-lane{border:1px solid var(--line);border-radius:12px;background:#fff;padding:16px 17px;}",
    ".qf-lane-k{font:800 11px 'Archivo',sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:var(--mag);margin-bottom:12px;}",
    ".qf-states{display:flex;flex-direction:column;gap:7px;align-items:stretch;}",
    ".qf-state{font:700 11.5px 'Archivo',sans-serif;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:8px 11px;cursor:pointer;transition:border-color .15s,background .15s,color .15s;font-variant-numeric:tabular-nums;}",
    ".qf-state:hover{border-color:var(--mag);} .qf-state.on{background:var(--mag);color:#fff;border-color:var(--mag);}",
    ".qf-state .ix{color:var(--mag);font-weight:800;margin-right:5px;} .qf-state.on .ix{color:#fff;}",
    /* state detail */
    ".qf-statedetail{margin-top:16px;border:1px solid var(--line);border-radius:12px;background:var(--paper);padding:22px;}",
    ".qf-sd-top{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:6px;}",
    ".qf-sd-ix{font:800 22px 'Archivo',sans-serif;color:var(--mag);font-variant-numeric:tabular-nums;}",
    ".qf-sd-name{font:800 18px 'Archivo',sans-serif;color:var(--ink);letter-spacing:-0.015em;margin:0;}",
    ".qf-sd-phase{font:700 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#fff;background:var(--ink);border-radius:999px;padding:3px 10px;}",
    ".qf-sd-what{font-size:13.5px;line-height:1.55;color:#3f4751;margin:6px 0 16px;}",
    ".qf-sd-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 26px;}",
    ".qf-sd-k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:5px;}",
    ".qf-sd-v{font-size:12.5px;line-height:1.5;color:#3f4751;}",
    /* simple flow row */
    ".qf-flowrow{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:20px 0;}",
    ".qf-flowrow span.s{font:700 12px 'Archivo',sans-serif;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:9px 13px;background:#fff;}",
    ".qf-flowrow .ar{color:var(--mag);font-weight:800;}",
    /* gate cascade cards */
    ".qf-gatecards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:22px 0;}",
    ".qf-gc{border:1px solid var(--line);border-radius:12px;background:#fff;padding:16px;border-top:2px solid var(--mag);}",
    ".qf-gc-h{font:800 14px 'Archivo',sans-serif;color:var(--ink);margin:0 0 9px;}",
    ".qf-gc-row{font-size:11.5px;line-height:1.5;color:var(--mut);margin-bottom:4px;}",
    ".qf-gc-row b{color:var(--ink);font-weight:700;}",
    ".qf-gc-row .qf-mono{font-size:11px;}",
    /* novelty ladder */
    ".qf-ladder{display:flex;flex-direction:column;gap:0;margin:22px 0;border:1px solid var(--line);border-radius:12px;overflow:hidden;}",
    ".qf-lr{display:grid;grid-template-columns:54px 1fr;gap:14px;padding:15px 16px;border-bottom:1px solid var(--line);background:#fff;}",
    ".qf-ladder .qf-lr:last-child{border-bottom:0;}",
    ".qf-lr .g{font:800 14px 'Archivo',sans-serif;color:var(--mag);}",
    ".qf-lr h4{font:800 13px 'Archivo',sans-serif;color:var(--ink);margin:0 0 4px;}",
    ".qf-lr p{font-size:12px;line-height:1.5;color:var(--mut);margin:0;}",
    ".qf-levels{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0;}",
    ".qf-levels span{font:700 11px 'Archivo',sans-serif;color:var(--ink);border:1px solid var(--line);border-radius:999px;padding:6px 12px;background:var(--paper);}",
    ".qf-levels span:first-child{opacity:0.6;} .qf-levels span:last-child{background:var(--soft);border-color:var(--mag);color:var(--mag);}",
    /* routes */
    ".qf-routes{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0;}",
    ".qf-route{flex:1 1 180px;border:1px solid var(--line);border-radius:10px;padding:13px 15px;background:#fff;}",
    ".qf-route .r{font:800 11px 'Archivo',sans-serif;letter-spacing:0.06em;margin-bottom:5px;}",
    ".qf-route.pass .r{color:#1f8a5b;} .qf-route.relabel .r{color:#b06a00;} .qf-route.fail .r{color:var(--mag);}",
    ".qf-route p{font-size:12px;color:var(--mut);margin:0;line-height:1.4;}",
    /* contract flow + budget */
    ".qf-contract{display:grid;grid-template-columns:1.3fr 0.7fr;gap:18px;align-items:start;margin:22px 0;}",
    ".qf-cflow{display:flex;flex-direction:column;gap:7px;}",
    ".qf-cstep{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:11px 14px;font-size:12.5px;color:#3f4751;}",
    ".qf-cstep .n{font:800 11px 'Archivo',sans-serif;color:#fff;background:var(--mag);width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;}",
    ".qf-cstep.frozen{background:var(--soft);border-color:var(--mag);}",
    ".qf-budget{border:1px dashed var(--mag);border-radius:12px;background:var(--soft);padding:16px 18px;}",
    ".qf-budget .b{font:800 28px 'Archivo',sans-serif;color:var(--mag);letter-spacing:-0.02em;}",
    ".qf-budget .bl{font-size:11px;color:var(--mut);text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:12px;}",
    ".qf-budget .k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink);margin:12px 0 4px;}",
    ".qf-budget .v{font-size:11.5px;line-height:1.45;color:var(--mut);}",
    /* preflight shield */
    ".qf-shield{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:22px 0;}",
    ".qf-check{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:11px 14px;font-size:12.5px;color:#3f4751;}",
    ".qf-check .tick{width:18px;height:18px;flex:none;border-radius:50%;border:1.6px solid var(--mag);position:relative;}",
    ".qf-check .tick::after{content:'';position:absolute;left:5px;top:2px;width:4px;height:9px;border:solid var(--mag);border-width:0 2px 2px 0;transform:rotate(45deg);}",
    ".qf-shield-out{display:flex;gap:10px;margin-top:6px;}",
    ".qf-shield-out span{font:800 12px 'Archivo',sans-serif;border-radius:999px;padding:7px 16px;}",
    ".qf-shield-out .ok{color:#1f8a5b;border:1px solid #bfe6d4;background:#f0faf5;} .qf-shield-out .no{color:var(--mag);border:1px solid #f0c8dc;background:var(--soft);}",
    /* audit grid */
    ".qf-audit{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:22px 0;}",
    ".qf-am{border:1px solid var(--line);border-radius:10px;background:#fff;padding:12px 13px;font:600 12px 'Archivo',sans-serif;color:var(--ink);line-height:1.3;}",
    /* verdicts */
    ".qf-verdicts{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0;}",
    ".qf-vd{font:700 11.5px 'Archivo',sans-serif;border-radius:8px;padding:8px 13px;border:1px solid var(--line);background:#fff;color:var(--ink);}",
    ".qf-vd.promote{color:#1f8a5b;border-color:#bfe6d4;background:#f0faf5;}",
    ".qf-vd.kill{color:var(--mag);border-color:#f0c8dc;background:var(--soft);}",
    ".qf-ptest{font:700 14px 'Archivo',sans-serif;color:var(--ink);background:var(--soft);border-left:3px solid var(--mag);border-radius:0 8px 8px 0;padding:14px 16px;margin:16px 0;line-height:1.45;}",
    /* funnel */
    ".qf-funnel{display:flex;flex-direction:column;align-items:center;gap:10px;margin:22px 0;}",
    ".qf-fn{border-radius:11px;color:#fff;padding:16px 18px;text-align:center;background:var(--mag);}",
    ".qf-fn:nth-child(1){width:100%;} .qf-fn:nth-child(2){width:74%;background:#b8005d;} .qf-fn:nth-child(3){width:42%;background:#8a0046;}",
    ".qf-fn .v{font:800 24px 'Archivo',sans-serif;line-height:1;} .qf-fn .l{font-size:11.5px;margin-top:5px;opacity:0.92;}",
    ".qf-fbreak{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0;}",
    ".qf-fb{border:1px solid var(--line);border-radius:9px;background:#fff;padding:12px 13px;}",
    ".qf-fb .v{font:800 18px 'Archivo',sans-serif;color:var(--ink);font-variant-numeric:tabular-nums;} .qf-fb .l{font-size:10.5px;color:var(--mut);margin-top:4px;font-family:ui-monospace,Menlo,monospace;}",
    /* memory loop */
    ".qf-mloop{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:22px 0;}",
    ".qf-mloop span.n{font:700 12px 'Archivo',sans-serif;color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:9px 13px;background:#fff;}",
    ".qf-mloop span.n.mem{background:var(--soft);border-color:var(--mag);color:var(--mag);}",
    ".qf-mloop .ar{color:var(--mag);font-weight:800;}",
    ".qf-memfiles{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0;}",
    ".qf-memfiles span{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#3f4751;background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:5px 10px;}",
    ".qf-repro{display:flex;flex-direction:column;gap:8px;margin:16px 0;}",
    ".qf-repro div{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#3f4751;border:1px solid var(--line);border-radius:8px;background:#fff;padding:10px 13px;}",
    /* interactive wrappers */
    ".qf-ix-h{font:700 12px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink);margin:24px 0 14px;display:flex;align-items:center;gap:9px;}",
    ".qf-ix-h .tag{font:800 10px 'Archivo',sans-serif;letter-spacing:0.1em;color:#fff;background:var(--mag);border-radius:999px;padding:3px 9px;}",
    /* gate script explorer */
    ".qf-gex{border:1px solid var(--line);border-radius:14px;background:#fff;padding:20px;margin:18px 0;}",
    ".qf-gtabs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;}",
    ".qf-gtab{font:700 11.5px ui-monospace,Menlo,monospace;color:var(--mut);background:#fff;border:1px solid var(--line);border-radius:8px;padding:7px 11px;cursor:pointer;transition:all .15s;}",
    ".qf-gtab:hover{border-color:var(--mag);} .qf-gtab.on{background:var(--ink);color:#fff;border-color:var(--ink);}",
    ".qf-gpanel{display:grid;grid-template-columns:1fr 1fr;gap:12px 22px;}",
    ".qf-gpanel .full{grid-column:1/-1;}",
    ".qf-gk{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:4px;}",
    ".qf-gv{font-size:13px;line-height:1.5;color:#3f4751;}",
    /* funnel explorer */
    ".qf-fex{border:1px solid var(--line);border-radius:14px;background:#fff;padding:20px;margin:18px 0;}",
    ".qf-fchips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;}",
    ".qf-fchip{font:700 12px 'Archivo',sans-serif;color:var(--mut);background:#fff;border:1px solid var(--line);border-radius:999px;padding:7px 14px;cursor:pointer;transition:all .15s;}",
    ".qf-fchip:hover{border-color:var(--mag);} .qf-fchip.on{background:var(--mag);color:#fff;border-color:var(--mag);}",
    ".qf-fpanel{border:1px solid var(--line);border-radius:11px;background:var(--paper);padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px 22px;}",
    ".qf-fpanel .full{grid-column:1/-1;}",
    /* animation */
    "@keyframes qfPulse{0%,8%{border-color:var(--line);box-shadow:none;}2%{border-color:var(--mag);box-shadow:0 0 0 3px var(--soft);}100%{border-color:var(--line);box-shadow:none;}}",
    ".qf-anim .qf-smnode,.qf-anim .qf-gc,.qf-anim-loop .qf-mloop span.n{animation:qfPulse 13s linear infinite;}",
    ".qf-reveal{opacity:1;}",
    /* responsive */
    "@media (max-width:860px){",
    ".qf-metrics{grid-template-columns:repeat(2,1fr);} .qf-cards.c3{grid-template-columns:repeat(2,1fr);}",
    ".qf-gatecards{grid-template-columns:1fr;} .qf-contract{grid-template-columns:1fr;} .qf-shield{grid-template-columns:1fr;}",
    ".qf-audit{grid-template-columns:repeat(2,1fr);} .qf-sd-grid,.qf-gpanel,.qf-fpanel{grid-template-columns:1fr;} .qf-fbreak{grid-template-columns:1fr;} .qf-lanes{grid-template-columns:1fr;}",
    "}",
    "@media (max-width:520px){.qf-metrics,.qf-cards.c3,.qf-audit{grid-template-columns:1fr;}}",
    "@media (prefers-reduced-motion:reduce){.qf-anim .qf-smnode,.qf-anim .qf-gc,.qf-anim-loop .qf-mloop span.n{animation:none;}}"
  ].join("") + "</style>";

  /* ---------- data ---------- */
  var STATES = [
    { i: "0", n: "BOOTSTRAP", ph: "A", what: "Initialize or repair registry, state files, and experiment budget.", art: "registry initialized", gate: "none", block: "none", next: "DATA_INVENTORY" },
    { i: "1", n: "DATA_INVENTORY", ph: "A", what: "Record locally available tables and fields, including known-at timing.", art: "data_inventory.md", gate: "none", block: "none", next: "OBSERVATION" },
    { i: "2", n: "OBSERVATION", ph: "A", what: "Write a market-observation card based on structural, regime, crowding, or behavioral observation.", art: "market_observation_card.md", gate: "none", block: "none", next: "RESEARCH_QUESTION" },
    { i: "3", n: "RESEARCH_QUESTION", ph: "A", what: "Convert the observation into a falsifiable question about mechanism, actor, horizon, and return relation.", art: "research_question.md", gate: "none", block: "none", next: "DESIGN_DOSSIER" },
    { i: "4", n: "DESIGN_DOSSIER", ph: "B", what: "Fill design_dossier.yaml with mechanism map, actor constraints, proxies, timing, falsifiers, and minimal experiment.", art: "design_dossier.yaml", gate: "qr_design_gate.py", block: "score below 70, missing hard requirements, formula-first design", next: "DESIGN_REVIEW" },
    { i: "5", n: "DESIGN_REVIEW", ph: "B", what: "Convene a six-seat adversarial panel and require gatekeeper approval.", art: "design_review.yaml", gate: "qr_design_gate.py --check-review", block: "any role block or no gatekeeper approval", next: "NOVELTY_REDUNDANCY_AUDIT" },
    { i: "6", n: "NOVELTY_REDUNDANCY_AUDIT", ph: "B", what: "Canonicalize the formula, compare against the known factor library, and run the novelty ladder.", art: "novelty_audit.yaml", gate: "qr_novelty_audit.py", block: "known or redundant factor without relabel", next: "MINIMAL_EXPERIMENT_PLAN" },
    { i: "7", n: "MINIMAL_EXPERIMENT_PLAN", ph: "B", what: "Define the cheapest in-sample test that could falsify the mechanism.", art: "minimal_experiment_plan.yaml", gate: "none", block: "missing falsifier or missing minimal test logic", next: "CONTRACT_LOCK" },
    { i: "8", n: "CONTRACT_LOCK", ph: "B", what: "Freeze the research contract and write a SHA-256 hash.", art: "research_contract.locked.json", gate: "qr_lock_contract.py", block: "schema error, prior gate not passed, silent change after results", next: "TRIAL_REGISTERED" },
    { i: "9", n: "TRIAL_REGISTERED", ph: "B", what: "Register the formal trial row and consume one unit of the formal budget.", art: "trial_ledger.jsonl", gate: "qr_register_trial.py", block: "schema error or exhausted formal budget", next: "BUILD_PREFLIGHT" },
    { i: "10", n: "BUILD_PREFLIGHT", ph: "B", what: "Re-derive gate status and inspect contract, timestamps, costs, split, and PIT hazards.", art: "preflight status", gate: "qr_preflight.py", block: "any BLOCK line", next: "BUILD" },
    { i: "11", n: "BUILD", ph: "B", what: "Write factor_spec.py implementing the locked contract.", art: "factor_spec.py", gate: "qr_static_leak_check.py", block: "hard look-ahead pattern", next: "MINIMAL_RESULTS" },
    { i: "12", n: "MINIMAL_RESULTS", ph: "C", what: "Run the cheap mechanism test first.", art: "minimal_results.md", gate: "none", block: "none", next: "FORMAL_BACKTEST" },
    { i: "13", n: "FORMAL_BACKTEST", ph: "C", what: "Run the full in-sample and out-of-sample backtest under the locked contract.", art: "backtest_results", gate: "registered trial_id required", block: "missing trial_id", next: "RESULT_AUDIT" },
    { i: "14", n: "RESULT_AUDIT", ph: "C", what: "Produce the benchmark report with Sharpe, IC, correlations, exposures, costs, capacity, placebo, and OOS checks.", art: "benchmark_report.yaml", gate: "qr_benchmark_gate.py", block: "missing metric, placeholder, or missing control", next: "RESULT_CLASSIFICATION" },
    { i: "15", n: "RESULT_CLASSIFICATION", ph: "C", what: "Classify the result and authorize the result language.", art: "result_classification.yaml", gate: "qr_language_check.py", block: "unauthorized strong language or over-claim", next: "MEMORY_UPDATE" },
    { i: "16", n: "MEMORY_UPDATE", ph: "C", what: "Record the failure layer and the earlier-detection rule, and update the libraries.", art: "memory_update.md", gate: "none", block: "none", next: "PORTFOLIO_VALIDATION" },
    { i: "17", n: "PORTFOLIO_VALIDATION", ph: "C", what: "Test whether the signal improves the defensive book Sharpe and drawdown net of turnover.", art: "portfolio_validation.md", gate: "none", block: "none", next: "SATURATION_AUDIT or completion" },
    { i: "18", n: "SATURATION_AUDIT", ph: "C", what: "Produce a scoped low-EV claim or data request when a thesis line is exhausted.", art: "saturation_audit_log.jsonl", gate: "qr_saturation_audit.py", block: "global exhaustion wording or data request without identification gap", next: "HUMAN_ESCALATION or completion" },
    { i: "19", n: "HUMAN_ESCALATION", ph: "C", what: "Escalate to the human arbiter in rare unresolved cases.", art: "escalation note", gate: "none", block: "none", next: "human decision" }
  ];
  var PHASES = [
    { k: "Phase A \u2014 Frame the Question", ids: ["0", "1", "2", "3"] },
    { k: "Phase B \u2014 Survive Executable Gates", ids: ["4", "5", "6", "7", "8", "9", "10", "11"] },
    { k: "Phase C \u2014 Run, Audit, Conclude", ids: ["12", "13", "14", "15", "16", "17", "18", "19"] }
  ];
  /* phase labels without dashes for the lane headers */
  PHASES[0].k = "Phase A: Frame the Question";
  PHASES[1].k = "Phase B: Survive Executable Gates";
  PHASES[2].k = "Phase C: Run, Audit, Conclude";

  var SCRIPTS = [
    { id: "qr_design_gate.py", when: "Leaving DESIGN_DOSSIER or checking DESIGN_REVIEW.", validates: "schema, hard blockers, 100-point score, review approval", blocks: "low score, missing hard requirements, role block, no gatekeeper approval", log: "design_gate_log.jsonl, design_review_report.md" },
    { id: "qr_novelty_audit.py", when: "Leaving NOVELTY_REDUNDANCY_AUDIT.", validates: "formula canonicalization, known-factor overlap, novelty level", blocks: "known or redundant factor without relabel", log: "novelty_audit_log.jsonl" },
    { id: "qr_lock_contract.py", when: "Leaving CONTRACT_LOCK.", validates: "schema, design gate, novelty gate, contract immutability", blocks: "schema error, prior gate failure, silent post-result change", log: "contract_locks.jsonl, research_contract.locked.json" },
    { id: "qr_register_trial.py", when: "Leaving TRIAL_REGISTERED.", validates: "trial row schema and formal budget", blocks: "schema error or exhausted formal budget", log: "trial_ledger.jsonl, experiment_budget.json" },
    { id: "qr_preflight.py", when: "Leaving BUILD_PREFLIGHT.", validates: "all prior gates, contract integrity, timestamps, costs, split, PIT hazards", blocks: "any unresolved BLOCK line", log: "none; re-derives from registry" },
    { id: "qr_static_leak_check.py", when: "Leaving BUILD.", validates: "factor code for look-ahead patterns", blocks: "future shift, centered rolling, forward merge, same-close execution, non-PIT fields", log: "none" },
    { id: "qr_benchmark_gate.py", when: "Leaving RESULT_AUDIT.", validates: "required benchmark and attribution metrics", blocks: "missing metric, placeholder, missing control", log: "benchmark_report.yaml" },
    { id: "qr_language_check.py", when: "Leaving RESULT_CLASSIFICATION.", validates: "result language against assigned classification", blocks: "unauthorized strong language or over-claim", log: "result_classification.yaml" },
    { id: "qr_saturation_audit.py", when: "Optional SATURATION_AUDIT.", validates: "scoped low-EV claim or data request", blocks: "global exhaustion wording or data request without identification gap", log: "saturation_audit_log.jsonl" }
  ];
  var FUNNEL = [
    { k: "Thesis rows", count: "93", meaning: "Total thesis rows in the registry.", next: "Design-first state machine." },
    { k: "Completed theses", count: "83", meaning: "Thesis runs that reached a terminal or classified state.", next: "Classification and memory update." },
    { k: "Promoted factors", count: "3", meaning: "Rare candidates promoted to paper trading.", next: "Portfolio validation and registry record." },
    { k: "Scoped kills", count: "KILL_*", meaning: "Thesis rejected under a specific mechanism, data, proxy, or construction context.", next: "Memory update." },
    { k: "Known deployments", count: "relabel", meaning: "Useful factor implementation reduced to a known factor family and relabeled.", next: "known_factor_library update." },
    { k: "Memory loop", count: "feedback", meaning: "Failure layers and reduction patterns feed into the next novelty gate.", next: "Earlier detection in the next thesis." }
  ];

  /* ---------- builders ---------- */
  function metricStrip() {
    var M = [["20", "State-machine states"], ["93", "Thesis rows created"], ["83", "Completed theses"], ["3", "Promoted factors"],
      ["200", "Formal trial budget"], ["SHA-256", "Contract lock"], ["0", "Manual build bypass"], ["PIT", "Known-at timing discipline"]];
    return '<div class="qf-metrics qf-reveal">' + M.map(function (x) {
      return '<div class="qf-mc"><div class="qf-mv">' + esc(x[0]) + '</div><div class="qf-ml">' + esc(x[1]) + "</div></div>";
    }).join("") + "</div>";
  }
  function principleCards() {
    var C = [
      ["Market Observation", "Start from a real market structure, regime, crowding, or behavioral observation."],
      ["Research Question", "Convert the observation into a falsifiable economic question."],
      ["Design Dossier", "Map mechanism, proxy, timing, alternatives, falsifiers, and expected horizon."],
      ["Executable Gates", "Advance only when named scripts exit zero."],
      ["Factor Code", "Write implementation only after preflight clears."]
    ];
    return '<div class="qf-cards c3 qf-reveal">' + C.map(function (c) {
      return '<div class="qf-card"><div class="qf-card-h">' + esc(c[0]) + '</div><div class="qf-card-b">' + esc(c[1]) + "</div></div>";
    }).join("") + "</div>";
  }
  function stateMachine() {
    var nodes = ["Market Observation", "Research Question", "Design Dossier", "Design Review", "Novelty Audit", "Contract Lock", "Trial Registration", "Build Preflight", "factor_spec.py"];
    return '<div class="qf-smflow qf-reveal qf-anim-sm">' + nodes.map(function (nname, i) {
      var cls = nname === "factor_spec.py" ? " code" : (/Gate|Review|Audit|Lock|Preflight|Registration/.test(nname) ? " gate" : "");
      return (i ? '<span class="qf-smarrow" aria-hidden="true">&#8594;</span>' : "") + '<span class="qf-smnode' + cls + '">' + esc(nname) + "</span>";
    }).join("") + "</div>" +
    '<div class="qf-cap qf-reveal">Implementation begins after design, review, novelty, contract, trial, and preflight gates clear.</div>';
  }
  function plate(src, cap) { return '<div class="qf-plate qf-reveal"><img src="' + IMG + src + '" alt="' + esc(cap) + '"><div class="qf-plate-cap">' + esc(cap) + "</div></div>"; }
  function phaseLanes() {
    return '<div class="qf-lanes qf-reveal">' + PHASES.map(function (ph) {
      var chips = ph.ids.map(function (id) {
        var s = STATES.filter(function (x) { return x.i === id; })[0];
        return '<button type="button" class="qf-state" data-state="' + id + '"><span class="ix">' + id + '</span>' + esc(s.n) + "</button>";
      }).join("");
      return '<div class="qf-lane"><div class="qf-lane-k">' + esc(ph.k) + '</div><div class="qf-states">' + chips + "</div></div>";
    }).join("") + "</div>";
  }
  function stateExplorer() {
    return '<div class="qf-ix-h qf-reveal"><span class="tag">Interactive</span>20-state explorer</div>' +
      phaseLanes() +
      '<div class="qf-statedetail qf-reveal" data-qf-statedetail="1"></div>';
  }
  function obsFlow() {
    var steps = ["Data inventory", "Market observation", "Falsifiable research question", "Design dossier"];
    return '<div class="qf-flowrow qf-reveal">' + steps.map(function (s, i) {
      return (i ? '<span class="ar" aria-hidden="true">&#8594;</span>' : "") + '<span class="s">' + esc(s) + "</span>";
    }).join("") + "</div>";
  }
  function gateCascade() {
    var G = [
      ["Design Gate", "qr_design_gate.py", "design_dossier.yaml", "low score, missing mechanism, missing falsifier, missing timing map, formula-first design"],
      ["Design Review", "qr_design_gate.py --check-review", "design_review.yaml", "any role returns block or gatekeeper does not approve novelty audit"],
      ["Novelty Audit", "qr_novelty_audit.py", "novelty_audit.yaml", "known or redundant factor without relabel"],
      ["Contract Lock", "qr_lock_contract.py", "research_contract.locked.json", "schema error, prior gate failure, silent post-result change"],
      ["Trial Registration", "qr_register_trial.py", "trial_ledger.jsonl", "schema error or formal budget exhaustion"],
      ["Build Preflight", "qr_preflight.py", "preflight status", "any unreconciled gate, contract, timestamp, split, cost, or PIT issue"]
    ];
    return '<div class="qf-gatecards qf-reveal qf-anim-gate">' + G.map(function (g) {
      return '<div class="qf-gc"><div class="qf-gc-h">' + esc(g[0]) + '</div>' +
        '<div class="qf-gc-row"><b>Script</b> <span class="qf-mono">' + esc(g[1]) + "</span></div>" +
        '<div class="qf-gc-row"><b>Artifact</b> <span class="qf-mono">' + esc(g[2]) + "</span></div>" +
        '<div class="qf-gc-row"><b>Blocks</b> ' + esc(g[3]) + "</div></div>";
    }).join("") + "</div>";
  }
  function gateScriptExplorer() {
    return '<div class="qf-ix-h qf-reveal"><span class="tag">Interactive</span>Gate script explorer</div>' +
      '<div class="qf-gex qf-reveal" data-qf-gex="1"><div class="qf-gtabs" data-role="tabs"></div><div class="qf-gpanel" data-role="panel"></div></div>';
  }
  function noveltyLadder() {
    var L = [
      ["G0", "Formula canonicalization", "Strip wrappers such as rank, z-score, winsorization, and neutralization, normalize sign and representation, then compare against known_factor_library.yaml."],
      ["G1", "Literature precedent", "Check literature status. Offline checks can mark MANUAL_REQUIRED."],
      ["G2", "Theory deletion", "Remove the theory layer and test whether formula, sign, and test remain unchanged."],
      ["G4", "Internal redundancy", "Inspect internal redundancy when actual signal data exists."],
      ["G5", "Return-source redundancy", "Inspect return-source redundancy when actual signal data exists."]
    ];
    var ladder = '<div class="qf-ladder qf-reveal">' + L.map(function (l) {
      return '<div class="qf-lr"><div class="g">' + l[0] + '</div><div><h4>' + esc(l[1]) + '</h4><p>' + esc(l[2]) + "</p></div></div>";
    }).join("") + "</div>";
    var levels = ["BASELINE", "KNOWN_VARIANT", "CONDITIONAL_KNOWN", "NEW_REPRESENTATION_NO_ALPHA_YET", "NEW_MECHANISM_WEAK_EVIDENCE", "ORIGINAL_RESEARCH_CANDIDATE"];
    var levelRow = '<div class="qf-levels qf-reveal">' + levels.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>";
    var routes = '<div class="qf-routes qf-reveal">' +
      '<div class="qf-route pass"><div class="r">PASS</div><p>Continue to contract lock.</p></div>' +
      '<div class="qf-route relabel"><div class="r">PASS_RELABELED</div><p>Continue as known_factor_deployment or risk_overlay.</p></div>' +
      '<div class="qf-route fail"><div class="r">FAIL</div><p>Block build.</p></div></div>';
    return ladder + levelRow + routes;
  }
  function contractFlow() {
    var steps = ["Design gates pass", "Contract schema validates", "SHA-256 hash written", "Status becomes FROZEN", "Trial row registered", "Formal budget consumed", "Build preflight begins"];
    var flow = '<div class="qf-cflow">' + steps.map(function (s, i) {
      return '<div class="qf-cstep' + (s.indexOf("FROZEN") >= 0 ? " frozen" : "") + '"><span class="n">' + (i + 1) + "</span>" + esc(s) + "</div>";
    }).join("") + "</div>";
    var budget = '<div class="qf-budget"><div class="bl">Formal trial budget</div><div class="b">200</div>' +
      '<div class="k">Consumed by</div><div class="v">registered formal, robustness, refinement, and portfolio validation trials</div>' +
      '<div class="k">Not consumed by</div><div class="v">scratch and minimal mechanism tests</div></div>';
    return '<div class="qf-contract qf-reveal">' + flow + budget + "</div>";
  }
  function preflightShield() {
    var checks = ["Gate status re-derived", "Contract hash verified", "Signal and trade timestamps checked", "Cost and split policy checked", "PIT hazards checked", "Same-bar execution checked", "Static leak patterns scanned"];
    return '<div class="qf-shield qf-reveal">' + checks.map(function (c) {
      return '<div class="qf-check"><span class="tick" aria-hidden="true"></span>' + esc(c) + "</div>";
    }).join("") + "</div>" +
    '<div class="qf-shield-out qf-reveal"><span class="ok">BUILD allowed</span><span class="no">BUILD blocked</span></div>';
  }
  function auditBoard() {
    var M = ["Cost-adjusted Sharpe", "Incremental Sharpe vs baseline", "Raw and residual IC", "Factor correlations", "Holdings overlap", "Regression alpha", "Style exposures", "Turnover and costs", "Capacity", "Max drawdown", "Subperiod stability", "OOS / walk-forward", "Placebo / shuffled test", "Complexity-matched baseline"];
    return '<div class="qf-audit qf-reveal">' + M.map(function (m) { return '<div class="qf-am">' + esc(m) + "</div>"; }).join("") + "</div>";
  }
  function verdicts() {
    var V = [
      ["PROMOTE_TO_PAPER_TRADING", "promote"], ["RESEARCH_MORE_WITH_NEW_CONTRACT", ""], ["REFRAME_AS_RISK_MODEL_OR_OVERLAY", ""], ["PARK_DATA_INSUFFICIENT", ""],
      ["KILL_LEAKAGE", "kill"], ["KILL_OVERFIT", "kill"], ["KILL_KNOWN_FACTOR", "kill"], ["KILL_UNTRADEABLE", "kill"], ["KILL_FALSIFIED_THESIS", "kill"]
    ];
    return '<div class="qf-verdicts qf-reveal">' + V.map(function (v) { return '<span class="qf-vd ' + v[1] + '">' + esc(v[0]) + "</span>"; }).join("") + "</div>" +
      '<div class="qf-ptest qf-reveal">Portfolio test: does the signal improve the defensive book Sharpe and drawdown after turnover?</div>';
  }
  function funnel() {
    var f = '<div class="qf-funnel qf-reveal">' +
      '<div class="qf-fn"><div class="v">93</div><div class="l">thesis rows</div></div>' +
      '<div class="qf-fn"><div class="v">83</div><div class="l">completed theses</div></div>' +
      '<div class="qf-fn"><div class="v">3</div><div class="l">promoted factors</div></div></div>';
    var brk = [["17", "KILL_FALSIFIED_THESIS"], ["9", "KILL_NO_IMPROVEMENT"], ["3", "PROMOTE_TO_PAPER_TRADING"], ["3", "NOT_INCREMENTAL"], ["2", "KILL_KNOWN_FACTOR"], ["2", "REJECT_WORSE_SHARPE"]];
    var b = '<div class="qf-fbreak qf-reveal">' + brk.map(function (x) {
      return '<div class="qf-fb"><div class="v">' + x[0] + '</div><div class="l">' + esc(x[1]) + "</div></div>";
    }).join("") + "</div>";
    return f + b;
  }
  function funnelExplorer() {
    return '<div class="qf-ix-h qf-reveal"><span class="tag">Interactive</span>Factor funnel explorer</div>' +
      '<div class="qf-fex qf-reveal" data-qf-fex="1"><div class="qf-fchips" data-role="chips"></div><div class="qf-fpanel" data-role="panel"></div></div>';
  }
  function memLoop() {
    var nodes = ["Thesis result", "Failure layer", "memory_update.md", "Known / failed / proxy libraries", "Next thesis novelty gate", "Earlier detection"];
    var loop = '<div class="qf-mloop qf-reveal qf-anim-loop">' + nodes.map(function (nname, i) {
      var mem = /memory_update|libraries/.test(nname);
      return (i ? '<span class="ar" aria-hidden="true">&#8594;</span>' : "") + '<span class="n' + (mem ? " mem" : "") + '">' + esc(nname) + "</span>";
    }).join("") + "</div>";
    var files = ["known_factor_library.yaml", "factor_genealogy.yaml", "failed_mechanisms.yaml", "proxy_failure_library.yaml", "leakage_patterns.yaml", "redundancy_patterns.yaml", "regime_lessons.yaml"];
    var fileRow = '<div class="qf-memfiles qf-reveal">' + files.map(function (f) { return "<span>" + esc(f) + "</span>"; }).join("") + "</div>";
    var repro = '<div class="qf-repro qf-reveal">' + ["qr_next.py", "registry/*.jsonl", "qr_check_contract_integrity.py", "qr_validate.py --strict"].map(function (r) { return "<div>" + esc(r) + "</div>"; }).join("") +
      '</div><div class="qf-cap qf-reveal">Gate decisions can be re-derived from append-only logs without rerunning a backtest.</div>';
    return loop + fileRow + repro;
  }

  /* ---------- article ---------- */
  window.__quantFactorArticle = function (data) {
    var H = STYLE;

    H += '<div class="ai-controls qf-controls">' +
      '<span class="qf-brand" style="display:inline-flex;align-items:center;gap:8px;flex:none;font:800 11px \'Archivo\',sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:#d6006c;"><i style="width:9px;height:9px;border-radius:2px;background:#d6006c;display:inline-block;"></i>AI Harness 03</span>' +
      '<nav class="ai-index" aria-label="Section index"></nav></div>';
    H += '<div class="ai-progress" data-qf-progress="1"><i></i></div>';

    /* HERO */
    H += '<section class="ca-section ai-sec qf-sec" id="qf-sec-hero" data-qf-label="Overview">' +
      '<div class="ca-kicker">AI Systems &middot; Harness 03</div>' +
      '<h1 class="ca-title">The Quant Factor-Mining Harness</h1>' +
      '<div class="ai-role">A design-first state machine for batch A-share factor research</div>' +
      '<p class="qf-lede">A design-first QR workflow for turning market observations into falsifiable factor theses, executable gates, locked contracts, backtests, benchmark audits, and portfolio-level validation.</p>' +
      p("This harness organizes factor research as a state machine. A thesis begins with market observation, becomes a falsifiable research question, passes a design dossier, enters adversarial review, runs a novelty audit, locks a research contract, registers a trial, clears build preflight, writes factor code, runs backtests, enters result audit, updates memory, and reaches portfolio validation.") +
      p("The core rule is design before code. A new thesis directory is created without " + '<span class="qf-mono">factor_spec.py</span>' + ". Factor code can only appear after the design dossier, review panel, novelty audit, contract lock, trial registration, and preflight gates are green. The harness makes implementation a late-stage artifact.") +
      metricStrip() +
      '<div class="qf-cap qf-reveal">A factor idea moves from market observation to portfolio validation through executable gates and append-only evidence logs.</div>' +
      "</section>";

    /* 1 design-first operating model */
    H += sec("model", "Design-First Operating Model", "A Factor Idea Is a Research Thesis Before It Is Code",
      p("The harness treats a factor idea as a research thesis before it becomes code. The first states frame the question: data inventory, market observation, and research question. The next states test the thesis structure: design dossier, adversarial review, novelty audit, minimal experiment plan, contract lock, trial registration, and build preflight. Only then can " + '<span class="qf-mono">factor_spec.py</span>' + " be written.") +
      p("The design-first structure changes the unit of work. The agent begins by defining the economic mechanism, actor constraints, observable implications, proxy justification, known-at timing, falsifiers, alternative explanations, and minimal experiment.") +
      principleCards() +
      stateMachine() +
      plate("quant-platform.png", "Reference: a unified platform for quantitative research, backtesting, and live trading. Source: quantconnect.com."));

    /* 2 20-state pipeline */
    H += sec("pipeline", "The 20-State QR Pipeline", "Twenty States, Three Phases",
      p("The workflow has 20 states, indexed 0 to 19. The current position is tracked in " + '<span class="qf-mono">registry/current_state.json</span>' + ". Gated states name the artifact they produce and the script that must exit zero before the thesis can advance. Phase A frames the question, Phase B runs executable gates, and Phase C runs, audits, classifies, and validates.") +
      stateExplorer());

    /* 3 observation to question */
    H += sec("observation", "From Observation to Research Question", "Market Structure Before Formula",
      p("The first research states prevent formula-first work. DATA_INVENTORY records what tables and fields are locally available, including known-at timing. OBSERVATION writes a market-observation card. RESEARCH_QUESTION converts that observation into a falsifiable question about a mechanism, actor, horizon, and expected return relation. The system moves from market structure to economic question before any factor formula is written.") +
      obsFlow());

    /* 4 executable gates */
    H += sec("gates", "Executable Gates Before Build", "Most Ideas Die Before Code",
      p("DESIGN_DOSSIER produces " + '<span class="qf-mono">design_dossier.yaml</span>' + ". The design gate scores it on mechanism, proxy timing, falsifiability, novelty, alternatives, minimal experiment, implementation, and complexity. DESIGN_REVIEW convenes a six-seat adversarial panel: Mechanism Skeptic, Proxy Auditor, Known-Factor Prosecutor, Falsification Designer, Data-Execution Red Team, and Research Director. MINIMAL_EXPERIMENT_PLAN defines the cheapest in-sample test that could falsify the mechanism, and requires a must-fail arm, mediator, moderation, monotonicity test, or equivalent falsifier before formal build.") +
      gateCascade() +
      gateScriptExplorer());

    /* 5 novelty audit */
    H += sec("novelty", "Novelty and Redundancy Audit", "New Mechanisms vs Relabeled Known Factors",
      p("The novelty audit separates new mechanisms from relabeled known factors. G0 canonicalizes the factor expression, strips wrappers, normalizes sign and representation, then compares against the known factor library. G1 checks literature precedent. G2 removes the theory layer and checks whether formula, sign, and test remain unchanged. G4 and G5 inspect internal and return-source redundancy when signal data exists. A known factor can still be relabeled as a deployment or risk overlay, but a redundant factor cannot pass as original research.") +
      noveltyLadder());

    /* 6 contract lock */
    H += sec("contract", "Contract Lock and Trial Ledger", "Freezing the Research Design",
      p("The contract lock freezes the research design. " + '<span class="qf-mono">research_contract.locked.json</span>' + " defines the signal formula, allowed and forbidden transforms, signal and trade timestamps, holding period, rebalance frequency, data tables, field known-at timing, universe, costs, split policy, required benchmarks, predictions, promotion and kill conditions, interpretation rules, and post-result forbidden changes. " + '<span class="qf-mono">qr_lock_contract.py</span>' + " validates prior gates, freezes the contract, writes a SHA-256 hash, and sets status to FROZEN. Any later change requires a V2 contract with a parent hash. The trial ledger then registers the formal experiment and consumes one unit from the formal budget.") +
      contractFlow());

    /* 7 preflight */
    H += sec("preflight", "Build Preflight and Factor Code", "The Master Gate Before Code",
      p("BUILD_PREFLIGHT is the master gate before code. " + '<span class="qf-mono">qr_preflight.py</span>' + " does not trust a build-allowed flag. It re-derives gate status from append-only logs, runs contract-integrity checks, and inspects the locked contract for timestamp, cost, split, same-bar, point-in-time, and forbidden-field issues. Hand-editing " + '<span class="qf-mono">current_state.json</span>' + " cannot satisfy these checks. BUILD is the only state that can write " + '<span class="qf-mono">04_build/factor_spec.py</span>' + ", and " + '<span class="qf-mono">qr_static_leak_check.py</span>' + " scans for look-ahead patterns before the thesis can leave build.") +
      preflightShield());

    /* 8 build backtest audit */
    H += sec("audit", "Build, Backtest, and Audit", "From Cheap Mechanism Test to Full Benchmark Report",
      p("MINIMAL_RESULTS runs the cheap mechanism test first. FORMAL_BACKTEST runs the full in-sample and out-of-sample backtest under the locked contract, and a formal run must have a registered trial_id. RESULT_AUDIT produces the benchmark report, and " + '<span class="qf-mono">qr_benchmark_gate.py</span>' + " blocks missing mandatory metrics, placeholders, or missing controls.") +
      auditBoard() +
      plate("quant-iso.png", "Reference: a research, backtesting, and analytics stack feeding a central engine."));

    /* 9 classification + portfolio */
    H += sec("classification", "Result Classification and Portfolio Validation", "Language Controlled by Classification",
      p("Result language is controlled by the assigned classification. " + '<span class="qf-mono">qr_language_check.py</span>' + " authorizes which words can be used for each result level. A known deployment cannot be described as an original discovery, and a complex factor that does not beat a simple baseline is downgraded. PORTFOLIO_VALIDATION runs the decisive portfolio addition test: whether the signal improves Sharpe and drawdown net of turnover. Cross-sectional incremental t-statistics remain diagnostics.") +
      verdicts());

    /* 10 batch loop */
    H += sec("funnel", "Batch Factor-Mining Loop", "A High-Throughput Thesis Funnel",
      p("The registry contains 93 thesis rows. Current state records 83 completed theses and 3 promoted factors. The distribution is deliberately kill-heavy: many ideas are falsified, reduced to known factors, shown to be non-incremental, blocked for leakage, or parked for data insufficiency. Hypothesis intake accepts mechanism-bearing candidates generated through structured reasoning strategies, the cheap minimal experiment runs before the full gate chain, and most candidates exit early.") +
      funnel() +
      funnelExplorer());

    /* 11 memory */
    H += sec("memory", "Memory and Reproduction", "Append-Only Evidence and Re-Derivable Verdicts",
      p("Each thesis writes durable memory. MEMORY_UPDATE records the failure layer (formula, proxy, mechanism, horizon, data, or execution) and how to catch the same pattern one gate earlier. The registry is append-only: gate verdicts, contract locks, trial rows, and decisions are written to logs, and a verdict can be re-derived from files without rerunning a backtest. A fresh session resumes by running " + '<span class="qf-mono">qr_next.py</span>' + ", inspecting registry logs, checking contract integrity, and running strict validation.") +
      memLoop());

    /* 12 what it shows */
    H += sec("shows", "What This Harness Shows", "Factor Research as a Design-First State Machine",
      p("Market observations become research questions. Research questions become design dossiers. Designs pass executable gates. Contracts freeze the research plan. Trial rows consume formal budget. Preflight clears implementation. Factor code produces results. Results enter benchmark audit. Classifications control language. Memory changes the next novelty gate.") +
      p("The system shows how agentic quant research can combine mechanism design, code enforcement, point-in-time discipline, contract locks, trial budgets, backtest audits, and portfolio validation in one repeatable loop.") +
      '<div class="ca-foot"><span>AI Harness 03 &middot; The Quant Factor-Mining Harness</span><span>Zhenyuan Pan &middot; 2026</span></div>');

    return (
      '<button class="case-close" type="button" aria-label="Close article"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll qf-scroll"><article class="case-article ai-article qf-article">' + H + "</article></div>"
    );
  };

  /* ================= viz ================= */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wireIndexAndProgress(scroller) {
    var nav = scroller.querySelector(".qf-controls .ai-index");
    var secs = [].slice.call(scroller.querySelectorAll(".qf-sec[data-qf-label]"));
    if (!nav) return;
    var links = [];
    secs.forEach(function (s) {
      var a = document.createElement("button");
      a.type = "button"; a.className = "ai-ix"; a.textContent = s.getAttribute("data-qf-label"); a.setAttribute("data-target", s.id);
      a.addEventListener("click", function () {
        var top = s.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 92;
        scroller.scrollTo({ top: top, behavior: REDUCED ? "auto" : "smooth" });
      });
      nav.appendChild(a); links.push({ a: a, s: s });
    });
    var prog = scroller.querySelector(".ai-progress i");
    var ticking = false;
    function upd() {
      var max = scroller.scrollHeight - scroller.clientHeight;
      var f = max > 0 ? scroller.scrollTop / max : 0;
      if (prog) prog.style.transform = "scaleX(" + Math.max(0, Math.min(1, f)).toFixed(4) + ")";
      var mid = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.3;
      var active = links[0];
      links.forEach(function (l) { if (l.s.getBoundingClientRect().top <= mid) active = l; });
      links.forEach(function (l) { l.a.classList.toggle("on", l === active); });
    }
    scroller.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; upd(); });
    }, { passive: true });
    upd();
  }

  function wireAnim(scroller) {
    if (REDUCED) return;
    [[".qf-anim-sm .qf-smnode", ".qf-anim-sm"], [".qf-anim-gate .qf-gc", ".qf-anim-gate"], [".qf-anim-loop .qf-mloop span.n", ".qf-anim-loop"]].forEach(function (pair) {
      var els = [].slice.call(scroller.querySelectorAll(pair[0]));
      var n = els.length; if (!n) return;
      var parent = scroller.querySelector(pair[1]); if (parent) parent.classList.add("qf-anim");
      els.forEach(function (e, idx) { e.style.animationDelay = (idx * (13 / n)).toFixed(2) + "s"; });
    });
  }

  function wireStateExplorer(scroller) {
    var detail = scroller.querySelector("[data-qf-statedetail]");
    if (!detail) return;
    var btns = [].slice.call(scroller.querySelectorAll(".qf-state[data-state]"));
    var phaseName = { A: "Frame the Question", B: "Executable Gates", C: "Run, Audit, Conclude" };
    function render(id) {
      var s = STATES.filter(function (x) { return x.i === id; })[0];
      if (!s) return;
      btns.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-state") === id); });
      detail.innerHTML =
        '<div class="qf-sd-top"><span class="qf-sd-ix">' + s.i + '</span><h4 class="qf-sd-name">' + esc(s.n) + '</h4><span class="qf-sd-phase">' + esc(phaseName[s.ph]) + "</span></div>" +
        '<p class="qf-sd-what">' + esc(s.what) + "</p>" +
        '<div class="qf-sd-grid">' +
          '<div><div class="qf-sd-k">Artifact</div><div class="qf-sd-v"><span class="qf-mono">' + esc(s.art) + "</span></div></div>" +
          '<div><div class="qf-sd-k">Gate script</div><div class="qf-sd-v">' + (s.gate === "none" ? "none" : '<span class="qf-mono">' + esc(s.gate) + "</span>") + "</div></div>" +
          '<div><div class="qf-sd-k">Blocking condition</div><div class="qf-sd-v">' + esc(s.block) + "</div></div>" +
          '<div><div class="qf-sd-k">Next route</div><div class="qf-sd-v">' + esc(s.next) + "</div></div>" +
        "</div>";
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { render(b.getAttribute("data-state")); }); });
    render("4");
  }

  function wireGateScripts(scroller) {
    var box = scroller.querySelector("[data-qf-gex]");
    if (!box) return;
    var tabs = box.querySelector('[data-role="tabs"]');
    var panel = box.querySelector('[data-role="panel"]');
    SCRIPTS.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "qf-gtab" + (i === 0 ? " on" : ""); b.textContent = s.id;
      b.addEventListener("click", function () {
        tabs.querySelectorAll(".qf-gtab").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); render(s);
      });
      tabs.appendChild(b);
    });
    function render(s) {
      panel.innerHTML =
        '<div><div class="qf-gk">When it runs</div><div class="qf-gv">' + esc(s.when) + "</div></div>" +
        '<div><div class="qf-gk">What it validates</div><div class="qf-gv">' + esc(s.validates) + "</div></div>" +
        '<div><div class="qf-gk">What blocks</div><div class="qf-gv">' + esc(s.blocks) + "</div></div>" +
        '<div><div class="qf-gk">Log written</div><div class="qf-gv"><span class="qf-mono">' + esc(s.log) + "</span></div></div>";
    }
    render(SCRIPTS[0]);
  }

  function wireFunnel(scroller) {
    var box = scroller.querySelector("[data-qf-fex]");
    if (!box) return;
    var chips = box.querySelector('[data-role="chips"]');
    var panel = box.querySelector('[data-role="panel"]');
    FUNNEL.forEach(function (f, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "qf-fchip" + (i === 0 ? " on" : ""); b.textContent = f.k;
      b.addEventListener("click", function () {
        chips.querySelectorAll(".qf-fchip").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); render(f);
      });
      chips.appendChild(b);
    });
    function render(f) {
      panel.innerHTML =
        '<div><div class="qf-gk">Count or role</div><div class="qf-gv">' + esc(f.count) + "</div></div>" +
        '<div><div class="qf-gk">Meaning</div><div class="qf-gv">' + esc(f.meaning) + "</div></div>" +
        '<div class="full"><div class="qf-gk">What happens next</div><div class="qf-gv">' + esc(f.next) + "</div></div>";
    }
    render(FUNNEL[0]);
  }

  window.__quantFactorViz = {
    init: function (scroller) {
      if (!scroller || scroller.__qfDone) return;
      if (!scroller.querySelector(".qf-article")) return;
      scroller.__qfDone = true;
      try {
        wireIndexAndProgress(scroller);
        wireAnim(scroller);
        wireStateExplorer(scroller);
        wireGateScripts(scroller);
        wireFunnel(scroller);
      } catch (err) { if (window.console) console.warn("quantfactor-viz", err); }
    }
  };
})();
