/* research-papers.js : "More from the workbench" course-paper tiles detail layer.

   Each small tile under the three big research cards opens the SAME frosted-glass
   case overlay (case-study.js, morph "plain") with a fixed three-part layout:
     left   = one showcase figure
     right  = paper title + summary (from the separate summary.md, via
              paper-data.js -> window.__PAPER_SUMMARIES) and, below it, the full
              PDF embedded in the browser's native viewer (zoom / print / download).

   Exposes window.__paperArticle(data) -> overlay HTML string. Self-contained:
   ships its own scoped pp-* style block and reuses the shared case-article shell.
   No en-dashes or em-dashes in any visible copy (project rule). */
(function () {
  "use strict";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* category label per paper (USAFacts tiles carry a short kicker) */
  var META = {
    "treasury-risk-triangle": { cat: "Fixed Income \u00b7 Risk Attribution" },
    "bonds-stop-hedging-stocks": { cat: "Asset Allocation \u00b7 Macro" },
    "price-of-stagflation-risk": { cat: "Cross-Asset \u00b7 Inflation" },
    "macro-disagreement-industry-rotation": { cat: "Equity Asset Pricing" },
    "revision-robust-forecasting": { cat: "Real-Time Forecasting" },
    "denied-mortgage-applicants": { cat: "Credit \u00b7 Partial Identification" }
  };

  var STYLE = '<style id="pp-style">' + [
    '.pp-article{max-width:1200px;}',
    '.pp-grid{display:grid;grid-template-columns:minmax(200px,0.9fr) minmax(0,1.1fr);gap:clamp(24px,3.4vw,56px);align-items:start;}',
    /* left figure, sticky while the right column scrolls */
    '.pp-figure{position:sticky;top:6px;}',
    '.pp-figure img{width:100%;height:auto;display:block;border-radius:14px;border:1px solid rgba(20,24,31,0.12);background:#fff;box-shadow:0 14px 36px -22px rgba(20,24,31,0.45);}',
    '.pp-figcap{font-size:11.5px;line-height:1.45;color:#79828f;margin-top:11px;text-wrap:pretty;}',
    /* right column */
    '.pp-cat{margin-bottom:13px;}',
    '.pp-main{min-width:0;}',
    '.pp-title{font-size:clamp(25px,2.9vw,40px);line-height:1.04;margin:0 0 18px;}',
    '.pp-summary{font-size:clamp(15px,1.15vw,17.5px);line-height:1.62;color:#2c3542;margin:0 0 26px;text-wrap:pretty;}',
    /* embedded native PDF */
    '.pp-pdf{border:1px solid rgba(20,24,31,0.16);border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 14px 36px -24px rgba(20,24,31,0.45);}',
    '.pp-pdf-bar{display:flex;align-items:center;gap:9px;padding:10px 13px;border-bottom:1px solid rgba(20,24,31,0.1);background:#f5f6f8;}',
    '.pp-pdf-dot{width:9px;height:9px;border-radius:2px;background:var(--mag);flex:none;}',
    '.pp-pdf-name{font:700 12.5px "Archivo",sans-serif;color:#14181f;letter-spacing:0.01em;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.pp-dl{margin-left:auto;flex:none;display:inline-flex;align-items:center;gap:6px;font:700 12px "Archivo",sans-serif;color:#14181f;text-decoration:none;border:1px solid rgba(20,24,31,0.2);border-radius:7px;padding:5px 11px;transition:background .15s,border-color .15s;}',
    '.pp-dl:hover{background:#14181f;color:#fff;border-color:#14181f;}',
    '.pp-pdf-frame{display:block;width:100%;min-width:0;height:clamp(560px,82vh,960px);border:0;background:#525659;}',
    /* responsive: stack, figure no longer sticky */
    '@media (max-width:860px){.pp-grid{grid-template-columns:1fr;}.pp-figure{position:static;}.pp-pdf-frame{height:clamp(440px,70vh,720px);}}'
  ].join("") + "</style>";

  window.__paperArticle = function (data) {
    var slug = data.slug;
    var meta = META[slug] || { cat: "" };
    var sum = (window.__PAPER_SUMMARIES && window.__PAPER_SUMMARIES[slug]) || { title: slug, body: "" };
    var img = "papers/" + slug + "/cover.png";
    var pdf = "papers/" + slug + "/" + slug + ".pdf";

    var H = STYLE +
      '<div class="pp-grid">' +
        '<div class="pp-figure">' +
          '<img src="' + img + '" alt="' + esc(sum.title) + ' figure">' +
          '<div class="pp-figcap">Selected figure from the paper.</div>' +
        '</div>' +
        '<div class="pp-main">' +
          '<div class="ca-kicker pp-cat">' + esc(meta.cat) + '</div>' +
          '<h1 class="ca-title pp-title">' + esc(sum.title) + '</h1>' +
          '<p class="pp-summary">' + esc(sum.body) + '</p>' +
          '<div class="pp-pdf">' +
            '<div class="pp-pdf-bar"><span class="pp-pdf-dot" aria-hidden="true"></span>' +
              '<span class="pp-pdf-name">' + esc(sum.title) + ' \u00b7 PDF</span>' +
              '<a class="pp-dl" href="' + pdf + '" download><span aria-hidden="true">\u2193</span> Download</a></div>' +
            '<iframe class="pp-pdf-frame" src="' + pdf + '#view=FitH" title="' + esc(sum.title) + ' (PDF)"></iframe>' +
          '</div>' +
        '</div>' +
      '</div>';

    return (
      '<button class="case-close" type="button" aria-label="Close paper"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll pp-scroll"><article class="case-article pp-article">' + H + "</article></div>"
    );
  };
})();
