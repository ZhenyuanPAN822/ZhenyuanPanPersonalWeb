/* research-competitions.js : compact one-screen "Competitions" overlay.
   Opens from the blue Competitions card in the Markets & Quant section.

   Exposes: window.__competitionsArticle(data) -> overlay HTML string.
   Intentionally short (one screen), no sticky index/progress. The returns
   chart and bar entrance are CSS-only, so nothing can get stuck off-screen.
   No em or en dashes in copy (project rule).
*/
(function () {
  "use strict";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var TROPHY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 H17 V9 A5 5 0 0 1 7 9 Z"/><path d="M7 6 H4 V7 A3 3 0 0 0 7.6 9.9"/><path d="M17 6 H20 V7 A3 3 0 0 1 16.4 9.9"/><path d="M12 14 V16.5"/><path d="M9 20 L10 16.5 H14 L15 20 Z"/></svg>';

  /* ---------- scoped styles ---------- */
  var STYLE = '<style id="cp-style">' + [
    '.cp-article{--grn:#15725e;--grn2:#1f8a5b;--ink:#14181f;--mut:#5a626e;--line:#e7e9ee;--soft:#f1f6f3;--gold:#a87b1f;--dn:#b9c0c9;}',
    '.cp-head{margin-bottom:6px;}',
    '.cp-lede{font-size:clamp(15px,1.35vw,18px);line-height:1.5;color:#2c333d;max-width:60ch;margin:2px 0 0;text-wrap:pretty;}',
    '.cp-reveal{animation:cpRise .7s cubic-bezier(.2,.7,.2,1) both;}',
    '@keyframes cpRise{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}',
    '.cp-grid{display:grid;grid-template-columns:1.04fr .96fr;gap:22px;align-items:start;margin-top:22px;}',
    /* cards */
    '.cp-cards{display:flex;flex-direction:column;gap:12px;}',
    '.cp-card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:15px 17px;border-left:3px solid var(--grn);}',
    '.cp-card.case{border-left-color:var(--gold);}',
    '.cp-badge{display:inline-flex;align-items:center;gap:6px;font:800 10.5px "Archivo",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--grn);background:var(--soft);border:1px solid #cfe0d8;border-radius:999px;padding:4px 10px;}',
    '.cp-card.case .cp-badge{color:var(--gold);background:#faf5e9;border-color:#ecdcba;}',
    '.cp-badge svg{width:13px;height:13px;}',
    '.cp-name{font:700 16px "Archivo",sans-serif;color:var(--ink);margin:10px 0 3px;line-height:1.25;text-wrap:pretty;}',
    '.cp-meta{font:600 11.5px ui-monospace,Menlo,Consolas,monospace;color:var(--mut);}',
    '.cp-desc{font-size:13px;color:var(--mut);margin-top:8px;line-height:1.45;}',
    '.cp-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;}',
    '.cp-chip{display:flex;flex-direction:column;gap:1px;border:1px solid var(--line);border-radius:8px;padding:6px 11px;min-width:64px;}',
    '.cp-chip b{font:800 15px ui-monospace,Menlo,Consolas,monospace;color:var(--grn);letter-spacing:.01em;}',
    '.cp-chip.rank b{color:var(--ink);}',
    '.cp-chip span{font:700 8.5px "Archivo",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mut);}',
    /* chart panel */
    '.cp-chart{border:1px solid var(--line);border-radius:12px;background:linear-gradient(180deg,#fcfdfc,#fff);padding:16px 16px 14px;position:sticky;top:8px;}',
    '.cp-chart-h{font:700 10.5px "Archivo",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);margin:0 0 4px;display:flex;align-items:center;gap:8px;}',
    '.cp-chart-h::before{content:"";width:14px;height:2px;background:var(--grn);}',
    '.cp-leg{display:flex;gap:14px;margin:6px 0 4px;font-size:11px;color:var(--mut);}',
    '.cp-leg span{display:inline-flex;align-items:center;gap:6px;}',
    '.cp-leg i{width:11px;height:11px;border-radius:3px;display:inline-block;}',
    '.cp-leg i.s{background:var(--grn);}.cp-leg i.b{background:var(--dn);}',
    '.cp-chart svg{width:100%;height:auto;display:block;overflow:visible;}',
    '.cp-cap{font-size:11.5px;color:var(--mut);margin-top:10px;line-height:1.5;}',
    '@media (max-width:760px){.cp-grid{grid-template-columns:1fr;}.cp-chart{position:static;}}',
    '@media (prefers-reduced-motion:reduce){.cp-reveal{animation:none!important;}}'
  ].join("") + "</style>";

  /* ---------- returns chart (strategy vs CSI 300) ---------- */
  function chart() {
    var groups = [
      { name: "ETF Elite Challenge", strat: 9.88, bench: -2.69, excess: 12.57 },
      { name: "Eastmoney Live", strat: 29.10, bench: 10.97, excess: 18.13 }
    ];
    var TOP = 26, BH = 168, MINV = -6, MAXV = 32;
    function y(v) { return TOP + (MAXV - v) / (MAXV - MINV) * BH; }
    var zeroY = y(0);
    var centers = [108, 250], bw = 34;
    var svg = '<svg viewBox="0 0 350 252" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
    // gridlines + y labels
    [0, 10, 20, 30].forEach(function (g) {
      var gy = y(g);
      svg += '<line x1="42" y1="' + gy.toFixed(1) + '" x2="318" y2="' + gy.toFixed(1) + '" stroke="' + (g === 0 ? "#c9ced6" : "#eef0f3") + '" stroke-width="' + (g === 0 ? 1.4 : 1) + '"/>';
      svg += '<text x="36" y="' + (gy + 3).toFixed(1) + '" text-anchor="end" font-family="ui-monospace,Menlo,monospace" font-size="9" fill="#9098a3">' + g + '</text>';
    });
    groups.forEach(function (gp, i) {
      var c = centers[i];
      var sx = c - bw - 4, bx = c + 4;
      // strategy bar (always positive here)
      var sy = y(gp.strat), sh = zeroY - sy;
      svg += '<rect class="cp-bar up" x="' + sx + '" y="' + sy.toFixed(1) + '" width="' + bw + '" height="' + sh.toFixed(1) + '" rx="3" fill="#15725e"/>';
      svg += '<text x="' + (sx + bw / 2) + '" y="' + (sy - 6).toFixed(1) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="10.5" font-weight="700" fill="#15725e">+' + gp.strat.toFixed(2) + '</text>';
      // benchmark bar (may be negative)
      var byTop = Math.min(zeroY, y(gp.bench)), bh = Math.abs(zeroY - y(gp.bench));
      var neg = gp.bench < 0;
      svg += '<rect class="cp-bar ' + (neg ? "dn" : "up") + '" x="' + bx + '" y="' + byTop.toFixed(1) + '" width="' + bw + '" height="' + bh.toFixed(1) + '" rx="3" fill="#b9c0c9"/>';
      var blabY = neg ? (y(gp.bench) + 13) : (y(gp.bench) - 6);
      svg += '<text x="' + (bx + bw / 2) + '" y="' + blabY.toFixed(1) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="10" font-weight="700" fill="#7b828d">' + (gp.bench < 0 ? "" : "+") + gp.bench.toFixed(2) + '</text>';
      // excess callout above the group
      svg += '<text x="' + c + '" y="16" text-anchor="middle" font-family="Archivo,sans-serif" font-size="10.5" font-weight="800" fill="#15725e">+' + gp.excess.toFixed(2) + ' excess</text>';
      // group label below
      svg += '<text x="' + c + '" y="232" text-anchor="middle" font-family="Archivo,sans-serif" font-size="11.5" font-weight="700" fill="#14181f">' + gp.name + '</text>';
      svg += '<text x="' + c + '" y="246" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="9" fill="#9098a3">vs CSI 300</text>';
    });
    svg += "</svg>";
    return '<div class="cp-chart cp-reveal"><div class="cp-chart-h">Return vs CSI 300</div>' +
      '<div class="cp-leg"><span><i class="s"></i>Strategy</span><span><i class="b"></i>CSI 300</span></div>' +
      svg +
      '<div class="cp-cap">Strategy return against the CSI 300 over each competition window. The gap above the benchmark is the excess return.</div></div>';
  }

  function card(opts) {
    var chips = (opts.chips || []).map(function (c) {
      return '<div class="cp-chip' + (c[2] ? " " + c[2] : "") + '"><b>' + esc(c[0]) + '</b><span>' + esc(c[1]) + "</span></div>";
    }).join("");
    return '<div class="cp-card cp-reveal' + (opts.cls ? " " + opts.cls : "") + '">' +
      '<div class="cp-badge">' + TROPHY + esc(opts.badge) + "</div>" +
      '<h3 class="cp-name">' + esc(opts.name) + "</h3>" +
      '<div class="cp-meta">' + esc(opts.meta) + "</div>" +
      (opts.desc ? '<div class="cp-desc">' + esc(opts.desc) + "</div>" : "") +
      (chips ? '<div class="cp-chips">' + chips + "</div>" : "") +
      "</div>";
  }

  window.__competitionsArticle = function (data) {
    var H = STYLE;
    H += '<div class="cp-head cp-reveal">' +
      '<div class="ca-kicker">Competitions</div>' +
      '<h1 class="ca-title">Trading and Case Competitions</h1>' +
      '<p class="cp-lede">National finance and ETF trading competitions, judged on real returns against the CSI 300.</p>' +
      "</div>";

    H += '<div class="cp-grid"><div class="cp-cards">';
    H += card({
      badge: "Second Prize \u00b7 Top 0.29%",
      name: "National ETF Trading Elite Challenge",
      meta: "3rd edition \u00b7 Oct 2024 to Jan 2025",
      chips: [["+9.88%", "Return"], ["+12.57%", "Excess"], ["Top 0.29%", "Rank", "rank"]]
    });
    H += card({
      badge: "Top 4.41%",
      name: "Eastmoney Securities Live ETF Trading",
      meta: "Live trading \u00b7 Jun 2024 to Dec 2024",
      chips: [["+29.10%", "Return"], ["+18.13%", "Excess"], ["Top 4.41%", "Rank", "rank"]]
    });
    H += card({
      cls: "case",
      badge: "Third Prize",
      name: "National College Student Finance Challenge",
      meta: "11th edition \u00b7 National Final \u00b7 2025",
      desc: "A new-consumption investment strategy, carried through to the national final round."
    });
    H += "</div>";
    H += chart();
    H += "</div>";

    return (
      '<button class="case-close" type="button" aria-label="Close"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll cp-scroll"><article class="case-article ai-article cp-article">' + H + "</article></div>"
    );
  };
})();
