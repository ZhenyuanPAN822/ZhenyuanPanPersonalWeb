/* research-rclab.js : "Relationship Candlestick Lab" GitHub project case study.
   Opens from the .sys-row (data-sys="rcl") through the shared case-study.js
   frosted overlay (morph "plain"). Self-contained: ships its own scoped rc-*
   styles. Distinct "chat-to-chart" visual language: chat bubbles, relationship
   K-lines, a TradingView-style panel, Xiaohongshu social-proof cards, pattern
   cards, a semantic dimension wheel, and hover attribution. Uses a candlestick
   green/red palette next to the site magenta so it reads as a consumer data-viz
   product, not another architecture page.

   Exposes:
     window.__rclArticle(data) -> overlay HTML string
     window.__rclViz.init(scroller) -> sticky index + progress, subtle loops,
        and the chat-to-candle demo, pattern explorer, dimension inspector, and
        workflow switcher.

   No en-dashes or em-dashes in any visible copy (project rule). */
(function () {
  "use strict";

  var REPO = "https://github.com/ZhenyuanPAN822/relationship-candlestick-lab";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function p(t) { return '<p class="ca-p">' + t + "</p>"; }
  function sec(id, label, title, inner) {
    return '<section class="ca-section ai-sec rc-sec" id="rc-sec-' + id + '" data-rc-label="' + esc(label) + '">' +
      '<div class="ca-h">' + esc(label) + "</div>" +
      (title ? '<h3 class="ca-sub rc-h2">' + esc(title) + "</h3>" : "") + inner + "</section>";
  }

  var STYLE = "<style id=\"rc-style\">" + [
    ".rc-article{--mag:#d6006c;--up:#1f9d6b;--down:#e0476b;--ink:#14181f;--line:rgba(20,24,31,0.12);--mut:#6b7480;--soft:rgba(214,0,108,0.07);--panel:#0f141b;--paper:#faf9f7;}",
    ".rc-h2{max-width:30ch;margin-bottom:20px;}",
    ".rc-sec{padding-top:clamp(8px,1.6vh,22px);}",
    ".rc-lede{font-size:clamp(16px,1.4vw,20px);line-height:1.5;color:#3a4049;max-width:64ch;margin:0 0 8px;font-weight:400;text-wrap:pretty;}",
    ".rc-cap{font-size:12px;line-height:1.5;color:#9098a3;margin-top:12px;font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;}",
    ".rc-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#3f4751;background:var(--paper);border:1px solid var(--line);border-radius:5px;padding:1px 6px;}",
    /* cta + github */
    ".rc-cta{display:inline-flex;align-items:center;gap:9px;font:800 13px 'Archivo',sans-serif;color:#fff;background:var(--ink);border-radius:10px;padding:11px 20px;text-decoration:none;margin:6px 0;transition:background .2s,transform .2s;}",
    ".rc-cta:hover{background:#000;transform:translateY(-2px);} .rc-cta .gh{width:16px;height:16px;fill:#fff;}",
    /* chat bubbles */
    ".rc-chat{display:flex;flex-direction:column;gap:9px;}",
    ".rc-bub{max-width:80%;font-size:12.5px;line-height:1.4;padding:9px 13px;border-radius:14px;position:relative;}",
    ".rc-bub.them{align-self:flex-start;background:#eef0f3;color:var(--ink);border-bottom-left-radius:4px;}",
    ".rc-bub.me{align-self:flex-end;background:var(--mag);color:#fff;border-bottom-right-radius:4px;}",
    ".rc-bub .t{display:block;font-size:9.5px;opacity:0.6;margin-bottom:3px;letter-spacing:0.04em;}",
    ".rc-delta{align-self:center;font:800 11px 'Archivo',sans-serif;font-variant-numeric:tabular-nums;padding:2px 9px;border-radius:999px;}",
    ".rc-delta.up{color:var(--up);background:rgba(31,157,107,0.12);} .rc-delta.down{color:var(--down);background:rgba(224,71,107,0.12);}",
    /* candle svg */
    ".rc-candlebox{display:flex;align-items:center;justify-content:center;}",
    ".rc-candlebox svg{width:100%;height:auto;max-width:300px;display:block;}",
    /* hero split */
    ".rc-herowin{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 24px 60px -38px rgba(20,24,31,0.5);margin:26px 0 8px;}",
    ".rc-herobar{display:flex;align-items:center;gap:7px;padding:11px 14px;background:#f3f4f6;border-bottom:1px solid var(--line);}",
    ".rc-hd{width:10px;height:10px;border-radius:50%;} .rc-hd.r{background:#ff5f57;} .rc-hd.y{background:#febc2e;} .rc-hd.g{background:#28c840;}",
    ".rc-hurl{flex:1;margin-left:10px;font:600 11px ui-monospace,Menlo,monospace;color:#8a909b;background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 11px;}",
    ".rc-herogrid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:0;}",
    ".rc-herocol{padding:18px;border-right:1px solid var(--line);}",
    ".rc-herogrid .rc-herocol:last-child{border-right:0;display:flex;flex-direction:column;justify-content:center;background:#fbfbfc;}",
    ".rc-col-k{font:800 9.5px 'Archivo',sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:var(--mut);margin-bottom:11px;}",
    ".rc-ohlc{display:flex;gap:14px;justify-content:center;margin-top:12px;}",
    ".rc-ohlc div{text-align:center;} .rc-ohlc .v{font:800 16px 'Archivo',sans-serif;color:var(--ink);font-variant-numeric:tabular-nums;} .rc-ohlc .l{font-size:9.5px;color:var(--mut);text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;}",
    /* xhs proof */
    ".rc-proof{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:24px 0 6px;}",
    ".rc-pc{border:1px solid var(--line);border-radius:13px;background:linear-gradient(160deg,#fff,#fff6fa);padding:17px 14px;text-align:center;position:relative;overflow:hidden;}",
    ".rc-pc::before{content:'';position:absolute;left:0;top:0;width:100%;height:3px;background:linear-gradient(90deg,#ff2e63,#ff6b9d);}",
    ".rc-pc .v{font:800 clamp(20px,2.3vw,28px)/1 'Archivo',sans-serif;color:#14181f;font-variant-numeric:tabular-nums;}",
    ".rc-pc .l{font-size:11px;color:var(--mut);margin-top:7px;}",
    ".rc-prooftag{display:inline-flex;align-items:center;gap:7px;font:700 11px 'Archivo',sans-serif;color:#ff2e63;background:#fff0f5;border:1px solid #ffd4e2;border-radius:999px;padding:5px 12px;margin-bottom:6px;}",
    /* split comparison */
    ".rc-split{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0;}",
    ".rc-sp{border:1px solid var(--line);border-radius:13px;padding:18px;background:#fff;}",
    ".rc-sp.old{background:#fbfbfc;} .rc-sp.new{border-color:rgba(31,157,107,0.4);box-shadow:0 16px 40px -30px rgba(31,157,107,0.4);}",
    ".rc-sp-k{font:800 10.5px 'Archivo',sans-serif;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:13px;}",
    ".rc-sp.old .rc-sp-k{color:var(--mut);} .rc-sp.new .rc-sp-k{color:var(--up);}",
    ".rc-sp ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px;}",
    ".rc-sp li{font-size:13px;line-height:1.45;color:#3f4751;padding-left:20px;position:relative;}",
    ".rc-sp.old li::before{content:'';position:absolute;left:0;top:8px;width:7px;height:7px;border-radius:50%;border:1.5px solid #b8bec7;}",
    ".rc-sp.new li::before{content:'';position:absolute;left:0;top:7px;width:9px;height:9px;border-radius:2px;background:var(--up);}",
    /* example candle beats */
    ".rc-beats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:22px 0;}",
    ".rc-beat{border:1px solid var(--line);border-radius:12px;background:#fff;padding:15px;}",
    ".rc-beat .when{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:7px;}",
    ".rc-beat .what{font-size:12.5px;line-height:1.45;color:var(--ink);margin-bottom:9px;}",
    ".rc-beat .idx{font:800 13px 'Archivo',sans-serif;color:var(--ink);font-variant-numeric:tabular-nums;}",
    ".rc-beat .idx span{font-size:11px;color:var(--mut);font-weight:600;}",
    /* message index path */
    ".rc-pathwrap{border:1px solid var(--line);border-radius:13px;background:#fff;padding:18px;margin:22px 0;}",
    ".rc-pathwrap svg{width:100%;height:auto;display:block;}",
    ".rc-msgrow{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;}",
    ".rc-msgc{flex:1 1 150px;border:1px solid var(--line);border-radius:10px;padding:11px 12px;background:var(--paper);}",
    ".rc-msgc .m{font-size:13px;color:var(--ink);margin-bottom:7px;}",
    ".rc-msgc .d{display:flex;gap:6px;flex-wrap:wrap;}",
    ".rc-msgc .d span{font:700 10px 'Archivo',sans-serif;border-radius:6px;padding:3px 7px;}",
    ".rc-msgc .d .dim{color:var(--mag);background:var(--soft);} .rc-msgc .d .up{color:var(--up);background:rgba(31,157,107,0.12);} .rc-msgc .d .down{color:var(--down);background:rgba(224,71,107,0.12);}",
    /* scoring fields */
    ".rc-fields{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:18px 0;}",
    ".rc-fc{border:1px solid var(--line);border-left:3px solid var(--mag);border-radius:10px;background:#fff;padding:14px 16px;}",
    ".rc-fc .fn{font-family:ui-monospace,Menlo,monospace;font-size:13px;color:var(--ink);font-weight:600;}",
    ".rc-fc .fd{font-size:12px;color:var(--mut);margin-top:5px;line-height:1.45;}",
    /* ohlc explainer */
    ".rc-ohlcx{display:grid;grid-template-columns:0.8fr 1.2fr;gap:22px;align-items:center;margin:22px 0;border:1px solid var(--line);border-radius:14px;background:#fff;padding:22px;}",
    ".rc-ohlcx-defs{display:flex;flex-direction:column;gap:11px;}",
    ".rc-def{display:grid;grid-template-columns:88px 1fr;gap:12px;align-items:baseline;}",
    ".rc-def .t{font:800 12px 'Archivo',sans-serif;color:var(--ink);} .rc-def .d{font-size:12.5px;color:var(--mut);line-height:1.4;}",
    /* pattern cards / explorer */
    ".rc-patterns{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:22px 0;}",
    ".rc-pat{border:1px solid var(--line);border-radius:12px;background:#fff;padding:15px;cursor:pointer;transition:border-color .2s,box-shadow .2s,transform .2s;}",
    ".rc-pat:hover,.rc-pat.on{border-color:var(--mag);box-shadow:0 16px 34px -26px rgba(214,0,108,0.5);transform:translateY(-3px);}",
    ".rc-pat svg{width:100%;height:92px;display:block;margin-bottom:10px;}",
    ".rc-pat .nm{font:800 13px 'Archivo',sans-serif;color:var(--ink);margin-bottom:5px;}",
    ".rc-pat .ds{font-size:11.5px;line-height:1.45;color:var(--mut);}",
    ".rc-patdetail{border:1px solid var(--line);border-radius:12px;background:var(--paper);padding:18px;margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px 22px;}",
    ".rc-patdetail .full{grid-column:1/-1;}",
    ".rc-patdetail .k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:4px;}",
    ".rc-patdetail .v{font-size:13px;line-height:1.5;color:#3f4751;}",
    /* dimension wheel */
    ".rc-wheelwrap{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:center;margin:22px 0;}",
    ".rc-wheel svg{width:100%;height:auto;display:block;max-width:380px;margin:0 auto;cursor:pointer;}",
    ".rc-wheel .seg{transition:opacity .15s;} .rc-wheel .seg:hover{opacity:0.85;}",
    ".rc-wheel .lbl{font:700 8.5px 'Archivo',sans-serif;fill:#fff;}",
    ".rc-dimdetail{border:1px solid var(--line);border-radius:12px;background:#fff;padding:18px;}",
    ".rc-dimdetail .nm{font:800 16px 'Archivo',sans-serif;color:var(--ink);margin-bottom:4px;text-transform:capitalize;}",
    ".rc-dimdetail .row{margin-bottom:10px;} .rc-dimdetail .k{font:800 10px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--mag);margin-bottom:3px;} .rc-dimdetail .v{font-size:12.5px;line-height:1.45;color:#3f4751;}",
    /* chart panel (dark) */
    ".rc-chart{border-radius:14px;overflow:hidden;background:var(--panel);margin:22px 0;border:1px solid #232a33;}",
    ".rc-chart-bar{display:flex;align-items:center;gap:8px;padding:11px 15px;border-bottom:1px solid #232a33;flex-wrap:wrap;}",
    ".rc-chart-bar .tk{font:800 12px ui-monospace,Menlo,monospace;color:#e7eef5;}",
    ".rc-tf{display:flex;gap:4px;margin-left:auto;flex-wrap:wrap;}",
    ".rc-tf span{font:700 10px 'Archivo',sans-serif;color:#8a93a0;border:1px solid #2b333d;border-radius:5px;padding:3px 8px;}",
    ".rc-tf span.on{color:#0f141b;background:#1f9d6b;border-color:#1f9d6b;}",
    ".rc-chart-body{display:grid;grid-template-columns:1.4fr 0.9fr;gap:0;}",
    ".rc-chart-canvas{padding:16px;border-right:1px solid #232a33;}",
    ".rc-chart-canvas svg{width:100%;height:auto;display:block;}",
    ".rc-attr{padding:16px;}",
    ".rc-attr-k{font:800 9.5px 'Archivo',sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:#8a93a0;margin-bottom:10px;}",
    ".rc-attr-dim{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#e7eef5;padding:6px 0;border-bottom:1px solid #232a33;}",
    ".rc-attr-dim b{font-variant-numeric:tabular-nums;} .rc-attr-dim .pos{color:#3fd896;} .rc-attr-dim .neg{color:#ff6f91;}",
    ".rc-attr-msg{font-size:11.5px;color:#aeb6c0;line-height:1.5;margin-top:5px;padding-left:12px;border-left:2px solid #2b333d;}",
    ".rc-chart-feats{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}",
    ".rc-chart-feats span{font:600 11.5px 'Archivo',sans-serif;color:#3f4751;background:var(--paper);border:1px solid var(--line);border-radius:7px;padding:5px 11px;}",
    /* workflow cards */
    ".rc-flows{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:22px 0;}",
    ".rc-flow{border:1px solid var(--line);border-radius:14px;background:#fff;padding:20px;}",
    ".rc-flow.priv{border-color:rgba(31,157,107,0.4);} .rc-flow.api{border-color:rgba(42,111,219,0.35);}",
    ".rc-flow-k{font:800 11px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:6px;}",
    ".rc-flow.priv .rc-flow-k{color:var(--up);} .rc-flow.api .rc-flow-k{color:#2a6fdb;}",
    ".rc-flow-sub{font-size:12px;color:var(--mut);margin-bottom:14px;}",
    ".rc-flow ol{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;}",
    ".rc-flow li{font-size:12.5px;line-height:1.45;color:#3f4751;}",
    ".rc-flow code{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;background:var(--paper);border:1px solid var(--line);border-radius:5px;padding:1px 5px;color:var(--ink);}",
    ".rc-switch{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;margin-bottom:14px;}",
    ".rc-switch button{font:700 12.5px 'Archivo',sans-serif;color:var(--mut);background:#fff;border:0;padding:8px 16px;cursor:pointer;}",
    ".rc-switch button.on{background:var(--ink);color:#fff;}",
    /* arch stack */
    ".rc-stack{display:flex;flex-direction:column;gap:9px;margin:22px 0;}",
    ".rc-layer{display:grid;grid-template-columns:160px 1fr;gap:16px;align-items:center;border:1px solid var(--line);border-radius:12px;background:#fff;padding:14px 16px;}",
    ".rc-layer .ly{font:800 11px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--mag);}",
    ".rc-layer .file{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--ink);} .rc-layer .desc{font-size:12px;color:var(--mut);margin-top:3px;line-height:1.4;}",
    /* privacy */
    ".rc-priv{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0;}",
    ".rc-privc{border:1px solid var(--line);border-radius:12px;padding:16px;background:#fff;}",
    ".rc-privc .h{font:800 13px 'Archivo',sans-serif;color:var(--ink);margin-bottom:7px;display:flex;align-items:center;gap:8px;}",
    ".rc-privc .h .dot{width:9px;height:9px;border-radius:50%;} .rc-privc.local .dot{background:var(--up);} .rc-privc.api .dot{background:#2a6fdb;}",
    ".rc-privc p{font-size:12.5px;line-height:1.5;color:var(--mut);margin:0;}",
    /* github card */
    ".rc-ghcard{border:1px solid var(--line);border-radius:14px;background:#fff;padding:20px 22px;margin:22px 0;display:flex;gap:18px;align-items:center;flex-wrap:wrap;}",
    ".rc-ghicon{width:46px;height:46px;flex:none;fill:var(--ink);}",
    ".rc-ghmain{flex:1;min-width:200px;} .rc-ghname{font:800 16px ui-monospace,Menlo,monospace;color:var(--ink);margin-bottom:5px;word-break:break-word;} .rc-ghdesc{font-size:12.5px;line-height:1.5;color:var(--mut);}",
    /* demo */
    ".rc-demo{border:1px solid var(--line);border-radius:14px;background:#fff;padding:20px;margin:18px 0;}",
    ".rc-demo-tabs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;}",
    ".rc-dtab{font:700 12px 'Archivo',sans-serif;color:var(--mut);background:#fff;border:1px solid var(--line);border-radius:8px;padding:7px 13px;cursor:pointer;transition:all .15s;}",
    ".rc-dtab:hover{border-color:var(--mag);} .rc-dtab.on{background:var(--mag);color:#fff;border-color:var(--mag);}",
    ".rc-demo-grid{display:grid;grid-template-columns:1fr 0.7fr;gap:20px;align-items:center;}",
    ".rc-demo-interp{border:1px solid var(--line);border-radius:11px;background:var(--paper);padding:14px 16px;margin-top:14px;font-size:13px;line-height:1.5;color:#3f4751;}",
    ".rc-demo-interp b{color:var(--ink);}",
    /* ix header */
    ".rc-ix-h{font:700 12px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink);margin:24px 0 14px;display:flex;align-items:center;gap:9px;}",
    ".rc-ix-h .tag{font:800 10px 'Archivo',sans-serif;letter-spacing:0.1em;color:#fff;background:var(--mag);border-radius:999px;padding:3px 9px;}",
    /* reveal + anim */
    ".rc-reveal{opacity:1;}",
    ".rc-bub.anim{animation:rcBub 11s ease-in-out infinite;opacity:0;}",
    "@keyframes rcBub{0%,4%{opacity:0;transform:translateY(6px);}10%,90%{opacity:1;transform:none;}100%{opacity:1;}}",
    /* responsive */
    "@media (max-width:860px){",
    ".rc-herogrid{grid-template-columns:1fr;} .rc-herocol{border-right:0;border-bottom:1px solid var(--line);}",
    ".rc-proof{grid-template-columns:repeat(2,1fr);} .rc-split,.rc-wheelwrap,.rc-demo-grid,.rc-flows,.rc-priv{grid-template-columns:1fr;}",
    ".rc-beats{grid-template-columns:repeat(2,1fr);} .rc-patterns{grid-template-columns:1fr;} .rc-fields{grid-template-columns:1fr;}",
    ".rc-ohlcx{grid-template-columns:1fr;} .rc-chart-body{grid-template-columns:1fr;} .rc-chart-canvas{border-right:0;border-bottom:1px solid #232a33;} .rc-patdetail{grid-template-columns:1fr;} .rc-layer{grid-template-columns:1fr;}",
    "}",
    "@media (max-width:520px){.rc-proof{grid-template-columns:1fr;} .rc-beats{grid-template-columns:1fr;}}",
    "@media (prefers-reduced-motion:reduce){.rc-bub.anim{animation:none;opacity:1;}}"
  ].join("") + "</style>";

  /* ---------- candle svg helper ---------- */
  function candle(o, h, l, c, w, opts) {
    /* map index 0..100 to y; draw one candle centered */
    opts = opts || {};
    var W = opts.w || 120, H = opts.h || 180, pad = 16;
    function Y(v) { return pad + (100 - v) / 100 * (H - 2 * pad); }
    var up = c >= o, col = up ? "#1f9d6b" : "#e0476b";
    var cx = W / 2, bw = 30;
    var bodyTop = Y(Math.max(o, c)), bodyBot = Y(Math.min(o, c));
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">';
    /* gridlines */
    [25, 50, 75].forEach(function (g) { s += '<line x1="6" y1="' + Y(g).toFixed(1) + '" x2="' + (W - 6) + '" y2="' + Y(g).toFixed(1) + '" stroke="rgba(20,24,31,0.06)" stroke-width="1"/>'; });
    s += '<line x1="' + cx + '" y1="' + Y(h).toFixed(1) + '" x2="' + cx + '" y2="' + Y(l).toFixed(1) + '" stroke="' + col + '" stroke-width="2"/>';
    s += '<rect x="' + (cx - bw / 2) + '" y="' + bodyTop.toFixed(1) + '" width="' + bw + '" height="' + Math.max(3, bodyBot - bodyTop).toFixed(1) + '" rx="2" fill="' + col + '"/>';
    if (opts.labels) {
      s += '<text x="' + (cx + bw / 2 + 6) + '" y="' + (Y(h) + 4).toFixed(1) + '" style="font:700 9px Archivo,sans-serif" fill="#6b7480">H ' + h + "</text>";
      s += '<text x="' + (cx + bw / 2 + 6) + '" y="' + (Y(c) + 4).toFixed(1) + '" style="font:700 9px Archivo,sans-serif" fill="' + col + '">C ' + c + "</text>";
      s += '<text x="' + (cx - bw / 2 - 6) + '" y="' + (Y(o) + 4).toFixed(1) + '" text-anchor="end" style="font:700 9px Archivo,sans-serif" fill="#6b7480">O ' + o + "</text>";
      s += '<text x="' + (cx - bw / 2 - 6) + '" y="' + (Y(l) + 4).toFixed(1) + '" text-anchor="end" style="font:700 9px Archivo,sans-serif" fill="#6b7480">L ' + l + "</text>";
    }
    s += "</svg>";
    return s;
  }
  function ghSvg(cls) { return '<svg class="' + cls + '" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>'; }

  /* ---------- data ---------- */
  var DIMS = [
    { k: "affection", mean: "Emotional warmth and intimacy.", pos: "pet names, missing someone, warm goodnight", neg: "dismissive one-word replies, cold distancing", eff: "Lifts the index when mutual and context-appropriate." },
    { k: "engagement", mean: "Response length, continuity, speed, willingness to extend.", pos: "fast detailed replies, asking follow-ups", neg: "slow one-word replies, conversation stalls", eff: "Rising engagement pushes the index up; withdrawal pulls it down." },
    { k: "care", mean: "Concern, checking in, emotional support.", pos: "checking how you are, offering help", neg: "ignoring distress, no acknowledgment", eff: "Supportive care raises the index, especially at low points." },
    { k: "conflict", mean: "Argument, repair, apology, or unresolved tension.", pos: "sincere apology, resolution, repair", neg: "escalation, blame, silence after a fight", eff: "Repair drives a lower wick recovery; escalation deepens the drop." },
    { k: "tension", mean: "Flirtation, ambiguity, jealousy, boundary testing.", pos: "playful teasing that lands, mutual flirt", neg: "jealousy spikes, mixed signals", eff: "Can spike the index, then pull back if not reciprocated." },
    { k: "investment", mean: "Effort, planning, initiative, repeated attention.", pos: "making plans, initiating, remembering details", neg: "one-sided effort, no reciprocation", eff: "Sustained investment trends the index upward." },
    { k: "awkwardness", mean: "Stiffness, mismatch, silence, loss of rhythm.", pos: "recovering rhythm, easing the mood", neg: "dead air, mistimed messages", eff: "Awkward stretches flatten or lower the index." },
    { k: "future_orientation", mean: "Plans, invitations, future references.", pos: "let us go next week, future we statements", neg: "avoiding any future reference", eff: "Future framing supports breakouts." },
    { k: "vulnerability", mean: "Confession, uncertainty, emotional exposure.", pos: "honest disclosure that is received well", neg: "exposure that is dismissed", eff: "Well-received vulnerability can drive a breakout; rejection a sharp drop." },
    { k: "shared_identity", mean: "Inside jokes, private language, group-of-two feeling.", pos: "callbacks, private nicknames", neg: "loss of shared references", eff: "Strengthens the baseline the index decays toward." }
  ];
  var PATTERNS = [
    { id: "Upper wick", o: 52, h: 70, l: 50, c: 54, shape: "Intraperiod high followed by a close well below the high.", interp: "A warm push was not fully accepted.", ex: "\u201cWhat if I said I kind of like you?\u201d followed by \u201chaha you always joke.\u201d", sug: "Testing happened, but confirmation was weak." },
    { id: "Lower wick", o: 55, h: 60, l: 36, c: 56, shape: "Intraperiod low followed by a close back near the open.", interp: "A cold moment or conflict was repaired.", ex: "Short cold replies, then \u201cI was just in a bad mood, not at you.\u201d", sug: "The dip recovered; the relationship absorbed a shock." },
    { id: "W bottom", o: 44, h: 58, l: 34, c: 56, shape: "Two pullbacks fail to break the prior low.", interp: "Two cold moments did not break the relationship floor.", ex: "Two tense evenings, both followed by reconnection.", sug: "A support level is holding." },
    { id: "Head-and-shoulders top", o: 60, h: 72, l: 48, c: 50, shape: "Repeated warm pushes peak, then turn colder.", interp: "Repeated warm pushes failed, then the relationship cooled.", ex: "Several strong overtures with weaker and weaker responses.", sug: "Momentum faded; the trend turned down." },
    { id: "Low-level volume", o: 40, h: 46, l: 36, c: 42, shape: "High interaction density at a low index.", interp: "A low point produced a lot of explaining, arguing, or revisiting.", ex: "A long back-and-forth after a misunderstanding.", sug: "Intensity at a low does not always mean recovery." },
    { id: "Breakout", o: 52, h: 78, l: 51, c: 74, shape: "Ordinary range gives way to a strong directional move.", interp: "Chat moved from ordinary to clear invitation or stronger mutual signal.", ex: "Casual chat, then \u201ccome over this weekend?\u201d accepted warmly.", sug: "A signal was sent and accepted." }
  ];
  var SCENARIOS = {
    A: { nm: "Cold to repair", interp: "Opened around 50, dipped to 38 in the afternoon (the low), then explanation and warmth pulled it back to close at 68. Long lower wick, green body: a repaired day.",
      bubs: [["them", "Morning", "morning :)", 50], ["them", "Afternoon", "oh. ok.", 38], ["me", "Evening", "bad mood earlier, not at you", 55], ["me", "Late night", "miss you, night", 68]] },
    B: { nm: "Probe rejected", interp: "A warm test spiked the index to 66 (the high), then a joking deflection pulled it back to close near the open at 51. Long upper wick: testing without confirmation.",
      bubs: [["them", "Open", "casual chat all day", 52], ["me", "Test", "what if I said I like you?", 66], ["them", "Deflect", "haha you always joke", 55], ["them", "Change", "anyway, did you eat?", 51]] },
    C: { nm: "Probe accepted", interp: "A signal was sent and matched, then an invitation followed. The index climbed from 52 to close at 74 (the high). A breakout candle.",
      bubs: [["them", "Open", "casual chat", 52], ["me", "Test", "kind of into you, ngl", 62], ["them", "Tease", "took you long enough", 70], ["them", "Invite", "come over this weekend?", 74]] }
  };

  /* ---------- builders ---------- */
  function proofBoard(showTag) {
    var M = [["16,248", "Views"], ["727", "Likes"], ["641", "Saves"], ["151", "Comments"], ["1,145", "Shares"]];
    return (showTag ? '<div class="rc-reveal"><span class="rc-prooftag">Xiaohongshu</span></div>' : "") +
      '<div class="rc-proof rc-reveal">' + M.map(function (x) {
        return '<div class="rc-pc"><div class="v">' + x[0] + '</div><div class="l">' + x[1] + "</div></div>";
      }).join("") + "</div>";
  }
  function heroVisual() {
    var bubs = [["them", "Morning", "morning :)"], ["them", "Afternoon", "oh. ok."], ["me", "Evening", "bad mood earlier, not at you"], ["me", "Late night", "miss you, night bao"]];
    var chat = '<div class="rc-chat">' + bubs.map(function (b, i) {
      return '<div class="rc-bub ' + b[0] + ' anim" style="animation-delay:' + (i * 0.7) + 's"><span class="t">' + esc(b[1]) + "</span>" + esc(b[2]) + "</div>";
    }).join("") + "</div>";
    return '<div class="rc-herowin rc-reveal"><div class="rc-herobar"><span class="rc-hd r"></span><span class="rc-hd y"></span><span class="rc-hd g"></span><span class="rc-hurl">relationship-candlestick-lab</span></div>' +
      '<div class="rc-herogrid"><div class="rc-herocol"><div class="rc-col-k">One day of chat</div>' + chat + "</div>" +
      '<div class="rc-herocol"><div class="rc-col-k">Daily relationship K-line</div><div class="rc-candlebox">' + candle(50, 72, 38, 68, null, { labels: true, w: 150, h: 200 }) + "</div>" +
      '<div class="rc-ohlc"><div><div class="v">50</div><div class="l">Open</div></div><div><div class="v">72</div><div class="l">High</div></div><div><div class="v">38</div><div class="l">Low</div></div><div><div class="v">68</div><div class="l">Close</div></div></div></div></div></div>';
  }
  function splitCompare() {
    var old = ["Summary", "Sentiment label", "Advice", "One-shot answer"];
    var nw = ["Message-level deltas", "Relationship index path", "OHLC candlesticks", "Volume and indicators", "Hover attribution", "Multiple timeframes"];
    return '<div class="rc-split rc-reveal">' +
      '<div class="rc-sp old"><div class="rc-sp-k">Ordinary chat analysis</div><ul>' + old.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="rc-sp new"><div class="rc-sp-k">Relationship Candlestick Lab</div><ul>' + nw.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div></div>";
  }
  function exampleBeats() {
    var B = [
      ["Morning", "Normal greeting", "around 50"],
      ["Afternoon", "Short cold replies", "drops toward 38"],
      ["Evening", "Explanation and repair", "recovers"],
      ["Late night", "Affectionate terms, renewed engagement", "closes near 68"]
    ];
    return '<div class="rc-beats rc-reveal">' + B.map(function (b) {
      return '<div class="rc-beat"><div class="when">' + esc(b[0]) + '</div><div class="what">' + esc(b[1]) + '</div><div class="idx">Index <span>' + esc(b[2]) + "</span></div></div>";
    }).join("") + "</div>";
  }
  function indexPath() {
    /* a small index path line with message markers */
    var vals = [50, 52, 44, 40, 38, 46, 58, 64, 68];
    var W = 560, H = 120, pad = 14;
    function X(i) { return pad + i / (vals.length - 1) * (W - 2 * pad); }
    function Y(v) { return pad + (100 - v) / 100 * (H - 2 * pad); }
    var line = "M" + vals.map(function (v, i) { return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" L");
    var dots = vals.map(function (v, i) { return '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3.5" fill="' + (i > 0 && v < vals[i - 1] ? "#e0476b" : "#1f9d6b") + '"/>'; }).join("");
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">' +
      '<line x1="' + pad + '" y1="' + Y(50).toFixed(1) + '" x2="' + (W - pad) + '" y2="' + Y(50).toFixed(1) + '" stroke="rgba(20,24,31,0.1)" stroke-width="1" stroke-dasharray="4 5"/>' +
      '<path d="' + line + '" fill="none" stroke="#d6006c" stroke-width="2.4"/>' + dots + "</svg>";
    var msgs = [
      { m: "ok.", d: '<span class="down">delta vs prior -</span><span class="dim">engagement</span>' },
      { m: "bad mood earlier", d: '<span class="up">repair signal +</span><span class="dim">conflict / care</span>' },
      { m: "miss you", d: '<span class="up">delta vs prior +</span><span class="dim">affection</span>' }
    ];
    return '<div class="rc-pathwrap rc-reveal">' + svg +
      '<div class="rc-msgrow">' + msgs.map(function (x) { return '<div class="rc-msgc"><div class="m">' + x.m + '</div><div class="d">' + x.d + "</div></div>"; }).join("") + "</div></div>";
  }
  function scoringFields() {
    var F = [
      ["delta_vs_prior", "Change versus the previous message."],
      ["delta_vs_atmosphere", "Change versus the recent conversation atmosphere."],
      ["primary_dim", "The main semantic dimension driving the move."],
      ["reason", "A short explanation for the scoring choice."]
    ];
    return '<div class="rc-fields rc-reveal">' + F.map(function (f) {
      return '<div class="rc-fc"><div class="fn">' + esc(f[0]) + '</div><div class="fd">' + esc(f[1]) + "</div></div>";
    }).join("") + "</div>";
  }
  function ohlcExplainer() {
    var defs = [["Open", "Relationship index at the start of the period."], ["High", "Warmest point inside the period."], ["Low", "Coldest point inside the period."], ["Close", "Relationship index at the end."], ["Volume", "Interaction density and emotional intensity."]];
    return '<div class="rc-ohlcx rc-reveal"><div class="rc-candlebox">' + candle(50, 78, 34, 66, null, { labels: true, w: 160, h: 220 }) + "</div>" +
      '<div class="rc-ohlcx-defs">' + defs.map(function (d) {
        return '<div class="rc-def"><div class="t">' + esc(d[0]) + '</div><div class="d">' + esc(d[1]) + "</div></div>";
      }).join("") +
      '<div class="rc-def"><div class="t">Upper wick</div><div class="d">A warm push that pulled back.</div></div>' +
      '<div class="rc-def"><div class="t">Lower wick</div><div class="d">A cold moment that was repaired.</div></div></div></div>';
  }
  function rcPatternSVG(id) {
    var W = 176, H = 96, top = 12, bot = 70;
    function Y(v) { return top + (100 - v) / 100 * (bot - top); }
    function cd(cx, o, h, l, c, bw) { bw = bw || 11; var up = c >= o, col = up ? "#1f9d6b" : "#e0476b", bt = Y(Math.max(o, c)), bb = Y(Math.min(o, c)); return '<line x1="' + cx + '" y1="' + Y(h).toFixed(1) + '" x2="' + cx + '" y2="' + Y(l).toFixed(1) + '" stroke="' + col + '" stroke-width="1.6"/><rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + bt.toFixed(1) + '" width="' + bw + '" height="' + Math.max(2.5, bb - bt).toFixed(1) + '" rx="1.5" fill="' + col + '"/>'; }
    function dash(x1, v, x2, col) { return '<line x1="' + x1 + '" y1="' + Y(v).toFixed(1) + '" x2="' + x2 + '" y2="' + Y(v).toFixed(1) + '" stroke="' + col + '" stroke-dasharray="3 3" stroke-width="1" opacity="0.7"/>'; }
    function lab(x, v, dy, txt, col, an) { return '<text x="' + x + '" y="' + (Y(v) + dy).toFixed(1) + '" text-anchor="' + (an || "middle") + '" style="font:700 7.5px Archivo,sans-serif" fill="' + col + '">' + txt + "</text>"; }
    var g = "";
    if (id === "Upper wick") { g += cd(34, 45, 50, 43, 48) + cd(64, 48, 53, 46, 52) + cd(100, 52, 86, 51, 55, 15) + dash(86, 86, 168, "#e0476b") + lab(166, 86, -3, "rejected high", "#e0476b", "end"); }
    else if (id === "Lower wick") { g += cd(34, 56, 58, 52, 54) + cd(64, 54, 56, 49, 51) + cd(100, 51, 57, 18, 56, 15) + dash(86, 18, 168, "#1f9d6b") + lab(166, 18, -3, "repaired low", "#1f9d6b", "end"); }
    else if (id === "W bottom") { g += cd(26, 60, 62, 52, 54) + cd(50, 54, 56, 40, 42) + cd(74, 42, 56, 40, 54) + cd(98, 54, 58, 41, 43) + cd(122, 43, 60, 41, 58) + cd(150, 58, 64, 56, 62) + dash(40, 40, 136, "#1f9d6b") + lab(88, 40, 11, "support holds", "#1f9d6b"); }
    else if (id === "Head-and-shoulders top") { g += cd(22, 46, 60, 44, 58) + cd(46, 58, 62, 50, 52) + cd(74, 52, 76, 50, 74) + cd(102, 74, 77, 56, 58) + cd(130, 58, 64, 50, 52) + cd(154, 52, 54, 42, 44) + dash(34, 50, 142, "#e0476b") + lab(88, 50, 11, "neckline breaks", "#e0476b"); }
    else if (id === "Low-level volume") { g += cd(30, 42, 45, 39, 40) + cd(54, 40, 44, 38, 43) + cd(78, 43, 46, 40, 41) + cd(102, 41, 45, 39, 44) + cd(126, 44, 47, 41, 42); [30, 54, 78, 102, 126].forEach(function (x, i) { var hh = [16, 20, 18, 22, 17][i]; g += '<rect x="' + (x - 6) + '" y="' + (H - 4 - hh) + '" width="12" height="' + hh + '" rx="1" fill="#d6006c" opacity="0.45"/>'; }); g += lab(78, 100, 6, "high volume at a low", "#d6006c"); }
    else if (id === "Breakout") { g += cd(26, 50, 53, 48, 51) + cd(50, 51, 53, 49, 50) + cd(74, 50, 53, 48, 52) + cd(98, 52, 54, 49, 51) + cd(130, 52, 82, 51, 80, 15) + dash(14, 55, 116, "#9098a3") + lab(58, 55, -3, "resistance", "#9098a3") + lab(152, 82, -3, "breakout", "#1f9d6b", "end"); }
    else { g += cd(88, 50, 60, 40, 52); }
    return '<svg viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">' + g + "</svg>";
  }
  function patternCards() {
    return '<div class="rc-patterns rc-reveal" data-rc-patterns="1">' + PATTERNS.map(function (pt, i) {
      return '<div class="rc-pat' + (i === 0 ? " on" : "") + '" tabindex="0" role="button" data-pat="' + i + '">' + rcPatternSVG(pt.id) +
        '<div class="nm">' + esc(pt.id) + '</div><div class="ds">' + esc(pt.interp) + "</div></div>";
    }).join("") + "</div>" +
    '<div class="rc-patdetail rc-reveal" data-rc-patdetail="1"></div>';
  }
  function dimensionWheel() {
    var N = DIMS.length, cx = 190, cy = 190, rO = 175, rI = 70;
    var svg = '<svg viewBox="0 0 380 380" role="img" aria-label="Ten semantic dimensions arranged in a wheel.">';
    DIMS.forEach(function (d, i) {
      var a0 = -Math.PI / 2 + i * (2 * Math.PI / N), a1 = a0 + (2 * Math.PI / N) - 0.03;
      var hue = 320 - i * 26;
      var col = "hsl(" + hue + ",62%," + (52 + (i % 2) * 8) + "%)";
      var x0o = cx + rO * Math.cos(a0), y0o = cy + rO * Math.sin(a0), x1o = cx + rO * Math.cos(a1), y1o = cy + rO * Math.sin(a1);
      var x0i = cx + rI * Math.cos(a0), y0i = cy + rI * Math.sin(a0), x1i = cx + rI * Math.cos(a1), y1i = cy + rI * Math.sin(a1);
      var path = "M" + x0i.toFixed(1) + "," + y0i.toFixed(1) + " L" + x0o.toFixed(1) + "," + y0o.toFixed(1) +
        " A" + rO + "," + rO + " 0 0 1 " + x1o.toFixed(1) + "," + y1o.toFixed(1) +
        " L" + x1i.toFixed(1) + "," + y1i.toFixed(1) + " A" + rI + "," + rI + " 0 0 0 " + x0i.toFixed(1) + "," + y0i.toFixed(1) + " Z";
      var am = (a0 + a1) / 2, lr = (rO + rI) / 2, lx = cx + lr * Math.cos(am), ly = cy + lr * Math.sin(am);
      svg += '<g class="seg" data-dim="' + i + '" style="cursor:pointer"><path d="' + path + '" fill="' + col + '"/>' +
        '<text class="lbl" x="' + lx.toFixed(1) + '" y="' + (ly + 3).toFixed(1) + '" text-anchor="middle" transform="rotate(' + (am * 180 / Math.PI + (Math.cos(am) < 0 ? 180 : 0)).toFixed(1) + " " + lx.toFixed(1) + " " + ly.toFixed(1) + ')">' + esc(d.k.replace("future_orientation", "future").replace("shared_identity", "shared")) + "</text></g>";
    });
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (rI - 4) + '" fill="#fff" stroke="var(--line)"/>' +
      '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" style="font:800 13px Archivo,sans-serif" fill="#14181f">10 axes</text>' +
      '<text x="' + cx + '" y="' + (cy + 13) + '" text-anchor="middle" style="font:600 9px Archivo,sans-serif" fill="#6b7480">click to inspect</text></svg>';
    return '<div class="rc-wheelwrap rc-reveal" data-rc-wheel="1"><div class="rc-wheel">' + svg + '</div><div class="rc-dimdetail" data-role="dimdetail"></div></div>';
  }
  function chartPanel() {
    /* a row of candles + attribution side */
    var data = [[48, 56, 45, 52], [52, 58, 40, 43], [43, 49, 36, 47], [47, 60, 46, 58], [58, 74, 56, 70], [70, 73, 58, 62]];
    var W = 360, H = 200, pad = 16, n = data.length, slot = (W - 2 * pad) / n;
    function Y(v) { return pad + (100 - v) / 100 * (H - 2 * pad); }
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">';
    [25, 50, 75].forEach(function (g) { svg += '<line x1="' + pad + '" y1="' + Y(g).toFixed(1) + '" x2="' + (W - pad) + '" y2="' + Y(g).toFixed(1) + '" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>'; });
    data.forEach(function (d, i) {
      var cx = pad + slot * (i + 0.5), up = d[3] >= d[0], col = up ? "#1f9d6b" : "#e0476b";
      var hi = i === 4;
      svg += '<line x1="' + cx.toFixed(1) + '" y1="' + Y(d[1]).toFixed(1) + '" x2="' + cx.toFixed(1) + '" y2="' + Y(d[2]).toFixed(1) + '" stroke="' + col + '" stroke-width="2"/>';
      var bt = Y(Math.max(d[0], d[3])), bb = Y(Math.min(d[0], d[3]));
      svg += '<rect x="' + (cx - 9) + '" y="' + bt.toFixed(1) + '" width="18" height="' + Math.max(3, bb - bt).toFixed(1) + '" rx="2" fill="' + col + '"' + (hi ? ' stroke="#fff" stroke-width="1.5"' : "") + "/>";
      if (hi) svg += '<line x1="' + cx.toFixed(1) + '" y1="6" x2="' + cx.toFixed(1) + '" y2="' + (H - 6) + '" stroke="rgba(255,255,255,0.35)" stroke-width="1" stroke-dasharray="3 3"/>';
    });
    svg += "</svg>";
    var tf = ["5m", "15m", "1h", "4h", "D", "W"];
    return '<div class="rc-chart rc-reveal"><div class="rc-chart-bar"><span class="tk">US / THEM</span><div class="rc-tf">' +
      tf.map(function (t) { return '<span' + (t === "D" ? ' class="on"' : "") + ">" + t + "</span>"; }).join("") + "</div></div>" +
      '<div class="rc-chart-body"><div class="rc-chart-canvas">' + svg + "</div>" +
      '<div class="rc-attr"><div class="rc-attr-k">Hover attribution &middot; highlighted candle</div>' +
        '<div class="rc-attr-dim">repair <b class="pos">+1.4</b></div>' +
        '<div class="rc-attr-dim">engagement <b class="neg">-1.15</b></div>' +
        '<div class="rc-attr-dim">affection <b class="pos">+0.9</b></div>' +
        '<div class="rc-attr-msg">bad mood earlier, not at you</div>' +
        '<div class="rc-attr-msg">cheer me up?</div>' +
        '<div class="rc-attr-msg">miss you</div></div></div></div>' +
    '<div class="rc-chart-feats rc-reveal"><span>Candlesticks</span><span>Volume</span><span>5m to yearly timeframes</span><span>MA</span><span>Bollinger Bands</span><span>MACD</span><span>RSI</span><span>KDJ</span><span>Hover attribution</span></div>';
  }
  function workflowSwitch() {
    return '<div class="rc-ix-h rc-reveal"><span class="tag">Interactive</span>Workflow mode switcher</div>' +
      '<div class="rc-demo rc-reveal" data-rc-flow="1"><div class="rc-switch" data-role="switch"><button type="button" data-mode="local" class="on">Local Skills Mode</button><button type="button" data-mode="api">Online API Mode</button></div>' +
      '<div data-role="flowbody"></div></div>';
  }
  function archStack() {
    var L = [
      ["Input formats", "CSV / JSON / JSONL / TXT", "Standardized message parsing.", "parser.py"],
      ["Preprocess", "merge turns", "Consecutive same-sender messages merge into turns to reduce LLM calls.", "pipeline.py"],
      ["LLM scoring", "relative deltas + dimension", "delta_vs_prior, delta_vs_atmosphere, primary_dim.", "skill/SKILL.md"],
      ["Expansion", "turn to message", "Turn-level scores are expanded back to message level.", "pipeline.py"],
      ["Computation", "index + OHLC + indicators", "Relationship index, candle aggregation, MA / BOLL / MACD / RSI / KDJ.", "ohlc.py, indicators.py"],
      ["Frontend", "interactive chart", "Single-page chart with timeframes and hover attribution.", "frontend/, server.py"]
    ];
    return '<div class="rc-stack rc-reveal">' + L.map(function (l) {
      return '<div class="rc-layer"><div><div class="ly">' + esc(l[0]) + '</div><div class="file">' + esc(l[3]) + '</div></div>' +
        '<div><div class="file" style="font-weight:700">' + esc(l[1]) + '</div><div class="desc">' + esc(l[2]) + "</div></div></div>";
    }).join("") + "</div>";
  }
  function privacyCards() {
    return '<div class="rc-priv rc-reveal">' +
      '<div class="rc-privc local"><div class="h"><span class="dot"></span>Local Skills Mode</div><p>The chat stays on the user device. The skill scores the conversation locally, and only the scored file is imported into the web app.</p></div>' +
      '<div class="rc-privc api"><div class="h"><span class="dot"></span>Online API Mode</div><p>Chat text is sent to the model provider the user chooses. API keys are used for the current browser session and are not turned into a hosted data product.</p></div></div>' +
      '<div class="rc-cap rc-reveal">The repository is a tool for personal analysis. No telemetry, and generated outputs stay local unless the user shares them.</div>';
  }
  function githubCard() {
    return '<div class="rc-ghcard rc-reveal">' + ghSvg("rc-ghicon") +
      '<div class="rc-ghmain"><div class="rc-ghname">relationship-candlestick-lab</div>' +
      '<div class="rc-ghdesc">Turn a chat log into a K-line and read the relationship curve. Python &middot; JavaScript &middot; FastAPI &middot; lightweight-charts</div></div>' +
      '<a class="rc-cta" href="' + REPO + '" target="_blank" rel="noopener">' + ghSvg("gh") + "View GitHub</a></div>";
  }
  function demo() {
    return '<div class="rc-ix-h rc-reveal"><span class="tag">Interactive</span>Chat-to-candle mini demo</div>' +
      '<div class="rc-demo rc-reveal" data-rc-demo="1"><div class="rc-demo-tabs" data-role="tabs"></div>' +
      '<div data-role="viz"></div>' +
      '<div class="rc-demo-interp" data-role="interp"></div></div>';
  }

  /* ---------- article ---------- */
  window.__rclArticle = function (data) {
    var H = STYLE;
    H += '<div class="ai-controls rc-controls">' +
      '<span class="rc-brand" style="display:inline-flex;align-items:center;gap:8px;flex:none;font:800 11px \'Archivo\',sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:#d6006c;"><i style="width:9px;height:9px;border-radius:2px;background:#1f9d6b;display:inline-block;"></i>GitHub Project</span>' +
      '<nav class="ai-index" aria-label="Section index"></nav></div>';
    H += '<div class="ai-progress" data-rc-progress="1"><i></i></div>';

    /* HERO */
    H += '<section class="ca-section ai-sec rc-sec" id="rc-sec-hero" data-rc-label="Overview">' +
      '<div class="ca-kicker">GitHub Project &middot; Consumer AI</div>' +
      '<h1 class="ca-title">Relationship Candlestick Lab</h1>' +
      '<div class="ai-role">Chat logs become financial-style relationship K-lines</div>' +
      '<p class="rc-lede">A viral consumer-AI visualization project that turns two-person chat logs into financial-style relationship K-lines.</p>' +
      p("Relationship Candlestick Lab turns a private chat record into a relationship time series. Each message is treated as a small interaction event. Warmth, distance, jealousy, care, testing, conflict, repair, and withdrawal move a relationship index up or down. The message-level path is then aggregated into OHLC candlesticks across multiple timeframes.") +
      p("The result is a chart people understand immediately: relationship dynamics shown as opens, highs, lows, closes, volume, wicks, pullbacks, support, breakouts, and repairs.") +
      '<a class="rc-cta rc-reveal" href="' + REPO + '" target="_blank" rel="noopener">' + ghSvg("gh") + "View GitHub</a>" +
      githubCard() +
      proofBoard(true) +
      '<div class="rc-cap rc-reveal">The project reached 16.2K views and 1,145 shares on Xiaohongshu because the metaphor was instantly readable: chat history becomes a relationship chart.</div>' +
      "</section>";

    /* 1 product idea */
    H += sec("idea", "The Product Idea", "Most Tools Summarize. This One Visualizes Movement.",
      p("The project starts with a two-person chat export. Each message is scored for how it changes the visible relationship atmosphere: warmer, colder, more invested, more distant, more tense, more repaired, more playful, or more withdrawn. Those message-level changes form a relationship index path, compressed into candlesticks across 5-minute, 1-hour, daily, weekly, and longer timeframes.") +
      splitCompare() +
      p("A single day can become one candle. A normal greeting opens around 50. Cold replies push the index down. Later explanation, repair, or renewed engagement pulls it back up. The candle is created from the path.") +
      exampleBeats() +
      demo());

    /* 2 why it works */
    H += sec("metaphor", "Why the Metaphor Works", "Relationship Movement Looks Like Price Action",
      p("Before a confession, people rarely go all in. They test the boundary with low-risk language: \u201cDo you think we are close?\u201d \u201cAre you this nice to everyone?\u201d In market language, that is a probe. A small move tests whether there is resistance above. If the other person deflects, the index may spike and fall back. If they follow the signal, the move can continue.") +
      patternCards());

    /* 3 message to index */
    H += sec("scoring", "From Message to Index", "Relative Movement, Not Absolute Scores",
      p("The scoring model uses relative movement rather than absolute affection scores. The LLM does not assign \u201cthis message is a 7 out of 10.\u201d Each message receives two relative deltas: one versus the immediately previous message, and one versus the recent conversation atmosphere. It is easier to judge whether a message is warmer than the previous one than to assign a universal score.") +
      scoringFields() +
      indexPath());

    /* 4 semantic axes */
    H += sec("axes", "The Semantic Axes", "What Moved the Index",
      p("Each message is tagged with a primary semantic dimension that explains what moved the relationship index. These labels are used for attribution and chart explanation, not for hidden-personality claims. Click a dimension to inspect it.") +
      dimensionWheel());

    /* 5 index to k-line */
    H += sec("ohlc", "From Index to K-Line", "Wicks Are Not Drawn by Hand",
      p("After message scoring, the system computes the relationship index locally. Time gaps decay it toward a neutral baseline; message deltas push it up or down. The full path is aggregated into OHLC candles. A long upper wick means the index reached higher and pulled back. A long lower wick means it dropped and recovered.") +
      ohlcExplainer());

    /* 6 what the chart shows */
    H += sec("chart", "What the Chart Shows", "A Trading Terminal for a Conversation",
      p("The chart borrows the grammar of a trading terminal. Users switch timeframes, read candlesticks, inspect volume, and view local indicators computed from the relationship index path. The most important feature is attribution: hovering over a candle reveals the dominant dimensions and the key messages behind that move.") +
      chartPanel());

    /* 7 two workflows */
    H += sec("workflows", "Two Workflows", "Local Skills Mode and Online API Mode",
      p("Local Skills mode is designed for sensitive chats: the user registers the skill in a local AI coding environment, runs the scoring workflow, and imports the local score file. The chat stays on the machine. Online API mode is designed for fast experimentation: the user picks a provider, enters an API key, points to a chat file, and the backend calls the model. Both workflows produce the same scored data.") +
      workflowSwitch());

    /* 8 architecture */
    H += sec("architecture", "Technical Architecture", "A Local Web App with a Python Backend",
      p("The backend parses CSV, JSON, JSONL, or TXT chat exports into a standardized message format. Preprocessing merges consecutive messages into turns to reduce LLM calls. The scoring layer produces relative deltas, expansion returns scores to message level, and the chart layer computes the index, aggregates OHLC candles, calculates indicators, and serves the frontend.") +
      archStack());

    /* 9 privacy */
    H += sec("privacy", "Privacy Boundary", "The Workflow Makes the Boundary Explicit",
      p("The product handles sensitive data, so the workflow makes the boundary explicit.") +
      privacyCards());

    /* 10 why it spread */
    H += sec("spread", "Why It Spread", "A Metaphor People Understood Fast Enough to Share",
      p("The project worked as a social-media idea because the metaphor compressed a complex emotional experience into a familiar visual language. A cold reply becomes a pullback. A repair becomes a lower wick. A risky flirt becomes a breakout attempt. A failed push becomes an upper wick. That clarity helped it travel on Xiaohongshu.") +
      proofBoard(false));

    /* 11 demonstrates */
    H += sec("demonstrates", "What This Project Demonstrates", "A Familiar Metaphor as a Working Data Interface",
      p("Relationship Candlestick Lab demonstrates a product pattern for consumer AI: turn a familiar metaphor into a working data interface. It combines LLM-based relative scoring, local Python computation, OHLC aggregation, technical indicators, multi-timeframe charting, hover attribution, privacy-aware workflows, and a social-media-native concept.") +
      p("It shows how an AI project can become legible outside the AI community when the output feels visual, interpretable, and shareable.") +
      '<div class="ca-foot"><span>GitHub Project &middot; Relationship Candlestick Lab</span><span>Zhenyuan Pan &middot; 2026</span></div>');

    return (
      '<button class="case-close" type="button" aria-label="Close article"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll rc-scroll"><article class="case-article ai-article rc-article">' + H + "</article></div>"
    );
  };

  /* ================= viz ================= */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wireIndexAndProgress(scroller) {
    var nav = scroller.querySelector(".rc-controls .ai-index");
    var secs = [].slice.call(scroller.querySelectorAll(".rc-sec[data-rc-label]"));
    if (!nav) return;
    var links = [];
    secs.forEach(function (s) {
      var a = document.createElement("button");
      a.type = "button"; a.className = "ai-ix"; a.textContent = s.getAttribute("data-rc-label"); a.setAttribute("data-target", s.id);
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

  function miniCandle(o, h, l, c) {
    var W = 130, Hh = 200, pad = 18;
    function Y(v) { return pad + (100 - v) / 100 * (Hh - 2 * pad); }
    var up = c >= o, col = up ? "#1f9d6b" : "#e0476b", cx = W / 2;
    var bt = Y(Math.max(o, c)), bb = Y(Math.min(o, c));
    var s = '<svg viewBox="0 0 ' + W + " " + Hh + '" aria-hidden="true">';
    [25, 50, 75].forEach(function (g) { s += '<line x1="8" y1="' + Y(g).toFixed(1) + '" x2="' + (W - 8) + '" y2="' + Y(g).toFixed(1) + '" stroke="rgba(20,24,31,0.06)"/>'; });
    s += '<line x1="' + cx + '" y1="' + Y(h).toFixed(1) + '" x2="' + cx + '" y2="' + Y(l).toFixed(1) + '" stroke="' + col + '" stroke-width="2.4"/>';
    s += '<rect x="' + (cx - 17) + '" y="' + bt.toFixed(1) + '" width="34" height="' + Math.max(3, bb - bt).toFixed(1) + '" rx="2.5" fill="' + col + '"/>';
    s += '<text x="' + (cx + 22) + '" y="' + (Y(h) + 4).toFixed(1) + '" style="font:700 10px Archivo,sans-serif" fill="#6b7480">H ' + h + "</text>";
    s += '<text x="' + (cx + 22) + '" y="' + (Y(c) + 4).toFixed(1) + '" style="font:700 10px Archivo,sans-serif" fill="' + col + '">C ' + c + "</text>";
    s += '<text x="' + (cx - 22) + '" y="' + (Y(o) + 4).toFixed(1) + '" text-anchor="end" style="font:700 10px Archivo,sans-serif" fill="#6b7480">O ' + o + "</text>";
    s += '<text x="' + (cx - 22) + '" y="' + (Y(l) + 4).toFixed(1) + '" text-anchor="end" style="font:700 10px Archivo,sans-serif" fill="#6b7480">L ' + l + "</text></svg>";
    return s;
  }
  function rcComboSVG(pts, bubs, o, hi, lo, c) {
    var W = 660, H = 250, padT = 26, padB = 42, left = 46, pathR = 430, candX = 560;
    var vmin = lo - 9, vmax = hi + 9;
    function Y(v) { return padT + (vmax - v) / (vmax - vmin) * (H - padT - padB); }
    var n = pts.length, step = (pathR - left) / (n - 1);
    function X(i) { return left + i * step; }
    var hiIdx = pts.indexOf(hi), loIdx = pts.indexOf(lo);
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;" role="img" aria-label="Each message is a point on the relationship index path; the day is summarized as one candle whose open, high, low, and close come from those points.">';
    s += '<text x="' + left + '" y="15" style="font:700 9.5px Archivo,sans-serif;letter-spacing:0.07em;text-transform:uppercase" fill="#9098a3">Message index path</text>';
    s += '<text x="' + candX + '" y="15" text-anchor="middle" style="font:700 9.5px Archivo,sans-serif;letter-spacing:0.07em;text-transform:uppercase" fill="#9098a3">One candle</text>';
    s += '<line x1="' + left + '" y1="' + Y(50).toFixed(1) + '" x2="' + (candX + 34) + '" y2="' + Y(50).toFixed(1) + '" stroke="rgba(20,24,31,0.08)" stroke-dasharray="4 5"/>';
    s += '<text x="' + (left - 8) + '" y="' + (Y(50) + 3).toFixed(1) + '" text-anchor="end" style="font:600 9px Archivo,sans-serif" fill="#b8bec7">50</text>';
    /* dashed connectors from the extreme points to the candle */
    s += '<line x1="' + X(hiIdx).toFixed(1) + '" y1="' + Y(hi).toFixed(1) + '" x2="' + candX + '" y2="' + Y(hi).toFixed(1) + '" stroke="#1f9d6b" stroke-width="1" stroke-dasharray="3 4" opacity="0.55"/>';
    s += '<line x1="' + X(loIdx).toFixed(1) + '" y1="' + Y(lo).toFixed(1) + '" x2="' + candX + '" y2="' + Y(lo).toFixed(1) + '" stroke="#e0476b" stroke-width="1" stroke-dasharray="3 4" opacity="0.55"/>';
    /* path */
    var line = 'M' + pts.map(function (v, i) { return X(i).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' L');
    s += '<path d="' + line + '" fill="none" stroke="#d6006c" stroke-width="2.4"/>';
    pts.forEach(function (v, i) {
      var col = (i > 0 && v < pts[i - 1]) ? '#e0476b' : '#1f9d6b';
      s += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="4.5" fill="' + col + '"/>';
      s += '<text x="' + X(i).toFixed(1) + '" y="' + Y(v).toFixed(1) + '" dy="-9" text-anchor="middle" style="font:800 9.5px Archivo,sans-serif" fill="#14181f">' + v + '</text>';
      s += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 24) + '" text-anchor="middle" style="font:700 9px Archivo,sans-serif" fill="#9098a3">' + esc(bubs[i][1]) + '</text>';
      if (i === hiIdx) s += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" style="font:800 8.5px Archivo,sans-serif" fill="#1f9d6b">HIGH</text>';
      else if (i === loIdx) s += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" style="font:800 8.5px Archivo,sans-serif" fill="#e0476b">LOW</text>';
      else if (i === 0) s += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" style="font:800 8.5px Archivo,sans-serif" fill="#9098a3">OPEN</text>';
      else if (i === n - 1) s += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" style="font:800 8.5px Archivo,sans-serif" fill="#9098a3">CLOSE</text>';
    });
    /* candle */
    var up = c >= o, col = up ? '#1f9d6b' : '#e0476b', bw = 46, bt = Y(Math.max(o, c)), bb = Y(Math.min(o, c));
    s += '<line x1="' + candX + '" y1="' + Y(hi).toFixed(1) + '" x2="' + candX + '" y2="' + Y(lo).toFixed(1) + '" stroke="' + col + '" stroke-width="2.5"/>';
    s += '<rect x="' + (candX - bw / 2) + '" y="' + bt.toFixed(1) + '" width="' + bw + '" height="' + Math.max(3, bb - bt).toFixed(1) + '" rx="3" fill="' + col + '"/>';
    s += '<text x="' + (candX + bw / 2 + 8) + '" y="' + (Y(hi) + 4).toFixed(1) + '" style="font:800 11px Archivo,sans-serif" fill="#6b7480">H ' + hi + '</text>';
    s += '<text x="' + (candX + bw / 2 + 8) + '" y="' + (Y(c) + 4).toFixed(1) + '" style="font:800 11px Archivo,sans-serif" fill="' + col + '">C ' + c + '</text>';
    s += '<text x="' + (candX - bw / 2 - 8) + '" y="' + (Y(o) + 4).toFixed(1) + '" text-anchor="end" style="font:800 11px Archivo,sans-serif" fill="#6b7480">O ' + o + '</text>';
    s += '<text x="' + (candX - bw / 2 - 8) + '" y="' + (Y(lo) + 4).toFixed(1) + '" text-anchor="end" style="font:800 11px Archivo,sans-serif" fill="#6b7480">L ' + lo + '</text>';
    s += '</svg>';
    return s;
  }
  function wireDemo(scroller) {
    var box = scroller.querySelector("[data-rc-demo]");
    if (!box) return;
    var tabs = box.querySelector('[data-role="tabs"]'), viz = box.querySelector('[data-role="viz"]'), interp = box.querySelector('[data-role="interp"]');
    ["A", "B", "C"].forEach(function (k, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "rc-dtab" + (i === 0 ? " on" : ""); b.textContent = SCENARIOS[k].nm;
      b.addEventListener("click", function () { tabs.querySelectorAll(".rc-dtab").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); render(k); });
      tabs.appendChild(b);
    });
    function render(k) {
      var s = SCENARIOS[k], pts = s.bubs.map(function (b) { return b[3]; });
      var o = pts[0], c = pts[pts.length - 1], hi = Math.max.apply(null, pts), lo = Math.min.apply(null, pts);
      var beats = '<div style="display:grid;grid-template-columns:repeat(' + s.bubs.length + ',1fr);gap:8px;margin-bottom:14px;">' + s.bubs.map(function (b, i) {
        var d = i > 0 ? b[3] - pts[i - 1] : null;
        var dtxt = d == null ? "start" : (d > 0 ? "+" + d : "" + d);
        var dcol = d == null ? "#9098a3" : (d >= 0 ? "#1f9d6b" : "#e0476b");
        var me = b[0] === "me";
        return '<div style="border:1px solid var(--line);border-radius:10px;padding:10px 11px;background:' + (me ? "#fff" : "#fbfbfc") + ';">' +
          '<div style="font:800 9px Archivo,sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:#9098a3;margin-bottom:5px;">' + esc(b[1]) + (me ? ' &middot; you' : '') + '</div>' +
          '<div style="font-size:12px;line-height:1.35;color:' + (me ? "#d6006c" : "#14181f") + ';margin-bottom:8px;min-height:32px;">' + esc(b[2]) + '</div>' +
          '<div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--line);padding-top:7px;"><span style="font:800 14px Archivo,sans-serif;color:#14181f;font-variant-numeric:tabular-nums;">' + b[3] + '</span><span style="font:800 11px Archivo,sans-serif;color:' + dcol + ';">' + dtxt + '</span></div></div>';
      }).join("") + "</div>";
      viz.innerHTML = beats + rcComboSVG(pts, s.bubs, o, hi, lo, c);
      interp.innerHTML = "<b>Open " + o + " &middot; High " + hi + " &middot; Low " + lo + " &middot; Close " + c + ".</b> " + esc(s.interp);
    }
    render("A");
  }
  function wirePatterns(scroller) {
    var detail = scroller.querySelector("[data-rc-patdetail]");
    var cards = [].slice.call(scroller.querySelectorAll(".rc-pat[data-pat]"));
    if (!detail || !cards.length) return;
    function render(i) {
      var pt = PATTERNS[i];
      cards.forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-pat") === i); });
      detail.innerHTML =
        '<div><div class="k">Chart shape</div><div class="v">' + esc(pt.shape) + "</div></div>" +
        '<div><div class="k">Relationship reading</div><div class="v">' + esc(pt.interp) + "</div></div>" +
        '<div class="full"><div class="k">Example behavior</div><div class="v">' + esc(pt.ex) + "</div></div>" +
        '<div class="full"><div class="k">What the chart suggests</div><div class="v">' + esc(pt.sug) + "</div></div>";
    }
    cards.forEach(function (b) {
      b.addEventListener("click", function () { render(+b.getAttribute("data-pat")); });
      b.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); render(+b.getAttribute("data-pat")); } });
    });
    render(0);
  }
  function wireWheel(scroller) {
    var box = scroller.querySelector("[data-rc-wheel]");
    if (!box) return;
    var detail = box.querySelector('[data-role="dimdetail"]');
    var segs = [].slice.call(box.querySelectorAll(".seg[data-dim]"));
    function render(i) {
      var d = DIMS[i];
      detail.innerHTML = '<div class="nm">' + esc(d.k.replace(/_/g, " ")) + "</div>" +
        '<div class="row"><div class="k">Meaning</div><div class="v">' + esc(d.mean) + "</div></div>" +
        '<div class="row"><div class="k">Positive signal</div><div class="v">' + esc(d.pos) + "</div></div>" +
        '<div class="row"><div class="k">Negative signal</div><div class="v">' + esc(d.neg) + "</div></div>" +
        '<div class="row"><div class="k">Index effect</div><div class="v">' + esc(d.eff) + "</div></div>";
    }
    segs.forEach(function (g) { g.addEventListener("click", function () { render(+g.getAttribute("data-dim")); }); });
    render(0);
  }
  function wireFlow(scroller) {
    var box = scroller.querySelector("[data-rc-flow]");
    if (!box) return;
    var sw = box.querySelector('[data-role="switch"]'), body = box.querySelector('[data-role="flowbody"]');
    var content = {
      local: '<div class="rc-flow priv"><div class="rc-flow-k">Local Skills Mode</div><div class="rc-flow-sub">Best for sensitive conversations.</div><ol><li>Chat stays local on your machine.</li><li>Register <code>skill/SKILL.md</code> in Claude Code, Codex, or a local AI IDE.</li><li>Run <code>/rcl-score</code> to score the conversation.</li><li>Import the local scored file into the web app.</li></ol></div>',
      api: '<div class="rc-flow api"><div class="rc-flow-k">Online API Mode</div><div class="rc-flow-sub">Best for fast web experiments.</div><ol><li>Open the local web app and choose a model provider.</li><li>Enter an API key for the current session.</li><li>Provide a chat file path.</li><li>The backend calls the selected model; the chart opens after scoring.</li></ol></div>'
    };
    sw.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { sw.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); body.innerHTML = content[b.getAttribute("data-mode")]; });
    });
    body.innerHTML = content.local;
  }

  window.__rclViz = {
    init: function (scroller) {
      if (!scroller || scroller.__rcDone) return;
      if (!scroller.querySelector(".rc-article")) return;
      scroller.__rcDone = true;
      try {
        wireIndexAndProgress(scroller);
        wireDemo(scroller);
        wirePatterns(scroller);
        wireWheel(scroller);
        wireFlow(scroller);
      } catch (err) { if (window.console) console.warn("rclab-viz", err); }
    }
  };
})();
