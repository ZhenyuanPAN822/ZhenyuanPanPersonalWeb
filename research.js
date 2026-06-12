/* research.js — Screen 3 (Research Console) behaviour: project selector,
   event-study / network / small-multiple SVG renderers, detail panel, metrics,
   and the S2→S3 entrance choreography hook (__onResearchMorph). Vanilla JS.
   Entrance animations are JS-tween driven (no CSS transitions) so they finish
   even in throttled contexts. */
(function () {
  "use strict";

  const D = window.RESEARCH_DATA;
  if (!D) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const NS = "http://www.w3.org/2000/svg";
  const esc = (s) => String(s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const sv = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); return n; };

  let cur = D.projects[0];

  // ── tiny JS tween engine (interval-driven; survives rAF throttling) ────────
  const tweens = [];
  setInterval(() => {
    const now = performance.now();
    for (let i = tweens.length - 1; i >= 0; i--) {
      const t = tweens[i];
      const k = Math.max(0, Math.min(1, (now - t.t0) / t.dur));
      const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
      t.el.style.opacity = String(e);
      if (t.dy) t.el.style.transform = "translateY(" + ((1 - e) * t.dy) + "px)";
      if (k >= 1) { t.el.style.transform = ""; tweens.splice(i, 1); }
    }
  }, 16);
  function enter(els, baseDelay, step, dy) {
    const t0 = performance.now();
    els.forEach((n, i) => {
      n.style.opacity = "0";
      tweens.push({ el: n, t0: t0 + baseDelay + i * step, dur: 380, dy: dy == null ? 6 : dy });
    });
  }

  // ── LEFT: project selector (reuses .strat component styles) ────────────────
  const list = $("#proj-list");
  D.projects.forEach((p) => {
    const b = el("button", "strat");
    b.dataset.id = p.id;
    b.innerHTML =
      '<div class="strat-top"><span class="nm">' + esc(p.name) + '</span><span class="tag">' + esc(p.tag) + '</span></div>' +
      '<div class="facs">' + p.methods.map((m) => '<span class="fac">' + esc(m) + "</span>").join("") + "</div>";
    b.addEventListener("click", () => selectProject(p.id, true));
    list.appendChild(b);
  });
  const pc = $("#proj-count"); if (pc) pc.textContent = String(D.projects.length).padStart(2, "0");

  function selectProject(id, animate) {
    cur = D.projects.find((p) => p.id === id) || D.projects[0];
    [...list.children].forEach((c) => c.classList.toggle("sel", c.dataset.id === cur.id));
    const code = $("#s3-proj-code");
    if (code) {
      const tagTail = (cur.tag.split("·")[1] || "").trim().toUpperCase();
      code.textContent = cur.id.toUpperCase() + (tagTail ? " · " + tagTail : "");
    }
    const rc = $("#rdetail-code");
    if (rc) rc.textContent = "P-" + String(D.projects.indexOf(cur) + 1).padStart(2, "0");
    renderAll(animate && document.body.classList.contains("s3-live"));
  }

  // ── CENTER 1: event-study plot ─────────────────────────────────────────────
  function renderES(animate) {
    const host = $("#es-plot");
    host.innerHTML = "";
    const w = host.clientWidth, h = host.clientHeight;
    if (w < 60 || h < 60) return;
    const M = { l: 52, r: 18, t: 16, b: 34 };
    const iw = w - M.l - M.r, ih = h - M.t - M.b;
    const pts = cur.es.points;
    const xs = pts.map((p) => p.t);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    let ymin = Math.min(...pts.map((p) => p.lo)), ymax = Math.max(...pts.map((p) => p.hi));
    const ypad = (ymax - ymin) * 0.18 || 0.1;
    ymin -= ypad; ymax += ypad;
    if (ymin > 0) ymin = -ypad; if (ymax < 0) ymax = ypad;
    const X = (t) => M.l + ((t - xmin) / (xmax - xmin || 1)) * iw;
    const Y = (v) => M.t + ((ymax - v) / (ymax - ymin || 1)) * ih;

    const svg = sv("svg", { viewBox: "0 0 " + w + " " + h });
    host.appendChild(svg);

    // post-treatment band
    const bandX = X(Math.max(xmin, -0.5));
    svg.appendChild(sv("rect", { x: bandX, y: M.t, width: M.l + iw - bandX, height: ih, class: "es-band" }));

    // y grid + labels
    const range = ymax - ymin;
    const rawStep = range / 4.5;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const nn = rawStep / mag;
    const step = (nn < 1.5 ? 1 : nn < 3 ? 2 : nn < 7 ? 5 : 10) * mag;
    for (let v = Math.ceil(ymin / step) * step; v <= ymax; v += step) {
      const y = Y(v);
      svg.appendChild(sv("line", { x1: M.l, y1: y, x2: M.l + iw, y2: y, class: Math.abs(v) < step / 2 ? "es-zero" : "es-grid" }));
      const lbl = sv("text", { x: M.l - 8, y: y + 3, "text-anchor": "end", class: "es-axis" });
      const vv = Math.abs(v) < step / 2 ? 0 : v;
      lbl.textContent = vv.toFixed(2).replace("-", "−");
      svg.appendChild(lbl);
    }
    // x labels
    pts.forEach((p) => {
      const t = sv("text", { x: X(p.t), y: M.t + ih + 16, "text-anchor": "middle", class: "es-axis" });
      t.textContent = (p.t > 0 ? "+" : "") + p.t;
      svg.appendChild(t);
    });
    const xt = sv("text", { x: M.l + iw, y: M.t + ih + 30, "text-anchor": "end", class: "es-axis-title" });
    xt.textContent = "event time (months)";
    svg.appendChild(xt);
    const yt = sv("text", { x: M.l - 38, y: M.t + 2, class: "es-axis-title" });
    yt.textContent = cur.es.y;
    svg.appendChild(yt);

    // CI whiskers + points (grouped for stagger)
    const groups = [];
    pts.forEach((p) => {
      const g = sv("g", {});
      const x = X(p.t);
      g.appendChild(sv("line", { x1: x, y1: Y(p.lo), x2: x, y2: Y(p.hi), class: "es-ci" }));
      g.appendChild(sv("line", { x1: x - 3.5, y1: Y(p.lo), x2: x + 3.5, y2: Y(p.lo), class: "es-ci-cap" }));
      g.appendChild(sv("line", { x1: x - 3.5, y1: Y(p.hi), x2: x + 3.5, y2: Y(p.hi), class: "es-ci-cap" }));
      g.appendChild(sv("circle", { cx: x, cy: Y(p.b), r: 3.4, class: p.t < 0 ? "es-pt-pre" : "es-pt" }));
      svg.appendChild(g);
      groups.push(g);
    });

    $("#es-title").textContent = cur.es.label;
    $("#es-sub").textContent = "Dynamic effects · 95% CI · " + cur.es.unit;
    // expose plot geometry so the candle→coefficient morph lands pixel-perfectly
    window.__esGeom = {
      rect: host.getBoundingClientRect(),
      pts: pts.map((p) => ({ x: X(p.t), yB: Y(p.b), yLo: Y(p.lo), yHi: Y(p.hi), pre: p.t < 0 })),
    };
    if (animate) enter(groups, 120, 42, 0);
  }

  // ── CENTER 2a: corridor / network schematic ────────────────────────────────
  function renderCorr(animate) {
    const host = $("#corr-plot");
    host.innerHTML = "";
    const w = host.clientWidth, h = host.clientHeight;
    if (w < 60 || h < 50) return;
    const svg = sv("svg", { viewBox: "0 0 " + w + " " + h });
    host.appendChild(svg);
    // faint graph-paper grid
    for (let gx = 0.2; gx < 1; gx += 0.2) svg.appendChild(sv("line", { x1: gx * w, y1: 8, x2: gx * w, y2: h - 8, class: "corr-grid" }));
    for (let gy = 0.25; gy < 1; gy += 0.25) svg.appendChild(sv("line", { x1: 10, y1: gy * h, x2: w - 10, y2: gy * h, class: "corr-grid" }));

    const C = cur.corridors;
    const pos = {};
    C.nodes.forEach((n) => { pos[n.id] = { x: n.x * w, y: n.y * h }; });
    const parts = [];
    C.routes.forEach((rt) => {
      const a = pos[rt.a], b = pos[rt.b];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const L = Math.hypot(dx, dy) || 1;
      const cxp = mx - (dy / L) * L * 0.16, cyp = my + (dx / L) * L * 0.16;
      const path = sv("path", { d: "M" + a.x + " " + a.y + " Q" + cxp + " " + cyp + " " + b.x + " " + b.y, class: "corr-route" + (rt.k === "alt" ? " alt" : "") });
      svg.appendChild(path); parts.push(path);
    });
    C.nodes.forEach((n, i) => {
      const p = pos[n.id];
      const hot = i === 1;
      const c = sv("circle", { cx: p.x, cy: p.y, r: hot ? 5 : 4, class: "corr-node" + (hot ? " hot" : "") });
      svg.appendChild(c); parts.push(c);
      const t = sv("text", { x: p.x + 8, y: p.y - 7, class: "corr-label" });
      if (p.x > w * 0.78) { t.setAttribute("x", p.x - 8); t.setAttribute("text-anchor", "end"); }
      t.textContent = n.r;
      svg.appendChild(t);
    });
    $("#corr-label").textContent = C.label;
    if (animate) enter(parts, 220, 30, 0);
  }

  // ── CENTER 2b: panel small multiples ───────────────────────────────────────
  function renderSM(animate) {
    const host = $("#sm-plot");
    host.innerHTML = "";
    const rows = [];
    cur.panel.groups.forEach((g) => {
      const row = el("div", "sm-row");
      row.appendChild(el("div", "sm-label", esc(g.k)));
      const spark = el("div", "sm-spark");
      row.appendChild(spark);
      const last = g.trend[g.trend.length - 1];
      const v = el("div", "sm-val" + (last > 0.05 ? " pos" : last < -0.05 ? " neg" : ""), (last > 0 ? "+" : "") + last.toFixed(2).replace("-", "−"));
      row.appendChild(v);
      host.appendChild(row);
      rows.push(row);

      // build sparkline after layout
      requestAnimationFrame(() => buildSpark(spark, g.trend));
      setTimeout(() => { if (!spark.firstChild) buildSpark(spark, g.trend); }, 120);
    });
    $("#panel-label").textContent = cur.panel.label;
    if (animate) enter(rows, 320, 70, 6);
  }
  function buildSpark(spark, trend) {
    if (spark.firstChild) return;
    const w = spark.clientWidth || 160, h = spark.clientHeight || 38;
    const svg = sv("svg", { viewBox: "0 0 " + w + " " + h });
    let mn = Math.min(0, ...trend), mx = Math.max(0, ...trend);
    const pad = (mx - mn) * 0.15 || 0.2; mn -= pad; mx += pad;
    const X = (i) => 2 + (i / (trend.length - 1)) * (w - 4);
    const Y = (v) => 2 + ((mx - v) / (mx - mn)) * (h - 4);
    svg.appendChild(sv("line", { x1: 0, y1: Y(0), x2: w, y2: Y(0), class: "sm-base" }));
    const pts = trend.map((v, i) => X(i) + " " + Y(v)).join(" L");
    svg.appendChild(sv("path", { d: "M" + pts + " L" + (w - 2) + " " + Y(0) + " L2 " + Y(0) + " Z", class: "sm-area" }));
    svg.appendChild(sv("path", { d: "M" + pts, class: "sm-line" }));
    spark.appendChild(svg);
  }

  // ── RIGHT: research details ────────────────────────────────────────────────
  function renderDetail(animate) {
    const host = $("#rdetail");
    const d = cur.details;
    const ul = (arr) => "<ul>" + arr.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>";
    host.innerHTML =
      '<div class="r-sec"><div class="rs-label">Research Question</div><div class="rs-lede">' + esc(d.question) + "</div></div>" +
      '<div class="r-sec"><div class="rs-label">Data</div>' + ul(d.data) + "</div>" +
      '<div class="r-sec"><div class="rs-label">Identification</div>' + ul(d.identification) + "</div>" +
      '<div class="r-sec"><div class="rs-label">Key Findings</div>' + ul(d.findings) + "</div>" +
      '<div class="r-sec tags"><div class="rs-label">Robustness</div><div class="rs-chips">' +
        d.robustness.map((x) => '<span class="rs-chip">' + esc(x) + "</span>").join("") + "</div></div>";
    if (animate) enter([...host.children], 260, 60, 6);
  }

  // ── BOTTOM: metrics strip ──────────────────────────────────────────────────
  function renderMetrics(animate) {
    const host = $("#metrics-strip");
    host.innerHTML = "";
    const cells = [];
    cur.metrics.forEach((m) => {
      const c = el("div", "metric", '<div class="mv">' + esc(m.v) + '</div><div class="ml">' + esc(m.l) + "</div>");
      host.appendChild(c); cells.push(c);
    });
    if (animate) enter(cells, 380, 55, 6);
  }

  function renderAll(animate) {
    renderES(animate);
    renderCorr(animate);
    renderSM(animate);
    renderDetail(animate);
    renderMetrics(animate);
  }

  // ── S2 → S3 entrance choreography (driven each frame by transition.js) ─────
  const head = $(".s3-head");
  const left = $(".s3 .left-panel");
  const right = $(".s3 .right-panel");
  const metrics = $("#metrics-strip");
  const center = $(".r-center");
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const win = (t, a, b) => easeOut(Math.max(0, Math.min(1, (t - a) / (b - a))));

  window.__onResearchMorph = function (q) {
    if (!head) return;
    const esPlot = $("#es-plot");
    if (q <= 0) {
      head.style.transform = left.style.transform = right.style.transform = metrics.style.transform = center.style.transform = "";
      if (esPlot) esPlot.style.opacity = "";
      return;
    }
    // the SVG plot stays hidden while the morphing candles are in flight,
    // then crossfades in exactly as they land on its geometry
    if (esPlot) esPlot.style.opacity = String(win(q, 0.86, 0.985));
    const hh = win(q, 0.42, 0.80), ll = win(q, 0.48, 0.86), rr = win(q, 0.54, 0.92), mm = win(q, 0.60, 0.96);
    head.style.transform = "translateY(" + (-26 * (1 - hh)) + "px)";
    left.style.transform = "translateX(" + (-44 * (1 - ll)) + "px)";
    right.style.transform = "translateX(" + (44 * (1 - rr)) + "px)";
    metrics.style.transform = "translateY(" + (26 * (1 - mm)) + "px)";
    const cc = win(q, 0.46, 0.9);
    center.style.transform = "scale(" + (0.965 + 0.035 * cc) + ")";
  };

  let entered = false;
  window.__researchEnter = function () {
    // ES plot arrives via the candle-morph crossfade — never stagger its points
    renderES(false);
    renderCorr(!entered); renderSM(!entered); renderDetail(!entered); renderMetrics(!entered);
    entered = true;
  };

  let rT;
  window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => renderAll(false), 160); });

  // init (static, fully-visible render so any context shows complete state)
  selectProject(cur.id, false);
})();
