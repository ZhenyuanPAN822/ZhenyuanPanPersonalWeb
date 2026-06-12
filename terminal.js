/* terminal.js — Screen 2 behaviour: strategy selector, internship list with a
   full-page frosted modal, and chart overlays (signals / volume / axis) that
   project precisely onto the morphed-and-frozen hero chart. Vanilla JS. */
(function () {
  "use strict";

  const D = window.SITE_DATA;
  const $ = (s, r) => (r || document).querySelector(s);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const esc = (s) => String(s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));

  let curStrategy = D.strategies[0];
  let signals = [];

  // ── LEFT: strategy selector ────────────────────────────────────────────────
  const stratList = $("#strat-list");
  D.strategies.forEach((s) => {
    const b = el("button", "strat");
    b.dataset.id = s.id;
    b.innerHTML =
      '<div class="strat-top"><span class="nm">' + esc(s.name) + '</span><span class="tag">' + esc(s.tag) + '</span></div>' +
      '<div class="facs">' + s.factors.map((f) => '<span class="fac">' + esc(f) + "</span>").join("") + "</div>";
    b.addEventListener("click", () => selectStrategy(s.id));
    stratList.appendChild(b);
  });

  function selectStrategy(id) {
    curStrategy = D.strategies.find((s) => s.id === id) || D.strategies[0];
    [...stratList.children].forEach((c) => c.classList.toggle("sel", c.dataset.id === id));
    renderDetail();
    renderLegend();
    if (document.body.classList.contains("s2-live") || (window.__morph && window.__morph.e > 0.8)) {
      computeSignals(); renderSignals(); drawVolume();
    }
  }

  // ── CENTER: strategy detail strip ──────────────────────────────────────────
  const detail = $("#detail");
  function renderDetail() {
    const s = curStrategy;
    detail.innerHTML =
      '<div class="col">' +
        '<div class="d-label">Strategy</div>' +
        '<div class="d-name">' + esc(s.name) + "</div>" +
        '<div class="d-thesis">' + esc(s.thesis) + "</div>" +
      "</div>" +
      '<div class="col">' +
        '<div class="d-label">Buy / Sell logic</div>' +
        '<div class="d-logic"><span class="k">▲ Buy&nbsp;</span>' + esc(s.buy) + "<br>" +
        '<span class="k">▼ Sell&nbsp;</span>' + esc(s.sell) + "</div>" +
      "</div>" +
      '<div class="col">' +
        '<div class="d-label">Backtest snapshot · simulated</div>' +
        '<div class="perf">' +
          '<div><div class="pv pos">' + esc(s.perf.cagr) + '</div><div class="pl">CAGR</div></div>' +
          '<div><div class="pv">' + esc(s.perf.sharpe) + '</div><div class="pl">Sharpe</div></div>' +
          '<div><div class="pv">' + esc(s.perf.win) + '</div><div class="pl">Win rate</div></div>' +
          '<div><div class="pv neg">' + esc(s.perf.mdd) + '</div><div class="pl">Max DD</div></div>' +
        "</div>" +
      "</div>" +
      '<div class="d-foot"><span class="d-backtest">View full backtest →</span>' +
      '<span class="d-disclaim">Illustrative · fictional data</span></div>';
  }

  // ── chart overlays ─────────────────────────────────────────────────────────
  const host = $("#chart-host");
  const ovWrap = $("#ov-overlay");
  const ovLegend = $("#ov-legend");
  const ovMarkers = $("#ov-markers");
  const ovAnnots = $("#ov-annots");
  const ovAxis = $("#ov-axis");
  const ovLast = $("#ov-lasttag");
  const volCanvas = $("#vol-canvas");
  const vctx = volCanvas.getContext("2d");

  function state() { return window.__hero && window.__hero.state ? window.__hero.state() : null; }
  function project(i, price) {
    const st = state(), m = window.__morph;
    if (!st || !m) return null;
    const cx = i * st.slotW - st.scroll;
    const cy = st.top + (st.dispMax - price) / ((st.dispMax - st.dispMin) || 1) * st.ch;
    return { x: m.tx + cx * m.s - m.panel.left, y: m.ty + cy * m.s - m.panel.top };
  }
  function visibleCandles() {
    const st = state(), m = window.__morph; if (!st || !m) return [];
    const out = [];
    for (let i = 0; i < st.candles.length; i++) {
      const x = m.tx + (i * st.slotW - st.scroll) * m.s - m.panel.left;
      if (x >= 6 && x <= m.panel.width - 46) out.push({ i, x, k: st.candles[i] });
    }
    return out;
  }

  function computeSignals() {
    const vis = visibleCandles();
    const w = 3, piv = [];
    for (let j = w; j < vis.length - w; j++) {
      const k = vis[j].k; let isMin = true, isMax = true;
      for (let d = 1; d <= w; d++) {
        if (vis[j - d].k.l < k.l || vis[j + d].k.l < k.l) isMin = false;
        if (vis[j - d].k.h > k.h || vis[j + d].k.h > k.h) isMax = false;
      }
      if (isMin) piv.push({ i: vis[j].i, k, type: "buy" });
      else if (isMax) piv.push({ i: vis[j].i, k, type: "sell" });
    }
    // thin out so markers don't crowd; seed rotates the selection per strategy
    const seed = curStrategy.seed || 1;
    const picked = [];
    let last = -999;
    piv.forEach((pv, idx) => {
      if (pv.i - last < 5) return;
      if ((idx + seed) % 2 === 0 || picked.length < 2) { picked.push(pv); last = pv.i; }
    });
    signals = picked.slice(0, 7);
  }

  function renderSignals() {
    ovMarkers.innerHTML = "";
    ovAnnots.innerHTML = "";
    signals.forEach((sg, idx) => {
      const price = sg.type === "buy" ? sg.k.l : sg.k.h;
      const pt = project(sg.i, price);
      if (!pt) return;
      const m = el("div", "marker " + sg.type);
      const off = sg.type === "buy" ? 16 : -16;
      m.style.left = pt.x + "px";
      m.style.top = (pt.y + off) + "px";
      m.innerHTML = '<span class="glyph">' + (sg.type === "buy" ? "▲" : "▼") + "</span>" +
                    '<span class="px">' + (sg.type === "buy" ? "B " : "S ") + sg.k.c.toFixed(2) + "</span>";
      ovMarkers.appendChild(m);
    });
    // one or two annotations tied to the first buy / first sell
    const firstBuy = signals.find((s) => s.type === "buy");
    const firstSell = signals.find((s) => s.type === "sell");
    const ann = [];
    if (firstBuy) ann.push({ sg: firstBuy, txt: "Entry · " + (curStrategy.factors[0] || "signal") });
    if (firstSell) ann.push({ sg: firstSell, txt: "Exit · drift decay" });
    ann.forEach((a) => {
      const price = a.sg.type === "buy" ? a.sg.k.l : a.sg.k.h;
      const pt = project(a.sg.i, price);
      if (!pt) return;
      const n = el("div", "annot", esc(a.txt));
      n.style.left = pt.x + "px";
      n.style.top = (pt.y + (a.sg.type === "buy" ? 34 : -52)) + "px";
      ovAnnots.appendChild(n);
    });
    // footer signal summary
    const nb = signals.filter((s) => s.type === "buy").length;
    const ns = signals.filter((s) => s.type === "sell").length;
    const fs = $("#foot-signal");
    if (fs) fs.innerHTML = "Signal · " + esc(curStrategy.name) +
      ' · <span class="up">' + nb + " BUY</span> / <span class=\"down\">" + ns + " SELL</span> in view";
  }

  function renderLegend() {
    const labs = curStrategy.maLabels || ["MA20", "MA60"];
    ovLegend.innerHTML =
      '<span class="chip"><span class="sw" style="background:var(--up)"></span>' + esc(labs[0]) + "</span>" +
      '<span class="chip"><span class="sw" style="background:var(--ink-mute)"></span>' + esc(labs[1]) + "</span>" +
      '<span class="chip">' + esc(curStrategy.factors.length) + " factors</span>";
  }

  function renderAxis() {
    const st = state(); if (!st) return;
    const range = st.dispMax - st.dispMin; if (!(range > 0)) return;
    const step = niceStep(range, 5);
    const start = Math.ceil(st.dispMin / step) * step;
    let html = "";
    for (let pVal = start; pVal <= st.dispMax; pVal += step) {
      const pt = project(0, pVal); if (!pt) continue;
      if (pt.y < 4 || pt.y > window.__morph.panel.height - 4) continue;
      html += '<div class="ax" style="top:' + pt.y + 'px">' + pVal.toFixed(2) + "</div>";
    }
    ovAxis.innerHTML = html;
    // last-price tag
    const vis = visibleCandles();
    if (vis.length) {
      const lastK = vis[vis.length - 1].k;
      const pt = project(vis[vis.length - 1].i, lastK.c);
      if (pt) {
        const up = lastK.c >= lastK.o;
        ovLast.className = "ov-lasttag " + (up ? "up" : "down");
        ovLast.style.display = "block";
        ovLast.style.top = pt.y + "px";
        ovLast.textContent = lastK.c.toFixed(2);
      }
      // OHLC toolbar readout
      const r = $("#tb-ohlc");
      if (r) {
        const up = lastK.c >= lastK.o, cls = up ? "up" : "down";
        r.innerHTML =
          "O <b>" + lastK.o.toFixed(2) + "</b> H <b>" + lastK.h.toFixed(2) + "</b> " +
          "L <b>" + lastK.l.toFixed(2) + "</b> C <b class=\"" + cls + "\">" + lastK.c.toFixed(2) + "</b>";
      }
    }
  }
  function niceStep(range, target) {
    const raw = range / target, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  }

  function sizeVol() {
    const r = volCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    volCanvas.width = Math.round(r.width * dpr);
    volCanvas.height = Math.round(r.height * dpr);
    vctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function drawVolume() {
    const r = volCanvas.getBoundingClientRect();
    const m = window.__morph, st = state();
    vctx.clearRect(0, 0, r.width, r.height);
    if (!m || !st) return;
    const vis = visibleCandles();
    if (!vis.length) return;
    let maxV = 0; vis.forEach((c) => { if (c.k.v > maxV) maxV = c.k.v; });
    const bw = Math.max(1.2, st.slotW * m.s * 0.6);
    const H = r.height, baseY = H - 4;
    vis.forEach((c) => {
      const h = Math.max(1, (c.k.v / maxV) * (H - 14));
      const up = c.k.c >= c.k.o;
      vctx.fillStyle = up ? "rgba(95,126,168,0.55)" : "rgba(176,106,99,0.55)";
      vctx.fillRect(c.x - bw / 2, baseY - h, bw, h);
    });
  }

  // morph hook — called every frame by transition.js (eased progress)
  window.__onMorph = function (e) {
    const cl = (x) => Math.max(0, Math.min(1, x));
    // price axis + last tag ease in from mid-morph
    const axisOp = cl((e - 0.5) / 0.22);
    ovAxis.style.opacity = axisOp;
    ovLast.style.opacity = axisOp;
    if (axisOp > 0) renderAxis();

    // analytic overlay (signals / volume / legend) eases in near the settle
    const aOp = cl((e - 0.8) / 0.16);
    ovWrap.style.opacity = aOp;
    if (aOp > 0) { computeSignals(); renderSignals(); renderLegend(); drawVolume(); }
  };

  window.__terminalEnter = function () {
    sizeVol();
    computeSignals(); renderSignals(); renderLegend(); renderAxis(); drawVolume();
  };

  // keep overlays glued + readouts feeling live while Screen 2 is active
  setInterval(() => {
    if (!document.body.classList.contains("s2-live")) return;
    renderAxis(); renderSignals(); drawVolume();
  }, 220);

  window.addEventListener("resize", () => { sizeVol(); if (document.body.classList.contains("s2-live")) window.__terminalEnter(); });

  // ── RIGHT: internships + modal ─────────────────────────────────────────────
  const internList = $("#intern-list");
  D.internships.forEach((it) => {
    const b = el("button", "intern");
    b.dataset.id = it.id;
    b.innerHTML =
      '<div class="intern-top"><span class="co">' + esc(it.company) + '</span><span class="open">↗</span></div>' +
      '<div class="role">' + esc(it.role) + "</div>" +
      '<div class="meta-l"><span>' + esc(it.period) + "</span><span>" + esc(it.location) + "</span><span>" + esc(it.team) + "</span></div>" +
      '<span class="sector">' + esc(it.sector) + "</span>";
    b.addEventListener("click", () => openModal(it.id));
    internList.appendChild(b);
  });

  const overlay = $("#modal-overlay");
  const modalScroll = $("#modal-scroll");

  function openModal(id) {
    const it = D.internships.find((x) => x.id === id);
    if (!it) return;
    [...internList.children].forEach((c) => c.classList.toggle("sel", c.dataset.id === id));
    modalScroll.innerHTML = buildModal(it);
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    modalScroll.scrollTop = 0;
  }
  function closeModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    [...internList.children].forEach((c) => c.classList.remove("sel"));
  }

  function buildModal(it) {
    const facts = [
      ["Role", it.role], ["Period", it.period], ["Location", it.location], ["Team", it.team], ["Sector", it.sector],
    ];
    const list = (arr) => '<ul class="m-list">' + arr.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>";
    const chips = (arr) => '<div class="m-chips">' + arr.map((x) => '<span class="m-chip">' + esc(x) + "</span>").join("") + "</div>";

    let perfBlock = "";
    if (it.perf && it.perf.length) {
      perfBlock =
        '<div class="m-block full"><div class="b-label">Snapshot · illustrative</div>' +
        '<div class="m-perf">' + it.perf.map((p) =>
          '<div class="mp"><div class="v">' + esc(p.v) + '</div><div class="l">' + esc(p.l) + "</div></div>").join("") +
        "</div></div>";
    }

    const quantTag = it.quant
      ? '<span class="m-tag" style="margin-top:14px">Quant · Markets</span>'
      : '<span class="m-tag" style="margin-top:14px">' + esc(it.sector) + "</span>";

    return (
      '<div class="m-head">' +
        '<div><div class="m-co">' + esc(it.company) + "</div>" +
          '<div class="m-role">' + esc(it.role) + "</div>" + quantTag + "</div>" +
        '<div class="m-facts">' + facts.map((f) =>
          '<div class="m-fact"><span class="fl">' + esc(f[0]) + "</span>&nbsp;&nbsp;" + esc(f[1]) + "</div>").join("") +
        "</div>" +
      "</div>" +
      '<p class="m-summary">' + esc(it.firm) + " " + esc(it.roleSummary) + "</p>" +
      '<div class="m-grid">' +
        '<div class="m-block"><div class="b-label">What I did</div>' + list(it.did) + "</div>" +
        '<div class="m-block"><div class="b-label">Tools &amp; platforms</div>' + chips(it.tools) +
          '<div class="b-label" style="margin-top:22px">Representative work</div>' +
          '<p class="m-summary" style="font-size:13.5px;margin:0">' + esc(it.representative) + "</p></div>" +
        '<div class="m-block full"><div class="b-label">Key outputs</div>' + list(it.outputs) + "</div>" +
        perfBlock +
      "</div>"
    );
  }

  $("#modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // ── init ───────────────────────────────────────────────────────────────────
  const sc = $("#strat-count"); if (sc) sc.textContent = String(D.strategies.length).padStart(2, "0");
  const ic = $("#intern-count"); if (ic) ic.textContent = String(D.internships.length).padStart(2, "0");
  selectStrategy(curStrategy.id);
  renderDetail(); renderLegend();
})();
