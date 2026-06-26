/* research-productfactory.js : "The Internet Product Factory Harness" detail page.
   Harness 02 of the AI Systems section. Opens from the .sys-row
   (data-sys="pm-harness") through the shared case-study.js frosted overlay
   (morph "plain"). Self-contained: ships its own scoped ip-* styles and reuses
   the ca-* / ai-* article shell for parity with the other detail pages.

   Exposes:
     window.__productFactoryArticle(data) -> full overlay HTML string
     window.__productFactoryViz.init(scroller) -> sticky index + progress bar,
        looping flow / handoff / Q-Gate animations, and the interactive stage
        explorer, Q-Gate explorer, and artifact explorer.

   No en-dashes or em-dashes in any visible copy (project rule). */
(function () {
  "use strict";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function p(t) { return '<p class="ca-p">' + t + "</p>"; }
  function sec(id, label, title, inner) {
    return '<section class="ca-section ai-sec ip-sec" id="ip-sec-' + id + '" data-ip-label="' + esc(label) + '">' +
      '<div class="ca-h">' + esc(label) + "</div>" +
      (title ? '<h3 class="ca-sub ip-h2">' + esc(title) + "</h3>" : "") + inner + "</section>";
  }
  var IMG = "papers/product-factory/";

  /* ---------- scoped styles ---------- */
  var STYLE = "<style id=\"ip-style\">" + [
    ".ip-article{--mag:#d6006c;--ink:#14181f;--line:rgba(20,24,31,0.12);--mut:#6b7480;--soft:rgba(214,0,108,0.07);--paper:#faf9f7;}",
    ".ip-h2{max-width:28ch;margin-bottom:20px;}",
    ".ip-sec{padding-top:clamp(8px,1.6vh,22px);}",
    ".ip-lede{font-size:clamp(16px,1.4vw,20px);line-height:1.5;color:#3a4049;max-width:64ch;margin:0 0 8px;font-weight:400;text-wrap:pretty;}",
    ".ip-cap{font-size:12px;line-height:1.5;color:#9098a3;margin-top:12px;font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;}",
    ".ip-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#3f4751;background:var(--paper);border:1px solid var(--line);border-radius:5px;padding:1px 6px;}",
    /* plate */
    ".ip-plate{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff;margin:24px 0 6px;}",
    ".ip-plate img{display:block;width:100%;height:auto;}",
    ".ip-plate-cap{font-size:11.5px;color:#9098a3;padding:9px 13px;border-top:1px solid var(--line);font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;}",
    /* metric strip */
    ".ip-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:34px 0 10px;}",
    ".ip-mc{border:1px solid var(--line);border-left:3px solid var(--mag);border-radius:10px;background:#fff;padding:18px 18px 17px;}",
    ".ip-mv{font:800 clamp(20px,2.3vw,30px)/1.05 'Archivo',sans-serif;letter-spacing:-0.02em;color:var(--ink);}",
    ".ip-ml{font-size:11.5px;line-height:1.4;color:var(--mut);margin-top:9px;}",
    /* card grids */
    ".ip-cards{display:grid;gap:18px;margin:26px 0;}",
    ".ip-cards.c2{grid-template-columns:repeat(2,1fr);} .ip-cards.c3{grid-template-columns:repeat(3,1fr);}",
    ".ip-card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:19px 18px;border-top:2px solid var(--mag);}",
    ".ip-card-k{font:800 11px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--mut);margin-bottom:8px;}",
    ".ip-card-h{font:800 15px 'Archivo',sans-serif;color:var(--ink);margin:0 0 9px;letter-spacing:-0.01em;}",
    ".ip-card-b{font-size:12.5px;line-height:1.6;color:var(--mut);}",
    /* three-layer model */
    ".ip-roles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;align-items:stretch;margin:26px 0;border:1px solid var(--line);border-radius:13px;overflow:hidden;}",
    ".ip-role{padding:22px 20px;background:#fff;border-right:1px solid var(--line);}",
    ".ip-role:last-child{border-right:0;} .ip-role.exec{background:var(--soft);}",
    ".ip-role-k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:var(--mag);margin-bottom:4px;}",
    ".ip-role-h{font:800 16px 'Archivo',sans-serif;color:var(--ink);margin:0 0 8px;}",
    ".ip-role-b{font-size:12.5px;line-height:1.55;color:var(--mut);}",
    ".ip-edges{display:flex;flex-direction:column;gap:9px;margin:14px 0 22px;}",
    ".ip-edge{display:flex;align-items:center;gap:10px;font-size:12.5px;color:#3f4751;border:1px solid var(--line);border-radius:8px;padding:11px 14px;background:#fff;}",
    ".ip-edge .f{font:700 11px 'Archivo',sans-serif;color:var(--mag);white-space:nowrap;} .ip-edge .ar{color:var(--mut);}",
    /* files-are-memory map */
    ".ip-memmap{display:grid;grid-template-columns:1.1fr 0.9fr;gap:20px;align-items:start;margin:24px 0;}",
    ".ip-filetree{border:1px solid var(--line);border-radius:12px;background:#0f1318;padding:18px 20px;}",
    ".ip-ft-row{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;line-height:2.0;color:#cfe3dc;}",
    ".ip-ft-row .n{color:#ff7ab8;font-weight:700;margin-right:8px;}",
    ".ip-ft-row .d{color:#9ad7c4;} .ip-ft-row .f{color:#e7eef5;}",
    ".ip-memclose{border:1px dashed var(--mag);border-radius:12px;background:var(--soft);padding:16px 18px;}",
    ".ip-memclose .k{font:800 10.5px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:10px;}",
    ".ip-memclose ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px;}",
    ".ip-memclose li{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#3f4751;}",
    /* stage map */
    ".ip-stagemap{display:flex;flex-direction:column;gap:14px;margin:24px 0;}",
    ".ip-sgroup{border:1px solid var(--line);border-radius:12px;background:#fff;padding:16px 17px;}",
    ".ip-sgroup-k{font:800 11px 'Archivo',sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:var(--mag);margin-bottom:12px;}",
    ".ip-stages{display:flex;flex-direction:column;align-items:flex-start;gap:11px;position:relative;padding-left:20px;border-left:2px solid var(--line);}",
    ".ip-stage{font:700 12px 'Archivo',sans-serif;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:9px 13px;cursor:pointer;transition:border-color .15s,background .15s,color .15s;position:relative;}",
    ".ip-stage::before{content:'';position:absolute;left:-26px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid var(--mag);}",
    ".ip-stage.on::before{background:var(--mag);}",
    ".ip-stage:hover{border-color:var(--mag);} .ip-stage.on{background:var(--mag);color:#fff;border-color:var(--mag);}",
    ".ip-arrow{display:none;}",
    /* circular memory loop */
    ".ip-loopwrap{margin:22px 0;}",
    ".ip-loopwrap svg{width:100%;height:auto;display:block;max-width:560px;margin:0 auto;}",
    ".ip-ring{animation:ipRingDash 7s linear infinite;}",
    "@keyframes ipRingDash{to{stroke-dashoffset:-40;}}",
    ".ip-looplegend{display:grid;grid-template-columns:repeat(2,1fr);gap:9px 22px;max-width:620px;margin:8px auto 0;}",
    ".ip-ll{display:flex;align-items:baseline;gap:10px;font-size:12.5px;color:#3f4751;}",
    ".ip-ll .n{font:800 11px 'Archivo',sans-serif;color:#fff;background:var(--mag);width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex:none;}",
    ".ip-ll.mem{color:var(--mag);font-weight:700;}",
    /* stage detail */
    ".ip-stagedetail{margin-top:16px;border:1px solid var(--line);border-radius:12px;background:var(--paper);padding:22px;}",
    ".ip-sd-name{font:800 18px 'Archivo',sans-serif;color:var(--ink);letter-spacing:-0.015em;margin:0 0 4px;}",
    ".ip-sd-purpose{font-size:13.5px;line-height:1.5;color:#3f4751;margin:0 0 16px;}",
    ".ip-sd-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 26px;}",
    ".ip-sd-k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:5px;}",
    ".ip-sd-v{font-size:12.5px;line-height:1.5;color:#3f4751;}",
    ".ip-sd-v .ip-mono{display:inline-block;margin:2px 4px 2px 0;}",
    /* evidence flow */
    ".ip-flowrow{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:20px 0;}",
    ".ip-flowrow span.s{font:700 12px 'Archivo',sans-serif;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:9px 13px;background:#fff;}",
    ".ip-flowrow span.s.hl{background:var(--soft);border-color:var(--mag);color:var(--mag);}",
    ".ip-flowrow .ar{color:var(--mag);font-weight:800;}",
    /* evidence table */
    ".ip-tablewrap{margin:18px 0;overflow-x:auto;}",
    ".ip-table{width:100%;border-collapse:collapse;font-size:12.5px;min-width:640px;}",
    ".ip-table th,.ip-table td{text-align:left;padding:11px 13px;border-bottom:1px solid var(--line);vertical-align:top;line-height:1.45;}",
    ".ip-table thead th{font:800 10px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--mag);border-bottom:1.5px solid var(--line);white-space:nowrap;}",
    ".ip-table td.id{font-weight:800;color:var(--ink);} .ip-table td.num{font-variant-numeric:tabular-nums;text-align:center;}",
    ".ip-table td.yes{color:#1f8a5b;font-weight:700;} .ip-table td.no{color:var(--mut);}",
    ".ip-table tbody tr:hover{background:var(--soft);}",
    /* q-gate flow */
    ".ip-qflow{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:22px 0;}",
    ".ip-qtest{flex:1 1 150px;border:1px solid var(--line);border-radius:10px;background:#fff;padding:13px 14px;text-align:center;}",
    ".ip-qtest .t{font:800 12px 'Archivo',sans-serif;color:var(--ink);} .ip-qtest .s{font-size:11px;color:var(--mut);margin-top:5px;line-height:1.35;}",
    ".ip-qarrow{color:var(--mut);font-size:14px;}",
    ".ip-routes{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0;}",
    ".ip-routes span{font:700 11px 'Archivo',sans-serif;letter-spacing:0.04em;color:var(--ink);border:1px solid var(--line);border-radius:999px;padding:6px 13px;background:var(--paper);}",
    /* classification cards */
    ".ip-class{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:22px 0;}",
    ".ip-cl{border:1px solid var(--line);border-radius:11px;background:#fff;padding:15px 13px;border-top:2px solid var(--mag);}",
    ".ip-cl.pub{border-top-color:#1f8a5b;} .ip-cl.kill{border-top-color:#b3133f;}",
    ".ip-cl-id{font:800 11px 'Archivo',sans-serif;letter-spacing:0.04em;color:var(--ink);margin-bottom:8px;word-break:break-word;}",
    ".ip-cl-b{font-size:11.5px;line-height:1.45;color:var(--mut);}",
    /* spec stack */
    ".ip-stack{display:flex;flex-direction:column;gap:0;margin:24px 0;}",
    ".ip-si{border:1px solid var(--line);border-bottom:0;padding:18px 18px;background:#fff;}",
    ".ip-stack .ip-si:last-child{border-bottom:1px solid var(--line);}",
    ".ip-si:nth-child(1){border-radius:12px 12px 0 0;border-top:3px solid var(--mag);} .ip-stack .ip-si:last-child{border-radius:0 0 12px 12px;}",
    ".ip-si .nm{font:800 14px 'Archivo',sans-serif;color:var(--ink);margin-bottom:7px;} .ip-si .ds{font-size:12.5px;color:var(--mut);line-height:1.5;}",
    /* build evidence board */
    ".ip-board{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:22px 0;}",
    ".ip-be{border:1px solid var(--line);border-radius:10px;background:#fff;padding:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#3f4751;}",
    ".ip-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}",
    ".ip-tags span{font:700 11px 'Archivo',sans-serif;border-radius:999px;padding:5px 12px;border:1px solid var(--line);}",
    ".ip-tags .real{color:#1f8a5b;border-color:#bfe6d4;background:#f0faf5;} .ip-tags .demo{color:#b06a00;border-color:#f0e0c0;background:#fdf8ee;} .ip-tags .mock{color:#5b53a6;border-color:#dcd8f0;background:#f6f5fc;} .ip-tags .v2{color:var(--mut);}",
    /* audit grid */
    ".ip-audit{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:22px 0;}",
    ".ip-arole{border:1px solid var(--line);border-radius:10px;background:#fff;padding:12px 13px;font:600 12px 'Archivo',sans-serif;color:var(--ink);}",
    ".ip-arole .n{font:800 10px 'Archivo',sans-serif;color:var(--mag);display:block;margin-bottom:4px;}",
    /* launch board */
    ".ip-launch{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:22px 0;}",
    ".ip-lg{border:1px solid var(--line);border-radius:12px;background:#fff;padding:17px;}",
    ".ip-lg-h{font:800 13px 'Archivo',sans-serif;color:var(--ink);margin:0 0 10px;letter-spacing:-0.01em;}",
    ".ip-lg ul{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:7px;}",
    ".ip-lg li{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#3f4751;background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:4px 9px;}",
    /* memory loop */
    ".ip-loop{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:22px 0;}",
    ".ip-loop span.n{font:700 12px 'Archivo',sans-serif;color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:9px 13px;background:#fff;}",
    ".ip-loop span.n.mem{background:var(--soft);border-color:var(--mag);color:var(--mag);}",
    ".ip-loop .ar{color:var(--mag);font-weight:800;}",
    ".ip-memfiles{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;}",
    ".ip-memfiles span{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#3f4751;background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:4px 9px;}",
    /* interactive wrappers */
    ".ip-ix-h{font:700 12px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink);margin:24px 0 14px;display:flex;align-items:center;gap:9px;}",
    ".ip-ix-h .tag{font:800 10px 'Archivo',sans-serif;letter-spacing:0.1em;color:#fff;background:var(--mag);border-radius:999px;padding:3px 9px;}",
    /* q-gate explorer */
    ".ip-qex{border:1px solid var(--line);border-radius:14px;background:#fff;padding:20px;margin:18px 0;}",
    ".ip-qtabs,.ip-rtabs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;}",
    ".ip-qtab{font:700 12px 'Archivo',sans-serif;color:var(--mut);background:#fff;border:1px solid var(--line);border-radius:8px;padding:7px 12px;cursor:pointer;transition:all .15s;}",
    ".ip-qtab:hover{border-color:var(--mag);} .ip-qtab.on{background:var(--mag);color:#fff;border-color:var(--mag);}",
    ".ip-rtab{font:800 11px 'Archivo',sans-serif;letter-spacing:0.03em;color:var(--mut);background:#fff;border:1px solid var(--line);border-radius:999px;padding:7px 13px;cursor:pointer;transition:all .15s;}",
    ".ip-rtab:hover{border-color:var(--mag);} .ip-rtab.on{background:var(--ink);color:#fff;border-color:var(--ink);}",
    ".ip-qpanel{border:1px solid var(--line);border-radius:11px;background:var(--paper);padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px 22px;}",
    ".ip-qpanel .full{grid-column:1/-1;}",
    ".ip-qk{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:4px;}",
    ".ip-qv{font-size:13px;line-height:1.5;color:#3f4751;}",
    ".ip-qroute{margin-top:14px;border:1px solid var(--line);border-radius:11px;background:#fff;padding:14px 16px;}",
    ".ip-qroute .vbig{font:800 16px 'Archivo',sans-serif;color:var(--mag);margin-bottom:6px;}",
    ".ip-qroute p{font-size:12.5px;color:var(--mut);margin:0;line-height:1.45;}",
    /* artifact explorer */
    ".ip-arts{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 14px;}",
    ".ip-artchip{font:700 12.5px 'Archivo',sans-serif;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:999px;padding:8px 15px;cursor:pointer;transition:all .15s;}",
    ".ip-artchip:hover{border-color:var(--mag);} .ip-artchip.on{background:var(--mag);color:#fff;border-color:var(--mag);}",
    ".ip-artpanel{border:1px solid var(--line);border-radius:12px;background:#0f1318;padding:18px 20px;display:grid;grid-template-columns:1fr 1fr;gap:18px;}",
    ".ip-arttree{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;line-height:1.9;color:#e7eef5;white-space:pre-wrap;margin:0;}",
    ".ip-artpurpose .k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#ff7ab8;margin-bottom:6px;}",
    ".ip-artpurpose .v{font-size:13px;line-height:1.55;color:#c9ccd2;}",
    /* animation */
    "@keyframes ipPulse{0%,8%{border-color:var(--line);box-shadow:none;}2%{border-color:var(--mag);box-shadow:0 0 0 3px var(--soft);}100%{border-color:var(--line);box-shadow:none;}}",
    ".ip-anim .ip-stage,.ip-anim .ip-qtest,.ip-anim-loop .ip-loop span.n{animation:ipPulse 13s linear infinite;}",
    /* reveal: visible by default (robust) */
    ".ip-reveal{opacity:1;}",
    /* responsive */
    "@media (max-width:860px){",
    ".ip-metrics{grid-template-columns:repeat(2,1fr);} .ip-cards.c3{grid-template-columns:repeat(2,1fr);}",
    ".ip-roles{grid-template-columns:1fr;} .ip-role{border-right:0;border-bottom:1px solid var(--line);}",
    ".ip-memmap{grid-template-columns:1fr;} .ip-class{grid-template-columns:repeat(2,1fr);}",
    ".ip-board{grid-template-columns:repeat(2,1fr);} .ip-audit{grid-template-columns:repeat(2,1fr);} .ip-launch{grid-template-columns:1fr;}",
    ".ip-sd-grid,.ip-qpanel,.ip-artpanel{grid-template-columns:1fr;}",
    "}",
    "@media (max-width:520px){.ip-metrics,.ip-cards.c3,.ip-class,.ip-board,.ip-audit{grid-template-columns:1fr;}}",
    "@media (prefers-reduced-motion:reduce){.ip-anim .ip-stage,.ip-anim .ip-qtest,.ip-anim-loop .ip-loop span.n,.ip-ring{animation:none;}}"
  ].join("") + "</style>";

  /* ---------- data ---------- */
  var STAGES = [
    { id: "00_context", group: 0, name: "00 Context", purpose: "Frame the product opportunity before build.", subs: "product boundary, persona assumptions, public/internal boundary, technical constraints, success definition", out: ["project-context.md"], next: "Demand discovery" },
    { id: "01_demand_discovery", group: 0, name: "01 Demand Discovery", purpose: "Scan demand pools before selecting an idea.", subs: "broad source scan, pain signal extraction, opportunity clustering, cross-audience comparison, evidence quality ranking, opportunity framing, demand synthesis", out: ["demand-discovery-report.md", "competitor-matrix.md", "user-pain-map.md", "raw-signal-log.md", "demand-bias-check.md"], next: "Demand scoring" },
    { id: "02_demand_scoring", group: 0, name: "02 Demand Scoring", purpose: "Score launch slots and classify candidates.", subs: "user pain, demo pull, star pull, build cost, differentiation risk, distribution scoring, final ranking", out: ["demand-scorecard.md", "opportunity-ranking.md", "batch-shortlist.md", "launch-slot-ranking.md", "classification-table.md"], next: "Q-Gate" },
    { id: "03_q_gate", group: 0, name: "03 Q-Gate", purpose: "Decide whether a candidate can enter build.", subs: "public product bar, GitHub visitor test, 30-minute copy test, risk check, kill/continue decision", out: ["q-gate-report.md", "pre-mortem.md"], next: "Routes: continue, pivot, pause, kill, internal-only, V2-before-launch" },
    { id: "04_product_discovery", group: 1, name: "04 Product Discovery", purpose: "Turn opportunity into product concept.", subs: "persona refinement, use-case map, opportunity-solution tree, core workflow, assumption map, MVP direction", out: ["product-discovery.md", "assumption-map.md", "opportunity-solution-tree.md"], next: "MVP specification" },
    { id: "05_mvp_specification", group: 1, name: "05 MVP Specification", purpose: "Make implementation explicit.", subs: "PRD, user stories, UX/CLI structure, data model, API plan, acceptance criteria, test plan", out: ["mvp-prd.md", "technical-spec.md", "acceptance-criteria.md"], next: "Build execution" },
    { id: "06_build_execution", group: 1, name: "06 Build Execution", purpose: "Build repository and record implementation evidence.", subs: "scaffold, core logic, UI/CLI surface, example data, integration, smoke test, README draft", out: ["build-log.md", "run-instructions.md", "build-depth-checklist.md"], next: "Multi-agent audit" },
    { id: "07_multi_agent_audit", group: 2, name: "07 Multi-Agent Audit", purpose: "Review the product from multiple independent perspectives.", subs: "13 audit roles across product, engineering, security, growth, and user views", out: ["audit-report.md", "subagent-feedback.md", "fix-plan.md", "ship-or-not.md"], next: "Ship or return to build" },
    { id: "08_packaging_launch", group: 2, name: "08 Packaging and Launch", purpose: "Create the GitHub launch package.", subs: "positioning, README first screen, differentiation copy, demo plan, quick start, topics, English and Chinese README, claim check, launch summary", out: ["README.md", "README.zh-CN.md", "github-description.md", "github-topics.md", "launch-summary.md"], next: "Post-launch feedback" },
    { id: "09_post_launch_feedback", group: 3, name: "09 Post-Launch Feedback", purpose: "Record metrics or local status.", subs: "metrics, issue review, distribution feedback, user comments, continue/pivot/kill decision", out: ["feedback-summary.md", "metrics-summary.md", "continue-pivot-kill.md"], next: "Reflection memory" },
    { id: "10_reflection_memory", group: 3, name: "10 Reflection and Memory", purpose: "Update factory memory for the next run.", subs: "what worked, what failed, overbuilt/underbuilt, signal quality, scoring calibration, pattern memory", out: ["reflection.md", "memory-update.md", "global-lessons.md", "product-patterns.md", "scoring-calibration.md"], next: "Demand discovery" }
  ];
  var GROUPS = [
    { k: "Discovery and Scoring", ids: ["00_context", "01_demand_discovery", "02_demand_scoring", "03_q_gate"] },
    { k: "Design and Build", ids: ["04_product_discovery", "05_mvp_specification", "06_build_execution"] },
    { k: "Audit and Launch", ids: ["07_multi_agent_audit", "08_packaging_launch"] },
    { k: "Feedback Loop", ids: ["09_post_launch_feedback", "10_reflection_memory"] }
  ];
  var QTESTS = [
    { id: "Public product bar", checks: "Whether the candidate clears the bar for an external-facing public product with real workflow, UI, demo, and user value.", pass: "Clear product value with demo-ready surface.", fail: "Thin wrapper, script, or checklist with no external value.", route: "PASS to GitHub visitor test, otherwise BUILD_INTERNAL_ONLY." },
    { id: "GitHub visitor test", checks: "Whether a first-time GitHub visitor understands the product and wants to try it within seconds.", pass: "Clear hook, obvious use case, and visible output.", fail: "Unclear purpose or no visible payoff.", route: "PASS forward, otherwise PIVOT on positioning." },
    { id: "30-minute copy test", checks: "Whether a competent builder could clone the idea in about 30 minutes.", pass: "Real depth, fixtures, or workflow that resists quick copying.", fail: "Trivially reproducible surface.", route: "PASS forward, otherwise NEEDS_V2_BEFORE_LAUNCH." },
    { id: "Risk / compliance check", checks: "Legal, data, platform, and abuse risks of shipping the product publicly.", pass: "Acceptable risk with clear handling.", fail: "Unmanaged compliance or platform risk.", route: "PASS forward, otherwise PAUSE or KILL." },
    { id: "Kill / continue decision", checks: "The combined verdict across all tests and the build route.", pass: "Candidate enters product discovery or build path.", fail: "Candidate is parked, killed, or routed internal-only.", route: "CONTINUE, PIVOT, PAUSE, KILL, BUILD_INTERNAL_ONLY, or NEEDS_V2_BEFORE_LAUNCH." }
  ];
  var ROUTES = {
    CONTINUE: "Enter product discovery or the build path.",
    PIVOT: "Revise direction before build.",
    PAUSE: "Wait for missing input or timing.",
    KILL: "Stop and record the reason.",
    BUILD_INTERNAL_ONLY: "Keep as a factory tool, not a public product.",
    NEEDS_V2_BEFORE_LAUNCH: "Return to build depth before release."
  };
  var ROUTE_KEYS = ["CONTINUE", "PIVOT", "PAUSE", "KILL", "BUILD_INTERNAL_ONLY", "NEEDS_V2_BEFORE_LAUNCH"];
  var ARTGROUPS = [
    { k: "Evidence and Discovery", files: ["demand-discovery-report.md", "competitor-matrix.md", "user-pain-map.md", "raw-signal-log.md"], purpose: "Store demand signals and source-backed opportunity analysis." },
    { k: "Specification", files: ["mvp-prd.md", "technical-spec.md", "acceptance-criteria.md", "test-plan.md"], purpose: "Convert the product concept into implementation instructions." },
    { k: "Build Evidence", files: ["build-log.md", "run-instructions.md", "core-logic-depth-report.md", "fixture-test-report.md"], purpose: "Record what was built, how it runs, and how deep the implementation is." },
    { k: "Audit", files: ["audit-report.md", "subagent-feedback.md", "fix-plan.md", "ship-or-not.md"], purpose: "Collect multi-role review and route the product." },
    { k: "Launch Package", files: ["README.md", "README.zh-CN.md", "github-description.md", "github-topics.md", "launch-summary.md", "readme-claim-check.md"], purpose: "Prepare the public GitHub product package." },
    { k: "Memory", files: ["reflection.md", "memory-update.md", "global-lessons.md", "product-patterns.md", "scoring-calibration.md"], purpose: "Feed lessons into the next run." }
  ];

  /* ---------- builders ---------- */
  function metricStrip() {
    var M = [["11", "Workflow stages"], ["13", "Audit roles"], ["5", "Required stage-closing files"], ["1", "Public product per run"],
      ["Markdown", "System state layer"], ["Q-Gate", "Public product filter"], ["Claude Code", "Local execution"], ["ChatGPT Pro", "External review"]];
    return '<div class="ip-metrics ip-reveal">' + M.map(function (x) {
      return '<div class="ip-mc"><div class="ip-mv">' + esc(x[0]) + '</div><div class="ip-ml">' + esc(x[1]) + "</div></div>";
    }).join("") + "</div>";
  }
  function roleModel() {
    var R = [
      ["Claude Code", "Local execution layer", "Files, scripts, repositories, evidence, checkpoints, and build logs.", "exec"],
      ["ChatGPT 5.5 Pro", "External review layer", "Demand review, scoring support, Q-Gate feedback, multi-agent audit, and launch copy review.", ""],
      ["User", "Human unlock layer", "Captcha, payment, MFA, identity verification, and final intervention when required.", ""]
    ];
    return '<div class="ip-roles ip-reveal">' + R.map(function (r) {
      return '<div class="ip-role ' + r[3] + '"><div class="ip-role-k">' + esc(r[1]) + '</div><div class="ip-role-h">' + esc(r[0]) + '</div><div class="ip-role-b">' + esc(r[2]) + "</div></div>";
    }).join("") + "</div>" +
    '<div class="ip-edges ip-reveal">' +
      edge("Claude Code to Pro", "Markdown handoff via skills + Playwright") +
      edge("Pro to Claude Code", "review result written back to files") +
      edge("Claude Code to User", "progress and machine-blocking stops") +
      edge("User to Pro", "captcha, payment, MFA only when required") + "</div>";
    function edge(f, t) { return '<div class="ip-edge"><span class="f">' + esc(f) + '</span><span class="ar">&#8594;</span><span>' + esc(t) + "</span></div>"; }
  }
  function plate(src, cap) { return '<div class="ip-plate ip-reveal"><img src="' + IMG + src + '" alt="' + esc(cap) + '"><div class="ip-plate-cap">' + esc(cap) + "</div></div>"; }
  function memMap() {
    var order = ["products/_product-index.md", "current product folder", "latest next-stage-brief.md", "latest checkpoint.md", "latest stage-report.md", "related substage files", "memory/*.md", "handoff/"];
    var close = ["stage-report.md", "checkpoint.md", "prompt-log.md", "decision-log.md", "next-stage-brief.md"];
    return '<div class="ip-memmap ip-reveal">' +
      '<div class="ip-filetree">' + order.map(function (o, i) {
        var isFile = /\.md|\//.test(o) && o.indexOf(" ") === -1;
        return '<div class="ip-ft-row"><span class="n">' + (i + 1) + '</span><span class="' + (isFile ? "f" : "d") + '">' + esc(o) + "</span></div>";
      }).join("") + "</div>" +
      '<div class="ip-memclose"><div class="k">Each stage closes with</div><ul>' + close.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul></div>" +
    "</div>";
  }
  function stageMap() {
    return '<div class="ip-stagemap ip-reveal ip-anim-flow">' + GROUPS.map(function (g) {
      var chips = g.ids.map(function (id, i) {
        return (i ? '<span class="ip-arrow" aria-hidden="true">&#8594;</span>' : "") +
          '<button type="button" class="ip-stage" data-stage="' + id + '">' + esc(id) + "</button>";
      }).join("");
      return '<div class="ip-sgroup"><div class="ip-sgroup-k">' + esc(g.k) + '</div><div class="ip-stages">' + chips + "</div></div>";
    }).join("") + "</div>";
  }
  function stageExplorer() {
    return '<div class="ip-ix-h ip-reveal"><span class="tag">Interactive</span>Stage machine explorer</div>' +
      stageMap() +
      '<div class="ip-stagedetail ip-reveal" data-ip-stagedetail="1"></div>';
  }
  function evidenceFlow() {
    var steps = ["Collect evidence", "Evidence Pack", "Source Log", "Analysis", "Scores", "Risks", "Decision", "Next substage"];
    return '<div class="ip-flowrow ip-reveal">' + steps.map(function (s, i) {
      return (i ? '<span class="ar" aria-hidden="true">&#8594;</span>' : "") + '<span class="s' + (s === "Evidence Pack" || s === "Decision" ? " hl" : "") + '">' + esc(s) + "</span>";
    }).join("") + "</div>";
  }
  function evidenceTable() {
    var rows = [
      ["E1", "Forum / docs / file", "observed user pain signal", "extracted demand signal", "8", "9", "yes"],
      ["E2", "Competitor page", "missing workflow or weak UX", "differentiation signal", "7", "8", "yes"],
      ["E3", "Internal hypothesis", "unverified assumption", "weak hypothesis", "3", "5", "no"]
    ];
    return '<div class="ip-tablewrap ip-reveal"><table class="ip-table">' +
      "<thead><tr><th>ID</th><th>Source Type</th><th>Raw Observation</th><th>Extracted Signal</th><th>Reliability</th><th>Relevance</th><th>Used?</th></tr></thead><tbody>" +
      rows.map(function (r) {
        return '<tr><td class="id">' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td><td class="num">' + r[4] + '</td><td class="num">' + r[5] + '</td><td class="' + (r[6] === "yes" ? "yes" : "no") + '">' + r[6] + "</td></tr>";
      }).join("") + "</tbody></table>" +
      '<div class="ip-cap">Each conclusion in the analysis points back to evidence IDs. Unsupported ideas remain hypotheses.</div></div>';
  }
  function qGateFlow() {
    var tests = [["Public product bar", "public-product value"], ["GitHub visitor test", "first-glance pull"], ["30-minute copy test", "depth and moat"], ["Risk / compliance", "legal and platform"], ["Kill / continue", "combined verdict"]];
    var flow = '<div class="ip-qflow ip-reveal ip-anim-gate">' + tests.map(function (t, i) {
      return (i ? '<span class="ip-qarrow" aria-hidden="true">&#8594;</span>' : "") + '<div class="ip-qtest"><div class="t">' + esc(t[0]) + '</div><div class="s">' + esc(t[1]) + "</div></div>";
    }).join("") + "</div>";
    var routes = '<div class="ip-routes ip-reveal">' + ROUTE_KEYS.map(function (r) { return "<span>" + esc(r) + "</span>"; }).join("") + "</div>";
    var classes = [
      ["PUBLIC_PRODUCT", "External-facing product suitable for an independent public GitHub repository.", "pub"],
      ["INTERNAL_FACTORY_TOOL", "Useful to the factory, but not strong enough for a public repository slot.", ""],
      ["EXPERIMENT", "A test for risky mechanisms or uncertain demand signals.", ""],
      ["PARK", "Potential exists, but evidence or timing is insufficient.", ""],
      ["KILL", "Weak, risky, undifferentiated, or not worth continued investment.", "kill"]
    ];
    var cards = '<div class="ip-class ip-reveal">' + classes.map(function (c) {
      return '<div class="ip-cl ' + c[2] + '"><div class="ip-cl-id">' + esc(c[0]) + '</div><div class="ip-cl-b">' + esc(c[1]) + "</div></div>";
    }).join("") + "</div>";
    return flow + routes + cards;
  }
  function qGateExplorer() {
    return '<div class="ip-ix-h ip-reveal"><span class="tag">Interactive</span>Q-Gate decision explorer</div>' +
      '<div class="ip-qex ip-reveal" data-ip-qex="1">' +
        '<div class="ip-qtabs" data-role="tests"></div>' +
        '<div class="ip-qpanel" data-role="panel"></div>' +
        '<div class="ip-ix-h" style="margin:18px 0 10px">Routes</div>' +
        '<div class="ip-rtabs" data-role="routes"></div>' +
        '<div class="ip-qroute" data-role="routeout"></div>' +
      "</div>";
  }
  function specStack() {
    var S = [
      ["Product Discovery", "persona, use cases, opportunity-solution tree, core workflow, assumptions"],
      ["MVP Specification", "PRD, user stories, UX/CLI structure, data model, API plan, acceptance criteria, test plan"],
      ["Gate Stack Design", "core mechanism, UI specificity, method fit, real-world depth, fixture plan, business constraints"]
    ];
    return '<div class="ip-stack ip-reveal">' + S.map(function (s) {
      return '<div class="ip-si"><div class="nm">' + esc(s[0]) + '</div><div class="ds">' + esc(s[1]) + "</div></div>";
    }).join("") + "</div>";
  }
  function buildBoard() {
    var logs = ["scaffold_log", "core_logic_log", "ui_or_cli_surface_log", "example_data_log", "nim_or_mock_integration_log", "smoke_test_log", "readme_draft_log"];
    return '<div class="ip-board ip-reveal">' + logs.map(function (l) { return '<div class="ip-be">' + esc(l) + "</div>"; }).join("") + "</div>" +
      '<div class="ip-tags ip-reveal"><span class="real">real user functionality</span><span class="demo">demo-only</span><span class="mock">mock</span><span class="v2">unfinished V2</span></div>';
  }
  function auditGrid() {
    var roles = ["Product", "Engineering", "Security", "Growth", "Skeptical student user", "Nontechnical user", "Time-poor professional", "GitHub visitor", "Implementation depth", "Real-world depth", "README", "Business workflow", "Method-problem fit"];
    return '<div class="ip-audit ip-reveal">' + roles.map(function (r, i) {
      return '<div class="ip-arole"><span class="n">' + (i + 1 < 10 ? "0" + (i + 1) : i + 1) + '</span>' + esc(r) + "</div>";
    }).join("") + "</div>" +
    '<div class="ip-routes ip-reveal"><span>SHIP</span><span>FIX</span><span>NEEDS_V2_BEFORE_LAUNCH</span></div>';
  }
  function launchBoard() {
    var G = [
      ["README System", ["README.md", "README.zh-CN.md", "quick start", "demo", "examples"]],
      ["GitHub Metadata", ["description", "topics", "SEO keywords"]],
      ["Launch Materials", ["launch summary", "launch posts", "poster brief", "distribution plan"]],
      ["Claim Check", ["readme-claim-check.md", "implementation evidence", "demo instructions"]]
    ];
    return '<div class="ip-launch ip-reveal">' + G.map(function (g) {
      return '<div class="ip-lg"><div class="ip-lg-h">' + esc(g[0]) + '</div><ul>' + g[1].map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>";
    }).join("") + "</div>";
  }
  function memLoop() {
    var nodes = ["Post-launch feedback", "Metrics summary", "Issue + comment synthesis", "Continue / pivot / kill", "reflection.md", "Memory update"];
    var cx = 280, cy = 172, rx = 192, ry = 118, N = nodes.length;
    var svg = '<svg viewBox="0 0 560 360" role="img" aria-label="Memory feedback loop: post-launch feedback, metrics, synthesis, decision, reflection, and memory update feed the next demand discovery.">';
    svg += '<ellipse class="ip-ring" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="#d6006c" stroke-width="1.6" stroke-dasharray="3 7" opacity="0.55"/>';
    svg += '<text x="' + cx + '" y="' + (cy - 5) + '" text-anchor="middle" style="font:800 14px Archivo,sans-serif" fill="#14181f">Memory loop</text>';
    svg += '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" style="font:600 11px Archivo,sans-serif" fill="#6b7480">feeds the next demand discovery</text>';
    for (var i = 0; i < N; i++) {
      var a = -Math.PI / 2 + i * (2 * Math.PI / N);
      var x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a), mem = i >= 4;
      svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="15" fill="' + (mem ? "#d6006c" : "#fff") + '" stroke="#d6006c" stroke-width="1.8"/>';
      svg += '<text x="' + x.toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="middle" style="font:800 13px Archivo,sans-serif" fill="' + (mem ? "#fff" : "#d6006c") + '">' + (i + 1) + "</text>";
    }
    svg += "</svg>";
    var legend = '<div class="ip-looplegend">' + nodes.map(function (t, i) {
      return '<div class="ip-ll' + (i >= 4 ? " mem" : "") + '"><span class="n">' + (i + 1) + "</span>" + esc(t) + "</div>";
    }).join("") + "</div>";
    return '<div class="ip-loopwrap ip-reveal">' + svg + legend + "</div>" +
      '<div class="ip-memfiles ip-reveal"><span>global-lessons.md</span><span>product-patterns.md</span><span>scoring-calibration.md</span></div>';
  }
  function artifactExplorer() {
    return '<div class="ip-ix-h ip-reveal"><span class="tag">Interactive</span>Artifact package explorer</div>' +
      '<div class="ip-arts ip-reveal" data-ip-arts="1">' + ARTGROUPS.map(function (a, i) {
        return '<button type="button" class="ip-artchip' + (i === 0 ? " on" : "") + '" data-art="' + i + '">' + esc(a.k) + "</button>";
      }).join("") + "</div>" +
      '<div class="ip-artpanel ip-reveal" data-ip-artpanel="1"></div>';
  }

  /* ---------- article ---------- */
  window.__productFactoryArticle = function (data) {
    var H = STYLE;

    H += '<div class="ai-controls ip-controls">' +
      '<span class="ip-brand" style="display:inline-flex;align-items:center;gap:8px;flex:none;font:800 11px \'Archivo\',sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:#d6006c;"><i style="width:9px;height:9px;border-radius:2px;background:#d6006c;display:inline-block;"></i>AI Harness 02</span>' +
      '<nav class="ai-index" aria-label="Section index"></nav></div>';
    H += '<div class="ai-progress" data-ip-progress="1"><i></i></div>';

    /* HERO */
    H += '<section class="ca-section ai-sec ip-sec" id="ip-sec-hero" data-ip-label="Overview">' +
      '<div class="ca-kicker">AI Systems &middot; Harness 02</div>' +
      '<h1 class="ca-title">The Internet Product Factory: A Harness-Driven Workflow</h1>' +
      '<div class="ai-role">A markdown-driven AI production line for public GitHub products</div>' +
      '<p class="ip-lede">A markdown-driven AI workflow for turning demand signals into public GitHub products through evidence packs, Q-Gates, specifications, builds, audits, launch packages, and memory feedback loops.</p>' +
      p("This harness turns product creation into a staged production system. A candidate begins as a demand signal, becomes an evidence-backed opportunity, passes a Q-Gate, turns into a product specification, moves through build execution, enters multi-agent audit, and ships as a GitHub-ready product package.") +
      p("The system is built around one rule: files carry the truth. Every source, score, decision, handoff, checkpoint, build log, audit result, and launch package is written to Markdown. Chat history can compress, browser automation can break, and long sessions can drift. The product folder remains the durable state layer.") +
      metricStrip() +
      '<div class="ip-cap ip-reveal">A product idea moves from demand evidence to public GitHub launch through a file-based, dual-AI production loop.</div>' +
      "</section>";

    /* 1 operating model */
    H += sec("model", "Operating Model", "Three Working Layers",
      p("The factory has three working layers. Claude Code is the local execution layer: it reads and writes files, runs scripts, builds repositories, records evidence, and advances the stage machine. ChatGPT 5.5 Pro is the external review layer: it receives Markdown handoffs through skills and Playwright, returns research, scoring, Q-Gate, audit, and launch feedback, and gives an outside reasoning pass at key stages. The user handles machine-blocking steps such as captcha, payment, MFA, or identity verification.") +
      roleModel() +
      plate("linear.png", "Reference: a purpose-built product development system for teams and agents. Source: linear.app."));

    /* 2 files are memory */
    H += sec("memory", "Files Are Memory", "Markdown Is the State Source",
      p("The workflow treats Markdown files as the state source. Each run resumes from files in a fixed order, which keeps the system recoverable across context compression, browser failures, long waits, and cross-AI handoffs. Each stage closes with five required files, and the next stage begins by reading the brief left by the previous one.") +
      memMap());

    /* 2.5 the 11-stage production line + stage explorer */
    H += sec("stages", "The 11-Stage Production Line", "From Context to Memory",
      p("The factory advances through eleven stages, grouped into discovery and scoring, design and build, audit and launch, and a feedback loop. Each stage reads the brief left by the previous one and closes by writing its own. Select a stage to see its purpose, key substages, main outputs, and route.") +
      stageExplorer());

    /* 3 evidence-first intake */
    H += sec("intake", "Evidence-First Intake", "Demand Discovery Before Implementation",
      p("Product ideas enter through demand discovery. The factory scans multiple demand pools: developers, students, job seekers, creators, small businesses, personal finance users, productivity users, education users, and newly discovered niche groups. It then extracts pain signals, clusters opportunities, compares audiences, ranks evidence quality, and frames product opportunities.") +
      p("Every substage follows the same structure: collect evidence, build an evidence pack, log sources, analyze signals, assign scores, record risks, and write a decision. Claims inside the analysis reference evidence IDs. Unsupported ideas remain hypotheses.") +
      evidenceFlow() +
      evidenceTable());

    /* 4 q-gate */
    H += sec("qgate", "Q-Gate and Classification", "Protecting the Public Product Slot",
      p("Before build execution, every candidate receives a product classification. The Q-Gate checks public-product bar, GitHub visitor pull, 30-minute copy risk, compliance risk, and the build route. Valid outcomes include continue, pivot, pause, kill, internal-only build, or V2-before-launch.") +
      qGateFlow() +
      qGateExplorer());

    /* 5 specification */
    H += sec("spec", "Specification Before Build", "From Opportunity to Implementation Instructions",
      p("A surviving opportunity enters product discovery and MVP specification. Product discovery refines the persona, maps use cases, builds the opportunity-solution tree, defines the core workflow, records assumptions, and chooses the MVP direction. The MVP specification then converts the concept into implementation instructions: PRD, user stories, UX or CLI structure, data model, API plan, acceptance criteria, and test plan. The build path becomes explicit before code is written.") +
      specStack());

    /* 6 build execution */
    H += sec("build", "Build Execution", "Working Depth Over File Count",
      p("The build stage creates the repository under the product folder and records implementation evidence. The build log separates real user-facing functionality, demo-only behavior, mock integration, and unfinished V2 work. The product must include run instructions, example data, smoke tests, README drafts, and reports on core logic depth, fixture depth, real-world data path, and CI readiness when applicable. This stage is judged by working depth: a frontend, backend, README, and smoke test can still leave a shallow product if the core mechanism, examples, and user-ready output are thin.") +
      buildBoard() +
      plate("github-actions.png", "Reference: automating workflows from idea to production with CI/CD. Source: github.com/features/actions."));

    /* 7 audit */
    H += sec("audit", "Multi-Agent Audit", "A 13-Role Review Before Packaging",
      p("Before packaging, the product enters a 13-role audit covering product, engineering, security, growth, skeptical user, nontechnical user, time-poor professional, GitHub visitor, implementation-depth, real-world-depth, README, business-workflow, and method-problem-fit perspectives. The audit produces audit-report.md, subagent-feedback.md, fix-plan.md, and ship-or-not.md. A key reviewer can block launch with NEEDS_V2_BEFORE_LAUNCH, and the product then returns to build execution or moves forward to packaging.") +
      auditGrid());

    /* 8 launch */
    H += sec("launch", "Launch Package", "A README Built Like a Landing Page",
      p("The launch stage turns the repository into a public-facing GitHub product. The README is structured like a landing page: hero, problem, existing gaps, product explanation, key features, demo, quick start, input and output examples, use cases, how it works, project structure, roadmap, limitations, license, and bilingual links. The package includes English and Chinese README files, GitHub description, topics, launch summary, claim check, demo instructions, SEO keywords, poster brief, distribution plan, and launch posts. README claims are checked against implementation evidence before release.") +
      launchBoard() +
      plate("product-hunt.png", "Reference: a launch guide for sharing a finished product with a wider audience. Source: producthunt.com."));

    /* 9 feedback + memory */
    H += sec("feedback", "Feedback and Memory", "Closing the Loop",
      p("After launch or local completion, the factory records feedback and updates memory. The feedback stage collects metrics, issues, distribution feedback, user comments, and the continue-pivot-kill decision. If the product stays local, the run records NOT_LAUNCHED_LOCAL_ONLY and explains why. The reflection stage captures what worked, what failed, where the product was overbuilt or underbuilt, how good the demand signal was, how scoring should be calibrated, and which product patterns should affect the next run. Lessons flow back into global memory, product patterns, and scoring calibration.") +
      memLoop());

    /* 10 artifact explorer + what it shows */
    H += sec("shows", "What This Harness Shows", "Product Work as a Stateful Loop",
      p("The harness turns product work into a stateful loop. Demand signals become evidence packs. Evidence becomes rankings. Rankings enter Q-Gates. Surviving ideas become specifications. Specifications become repositories. Repositories enter audit. Audited products become GitHub launch packages. Launch results become memory for the next round.") +
      p("The system shows how local execution, external model review, browser handoff, file-based memory, product gates, multi-agent audit, and launch packaging can work as one production line.") +
      artifactExplorer() +
      '<div class="ca-foot"><span>AI Harness 02 &middot; The Internet Product Factory Harness</span><span>Zhenyuan Pan &middot; 2026</span></div>');

    return (
      '<button class="case-close" type="button" aria-label="Close article"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll ip-scroll"><article class="case-article ai-article ip-article">' + H + "</article></div>"
    );
  };

  /* ================= viz ================= */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wireIndexAndProgress(scroller) {
    var nav = scroller.querySelector(".ip-controls .ai-index");
    var secs = [].slice.call(scroller.querySelectorAll(".ip-sec[data-ip-label]"));
    if (!nav) return;
    var links = [];
    secs.forEach(function (s) {
      var a = document.createElement("button");
      a.type = "button"; a.className = "ai-ix"; a.textContent = s.getAttribute("data-ip-label"); a.setAttribute("data-target", s.id);
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
    [[".ip-anim-flow .ip-stage", ".ip-anim-flow"], [".ip-anim-gate .ip-qtest", ".ip-anim-gate"], [".ip-anim-loop .ip-loop span.n", ".ip-anim-loop"]].forEach(function (pair) {
      var els = [].slice.call(scroller.querySelectorAll(pair[0]));
      var n = els.length; if (!n) return;
      var parent = scroller.querySelector(pair[1]); if (parent) parent.classList.add("ip-anim");
      els.forEach(function (e, i) { e.style.animationDelay = (i * (13 / n)).toFixed(2) + "s"; });
    });
    /* the loop wrapper needs the ip-anim class on a stable ancestor */
    var loopWrap = scroller.querySelector(".ip-anim-loop");
    if (loopWrap) loopWrap.classList.add("ip-anim");
  }

  function wireStageExplorer(scroller) {
    var detail = scroller.querySelector("[data-ip-stagedetail]");
    if (!detail) return;
    var btns = [].slice.call(scroller.querySelectorAll(".ip-stage[data-stage]"));
    function render(id) {
      var s = STAGES.filter(function (x) { return x.id === id; })[0];
      if (!s) return;
      btns.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-stage") === id); });
      var outs = s.out.map(function (o) { return '<span class="ip-mono">' + esc(o) + "</span>"; }).join(" ");
      detail.innerHTML =
        '<h4 class="ip-sd-name">' + esc(s.name) + "</h4>" +
        '<p class="ip-sd-purpose">' + esc(s.purpose) + "</p>" +
        '<div class="ip-sd-grid">' +
          '<div class="ip-sd-block"><div class="ip-sd-k">Key substages</div><div class="ip-sd-v">' + esc(s.subs) + "</div></div>" +
          '<div class="ip-sd-block"><div class="ip-sd-k">Next route</div><div class="ip-sd-v">' + esc(s.next) + "</div></div>" +
          '<div class="ip-sd-block" style="grid-column:1/-1"><div class="ip-sd-k">Main outputs</div><div class="ip-sd-v">' + outs + "</div></div>" +
        "</div>";
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { render(b.getAttribute("data-stage")); }); });
    render("03_q_gate");
  }

  function wireQGate(scroller) {
    var box = scroller.querySelector("[data-ip-qex]");
    if (!box) return;
    var tabs = box.querySelector('[data-role="tests"]');
    var panel = box.querySelector('[data-role="panel"]');
    var rtabs = box.querySelector('[data-role="routes"]');
    var routeout = box.querySelector('[data-role="routeout"]');
    QTESTS.forEach(function (t, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "ip-qtab" + (i === 0 ? " on" : ""); b.textContent = t.id;
      b.addEventListener("click", function () {
        tabs.querySelectorAll(".ip-qtab").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); renderTest(t);
      });
      tabs.appendChild(b);
    });
    function renderTest(t) {
      panel.innerHTML =
        '<div class="full"><div class="ip-qk">What it checks</div><div class="ip-qv">' + esc(t.checks) + "</div></div>" +
        '<div><div class="ip-qk">What passes</div><div class="ip-qv">' + esc(t.pass) + "</div></div>" +
        '<div><div class="ip-qk">What fails</div><div class="ip-qv">' + esc(t.fail) + "</div></div>" +
        '<div class="full"><div class="ip-qk">Possible route</div><div class="ip-qv">' + esc(t.route) + "</div></div>";
    }
    ROUTE_KEYS.forEach(function (r, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "ip-rtab" + (i === 0 ? " on" : ""); b.textContent = r;
      b.addEventListener("click", function () {
        rtabs.querySelectorAll(".ip-rtab").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); renderRoute(r);
      });
      rtabs.appendChild(b);
    });
    function renderRoute(r) {
      routeout.innerHTML = '<div class="vbig">' + esc(r) + "</div><p>" + esc(ROUTES[r]) + "</p>";
    }
    renderTest(QTESTS[0]); renderRoute("CONTINUE");
  }

  function wireArtifacts(scroller) {
    var panel = scroller.querySelector("[data-ip-artpanel]");
    if (!panel) return;
    var chips = [].slice.call(scroller.querySelectorAll(".ip-artchip[data-art]"));
    function render(i) {
      var a = ARTGROUPS[i];
      chips.forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-art") === i); });
      var tree = a.files.map(function (f) { return "  " + f; }).join("\n");
      panel.innerHTML = '<pre class="ip-arttree">' + esc(a.k) + "/\n" + esc(tree) + "</pre>" +
        '<div class="ip-artpurpose"><div class="k">Purpose</div><div class="v">' + esc(a.purpose) + "</div></div>";
    }
    chips.forEach(function (b) { b.addEventListener("click", function () { render(+b.getAttribute("data-art")); }); });
    render(0);
  }

  window.__productFactoryViz = {
    init: function (scroller) {
      if (!scroller || scroller.__ipDone) return;
      if (!scroller.querySelector(".ip-article")) return;
      scroller.__ipDone = true;
      try {
        wireIndexAndProgress(scroller);
        wireAnim(scroller);
        wireStageExplorer(scroller);
        wireQGate(scroller);
        wireArtifacts(scroller);
      } catch (err) { if (window.console) console.warn("productfactory-viz", err); }
    }
  };
})();
