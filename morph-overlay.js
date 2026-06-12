/* morph-overlay.js — the candle→coefficient metamorphosis.
   During the S2→S3 scroll, a set of frozen candlesticks is "lifted" off the
   chart onto this full-viewport canvas. Each one morphs into one event-study
   coefficient: wick stretches into a CI whisker (with end caps), body shrinks
   into the point estimate, color drifts from market red/blue to academic
   accent. Unselected candles scatter and fade. Start positions track the
   moving camera each frame, so lift-off is seamless; landing positions come
   from the live event-study geometry (window.__esGeom), so touchdown aligns
   pixel-perfectly with the SVG plot that takes over. Driven per-frame by
   transition.js via window.__onCandleMorph(q). */
(function () {
  "use strict";

  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:7;pointer-events:none;";
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");

  let W = 0, H = 0, dpr = 1;
  let snap = null; // { sel:[{cx,yH,yL,yO,yC,up}], rest:[...] } — declared before resize()
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    snap = null;
  }
  window.addEventListener("resize", resize);
  resize();

  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const win = (t, a, b) => easeIO(clamp01((t - a) / (b - a)));
  const L = (a, b, k) => a + (b - a) * k;
  const hx = (c) => { c = c.replace("#", ""); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; };
  const mix = (a, b, k) => "rgb(" + Math.round(L(a[0], b[0], k)) + "," + Math.round(L(a[1], b[1], k)) + "," + Math.round(L(a[2], b[2], k)) + ")";
  const ACCENT = hx("#2f5fa8"), WHITE = hx("#ffffff");

  function takeSnapshot() {
    const st = window.__hero && window.__hero.state && window.__hero.state();
    const m = window.__morph, es = window.__esGeom;
    if (!st || !m || !es || !es.pts.length) return null;
    const A = m.panel; // S2 chart host rect
    // analytic camera at q=0 (chart seated in the S2 panel) — robust even if the
    // snapshot is taken mid-flight after a programmatic scroll jump
    const s0 = Math.max(A.width / m.vw, A.height / m.vh);
    const tx0 = A.left + A.width / 2 - (m.vw * s0) / 2;
    const xMinC = (A.left + 8 - tx0) / s0, xMaxC = (A.left + A.width - 56 - tx0) / s0;
    const range = (st.dispMax - st.dispMin) || 1;
    const yOf = (p) => st.top + (st.dispMax - p) / range * st.ch;
    const vis = [];
    for (let i = 0; i < st.candles.length; i++) {
      const cx = i * st.slotW - st.scroll;
      if (cx < xMinC || cx > xMaxC) continue;
      const k = st.candles[i];
      vis.push({ cx, yH: yOf(k.h), yL: yOf(k.l), yO: yOf(k.o), yC: yOf(k.c), up: k.c >= k.o });
    }
    if (vis.length < 4) return null;
    const n = Math.min(es.pts.length, vis.length);
    const selIdx = new Set();
    for (let j = 0; j < n; j++) selIdx.add(Math.round(j * (vis.length - 1) / (n - 1)));
    const sel = [], rest = [];
    vis.forEach((g, i) => { (selIdx.has(i) ? sel : rest).push(g); });
    return { sel, rest };
  }

  function colorsFor(up) {
    const cfg = window.HERO_CONFIG || {};
    return hx(up ? (cfg.upColor || "#5f7ea8") : (cfg.downColor || "#b06a63"));
  }

  window.__onCandleMorph = function (q) {
    if (q <= 0 || q >= 1) {
      if (q <= 0) snap = null;
      ctx.clearRect(0, 0, W, H);
      return;
    }
    if (!snap) snap = takeSnapshot();
    const m = window.__morph, es = window.__esGeom;
    ctx.clearRect(0, 0, W, H);
    if (!snap || !m || !es) return;

    const overlayA = 1 - win(q, 0.88, 0.985); // hand off to the SVG plot
    if (overlayA <= 0) return;
    ctx.globalAlpha = 1;

    // ── unselected candles: scatter softly and fade ───────────────────────────
    snap.rest.forEach((g, i) => {
      const k = win(q, 0.05 + (i % 7) * 0.01, 0.42 + (i % 7) * 0.01);
      if (k >= 1) return;
      const a = (1 - k) * 0.8 * overlayA;
      if (a <= 0.01) return;
      const x = m.tx + g.cx * m.s;
      const drift = 30 * k;
      const col = colorsFor(g.up);
      ctx.globalAlpha = a;
      ctx.strokeStyle = ctx.fillStyle = mix(col, col, 0);
      ctx.lineWidth = Math.max(0.8, 1.3 * m.s);
      ctx.beginPath();
      ctx.moveTo(x, m.ty + g.yH * m.s + drift);
      ctx.lineTo(x, m.ty + g.yL * m.s + drift);
      ctx.stroke();
      const bw = 7 * m.s;
      const yTop = m.ty + Math.min(g.yO, g.yC) * m.s + drift;
      const bh = Math.max(1.5, Math.abs(g.yO - g.yC) * m.s);
      ctx.fillRect(x - bw / 2, yTop, bw, bh);
    });

    // ── selected candles → event-study coefficients ───────────────────────────
    const n = Math.min(snap.sel.length, es.pts.length);
    for (let j = 0; j < n; j++) {
      const g = snap.sel[j], T = es.pts[j];
      const k = win(q, 0.06 + j * 0.011, 0.64 + j * 0.011);
      // live start (tracks the zooming camera) → fixed target (research plot)
      const sx = m.tx + g.cx * m.s;
      const txp = es.rect.left + T.x;
      const x = L(sx, txp, k);
      const yTop = L(m.ty + g.yH * m.s, es.rect.top + T.yHi, k);
      const yBot = L(m.ty + g.yL * m.s, es.rect.top + T.yLo, k);
      const col = mix(colorsFor(g.up), ACCENT, k);

      ctx.globalAlpha = 0.92 * overlayA;
      // wick → CI whisker
      ctx.strokeStyle = col;
      ctx.lineWidth = L(Math.max(0.9, 1.3 * m.s), 1.5, k);
      ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yBot); ctx.stroke();
      // end caps crystallize near landing
      const capA = win(k, 0.72, 1);
      if (capA > 0) {
        ctx.globalAlpha = 0.92 * overlayA * capA;
        ctx.beginPath();
        ctx.moveTo(x - 3.5, yTop); ctx.lineTo(x + 3.5, yTop);
        ctx.moveTo(x - 3.5, yBot); ctx.lineTo(x + 3.5, yBot);
        ctx.stroke();
      }
      // body → point estimate
      const cyS = (m.ty + g.yO * m.s + m.ty + g.yC * m.s) / 2;
      const cy = L(cyS, es.rect.top + T.yB, k);
      const w = L(7 * m.s, 6.8, k);
      const h = L(Math.max(1.5, Math.abs(g.yO - g.yC) * m.s), 6.8, k);
      const r = L(1, 3.4, k);
      ctx.globalAlpha = 0.95 * overlayA;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - w / 2, cy - h / 2, w, h, Math.min(r, w / 2, h / 2));
      else ctx.rect(x - w / 2, cy - h / 2, w, h);
      if (T.pre) {
        // pre-period coefficients land hollow
        ctx.fillStyle = mix(colorsFor(g.up), WHITE, k);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = col;
        ctx.stroke();
      } else {
        ctx.fillStyle = col;
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };
})();
