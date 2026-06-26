/* research-decisionengine.js : "AI Decision Engine" GitHub project case study.
   Opens from the .sys-row (data-sys="decision-engine") through the shared
   case-study.js frosted overlay (morph "plain"). Self-contained: ships its own
   scoped de-* styles. Deliberately uses a different visual language from the
   harness pages: browser-frame product mockups, split-screen comparison,
   storyboard cards, an LLM/Python boundary split, a sim_spec contract card,
   Monte Carlo density panels, sensitivity levers, an agent orbit, an exploded
   architecture, and a report sheet. Adds a compute-blue accent next to the
   site magenta so it reads as a product, not another architecture diagram.

   Exposes:
     window.__decisionEngineArticle(data) -> overlay HTML string
     window.__decisionEngineViz.init(scroller) -> sticky index + progress,
        subtle looping visuals, and the interactive mini model builder,
        ownership toggle, sim_spec inspector, and report explorer.

   No en-dashes or em-dashes in any visible copy (project rule). */
(function () {
  "use strict";

  var REPO = "https://github.com/ZhenyuanPAN822/AI-powered-decision-analysis-engine";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function p(t) { return '<p class="ca-p">' + t + "</p>"; }
  function sec(id, label, title, inner) {
    return '<section class="ca-section ai-sec de-sec" id="de-sec-' + id + '" data-de-label="' + esc(label) + '">' +
      '<div class="ca-h">' + esc(label) + "</div>" +
      (title ? '<h3 class="ca-sub de-h2">' + esc(title) + "</h3>" : "") + inner + "</section>";
  }

  var STYLE = "<style id=\"de-style\">" + [
    ".de-article{--mag:#d6006c;--py:#2a6fdb;--ink:#14181f;--line:rgba(20,24,31,0.12);--mut:#6b7480;--soft:rgba(214,0,108,0.07);--pysoft:rgba(42,111,219,0.08);--paper:#faf9f7;}",
    ".de-h2{max-width:30ch;margin-bottom:20px;}",
    ".de-sec{padding-top:clamp(8px,1.6vh,22px);}",
    ".de-lede{font-size:clamp(16px,1.4vw,20px);line-height:1.5;color:#3a4049;max-width:64ch;margin:0 0 8px;font-weight:400;text-wrap:pretty;}",
    ".de-cap{font-size:12px;line-height:1.5;color:#9098a3;margin-top:12px;font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;}",
    ".de-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#3f4751;background:var(--paper);border:1px solid var(--line);border-radius:5px;padding:1px 6px;}",
    /* cta */
    ".de-cta{display:inline-flex;align-items:center;gap:9px;font:800 13px 'Archivo',sans-serif;letter-spacing:0.01em;color:#fff;background:var(--ink);border-radius:10px;padding:11px 20px;text-decoration:none;margin:6px 0;transition:background .2s,transform .2s;}",
    ".de-cta:hover{background:#000;transform:translateY(-2px);}",
    ".de-cta .gh{width:16px;height:16px;fill:#fff;}",
    ".de-sidelabels{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 0;}",
    ".de-sidelabels span{font:600 11.5px 'Archivo',sans-serif;color:#3f4751;background:var(--paper);border:1px solid var(--line);border-radius:999px;padding:5px 12px;}",
    /* browser frame */
    ".de-window{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 24px 60px -38px rgba(20,24,31,0.5);margin:26px 0 8px;}",
    ".de-titlebar{display:flex;align-items:center;gap:7px;padding:11px 14px;background:#f3f4f6;border-bottom:1px solid var(--line);}",
    ".de-dot{width:10px;height:10px;border-radius:50%;}",
    ".de-dot.r{background:#ff5f57;} .de-dot.y{background:#febc2e;} .de-dot.g{background:#28c840;}",
    ".de-urlbar{flex:1;margin-left:10px;font:600 11px ui-monospace,Menlo,monospace;color:#8a909b;background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 11px;}",
    /* hero cockpit */
    ".de-cockpit{display:grid;grid-template-columns:0.9fr 1.2fr 0.9fr;gap:0;}",
    ".de-cpcol{padding:16px;border-right:1px solid var(--line);}",
    ".de-cockpit .de-cpcol:last-child{border-right:0;}",
    ".de-cp-k{font:800 9.5px 'Archivo',sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:var(--mut);margin-bottom:11px;}",
    ".de-prompt{font-size:12.5px;line-height:1.5;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:9px;padding:11px 12px;}",
    ".de-opt{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--line);border-radius:9px;padding:9px 11px;margin-bottom:8px;font:700 12px 'Archivo',sans-serif;color:var(--ink);}",
    ".de-opt .bar{flex:1;height:6px;border-radius:3px;background:rgba(20,24,31,0.07);overflow:hidden;margin:0 8px;}",
    ".de-opt .bar i{display:block;height:100%;background:var(--mag);border-radius:3px;}",
    ".de-opt .rk{font:800 11px 'Archivo',sans-serif;color:var(--mag);}",
    ".de-curve{margin-top:6px;}",
    ".de-asmp{display:flex;flex-direction:column;gap:11px;}",
    ".de-asmp .row{font-size:11.5px;color:var(--ink);}",
    ".de-asmp .row .lab{display:flex;justify-content:space-between;margin-bottom:4px;color:var(--mut);}",
    ".de-track{height:5px;border-radius:3px;background:rgba(42,111,219,0.14);position:relative;}",
    ".de-track i{position:absolute;top:50%;width:13px;height:13px;border-radius:50%;background:var(--py);transform:transl(-50%,-50%);transform:translateY(-50%);}",
    ".de-chips{display:flex;gap:7px;padding:11px 14px;border-top:1px solid var(--line);background:#fbfbfc;flex-wrap:wrap;}",
    ".de-chips span{font:700 10.5px 'Archivo',sans-serif;letter-spacing:0.04em;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:4px 10px;}",
    ".de-chips span.on{color:#fff;background:var(--mag);border-color:var(--mag);}",
    /* split screen */
    ".de-split{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0;}",
    ".de-sp{border:1px solid var(--line);border-radius:13px;padding:18px;background:#fff;}",
    ".de-sp.ord{background:#fbfbfc;}",
    ".de-sp.eng{border-color:rgba(42,111,219,0.4);box-shadow:0 16px 40px -30px rgba(42,111,219,0.5);}",
    ".de-sp-k{font:800 10.5px 'Archivo',sans-serif;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:13px;}",
    ".de-sp.ord .de-sp-k{color:var(--mut);} .de-sp.eng .de-sp-k{color:var(--py);}",
    ".de-sp ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px;}",
    ".de-sp li{font-size:13px;line-height:1.45;color:#3f4751;padding-left:20px;position:relative;}",
    ".de-sp.ord li::before{content:'';position:absolute;left:0;top:8px;width:7px;height:7px;border-radius:50%;border:1.5px solid #b8bec7;}",
    ".de-sp.eng li::before{content:'';position:absolute;left:0;top:7px;width:9px;height:9px;border-radius:2px;background:var(--py);}",
    /* storyboard */
    ".de-story{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:24px 0;}",
    ".de-frame{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff;}",
    ".de-frame-bar{display:flex;align-items:center;gap:5px;padding:8px 11px;background:#f3f4f6;border-bottom:1px solid var(--line);}",
    ".de-frame-bar .d{width:7px;height:7px;border-radius:50%;background:#cfd3d9;}",
    ".de-frame-n{margin-left:auto;font:800 10px 'Archivo',sans-serif;color:var(--mag);}",
    ".de-frame-body{padding:14px;}",
    ".de-frame-h{font:800 13px 'Archivo',sans-serif;color:var(--ink);margin:0 0 7px;}",
    ".de-frame-b{font-size:12px;line-height:1.5;color:var(--mut);}",
    ".de-frame-ui{margin-top:10px;display:flex;flex-direction:column;gap:5px;}",
    ".de-frame-ui .ln{height:7px;border-radius:3px;background:rgba(20,24,31,0.07);}",
    ".de-frame-ui .ln.s{width:60%;} .de-frame-ui .ln.m{width:85%;} .de-frame-ui .ln.mag{background:var(--soft);}",
    /* boundary split */
    ".de-boundary{display:grid;grid-template-columns:1fr auto 1fr;gap:0;align-items:stretch;margin:24px 0;border:1px solid var(--line);border-radius:14px;overflow:hidden;}",
    ".de-bside{padding:20px 18px;}",
    ".de-bside.llm{background:var(--soft);} .de-bside.py{background:var(--pysoft);}",
    ".de-bside-k{font:800 11px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;}",
    ".de-bside.llm .de-bside-k{color:var(--mag);} .de-bside.py .de-bside-k{color:var(--py);}",
    ".de-bside ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:7px;}",
    ".de-bside li{font:600 11.5px 'Archivo',sans-serif;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:7px;padding:6px 10px;}",
    ".de-bmid{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 8px;background:linear-gradient(180deg,var(--mag),var(--py));min-width:8px;position:relative;}",
    ".de-bmid span{writing-mode:vertical-rl;transform:rotate(180deg);font:800 10px 'Archivo',sans-serif;letter-spacing:0.14em;text-transform:uppercase;color:#fff;padding:8px 0;}",
    ".de-bcontract{text-align:center;margin:14px 0;font:700 13px 'Archivo',sans-serif;color:var(--ink);}",
    ".de-bcontract .pill{display:inline-block;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#fff;background:var(--ink);border-radius:7px;padding:5px 12px;margin-left:8px;}",
    /* ownership toggle */
    ".de-own{border:1px solid var(--line);border-radius:14px;background:#fff;padding:20px;margin:18px 0;}",
    ".de-own-tabs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;}",
    ".de-otab{font:700 11px 'Archivo',sans-serif;letter-spacing:0.02em;color:var(--mut);background:#fff;border:1px solid var(--line);border-radius:8px;padding:7px 11px;cursor:pointer;transition:all .15s;}",
    ".de-otab:hover{border-color:var(--mag);} .de-otab.on.llm{background:var(--mag);color:#fff;border-color:var(--mag);} .de-otab.on.py{background:var(--py);color:#fff;border-color:var(--py);}",
    ".de-opanel{display:grid;grid-template-columns:auto 1fr;gap:12px 20px;align-items:start;}",
    ".de-obadge{font:800 11px 'Archivo',sans-serif;letter-spacing:0.06em;color:#fff;border-radius:999px;padding:6px 14px;align-self:start;}",
    ".de-obadge.llm{background:var(--mag);} .de-obadge.py{background:var(--py);}",
    ".de-ofield{margin-bottom:10px;} .de-ofield .k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mut);margin-bottom:3px;} .de-ofield .v{font-size:13px;line-height:1.5;color:#3f4751;}",
    ".de-ofield.mustnot .k{color:var(--mag);}",
    /* sim_spec contract card */
    ".de-contract{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;margin:22px 0;}",
    ".de-contract-h{display:flex;align-items:center;gap:9px;padding:13px 16px;background:#0f1318;color:#fff;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;}",
    ".de-contract-h .dot{width:8px;height:8px;border-radius:2px;background:var(--py);}",
    ".de-fields{display:grid;grid-template-columns:repeat(2,1fr);gap:0;}",
    ".de-field{padding:13px 16px;border-bottom:1px solid var(--line);border-right:1px solid var(--line);cursor:pointer;transition:background .15s;}",
    ".de-field:nth-child(2n){border-right:0;}",
    ".de-field:hover,.de-field.on{background:var(--pysoft);}",
    ".de-field .fn{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;color:var(--py);font-weight:600;}",
    ".de-field .fd{font-size:11.5px;color:var(--mut);margin-top:4px;line-height:1.4;}",
    ".de-distmenu{display:flex;flex-wrap:wrap;gap:7px;padding:14px 16px;background:#fbfbfc;}",
    ".de-distmenu span{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:6px;padding:4px 9px;}",
    ".de-specdetail{margin-top:14px;border:1px solid var(--line);border-radius:11px;background:var(--paper);padding:16px;}",
    ".de-specdetail .k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--py);margin-bottom:4px;}",
    ".de-specdetail .v{font-size:13px;line-height:1.5;color:#3f4751;margin-bottom:10px;}",
    ".de-specdetail .ex{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:7px;padding:9px 11px;}",
    /* agent orbit */
    ".de-orbit{margin:22px 0;}",
    ".de-orbit svg{width:100%;height:auto;display:block;max-width:620px;margin:0 auto;}",
    ".de-orbit .ring{fill:none;stroke:var(--line);stroke-width:1.4;stroke-dasharray:3 7;}",
    ".de-orbit .core{fill:var(--py);}",
    ".de-orbit .anode circle{fill:#fff;stroke:var(--mag);stroke-width:1.8;}",
    ".de-orbit .anode text{font:800 9px 'Archivo',sans-serif;fill:var(--ink);}",
    ".de-orbit .spoke{stroke:rgba(20,24,31,0.12);stroke-width:1;}",
    ".de-agentlegend{display:grid;grid-template-columns:repeat(2,1fr);gap:10px 22px;margin-top:14px;}",
    ".de-al{font-size:12.5px;line-height:1.45;color:#3f4751;} .de-al b{font:800 11.5px 'Archivo',sans-serif;color:var(--mag);display:block;}",
    ".de-al.sim b{color:var(--py);}",
    /* MC distribution panel */
    ".de-dist{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:22px 0;}",
    ".de-optcard{border:1px solid var(--line);border-radius:13px;background:#fff;padding:16px;}",
    ".de-optcard.lead{border-color:rgba(42,111,219,0.5);box-shadow:0 16px 40px -30px rgba(42,111,219,0.5);}",
    ".de-oc-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px;}",
    ".de-oc-h .nm{font:800 14px 'Archivo',sans-serif;color:var(--ink);}",
    ".de-oc-h .rk{font:800 11px 'Archivo',sans-serif;color:var(--py);}",
    ".de-oc-curve{margin:10px 0 8px;}",
    ".de-oc-curve svg{width:100%;height:auto;display:block;}",
    ".de-oc-row{display:flex;justify-content:space-between;font-size:11.5px;color:var(--mut);margin-top:5px;}",
    ".de-oc-row b{color:var(--ink);font-weight:700;font-variant-numeric:tabular-nums;}",
    ".de-badge{display:inline-block;font:700 10px 'Archivo',sans-serif;letter-spacing:0.04em;border-radius:999px;padding:3px 9px;margin-top:10px;}",
    ".de-badge.stable{color:#1f8a5b;background:#f0faf5;border:1px solid #bfe6d4;} .de-badge.fragile{color:#b06a00;background:#fdf8ee;border:1px solid #f0e0c0;}",
    /* sensitivity levers */
    ".de-levers{border:1px solid var(--line);border-radius:13px;background:#fff;padding:18px;margin:18px 0;}",
    ".de-lever{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line);}",
    ".de-levers .de-lever:last-of-type{border-bottom:0;}",
    ".de-lever .nm{font:600 12.5px 'Archivo',sans-serif;color:var(--ink);}",
    ".de-lever .track{width:120px;height:6px;border-radius:3px;background:rgba(42,111,219,0.14);position:relative;}",
    ".de-lever .track i{position:absolute;top:50%;transform:translateY(-50%);width:14px;height:14px;border-radius:50%;background:var(--py);}",
    ".de-lever .pm{font:700 11px 'Archivo',sans-serif;color:var(--mut);white-space:nowrap;}",
    ".de-leverout{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}",
    ".de-leverout span{font:700 11.5px 'Archivo',sans-serif;border-radius:8px;padding:7px 12px;}",
    ".de-leverout .stable{color:#1f8a5b;background:#f0faf5;border:1px solid #bfe6d4;} .de-leverout .flip{color:var(--mag);background:var(--soft);border:1px solid #f0c8dc;} .de-leverout .lev{color:var(--py);background:var(--pysoft);border:1px solid rgba(42,111,219,0.3);}",
    /* mini builder */
    ".de-builder{border:1px solid var(--line);border-radius:14px;background:#fff;padding:20px;margin:18px 0;}",
    ".de-builder-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start;}",
    ".de-bctl label{display:block;margin-bottom:14px;}",
    ".de-bctl .lab{display:flex;justify-content:space-between;font-size:12px;color:var(--ink);margin-bottom:6px;}",
    ".de-bctl .lab b{color:var(--py);font:800 13px 'Archivo',sans-serif;font-variant-numeric:tabular-nums;}",
    ".de-bctl input[type=range]{width:100%;accent-color:var(--py);}",
    ".de-bscenario{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;margin-top:6px;}",
    ".de-bscenario button{font:700 11.5px 'Archivo',sans-serif;color:var(--mut);background:#fff;border:0;padding:7px 13px;cursor:pointer;}",
    ".de-bscenario button.on{background:var(--ink);color:#fff;}",
    ".de-bout{display:flex;flex-direction:column;gap:10px;}",
    ".de-bbar{}",
    ".de-bbar .top{display:flex;justify-content:space-between;font-size:12.5px;color:var(--ink);margin-bottom:5px;}",
    ".de-bbar .top .rk{font:800 11px 'Archivo',sans-serif;color:var(--py);}",
    ".de-bbar .top b{font-variant-numeric:tabular-nums;}",
    ".de-bbar .track{height:16px;border-radius:5px;background:rgba(20,24,31,0.06);overflow:hidden;}",
    ".de-bbar .track i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,var(--py),#5a93e8);transition:width .35s cubic-bezier(0.22,1,0.36,1);}",
    ".de-bbar.lead .track i{background:linear-gradient(90deg,var(--mag),#e8559c);}",
    /* exploded architecture */
    ".de-explode{display:flex;flex-direction:column;gap:10px;margin:22px 0;}",
    ".de-layer{display:grid;grid-template-columns:150px 1fr;gap:16px;align-items:center;border:1px solid var(--line);border-radius:12px;background:#fff;padding:14px 16px;position:relative;}",
    ".de-layer .ly{font:800 11px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--py);}",
    ".de-layer .file{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;color:var(--ink);font-weight:600;}",
    ".de-layer .desc{font-size:12px;color:var(--mut);margin-top:3px;line-height:1.4;}",
    ".de-connlabel{align-self:center;text-align:center;font:700 9.5px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--mut);}",
    /* report sheet */
    ".de-report{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 22px 56px -38px rgba(20,24,31,0.45);margin:22px 0;}",
    ".de-rtabs{display:flex;flex-wrap:wrap;gap:0;border-bottom:1px solid var(--line);background:#fbfbfc;}",
    ".de-rtab{font:700 12px 'Archivo',sans-serif;color:var(--mut);background:transparent;border:0;border-bottom:2px solid transparent;padding:12px 16px;cursor:pointer;transition:color .15s,border-color .15s;}",
    ".de-rtab:hover{color:var(--ink);} .de-rtab.on{color:var(--ink);border-bottom-color:var(--mag);}",
    ".de-rbody{padding:22px 24px;min-height:120px;}",
    ".de-rbody h4{font:800 16px 'Archivo',sans-serif;color:var(--ink);margin:0 0 10px;letter-spacing:-0.01em;}",
    ".de-rbody p{font-size:13.5px;line-height:1.6;color:#3f4751;margin:0;}",
    ".de-rbody .reco{display:inline-block;font:800 11px 'Archivo',sans-serif;letter-spacing:0.06em;color:#fff;background:var(--py);border-radius:999px;padding:5px 13px;margin-bottom:12px;}",
    /* github card */
    ".de-ghcard{border:1px solid var(--line);border-radius:14px;background:#fff;padding:20px 22px;margin:22px 0;display:flex;gap:18px;align-items:center;flex-wrap:wrap;}",
    ".de-ghicon{width:46px;height:46px;flex:none;fill:var(--ink);}",
    ".de-ghmain{flex:1;min-width:200px;}",
    ".de-ghname{font:800 16px ui-monospace,Menlo,monospace;color:var(--ink);margin-bottom:5px;word-break:break-word;}",
    ".de-ghdesc{font-size:12.5px;line-height:1.5;color:var(--mut);}",
    /* reveal + anim */
    ".de-reveal{opacity:1;}",
    ".de-mcparticle{animation:deFall 3.2s ease-in infinite;}",
    "@keyframes deFall{0%{opacity:0;transform:translateY(-14px);}15%{opacity:0.9;}80%{opacity:0.5;}100%{opacity:0;transform:translateY(26px);}}",
    ".de-orbit .anode{transform-box:fill-box;transform-origin:center;animation:deOrbitPulse 9s ease-in-out infinite;}",
    "@keyframes deOrbitPulse{0%,90%{opacity:0.85;}45%{opacity:1;}}",
    /* responsive */
    "@media (max-width:860px){",
    ".de-cockpit{grid-template-columns:1fr;} .de-cpcol{border-right:0;border-bottom:1px solid var(--line);}",
    ".de-split,.de-builder-grid{grid-template-columns:1fr;} .de-story{grid-template-columns:1fr;}",
    ".de-boundary{grid-template-columns:1fr;} .de-bmid{min-height:8px;} .de-bmid span{writing-mode:horizontal-tb;transform:none;}",
    ".de-fields{grid-template-columns:1fr;} .de-field:nth-child(2n){border-right:1px solid var(--line);}",
    ".de-dist{grid-template-columns:1fr;} .de-explode .de-layer{grid-template-columns:1fr;} .de-agentlegend{grid-template-columns:1fr;}",
    ".de-opanel{grid-template-columns:1fr;}",
    "}",
    "@media (prefers-reduced-motion:reduce){.de-mcparticle,.de-orbit .anode{animation:none;} .de-mcparticle{opacity:0;}}"
  ].join("") + "</style>";

  /* ---------- data ---------- */
  var STAGES = [
    { id: "FRAMEWORK", owner: "LLM", input: "decision context, options, priorities", output: "evaluation dimensions, scenarios, weights", mustnot: "compute final numbers" },
    { id: "ORACLE", owner: "LLM", input: "decision and option list", output: "official facts: costs, policy, programs, employment", mustnot: "fabricate sources" },
    { id: "ECHO", owner: "LLM", input: "decision and option list", output: "community sentiment, reviews, complaints, praise", mustnot: "treat anecdotes as hard data" },
    { id: "MODEL-PARAMS", owner: "LLM", input: "framework, ORACLE, ECHO", output: "sim_spec", mustnot: "invent simulation results" },
    { id: "SIMULATE", owner: "Python", input: "sim_spec", output: "rankings, distributions, sensitivity", mustnot: "invent priors" },
    { id: "MODEL-INTERPRET", owner: "LLM", input: "sim_results", output: "narrative interpretation", mustnot: "replace computed statistics" },
    { id: "DEVIL", owner: "LLM", input: "ranking and simulation result", output: "adversarial critique", mustnot: "ignore computed results" },
    { id: "SAGE", owner: "LLM", input: "decision and ranking", output: "5 to 10 year trend context", mustnot: "override the computed ranking" },
    { id: "NEXUS", owner: "LLM", input: "all prior outputs", output: "final synthesis and recommendation", mustnot: "discard the simulation" },
    { id: "MIRROR", owner: "LLM", input: "the full analysis", output: "process audit and blind-spot flags", mustnot: "rubber-stamp the result" }
  ];
  var SPECFIELDS = [
    { f: "options", d: "candidate choices", meaning: "The candidate choices being compared.", ex: "[\"Graduate school\", \"Startup job\", \"Corporate role\"]" },
    { f: "scenarios", d: "future states + priors", meaning: "Possible future states with prior probabilities.", ex: "{\"baseline\": 0.6, \"downturn\": 0.25, \"boom\": 0.15}" },
    { f: "outcomes", d: "scored dimensions", meaning: "Dimensions being scored, such as cost, time, satisfaction, or success probability.", ex: "[\"cost\", \"career_upside\", \"stability\", \"quality_of_life\"]" },
    { f: "direction", d: "higher or lower is better", meaning: "Whether higher or lower values are better for each outcome.", ex: "{\"cost\": \"lower\", \"career_upside\": \"higher\"}" },
    { f: "weight", d: "utility importance", meaning: "How much each outcome matters in the utility function.", ex: "{\"career_upside\": 0.4, \"cost\": 0.2}" },
    { f: "expected_range", d: "0-100 normalization", meaning: "Min and max used to normalize outcomes to a 0 to 100 utility scale.", ex: "{\"cost\": [0, 250000]}" },
    { f: "distribution", d: "uncertainty model", meaning: "An uncertainty model selected from the fixed menu.", ex: "{\"type\": \"lognormal\", \"params\": {\"mu\": 11.2, \"sigma\": 0.4}}" },
    { f: "n_iterations", d: "Monte Carlo trajectories", meaning: "Number of Monte Carlo trajectories the simulator runs.", ex: "20000" }
  ];
  var REPORT = {
    Recommendation: { reco: "Strong recommendation", h: "Startup job leads on weighted utility", b: "The top option holds the highest weighted utility across the sampled scenarios. The report states the recommendation strength and the conditions under which it holds." },
    Ranking: { h: "Option order and the top-two gap", b: "Options are ranked by median utility, and the report shows the gap between the top two. A small gap is reported as a same-tier result rather than a confident winner." },
    "Risk range": { h: "Best case, baseline, and downside", b: "Each option carries a P10 to P90 utility band, not a single score. The report shows where the result is stable and where the downside tail is wide." },
    Sensitivity: { h: "Which assumption can flip the result", b: "Outcome weights and scenario probabilities are perturbed by plus or minus 20%. If the ranking flips, the most sensitive lever is named explicitly." },
    "Devil's critique": { h: "What could make the top option wrong", b: "The adversarial agent attacks the leading option and defends the last, surfacing fragile assumptions before the final synthesis." },
    "Next steps": { h: "Concrete actions and deadlines", b: "The report closes with a short action plan: what to verify, what to decide by when, and which assumption to revisit if conditions change." }
  };
  var REPORT_KEYS = ["Recommendation", "Ranking", "Risk range", "Sensitivity", "Devil's critique", "Next steps"];
  /* mini builder example data: scores already direction-normalized 0-100 (higher better) */
  var BUILD_OPTS = [
    { nm: "Graduate school", s: { career: 78, cost: 40, stability: 62, qol: 58 }, riskDim: "career" },
    { nm: "Startup job", s: { career: 88, cost: 70, stability: 36, qol: 60 }, riskDim: "career" },
    { nm: "Corporate role", s: { career: 62, cost: 74, stability: 84, qol: 66 }, riskDim: "stability" }
  ];

  /* ---------- small svg helpers ---------- */
  function densityCurve(peak, spread, color) {
    /* a simple bell-ish polyline; peak 0..1 (x of peak), spread 0..1 (width) */
    var W = 240, H = 70, n = 48, pts = [];
    var mu = peak * W, sig = Math.max(18, spread * 80);
    for (var i = 0; i <= n; i++) {
      var x = i / n * W;
      var y = Math.exp(-0.5 * Math.pow((x - mu) / sig, 2));
      pts.push([x, H - 6 - y * (H - 16)]);
    }
    var d = "M0," + (H - 6) + " " + pts.map(function (q) { return "L" + q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ") + " L" + W + "," + (H - 6) + " Z";
    var line = "M" + pts.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" L");
    return '<svg viewBox="0 0 ' + W + " " + H + '" aria-hidden="true"><path d="' + d + '" fill="' + color + '" opacity="0.13"/><path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="2"/>' +
      '<line x1="' + mu.toFixed(1) + '" y1="6" x2="' + mu.toFixed(1) + '" y2="' + (H - 6) + '" stroke="' + color + '" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/></svg>';
  }

  /* ---------- builders ---------- */
  function heroCockpit() {
    var opts = [["Option A", 82, "#2"], ["Option B", 64, "#3"], ["Option C", 91, "#1"]];
    var optHtml = [["Startup job", 91, "1"], ["Graduate school", 78, "2"], ["Corporate role", 71, "3"]].map(function (o) {
      return '<div class="de-opt"><span>' + esc(o[0]) + '</span><span class="bar"><i style="width:' + o[1] + '%"></i></span><span class="rk">#' + o[2] + "</span></div>";
    }).join("");
    var asmp = [["Career upside", 0.7], ["Cost tolerance", 0.45], ["Risk of downturn", 0.3]].map(function (a) {
      return '<div class="row"><div class="lab"><span>' + esc(a[0]) + '</span><span>' + Math.round(a[1] * 100) + '</span></div><div class="de-track"><i style="left:' + (a[1] * 100) + '%"></i></div></div>';
    }).join("");
    return '<div class="de-window de-reveal"><div class="de-titlebar"><span class="de-dot r"></span><span class="de-dot y"></span><span class="de-dot g"></span><span class="de-urlbar">localhost:8000 / decision-engine</span></div>' +
      '<div class="de-cockpit">' +
        '<div class="de-cpcol"><div class="de-cp-k">Decision</div><div class="de-prompt">Should I take the startup offer, the corporate role, or go to graduate school?</div></div>' +
        '<div class="de-cpcol"><div class="de-cp-k">Options &middot; utility</div>' + optHtml + '<div class="de-curve">' + densityCurve(0.62, 0.5, "#2a6fdb") + "</div></div>" +
        '<div class="de-cpcol"><div class="de-cp-k">Assumptions to review</div><div class="de-asmp">' + asmp + "</div></div>" +
      "</div>" +
      '<div class="de-chips"><span class="on">Framework</span><span>Simulation</span><span>Devil</span><span>Report</span></div></div>' +
      '<div class="de-cap de-reveal">Open-ended decision, reviewed assumptions, computed report.</div>';
  }
  function splitScreen() {
    var ord = ["Prompt in", "Prose answer", "Single recommendation", "No computed uncertainty", "No stability check"];
    var eng = ["Structured decision model", "User-reviewed assumptions", "Monte Carlo simulation", "Utility distribution per option", "Sensitivity and rank-flip check", "Adversarial review"];
    return '<div class="de-split de-reveal">' +
      '<div class="de-sp ord"><div class="de-sp-k">Ordinary AI decision chat</div><ul>' + ord.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="de-sp eng"><div class="de-sp-k">AI Decision Engine</div><ul>' + eng.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
    "</div>";
  }
  function storyboard() {
    var F = [
      ["Describe the decision", "Plain language: the choice, the background, what matters."],
      ["Add candidate options", "Two to four options the simulator will compare."],
      ["Set values and concerns", "Priorities, risk tolerance, and self-assessment traits."],
      ["Review generated assumptions", "Edit dimensions, scenarios, and priors before any math runs."],
      ["Run simulation", "Python samples trajectories and scores utility."],
      ["Read report", "Ranking, distributions, sensitivity, critique, next steps."]
    ];
    return '<div class="de-story de-reveal">' + F.map(function (f, i) {
      return '<div class="de-frame"><div class="de-frame-bar"><span class="d"></span><span class="d"></span><span class="de-frame-n">' + (i + 1) + '/6</span></div>' +
        '<div class="de-frame-body"><div class="de-frame-h">' + esc(f[0]) + '</div><div class="de-frame-b">' + esc(f[1]) + '</div>' +
        '<div class="de-frame-ui"><div class="ln m"></div><div class="ln s ' + (i >= 3 ? "mag" : "") + '"></div><div class="ln m"></div></div></div></div>';
    }).join("") + "</div>";
  }
  function boundary() {
    var llm = ["Decision framing", "Evaluation dimensions", "Scenario design", "Official-data summary", "Community sentiment", "Distribution priors", "Adversarial critique", "Forward-looking context", "Final synthesis"];
    var py = ["Monte Carlo sampling", "Outcome normalization", "Weighted utility", "Ranking", "Percentiles", "Sensitivity analysis", "Rank-flip checks", "Structured output"];
    return '<div class="de-boundary de-reveal">' +
      '<div class="de-bside llm"><div class="de-bside-k">LLM owns</div><ul>' + llm.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="de-bmid"><span>sim_spec</span></div>' +
      '<div class="de-bside py"><div class="de-bside-k">Python owns</div><ul>' + py.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
    "</div>" +
    '<div class="de-bcontract de-reveal">The handoff is a single JSON contract <span class="pill">sim_spec</span></div>';
  }
  function ownershipToggle() {
    return '<div class="de-own de-reveal" data-de-own="1"><div class="de-own-tabs" data-role="tabs"></div><div class="de-opanel" data-role="panel"></div></div>';
  }
  function contractCard() {
    var fieldsHtml = SPECFIELDS.map(function (f, i) {
      return '<div class="de-field" data-spec="' + i + '"><div class="fn">' + esc(f.f) + '</div><div class="fd">' + esc(f.d) + "</div></div>";
    }).join("");
    var dist = ["normal", "lognormal", "triangular", "beta", "uniform", "bernoulli", "categorical"];
    return '<div class="de-contract de-reveal" data-de-spec="1">' +
      '<div class="de-contract-h"><span class="dot"></span>sim_spec.json</div>' +
      '<div class="de-fields">' + fieldsHtml + "</div>" +
      '<div class="de-distmenu">' + dist.map(function (d) { return "<span>" + esc(d) + "</span>"; }).join("") + "</div></div>" +
      '<div class="de-specdetail de-reveal" data-role="specdetail"></div>';
  }
  function agentOrbit() {
    var around = ["FRAMEWORK", "ORACLE", "ECHO", "MODEL-PARAMS", "MODEL-INTERPRET", "DEVIL", "SAGE", "NEXUS", "MIRROR"];
    var cx = 310, cy = 190, rx = 250, ry = 150, N = around.length;
    var svg = '<svg viewBox="0 0 620 380" role="img" aria-label="Nine LLM agents arranged around a central Python simulator core.">';
    svg += '<ellipse class="ring" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/>';
    var pts = [];
    for (var i = 0; i < N; i++) { var a = -Math.PI / 2 + i * (2 * Math.PI / N); pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    pts.forEach(function (q) { svg += '<line class="spoke" x1="' + cx + '" y1="' + cy + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '"/>'; });
    /* core */
    svg += '<g><rect class="core" x="' + (cx - 52) + '" y="' + (cy - 26) + '" width="104" height="52" rx="11"/>' +
      '<text x="' + cx + '" y="' + (cy - 3) + '" text-anchor="middle" style="font:800 13px Archivo,sans-serif" fill="#fff">SIMULATE</text>' +
      '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" style="font:600 9px Archivo,sans-serif" fill="#cfe0fb">Python backend</text></g>';
    around.forEach(function (nm, i) {
      var q = pts[i];
      svg += '<g class="anode" style="animation-delay:' + (i * 0.5).toFixed(1) + 's"><circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="30"/>' +
        '<text x="' + q[0].toFixed(1) + '" y="' + (q[1] + 3).toFixed(1) + '" text-anchor="middle">' + esc(nm.replace("MODEL-", "M-")) + "</text></g>";
    });
    svg += "</svg>";
    var legendRoles = [
      ["FRAMEWORK", "Analytical architect: dimensions, scenarios, weights.", ""],
      ["ORACLE", "Official researcher: costs, policy, hard facts.", ""],
      ["ECHO", "Community intelligence: reviews, complaints, praise.", ""],
      ["MODEL-PARAMS", "Quant modeler: writes the sim_spec.", ""],
      ["SIMULATE", "Python backend: Monte Carlo, utility, ranking, sensitivity.", "sim"],
      ["MODEL-INTERPRET", "Result reader: explains computed output.", ""],
      ["DEVIL", "Adversarial critic: attacks the top option.", ""],
      ["SAGE", "Trend forecaster: 5 to 10 years ahead.", ""],
      ["NEXUS", "Decision architect: final synthesis.", ""],
      ["MIRROR", "Process reviewer: flags blind spots.", ""]
    ];
    var legend = '<div class="de-agentlegend">' + legendRoles.map(function (r) {
      return '<div class="de-al ' + r[2] + '"><b>' + esc(r[0]) + "</b>" + esc(r[1]) + "</div>";
    }).join("") + "</div>";
    return '<div class="de-orbit de-reveal">' + svg + "</div>" + legend;
  }
  function distPanel() {
    var O = [
      { nm: "Option A", rk: "2", peak: 0.58, spread: 0.62, med: "64", band: "41 to 82", note: "higher median, wider tail", badge: "fragile", lead: false },
      { nm: "Option B", rk: "3", peak: 0.46, spread: 0.34, med: "55", band: "47 to 63", note: "lower median, stable range", badge: "stable", lead: false },
      { nm: "Option C", rk: "1", peak: 0.66, spread: 0.74, med: "68", band: "38 to 90", note: "high upside, high downside", badge: "fragile", lead: true }
    ];
    return '<div class="de-dist de-reveal" data-de-dist="1">' + O.map(function (o) {
      return '<div class="de-optcard' + (o.lead ? " lead" : "") + '"><div class="de-oc-h"><span class="nm">' + esc(o.nm) + '</span><span class="rk">#' + o.rk + '</span></div>' +
        '<div class="de-oc-curve">' + densityCurve(o.peak, o.spread, o.lead ? "#2a6fdb" : "#6b7480") + "</div>" +
        '<div class="de-oc-row"><span>Median utility</span><b>' + o.med + '</b></div>' +
        '<div class="de-oc-row"><span>P10 to P90</span><b>' + o.band + '</b></div>' +
        '<div class="de-oc-row"><span>' + esc(o.note) + '</span></div>' +
        '<span class="de-badge ' + o.badge + '">' + (o.badge === "stable" ? "Rank stable" : "Rank fragile") + "</span></div>";
    }).join("") + "</div>";
  }
  function leversPanel() {
    var L = [["Cost weight", 0.4, "\u00b120%"], ["Career upside weight", 0.62, "\u00b120%"], ["Risk scenario probability", 0.3, "\u00b120%"], ["Quality-of-life weight", 0.5, "\u00b120%"]];
    return '<div class="de-levers de-reveal">' + L.map(function (l) {
      return '<div class="de-lever"><span class="nm">' + esc(l[0]) + '</span><span class="track"><i style="left:' + (l[1] * 100) + '%"></i></span><span class="pm">' + l[2] + "</span></div>";
    }).join("") +
      '<div class="de-leverout"><span class="stable">Ranking stable</span><span class="flip">Ranking flips if risk scenario rises</span><span class="lev">Most sensitive: risk scenario probability</span></div></div>';
  }
  function miniBuilder() {
    return '<div class="de-ix-h de-reveal" style="font:700 12px \'Archivo\',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:#14181f;margin:24px 0 14px;display:flex;align-items:center;gap:9px;"><span style="font:800 10px \'Archivo\',sans-serif;letter-spacing:0.1em;color:#fff;background:#2a6fdb;border-radius:999px;padding:3px 9px;">Illustrative</span>Mini decision model</div>' +
      '<div class="de-builder de-reveal" data-de-builder="1"><div class="de-builder-grid">' +
        '<div class="de-bctl">' +
          ctl("Career upside", "career", 62) + ctl("Cost", "cost", 40) + ctl("Stability", "stability", 55) + ctl("Quality of life", "qol", 50) +
          '<div class="de-bscenario" role="group" aria-label="Scenario"><button type="button" data-scn="base" class="on">Baseline</button><button type="button" data-scn="up">Upside</button><button type="button" data-scn="down">Downside</button></div>' +
        '</div>' +
        '<div class="de-bout" data-role="out"></div>' +
      '</div><div class="de-cap">Illustrative mini model with example data. Not a live calculator.</div></div>';
    function ctl(label, key, val) {
      return '<label><span class="lab">' + esc(label) + ' weight <b data-out="' + key + '">' + val + '</b></span><input type="range" min="0" max="100" value="' + val + '" data-w="' + key + '" aria-label="' + esc(label) + ' weight"></label>';
    }
  }
  function explodedArch() {
    var L = [
      ["Frontend", "index.html", "Single-page form, pipeline dashboard, activity log, and report rendering.", "serves"],
      ["Prompt layer", "prompts.js", "Agent prompt builders and pipeline calls.", "builds prompts"],
      ["Local server", "server.py", "Serves the app, proxies LLM API calls, saves local input, exposes the simulator endpoint.", "proxies API"],
      ["Compute backend", "simulator.py", "Pure-Python Monte Carlo and sensitivity engine.", "runs /simulate"],
      ["Contract", "templates/sim_spec.example.json", "The contract example between the LLM layer and the simulator.", "validates contract"],
      ["Local runtime", "input/  data/  output/", "Local, gitignored runtime folders. The repo holds the framework, not private decisions.", "writes local files"]
    ];
    var out = '<div class="de-explode de-reveal">';
    L.forEach(function (l, i) {
      out += '<div class="de-layer"><div><div class="ly">' + esc(l[0]) + '</div></div><div><div class="file">' + esc(l[1]) + '</div><div class="desc">' + esc(l[2]) + "</div></div></div>";
      if (i < L.length - 1) out += '<div class="de-connlabel" aria-hidden="true">&#8595; ' + esc(l[3]) + "</div>";
    });
    out += "</div>";
    return out;
  }
  function reportSheet() {
    return '<div class="de-report de-reveal" data-de-report="1"><div class="de-rtabs" data-role="tabs"></div><div class="de-rbody" data-role="body"></div></div>';
  }
  function githubCard() {
    var gh = '<svg class="de-ghicon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
    return '<div class="de-ghcard de-reveal">' + gh +
      '<div class="de-ghmain"><div class="de-ghname">AI-powered-decision-analysis-engine</div>' +
      '<div class="de-ghdesc">8-agent AI decision framework with a deterministic Monte Carlo backend. The LLM picks priors; Python runs the math.</div></div>' +
      '<a class="de-cta" href="' + REPO + '" target="_blank" rel="noopener">' + gh.replace("de-ghicon", "gh") + "View GitHub</a></div>";
  }

  /* ---------- article ---------- */
  window.__decisionEngineArticle = function (data) {
    var H = STYLE;

    H += '<div class="ai-controls de-controls">' +
      '<span class="de-brand" style="display:inline-flex;align-items:center;gap:8px;flex:none;font:800 11px \'Archivo\',sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:#d6006c;"><i style="width:9px;height:9px;border-radius:2px;background:#2a6fdb;display:inline-block;"></i>GitHub Project</span>' +
      '<nav class="ai-index" aria-label="Section index"></nav></div>';
    H += '<div class="ai-progress" data-de-progress="1"><i></i></div>';

    /* HERO */
    H += '<section class="ca-section ai-sec de-sec" id="de-sec-hero" data-de-label="Overview">' +
      '<div class="ca-kicker">GitHub Project &middot; Decision Systems</div>' +
      '<h1 class="ca-title">AI Decision Engine</h1>' +
      '<div class="ai-role">A local-first decision-analysis tool: LLMs structure, Python computes</div>' +
      '<p class="de-lede">A local-first decision-analysis tool that turns open-ended choices into structured utility models, Monte Carlo simulations, adversarial reviews, and transparent decision reports.</p>' +
      p("Most AI decision tools stop at structured advice. AI Decision Engine adds a computable layer.") +
      p("The product takes an open-ended decision, turns it into options, scenarios, utility dimensions, prior distributions, and risk assumptions, then runs a deterministic Python Monte Carlo simulation. The LLM frames the problem and writes the model specification. The user reviews the assumptions. Python computes the numbers.") +
      '<a class="de-cta de-reveal" href="' + REPO + '" target="_blank" rel="noopener"><svg class="gh" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>View GitHub</a>' +
      '<div class="de-sidelabels de-reveal"><span>Local app</span><span>Single-page frontend</span><span>Python server</span><span>LLM agents</span><span>Monte Carlo backend</span><span>Sensitivity analysis</span><span>Transparent report</span></div>' +
      heroCockpit() +
      githubCard() +
      "</section>";

    /* 1 problem */
    H += sec("problem", "From Advice to Decision Modeling", "The Weak Point Is the Prompt",
      p("A normal AI decision workflow begins with a prompt and ends with a recommendation. By the time a user describes a decision, the framing already contains missing information, hidden preferences, selective facts, and emotional bias.") +
      p("AI Decision Engine changes the shape of the task. The model first builds a decision structure: what the options are, which dimensions matter, what future scenarios to consider, what risks need pricing, and how personal priorities should affect utility. The division of labor is simple: LLMs structure and challenge the decision, Python computes the simulation, and the user reviews the assumptions.") +
      splitScreen());

    /* 2 how it works */
    H += sec("flow", "How the Product Works", "Six Steps from Decision to Report",
      p("The user enters the decision, background, candidate options, goals, priorities, concerns, and self-assessment traits. The first agent generates an analytical framework, and the user reviews it before the pipeline continues. Two research agents run in parallel: ORACLE checks official facts, ECHO gathers community sentiment. The modeling agent then converts the framework and research into a sim_spec contract, and the simulator runs Monte Carlo, normalizes outcomes to utility, ranks the options, and tests whether the ranking flips when assumptions move.") +
      storyboard());

    /* 3 boundary */
    H += sec("boundary", "The Key Boundary", "LLMs Structure. Python Computes.",
      p("The most important architectural rule is the boundary between language and computation. The LLM does not invent simulation results. It selects prior distributions from a fixed menu and fills parameters for each outcome, option, and scenario. The simulator validates the specification, samples trajectories, normalizes outcomes to a 0 to 100 utility scale, computes weighted utility, ranks options, and runs sensitivity analysis.") +
      boundary() +
      ownershipToggle());

    /* 4 contract */
    H += sec("contract", "The Simulation Contract", "sim_spec Is the Handoff",
      p("sim_spec is the contract between the LLM layer and the simulator. It contains the decision options, future scenarios, outcome dimensions, utility weights, directions, expected ranges, and a probability distribution for every option, scenario, and outcome combination. The simulator accepts a closed distribution menu and rejects unknown distribution names or invalid parameters before simulation. Select a field to see what it means.") +
      contractCard());

    /* 5 agents */
    H += sec("agents", "Eight Agents Around One Simulator", "Roles, Not a Voting Committee",
      p("The product uses a multi-agent workflow, but the agents are not a voting committee. Each role owns a specific part of the decision process, and the numerical core stays outside the LLM. Nine reasoning agents surround one deterministic Python simulator.") +
      agentOrbit());

    /* 6 rationality */
    H += sec("rationality", "Rationality as a Product Feature", "Utility Distributions, Not a Single Score",
      p("A decision is modeled through payoff, risk, probability, personal preference, opportunity cost, and future scenarios. Every option receives a utility distribution rather than a single score, and the simulator shows where the result is stable and where it depends on a fragile assumption. Sensitivity analysis perturbs outcome weights and scenario probabilities by plus or minus 20%. If a small assumption change flips the ranking, the report says so.") +
      distPanel() +
      leversPanel() +
      miniBuilder());

    /* 7 architecture */
    H += sec("architecture", "Local Product Architecture", "A Lightweight, Local-First App",
      p("The project is intentionally lightweight. A single-page frontend renders the form, dashboard, log, and report. A local Python server serves the app, proxies LLM calls, and exposes the simulator endpoint. A pure-Python engine runs Monte Carlo and sensitivity. Runtime folders stay local and gitignored, so the repository contains the framework, not the user's private decisions.") +
      explodedArch());

    /* 8 report */
    H += sec("report", "What the Final Report Gives Back", "More Than Naming a Winner",
      p("The final report explains the ranking, the utility gap, the conditions under which the result holds, the biggest risk for each option, the most sensitive assumptions, the adversarial critique, the forward-looking context, and the concrete next steps. A decision can be a strong recommendation, a same-tier result, or an insufficient-data result. When options are close or unstable, the report says so rather than forcing false certainty.") +
      reportSheet());

    /* 9 demonstrates */
    H += sec("project", "What This Project Demonstrates", "AI to Structure, Code to Compute",
      p("AI Decision Engine demonstrates a product pattern for applied AI systems: use language models to structure messy human context, then hand off computation to deterministic code. It combines multi-agent reasoning, user-reviewed assumptions, JSON contracts, local-first architecture, Monte Carlo simulation, sensitivity analysis, adversarial review, and report generation in one working tool.") +
      p("It shows how AI can support personal and professional decisions without turning the LLM into the calculator.") +
      '<div class="ca-foot"><span>GitHub Project &middot; AI Decision Engine</span><span>Zhenyuan Pan &middot; 2026</span></div>');

    return (
      '<button class="case-close" type="button" aria-label="Close article"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll de-scroll"><article class="case-article ai-article de-article">' + H + "</article></div>"
    );
  };

  /* ================= viz ================= */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wireIndexAndProgress(scroller) {
    var nav = scroller.querySelector(".de-controls .ai-index");
    var secs = [].slice.call(scroller.querySelectorAll(".de-sec[data-de-label]"));
    if (!nav) return;
    var links = [];
    secs.forEach(function (s) {
      var a = document.createElement("button");
      a.type = "button"; a.className = "ai-ix"; a.textContent = s.getAttribute("data-de-label"); a.setAttribute("data-target", s.id);
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

  function wireOwnership(scroller) {
    var box = scroller.querySelector("[data-de-own]");
    if (!box) return;
    var tabs = box.querySelector('[data-role="tabs"]');
    var panel = box.querySelector('[data-role="panel"]');
    STAGES.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "de-otab " + (s.owner === "Python" ? "py" : "llm") + (i === 0 ? " on" : "");
      b.textContent = s.id;
      b.addEventListener("click", function () {
        tabs.querySelectorAll(".de-otab").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); render(s);
      });
      tabs.appendChild(b);
    });
    function render(s) {
      var py = s.owner === "Python";
      panel.innerHTML = '<div class="de-obadge ' + (py ? "py" : "llm") + '">' + esc(s.owner) + "</div><div>" +
        '<div class="de-ofield"><div class="k">Input</div><div class="v">' + esc(s.input) + "</div></div>" +
        '<div class="de-ofield"><div class="k">Output</div><div class="v">' + esc(s.output) + "</div></div>" +
        '<div class="de-ofield mustnot"><div class="k">Must not</div><div class="v">' + esc(s.mustnot) + "</div></div></div>";
    }
    render(STAGES[0]);
  }

  function wireSpec(scroller) {
    var detail = scroller.querySelector('[data-role="specdetail"]');
    var fields = [].slice.call(scroller.querySelectorAll(".de-field[data-spec]"));
    if (!detail || !fields.length) return;
    function render(i) {
      var f = SPECFIELDS[i];
      fields.forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-spec") === i); });
      detail.innerHTML = '<div class="k">' + esc(f.f) + '</div><div class="v">' + esc(f.meaning) + '</div><div class="ex">' + esc(f.ex) + "</div>";
    }
    fields.forEach(function (b) { b.addEventListener("click", function () { render(+b.getAttribute("data-spec")); }); });
    render(0);
  }

  function wireReport(scroller) {
    var box = scroller.querySelector("[data-de-report]");
    if (!box) return;
    var tabs = box.querySelector('[data-role="tabs"]');
    var body = box.querySelector('[data-role="body"]');
    REPORT_KEYS.forEach(function (k, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "de-rtab" + (i === 0 ? " on" : ""); b.textContent = k;
      b.addEventListener("click", function () {
        tabs.querySelectorAll(".de-rtab").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); render(k);
      });
      tabs.appendChild(b);
    });
    function render(k) {
      var r = REPORT[k];
      body.innerHTML = (r.reco ? '<span class="reco">' + esc(r.reco) + "</span>" : "") + "<h4>" + esc(r.h) + "</h4><p>" + esc(r.b) + "</p>";
    }
    render(REPORT_KEYS[0]);
  }

  function wireBuilder(scroller) {
    var box = scroller.querySelector("[data-de-builder]");
    if (!box) return;
    var out = box.querySelector('[data-role="out"]');
    var ws = {}; box.querySelectorAll("input[data-w]").forEach(function (n) { ws[n.getAttribute("data-w")] = n; });
    var scn = "base";
    function compute() {
      var w = { career: +ws.career.value, cost: +ws.cost.value, stability: +ws.stability.value, qol: +ws.qol.value };
      box.querySelectorAll("input[data-w]").forEach(function (n) { var o = box.querySelector('[data-out="' + n.getAttribute("data-w") + '"]'); if (o) o.textContent = n.value; });
      var wsum = w.career + w.cost + w.stability + w.qol || 1;
      var rows = BUILD_OPTS.map(function (op) {
        var s = { career: op.s.career, cost: op.s.cost, stability: op.s.stability, qol: op.s.qol };
        if (scn === "up") s[op.riskDim] = Math.min(100, s[op.riskDim] + 14);
        if (scn === "down") s[op.riskDim] = Math.max(0, s[op.riskDim] - 18);
        var u = (s.career * w.career + s.cost * w.cost + s.stability * w.stability + s.qol * w.qol) / wsum;
        return { nm: op.nm, u: u };
      });
      rows.sort(function (a, b) { return b.u - a.u; });
      var max = Math.max.apply(null, rows.map(function (r) { return r.u; })) || 1;
      out.innerHTML = rows.map(function (r, i) {
        return '<div class="de-bbar' + (i === 0 ? " lead" : "") + '"><div class="top"><span>' + esc(r.nm) + '</span><span><b>' + r.u.toFixed(0) + '</b> &nbsp;<span class="rk">#' + (i + 1) + "</span></span></div>" +
          '<div class="track"><i style="width:' + (r.u / max * 100).toFixed(1) + '%"></i></div></div>';
      }).join("");
    }
    box.querySelectorAll("input[data-w]").forEach(function (n) { n.addEventListener("input", compute); });
    box.querySelectorAll(".de-bscenario button").forEach(function (b) {
      b.addEventListener("click", function () {
        scn = b.getAttribute("data-scn");
        box.querySelectorAll(".de-bscenario button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); compute();
      });
    });
    compute();
  }

  function wireMCParticles(scroller) {
    if (REDUCED) return;
    var panels = scroller.querySelectorAll("[data-de-dist]");
    panels.forEach(function (panel) {
      panel.querySelectorAll(".de-oc-curve").forEach(function (cv) {
        for (var i = 0; i < 4; i++) {
          var dot = document.createElement("span");
          dot.className = "de-mcparticle";
          dot.style.cssText = "position:absolute;width:4px;height:4px;border-radius:50%;background:#2a6fdb;left:" + (18 + i * 22) + "%;top:0;animation-delay:" + (i * 0.6) + "s;";
          cv.style.position = "relative";
          cv.appendChild(dot);
        }
      });
    });
  }

  window.__decisionEngineViz = {
    init: function (scroller) {
      if (!scroller || scroller.__deDone) return;
      if (!scroller.querySelector(".de-article")) return;
      scroller.__deDone = true;
      try {
        wireIndexAndProgress(scroller);
        wireOwnership(scroller);
        wireSpec(scroller);
        wireReport(scroller);
        wireBuilder(scroller);
        wireMCParticles(scroller);
      } catch (err) { if (window.console) console.warn("decisionengine-viz", err); }
    }
  };
})();
