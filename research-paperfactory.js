/* research-paperfactory.js : "The Research Paper Factory Harness" detail page.
   Harness 01 of the AI Systems section. Opens from the .sys-row
   (data-sys="paper-harness") through the shared case-study.js frosted overlay
   (morph "plain"). Self-contained: ships its own scoped pf-* styles and reuses
   the ca-* / ai-* article shell for parity with the other detail pages.

   Exposes:
     window.__paperFactoryArticle(data) -> full overlay HTML string
     window.__paperFactoryViz.init(scroller) -> sticky index + progress bar,
        looping pipeline / bridge / gate animations, and the interactive
        step explorer, gate simulator, and artifact explorer.

   No en-dashes or em-dashes in any visible copy (project rule). */
(function () {
  "use strict";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function p(t) { return '<p class="ca-p">' + t + "</p>"; }
  function sec(id, label, title, inner) {
    return '<section class="ca-section ai-sec pf-sec" id="pf-sec-' + id + '" data-pf-label="' + esc(label) + '">' +
      '<div class="ca-h">' + esc(label) + "</div>" +
      (title ? '<h3 class="ca-sub pf-h2">' + esc(title) + "</h3>" : "") + inner + "</section>";
  }
  var IMG = "papers/paper-factory/";

  /* ---------- scoped styles ---------- */
  var STYLE = "<style id=\"pf-style\">" + [
    ".pf-article{--mag:#d6006c;--ink:#14181f;--line:rgba(20,24,31,0.12);--mut:#6b7480;--soft:rgba(214,0,108,0.07);--paper:#faf9f7;--mono:'Archivo',sans-serif;}",
    ".pf-h2{max-width:28ch;margin-bottom:20px;}",
    ".pf-sec{padding-top:clamp(8px,1.6vh,22px);}",
    ".pf-lede{font-size:clamp(16px,1.4vw,20px);line-height:1.5;color:#3a4049;max-width:64ch;margin:0 0 8px;font-weight:400;text-wrap:pretty;}",
    ".pf-cap{font-size:12px;line-height:1.5;color:#9098a3;margin-top:12px;font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;}",
    /* plate */
    ".pf-plate{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff;margin:22px 0 6px;}",
    ".pf-plate img{display:block;width:100%;height:auto;}",
    ".pf-plate-cap{font-size:11.5px;color:#9098a3;padding:9px 13px;border-top:1px solid var(--line);font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;}",
    /* metric panel */
    ".pf-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:34px 0 10px;}",
    ".pf-mc{border:1px solid var(--line);border-top:2px solid var(--mag);border-radius:12px;background:#fff;padding:19px 17px 18px;}",
    ".pf-mv{font:800 clamp(22px,2.4vw,32px)/1 'Archivo',sans-serif;letter-spacing:-0.02em;color:var(--ink);font-variant-numeric:tabular-nums;}",
    ".pf-ml{font-size:11.5px;line-height:1.4;color:var(--mut);margin-top:10px;}",
    /* generic card grids */
    ".pf-cards{display:grid;gap:18px;margin:26px 0;}",
    ".pf-cards.c2{grid-template-columns:repeat(2,1fr);} .pf-cards.c3{grid-template-columns:repeat(3,1fr);} .pf-cards.c5{grid-template-columns:repeat(5,1fr);}",
    ".pf-card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:19px 18px;border-top:2px solid var(--mag);}",
    ".pf-card-k{font:800 11px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--mut);margin-bottom:8px;}",
    ".pf-card-h{font:800 15px 'Archivo',sans-serif;color:var(--ink);margin:0 0 9px;letter-spacing:-0.01em;}",
    ".pf-card-b{font-size:12.5px;line-height:1.6;color:var(--mut);}",
    ".pf-card-b code,.pf-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#3f4751;background:var(--paper);border:1px solid var(--line);border-radius:5px;padding:1px 5px;}",
    /* three-role diagram */
    ".pf-roles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;align-items:stretch;margin:26px 0;border:1px solid var(--line);border-radius:13px;overflow:hidden;}",
    ".pf-role{padding:22px 20px;background:#fff;border-right:1px solid var(--line);position:relative;}",
    ".pf-role:last-child{border-right:0;}",
    ".pf-role.exec{background:var(--soft);}",
    ".pf-role-k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:var(--mag);margin-bottom:4px;}",
    ".pf-role-h{font:800 16px 'Archivo',sans-serif;color:var(--ink);margin:0 0 8px;}",
    ".pf-role-b{font-size:12.5px;line-height:1.55;color:var(--mut);}",
    ".pf-edges{display:flex;flex-direction:column;gap:9px;margin:14px 0 22px;}",
    ".pf-edge{display:flex;align-items:center;gap:10px;font-size:12.5px;color:#3f4751;border:1px solid var(--line);border-radius:8px;padding:11px 14px;background:#fff;}",
    ".pf-edge .f{font:700 11px 'Archivo',sans-serif;color:var(--mag);white-space:nowrap;}",
    ".pf-edge .ar{color:var(--mut);}",
    /* bridge steps */
    ".pf-bridge{display:grid;grid-template-columns:repeat(5,1fr);gap:0;margin:26px 0;}",
    ".pf-bstep{position:relative;border:1px solid var(--line);border-right:0;padding:18px 16px;background:#fff;}",
    ".pf-bridge .pf-bstep:last-child{border-right:1px solid var(--line);}",
    ".pf-bstep .n{font:800 12px 'Archivo',sans-serif;color:#fff;background:var(--mag);width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}",
    ".pf-bstep h4{font:800 13px 'Archivo',sans-serif;color:var(--ink);margin:0 0 6px;}",
    ".pf-bstep p{font-size:11.5px;line-height:1.5;color:var(--mut);margin:0;}",
    /* pipeline lanes */
    ".pf-lanes{display:flex;flex-direction:column;gap:14px;margin:26px 0;}",
    ".pf-lane{border:1px solid var(--line);border-radius:12px;background:#fff;padding:17px 18px;}",
    ".pf-lane-k{font:800 11px 'Archivo',sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:var(--mag);margin-bottom:13px;}",
    ".pf-chips{display:flex;flex-wrap:wrap;gap:9px;align-items:center;}",
    ".pf-step{font:700 12px 'Archivo',sans-serif;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:9px 13px;cursor:pointer;transition:border-color .15s,background .15s,color .15s;font-variant-numeric:tabular-nums;}",
    ".pf-step:hover{border-color:var(--mag);} .pf-step.key{border-color:var(--mag);color:var(--mag);}",
    ".pf-step.on{background:var(--mag);color:#fff;border-color:var(--mag);}",
    ".pf-step.lit{border-color:var(--mag);box-shadow:0 0 0 3px var(--soft);}",
    ".pf-arrow{color:var(--mut);font-size:12px;}",
    /* step explorer detail */
    ".pf-stepdetail{margin-top:16px;border:1px solid var(--line);border-radius:12px;background:var(--paper);padding:22px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px 30px;}",
    ".pf-sd-full{grid-column:1 / -1;}",
    ".pf-sd-name{font:800 17px 'Archivo',sans-serif;color:var(--ink);letter-spacing:-0.015em;margin:0;}",
    ".pf-sd-k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:4px;}",
    ".pf-sd-v{font-size:13px;line-height:1.5;color:#3f4751;}",
    ".pf-sd-runner{display:inline-block;font:700 11px 'Archivo',sans-serif;color:#fff;background:var(--ink);border-radius:999px;padding:3px 10px;}",
    ".pf-sd-runner.pro{background:var(--mag);}",
    /* gates */
    ".pf-gates{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin:26px 0;align-items:stretch;}",
    ".pf-gate{position:relative;border:1px solid var(--line);border-radius:12px;background:#fff;padding:17px 15px;display:flex;flex-direction:column;}",
    ".pf-gate-id{font:800 13px 'Archivo',sans-serif;color:var(--mag);font-variant-numeric:tabular-nums;}",
    ".pf-gate-h{font:800 13px 'Archivo',sans-serif;color:var(--ink);margin:5px 0 7px;line-height:1.15;}",
    ".pf-gate-b{font-size:11.5px;line-height:1.45;color:var(--mut);}",
    ".pf-gate.probe{border-top:2px solid var(--mag);background:var(--soft);}",
    ".pf-routes{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0;}",
    ".pf-route{flex:1 1 150px;border:1px solid var(--line);border-radius:10px;padding:14px 15px;background:#fff;}",
    ".pf-route .r{font:800 11px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:5px;}",
    ".pf-route.pass .r{color:#1f8a5b;} .pf-route.fail .r{color:var(--mag);} .pf-route.block .r{color:#b06a00;}",
    ".pf-route p{font-size:12px;color:var(--mut);margin:0;line-height:1.4;}",
    /* gate simulator */
    ".pf-sim{border:1px solid var(--line);border-radius:14px;background:#fff;padding:18px;margin:18px 0;}",
    ".pf-sim-tabs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;}",
    ".pf-sim-tab{font:800 12px 'Archivo',sans-serif;color:var(--mut);background:#fff;border:1px solid var(--line);border-radius:8px;padding:7px 12px;cursor:pointer;font-variant-numeric:tabular-nums;transition:all .15s;}",
    ".pf-sim-tab:hover{border-color:var(--mag);} .pf-sim-tab.on{background:var(--mag);color:#fff;border-color:var(--mag);}",
    ".pf-sim-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;}",
    ".pf-sim-ctl label{display:block;font-size:12.5px;color:var(--ink);margin-bottom:6px;}",
    ".pf-sim-ctl .rowv{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;}",
    ".pf-sim-ctl .rowv b{font:800 16px 'Archivo',sans-serif;color:var(--mag);font-variant-numeric:tabular-nums;}",
    ".pf-sim-ctl input[type=range]{width:100%;accent-color:var(--mag);}",
    ".pf-toggle{display:inline-flex;gap:6px;margin-top:12px;}",
    ".pf-toggle button{font:700 12px 'Archivo',sans-serif;border:1px solid var(--line);background:#fff;color:var(--mut);border-radius:8px;padding:6px 12px;cursor:pointer;}",
    ".pf-toggle button.on{background:var(--ink);color:#fff;border-color:var(--ink);}",
    ".pf-state-btns{display:flex;gap:7px;margin-top:6px;}",
    ".pf-state-btns button{flex:1;font:800 12px 'Archivo',sans-serif;border:1px solid var(--line);background:#fff;color:var(--mut);border-radius:8px;padding:9px 6px;cursor:pointer;}",
    ".pf-state-btns button.on{background:var(--mag);color:#fff;border-color:var(--mag);}",
    ".pf-verdict{border:1px solid var(--line);border-radius:11px;padding:14px;background:var(--paper);}",
    ".pf-verdict .vbig{font:800 clamp(22px,2.6vw,30px)/1 'Archivo',sans-serif;letter-spacing:-0.01em;margin-bottom:8px;}",
    ".pf-verdict.pass .vbig{color:#1f8a5b;} .pf-verdict.fail .vbig{color:var(--mag);} .pf-verdict.block .vbig{color:#b06a00;} .pf-verdict.redesign .vbig{color:#b06a00;}",
    ".pf-verdict p{font-size:12.5px;color:var(--mut);margin:0 0 4px;line-height:1.45;}",
    ".pf-sim-meta{margin-top:14px;font-size:12px;color:var(--mut);line-height:1.5;}",
    ".pf-sim-meta b{color:var(--ink);}",
    /* checklist */
    ".pf-check{display:flex;flex-direction:column;gap:11px;margin:22px 0;}",
    ".pf-ci{display:grid;grid-template-columns:54px 1fr;gap:14px;align-items:start;border:1px solid var(--line);border-radius:10px;padding:15px 16px;background:#fff;}",
    ".pf-ci .id{font:800 13px 'Archivo',sans-serif;color:var(--mag);}",
    ".pf-ci h4{font:800 13px 'Archivo',sans-serif;color:var(--ink);margin:0 0 3px;}",
    ".pf-ci p{font-size:12px;line-height:1.45;color:var(--mut);margin:0;}",
    ".pf-techline{font:700 13px 'Archivo',sans-serif;color:var(--ink);background:var(--soft);border-left:3px solid var(--mag);border-radius:0 8px 8px 0;padding:11px 14px;margin:14px 0;}",
    /* spec stack */
    ".pf-stack{display:flex;flex-direction:column;gap:0;margin:16px 0;}",
    ".pf-si{display:grid;grid-template-columns:200px 1fr;gap:18px;border:1px solid var(--line);border-bottom:0;padding:18px 18px;background:#fff;align-items:baseline;}",
    ".pf-stack .pf-si:last-child{border-bottom:1px solid var(--line);}",
    ".pf-si:nth-child(1){border-radius:11px 11px 0 0;} .pf-stack .pf-si:last-child{border-radius:0 0 11px 11px;}",
    ".pf-si .nm{font:800 14px 'Archivo',sans-serif;color:var(--ink);} .pf-si .ds{font-size:12.5px;color:var(--mut);line-height:1.45;}",
    /* staircase */
    ".pf-stair{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:26px 0;align-items:end;}",
    ".pf-stair-step{border:1px solid var(--line);border-radius:12px;background:#fff;padding:19px;border-top:3px solid var(--mag);}",
    ".pf-stair-step:nth-child(1){margin-top:40px;} .pf-stair-step:nth-child(2){margin-top:20px;}",
    ".pf-stair-h{font:800 15px 'Archivo',sans-serif;color:var(--ink);margin:0 0 9px;}",
    ".pf-stair-row{font-size:12px;line-height:1.5;color:var(--mut);margin-bottom:3px;}",
    ".pf-stair-row b{color:var(--mag);font-weight:700;}",
    /* debug routing */
    ".pf-flowv{display:flex;flex-direction:column;align-items:stretch;gap:7px;margin:16px 0;max-width:520px;}",
    ".pf-fl-node{border:1px solid var(--line);border-radius:10px;background:#fff;padding:12px 15px;}",
    ".pf-fl-node .l{font:800 11px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--mag);}",
    ".pf-fl-node .t{font-size:13px;color:#3f4751;margin-top:3px;line-height:1.4;}",
    ".pf-fl-ar{text-align:center;color:var(--mut);font-size:13px;}",
    ".pf-fl-end{display:flex;flex-wrap:wrap;gap:7px;}",
    ".pf-fl-end span{font:700 12px 'Archivo',sans-serif;color:var(--ink);border:1px solid var(--line);border-radius:999px;padding:5px 12px;background:var(--paper);}",
    /* alignment trail */
    ".pf-trail{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:16px 0;}",
    ".pf-trail span{font:700 12.5px 'Archivo',sans-serif;color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:9px 13px;background:#fff;}",
    ".pf-trail .ar{color:var(--mag);font-weight:800;}",
    /* artifacts */
    ".pf-arts{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:22px 0;}",
    ".pf-art{border:1px solid var(--line);border-radius:12px;background:#fff;padding:18px;cursor:pointer;transition:border-color .2s,box-shadow .2s,transform .2s;}",
    ".pf-art:hover,.pf-art.on{border-color:var(--mag);box-shadow:0 16px 34px -24px rgba(214,0,108,0.5);transform:translateY(-3px);}",
    ".pf-art-h{font:800 14px 'Archivo',sans-serif;color:var(--ink);margin:0 0 7px;letter-spacing:-0.01em;}",
    ".pf-art-b{font-size:12px;line-height:1.45;color:var(--mut);}",
    ".pf-art-detail{margin-top:14px;border:1px solid var(--line);border-radius:12px;background:#0f1318;padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:18px;}",
    ".pf-tree{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;line-height:1.7;color:#cfe3dc;white-space:pre;margin:0;}",
    ".pf-tree .d{color:#ff7ab8;} .pf-tree .f{color:#e7eef5;}",
    ".pf-art-purpose .k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#ff7ab8;margin-bottom:6px;}",
    ".pf-art-purpose .v{font-size:13px;line-height:1.55;color:#c9ccd2;}",
    /* interactive wrapper */
    ".pf-ix-h{font:700 12px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink);margin:24px 0 12px;display:flex;align-items:center;gap:9px;}",
    ".pf-ix-h .tag{font:800 10px 'Archivo',sans-serif;letter-spacing:0.1em;color:#fff;background:var(--mag);border-radius:999px;padding:3px 9px;}",
    /* animation pulse */
    "@keyframes pfPulse{0%,8%{border-color:var(--line);box-shadow:none;}2%{border-color:var(--mag);box-shadow:0 0 0 3px var(--soft);}100%{border-color:var(--line);box-shadow:none;}}",
    ".pf-anim .pf-step,.pf-anim .pf-bstep,.pf-anim .pf-gate{animation:pfPulse 13s linear infinite;}",
    /* reveal: visible by default (robust) */
    ".pf-reveal{opacity:1;}",
    /* responsive */
    "@media (max-width:860px){",
    ".pf-metrics{grid-template-columns:repeat(2,1fr);} .pf-cards.c3,.pf-cards.c5{grid-template-columns:repeat(2,1fr);}",
    ".pf-roles{grid-template-columns:1fr;} .pf-role{border-right:0;border-bottom:1px solid var(--line);}",
    ".pf-bridge{grid-template-columns:1fr 1fr;} .pf-bstep{border-right:1px solid var(--line);border-bottom:0;}",
    ".pf-gates{grid-template-columns:1fr 1fr;} .pf-stepdetail{grid-template-columns:1fr;} .pf-sim-grid{grid-template-columns:1fr;}",
    ".pf-stack .pf-si{grid-template-columns:1fr;gap:5px;} .pf-stair{grid-template-columns:1fr;} .pf-stair-step{margin-top:0!important;}",
    ".pf-arts{grid-template-columns:1fr 1fr;} .pf-art-detail{grid-template-columns:1fr;}",
    "}",
    "@media (max-width:520px){.pf-metrics,.pf-cards.c3,.pf-cards.c5,.pf-gates,.pf-arts{grid-template-columns:1fr;}}",
    "@media (prefers-reduced-motion:reduce){.pf-anim .pf-step,.pf-anim .pf-bstep,.pf-anim .pf-gate{animation:none;}}"
  ].join("") + "</style>";

  /* ---------- data ---------- */
  var STEPS = [
    { id: "0", stage: 0, name: "Reusable infrastructure", runner: "Claude Code", input: "field review, kill reflections, done-paper ledger", output: "loaded context for candidate generation", pro: "0", route: "Step 1" },
    { id: "1", stage: 0, name: "Brainstorm eight designs", runner: "ChatGPT 5.5 Pro", input: "field review, kill reflections, done-paper ledger, gate standards", output: "eight mature micro-designs", pro: "1", route: "Step 3" },
    { id: "3", stage: 0, name: "Batch gate review", runner: "ChatGPT 5.5 Pro", input: "eight designs", output: "combined gate verdict and survivor list", pro: "1", route: "Step 3.5" },
    { id: "3.5", stage: 0, name: "Survival shortlist", runner: "Claude Code", input: "surviving candidates", output: "ordered survival queue", pro: "0", route: "Step 3.6" },
    { id: "3.6", stage: 0, name: "Data Reality Probe", runner: "Claude Code", input: "surviving candidate and data source", output: "0.85_data_reality_probe.md and stage_00_reality_probe.py", pro: "0", route: "PASS to Phase 1 / FAIL to next survivor / BLOCKED to park", key: true },
    { id: "4", stage: 1, name: "Literature Map", runner: "ChatGPT 5.5 Pro", input: "selected candidate", output: "literature map and collision check", pro: "1", route: "Step 5" },
    { id: "5", stage: 1, name: "Theory and Estimand Bridge", runner: "ChatGPT 5.5 Pro", input: "literature map", output: "theory layer and hypothesis-to-estimand map", pro: "1", route: "Step 6" },
    { id: "6", stage: 1, name: "Research Manual", runner: "Claude Code + Pro", input: "design and theory layer", output: "executable instructions and completeness atlas", pro: "1", route: "Step 7" },
    { id: "7", stage: 1, name: "PAP + PSCR", runner: "ChatGPT 5.5 Pro", input: "literature map, theory bridge, research manual", output: "pre-analysis plan and output acceptance criteria", pro: "1", route: "MIST", key: true },
    { id: "8", stage: 1, name: "MIST", runner: "Claude Code", input: "minimal real data path", output: "implementation signal", pro: "0", route: "Step 9" },
    { id: "9", stage: 1, name: "Pilot run", runner: "Claude Code", input: "small sample", output: "pilot tables and logs", pro: "0", route: "Step 10" },
    { id: "10", stage: 1, name: "Full pipeline", runner: "Claude Code", input: "full dataset", output: "tables, figures, diagnostics, records", pro: "0", route: "Step 10.5" },
    { id: "10.5", stage: 1, name: "Layer 1-4 Debugging", runner: "Claude Code + optional Pro mulligan", input: "unexpected empirical output", output: "failure diagnostic card and route decision", pro: "0 or 1 mulligan", route: "continue / park / kill / stop", key: true },
    { id: "11", stage: 2, name: "Theory verification", runner: "ChatGPT 5.5 Pro", input: "empirical outputs and theory layer", output: "verified theory-output relationship", pro: "1", route: "Step 12" },
    { id: "12", stage: 2, name: "Journal positioning", runner: "ChatGPT 5.5 Pro", input: "manuscript candidate", output: "target-journal positioning", pro: "1", route: "Step 13" },
    { id: "13", stage: 2, name: "Spec sheet and section plan", runner: "Claude Code + Pro", input: "journal positioning", output: "manuscript spec sheet and section plan", pro: "1", route: "Step 14" },
    { id: "14", stage: 2, name: "Alternative specs and mechanisms", runner: "Claude Code", input: "empirical outputs", output: "robustness and mechanism specifications", pro: "0", route: "Step 15" },
    { id: "15", stage: 2, name: "Section writing and alignment audit", runner: "Claude Code + Pro audit", input: "spec sheet, section plan, outputs, figures, tables", output: "manuscript sections and alignment audit at 98%", pro: "audit rounds", route: "Step 16", key: true },
    { id: "16", stage: 2, name: "Artifact delivery", runner: "Claude Code", input: "final manuscript, code, outputs, audit records", output: "replication package, paper materials, GPT audit, production ledger update", pro: "0", route: "complete", key: true }
  ];
  var LANES = [
    { k: "Pre-Start Gates", ids: ["0", "1", "3", "3.5", "3.6"] },
    { k: "Design and Run", ids: ["4", "5", "6", "7", "8", "9", "10", "10.5"] },
    { k: "Validate and Write", ids: ["11", "12", "13", "14", "15", "16"] }
  ];
  var GATES = [
    { id: "0.5", name: "Novelty Gate", purpose: "nearest-neighbor papers and delta", dims: "mechanism, identification, empirical fact, theoretical perspective, cross-validation gap", file: "0.5_novelty_gate.md", scored: true },
    { id: "0.6", name: "Contribution Survival Gate", purpose: "State A/B/C survival", dims: "target-tier upside, reviewer robustness, fallback distance, null-state value, tier-floor consistency", file: "0.6_contribution_gate.md", scored: true, redesign: true },
    { id: "0.7", name: "Identification Rigor Gate", purpose: "method fit, diagnostics, MDE", dims: "method fit, diagnostics, validity threats, inference, external-validity conditions", file: "0.7_identification_gate.md", scored: true },
    { id: "0.8", name: "Implementability Gate", purpose: "data, cost, compute, portability", dims: "data endpoint availability, data cost, compute feasibility, time to first result, reproducibility portability", file: "0.8_implementability_gate.md", scored: true },
    { id: "0.85", name: "Data Reality Probe", purpose: "treated cell, pre/post, clusters, MDE", dims: "treated count, pre/post cells, cluster count, MDE at 80% power, method-specific minimum N", file: "0.85_data_reality_probe.md", scored: false }
  ];
  var ARTIFACTS = [
    { h: "Replication Package", b: "Code, data instructions, pipeline outputs, figures, tables, logs, and reproducibility materials.", tree: [["d", "code/"], ["d", "data_instructions/"], ["d", "tables/"], ["d", "figures/"], ["d", "logs/"]], purpose: "Reproduce the empirical pipeline and regenerate outputs." },
    { h: "Paper Materials", b: "Manuscript, appendix, spec sheet, journal-facing files, figures, tables, and supporting materials.", tree: [["d", "manuscript/"], ["d", "appendix/"], ["f", "spec_sheet.md"], ["d", "journal_files/"], ["d", "figures/"], ["d", "tables/"]], purpose: "Assemble submission-facing materials." },
    { h: "GPT Audit", b: "Pro review logs, mulligan log, decision records, alignment audit, and workflow review materials.", tree: [["d", "pro_reviews/"], ["f", "mulligan_log.md"], ["d", "alignment_audit/"], ["d", "decision_records/"]], purpose: "Store model review rounds, decisions, and audit trail." },
    { h: "Production Ledger", b: "Done, kill, and park records with tier, topic, mechanism, identification, data, sample window, mulligan count, and lessons.", tree: [["f", "done_papers.md"], ["f", "kill_reflections.md"], ["f", "park_records.md"], ["f", "survival_shortlist.md"]], purpose: "Track shipped, killed, parked, and queued projects." }
  ];

  /* ---------- builders ---------- */
  function metricPanel() {
    var M = [["16", "Workflow steps"], ["5", "Pre-start gates"], ["34", "Operating rules"], ["0.85", "Data reality probe"],
      ["98%", "Alignment audit threshold"], ["6", "Mulligans per paper"], ["3", "Final artifact groups"], ["1M", "Local context window"]];
    return '<div class="pf-metrics pf-reveal">' + M.map(function (x) {
      return '<div class="pf-mc"><div class="pf-mv">' + x[0] + '</div><div class="pf-ml">' + x[1] + "</div></div>";
    }).join("") + "</div>";
  }
  function roleCards() {
    var R = [
      ["User", "Arbiter", "Final control over hard stops, project direction, and acceptance.", ""],
      ["ChatGPT 5.5 Pro", "Decision Layer", "Long-context design reviews, gate decisions, theory development, journal positioning, and audit rounds.", ""],
      ["Claude Code", "Execution Layer", "Local files, code, shell commands, pipeline runs, probes, figures, tables, logs, and artifact assembly.", "exec"]
    ];
    return '<div class="pf-roles pf-reveal">' + R.map(function (r) {
      return '<div class="pf-role ' + r[3] + '"><div class="pf-role-k">' + esc(r[1]) + '</div><div class="pf-role-h">' + esc(r[0]) + '</div><div class="pf-role-b">' + esc(r[2]) + "</div></div>";
    }).join("") + "</div>" +
    '<div class="pf-edges pf-reveal">' +
      edge("Claude Code to Pro", "packaged question via skill + Playwright") +
      edge("Pro to Claude Code", "decision, review, next step") +
      edge("Claude Code to User", "progress report, hard stop, final artifacts") +
      edge("User to System", "final arbitration") + "</div>";
    function edge(f, t) { return '<div class="pf-edge"><span class="f">' + esc(f) + '</span><span class="ar">&#8594;</span><span>' + esc(t) + "</span></div>"; }
  }
  function componentGrid() {
    var C = [
      ["Files", "Read · Write · Edit · Glob · Grep"],
      ["Shell", "PowerShell · Bash · Python · pipeline scripts"],
      ["Agents", "Explore · Plan · general-purpose · workflow orchestration"],
      ["Skills", "Reusable prompt protocols and production routines"],
      ["Browser", "Playwright MCP for ChatGPT Pro sessions"],
      ["State", "Memory files · paper folders · logs · artifacts"]
    ];
    return '<div class="pf-cards c3 pf-reveal">' + C.map(function (c) {
      return '<div class="pf-card"><div class="pf-card-h">' + esc(c[0]) + '</div><div class="pf-card-b">' + esc(c[1]) + "</div></div>";
    }).join("") + "</div>";
  }
  function plate(src, cap) {
    return '<div class="pf-plate pf-reveal"><img src="' + IMG + src + '" alt="' + esc(cap) + '"><div class="pf-plate-cap">' + esc(cap) + "</div></div>";
  }
  function bridgeSteps() {
    var B = [
      ["Prepare", "Claude builds a self-contained prompt package and selects approved attachments."],
      ["Deliver", "Skill and Playwright drive the browser, submit the prompt, and record the session URL."],
      ["Think", "ChatGPT 5.5 Pro runs extended-thinking and produces the decision or review."],
      ["Retrieve", "Playwright returns to the session and captures the completed answer."],
      ["Store", "Claude writes the answer to the project folder and resumes the workflow."]
    ];
    return '<div class="pf-bridge pf-reveal pf-anim-bridge">' + B.map(function (b, i) {
      return '<div class="pf-bstep"><div class="n">' + (i + 1) + '</div><h4>' + esc(b[0]) + '</h4><p>' + esc(b[1]) + "</p></div>";
    }).join("") + "</div>";
  }
  function pipelineLanes() {
    return '<div class="pf-lanes pf-reveal pf-anim-flow">' + LANES.map(function (lane) {
      var chips = lane.ids.map(function (id, i) {
        var st = STEPS.filter(function (s) { return s.id === id; })[0];
        return (i ? '<span class="pf-arrow" aria-hidden="true">&#8594;</span>' : "") +
          '<button type="button" class="pf-step' + (st && st.key ? " key" : "") + '" data-step="' + id + '">Step ' + id + "</button>";
      }).join("");
      return '<div class="pf-lane"><div class="pf-lane-k">' + esc(lane.k) + '</div><div class="pf-chips">' + chips + "</div></div>";
    }).join("") + "</div>";
  }
  function stepExplorer() {
    return '<div class="pf-ix-h pf-reveal"><span class="tag">Interactive</span>Workflow step explorer</div>' +
      pipelineLanes() +
      '<div class="pf-stepdetail pf-reveal" data-pf-stepdetail="1"></div>';
  }
  function processCards() {
    var P = [
      ["Step 0", "Load field review, kill reflections, and done-paper ledger."],
      ["Step 1", "Generate eight mature micro-designs."],
      ["Step 3", "Batch-review the eight candidates through four gates."],
      ["Step 3.5", "Create an ordered survival shortlist."],
      ["Step 3.6", "Run the live data reality probe before Phase 1."]
    ];
    return '<div class="pf-cards c5 pf-reveal">' + P.map(function (c) {
      return '<div class="pf-card"><div class="pf-card-k">' + esc(c[0]) + '</div><div class="pf-card-b">' + esc(c[1]) + "</div></div>";
    }).join("") + "</div>";
  }
  function gateCards() {
    return '<div class="pf-gates pf-reveal pf-anim-gate">' + GATES.map(function (g) {
      return '<div class="pf-gate' + (g.id === "0.85" ? " probe" : "") + '"><div class="pf-gate-id">' + g.id + '</div><div class="pf-gate-h">' + esc(g.name) + '</div><div class="pf-gate-b">' + esc(g.purpose) + "</div></div>";
    }).join("") + "</div>" +
    '<div class="pf-routes pf-reveal">' +
      '<div class="pf-route pass"><div class="r">Pass</div><p>Continue to the next gate or Phase 1.</p></div>' +
      '<div class="pf-route fail"><div class="r">Fail</div><p>Route to kill log and advance to the next survivor.</p></div>' +
      '<div class="pf-route block"><div class="r">Blocked</div><p>Park the candidate until the data dependency clears.</p></div>' +
    "</div>";
  }
  function gateDetailCards() {
    var G = [
      ["0.5 Novelty Gate", "The novelty gate compares the candidate against nearby papers. It checks mechanism, identification, empirical fact, theoretical perspective, and cross-validation gap. Each nearby paper is mapped with its claim, identification, data, result, and the candidate delta."],
      ["0.6 Contribution Survival Gate", "The contribution gate evaluates how the candidate survives under strong results, partial results, and clean null results. It checks target-tier upside, reviewer robustness, fallback distance, null-state publication value, and tier-floor consistency."],
      ["0.7 Identification Rigor Gate", "The identification gate checks method fit, diagnostics, validity threats, inference, and external-validity conditions. It includes method-specific diagnostic batteries and MDE power analysis."],
      ["0.8 Implementability Gate", "The implementability gate checks data endpoint availability, data cost, compute feasibility, time to first result, and reproducibility portability. Data endpoints require live URL verification."],
      ["0.85 Data Reality Probe", "The data reality probe checks empirical mass. Claude runs a live count for treated observations, pre/post cells, cluster count, MDE at 80% power, and method-specific minimum sample requirements."]
    ];
    return '<div class="pf-cards c2 pf-reveal">' + G.map(function (c) {
      return '<div class="pf-card"><div class="pf-card-h">' + esc(c[0]) + '</div><div class="pf-card-b">' + esc(c[1]) + "</div></div>";
    }).join("") + "</div>";
  }
  function gateSim() {
    return '<div class="pf-ix-h pf-reveal"><span class="tag">Interactive</span>Gate cascade simulator</div>' +
      '<div class="pf-sim pf-reveal" data-pf-sim="1">' +
        '<div class="pf-sim-tabs" data-role="tabs"></div>' +
        '<div class="pf-sim-grid"><div class="pf-sim-ctl" data-role="ctl"></div><div class="pf-sim-out" data-role="out"></div></div>' +
        '<div class="pf-sim-meta" data-role="meta"></div>' +
      "</div>";
  }
  function probeChecklist() {
    var C = [
      ["P1", "Treated count", "A live count of treated events or observations required by the design."],
      ["P2", "Pre / post cell count", "Separate pre-period and post-period counts for designs that require time variation."],
      ["P3", "Cluster count", "The number of inference clusters at the relevant treatment-assignment level."],
      ["P4", "MDE at 80% power", "A minimum-detectable-effect calculation using verified sample size and variance assumptions."],
      ["P5", "Method-specific minimum N", "Requirements for RDD bandwidths, IV first-stage variation, structural moments, or panel treated by period cells."]
    ];
    return '<div class="pf-check pf-reveal">' + C.map(function (c) {
      return '<div class="pf-ci"><div class="id">' + c[0] + '</div><div><h4>' + esc(c[1]) + '</h4><p>' + esc(c[2]) + "</p></div></div>";
    }).join("") + "</div>" +
    '<div class="pf-routes pf-reveal">' +
      '<div class="pf-route pass"><div class="r">Pass</div><p>Send the project to Phase 1.</p></div>' +
      '<div class="pf-route fail"><div class="r">Fail</div><p>Advance to the next survivor.</p></div>' +
      '<div class="pf-route block"><div class="r">Blocked</div><p>Park the project until data access becomes available.</p></div></div>' +
    '<div class="pf-techline pf-reveal">0.8 checks data access. 0.85 checks empirical mass.</div>';
  }
  function specStack() {
    var S = [
      ["Literature Map", "Maps the candidate against the surrounding field and checks collisions."],
      ["Theory-Estimand Bridge", "Connects mechanisms to measurable estimands, signs, magnitude bands, and failure signatures."],
      ["Research Manual", "Converts the design into executable instructions: file paths, function signatures, variables, edge cases, stage files, and a completeness atlas."],
      ["PAP", "Defines the analysis plan as the analysis specification."],
      ["PSCR", "Defines output acceptance criteria: thresholds, signs, magnitude bands, robustness coverage, and subsample stability rules."]
    ];
    return '<div class="pf-stack pf-reveal">' + S.map(function (s) {
      return '<div class="pf-si"><div class="nm">' + esc(s[0]) + '</div><div class="ds">' + esc(s[1]) + "</div></div>";
    }).join("") + "</div>";
  }
  function staircase() {
    var S = [
      ["MIST", "minimal real data path", "confirm executable logic", "implementation signal"],
      ["Pilot", "small sample", "test pipeline stability", "pilot tables and logs"],
      ["Full Pipeline", "full dataset", "produce empirical outputs", "tables, figures, diagnostics, records"]
    ];
    return '<div class="pf-stair pf-reveal">' + S.map(function (s) {
      return '<div class="pf-stair-step"><div class="pf-stair-h">' + esc(s[0]) + '</div>' +
        '<div class="pf-stair-row"><b>Input</b> &middot; ' + esc(s[1]) + '</div>' +
        '<div class="pf-stair-row"><b>Goal</b> &middot; ' + esc(s[2]) + '</div>' +
        '<div class="pf-stair-row"><b>Output</b> &middot; ' + esc(s[3]) + "</div></div>";
    }).join("") + "</div>";
  }
  function debugFlow() {
    function node(l, t) { return '<div class="pf-fl-node"><div class="l">' + esc(l) + '</div><div class="t">' + esc(t) + "</div></div>"; }
    function ar() { return '<div class="pf-fl-ar" aria-hidden="true">&#8595;</div>'; }
    return '<div class="pf-flowv pf-reveal">' +
      node("Input", "Unexpected empirical output") + ar() +
      node("Layer 1", "Code and data sanity: variables, filters, merges, signs, timestamps, output paths, source alignment.") + ar() +
      node("Layer 2", "Design completeness: method-specific controls, fixed effects, clustering, diagnostics, standardization, robustness blocks.") + ar() +
      node("Layer 3", "Pro red-team mulligan: gate files, tier target, and survival-queue state classify the issue and recommend a route.") + ar() +
      node("Layer 4", "Route decision") +
      '<div class="pf-fl-end" style="margin-top:7px"><span>Continue</span><span>Park</span><span>Kill</span><span>Stop for arbitration</span></div>' +
    "</div>";
  }
  function alignTrail() {
    return '<div class="pf-trail pf-reveal"><span>Manuscript claim</span><span class="ar">&#8594;</span><span>pipeline output</span><span class="ar">&#8594;</span><span>source file</span><span class="ar">&#8594;</span><span>authoritative URL / timestamp / snippet</span></div>';
  }
  function artifactExplorer() {
    return '<div class="pf-arts pf-reveal" data-pf-arts="1">' + ARTIFACTS.map(function (a, i) {
      return '<div class="pf-art' + (i === 0 ? " on" : "") + '" tabindex="0" role="button" data-art="' + i + '"><div class="pf-art-h">' + esc(a.h) + '</div><div class="pf-art-b">' + esc(a.b) + "</div></div>";
    }).join("") + "</div>" +
    '<div class="pf-art-detail pf-reveal" data-pf-artdetail="1"></div>';
  }

  /* ---------- article ---------- */
  window.__paperFactoryArticle = function (data) {
    var H = STYLE;

    H += '<div class="ai-controls pf-controls">' +
      '<span class="pf-brand" style="display:inline-flex;align-items:center;gap:8px;flex:none;font:800 11px \'Archivo\',sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:#d6006c;"><i style="width:9px;height:9px;border-radius:2px;background:#d6006c;display:inline-block;"></i>AI Harness 01</span>' +
      '<nav class="ai-index" aria-label="Section index"></nav></div>';
    H += '<div class="ai-progress" data-pf-progress="1"><i></i></div>';

    /* HERO */
    H += '<section class="ca-section ai-sec pf-sec" id="pf-sec-hero" data-pf-label="Overview">' +
      '<div class="ca-kicker">AI Systems &middot; Harness 01</div>' +
      '<h1 class="ca-title">The Research Paper Factory: A Harness-Driven Workflow</h1>' +
      '<div class="ai-role">A local-to-cloud AI production line for empirical research papers</div>' +
      '<p class="pf-lede">A local-to-cloud AI workflow that routes research ideas through screening gates, design specifications, executable code, empirical runs, and manuscript assembly.</p>' +
      p("The harness treats research production as a stateful pipeline. Research ideas enter through screening gates. Surviving candidates become design specifications. Specifications become executable code. Code produces empirical artifacts. Empirical artifacts are assembled into manuscript sections and final delivery packages.") +
      p("The system has three operating roles. Claude Code runs locally as the execution layer, handling files, code, data pipelines, logs, and state. ChatGPT 5.5 Pro acts as the decision layer for long-form design reviews, methodological choices, and routing decisions. The user remains the final arbiter. A skill and Playwright bridge connects the local executor to the Pro session, while the local filesystem stores every intermediate artifact.") +
      metricPanel() +
      '<div class="pf-cap pf-reveal">Research production is organized as a long-running local-to-cloud workflow, with decisions, execution, state, and artifacts assigned to separate layers.</div>' +
      "</section>";

    /* 1 roles */
    H += sec("roles", "Three Operating Roles", "Execution, Decision, and Arbitration",
      p("The harness begins with role separation. Claude Code runs on the local machine and handles execution. It reads and writes files, runs shell commands, builds code, launches probes, checks outputs, and stores intermediate state. It is closest to the codebase, folders, data artifacts, and logs.") +
      p("ChatGPT 5.5 Pro handles decision nodes. It receives self-contained prompt packages through the browser bridge, reviews candidate designs, evaluates gates, develops literature maps, builds theory sections, reviews specifications, and returns routing decisions. The user remains the arbiter. Routine decisions can be delegated to the Pro layer during autonomous runs, while hard-stop conditions return control to the user.") +
      roleCards());

    /* 2 local harness */
    H += sec("local", "Local Execution Harness", "The Filesystem Is the State Layer",
      p("The local harness runs through Claude Code on a Windows machine. It has a large context window, persistent memory files, project-level instructions, and tool access for file operations, search, shell execution, subagents, workflow orchestration, skills, browser automation, and scheduled wakeups.") +
      p("The filesystem is the state layer. Long-running research work uses project folders as durable memory. Gate outputs, probes, PAP files, logs, pipeline results, audit records, and final manuscript materials all land in project folders, and each phase reads what earlier phases produced. The project-level rule files and memory files give the local executor durable operating context across sessions, and the handoff file is reread at decision points to keep the run aligned with the current workflow version.") +
      componentGrid() +
      plate("claude-code.png", "Claude Code: an agent that reads the codebase, edits files, and runs commands across terminal, IDE, and browser. Source: claude.com."));

    /* 3 bridge */
    H += sec("bridge", "Local-to-Cloud Bridge", "Connecting Local Execution to Cloud Reasoning",
      p("The bridge connects local execution to cloud reasoning. Claude prepares a self-contained prompt package that includes the question, background, decision requirements, and approved attachments. A skill provides the protocol for the handoff. Playwright operates a real browser session, opens ChatGPT 5.5 Pro, selects the target conversation, submits the prompt, uploads attachments when needed, and stores the session URL.") +
      p("The Pro model performs extended-thinking and returns the decision or review. The local side waits asynchronously through scheduled wakeups. Once the response is complete, Playwright captures the answer, Claude saves it to the expected project path, and the workflow continues from the local state file. The bridge is used at standard workflow touchpoints, including brainstorming, gate review, literature mapping, theory development, research manual generation, PAP drafting, theory verification, journal positioning, spec-sheet planning, and writing audits. Additional mulligan calls are tracked per paper.") +
      bridgeSteps() +
      plate("playwright.png", "Playwright: reliable browser automation for testing, scripting, and AI agents. Source: playwright.dev.") +
      p("Every Pro call follows the same bridge loop: prepare package, send through skill and Playwright, wait through scheduled wakeup, capture answer, save to local disk, and continue execution."));

    /* 4 pipeline + step explorer */
    H += sec("pipeline", "The 16-Step Production Line", "Three Stages, One State Machine",
      p("The workflow advances through three production stages. The first stage is Pre-Start Gates: it loads reusable research infrastructure, generates candidate designs, evaluates candidates in batch, orders survivors, and runs a live data reality probe before deeper design work begins. The second stage is Design and Run: it develops the literature map, theory, research manual, PAP, PSCR, MIST, pilot run, full pipeline, and debugging protocol. The third stage is Validate and Write: it verifies theory, positions the manuscript for target journals, builds the spec sheet, writes sections, audits alignment, and ships final artifacts.") +
      stepExplorer());

    /* 5 eight designs */
    H += sec("designs", "From Eight Designs to One Candidate", "Reusable Infrastructure to a Selected Project",
      p("The factory begins with reusable research infrastructure. Step 0 loads three long-lived assets: a field review, a kill-reflection log, and a completed-paper ledger. These files carry prior research coverage, failed paths, and already-used topics into every new run.") +
      p("Step 1 asks the Pro layer to generate eight mature micro-designs. Each design includes a research question, thesis, mechanism, identification handle, data source, method outline, sample window, target tier, gate self-check, and hostile-reviewer statement. Step 3 evaluates all eight designs in one batch and returns a surviving subset. Step 3.5 orders the survivors and stores them as a queue, so a failed project can route to the next surviving candidate without restarting ideation. Step 3.6 runs the data reality probe on the selected candidate.") +
      processCards());

    /* 6 five gates + sim */
    H += sec("gates", "Five Gates Before the Design Phase", "Four Scored Gates and One Live Probe",
      p("Each candidate passes through five gates before entering the design phase. The first four gates use a 0-15 scoring system. Each gate has five dimensions scored from 0 to 3. A candidate passes when the score is at least 11 and at least one dimension reaches 3. The fifth gate runs as a live empirical probe that checks the actual data mass required by the design.") +
      gateCards() +
      gateDetailCards() +
      gateSim());

    /* 7 data reality probe */
    H += sec("probe", "Data Reality Probe", "The 0.85 Execution Step",
      p("The 0.85 probe is an execution step. It produces " + '<span class="pf-mono">paperN/0.85_data_reality_probe.md</span>' + " and " + '<span class="pf-mono">paperN/code/stage_00_reality_probe.py</span>' + ". It checks five items, then routes the project.") +
      probeChecklist());

    /* 8 spec layer */
    H += sec("spec", "Specification Layer", "Turning an Idea Into Executable Specification",
      p("After the pre-start gates, the workflow builds the specification stack. Phase 1 creates the literature map and checks collisions. Phase 2 builds the theory layer and the Theory-Estimand Bridge, mapping each hypothesis to estimands, construct validity, identification needs, expected signs, magnitude bands, failure signatures, and boundary conditions.") +
      p("Phase 3 creates the research manual, expanding the design into executable instructions: file paths, function signatures, variables, missing-value rules, edge cases, stage files, figure specifications, and a completeness atlas. Phase 4 creates the PAP and PSCR. The PAP works as the analysis specification. PSCR works as the acceptance-test layer for interpreting outputs, locking criteria, thresholds, signs, magnitude bands, robustness coverage, confidence-interval rules, and subsample stability rules before empirical outputs are evaluated.") +
      specStack());

    /* 9 MIST pilot full */
    H += sec("runs", "MIST, Pilot, Full Run", "Three Staged Executions",
      p("Execution proceeds through three runs. MIST is the minimal implementable spec test: it uses a small true-data path to confirm that the core logic can execute. The pilot run tests the pipeline on a small sample and checks stability, file paths, outputs, and basic diagnostics. The full pipeline runs the complete design and produces tables, figures, logs, diagnostics, and downstream artifacts, with runtime warnings inspected during the same execution round.") +
      staircase());

    /* 10 debugging */
    H += sec("debug", "Layer 1-4 Debugging Protocol", "Staged Routing for Unexpected Output",
      p("Unexpected empirical output enters a staged debugging protocol. Layer 1 checks code and data sanity: variable construction, sample filters, merges, signs, timestamps, event dates, output paths, and source alignment. Layer 2 checks design completeness: method-specific controls, fixed effects, clustering, diagnostic coverage, standardization, and required robustness blocks. Layer 3 sends a red-team review to ChatGPT 5.5 Pro through the bridge, with the project gate files, tier target, and survival-queue state, and the Pro response classifies issues and recommends the route. Layer 4 routes the project to continue, revise within the locked design, park, kill, or stop for user arbitration. Every run writes a failure diagnostic card with the path taken and the decision record.") +
      debugFlow());

    /* 11 manuscript */
    H += sec("manuscript", "Manuscript Assembly", "From Empirical Artifacts to Sections",
      p("The final stage converts empirical artifacts into manuscript materials. Phase 7 verifies the theory-output relationship. Phase 7.5 positions the paper against target journals. Phase 8 adds alternative specifications and mechanisms. Phase 9.0 builds the manuscript spec sheet and section plan, defining target journal conventions, word budget, section structure, required elements, reference style, table and figure expectations, data-code availability language, and appendix structure.") +
      p("Writing proceeds section by section. Each section is assembled from the PAP-locked design, empirical outputs, figure and table artifacts, and section-level budget, with Pro audit rounds reviewing structure and alignment. The alignment audit connects manuscript claims to pipeline outputs and connects critical pipeline inputs to authoritative source records. The threshold is 98% in both directions.") +
      alignTrail());

    /* 12 final artifacts */
    H += sec("artifacts", "Final Artifacts", "A Three-Artifact Package and a Ledger Update",
      p("The workflow ships a three-artifact package and updates the production ledger. Select an artifact group to view its file tree and purpose.") +
      '<div class="pf-ix-h pf-reveal"><span class="tag">Interactive</span>Artifact explorer</div>' +
      artifactExplorer());

    /* 13 what it shows */
    H += sec("shows", "What This System Shows", "Research Production as a Stateful Pipeline",
      p("The harness turns research production into a stateful pipeline: candidates enter, gates filter, specifications lock, code runs, outputs route, sections assemble, and artifacts ship. It demonstrates local-to-cloud orchestration, multi-model role design, browser automation, long-running workflow control, prompt protocol packaging, staged quality gates, empirical pipeline execution, and manuscript artifact assembly.") +
      p("The system value comes from making research work executable. A research idea becomes a candidate. A candidate becomes a specification. A specification becomes code. Code produces artifacts. Artifacts become manuscript sections. Sections become a reproducible paper package.") +
      '<div class="ca-foot"><span>AI Harness 01 &middot; The Research Paper Factory Harness</span><span>Zhenyuan Pan &middot; 2026</span></div>');

    return (
      '<button class="case-close" type="button" aria-label="Close article"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll pf-scroll"><article class="case-article ai-article pf-article">' + H + "</article></div>"
    );
  };

  /* ================= viz ================= */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wireIndexAndProgress(scroller) {
    var nav = scroller.querySelector(".pf-controls .ai-index");
    var secs = [].slice.call(scroller.querySelectorAll(".pf-sec[data-pf-label]"));
    if (!nav) return;
    var links = [];
    secs.forEach(function (s) {
      var a = document.createElement("button");
      a.type = "button"; a.className = "ai-ix"; a.textContent = s.getAttribute("data-pf-label"); a.setAttribute("data-target", s.id);
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
    /* stagger the looping pulse across each animated group */
    [".pf-anim-flow .pf-step", ".pf-anim-bridge .pf-bstep", ".pf-anim-gate .pf-gate"].forEach(function (sel) {
      var els = [].slice.call(scroller.querySelectorAll(sel));
      var n = els.length; if (!n) return;
      var parent = els[0].closest(".pf-anim-flow,.pf-anim-bridge,.pf-anim-gate");
      if (parent) parent.classList.add("pf-anim");
      els.forEach(function (e, i) {
        e.style.animationDelay = (i * (13 / Math.max(n, 1))).toFixed(2) + "s";
      });
    });
  }

  function wireStepExplorer(scroller) {
    var detail = scroller.querySelector("[data-pf-stepdetail]");
    if (!detail) return;
    var btns = [].slice.call(scroller.querySelectorAll(".pf-step[data-step]"));
    function render(id) {
      var s = STEPS.filter(function (x) { return x.id === id; })[0];
      if (!s) return;
      btns.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-step") === id); });
      var isPro = /Pro/.test(s.runner) && !/Claude/.test(s.runner);
      detail.innerHTML =
        '<div class="pf-sd-full"><div class="pf-sd-k">Step ' + s.id + '</div><h4 class="pf-sd-name">' + esc(s.name) + "</h4></div>" +
        '<div><div class="pf-sd-k">Runner</div><div class="pf-sd-v"><span class="pf-sd-runner' + (isPro ? " pro" : "") + '">' + esc(s.runner) + "</span></div></div>" +
        '<div><div class="pf-sd-k">Pro calls</div><div class="pf-sd-v">' + esc(s.pro) + "</div></div>" +
        '<div><div class="pf-sd-k">Input</div><div class="pf-sd-v">' + esc(s.input) + "</div></div>" +
        '<div><div class="pf-sd-k">Output</div><div class="pf-sd-v">' + esc(s.output) + "</div></div>" +
        '<div class="pf-sd-full"><div class="pf-sd-k">Next route</div><div class="pf-sd-v">' + esc(s.route) + "</div></div>";
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () { render(b.getAttribute("data-step")); });
    });
    render("3.6");
  }

  function wireGateSim(scroller) {
    var box = scroller.querySelector("[data-pf-sim]");
    if (!box) return;
    var tabs = box.querySelector('[data-role="tabs"]');
    var ctl = box.querySelector('[data-role="ctl"]');
    var out = box.querySelector('[data-role="out"]');
    var meta = box.querySelector('[data-role="meta"]');
    var current = "0.5";
    var score = 12, hasThree = true, probeState = "PASS";
    GATES.forEach(function (g) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "pf-sim-tab" + (g.id === "0.5" ? " on" : ""); b.textContent = g.id;
      b.addEventListener("click", function () {
        current = g.id;
        tabs.querySelectorAll(".pf-sim-tab").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); render();
      });
      tabs.appendChild(b);
    });
    function gate() { return GATES.filter(function (x) { return x.id === current; })[0]; }
    function render() {
      var g = gate();
      if (g.scored) {
        ctl.innerHTML =
          '<div class="pf-sim-ctl"><div class="rowv"><label style="margin:0">Total score (0-15)</label><b data-out="score">' + score + '</b></div>' +
          '<input type="range" min="0" max="15" step="1" value="' + score + '" data-in="score" aria-label="Gate score">' +
          '<div class="pf-toggle" role="group" aria-label="At least one dimension scored 3"><span style="font-size:12.5px;color:#6b7480;align-self:center;margin-right:4px">A dimension at 3?</span>' +
          '<button type="button" data-three="yes" class="' + (hasThree ? "on" : "") + '">Yes</button>' +
          '<button type="button" data-three="no" class="' + (!hasThree ? "on" : "") + '">No</button></div></div>';
        ctl.querySelector('[data-in="score"]').addEventListener("input", function () { score = +this.value; ctl.querySelector('[data-out="score"]').textContent = score; verdict(); });
        ctl.querySelectorAll("[data-three]").forEach(function (t) {
          t.addEventListener("click", function () { hasThree = t.getAttribute("data-three") === "yes"; ctl.querySelectorAll("[data-three]").forEach(function (x) { x.classList.remove("on"); }); t.classList.add("on"); verdict(); });
        });
      } else {
        ctl.innerHTML = '<div class="pf-sim-ctl"><label>Live probe state</label><div class="pf-state-btns">' +
          ["PASS", "FAIL", "BLOCKED"].map(function (s) { return '<button type="button" data-state="' + s + '" class="' + (probeState === s ? "on" : "") + '">' + s + "</button>"; }).join("") + "</div></div>";
        ctl.querySelectorAll("[data-state]").forEach(function (sbtn) {
          sbtn.addEventListener("click", function () { probeState = sbtn.getAttribute("data-state"); ctl.querySelectorAll("[data-state]").forEach(function (x) { x.classList.remove("on"); }); sbtn.classList.add("on"); verdict(); });
        });
      }
      verdict();
    }
    function verdict() {
      var g = gate();
      var cls, big, note;
      if (g.scored) {
        var pass = score >= 11 && hasThree;
        if (pass) { cls = "pass"; big = "PASS"; note = "Score is at least 11 with at least one dimension at 3. Continue to the next gate."; }
        else if (g.redesign && score >= 8 && score <= 10) { cls = "redesign"; big = "REDESIGN"; note = "Contribution score is 8 to 10. Revise the contribution framing and re-run the gate."; }
        else { cls = "fail"; big = "KILL"; note = "Score is 7 or below, or no dimension reached 3. Route to the kill log and advance to the next survivor."; }
      } else {
        if (probeState === "PASS") { cls = "pass"; big = "PASS"; note = "Empirical mass is sufficient. Send the project to Phase 1."; }
        else if (probeState === "BLOCKED") { cls = "block"; big = "BLOCKED"; note = "Data dependency is not yet available. Park the project until access clears."; }
        else { cls = "fail"; big = "FAIL"; note = "Empirical mass is insufficient. Advance to the next survivor."; }
      }
      out.innerHTML = '<div class="pf-verdict ' + cls + '"><div class="vbig">' + big + "</div><p>" + esc(note) + "</p></div>";
      meta.innerHTML = '<b>' + esc(g.id + " " + g.name) + '</b><br>Purpose: ' + esc(g.purpose) + '.<br>Dimensions: ' + esc(g.dims) + '.<br>Output file: <span class="pf-mono">' + esc(g.file) + "</span>";
    }
    render();
  }

  function wireArtifacts(scroller) {
    var detail = scroller.querySelector("[data-pf-artdetail]");
    if (!detail) return;
    var arts = [].slice.call(scroller.querySelectorAll(".pf-art[data-art]"));
    function tree(t) {
      return t.map(function (row) { return '  <span class="' + row[0] + '">' + (row[0] === "d" ? "\u25B8 " : "  ") + esc(row[1]) + "</span>"; }).join("\n");
    }
    function render(i) {
      var a = ARTIFACTS[i];
      arts.forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-art") === i); });
      detail.innerHTML = '<pre class="pf-tree">' + tree(a.tree) + "</pre>" +
        '<div class="pf-art-purpose"><div class="k">Purpose</div><div class="v">' + esc(a.purpose) + "</div></div>";
    }
    arts.forEach(function (b) {
      b.addEventListener("click", function () { render(+b.getAttribute("data-art")); });
      b.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); render(+b.getAttribute("data-art")); } });
    });
    render(0);
  }

  window.__paperFactoryViz = {
    init: function (scroller) {
      if (!scroller || scroller.__pfDone) return;
      if (!scroller.querySelector(".pf-article")) return;
      scroller.__pfDone = true;
      try {
        wireIndexAndProgress(scroller);
        wireAnim(scroller);
        wireStepExplorer(scroller);
        wireGateSim(scroller);
        wireArtifacts(scroller);
      } catch (err) { if (window.console) console.warn("paperfactory-viz", err); }
    }
  };
})();
