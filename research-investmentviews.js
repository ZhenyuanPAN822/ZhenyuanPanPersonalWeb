/* research-investmentviews.js : "Betting One Layer Down" investment-views article.
   Opens from the green Investment Views card in the Markets & Quant section.

   Exposes:
     window.__investmentViewsArticle(data) -> full overlay HTML string
     window.__investmentViewsViz.init(scroller) -> sticky index + progress,
        hero layer-map navigation, and the interactive bet map. Loop and draw
        animations are CSS-only (robust: they cannot get stuck off-screen).

   Visual language is a "markets memo": green accent that ties to the green card,
   monospace tickers, restrained ledger lines. Each view gets its own diagram so
   the section does not feel repetitive. No em or en dashes in copy (project rule).
*/
(function () {
  "use strict";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function p(t) { return '<p class="ca-p">' + t + "</p>"; }
  function lede(t) { return '<p class="iv-lede iv-reveal">' + t + "</p>"; }
  function sec(id, label, title, inner) {
    return '<section class="ca-section ai-sec iv-sec" id="iv-sec-' + id + '" data-iv-label="' + esc(label) + '">' +
      '<div class="ca-h">' + esc(label) + "</div>" +
      (title ? '<h3 class="ca-sub iv-h2">' + esc(title) + "</h3>" : "") + inner + "</section>";
  }

  /* ---------- scoped styles ---------- */
  var STYLE = '<style id="iv-style">' + [
    '.iv-article{--grn:#15725e;--grn2:#1f8a5b;--ink:#14181f;--mut:#5a626e;--line:#e7e9ee;--soft:#f1f6f3;--mag:#d6006c;--dn:#c0392b;--mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;}',
    '.iv-h2{max-width:30ch;margin-bottom:16px;}',
    '.iv-sec{padding-top:clamp(8px,1.6vh,22px);}',
    '.iv-lede{font-size:clamp(17px,1.5vw,21px);line-height:1.5;color:#2c333d;max-width:64ch;margin:0 0 14px;text-wrap:pretty;font-weight:500;border-left:3px solid var(--grn);padding-left:16px;}',
    /* reveal: CSS-only, always ends visible */
    '.iv-reveal{animation:ivRise .7s cubic-bezier(.2,.7,.2,1) both;}',
    '@keyframes ivRise{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}',
    '.iv-fig{margin:20px 0 6px;}',
    '.iv-cap{font-size:12px;color:var(--mut);margin-top:11px;line-height:1.5;max-width:62ch;}',
    '.iv-figh{font:700 10.5px "Archivo",sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:var(--mut);margin:0 0 12px;display:flex;align-items:center;gap:8px;}',
    '.iv-figh::before{content:"";width:14px;height:2px;background:var(--grn);}',
    /* ---- hero layer map ---- */
    '.iv-map{margin:22px 0 6px;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff;}',
    '.iv-mrow{display:grid;grid-template-columns:54px 150px 1fr auto;align-items:center;gap:16px;width:100%;text-align:left;background:none;border:0;border-top:1px solid var(--line);padding:15px 18px;cursor:pointer;font:inherit;transition:background .18s;}',
    '.iv-map .iv-mrow:first-child{border-top:0;}',
    '.iv-mrow:hover{background:var(--soft);}',
    '.iv-mrow.on{background:var(--soft);box-shadow:inset 3px 0 0 var(--grn);}',
    '.iv-mnum{font:800 13px var(--mono);color:#fff;background:var(--grn);width:34px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:6px;letter-spacing:.04em;}',
    '.iv-mrow.side .iv-mnum{background:var(--ink);}',
    '.iv-mlayer{font:700 14px "Archivo",sans-serif;color:var(--ink);}',
    '.iv-mthesis{font-size:14px;color:var(--mut);line-height:1.4;text-wrap:pretty;}',
    '.iv-mtks{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;}',
    '.iv-mtks i{font:700 11px var(--mono);color:var(--grn);border:1px solid #cfe0d8;background:#f3f8f5;border-radius:5px;padding:3px 7px;font-style:normal;}',
    '.iv-mdiv{font:700 9.5px "Archivo",sans-serif;letter-spacing:0.16em;text-transform:uppercase;color:var(--mut);background:#fafbfb;border-top:1px solid var(--line);padding:7px 18px;}',
    /* ---- exposure block ---- */
    '.iv-exp{margin:18px 0 2px;border:1px solid var(--line);border-left:3px solid var(--grn);border-radius:0 10px 10px 0;background:#fcfdfc;padding:15px 18px;}',
    '.iv-exp-h{font:700 10px "Archivo",sans-serif;letter-spacing:0.14em;text-transform:uppercase;color:var(--grn);margin-bottom:11px;}',
    '.iv-exp-list{display:flex;flex-direction:column;gap:10px;}',
    '.iv-tk{display:grid;grid-template-columns:74px 1fr;gap:14px;align-items:baseline;}',
    '.iv-tk-s{font:800 14px var(--mono);color:var(--ink);letter-spacing:.02em;}',
    '.iv-tk-w{font-size:13.5px;color:var(--mut);line-height:1.45;text-wrap:pretty;}',
    /* ---- markdown pipeline ---- */
    '.iv-pipe{border:1px solid var(--line);border-radius:12px;background:linear-gradient(180deg,#fcfdfc,#fff);padding:20px 18px 16px;}',
    '.iv-pipe-track{display:flex;align-items:stretch;gap:0;flex-wrap:wrap;}',
    '.iv-stage{flex:1 1 110px;min-width:96px;background:#fff;border:1px solid var(--line);border-radius:9px;padding:11px 12px;}',
    '.iv-stage .k{font:800 10px var(--mono);color:var(--grn);}',
    '.iv-stage .r{font:700 13.5px "Archivo",sans-serif;color:var(--ink);margin-top:3px;}',
    '.iv-stage .d{font-size:11px;color:var(--mut);margin-top:3px;line-height:1.35;}',
    '.iv-conn{flex:0 0 78px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:0 2px;}',
    '.iv-file{font:700 10px var(--mono);color:var(--ink);background:#f3f8f5;border:1px solid #cfe0d8;border-radius:5px;padding:3px 6px;display:flex;align-items:center;gap:4px;white-space:nowrap;transition:box-shadow .25s,border-color .25s;animation:ivFile 3.2s ease-in-out infinite;animation-delay:calc(var(--i) * .6s);}',
    '.iv-file svg{width:9px;height:11px;flex:none;}',
    '.iv-arrow{width:100%;height:2px;background:var(--line);position:relative;border-radius:2px;}',
    '.iv-arrow::after{content:"";position:absolute;top:-3px;right:-1px;border-left:6px solid var(--line);border-top:4px solid transparent;border-bottom:4px solid transparent;}',
    '@keyframes ivFile{0%,100%{box-shadow:0 0 0 0 rgba(21,114,94,0);border-color:#cfe0d8;}45%{box-shadow:0 0 0 4px rgba(21,114,94,0.14);border-color:var(--grn);}}',
    '.iv-pipe-out{flex:0 0 100%;display:flex;justify-content:flex-end;margin-top:12px;}',
    '.iv-pipe-out .iv-file{background:var(--grn);color:#fff;border-color:var(--grn);}',
    '.iv-pipe-out .iv-file svg{stroke:#fff;}',
    /* ---- token bars ---- */
    '.iv-tok{border:1px solid var(--line);border-radius:12px;background:#fff;padding:16px 18px;margin-top:14px;}',
    '.iv-tok-row{display:grid;grid-template-columns:108px 1fr;align-items:center;gap:14px;margin-top:9px;}',
    '.iv-tok-row:first-of-type{margin-top:0;}',
    '.iv-tok-k{font:700 12px "Archivo",sans-serif;color:var(--ink);}',
    '.iv-tok-bar{height:18px;background:#f3f4f6;border-radius:5px;overflow:hidden;}',
    '.iv-tok-bar i{display:block;height:100%;background:repeating-linear-gradient(135deg,#d3d7dd,#d3d7dd 6px,#e7e9ee 6px,#e7e9ee 12px);border-radius:5px;}',
    '.iv-tok-bar i.sm{background:var(--grn);}',
    /* ---- dual panels (ceiling + ladder) ---- */
    '.iv-panels{display:grid;grid-template-columns:1.05fr .95fr;gap:14px;}',
    '.iv-panel{border:1px solid var(--line);border-radius:12px;background:#fff;padding:16px 16px 14px;}',
    '.iv-panel h5{font:700 12px "Archivo",sans-serif;color:var(--ink);margin:0 0 4px;}',
    '.iv-panel .sub{font-size:11.5px;color:var(--mut);margin:0 0 12px;line-height:1.4;}',
    '.iv-ceil svg,.iv-ladder svg{width:100%;height:auto;display:block;}',
    '.iv-ceil-benefit{fill:none;stroke:var(--grn);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;}',
    '.iv-ceil-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:ivDraw 1.5s ease forwards .25s;}',
    '@keyframes ivDraw{to{stroke-dashoffset:0;}}',
    '.iv-ceil-cost{fill:none;stroke:var(--mut);stroke-width:2;stroke-dasharray:1 5;stroke-linecap:round;}',
    '.iv-ceil-cap{stroke:var(--mag);stroke-width:1.4;stroke-dasharray:4 4;}',
    '.iv-leg{display:flex;gap:14px;flex-wrap:wrap;margin-top:9px;font-size:11px;color:var(--mut);}',
    '.iv-leg span{display:inline-flex;align-items:center;gap:5px;}',
    '.iv-leg i{width:14px;height:0;border-top:2.4px solid var(--grn);display:inline-block;}',
    '.iv-leg i.c{border-top:2px dotted var(--mut);}',
    '.iv-leg i.cap{border-top:2px dashed var(--mag);}',
    /* data ladder */
    '.iv-ladder-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:end;}',
    '.iv-lad{display:flex;flex-direction:column-reverse;gap:5px;position:relative;padding-top:6px;}',
    '.iv-rung{height:15px;border-radius:3px;background:var(--mut);opacity:.85;}',
    '.iv-lad.h .iv-rung{background:#b9c0c9;}',
    '.iv-lad.o .iv-rung{background:var(--grn);}',
    '.iv-lad .cap{position:absolute;left:-2px;right:-2px;border-top:2px dashed var(--dn);top:0;}',
    '.iv-lad .capl{position:absolute;top:-16px;left:0;font:700 9px "Archivo",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--dn);}',
    '.iv-lad-t{font:700 11px "Archivo",sans-serif;color:var(--ink);margin-top:9px;text-align:center;}',
    '.iv-lad-s{font-size:10.5px;color:var(--mut);text-align:center;margin-top:2px;line-height:1.35;}',
    /* ---- frames vs native ---- */
    '.iv-fn{border:1px solid var(--line);border-radius:12px;background:#fff;padding:18px;}',
    '.iv-fn-track{margin-bottom:18px;}',
    '.iv-fn-lab{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;gap:10px;}',
    '.iv-fn-lab b{font:700 12.5px "Archivo",sans-serif;color:var(--ink);}',
    '.iv-fn-lab span{font-size:11px;color:var(--mut);}',
    '.iv-fn-strip{position:relative;height:46px;border-radius:7px;overflow:hidden;}',
    '.iv-frames{display:flex;gap:5px;height:100%;}',
    '.iv-frames i{flex:1;background:linear-gradient(180deg,#e9edf1,#dfe4ea);border-radius:4px;}',
    '.iv-cont{height:100%;border-radius:6px;background:linear-gradient(90deg,#1f8a5b,#15725e,#1f8a5b);background-size:200% 100%;animation:ivPan 4s linear infinite;}',
    '@keyframes ivPan{to{background-position:200% 0;}}',
    '.iv-play{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--ink);box-shadow:0 0 0 1px rgba(255,255,255,.6);}',
    '.iv-play.step{animation:ivStep 4s steps(6) infinite;}',
    '.iv-play.glide{animation:ivGlide 4s linear infinite;}',
    '@keyframes ivStep{from{left:4%;}to{left:96%;}}',
    '@keyframes ivGlide{from{left:2%;}to{left:98%;}}',
    '.iv-meter{display:flex;align-items:center;gap:9px;margin-top:9px;}',
    '.iv-meter span{font:700 9.5px "Archivo",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);white-space:nowrap;}',
    '.iv-meter b{height:8px;border-radius:4px;display:block;}',
    '.iv-meter b.hi{width:78%;background:var(--dn);}',
    '.iv-meter b.lo{width:24%;background:var(--grn);}',
    '.iv-fn-flow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:15px;}',
    '.iv-fn-node{font:700 12px "Archivo",sans-serif;color:var(--ink);background:var(--soft);border:1px solid #cfe0d8;border-radius:7px;padding:8px 12px;}',
    '.iv-fn-node.end{background:var(--grn);color:#fff;border-color:var(--grn);}',
    '.iv-fn-ar{color:var(--grn);font-size:15px;}',
    /* ---- voice bars ---- */
    '.iv-voice{border:1px solid var(--line);border-radius:12px;background:#fff;padding:18px;}',
    '.iv-vrow{display:grid;grid-template-columns:96px 1fr 84px;align-items:center;gap:13px;margin-top:11px;}',
    '.iv-vrow:first-of-type{margin-top:0;}',
    '.iv-vrow .nm{font:700 13px "Archivo",sans-serif;color:var(--ink);}',
    '.iv-vbar{height:20px;background:#f3f4f6;border-radius:5px;overflow:hidden;}',
    '.iv-vbar i{display:block;height:100%;border-radius:5px;}',
    '.iv-vtag{font-size:11px;color:var(--mut);text-align:right;}',
    '.iv-vrow.best .nm{color:var(--grn);}',
    /* ---- code gate ---- */
    '.iv-gate{display:grid;grid-template-columns:1fr 92px 1fr;gap:0;align-items:stretch;border:1px solid var(--line);border-radius:12px;background:#fff;overflow:hidden;}',
    '.iv-gate-col{padding:16px 15px;}',
    '.iv-gate-col.mid{border-left:1px solid var(--line);border-right:1px solid var(--line);background:var(--soft);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}',
    '.iv-gate-h{font:700 10px "Archivo",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mut);margin-bottom:11px;}',
    '.iv-commit{display:flex;align-items:center;gap:8px;font:600 12px var(--mono);color:var(--ink);padding:6px 0;border-bottom:1px dashed var(--line);}',
    '.iv-commit:last-child{border-bottom:0;}',
    '.iv-commit .dot{width:8px;height:8px;border-radius:50%;flex:none;}',
    '.iv-commit.bad .dot{background:var(--dn);}.iv-commit.bad{color:var(--mut);}',
    '.iv-commit.ok .dot{background:var(--grn);}',
    '.iv-gate-ic{width:30px;height:30px;border-radius:7px;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:8px;}',
    '.iv-gate-t{font:700 12.5px "Archivo",sans-serif;color:var(--ink);line-height:1.25;}',
    '.iv-gate-s{font-size:10.5px;color:var(--mut);margin-top:4px;line-height:1.35;}',
    /* ---- bet map ---- */
    '.iv-betmap{border:1px solid var(--line);border-radius:12px;background:#fff;padding:18px;}',
    '.iv-bm-wrap{display:grid;grid-template-columns:1fr 240px;gap:18px;align-items:stretch;}',
    '.iv-bm-plot{position:relative;height:300px;margin:6px 0 26px 30px;border-left:1.5px solid var(--line);border-bottom:1.5px solid var(--line);background:linear-gradient(0deg,rgba(21,114,94,0.04),transparent 60%),repeating-linear-gradient(90deg,transparent,transparent 24%,rgba(20,24,31,0.04) 24%,rgba(20,24,31,0.04) calc(24% + 1px));}',
    '.iv-dot{position:absolute;transform:translate(-50%,50%);background:none;border:0;cursor:pointer;padding:0;display:flex;flex-direction:column;align-items:center;gap:3px;}',
    '.iv-dot i{width:13px;height:13px;border-radius:50%;background:var(--grn);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.18);transition:transform .16s;}',
    '.iv-dot.side i{background:var(--ink);}',
    '.iv-dot span{font:700 10px var(--mono);color:var(--ink);background:rgba(255,255,255,.82);padding:0 3px;border-radius:3px;}',
    '.iv-dot:hover i{transform:scale(1.28);}',
    '.iv-dot.on i{transform:scale(1.4);box-shadow:0 0 0 4px rgba(21,114,94,.18),0 1px 4px rgba(0,0,0,.2);}',
    '.iv-bm-yl{position:absolute;left:-22px;top:50%;transform:rotate(-90deg) translateX(50%);transform-origin:left center;font:700 9px "Archivo",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mut);white-space:nowrap;}',
    '.iv-bm-xl{position:absolute;left:0;right:0;bottom:-22px;text-align:center;font:700 9px "Archivo",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mut);}',
    '.iv-bm-detail{border:1px solid var(--line);border-radius:10px;background:#fcfdfc;padding:16px;display:flex;flex-direction:column;}',
    '.iv-bm-tk{font:800 22px var(--mono);color:var(--ink);}',
    '.iv-bm-layer{font:700 10px "Archivo",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--grn);margin-top:4px;}',
    '.iv-bm-why{font-size:13px;color:var(--mut);line-height:1.5;margin-top:11px;text-wrap:pretty;}',
    '.iv-bm-hint{font-size:11px;color:var(--mut);margin-top:auto;padding-top:12px;}',
    /* ---- closing note ---- */
    '.iv-note{margin-top:20px;border-top:1px solid var(--line);padding-top:14px;font-size:11.5px;color:var(--mut);line-height:1.5;font-style:italic;max-width:64ch;}',
    /* ---- responsive ---- */
    '@media (max-width:820px){',
    '.iv-mrow{grid-template-columns:44px 1fr;row-gap:6px;}',
    '.iv-mthesis{grid-column:1 / -1;}.iv-mtks{grid-column:1 / -1;justify-content:flex-start;}',
    '.iv-panels{grid-template-columns:1fr;}',
    '.iv-bm-wrap{grid-template-columns:1fr;}',
    '.iv-conn{flex-basis:60px;}',
    '}',
    '@media (prefers-reduced-motion:reduce){.iv-reveal,.iv-file,.iv-cont,.iv-play,.iv-ceil-draw{animation:none!important;}.iv-ceil-draw{stroke-dashoffset:0;}}'
  ].join("") + "</style>";

  /* ---------- diagram builders ---------- */
  function heroMap() {
    var main = [
      ["L1", "build", "Build Layer", "Markdown is the working memory of real AI systems.", ["TEAM"]],
      ["L2", "intel", "Intelligence Layer", "Physical AI breaks the human-data ceiling.", ["SDGR"]],
      ["L3", "percept", "Perception Layer", "Video becomes a native input.", ["ADBE", "AMBA", "GETY"]]
    ];
    var side = [
      ["A", "voice", "Input Layer", "Voice is the new keyboard.", ["SOUN"]],
      ["B", "code", "Quality Layer", "AI-written code still needs review.", ["GTLB"]]
    ];
    function row(r, isSide) {
      return '<button type="button" class="iv-mrow' + (isSide ? " side" : "") + '" data-iv-jump="' + r[1] + '">' +
        '<span class="iv-mnum">' + r[0] + "</span>" +
        '<span class="iv-mlayer">' + esc(r[2]) + "</span>" +
        '<span class="iv-mthesis">' + esc(r[3]) + "</span>" +
        '<span class="iv-mtks">' + r[4].map(function (t) { return "<i>" + t + "</i>"; }).join("") + "</span>" +
        "</button>";
    }
    return '<div class="iv-map iv-reveal" data-iv-map="1">' +
      main.map(function (r) { return row(r, false); }).join("") +
      '<div class="iv-mdiv">Side bets</div>' +
      side.map(function (r) { return row(r, true); }).join("") +
      "</div>";
  }

  function exposure(items) {
    return '<div class="iv-exp iv-reveal"><div class="iv-exp-h">Representative public exposure</div>' +
      '<div class="iv-exp-list">' + items.map(function (x) {
        return '<div class="iv-tk"><span class="iv-tk-s">' + x[0] + '</span><span class="iv-tk-w">' + esc(x[1]) + "</span></div>";
      }).join("") + "</div></div>";
  }

  var DOC = '<svg viewBox="0 0 12 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 1 H8 L10 3 V13 H2 Z"/><path d="M4 6 H8 M4 9 H8"/></svg>';

  function mdPipeline() {
    var stages = [
      ["01", "Brief", "inputs + prompts"],
      ["02", "Plan", "method + steps"],
      ["03", "Results", "tables + checks"],
      ["04", "Draft", "assembled output"]
    ];
    var files = ["01_brief.md", "02_plan.md", "03_results.md"];
    var html = '<div class="iv-fig iv-pipe iv-reveal"><div class="iv-figh">The pipeline, not the chat</div><div class="iv-pipe-track">';
    stages.forEach(function (s, i) {
      html += '<div class="iv-stage"><div class="k">' + s[0] + '</div><div class="r">' + esc(s[1]) + '</div><div class="d">' + esc(s[2]) + "</div></div>";
      if (i < files.length) {
        html += '<div class="iv-conn"><span class="iv-file" style="--i:' + i + '">' + DOC + files[i] + '</span><span class="iv-arrow"></span></div>';
      }
    });
    html += "</div>";
    html += '<div class="iv-pipe-out"><span class="iv-file">' + DOC + '04_manuscript.md</span></div>';
    html += '<div class="iv-cap">Each stage reads the Markdown file on its left and writes the file on its right. State lives in the files, so the work can be versioned, inspected, and resumed. The model is the worker passing through.</div>';
    return html + "</div>";
  }

  function tokenBars() {
    return '<div class="iv-fig iv-tok iv-reveal"><div class="iv-figh">Same content, token weight</div>' +
      '<div class="iv-tok-row"><span class="iv-tok-k">HTML markup</span><span class="iv-tok-bar"><i style="width:100%"></i></span></div>' +
      '<div class="iv-tok-row"><span class="iv-tok-k">Markdown</span><span class="iv-tok-bar"><i class="sm" style="width:22%"></i></span></div>' +
      '<div class="iv-cap">Illustrative. Markdown carries the same state at a fraction of the token cost, which is why it works better than HTML or JSON as durable AI working memory.</div></div>';
  }

  function ceilingPanel() {
    return '<div class="iv-panel iv-ceil"><h5>The reasoning ceiling</h5><p class="sub">Benefit per model generation is flattening while cost holds.</p>' +
      '<svg viewBox="0 0 300 170" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="34" y1="14" x2="288" y2="14" class="iv-ceil-cap" pathLength="1"/>' +
      '<text x="36" y="11" font-family="Archivo,sans-serif" font-size="9" fill="#d6006c">Human expert ceiling</text>' +
      '<line x1="34" y1="150" x2="288" y2="150" stroke="#e7e9ee" stroke-width="1.5"/>' +
      '<line x1="34" y1="14" x2="34" y2="150" stroke="#e7e9ee" stroke-width="1.5"/>' +
      '<path class="iv-ceil-cost" d="M40,118 L120,114 L200,110 L280,108" pathLength="1"/>' +
      '<path class="iv-ceil-benefit iv-ceil-draw" d="M40,140 C95,96 150,52 200,36 C235,26 262,22 280,21" pathLength="1"/>' +
      '<text x="40" y="165" font-family="Archivo,sans-serif" font-size="8.5" fill="#5a626e">5pro</text>' +
      '<text x="118" y="165" font-family="Archivo,sans-serif" font-size="8.5" fill="#5a626e">5.1</text>' +
      '<text x="196" y="165" font-family="Archivo,sans-serif" font-size="8.5" fill="#5a626e">5.4</text>' +
      '<text x="268" y="165" font-family="Archivo,sans-serif" font-size="8.5" fill="#5a626e">5.5</text>' +
      "</svg>" +
      '<div class="iv-leg"><span><i></i>Capability gain</span><span><i class="c"></i>Cost</span><span><i class="cap"></i>Human ceiling</span></div></div>';
  }

  function ladderPanel() {
    function lad(cls, widths) {
      return '<div class="iv-lad ' + cls + '">' + widths.map(function (w) {
        return '<div class="iv-rung" style="width:' + w + '%"></div>';
      }).join("") + (cls === "h" ? '<div class="cap"></div><div class="capl">capped</div>' : "") + "</div>";
    }
    return '<div class="iv-panel iv-ladder"><h5>The data ladder</h5><p class="sub">Human labels stop at the human ceiling. Physical law keeps climbing.</p>' +
      '<div class="iv-ladder-cols">' +
      '<div>' + lad("h", [40, 55, 70, 82]) + '<div class="iv-lad-t">Human-annotated</div><div class="iv-lad-s">trains toward human judgment, no higher</div></div>' +
      '<div>' + lad("o", [38, 52, 66, 78, 88, 96]) + '<div class="iv-lad-t">Physical and bio-chem law</div><div class="iv-lad-s">objective signal, not capped by people</div></div>' +
      "</div></div>";
  }

  function framesNative() {
    var frames = "";
    for (var i = 0; i < 6; i++) frames += "<i></i>";
    return '<div class="iv-fig iv-fn iv-reveal"><div class="iv-figh">How AI reads video</div>' +
      '<div class="iv-fn-track">' +
      '<div class="iv-fn-lab"><b>Frame sampling, today</b><span>motion lost in the gaps</span></div>' +
      '<div class="iv-fn-strip"><div class="iv-frames">' + frames + '</div><span class="iv-play step"></span></div>' +
      '<div class="iv-meter"><span>Tokens</span><b class="hi"></b></div></div>' +
      '<div class="iv-fn-track">' +
      '<div class="iv-fn-lab"><b>Native video, next</b><span>continuous, motion preserved</span></div>' +
      '<div class="iv-fn-strip"><div class="iv-cont"></div><span class="iv-play glide"></span></div>' +
      '<div class="iv-meter"><span>Tokens</span><b class="lo"></b></div></div>' +
      '<div class="iv-fn-flow"><span class="iv-fn-node">Native video</span><span class="iv-fn-ar">&#8594;</span><span class="iv-fn-node">Perception stack</span><span class="iv-fn-ar">&#8594;</span><span class="iv-fn-node end">Physical AI</span></div>' +
      '<div class="iv-cap">The same shift images already made. Native video also becomes the perception layer that physical AI is trained and run on, which is why the two theses share one system.</div></div>';
  }

  function voiceBars() {
    var rows = [
      ["ChatGPT", 92, "most accurate", true],
      ["Claude", 64, "weaker", false],
      ["Gemini", 58, "weaker", false]
    ];
    return '<div class="iv-fig iv-voice iv-reveal"><div class="iv-figh">Voice-to-text, by daily use</div>' +
      rows.map(function (r) {
        return '<div class="iv-vrow' + (r[3] ? " best" : "") + '"><span class="nm">' + esc(r[0]) + '</span>' +
          '<span class="iv-vbar"><i style="width:' + r[1] + '%;background:' + (r[3] ? "var(--grn)" : "#b9c0c9") + '"></i></span>' +
          '<span class="iv-vtag">' + esc(r[2]) + "</span></div>";
      }).join("") +
      '<div class="iv-cap">Relative transcription accuracy from sustained personal use, not a formal benchmark. If input shifts to speech, that gap becomes the interface.</div></div>';
  }

  function codeGate() {
    var commits = [
      ["bad", "feat: ship it"],
      ["bad", "fix: works on my run"],
      ["ok", "refactor: typed + tested"],
      ["bad", "wip: TODO cleanup"]
    ];
    return '<div class="iv-fig iv-reveal"><div class="iv-figh">The review gate</div><div class="iv-gate">' +
      '<div class="iv-gate-col"><div class="iv-gate-h">AI-written commits</div>' +
      commits.map(function (c) { return '<div class="iv-commit ' + c[0] + '"><span class="dot"></span>' + esc(c[1]) + "</div>"; }).join("") +
      "</div>" +
      '<div class="iv-gate-col mid"><div class="iv-gate-ic"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8 L7 12 L13 4"/></svg></div><div class="iv-gate-t">Human-rule review + CI</div><div class="iv-gate-s">standards, security, tests, fit</div></div>' +
      '<div class="iv-gate-col"><div class="iv-gate-h">Production</div><div class="iv-commit ok"><span class="dot"></span>only what passes</div><div class="iv-gate-s" style="margin-top:10px">The rest bounces back for rework. At scale, this gate is the difference between code that runs and code that ships.</div></div>' +
      "</div></div>";
  }

  var BETS = [
    ["TEAM", "Build Layer", 18, 80, "Documents as the operating system of work. Obsidian is the private ideal; TEAM is the closest listed proxy for Markdown as AI memory.", false],
    ["GTLB", "Quality Layer", 26, 70, "Owns the review and CI gate that AI-written code has to pass before it reaches production.", true],
    ["ADBE", "Perception Layer", 36, 73, "AI-assisted editing deepens dependence on its tools as video work grows.", false],
    ["SOUN", "Input Layer", 31, 54, "Independent voice-AI pure play as human input shifts from typing to speech.", true],
    ["AMBA", "Perception Layer", 54, 58, "Native video understanding pushed onto cameras and edge sensors sells more chips.", false],
    ["GETY", "Perception Layer", 50, 43, "Licensed image and video material as training demand grows.", false],
    ["SDGR", "Intelligence Layer", 82, 75, "Physics-based simulation plus ML. Trains on chemistry and physics, not human labels. Long cycle, high conviction.", false]
  ];

  function betMap() {
    var dots = BETS.map(function (b, i) {
      return '<button type="button" class="iv-dot' + (b[5] ? " side" : "") + (i === 0 ? " on" : "") + '" data-i="' + i + '" style="left:' + b[2] + '%;bottom:' + b[3] + '%"><i></i><span>' + b[0] + "</span></button>";
    }).join("");
    return '<div class="iv-fig iv-betmap iv-reveal" data-iv-betmap="1"><div class="iv-bm-wrap">' +
      '<div class="iv-bm-plot">' + dots +
      '<span class="iv-bm-yl">Conviction / directness</span><span class="iv-bm-xl">Time to monetize: now to 5-10 years</span></div>' +
      '<div class="iv-bm-detail" data-role="detail"></div>' +
      "</div><div class=\"iv-cap\">Position is a qualitative read, not a price target. Higher means more direct exposure to the thesis; further right means a longer payoff.</div></div>";
  }

  /* ---------- article ---------- */
  window.__investmentViewsArticle = function (data) {
    var H = STYLE;

    H += '<div class="ai-controls iv-controls">' +
      '<span class="ac-brand" style="display:inline-flex;align-items:center;gap:8px;flex:none;font:800 11px \'Archivo\',sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:#15725e;"><i style="width:9px;height:9px;border-radius:2px;background:#15725e;display:inline-block;"></i>Investment Views</span>' +
      '<nav class="ai-index" aria-label="Section index"></nav></div>';
    H += '<div class="ai-progress" data-iv-progress="1"><i></i></div>';

    /* HERO */
    H += '<section class="ca-section ai-sec iv-sec" id="iv-sec-overview" data-iv-label="Overview">' +
      '<div class="ca-kicker">Investment Views</div>' +
      '<h1 class="ca-title">Betting One Layer Down</h1>' +
      lede("Five views on AI, ordered by their position in the stack. The web chatbot is already common knowledge and largely priced in. The more interesting edge sits one layer lower: how AI systems are built, where intelligence moves after the text-reasoning ceiling, and what inputs feed the next phase.") +
      p("Each view names the layer it sits in, the reason it matters, a diagram of the mechanism, and the public-market names that express it most directly. Start with the map, then read down.") +
      heroMap() +
      "</section>";

    /* 1 — build layer */
    H += sec("build", "The Build Layer", "Markdown is the substrate of real AI systems",
      lede("Serious AI systems are not built inside a single chat window. They are built from files that carry state across stages. The investable theme is tools that turn documents into AI working memory, with local, CLI-first agents gaining ground over web chat.") +
      p("A single chat thread and a finite context window are poor foundations for complex work. Context degrades, cannot be cleanly versioned, and is difficult to inspect or audit. Robust AI workflows usually move in the opposite direction: one stage reads the previous Markdown file, performs a defined task, and writes the next Markdown file. The files become the memory; the model is the worker passing through.") +
      mdPipeline() +
      p("Markdown is well suited to this role. HTML spends tokens on tags that add little meaning. JSON is useful for structured data but noisy for prose-heavy work. Markdown offers a high signal-to-token ratio and is a format that language models handle naturally. The broader thesis is that real agentic work belongs closer to the local file system than to chat bubbles.") +
      tokenBars() +
      exposure([["TEAM", "Documents as the operating system of work. The private ideal is Obsidian, which is not publicly investable, so TEAM is the listed proxy."]]));

    /* 2 — intelligence layer */
    H += sec("intel", "The Intelligence Layer", "Physical AI breaks the human-data ceiling",
      lede("Text reasoning appears to be reaching a ceiling. The next large gains are more likely to come from inputs not capped by human annotation. The richest source is the physical world, and the more attractive risk-adjusted exposure is Physical AI in biology and chemistry, rather than general-purpose robotics.") +
      p("The leading reasoning models show shrinking marginal benefit while marginal cost remains flat to rising. Two structural constraints explain the pressure.") +
      '<div class="iv-fig iv-panels iv-reveal">' + ceilingPanel() + ladderPanel() + "</div>" +
      p("The first is architectural. Human language is sequential and causal in time, while Transformers process information in parallel. Human language was never the native language of this machine. A more natural next step may be machine-to-machine representations rather than ever more polished human prose.") +
      p("The second constraint is data. Human-annotated data can only train toward the limits of human judgment. That may produce an exceptionally strong professor, but the ceiling is still tied to human input. Escaping that ceiling requires objective signal: formal mathematics, AI-native languages, and physical law. Fluid dynamics, gravity, molecular structure, biology, and chemistry provide signals that are not merely human opinions written down.") +
      p("Biology and chemistry look more defensible than robotics. Robotics is crowded, capital-intensive, and heavily promoted. Bio-chem is narrower, harder to fake, and better anchored in objective physical constraints. The trade-off is time. Clear monetization signals may take five to ten years.") +
      exposure([["SDGR", "Physics-based simulation plus machine learning for drug and materials discovery. The point is exposure to chemistry and physics, not merely human labels."]]));

    /* 3 — perception layer */
    H += sec("percept", "The Perception Layer", "Video becomes a native input",
      lede("AI still handles video in a crude way, by breaking it into sampled frames. That approach is expensive and lossy. Video input should eventually become native, much as image input did. The investable theme is the perception stack that benefits from that shift.") +
      p("Today, many systems read video as screenshots plus timestamps. This is costly, and it discards motion between frames. Image input followed a similar path in its early stage: difficult to encode, used sparingly, and then gradually made native. Video is likely to follow the same pattern.") +
      framesNative() +
      p("Several signals point in that direction: coding agents moving toward richer visual input, a wave of AI video-editing tools, and growing demand for licensed image and video training material. This also connects directly to Physical AI. Systems operating in the physical world must perceive that world through sensors, and native video understanding is the perception layer on which those systems are trained and deployed.") +
      exposure([
        ["ADBE", "AI-assisted editing workflows deepen dependence on its tools."],
        ["AMBA", "Edge perception and camera-side processing as video understanding moves onto devices."],
        ["GETY", "Licensed visual material for training."]
      ]));

    /* side bet A — input layer */
    H += sec("voice", "Side Bet A \u00b7 The Input Layer", "Voice is the new keyboard",
      lede("Typing is losing share as the default way humans instruct AI. Voice-to-text is becoming a primary input layer, and quality differences are still meaningful. The best voice layer should capture both attention and data.") +
      p("Transcription quality varies widely across systems. When AI interaction shifts from typed prompts to spoken instruction, accuracy becomes more than a convenience. It becomes the interface. A system that hears more accurately receives better intent, better context, and more usable data.") +
      voiceBars() +
      exposure([["SOUN", "Independent voice-AI pure play. Veritone reads as a data-orchestration company rather than a direct voice-input exposure, so it is left out."]]));

    /* side bet B — quality layer */
    H += sec("code", "Side Bet B \u00b7 The Quality Layer", "AI-written code still needs review",
      lede("Claude Code, Codex, and similar agents make software shipping faster, but agent-written code often cannot go straight into production. As AI code generation scales, human-rule-based review becomes the quality layer.") +
      p("Coding agents tend to optimize for whether the code runs at all. Production teams need more than that. Maintainability, security, readability, test coverage, architectural fit, and team standards still matter. At scale, AI-generated code requires a gate that enforces human-defined rules before it reaches production.") +
      codeGate() +
      p("Review tooling therefore becomes part of the AI software stack. The more code agents produce, the more important the review and CI layer becomes.") +
      exposure([["GTLB", "Owns the review and CI gate through which AI-written code must pass."]]));

    /* map */
    H += sec("map", "The Map", "How I would weight these bets",
      lede("Five views, one principle: the obvious layer is priced in, so the edge sits one layer down. The map places each representative name by how direct the exposure is and how long it may take to pay off. Select a name to read the thesis it stands for.") +
      betMap() +
      '<p class="iv-note">Ticker references are framed as representative public-market proxies for the stated themes, not as individualized investment recommendations.</p>' +
      '<div class="ca-foot"><span>Investment Views &middot; Betting One Layer Down</span><span>Zhenyuan Pan &middot; 2026</span></div>');

    return (
      '<button class="case-close" type="button" aria-label="Close article"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll iv-scroll"><article class="case-article ai-article iv-article">' + H + "</article></div>"
    );
  };

  /* ---------- wiring ---------- */
  var REDUCED = false;
  try { REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches; } catch (e) {}

  function wireIndexAndProgress(scroller) {
    var nav = scroller.querySelector(".iv-controls .ai-index");
    var secs = [].slice.call(scroller.querySelectorAll(".iv-sec[data-iv-label]"));
    if (!nav) return;
    var links = [];
    secs.forEach(function (s) {
      var a = document.createElement("button");
      a.type = "button";
      a.className = "ai-ix";
      a.textContent = s.getAttribute("data-iv-label");
      a.addEventListener("click", function () {
        var top = s.offsetTop - 10;
        scroller.scrollTo({ top: top, behavior: REDUCED ? "auto" : "smooth" });
      });
      nav.appendChild(a);
      links.push({ a: a, s: s });
    });
    var prog = scroller.querySelector(".ai-progress i");
    var mapRows = [].slice.call(scroller.querySelectorAll(".iv-mrow"));
    var ticking = false;
    function upd() {
      ticking = false;
      var st = scroller.scrollTop, vh = scroller.clientHeight;
      var max = scroller.scrollHeight - vh;
      var ratio = max > 0 ? Math.max(0, Math.min(1, st / max)) : 0;
      if (prog) prog.style.transform = "scaleX(" + ratio + ")";
      var active = 0;
      links.forEach(function (l, i) { if (l.s.offsetTop <= st + vh * 0.34) active = i; });
      links.forEach(function (l, i) { l.a.classList.toggle("on", i === active); });
      // sync hero map highlight to the active section id (skip overview = index 0)
      var id = links[active] ? links[active].s.id.replace("iv-sec-", "") : "";
      mapRows.forEach(function (r) { r.classList.toggle("on", r.getAttribute("data-iv-jump") === id); });
    }
    scroller.addEventListener("scroll", function () {
      if (ticking) return; ticking = true; requestAnimationFrame(upd);
    }, { passive: true });
    upd();
  }

  function wireHeroMap(scroller) {
    var rows = [].slice.call(scroller.querySelectorAll(".iv-mrow[data-iv-jump]"));
    rows.forEach(function (r) {
      r.addEventListener("click", function () {
        var target = scroller.querySelector("#iv-sec-" + r.getAttribute("data-iv-jump"));
        if (target) scroller.scrollTo({ top: target.offsetTop - 10, behavior: REDUCED ? "auto" : "smooth" });
      });
    });
  }

  function wireBetMap(scroller) {
    var box = scroller.querySelector("[data-iv-betmap]");
    if (!box) return;
    var dots = [].slice.call(box.querySelectorAll(".iv-dot"));
    var detail = box.querySelector('[data-role="detail"]');
    function render(i) {
      var b = BETS[i];
      detail.innerHTML = '<div class="iv-bm-tk">' + b[0] + "</div>" +
        '<div class="iv-bm-layer">' + esc(b[1]) + "</div>" +
        '<div class="iv-bm-why">' + esc(b[4]) + "</div>" +
        '<div class="iv-bm-hint">Select any name on the map.</div>';
      dots.forEach(function (d) { d.classList.toggle("on", +d.getAttribute("data-i") === i); });
    }
    dots.forEach(function (d) {
      d.addEventListener("click", function () { render(+d.getAttribute("data-i")); });
    });
    render(0);
  }

  window.__investmentViewsViz = {
    init: function (scroller) {
      if (!scroller || scroller.__ivDone) return;
      if (!scroller.querySelector(".iv-article")) return;
      scroller.__ivDone = true;
      try {
        wireIndexAndProgress(scroller);
        wireHeroMap(scroller);
        wireBetMap(scroller);
      } catch (e) { if (window.console) console.warn("iv init", e); }
    }
  };
})();
