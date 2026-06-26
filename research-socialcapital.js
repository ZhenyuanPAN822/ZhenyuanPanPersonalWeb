/* research-socialcapital.js : expanded research-detail experience for
   "Social Capital Formation in Tutoring Networks" (Behavioral & Field Economics,
   RA to Prof. Hongru Tan). Green research card (c3) on Screen 3.

   Exposes:
     window.__socialCapitalArticle(data) -> full article HTML string (consumed by
        case-study.js, morph "plain"). Self-contained: ships its own scoped
        <style> for the bespoke sc-* visuals and reuses the existing
        ca-* / rs-* / ai-* article classes from case-study.css for shell parity
        with the Red Sea and AI/Labor research pages.
     window.__socialCapitalViz.init(scroller) -> renders KaTeX, builds the sticky
        section index + progress bar, and wires the three interactive modules.

   Objective voice only: no first-person or second-person language. The page
   describes research design, field implementation, platform data, and
   illustrative estimation logic. No final empirical results are claimed.
   No en-dashes or em-dashes in any visible copy (project rule). */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function eq(tex, num) {
    return '<div class="ai-eq sc-eq"><div class="ai-eqx">\\[' + tex + '\\]</div>' +
      (num ? '<span class="ai-eqn">(' + num + ")</span>" : "") + "</div>";
  }
  function m(tex) { return '<span class="ai-m">\\(' + tex + "\\)</span>"; }
  function p(t) { return '<p class="ca-p">' + t + "</p>"; }
  function callout(t) { return '<div class="rs-callout">' + t + "</div>"; }
  function note(t) { return '<div class="rs-note">' + t + "</div>"; }
  function illus(t) { return '<div class="sc-illus"><span class="sc-illus-dot" aria-hidden="true"></span>' + esc(t) + "</div>"; }
  function sec(id, label, title, inner) {
    return '<section class="ca-section ai-sec sc-sec" id="sc-sec-' + id + '" data-sc-label="' + esc(label) + '">' +
      '<div class="ca-h">' + esc(label) + "</div>" +
      (title ? '<h3 class="ca-sub sc-h2">' + esc(title) + "</h3>" : "") +
      inner + "</section>";
  }
  function table(cols, rows, foot) {
    var thead = "<thead><tr>" + cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead>";
    var tbody = "<tbody>" + rows.map(function (r) {
      return "<tr>" + r.map(function (v, i) { return (i === 0 ? '<th scope="row">' + v + "</th>" : "<td>" + v + "</td>"); }).join("") + "</tr>";
    }).join("") + "</tbody>";
    return '<div class="rs-tablewrap sc-tablewrap"><table class="rs-table sc-table">' + thead + tbody + "</table>" +
      (foot ? '<div class="rs-tnote">' + foot + "</div>" : "") + "</div>";
  }

  /* ---------- scoped styles ---------- */
  var STYLE = '<style id="sc-style">' + [
    /* theme tokens (green identity, matching the c3 card) on top of the shared article system */
    '.sc-article{--sc:#1f7a64;--sc-d:#14564a;--sc-ctrl:#8a93a0;--sc-soft:rgba(31,122,100,0.09);--sc-line:rgba(20,24,31,0.12);--sc-ink:#14181f;--sc-mut:#67707c;}',
    '.sc-article .ai-eq.sc-eq{border-left-color:var(--sc);} .sc-article .ai-eqx .katex{color:var(--sc-ink);}',
    '.sc-h2{max-width:30ch;}',
    /* sticky brand label in the controls bar */
    '.sc-brand{display:inline-flex;align-items:center;gap:8px;flex:none;font:800 11px "Archivo",sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:var(--sc);}',
    '.sc-brand i{width:9px;height:9px;border-radius:2px;background:var(--sc);display:inline-block;}',
    /* metric strip */
    '.sc-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:26px 0 6px;}',
    '.sc-mc{border:1px solid var(--sc-line);border-top:2px solid var(--sc);border-radius:11px;background:#fff;padding:14px 14px 13px;}',
    '.sc-mv{font:800 clamp(22px,2.4vw,30px)/1 "Archivo",sans-serif;letter-spacing:-0.02em;color:var(--sc-ink);font-variant-numeric:tabular-nums;}',
    '.sc-ml{font-size:11.5px;line-height:1.35;color:var(--sc-mut);margin-top:7px;}',
    /* two-column blocks */
    '.sc-split{display:grid;grid-template-columns:1.05fr 0.95fr;gap:24px;align-items:start;margin:22px 0;}',
    '.sc-split.rev{grid-template-columns:0.95fr 1.05fr;}',
    /* generic visual card */
    '.sc-vcard{border:1px solid var(--sc-line);border-radius:13px;background:#fff;padding:18px;}',
    '.sc-vh{font:700 12px "Archivo",sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--sc-ink);margin:0 0 14px;display:flex;align-items:center;gap:9px;}',
    '.sc-vh .sc-tag{font-size:10px;font-weight:800;letter-spacing:0.12em;color:#fff;background:var(--sc);border-radius:999px;padding:3px 9px;}',
    /* RCT-DiD static two-line diagram */
    '.sc-did{border:1px solid var(--sc-line);border-radius:13px;background:#fafbfc;padding:20px 18px;margin:18px 0;}',
    '.sc-did-lane{display:flex;align-items:stretch;gap:8px;flex-wrap:wrap;margin-bottom:12px;}',
    '.sc-did-lane:last-of-type{margin-bottom:0;}',
    '.sc-did-tag{flex:0 0 96px;display:flex;align-items:center;font:800 11px "Archivo",sans-serif;letter-spacing:0.04em;text-transform:uppercase;}',
    '.sc-did-tag.t{color:var(--sc);} .sc-did-tag.c{color:var(--sc-ctrl);}',
    '.sc-did-step{flex:1 1 0;min-width:96px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;font-weight:600;line-height:1.25;color:var(--sc-ink);background:#fff;border:1px solid var(--sc-line);border-radius:9px;padding:9px 8px;}',
    '.sc-did-step.glow{border-color:var(--sc);background:var(--sc-soft);}',
    '.sc-did-step.calm{color:var(--sc-mut);}',
    '.sc-did-step.res{font-weight:800;color:var(--sc);} .sc-did-step.res.c{color:var(--sc-ctrl);}',
    '.sc-did-arr{flex:0 0 auto;align-self:center;color:var(--sc-ctrl);font-size:13px;}',
    '.sc-did-final{margin-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;border-top:1px dashed var(--sc-line);padding-top:15px;}',
    '.sc-did-brace{font:800 13px "Archivo",sans-serif;color:var(--sc-ink);}',
    '.sc-did-eqp{font-family:"Times New Roman",serif;font-size:15px;color:var(--sc-ink);}',
    '.sc-did-eqp b{color:var(--sc);}',
    /* formula card wall */
    '.sc-fwall{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0;min-width:0;}',
    '.sc-fcard{border:1px solid var(--sc-line);border-radius:12px;background:#fff;padding:15px 15px 13px;border-top:2px solid var(--sc);display:flex;flex-direction:column;min-width:0;}',
    '.sc-fcard-h{font:800 13px "Archivo",sans-serif;color:var(--sc-ink);margin-bottom:4px;}',
    '.sc-fcard .ai-eq.sc-eq{margin:8px 0;padding:9px 11px;min-width:0;max-width:100%;}',
    '.sc-fcard .ai-eqx{min-width:0;overflow-x:auto;}',
    '.sc-fcard-n{font-size:11.5px;line-height:1.45;color:var(--sc-mut);margin-top:auto;padding-top:6px;}',
    /* DID flow animation (SVG, looping) */
    '.sc-flowanim{margin:6px 0 0;}',
    '.sc-flowanim svg{width:100%;height:auto;display:block;}',
    '.sc-fa-node rect{fill:#fff;stroke:var(--sc-line);stroke-width:1.4;}',
    '.sc-fa-node text{font:600 12px "Archivo",sans-serif;fill:var(--sc-ink);}',
    '.sc-fa-lab{font:800 11px "Archivo",sans-serif;letter-spacing:0.05em;text-transform:uppercase;}',
    '.sc-fa-token{fill:var(--sc);} .sc-fa-token.c{fill:var(--sc-ctrl);}',
    '.sc-fa-tok-g{animation:scTok 9s cubic-bezier(0.5,0,0.5,1) infinite;}',
    '.sc-fa-tok-g.c{animation-name:scTokC;}',
    '@keyframes scTok{0%{transform:translateX(0);opacity:0}3%{opacity:1}8%{transform:translateX(0)}22%{transform:translateX(160px)}30%{transform:translateX(160px)}44%{transform:translateX(330px)}52%{transform:translateX(330px)}66%{transform:translateX(500px)}74%{transform:translateX(500px)}88%{transform:translateX(640px)}96%{opacity:1;transform:translateX(640px)}100%{transform:translateX(640px);opacity:0}}',
    '@keyframes scTokC{0%{transform:translateX(0);opacity:0}3%{opacity:1}8%{transform:translateX(0)}22%{transform:translateX(160px)}30%{transform:translateX(160px)}44%{transform:translateX(330px)}52%{transform:translateX(330px)}66%{transform:translateX(500px)}74%{transform:translateX(500px)}88%{transform:translateX(640px)}96%{opacity:1;transform:translateX(640px)}100%{transform:translateX(640px);opacity:0}}',
    '.sc-fa-pulse{transform-box:fill-box;transform-origin:center;}',
    '.sc-fa-pre{animation:scP 9s ease-in-out infinite;} .sc-fa-mid{animation:scP 9s ease-in-out infinite;animation-delay:1.98s;} .sc-fa-post{animation:scP 9s ease-in-out infinite;animation-delay:3.96s;}',
    '@keyframes scP{0%,18%{stroke:var(--sc-line)}24%{stroke:var(--sc);stroke-width:2.4}34%,100%{stroke:var(--sc-line)}}',
    '.sc-fa-final{opacity:0;animation:scFin 9s ease-in-out infinite;}',
    '@keyframes scFin{0%,80%{opacity:0;transform:translateY(4px)}88%{opacity:1;transform:none}97%{opacity:1}100%{opacity:0}}',
    /* DID calculator */
    '.sc-calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start;}',
    '.sc-ctl{display:block;margin-bottom:13px;}',
    '.sc-ctl-row{display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px;color:var(--sc-ink);margin-bottom:5px;}',
    '.sc-ctl-row b{font:800 14px "Archivo",sans-serif;color:var(--sc);font-variant-numeric:tabular-nums;}',
    '.sc-ctl input[type=range]{width:100%;accent-color:var(--sc);height:4px;}',
    '.sc-ctl.ctrl .sc-ctl-row b{color:var(--sc-ctrl);} .sc-ctl.ctrl input[type=range]{accent-color:var(--sc-ctrl);}',
    '.sc-calc-out{display:flex;flex-direction:column;gap:9px;}',
    '.sc-or{display:flex;justify-content:space-between;align-items:baseline;border:1px solid var(--sc-line);border-radius:9px;padding:9px 12px;background:#fff;}',
    '.sc-or .k{font-size:12px;color:var(--sc-mut);} .sc-or .v{font:800 16px "Archivo",sans-serif;color:var(--sc-ink);font-variant-numeric:tabular-nums;}',
    '.sc-or.lead{border-color:var(--sc);background:var(--sc-soft);} .sc-or.lead .v{color:var(--sc);}',
    '.sc-calc-chart{margin-top:14px;border:1px solid var(--sc-line);border-radius:10px;background:#fafbfc;padding:6px;}',
    '.sc-calc-chart svg{width:100%;height:auto;display:block;}',
    '.sc-cc-t{stroke:var(--sc);stroke-width:2.6;fill:none;} .sc-cc-c{stroke:var(--sc-ctrl);stroke-width:2.6;fill:none;stroke-dasharray:5 5;}',
    '.sc-cc-dot{fill:#fff;stroke-width:2.4;} .sc-cc-dot.t{stroke:var(--sc);} .sc-cc-dot.c{stroke:var(--sc-ctrl);}',
    '.sc-cc-ax{stroke:var(--sc-line);stroke-width:1;} .sc-cc-axt{font:600 10px "Archivo",sans-serif;fill:var(--sc-mut);}',
    '.sc-cc-lab{font:700 10px "Archivo",sans-serif;}',
    /* game simulator */
    '.sc-tabs{display:inline-flex;border:1px solid var(--sc-line);border-radius:999px;overflow:hidden;background:#fff;margin-bottom:16px;}',
    '.sc-tabs button{font:700 12.5px "Archivo",sans-serif;color:var(--sc-mut);background:transparent;border:0;padding:8px 16px;cursor:pointer;transition:background .15s,color .15s;}',
    '.sc-tabs button.on{background:var(--sc);color:#fff;}',
    '.sc-game-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start;}',
    '.sc-game-formula{margin-top:12px;}',
    '.sc-game-pane[hidden]{display:none;}',
    /* field scale chart */
    '.sc-scale{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;}',
    '.sc-sc-cell{border:1px solid var(--sc-line);border-radius:11px;background:#fff;padding:13px 13px 14px;}',
    '.sc-sc-v{font:800 clamp(20px,2.2vw,26px)/1 "Archivo",sans-serif;color:var(--sc-ink);font-variant-numeric:tabular-nums;}',
    '.sc-sc-l{font-size:11px;line-height:1.35;color:var(--sc-mut);margin:6px 0 9px;}',
    '.sc-sc-bar{height:5px;border-radius:3px;background:rgba(20,24,31,0.07);overflow:hidden;}',
    '.sc-sc-bar i{display:block;height:100%;background:var(--sc);border-radius:3px;}',
    /* donut + bars */
    '.sc-charts2{display:grid;grid-template-columns:0.8fr 1.2fr;gap:18px;align-items:center;margin-top:14px;}',
    '.sc-donut-wrap{display:flex;align-items:center;gap:16px;}',
    '.sc-donut{width:130px;height:130px;flex:none;}',
    '.sc-leg{display:flex;flex-direction:column;gap:7px;font-size:12px;color:var(--sc-ink);}',
    '.sc-leg span{display:inline-flex;align-items:center;gap:7px;}',
    '.sc-leg i{width:10px;height:10px;border-radius:2px;display:inline-block;}',
    '.sc-leg b{margin-left:auto;font-variant-numeric:tabular-nums;color:var(--sc-mut);font-weight:700;}',
    '.sc-bars{display:flex;flex-direction:column;gap:11px;}',
    '.sc-bar-row{display:grid;grid-template-columns:1fr;gap:5px;}',
    '.sc-bar-top{display:flex;justify-content:space-between;font-size:12px;color:var(--sc-ink);}',
    '.sc-bar-top b{font-weight:800;font-variant-numeric:tabular-nums;}',
    '.sc-bar-track{height:14px;border-radius:4px;background:rgba(20,24,31,0.06);overflow:hidden;}',
    '.sc-bar-track i{display:block;height:100%;background:linear-gradient(90deg,var(--sc),var(--sc-d));border-radius:4px;}',
    /* network formation animation */
    '.sc-net{margin:6px 0 0;}',
    '.sc-net svg{width:100%;height:auto;display:block;}',
    '.sc-net .n-node{transform-box:fill-box;transform-origin:center;opacity:0;animation:scNetNodeK 11s ease-in-out infinite;}',
    '.sc-net .n-node circle,.sc-net .n-node rect{fill:#fff;stroke:var(--sc);stroke-width:1.6;}',
    '.sc-net .n-node.plat rect{fill:var(--sc-soft);stroke:var(--sc-d);}',
    '.sc-net .n-node text{font:600 10px "Archivo",sans-serif;fill:var(--sc-ink);opacity:0.92;}',
    '.sc-net .n-edge{stroke:var(--sc);stroke-width:1.5;fill:none;stroke-dasharray:1;stroke-dashoffset:1;opacity:0.55;animation:scNetEdgeK 11s ease-in-out infinite;}',
    '.sc-net .n-part{fill:var(--sc-d);opacity:0;animation:scNetPartK 11s linear infinite;}',
    '.sc-net .n-dlab{font:700 9.5px "Archivo",sans-serif;fill:var(--sc-d);opacity:0;animation:scNetLabK 11s ease-in-out infinite;}',
    /* node/edge/particle timing set inline via animation-delay */
    '@keyframes scNetNodeK{0%{opacity:0;transform:scale(0.5)}6%{opacity:1;transform:scale(1)}88%{opacity:1}96%{opacity:0}100%{opacity:0}}',
    '@keyframes scNetEdgeK{0%{stroke-dashoffset:1;opacity:0}10%{opacity:0.55}30%{stroke-dashoffset:0}88%{stroke-dashoffset:0;opacity:0.55}96%{opacity:0}100%{opacity:0}}',
    '@keyframes scNetPartK{0%,40%{opacity:0;offset-distance:0%}46%{opacity:0.9}88%{opacity:0.9}100%{opacity:0;offset-distance:100%}}',
    '@keyframes scNetLabK{0%,55%{opacity:0}62%{opacity:1}86%{opacity:1}96%{opacity:0}100%{opacity:0}}',
    /* funnel */
    '.sc-funnel{display:flex;flex-direction:column;gap:9px;margin:16px 0;}',
    '.sc-fn{position:relative;margin:0 auto;border-radius:9px;color:#fff;padding:14px 18px;text-align:center;background:var(--sc);}',
    '.sc-fn:nth-child(1){width:100%;} .sc-fn:nth-child(2){width:80%;background:#2a8a72;} .sc-fn:nth-child(3){width:62%;background:#338f78;} .sc-fn:nth-child(4){width:100%;background:#fff;color:var(--sc-ink);border:1px dashed var(--sc);}',
    '.sc-fn-k{font:800 11px "Archivo",sans-serif;letter-spacing:0.08em;text-transform:uppercase;opacity:0.92;}',
    '.sc-fn-v{font:800 17px "Archivo",sans-serif;margin-top:3px;}',
    '.sc-fn-s{font-size:12px;margin-top:2px;opacity:0.9;}',
    '.sc-fn:nth-child(4) .sc-fn-flow{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;margin-top:8px;}',
    '.sc-fn-flow span{font:600 11.5px "Archivo",sans-serif;color:var(--sc-d);background:var(--sc-soft);border-radius:7px;padding:5px 10px;}',
    /* data explorer */
    '.sc-exp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}',
    '.sc-exp-chip{font:700 12.5px "Archivo",sans-serif;color:var(--sc-ink);background:#fff;border:1px solid var(--sc-line);border-radius:999px;padding:7px 14px;cursor:pointer;transition:all .15s;}',
    '.sc-exp-chip:hover{border-color:var(--sc);}',
    '.sc-exp-chip.on{background:var(--sc);color:#fff;border-color:var(--sc);}',
    '.sc-exp-panel{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}',
    '.sc-exp-col .k{font:800 10.5px "Archivo",sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--sc);margin-bottom:7px;}',
    '.sc-exp-col .b{font-size:13px;line-height:1.5;color:var(--sc-ink);}',
    '.sc-exp-col.var .b{font-family:"Times New Roman",serif;font-style:italic;color:var(--sc-d);}',
    /* tables */
    '.sc-table th[scope=row]{font-weight:700;color:var(--sc-ink);text-align:left;}',
    '.sc-tablewrap{margin:16px 0;}',
    /* illustrative label */
    '.sc-illus{display:inline-flex;align-items:center;gap:8px;font:700 11px "Archivo",sans-serif;letter-spacing:0.03em;color:var(--sc-mut);background:rgba(20,24,31,0.04);border:1px solid var(--sc-line);border-radius:999px;padding:5px 12px;margin-top:12px;}',
    '.sc-illus-dot{width:7px;height:7px;border-radius:50%;background:var(--sc);}',
    '.sc-copyright{font-size:12px;line-height:1.55;color:var(--sc-mut);margin-top:14px;padding:12px 14px;border-left:3px solid var(--sc);background:var(--sc-soft);border-radius:0 8px 8px 0;}',
    '.sc-copyright b{color:var(--sc-ink);}',
    /* responsive */
    '@media (max-width:760px){',
    '.sc-metrics,.sc-scale{grid-template-columns:repeat(2,1fr);}',
    '.sc-fwall{grid-template-columns:1fr;}',
    '.sc-split,.sc-split.rev,.sc-calc-grid,.sc-game-grid,.sc-charts2,.sc-exp-panel{grid-template-columns:1fr;}',
    '.sc-did-tag{flex-basis:100%;}',
    '}',
    /* reduced motion: freeze animations on a readable final state */
    '@media (prefers-reduced-motion: reduce){',
    '.sc-fa-tok-g,.sc-fa-pulse,.sc-fa-final,.sc-net .n-node,.sc-net .n-edge,.sc-net .n-part,.sc-net .n-dlab{animation:none !important;}',
    '.sc-fa-tok-g{opacity:0 !important;} .sc-fa-final{opacity:1 !important;transform:none !important;}',
    '.sc-net .n-node{opacity:1 !important;transform:none !important;} .sc-net .n-edge{stroke-dashoffset:0 !important;opacity:0.55 !important;} .sc-net .n-dlab{opacity:1 !important;}',
    '}'
  ].join("\n") + "</style>";

  /* ---------- bespoke visuals ---------- */

  function metricStrip() {
    var M = [
      ["6,311+", "Cumulative volunteers"],
      ["170", "Rural teachers served"],
      ["2,000+", "Rural students reached"],
      ["1,714", "Volunteers recruited, Fall 2024"],
      ["31", "Provinces and regions represented"],
      ["394", "Tutoring requests, Zheng'an pilot"],
      ["29", "Tutoring projects formed"],
      ["300+", "Students in formed projects"]
    ];
    return '<div class="sc-metrics">' + M.map(function (x) {
      return '<div class="sc-mc"><div class="sc-mv ca-cu">' + x[0] + '</div><div class="sc-ml">' + x[1] + "</div></div>";
    }).join("") + "</div>";
  }

  function didStaticDiagram() {
    function lane(tag, cls, steps) {
      return '<div class="sc-did-lane"><div class="sc-did-tag ' + cls + '">' + tag + "</div>" +
        steps.map(function (s, i) {
          return (i ? '<span class="sc-did-arr" aria-hidden="true">&#8594;</span>' : "") + '<div class="sc-did-step ' + (s[1] || "") + '">' + s[0] + "</div>";
        }).join("") + "</div>";
    }
    return '<div class="sc-did">' +
      lane("Treatment", "t", [["Treatment group", ""], ["Pre-test games", ""], ["Tutoring network", "glow"], ["Post-test games", ""], ["Treatment change", "res"]]) +
      lane("Control", "c", [["Control group", "calm"], ["Pre-test games", ""], ["No tutoring exposure", "calm"], ["Post-test games", ""], ["Control change", "res c"]]) +
      '<div class="sc-did-final"><span class="sc-did-brace">DID estimate</span>' +
      '<span class="sc-did-eqp"><b>Treatment change</b> &#8722; <span style="color:var(--sc-ctrl)">Control change</span></span></div>' +
      "</div>";
  }

  function didFlowAnim() {
    var stages = [
      { x: 60, t: "Start" }, { x: 220, t: "Pre" }, { x: 390, t: "Treat / hold" }, { x: 560, t: "Post" }, { x: 700, t: "Change" }
    ];
    var W = 740, H = 200, yT = 66, yC = 134;
    function nodeRect(x, y, label, pulseCls) {
      return '<g class="sc-fa-node"><rect class="sc-fa-pulse ' + (pulseCls || "") + '" x="' + (x - 46) + '" y="' + (y - 16) + '" width="92" height="32" rx="8"/>' +
        '<text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle">' + label + "</text></g>";
    }
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Looping RCT-DiD flow: treatment and control groups move through pre-test games, exposure, and post-test games to a DID estimate.">';
    /* lane baselines */
    svg += '<line x1="60" y1="' + yT + '" x2="640" y2="' + yT + '" stroke="rgba(31,122,100,0.25)" stroke-width="1.4"/>';
    svg += '<line x1="60" y1="' + yC + '" x2="640" y2="' + yC + '" stroke="rgba(138,147,160,0.3)" stroke-width="1.4"/>';
    /* lane labels */
    svg += '<text class="sc-fa-lab" x="60" y="34" fill="#1f7a64">Treatment</text>';
    svg += '<text class="sc-fa-lab" x="60" y="178" fill="#8a93a0">Control</text>';
    /* nodes: pre / mid / post on each lane */
    svg += nodeRect(220, yT, "Pre-test", "sc-fa-pre") + nodeRect(220, yC, "Pre-test", "sc-fa-pre");
    svg += nodeRect(390, yT, "Tutoring", "sc-fa-mid") + nodeRect(390, yC, "No exposure", "sc-fa-mid");
    svg += nodeRect(560, yT, "Post-test", "sc-fa-post") + nodeRect(560, yC, "Post-test", "sc-fa-post");
    /* traveling tokens (start at x=60) */
    svg += '<g class="sc-fa-tok-g"><circle class="sc-fa-token" cx="60" cy="' + yT + '" r="7"/></g>';
    svg += '<g class="sc-fa-tok-g c"><circle class="sc-fa-token c" cx="60" cy="' + yC + '" r="7"/></g>';
    /* final DID bracket */
    svg += '<g class="sc-fa-final"><rect x="624" y="' + (yT - 18) + '" width="96" height="' + (yC - yT + 36) + '" rx="9" fill="rgba(31,122,100,0.08)" stroke="#1f7a64" stroke-width="1.4"/>' +
      '<text x="672" y="' + (H / 2 - 4) + '" text-anchor="middle" font="700 12px Archivo" style="font:800 12px Archivo,sans-serif" fill="#14564a">&#964;_DID</text>' +
      '<text x="672" y="' + (H / 2 + 13) + '" text-anchor="middle" style="font:600 9.5px Archivo,sans-serif" fill="#67707c">= T &#8722; C</text></g>';
    svg += "</svg>";
    return '<div class="sc-flowanim">' + svg + "</div>";
  }

  function formulaWall() {
    return '<div class="sc-fwall">' +
      '<div class="sc-fcard"><div class="sc-fcard-h">DID Estimator</div>' +
        eq(String.raw`\tau_{DID} = \big[\mathbb{E}(Y_{post}\!\mid\! D{=}1) - \mathbb{E}(Y_{pre}\!\mid\! D{=}1)\big] - \big[\mathbb{E}(Y_{post}\!\mid\! D{=}0) - \mathbb{E}(Y_{pre}\!\mid\! D{=}0)\big]`) +
        '<div class="sc-fcard-n">Relative behavioral change between treatment and control groups.</div></div>' +
      '<div class="sc-fcard"><div class="sc-fcard-h">Trust Game</div>' +
        eq(String.raw`Trust_i = \dfrac{Send_i}{Endowment_i}`) +
        eq(String.raw`Trustworthiness_i = \dfrac{Return_i}{m \times Send_i}`) +
        '<div class="sc-fcard-n">Transfers measure trust; returns measure trustworthiness and reciprocity.</div></div>' +
      '<div class="sc-fcard"><div class="sc-fcard-h">Public Goods Game</div>' +
        eq(String.raw`Cooperation_i = \dfrac{Contribution_i}{Endowment_i}`) +
        eq(String.raw`\pi_i = Endowment_i - Contribution_i + MPCR \times \textstyle\sum_j Contribution_j`) +
        '<div class="sc-fcard-n">Contributions measure cooperation under free-riding incentives.</div></div>' +
      "</div>";
  }

  function didCalculator() {
    return '<div class="sc-vcard" data-sc-did-calc="1">' +
      '<div class="sc-vh"><span class="sc-tag">Interactive</span>DID estimator</div>' +
      '<div class="sc-calc-grid">' +
        '<div class="sc-calc-controls">' +
          ctl("Treatment pre", "tpre", 0.42, "") + ctl("Treatment post", "tpost", 0.56, "") +
          ctl("Control pre", "cpre", 0.41, "ctrl") + ctl("Control post", "cpost", 0.45, "ctrl") +
        '</div>' +
        '<div class="sc-calc-out">' +
          '<div class="sc-or"><span class="k">Treatment change</span><span class="v" data-out="tchg">0.14</span></div>' +
          '<div class="sc-or"><span class="k">Control change</span><span class="v" data-out="cchg">0.04</span></div>' +
          '<div class="sc-or lead"><span class="k">DID estimate</span><span class="v" data-out="did">0.10</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sc-calc-chart"><svg viewBox="0 0 360 150" data-sc-chart="1" aria-hidden="true"></svg></div>' +
      illus("Illustrative model; not final empirical estimates.") +
      "</div>";
    function ctl(label, key, val, cls) {
      return '<label class="sc-ctl ' + cls + '"><span class="sc-ctl-row">' + label + '<b data-out="' + key + '">' + val.toFixed(2) + '</b></span>' +
        '<input type="range" min="0" max="1" step="0.01" value="' + val + '" data-in="' + key + '"></label>';
    }
  }

  function gameSimulator() {
    return '<div class="sc-vcard" data-sc-games="1">' +
      '<div class="sc-vh"><span class="sc-tag">Interactive</span>Behavioral game simulator</div>' +
      '<div class="sc-tabs" role="tablist">' +
        '<button type="button" class="on" data-tab="trust">Trust Game</button>' +
        '<button type="button" data-tab="pgg">Public Goods Game</button>' +
      '</div>' +
      /* Trust pane */
      '<div class="sc-game-pane" data-pane="trust"><div class="sc-game-grid">' +
        '<div>' +
          gctl("Endowment", "g_endow", 100, 1, 200, 1) +
          gctl("Multiplier m", "g_m", 3, 1, 5, 0.1) +
          gctl("Send amount", "g_send", 40, 0, 100, 1) +
          gctl("Return amount", "g_return", 60, 0, 300, 1) +
        '</div>' +
        '<div class="sc-calc-out">' +
          '<div class="sc-or"><span class="k">Received by second mover</span><span class="v" data-out="t_recv">120</span></div>' +
          '<div class="sc-or lead"><span class="k">Trust</span><span class="v" data-out="t_trust">0.40</span></div>' +
          '<div class="sc-or lead"><span class="k">Trustworthiness</span><span class="v" data-out="t_tw">0.50</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sc-game-formula">' + eq(String.raw`Trust_i = \dfrac{Send_i}{Endowment_i}, \qquad Trustworthiness_i = \dfrac{Return_i}{m \times Send_i}`) + '</div>' +
      illus("Illustrative model; not final experimental parameters.") +
      '</div>' +
      /* PGG pane */
      '<div class="sc-game-pane" data-pane="pgg" hidden><div class="sc-game-grid">' +
        '<div>' +
          gctl("Endowment", "p_endow", 100, 1, 200, 1) +
          gctl("Contribution", "p_contrib", 35, 0, 100, 1) +
          gctl("Group total contribution", "p_group", 160, 0, 500, 1) +
          gctl("MPCR", "p_mpcr", 0.5, 0, 1, 0.05) +
        '</div>' +
        '<div class="sc-calc-out">' +
          '<div class="sc-or lead"><span class="k">Cooperation</span><span class="v" data-out="p_coop">0.35</span></div>' +
          '<div class="sc-or"><span class="k">Payoff</span><span class="v" data-out="p_pay">145</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="sc-game-formula">' + eq(String.raw`Cooperation_i = \dfrac{Contribution_i}{Endowment_i}, \qquad \pi_i = Endowment_i - Contribution_i + MPCR \times \textstyle\sum_j Contribution_j`) + '</div>' +
      illus("Illustrative model; not final experimental parameters.") +
      '</div>' +
      "</div>";
    function gctl(label, key, val, min, max, step) {
      var dec = step < 1 ? 2 : 0;
      return '<label class="sc-ctl"><span class="sc-ctl-row">' + label + '<b data-out="' + key + '">' + (dec ? val.toFixed(dec) : val) + '</b></span>' +
        '<input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" data-in="' + key + '" data-dec="' + dec + '"></label>';
    }
  }

  function fieldScale() {
    var rows = [
      ["6,311+", "Cumulative volunteers", 100],
      ["1,714", "Volunteers, Fall 2024", 27],
      ["2,000+", "Rural students reached", 32],
      ["394", "Zheng'an tutoring requests", 6.2],
      ["300+", "Students in formed projects", 4.8],
      ["170", "Rural teachers served", 2.7],
      ["31", "Provinces and regions", 0.5],
      ["29", "Zheng'an projects formed", 0.46]
    ];
    return '<div class="sc-vcard"><div class="sc-vh">Field Scale of the Experimental Setting</div>' +
      '<div class="sc-scale">' + rows.map(function (r) {
        return '<div class="sc-sc-cell"><div class="sc-sc-v ca-cu">' + r[0] + '</div><div class="sc-sc-l">' + r[1] + '</div>' +
          '<div class="sc-sc-bar"><i style="width:' + Math.max(4, r[2]) + '%"></i></div></div>';
      }).join("") + "</div>" +
      note("Scale shown as separate metric cards. Values use different units and are not placed on a single comparative axis.") +
      "</div>";
  }

  function donutAndBars() {
    /* degree composition donut */
    var seg = [
      ["Undergraduate", 93, "#1f7a64"],
      ["Other", 3.9, "#7bb8a6"],
      ["Master's", 3, "#338f78"],
      ["PhD", 0.1, "#cfe3dc"]
    ];
    var C = 2 * Math.PI * 52, off = 0, arcs = "";
    seg.forEach(function (s) {
      var len = C * (s[1] / 100);
      arcs += '<circle cx="65" cy="65" r="52" fill="none" stroke="' + s[2] + '" stroke-width="20" stroke-dasharray="' + len.toFixed(2) + " " + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 65 65)"/>';
      off += len;
    });
    var donut = '<svg class="sc-donut" viewBox="0 0 130 130" role="img" aria-label="Fall 2024 volunteer degree composition donut chart">' + arcs +
      '<circle cx="65" cy="65" r="34" fill="#fff"/><text x="65" y="62" text-anchor="middle" style="font:800 19px Archivo,sans-serif" fill="#14181f">93%</text>' +
      '<text x="65" y="78" text-anchor="middle" style="font:600 9px Archivo,sans-serif" fill="#67707c">Undergrad</text></svg>';
    var leg = '<div class="sc-leg">' + seg.map(function (s) {
      return '<span><i style="background:' + s[2] + '"></i>' + s[0] + '<b>' + s[1] + '%</b></span>';
    }).join("") + "</div>";

    var bars = [["Beijing Normal University Zhuhai", 170], ["Nankai University", 125], ["Qilu University of Technology", 106]];
    var maxB = 170;
    var barHtml = '<div class="sc-bars">' + bars.map(function (b) {
      return '<div class="sc-bar-row"><div class="sc-bar-top"><span>' + b[0] + '</span><b>' + b[1] + '</b></div>' +
        '<div class="sc-bar-track"><i style="width:' + (b[1] / maxB * 100).toFixed(1) + '%"></i></div></div>';
    }).join("") + "</div>";

    return '<div class="sc-split">' +
      '<div class="sc-vcard"><div class="sc-vh">Fall 2024 Volunteer Degree Composition</div>' +
        '<div class="sc-donut-wrap">' + donut + leg + "</div></div>" +
      '<div class="sc-vcard"><div class="sc-vh">Top University Contributors, Fall 2024</div>' + barHtml + "</div>" +
      "</div>";
  }

  function networkAnim() {
    var W = 760, H = 320;
    var nodes = [
      { x: 70, y: 160, r: 22, t: "Teacher", d: 0.2 },
      { x: 205, y: 160, r: 22, t: "Supervisor", d: 1.0 },
      { x: 350, y: 80, r: 18, t: "Leader", d: 1.8 }, { x: 350, y: 160, r: 18, t: "Leader", d: 2.0 }, { x: 350, y: 240, r: 18, t: "Leader", d: 2.2 },
      { x: 510, y: 60, r: 16, t: "Vol.", d: 3.0 }, { x: 510, y: 120, r: 16, t: "Vol.", d: 3.2 }, { x: 510, y: 200, r: 16, t: "Vol.", d: 3.4 }, { x: 510, y: 260, r: 16, t: "Vol.", d: 3.6 },
      { x: 670, y: 90, r: 16, t: "Student", d: 4.4 }, { x: 670, y: 160, r: 16, t: "Student", d: 4.6 }, { x: 670, y: 240, r: 16, t: "Student", d: 4.8 }
    ];
    var edges = [
      [0, 1, 1.4], [1, 2, 2.2], [1, 3, 2.3], [1, 4, 2.4],
      [2, 5, 3.4], [3, 6, 3.5], [3, 7, 3.6], [4, 8, 3.7],
      [5, 9, 4.8], [6, 9, 4.9], [7, 10, 5.0], [8, 11, 5.1]
    ];
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Looping network formation: teacher demand to project supervisor to team leaders to volunteers to students, with data flowing back to a platform data layer.">';
    /* column captions */
    [["Rural teacher", 70], ["Project supervisor", 205], ["Team leaders", 350], ["Volunteers", 510], ["Students", 670]].forEach(function (c) {
      svg += '<text x="' + c[1] + '" y="22" text-anchor="middle" style="font:800 10px Archivo,sans-serif;letter-spacing:0.04em;text-transform:uppercase" fill="#67707c">' + c[0] + "</text>";
    });
    /* edges */
    edges.forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      svg += '<path class="n-edge" pathLength="1" style="animation-delay:' + e[2] + 's" d="M' + a.x + "," + a.y + " L" + b.x + "," + b.y + '"/>';
    });
    /* platform node (bottom) */
    var platY = 296;
    svg += '<g class="n-node plat" style="animation-delay:0.4s"><rect x="280" y="' + (platY - 16) + '" width="200" height="30" rx="15"/><text x="380" y="' + (platY + 4) + '" text-anchor="middle" style="font:700 11px Archivo,sans-serif">Platform data layer</text></g>';
    /* data particles flowing back from volunteers/students region to the platform */
    [[510, 200, 3], [670, 160, 3.4], [350, 160, 2.6]].forEach(function (s, i) {
      svg += '<circle class="n-part" r="3.5" style="offset-path:path(\'M' + s[0] + "," + s[1] + " L380," + platY + '\');animation-delay:' + s[2] + 's"/>';
    });
    /* data labels near platform */
    ["service logs", "feedback forms", "weekly reports", "matching links"].forEach(function (l, i) {
      svg += '<text class="n-dlab" x="' + (300 + i * 0) + '" y="' + (platY - 26 - (i % 2) * 14) + '" style="animation-delay:' + (5.4 + i * 0.25) + 's" text-anchor="middle" transform="translate(' + (180 + i * 120) + ',0)">' + l + "</text>";
    });
    /* nodes on top */
    nodes.forEach(function (n) {
      svg += '<g class="n-node" style="animation-delay:' + n.d + 's"><circle cx="' + n.x + '" cy="' + n.y + '" r="' + n.r + '"/>' +
        '<text x="' + n.x + '" y="' + (n.y + 3.5) + '" text-anchor="middle">' + n.t + "</text></g>";
    });
    svg += "</svg>";
    return '<div class="sc-net">' + svg + "</div>";
  }

  function pilotFunnel() {
    return '<div class="sc-funnel">' +
      '<div class="sc-fn"><div class="sc-fn-k">Field intake</div><div class="sc-fn-v ca-cu">394</div><div class="sc-fn-s">student tutoring requests from four schools</div></div>' +
      '<div class="sc-fn"><div class="sc-fn-k">Project formation</div><div class="sc-fn-v ca-cu">29</div><div class="sc-fn-s">tutoring projects formed</div></div>' +
      '<div class="sc-fn"><div class="sc-fn-k">Matched project pool</div><div class="sc-fn-v ca-cu">300+</div><div class="sc-fn-s">students included in formed projects</div></div>' +
      '<div class="sc-fn"><div class="sc-fn-k">Research process</div><div class="sc-fn-flow"><span>Baseline measurement</span><span>Tutoring intervention</span><span>Follow-up measurement</span></div></div>' +
      "</div>";
  }

  function dataExplorer() {
    return '<div class="sc-vcard" data-sc-explorer="1">' +
      '<div class="sc-vh"><span class="sc-tag">Interactive</span>Data source explorer</div>' +
      '<div class="sc-exp-chips"></div>' +
      '<div class="sc-exp-panel"></div>' +
      note("Platform records support implementation tracking; behavioral outcomes remain measured through the research protocol.") +
      "</div>";
  }

  function variableTable() {
    return table(
      ["Construct", "Behavioral measure", "Formula / proxy", "Data source", "Research use"],
      [
        ["Trust", "Trust Game transfer", m(String.raw`Send/Endowment`), "Game outcome", "Willingness to expose resources to another participant"],
        ["Trustworthiness", "Trust Game return", m(String.raw`Return/Received`), "Game outcome", "Reciprocal response to received trust"],
        ["Cooperation", "Public Goods contribution", m(String.raw`Contribution/Endowment`), "Game outcome", "Contribution under free-riding incentives"],
        ["Network exposure", "Shared team, supervisor, school, teacher, or project", m(String.raw`A_{ij}\ \text{links}`), "Platform and survey", "Network structure and social proximity"],
        ["Participation intensity", "Service frequency, duration, logs", m(String.raw`\textstyle\sum\ \text{service records}`), "Platform logs", "Actual treatment intensity"],
        ["Monitoring intensity", "Weekly and supervisor reports, feedback", m(String.raw`\text{reports}/\text{cycle}`), "Platform records", "Implementation quality and compliance"]
      ],
      "Datasets and identities are de-identified for research use."
    );
  }

  function platformMatrix() {
    return table(
      ["Platform layer", "Observed data", "Research use"],
      [
        ["Teacher demand", "Subject, grade, school, demand status", "Matching context and project formation"],
        ["Project management", "Project, team, leader, project status", "Treatment implementation and project fixed effects"],
        ["Volunteer logs", "Service time, service content, submission time", "Treatment intensity and compliance"],
        ["Feedback forms", "Teacher feedback, volunteer feedback, evaluation", "Process quality and perceived effectiveness"],
        ["Weekly reports", "Team-leader reports, supervisor biweekly reports", "Monitoring intensity and group-level supervision"],
        ["User roles", "Teacher, volunteer, team leader, supervisor, student", "Network structure and role-based interaction"]
      ]
    );
  }

  /* ---------- article ---------- */
  window.__socialCapitalArticle = function (data) {
    var H = STYLE;

    /* sticky controls (brand + section index) + progress bar */
    H += '<div class="ai-controls sc-controls" data-sc-controls="1">' +
      '<span class="sc-brand"><i></i>RCT-DiD Field Study</span>' +
      '<nav class="ai-index" aria-label="Section index"></nav>' +
      "</div>";
    H += '<div class="ai-progress" data-sc-progress="1"><i></i></div>';

    /* HERO */
    H += '<section class="ca-section ai-sec sc-sec sc-hero" id="sc-sec-hero" data-sc-label="Overview">' +
      '<div class="ca-kicker">Behavioral &amp; Field Economics</div>' +
      '<h1 class="ca-title">Social Capital Formation in Tutoring Networks</h1>' +
      '<div class="ai-role">RA to Prof. Hongru Tan</div>' +
      '<div class="ca-ymeta">Behavioral economics &middot; RCT-DiD &middot; Trust and public-goods games &middot; Platform-generated field data</div>' +
      p("A behavioral field experiment designed to identify how structured online tutoring networks shape trust, reciprocity, and cooperation.") +
      p("This study treats online tutoring not as a charitable endpoint, but as a real-world field setting for experimental economics. The project combines randomized assignment, pre- and post-intervention behavioral games, platform-generated interaction data, and Difference-in-Differences estimation to study whether repeated social engagement can build measurable social capital among university volunteers.") +
      p("The design connects three layers: game-theoretic measurement, field implementation, and causal identification. Trust and reciprocity are measured through Trust Games. Cooperation is measured through Public Goods Games. The tutoring network provides the treatment environment of repeated interaction, matching frictions, supervision, peer groups, service logs, and multi-level coordination across students, teachers, volunteers, team leaders, and project supervisors.") +
      metricStrip() +
      '<div class="sc-ml" style="margin-top:10px">Field figures describe the scale of the tutoring program. They support the claim that the setting is large enough to function as a real research environment.</div>' +
      "</section>";

    /* 1 — RESEARCH QUESTION */
    H += sec("question", "Research Question", "Can Structured Participation Create Social Capital?",
      p("The central question is whether structured social participation can create social capital.") +
      p("Social capital is not measured as a self-reported attitude alone. It is translated into behavioral outcomes: trust, trustworthiness, reciprocity, and cooperation. The study asks whether participation in a structured tutoring network changes how university volunteers allocate resources, respond to others' trust, and contribute to collective outcomes.") +
      p("The tutoring environment suits this question because it contains repeated interaction under real constraints. Volunteers are matched to students and teachers, grouped under team leaders, monitored through service logs, and embedded in a network that requires coordination, responsibility, and sustained communication. These features place the setting closer to a labor-market and social-network environment than to a one-time volunteer activity.") +
      '<div class="sc-fwall" style="grid-template-columns:1fr"><div class="sc-fcard"><div class="sc-fcard-h">Concept to behavior</div>' +
        eq(String.raw`\text{Social capital} \;\longrightarrow\; \{\,Trust,\ Trustworthiness,\ Reciprocity,\ Cooperation\,\}`) +
        '<div class="sc-fcard-n">Each construct is operationalized as an observable choice in a behavioral game.</div></div></div>');

    /* 2 — IDENTIFICATION */
    H += sec("identification", "Identification", "RCT-DiD Design",
      p("The study is structured as a randomized field experiment with a Difference-in-Differences estimation strategy.") +
      p("Participants are divided into a treatment group and a control group. Both groups complete baseline data collection before the tutoring intervention, covering demographic information, existing social-network characteristics, and behavioral-game outcomes. The treatment group then participates in the tutoring program, while the control group does not participate during the same period. After the intervention, both groups complete the same behavioral measurements again.") +
      didStaticDiagram() +
      didFlowAnim() +
      illus("Looping schematic of the RCT-DiD flow; no empirical magnitudes shown.") +
      p("The estimand is the relative change in behavioral outcomes between the two groups over the same period. The comparison does not rely on whether treated participants look more cooperative after the program; it estimates whether the treated group changes more than the control group.") +
      eq(String.raw`\tau_{DID} = \big[\mathbb{E}(Y_{post}\!\mid\! D{=}1) - \mathbb{E}(Y_{pre}\!\mid\! D{=}1)\big] - \big[\mathbb{E}(Y_{post}\!\mid\! D{=}0) - \mathbb{E}(Y_{pre}\!\mid\! D{=}0)\big]`, "DID") +
      formulaWall() +
      didCalculator() +
      p("The panel regression specification carries the same logic with individual and time controls:") +
      eq(String.raw`Y_{it} = \alpha + \beta\,(Treatment_i \times Post_t) + \gamma_i + \delta_t + X_i'\theta + \varepsilon_{it}`, "REG") +
      p("Here " + m(String.raw`\beta`) + " is the estimated treatment effect on trust, trustworthiness, reciprocity, or cooperation. The design is built to identify changes in social capital associated with structured participation, rather than to describe correlations between volunteering and prosocial preferences.") +
      callout("<b>The design separates treatment effects from baseline differences and common time trends.</b>"));

    /* 3 — GAME-THEORETIC MEASUREMENT */
    H += sec("measurement", "Game-Theoretic Measurement", "Outcomes Measured as Strategic Choices",
      p("The outcome variables are measured through behavioral games rather than survey responses alone.") +
      p("In the Trust Game, the first mover's transfer measures trust, and the second mover's return measures trustworthiness and reciprocity. These choices convert social capital into observable strategic behavior. A larger first-mover transfer reveals greater willingness to expose resources to another person's decision; a larger second-mover return reveals a stronger reciprocal response to received trust.") +
      eq(String.raw`Trust_i = \dfrac{Send_i}{Endowment_i}, \qquad Trustworthiness_i = \dfrac{Return_i}{m \times Send_i}\ \ \text{if}\ Send_i > 0`, "TG") +
      p("In the Public Goods Game, individual contribution to a shared pool measures cooperation under free-riding incentives. The game captures whether participants sacrifice private payoff for group outcomes when individual incentives and collective welfare diverge.") +
      eq(String.raw`Cooperation_i = \dfrac{Contribution_i}{Endowment_i}, \qquad \pi_i = Endowment_i - Contribution_i + MPCR \times \textstyle\sum_j Contribution_j`, "PGG") +
      gameSimulator() +
      p("The pre-post structure tracks these behavioral outcomes over time. The RCT-DiD framework then compares whether exposure to the tutoring network changes strategic behavior more than the control condition."));

    /* 4 — FIELD SETTING */
    H += sec("field", "Field Setting", "A Large-Scale Tutoring Network",
      p("The Shanhai tutoring system provides the field setting for the experiment.") +
      p("The network is built around multi-sided matching. Rural teachers submit tutoring needs. Project supervisors allocate demand into projects. Team leaders manage volunteer groups. Volunteers provide recurring online tutoring to students and record service activity. This structure creates a real coordination environment with matching, monitoring, feedback, and repeated communication.") +
      fieldScale() +
      p("The field scale is material. The broader project has trained more than 6,311 volunteers and served 170 teachers and over 2,000 rural students. In Fall 2024 alone, 1,714 volunteers were recruited across 31 provinces and regions. The Zheng'an pilot collected 394 student tutoring requests from four schools, formed 29 projects, and included more than 300 students in formed tutoring projects.") +
      donutAndBars() +
      p("This scale supports the research design. It provides a large participant pool, observable network formation, variation in team structure, and repeated interaction across different schools, teachers, student needs, and volunteer groups. The setting therefore supports questions in behavioral economics, labor allocation, social networks, matching, and field-based causal inference.") +
      '<div class="sc-vcard" style="margin-top:18px"><div class="sc-vh">Network Formation in the Field</div>' + networkAnim() +
      '<div class="rs-cap" style="margin-top:10px">Looping schematic. The field study takes place inside a real multi-sided matching network, with operational records flowing back to a platform data layer.</div></div>');

    /* 5 — ZHENG'AN PILOT */
    H += sec("pilot", "Field Implementation", "Zheng'an Pilot",
      p("The Zheng'an pilot converts the research design into an implementable field study.") +
      pilotFunnel() +
      p("The implementation plan maps schools, students, teachers, and tutoring demand across Zheng'an County. The pilot focuses on selected schools and grades, with baseline research, monitoring, and evaluation surveys built into the field process. The design includes treatment and control groups, with student and volunteer measurements collected before and after the intervention.") +
      p("The operational structure links research design to field execution. Project supervisors coordinate implementation. Team leaders manage volunteer groups. Volunteers conduct tutoring and submit service records. Local teachers provide student information, demand context, and feedback. This creates a field system in which treatment exposure, tutoring intensity, matching relationships, and process data can be observed at the project level.") +
      callout("<b>The Zheng'an pilot functions as both an education intervention and a research infrastructure.</b>"));

    /* 6 — PLATFORM DATA */
    H += sec("platform", "Platform-Generated Data", "An Observed Field Process",
      p("The project is supported by a software-copyrighted education-management platform that records field operations across multiple user roles.") +
      p("The platform captures demand submission, project assignment, volunteer profiles, team structures, student records, project status, service logs, teaching feedback, team-leader weekly reports, and project-supervisor biweekly reports. These records turn field operations into structured data.") +
      dataExplorer() +
      p("This infrastructure addresses a common weakness in field experiments: the gap between treatment assignment and actual implementation. The platform makes it possible to observe not only whether a participant was assigned to treatment, but also how the tutoring relationship was organized, how often service occurred, which team structure supported it, and what feedback was recorded during the project cycle.") +
      platformMatrix() +
      '<div class="sc-copyright">The software system is registered under the computer software copyright <b>&ldquo;\u52b1\u8018\u8857\u5e2e\u5e2e\u5b66\u652f\u6559\u7ba1\u7406\u7cfb\u7edf V1.0,&rdquo;</b> registration number 2025SR0949110. For the study, the platform is more than an administrative tool. It is the data layer that connects experimental assignment, network formation, field monitoring, and behavioral outcomes.</div>');

    /* 7 — VARIABLE DESIGN */
    H += sec("variables", "Variable Design", "Separating Social Capital into Measurable Components",
      p("The research design separates social capital into measurable components.") +
      p("The dependent variables include trust, trustworthiness, reciprocity, and cooperation, measured through Trust Games and Public Goods Games before and after the tutoring intervention. The explanatory variables combine individual traits, network structure, and participation features.") +
      variableTable() +
      p("Demographic variables include background characteristics such as gender, education, and location. Internal network variables record whether participants joined through the same school, student organization, supervisor, team leader, or tutoring project. External network variables include social distance, centrality, and betweenness centrality. Participation variables include project role, prior participation, motivation, team affiliation, geographic distance, and evaluation of the tutoring experience.") +
      p("This variable structure moves beyond a simple treatment indicator. It supports analysis of how treatment exposure, network position, and organizational structure jointly shape social-capital formation.") +
      eq(String.raw`Y_i = \beta_0 + \beta_1 X_{i1} + \beta_2 X_{i2} + \beta_3 X_{i3} + \beta_4 X_{i4} + \varepsilon_i`, "VM") +
      '<div class="sc-fwall" style="grid-template-columns:repeat(4,1fr)">' +
        vcell("X_{i1}", "Demographic characteristics") + vcell("X_{i2}", "Internal network, platform data") +
        vcell("X_{i3}", "External network, survey data") + vcell("X_{i4}", "Participation characteristics") +
      "</div>");

    /* 8 — RESEARCH CONTRIBUTION */
    H += sec("contribution", "Research Contribution", "A Social Program as an Experimental Setting",
      p("The project demonstrates how a real-world social program can be translated into an experimental economics setting.") +
      p("The contribution is not limited to organizing a tutoring program. The research value comes from turning a large tutoring network into a field laboratory: defining treatment and control groups, measuring behavioral outcomes through games, structuring pre-post comparisons, mapping network variables, and linking platform records to causal inference.") +
      p("The design also connects behavioral economics with labor and organizational questions. Volunteer participation is treated as a structured form of social labor. Team leaders and project supervisors create layers of monitoring and coordination. Matching between teachers, students, and volunteers creates allocation problems. Repeated interaction produces social ties that may affect trust and cooperation.") +
      '<div class="rs-flow">' + ["Behavioral economics", "Field economics", "Labor economics", "Social-network analysis", "Applied causal inference"].map(function (x, i) {
        return (i ? '<span class="rs-flow-arr" aria-hidden="true">&#8594;</span>' : "") + '<span class="rs-flow-step">' + x + "</span>";
      }).join("") + "</div>");

    /* 9 — PROJECT CONTRIBUTION */
    H += sec("project", "Project Contribution", "Four Workstreams",
      p("Project contribution covered four areas.") +
      '<div class="sc-fwall" style="grid-template-columns:repeat(2,1fr)">' +
        pcell("01", "Study design", "Translated social-capital formation into an RCT-DiD framework with treatment and control groups, baseline and follow-up measurements, and behavioral-game outcomes.") +
        pcell("02", "Measurement system", "Mapped trust, trustworthiness, reciprocity, and cooperation to Trust Games and Public Goods Games, so abstract concepts are observed through strategic behavior.") +
        pcell("03", "Field implementation", "Connected the research design to the Zheng'an pilot: school mapping, student demand collection, volunteer matching, project formation, and follow-up evaluation.") +
        pcell("04", "Platform layer", "Structured operational data across demand submission, project assignment, service logs, feedback, weekly reports, and supervisor reports, making the field process observable beyond survey data.") +
      "</div>");

    /* 10 — WHAT THIS PROJECT SHOWS */
    H += sec("shows", "What This Project Shows", "Theory, Measurement, Operations, and Data",
      p("This project shows the ability to convert a large social program into a rigorous research setting.") +
      p("It combines behavioral-game design, field implementation, causal identification, and platform data infrastructure. It also shows how economic research can be built inside a real organization without reducing the project to a charity narrative. The tutoring network becomes a setting for studying trust, cooperation, matching, social labor, and network formation under real-world constraints.") +
      '<p class="ca-close-line">The result is a field-research case that connects theory, measurement, operations, and data.</p>' +
      '<div class="ca-foot"><span>Research Detail &middot; Social Capital in Tutoring Networks</span><span>Zhenyuan Pan &middot; 2026</span></div>');

    return (
      '<button class="case-close" type="button" aria-label="Close case study"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll sc-scroll"><article class="case-article ai-article sc-article">' +
        H +
      "</article></div>"
    );

    function vcell(tex, label) {
      return '<div class="sc-fcard" style="border-top-color:var(--sc)"><div class="sc-fcard-h">' + m(tex) + '</div><div class="sc-fcard-n" style="margin-top:6px">' + label + "</div></div>";
    }
    function pcell(k, title, body) {
      return '<div class="sc-fcard"><div class="sc-fcard-h"><span style="color:var(--sc)">' + k + "</span> &nbsp;" + title + '</div><div class="sc-fcard-n" style="margin-top:4px">' + body + "</div></div>";
    }
  };

  /* ================= interactions / viz ================= */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function renderKatex(root) {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(root, {
          delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }],
          throwOnError: false, errorColor: "#b3133f"
        });
      } catch (e) { /* leave raw TeX if KaTeX unavailable */ }
    }
  }

  /* sticky section index + progress bar */
  function wireIndexAndProgress(scroller) {
    var nav = scroller.querySelector(".sc-controls .ai-index");
    var secs = [].slice.call(scroller.querySelectorAll(".sc-sec[data-sc-label]"));
    if (!nav) return;
    var links = [];
    secs.forEach(function (s) {
      var a = document.createElement("button");
      a.type = "button"; a.className = "ai-ix"; a.textContent = s.getAttribute("data-sc-label"); a.setAttribute("data-target", s.id);
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

  /* DID estimator calculator */
  function wireDID(box) {
    var ins = {}; box.querySelectorAll("input[data-in]").forEach(function (n) { ins[n.getAttribute("data-in")] = n; });
    var outs = {}; box.querySelectorAll("[data-out]").forEach(function (n) { outs[n.getAttribute("data-out")] = n; });
    var svg = box.querySelector("[data-sc-chart]");
    function draw(tpre, tpost, cpre, cpost) {
      var W = 360, Hh = 150, padL = 38, padR = 16, padT = 16, padB = 30;
      var x0 = padL, x1 = W - padR;
      function Y(v) { return padT + (1 - v) * (Hh - padT - padB); }
      var s = '';
      /* axes */
      s += '<line class="sc-cc-ax" x1="' + x0 + '" y1="' + Y(0) + '" x2="' + x1 + '" y2="' + Y(0) + '"/>';
      s += '<line class="sc-cc-ax" x1="' + x0 + '" y1="' + padT + '" x2="' + x0 + '" y2="' + Y(0) + '"/>';
      [0, 0.5, 1].forEach(function (g) { s += '<text class="sc-cc-axt" x="' + (x0 - 6) + '" y="' + (Y(g) + 3) + '" text-anchor="end">' + g.toFixed(1) + "</text>"; });
      s += '<text class="sc-cc-axt" x="' + x0 + '" y="' + (Hh - 8) + '" text-anchor="middle">Pre</text>';
      s += '<text class="sc-cc-axt" x="' + x1 + '" y="' + (Hh - 8) + '" text-anchor="middle">Post</text>';
      /* lines */
      s += '<path class="sc-cc-c" d="M' + x0 + "," + Y(cpre) + " L" + x1 + "," + Y(cpost) + '"/>';
      s += '<path class="sc-cc-t" d="M' + x0 + "," + Y(tpre) + " L" + x1 + "," + Y(tpost) + '"/>';
      /* dots */
      s += '<circle class="sc-cc-dot c" cx="' + x0 + '" cy="' + Y(cpre) + '" r="4"/><circle class="sc-cc-dot c" cx="' + x1 + '" cy="' + Y(cpost) + '" r="4"/>';
      s += '<circle class="sc-cc-dot t" cx="' + x0 + '" cy="' + Y(tpre) + '" r="4"/><circle class="sc-cc-dot t" cx="' + x1 + '" cy="' + Y(tpost) + '" r="4"/>';
      /* labels */
      s += '<text class="sc-cc-lab" x="' + (x1 - 2) + '" y="' + (Y(tpost) - 8) + '" text-anchor="end" fill="#1f7a64">Treatment</text>';
      s += '<text class="sc-cc-lab" x="' + (x1 - 2) + '" y="' + (Y(cpost) + 16) + '" text-anchor="end" fill="#8a93a0">Control</text>';
      svg.innerHTML = s;
    }
    function compute() {
      var tpre = +ins.tpre.value, tpost = +ins.tpost.value, cpre = +ins.cpre.value, cpost = +ins.cpost.value;
      outs.tpre.textContent = tpre.toFixed(2); outs.tpost.textContent = tpost.toFixed(2);
      outs.cpre.textContent = cpre.toFixed(2); outs.cpost.textContent = cpost.toFixed(2);
      var tchg = tpost - tpre, cchg = cpost - cpre, did = tchg - cchg;
      outs.tchg.textContent = (tchg >= 0 ? "+" : "") + tchg.toFixed(2);
      outs.cchg.textContent = (cchg >= 0 ? "+" : "") + cchg.toFixed(2);
      outs.did.textContent = (did >= 0 ? "+" : "") + did.toFixed(2);
      draw(tpre, tpost, cpre, cpost);
    }
    box.querySelectorAll("input[data-in]").forEach(function (inp) { inp.addEventListener("input", compute); });
    compute();
  }

  /* behavioral game simulator */
  function wireGames(box) {
    var ins = {}; box.querySelectorAll("input[data-in]").forEach(function (n) { ins[n.getAttribute("data-in")] = n; });
    var outs = {}; box.querySelectorAll("[data-out]").forEach(function (n) { outs[n.getAttribute("data-out")] = n; });
    function fmt(v, dec) { return dec ? v.toFixed(dec) : String(Math.round(v)); }
    function compute() {
      box.querySelectorAll("input[data-in]").forEach(function (inp) {
        var dec = +inp.getAttribute("data-dec") || 0;
        var o = outs[inp.getAttribute("data-in")];
        if (o) o.textContent = fmt(+inp.value, dec);
      });
      /* Trust */
      var endow = +ins.g_endow.value, mm = +ins.g_m.value, send = +ins.g_send.value, ret = +ins.g_return.value;
      var recv = mm * send;
      outs.t_recv.textContent = fmt(recv, 0);
      outs.t_trust.textContent = endow > 0 ? (send / endow).toFixed(2) : "0.00";
      outs.t_tw.textContent = recv > 0 ? (ret / recv).toFixed(2) : "0.00";
      /* PGG */
      var pe = +ins.p_endow.value, pc = +ins.p_contrib.value, pg = +ins.p_group.value, pm = +ins.p_mpcr.value;
      outs.p_coop.textContent = pe > 0 ? (pc / pe).toFixed(2) : "0.00";
      outs.p_pay.textContent = fmt(pe - pc + pm * pg, 0);
    }
    box.querySelectorAll("input[data-in]").forEach(function (inp) { inp.addEventListener("input", compute); });
    box.querySelectorAll(".sc-tabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        var tab = b.getAttribute("data-tab");
        box.querySelectorAll(".sc-tabs button").forEach(function (x) { x.classList.toggle("on", x === b); });
        box.querySelectorAll(".sc-game-pane").forEach(function (pane) {
          pane.hidden = pane.getAttribute("data-pane") !== tab;
        });
      });
    });
    compute();
  }

  /* data source explorer */
  var ROLES = [
    { k: "Rural teacher", gen: "Demand submission, subject need, grade, school, student context, teaching feedback", use: "Matching context, local demand, implementation feedback", varname: "teacher-project linkage" },
    { k: "Project supervisor", gen: "Project assignment, supervisor reports, project progress, team coordination", use: "Monitoring intensity, implementation structure, project-level fixed effects", varname: "supervisor cluster" },
    { k: "Team leader", gen: "Team composition, weekly reports, volunteer management, service monitoring", use: "Group-level supervision, compliance, peer structure", varname: "same team-leader indicator" },
    { k: "Volunteer", gen: "Service logs, service time, service content, feedback, team affiliation", use: "Treatment intensity, participation behavior, network exposure", varname: "cumulative service records" },
    { k: "Student", gen: "Matching status, grade, subject demand, learning feedback", use: "Project context, treatment target, tutoring relationship", varname: "volunteer-student match" },
    { k: "Platform system", gen: "Project status, user roles, timestamps, logs, feedback tables, message structures", use: "Implementation trace, process data, network construction", varname: "project-cycle stage" }
  ];
  function wireExplorer(box) {
    var chips = box.querySelector(".sc-exp-chips"), panel = box.querySelector(".sc-exp-panel");
    ROLES.forEach(function (r, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "sc-exp-chip" + (i === 0 ? " on" : ""); b.textContent = r.k;
      b.addEventListener("click", function () {
        chips.querySelectorAll(".sc-exp-chip").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); show(r);
      });
      chips.appendChild(b);
    });
    function show(r) {
      panel.innerHTML =
        '<div class="sc-exp-col"><div class="k">Generated data</div><div class="b">' + esc(r.gen) + "</div></div>" +
        '<div class="sc-exp-col"><div class="k">Research use</div><div class="b">' + esc(r.use) + "</div></div>" +
        '<div class="sc-exp-col var"><div class="k">Example variable</div><div class="b">' + esc(r.varname) + "</div></div>";
    }
    show(ROLES[0]);
  }

  window.__socialCapitalViz = {
    init: function (scroller) {
      if (!scroller || scroller.__scDone) return;
      if (!scroller.querySelector(".sc-article")) return; // not the social-capital article
      scroller.__scDone = true;
      try {
        renderKatex(scroller);
        wireIndexAndProgress(scroller);
        scroller.querySelectorAll("[data-sc-did-calc]").forEach(wireDID);
        scroller.querySelectorAll("[data-sc-games]").forEach(wireGames);
        scroller.querySelectorAll("[data-sc-explorer]").forEach(wireExplorer);
      } catch (err) { if (window.console) console.warn("socialcapital-viz", err); }
    }
  };
})();
