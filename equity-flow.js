/* equity-flow.js — Block 03 (Yinhua Fund · Quantitative Equity Research) visualization.

   A PERSISTENT research engine, not a staged workflow. The three parts coexist on
   screen at all times and update continuously, the way the hero candlesticks roll
   and the due-diligence radar sweeps, with no obvious start or end frame:

     left   — a small set of legible factor chips, each with a live strength bar;
              emphasis shifts as the strongest factor changes over time
     centre — a live ranked signal board that gently reorders as scores drift
     right  — a sector allocation that softly rebalances in response

   Everything is driven by slow continuous noise (sums of sines), so nothing ever
   resets. Ink + magenta editorial language, matching dd-graph.js. DPR-aware, refits
   via ResizeObserver, animates only while in view, static frame under reduced motion.
   The SAME element is borrowed and flown into the case study (morph: "el"). */
(function () {
  "use strict";

  const host = document.getElementById("equity-flow");
  if (!host) return;
  const canvas = host.querySelector(".ef-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const C = {
    ink: "#14181f",
    body: "#3c4654",
    mute: "#8a909b",
    mag: "#d6006c",
    line: "rgba(20,24,31,0.07)",
    chipBg: "rgba(20,24,31,0.035)",
    chipBd: "rgba(20,24,31,0.12)",
    track: "rgba(20,24,31,0.07)",
  };

  const FACTORS = ["Value", "Quality", "Momentum", "Low Volatility", "Growth"];
  const CODES = ["AH-014", "AH-227", "AH-061", "AH-330", "AH-178", "AH-092", "AH-405"];
  const SECTORS = ["Info Tech", "Industrials", "Materials", "Financials"];
  const NF = FACTORS.length, NR = CODES.length, NS = SECTORS.length;
  const SELN = 3; // top-ranked names highlighted as held

  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1, raf = 0, startedVisible = false, lay = null, forcedT = null, paused = false;

  // persistent animated state (eased toward continuously drifting targets)
  const fStr = new Array(NF).fill(0.5);   // factor strengths
  const rScore = new Array(NR).fill(0.5); // signal scores
  const rY = new Array(NR).fill(0);       // animated row y (for smooth reordering)
  const sW = new Array(NS).fill(1 / NS);  // sector weights
  let inited = false;

  function n01(seed, t, s1, s2) {
    return 0.5 + 0.5 * (0.62 * Math.sin(t * s1 + seed) + 0.38 * Math.sin(t * s2 + seed * 1.7));
  }
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  function lerp(a, b, t) { return a + (b - a) * t; }

  function resize() {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    computeLayout();
  }

  function computeLayout() {
    const pad = Math.max(14, Math.min(W, H) * 0.05);
    const headH = 22;
    const top = pad + headH;
    const bottom = H - pad - 16;            // leave room for the "Illustrative" tag
    const innerW = W - pad * 2;
    // three columns: factors | ranking | allocation
    const colGap = innerW * 0.05;
    const wL = innerW * 0.27, wC = innerW * 0.40, wR = innerW - wL - wC - colGap * 2;
    const xL = pad, xC = pad + wL + colGap, xR = pad + wL + wC + colGap * 2;
    lay = { pad, top, bottom, headH, innerW, wL, wC, wR, xL, xC, xR,
      fH: (bottom - top) / NF, rH: (bottom - top) / NR, sH: (bottom - top) / NS };
  }

  function initState(T) {
    for (let i = 0; i < NF; i++) fStr[i] = n01(i * 1.3, T, 0.21, 0.37);
    for (let i = 0; i < NR; i++) rScore[i] = n01(i * 2.1 + 5, T, 0.17, 0.29);
    let s = 0; const raw = [];
    for (let i = 0; i < NS; i++) { const v = Math.pow(n01(i * 1.7 + 9, T, 0.15, 0.25), 1.6); raw.push(v); s += v; }
    for (let i = 0; i < NS; i++) sW[i] = raw[i] / s;
    // seed row order
    const ord = rScore.map((v, i) => i).sort((a, b) => rScore[b] - rScore[a]);
    ord.forEach((i, slot) => (rY[i] = slot));
    inited = true;
  }

  function roundRect(x, y, w, h, rad) {
    const r = Math.max(0, Math.min(rad, h / 2, w / 2));
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function setFont(weight, size, family) { ctx.font = weight + " " + size + "px " + (family || "Archivo, system-ui, sans-serif"); }
  function withLS(v, fn) { let had = false, prev; try { prev = ctx.letterSpacing; ctx.letterSpacing = v; had = true; } catch (e) {} fn(); if (had) { try { ctx.letterSpacing = prev; } catch (e) {} } }
  function head(text, x, w, on) {
    setFont("400", 10, "'Times New Roman', Georgia, serif");
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = on ? C.mag : "rgba(138,144,155,0.9)";
    withLS("1.3px", () => ctx.fillText(text.toUpperCase(), x, lay.pad + 10));
  }

  function draw(now) {
    if (!lay) computeLayout();
    if (!lay) return;
    const T = (forcedT != null ? forcedT : now) * 0.001;
    if (!inited) initState(T);
    const ease = REDUCED ? 1 : 0.06;
    ctx.clearRect(0, 0, W, H);

    // ── targets (continuous drift) ──
    for (let i = 0; i < NF; i++) fStr[i] = lerp(fStr[i], n01(i * 1.3, T, 0.21, 0.37), ease);
    for (let i = 0; i < NR; i++) rScore[i] = lerp(rScore[i], n01(i * 2.1 + 5, T, 0.17, 0.29), ease);
    let s = 0; const raw = [];
    for (let i = 0; i < NS; i++) { const v = Math.pow(n01(i * 1.7 + 9, T, 0.15, 0.25), 1.6); raw.push(v); s += v; }
    for (let i = 0; i < NS; i++) sW[i] = lerp(sW[i], raw[i] / s, ease);

    // ranking: animate each row toward its current rank slot
    const order = rScore.map((v, i) => i).sort((a, b) => rScore[b] - rScore[a]);
    const slotOf = {}; order.forEach((i, slot) => (slotOf[i] = slot));
    for (let i = 0; i < NR; i++) rY[i] = lerp(rY[i], slotOf[i], REDUCED ? 1 : 0.09);
    const held = {}; order.slice(0, SELN).forEach((i) => (held[i] = true));
    const strongF = fStr.indexOf(Math.max.apply(null, fStr));

    // faint column seams
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lay.xC - lay.innerW * 0.025, lay.top - 6); ctx.lineTo(lay.xC - lay.innerW * 0.025, lay.bottom); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lay.xR - lay.innerW * 0.025, lay.top - 6); ctx.lineTo(lay.xR - lay.innerW * 0.025, lay.bottom); ctx.stroke();

    // ── headers ──
    head("Factors", lay.xL, lay.wL, false);
    head("Live Ranking", lay.xC, lay.wC, false);
    head("Allocation", lay.xR, lay.wR, false);

    // ── LEFT: factor chips with live strength bars ──
    const chipH = Math.min(lay.fH * 0.74, 40);
    for (let i = 0; i < NF; i++) {
      const cy = lay.top + lay.fH * i + (lay.fH - chipH) / 2;
      const on = i === strongF;
      ctx.fillStyle = on ? "rgba(214,0,108,0.05)" : C.chipBg;
      roundRect(lay.xL, cy, lay.wL, chipH, 8); ctx.fill();
      ctx.strokeStyle = on ? "rgba(214,0,108,0.45)" : C.chipBd; ctx.lineWidth = 1.2;
      roundRect(lay.xL, cy, lay.wL, chipH, 8); ctx.stroke();
      // name
      setFont(on ? "700" : "600", 12, "Archivo, system-ui, sans-serif");
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = on ? C.ink : C.body;
      ctx.fillText(FACTORS[i], lay.xL + 11, cy + chipH * 0.38);
      // strength bar
      const bx = lay.xL + 11, bw = lay.wL - 22, by = cy + chipH - 9;
      ctx.fillStyle = C.track; roundRect(bx, by, bw, 3, 1.5); ctx.fill();
      ctx.fillStyle = on ? C.mag : "rgba(20,24,31,0.4)";
      roundRect(bx, by, Math.max(3, bw * fStr[i]), 3, 1.5); ctx.fill();
    }

    // ── CENTRE: live ranked signal board ──
    const rowH = Math.min(lay.rH * 0.8, 30);
    const maxScore = Math.max.apply(null, rScore) || 1;
    for (let i = 0; i < NR; i++) {
      const cy = lay.top + rY[i] * lay.rH + (lay.rH - rowH) / 2;
      const slot = slotOf[i];
      const on = !!held[i];
      // rank index
      setFont("700", 10, "'Times New Roman', Georgia, serif");
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = on ? C.mag : "rgba(138,144,155,0.85)";
      ctx.fillText(String(slot + 1).padStart(2, "0"), lay.xC, cy + rowH / 2);
      // code
      setFont(on ? "700" : "500", 11, "Archivo, system-ui, sans-serif");
      ctx.fillStyle = on ? C.ink : C.body;
      ctx.fillText(CODES[i], lay.xC + 22, cy + rowH / 2);
      // score bar
      const bx = lay.xC + 70, bw = (lay.xC + lay.wC) - bx, by = cy + rowH / 2 - 3;
      ctx.fillStyle = C.track; roundRect(bx, by, bw, 6, 3); ctx.fill();
      ctx.fillStyle = on ? "rgba(214,0,108,0.6)" : "rgba(20,24,31,0.28)";
      roundRect(bx, by, Math.max(4, bw * (rScore[i] / maxScore)), 6, 3); ctx.fill();
    }

    // ── RIGHT: sector allocation, softly rebalancing ──
    const barH = Math.min(lay.sH * 0.5, 22);
    const maxW = Math.max.apply(null, sW) || 1;
    for (let i = 0; i < NS; i++) {
      const cy = lay.top + lay.sH * i + lay.sH * 0.5;
      setFont("600", 11.5, "Archivo, system-ui, sans-serif");
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillStyle = C.body;
      ctx.fillText(SECTORS[i], lay.xR, cy - barH * 0.65);
      const pct = Math.round(sW[i] * 100) + "%";
      ctx.textAlign = "right"; ctx.fillStyle = C.ink; setFont("700", 11.5, "Archivo, system-ui, sans-serif");
      ctx.fillText(pct, lay.xR + lay.wR, cy - barH * 0.65);
      // bar
      const by = cy - barH * 0.32;
      ctx.fillStyle = C.track; roundRect(lay.xR, by, lay.wR, barH, 5); ctx.fill();
      const grad = ctx.createLinearGradient(lay.xR, 0, lay.xR + lay.wR, 0);
      grad.addColorStop(0, "rgba(214,0,108,0.5)"); grad.addColorStop(1, "rgba(214,0,108,0.32)");
      ctx.fillStyle = grad;
      roundRect(lay.xR, by, Math.max(6, lay.wR * (sW[i] / maxW)), barH, 5); ctx.fill();
    }

    // illustrative tag
    ctx.save();
    ctx.font = "italic 10px 'Source Serif 4', Georgia, serif";
    ctx.textAlign = "right"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "rgba(138,144,155,0.7)";
    ctx.fillText("Illustrative", W - lay.pad, H - 10);
    ctx.restore();
  }

  function visible() {
    const r = host.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.width > 0 && r.bottom > vh * 0.1 && r.top < vh * 0.9;
  }
  function loop(now) {
    if (paused) { raf = 0; return; }
    if (!startedVisible) { if (visible()) startedVisible = true; }
    if (startedVisible) draw(now);
    raf = requestAnimationFrame(loop);
  }

  resize();
  initState(performance.now() * 0.001);
  draw(performance.now());           // immediate correct frame (never blank)

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => { resize(); draw(performance.now()); });
    ro.observe(host);
  }
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { resize(); draw(performance.now()); }, 120); });

  if (REDUCED) { draw(performance.now()); }
  else raf = requestAnimationFrame(loop);

  window.__equityFlow = {
    resize: resize,
    force: function (sec) { forcedT = (sec || 0) * 1000; draw(performance.now()); forcedT = null; },
    pause: function () { paused = true; if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    resume: function () { if (!paused && raf) return; paused = false; if (!REDUCED && !raf) raf = requestAnimationFrame(loop); },
  };
})();
