/* experience.js — Screen 2 (Internship Experience) editorial builder.
   Reads window.SITE_DATA.internships, sorts reverse-chronological, and renders
   one text/visualization block per internship in an alternating (zig-zag)
   layout. The most recent internship — Shenzhen International Financial Research
   Association — is the LEAD block: it lives inside the pinned stage and owns the
   live K-line module (#chart-host) the hero morphs into. The remaining
   internships render below in normal flow; their visualizations are intentional
   blanks, reserved for interactive visualizations to be authored later. */
(function () {
  "use strict";

  const D = window.SITE_DATA;
  const lead = document.getElementById("block-lead");
  const blocks = document.getElementById("exp-blocks");
  if (!D || !lead || !blocks) return;

  const esc = (s) => String(s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
  const clean = (s) => String(s).replace(/,?\s*(Co\.,?\s*Ltd\.?|Co\.,?|Ltd\.?)\s*$/i, "").trim();

  const ordered = [...D.internships].sort((a, b) => String(b.start).localeCompare(String(a.start)));
  const K_ID = ordered.some((x) => x.id === "sifra") ? "sifra" : ordered[0].id;

  // The lead block is a lean "hero" composition (no bullets/tools) so the whole
  // settled headline + block fits one viewport during the pinned transition;
  // the remaining blocks carry the full treatment.
  function textCol(it, idx, lean) {
    const hasCase = it.id === "sifra" || it.id === "gaoke" || it.id === "yinhua" || it.id === "sinosafe";
    const points = lean
      ? (it.leadPoints || []).map((x) => "<li>" + esc(x) + "</li>").join("")
      : (it.overview || []).slice(0, 2).map((x) => "<li>" + esc(x) + "</li>").join("");
    const hasKeys = !!(it.keyGroups && it.keyGroups.length);
    const tools = (lean || hasKeys) ? "" : (it.tools || []).map((x) => '<span class="blk-tool">' + esc(x) + "</span>").join("");
    const title = (lean && it.companyShort) ? it.companyShort : clean(it.company);
    const body = String(it.roleSummary || "").split(/\n\n+/)
      .map((para) => '<p class="blk-body">' + esc(para) + "</p>").join("");
    const keys = "";
    const keyPills = hasKeys
      ? '<div class="blk-keys">' + it.keyGroups.map((g) =>
          '<div class="kg"><div class="kg-label">' + esc(g.label) + "</div>" +
          '<div class="kg-pills">' + g.items.map((x) => '<span class="blk-tool">' + esc(x) + "</span>").join("") + "</div></div>"
        ).join("") + "</div>"
      : "";
    const cta = hasCase
      ? '<div class="case-cta" role="link" tabindex="0" aria-label="View case study">' +
          '<span class="cta-line">View Case Study</span>' +
          '<span class="arr" aria-hidden="true">\u2197</span>' +
        "</div>"
      : "";
    return (
      '<div class="blk-text">' +
        '<div class="blk-eyebrow"><span class="blk-idx">' + idx + '</span>' +
          '<span class="blk-kicker">' + esc(it.tag) + "</span></div>" +
        '<h3 class="blk-title">' + esc(title) +
          (lean ? '<span class="title-click" aria-hidden="true"><svg class="tc-arr" viewBox="0 0 50 28" fill="none"><path d="M47 9 C36 16 22 19 9 15" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M9 15 L17 9 M9 15 L16 20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="tc-word">click</span></span>' : "") +
        "</h3>" +
        cta +
        '<div class="blk-meta">' + esc(it.role) + " · " + esc(it.period) + " · " + esc(it.location) + "</div>" +
        body +
        (points ? '<ul class="blk-points">' + points + "</ul>" : "") +
        keyPills +
        (tools ? '<div class="blk-tools">' + tools + "</div>" : "") +
      "</div>"
    );
  }

  function vizCol(it, isK) {
    if (isK) {
      return (
        '<div class="blk-viz">' +
          '<div class="viz-frame" id="chart-host"></div>' +
        "</div>"
      );
    }
    if (it.id === "gaoke") {
      return (
        '<div class="blk-viz">' +
          '<div class="viz-frame dd-frame" id="dd-graph"><canvas class="dd-canvas"></canvas></div>' +
        "</div>"
      );
    }
    if (it.id === "yinhua") {
      return (
        '<div class="blk-viz">' +
          '<div class="viz-frame ef-frame" id="equity-flow"><canvas class="ef-canvas"></canvas></div>' +
        "</div>"
      );
    }
    if (it.id === "sinosafe") {
      return (
        '<div class="blk-viz">' +
          '<div class="viz-frame wb-frame" id="workbook"><canvas class="wb-canvas"></canvas></div>' +
        "</div>"
      );
    }
    const label = (it.evidence && it.evidence.title) ? it.evidence.title : "Visualization";
    return (
      '<div class="blk-viz">' +
        '<div class="viz-frame viz-empty"><span class="ve-tag"><b>' + esc(label) + "</b>visualization · in progress</span></div>" +
        '<div class="viz-cap">Interactive module reserved · to be built.</div>' +
      "</div>"
    );
  }

  function buildBlock(it, i) {
    const idx = String(i + 1).padStart(2, "0");
    const side = i % 2 === 0 ? "viz-right" : "viz-left"; // block 1: viz on the right
    const isK = it.id === K_ID;
    const hasCase = it.id === "sifra" || it.id === "gaoke" || it.id === "yinhua" || it.id === "sinosafe";
    const art = document.createElement("article");
    art.className = "blk " + side + (i === 0 ? " is-lead" : "") + (hasCase ? " has-case" : "");
    art.setAttribute("data-screen-label", it.companyShort || clean(it.company));
    if (hasCase) art.setAttribute("data-case-id", it.id);
    art.innerHTML = textCol(it, idx, i === 0) + vizCol(it, isK);
    return art;
  }

  // lead block → pinned stage; remaining blocks → normal flow below
  ordered.forEach((it, i) => {
    const block = buildBlock(it, i);
    if (i === 0) lead.appendChild(block);
    else blocks.appendChild(block);
  });

  // the morph reads #chart-host's rect; trigger a re-measure now that it exists
  if (window.__morphMeasure) window.__morphMeasure();
})();
