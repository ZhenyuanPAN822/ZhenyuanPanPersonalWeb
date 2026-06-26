/* workbook.js — Block 04 (Sinosafe General Insurance · Fundamental Equity Research) visualization.

   A stylized, always-in-use fundamental-investing WORKBOOK (not a real Excel
   screenshot, not a finance dashboard). Three zones coexist permanently and the
   sheet is continuously, subtly active, the way the K-line rolls and the radar
   sweeps, no staged input -> output -> reset:

     upper-left  — a compact DCF / valuation block (one input drifts, implied value follows)
     upper-right — a prominent merged "thesis status" cell that softly shifts emphasis
     lower       — a small company-monitoring table, one row briefly highlighted

   A selected cell wanders slowly between the three zones; the formula bar updates
   to match; sheet tabs occasionally change focus and return. Ink + magenta site
   language with a restrained workbook-green accent. DPR-aware, refits via
   ResizeObserver, animates only while in view, static frame under reduced motion.
   Structured so the DCF block, thesis cell, monitoring table and tabs can later
   expand into the case study. */
(function () {
  "use strict";

  const host = document.getElementById("workbook");
  if (!host) return;
  const canvas = host.querySelector(".wb-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const C = {
    ink: "#14181f",
    body: "#3c4654",
    mute: "#8a909b",
    mag: "#d6006c",
    green: "#2f8f6b",
    greenSoft: "rgba(47,143,107,0.10)",
    grid: "rgba(20,24,31,0.07)",
    rowAlt: "rgba(20,24,31,0.022)",
    head: "rgba(47,143,107,0.09)",
  };

  const DCF = [
    { k: "Revenue Growth", v: 8.4, suf: "%", drift: 1.1 },
    { k: "Margin", v: 21.6, suf: "%", drift: 0.6 },
    { k: "WACC", v: 9.2, suf: "%", drift: 0.4 },
    { k: "Terminal Growth", v: 2.5, suf: "%", drift: 0.2 },
  ];
  const THESIS = ["THESIS INTACT", "WATCH", "THESIS STRENGTHENING", "VALUATION RESET"];
  const THESIS_SUB = ["earnings on track", "monitoring closely", "estimates rising", "re-rating priced in"];
  const MON_COLS = ["Company", "Earnings", "Drivers", "Valuation", "Thesis"];
  const MON_ROWS = [
    ["Consumer", "Beat", "Volume", "Fair", "Intact"],
    ["Property", "Soft", "Policy", "Cheap", "Watch"],
    ["Financials", "In-line", "Spread", "Fair", "Intact"],
    ["Internet", "Beat", "Margin", "Rich", "Strong"],
  ];
  const TABS = ["Valuation", "Thesis", "Monitor"];

  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1, raf = 0, startedVisible = false, lay = null, forcedT = null, paused = false;

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
    const pad = Math.max(12, Math.min(W, H) * 0.045);
    const titleH = Math.max(18, H * 0.07);
    const fxH = Math.max(20, H * 0.082);
    const tabsH = Math.max(18, H * 0.075);
    const colH = Math.max(14, H * 0.052);
    const gx = pad, gy = pad + titleH + fxH + 6 + colH;
    const gw = W - pad * 2;
    const gh = (H - pad - tabsH - 6) - gy;
    const rowNumW = Math.max(16, gw * 0.045);
    const innerX = gx + rowNumW, innerW = gw - rowNumW;
    const upperH = gh * 0.48, gapH = gh * 0.06, lowerY = gy + upperH + gapH, lowerH = gh - upperH - gapH;
    lay = { pad, titleH, fxH, tabsH, colH, gx, gy, gw, gh, rowNumW, innerX, innerW, upperH, gapH, lowerY, lowerH,
      ncols: 8, colW: innerW / 8,
      // zones
      dcfX: innerX, dcfW: innerW * 0.52,
      thX: innerX + innerW * 0.56, thW: innerW * 0.44,
    };
  }

  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function n01(seed, t, s1, s2) { return 0.5 + 0.5 * (0.6 * Math.sin(t * s1 + seed) + 0.4 * Math.sin(t * s2 + seed * 1.7)); }
  function roundRect(x, y, w, h, rad) {
    const r = Math.max(0, Math.min(rad, h / 2, w / 2));
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function setFont(weight, size, family) { ctx.font = weight + " " + size + "px " + (family || "Archivo, system-ui, sans-serif"); }
  function withLS(v, fn) { let had = false, prev; try { prev = ctx.letterSpacing; ctx.letterSpacing = v; had = true; } catch (e) {} fn(); if (had) { try { ctx.letterSpacing = prev; } catch (e) {} } }
  function ellipsize(text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "\u2026").width > maxW) t = t.slice(0, -1);
    return t + "\u2026";
  }

  function draw(now) {
    if (!lay) computeLayout();
    if (!lay) return;
    const T = (forcedT != null ? forcedT : now) * 0.001;
    ctx.clearRect(0, 0, W, H);

    // ── live values ──
    const dcfVals = DCF.map((d, i) => d.v + Math.sin(T * (0.18 + i * 0.05) + i) * d.drift);
    const rev = dcfVals[0], mgn = dcfVals[1], wacc = dcfVals[2], tg = dcfVals[3];
    const implied = 100 * (1 + (rev / 100) * 0.9) * (mgn / 21) * ((9.2 - wacc) * 0.06 + 1) * ((tg) / 2.5 * 0.04 + 1);
    const dcfDriftIdx = 0; // revenue growth is the visibly drifting input

    // selected-cell wander between anchors (slow, continuous)
    const anchors = selAnchors();
    const segLen = 3.4; // seconds per move
    const phase = (T / segLen);
    const ai = Math.floor(phase) % anchors.length;
    const aj = (ai + 1) % anchors.length;
    const f = easeIO(clamp01((phase - Math.floor(phase)) / 0.55)); // move during first 55%, dwell after
    const A = anchors[ai], B = anchors[aj];
    const sel = { x: A.x + (B.x - A.x) * f, y: A.y + (B.y - A.y) * f, w: A.w + (B.w - A.w) * f, h: A.h + (B.h - A.h) * f, label: f < 0.5 ? A.label : B.label, formula: f < 0.5 ? A.formula : B.formula };

    const monHot = Math.floor(T / 2.7) % MON_ROWS.length;
    const tabActive = Math.floor(T / 5.5) % TABS.length;
    const thesisIdx = Math.floor(T / 7) % THESIS.length;
    const thesisEmph = 0.78 + 0.22 * (0.5 + 0.5 * Math.sin(T * 0.9));

    drawChrome(T, sel, tabActive);
    drawGrid();
    drawDCF(dcfVals, implied, dcfDriftIdx, T);
    drawThesis(thesisIdx, thesisEmph);
    drawMonitor(monHot);
    drawSelection(sel);

    // illustrative tag
    ctx.save();
    ctx.font = "italic 9.5px 'Source Serif 4', Georgia, serif";
    ctx.textAlign = "right"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "rgba(138,144,155,0.7)";
    ctx.fillText("Illustrative", W - lay.pad, H - 6);
    ctx.restore();
  }

  function selAnchors() {
    // a value cell in the DCF block, the thesis cell, and a monitoring cell
    const dcfRowH = lay.upperH / (DCF.length + 1);
    const vX = lay.dcfX + lay.dcfW * 0.62, vW = lay.dcfW * 0.38;
    const colW = lay.innerW / MON_COLS.length;
    const monRowH = (lay.lowerH) / (MON_ROWS.length + 1);
    return [
      { x: vX, y: lay.gy + dcfRowH * 1, w: vW, h: dcfRowH * 0.92, label: "C3", formula: "=Growth \u00d7 Margin \u00f7 (WACC \u2212 g)" },
      { x: lay.thX, y: lay.gy, w: lay.thW, h: lay.upperH * 0.66, label: "F2", formula: "=IF(\u0394Estimates>0, \"INTACT\", \"WATCH\")" },
      { x: lay.innerX + colW * 3, y: lay.lowerY + monRowH * 2, w: colW, h: monRowH * 0.92, label: "D9", formula: "=Valuation vs. Fair Range" },
      { x: lay.dcfX + lay.dcfW * 0.62, y: lay.gy + dcfRowH * 4, w: lay.dcfW * 0.38, h: dcfRowH * 0.92, label: "C6", formula: "=Implied Value per Share" },
    ];
  }

  function drawChrome(T, sel, tabActive) {
    // title strip
    ctx.fillStyle = C.green;
    ctx.beginPath(); ctx.arc(lay.pad + 5, lay.pad + lay.titleH * 0.42, 4, 0, Math.PI * 2); ctx.fill();
    setFont("700", Math.max(11, H * 0.035), "Archivo, system-ui, sans-serif");
    ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = C.ink;
    ctx.fillText("Coverage Workbook", lay.pad + 15, lay.pad + lay.titleH * 0.42);
    setFont("500", Math.max(9.5, H * 0.028), "Archivo, system-ui, sans-serif");
    ctx.textAlign = "right"; ctx.fillStyle = C.mute;
    ctx.fillText(".xlsx", W - lay.pad, lay.pad + lay.titleH * 0.42);

    // formula bar
    const fy = lay.pad + lay.titleH, fh = lay.fxH - 6;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    // name box
    const nbW = Math.max(34, lay.gw * 0.1);
    roundRect(lay.pad, fy, nbW, fh, 4); ctx.fill(); ctx.stroke();
    setFont("700", Math.max(9.5, H * 0.03)); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = C.body;
    ctx.fillText(sel.label, lay.pad + nbW / 2, fy + fh / 2);
    // fx + formula
    const fbX = lay.pad + nbW + 6;
    roundRect(fbX, fy, W - lay.pad - fbX, fh, 4); ctx.fill(); ctx.stroke();
    ctx.textAlign = "left"; ctx.fillStyle = C.green; setFont("700", Math.max(9.5, H * 0.03), "'Times New Roman', Georgia, serif");
    ctx.fillText("fx", fbX + 8, fy + fh / 2);
    setFont("500", Math.max(10, H * 0.031), "Archivo, system-ui, sans-serif"); ctx.fillStyle = C.body;
    ctx.fillText(ellipsize(sel.formula, W - lay.pad - (fbX + 26)), fbX + 26, fy + fh / 2 + 0.5);

    // sheet tabs
    const ty = H - lay.pad - lay.tabsH + 4;
    let tx = lay.pad;
    setFont("600", Math.max(9.5, H * 0.03), "Archivo, system-ui, sans-serif");
    TABS.forEach((t, i) => {
      const tw = ctx.measureText(t).width + 20;
      const active = i === tabActive;
      ctx.fillStyle = active ? "#fff" : "transparent";
      if (active) { ctx.strokeStyle = C.grid; roundRect(tx, ty, tw, lay.tabsH - 4, 4); ctx.fill(); ctx.stroke(); }
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = active ? C.green : C.mute;
      ctx.fillText(t, tx + tw / 2, ty + (lay.tabsH - 4) / 2);
      if (active) { ctx.fillStyle = C.green; ctx.fillRect(tx + 6, ty + lay.tabsH - 5, tw - 12, 2); }
      tx += tw + 6;
    });
  }

  function drawGrid() {
    const { gx, gy, gw, gh, innerX, innerW, ncols, colH } = lay;
    // column header band
    ctx.fillStyle = C.head;
    ctx.fillRect(gx, gy - colH, gw, colH);
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    // column letters
    setFont("600", Math.max(8.5, H * 0.026), "Archivo, system-ui, sans-serif");
    ctx.fillStyle = C.green; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let c = 0; c < ncols; c++) {
      const cx = innerX + (c + 0.5) * (innerW / ncols);
      ctx.fillText(String.fromCharCode(65 + c), cx, gy - colH / 2);
    }
    // row-number gutter
    ctx.fillStyle = C.head;
    ctx.fillRect(gx, gy, lay.rowNumW, gh);
    // faint grid lines
    ctx.strokeStyle = C.grid;
    ctx.beginPath();
    for (let c = 0; c <= ncols; c++) { const x = innerX + c * (innerW / ncols); ctx.moveTo(x, gy); ctx.lineTo(x, gy + gh); }
    const rows = 10;
    for (let r = 0; r <= rows; r++) { const y = gy + r * (gh / rows); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); }
    ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh);
    ctx.stroke();
    // row numbers
    setFont("500", Math.max(8, H * 0.024), "Archivo, system-ui, sans-serif");
    ctx.fillStyle = C.mute; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let r = 0; r < rows; r++) { const y = gy + (r + 0.5) * (gh / rows); ctx.fillText(String(r + 1), gx + lay.rowNumW / 2, y); }
  }

  function drawDCF(vals, implied, driftIdx, T) {
    const x = lay.dcfX + 8, w = lay.dcfW - 12;
    const rowH = lay.upperH / (DCF.length + 2);
    setFont("700", Math.max(9, H * 0.027), "Archivo, system-ui, sans-serif");
    ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = C.green;
    withLS("0.06em", () => ctx.fillText("DCF VALUATION", x, lay.gy + rowH * 0.45));
    for (let i = 0; i < DCF.length; i++) {
      const cy = lay.gy + rowH * (i + 1);
      setFont("500", Math.max(10, H * 0.031), "Archivo, system-ui, sans-serif");
      ctx.fillStyle = C.body; ctx.textAlign = "left";
      ctx.fillText(DCF[i].k, x, cy + rowH / 2);
      const drifting = i === driftIdx;
      setFont(drifting ? "800" : "700", Math.max(10.5, H * 0.033), "Archivo, system-ui, sans-serif");
      ctx.fillStyle = drifting ? C.mag : C.ink; ctx.textAlign = "right";
      ctx.fillText(vals[i].toFixed(1) + DCF[i].suf, lay.dcfX + lay.dcfW - 6, cy + rowH / 2);
    }
    // implied value row (emphasized)
    const iy = lay.gy + rowH * (DCF.length + 1);
    ctx.strokeStyle = "rgba(47,143,107,0.4)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, iy + 2); ctx.lineTo(lay.dcfX + lay.dcfW - 6, iy + 2); ctx.stroke();
    setFont("700", Math.max(10, H * 0.03), "Archivo, system-ui, sans-serif");
    ctx.fillStyle = C.green; ctx.textAlign = "left"; ctx.fillText("Implied Value", x, iy + rowH * 0.6);
    setFont("800", Math.max(12, H * 0.04), "Archivo, system-ui, sans-serif");
    ctx.fillStyle = C.ink; ctx.textAlign = "right";
    ctx.fillText(implied.toFixed(1), lay.dcfX + lay.dcfW - 6, iy + rowH * 0.6);
  }

  function drawThesis(idx, emph) {
    const x = lay.thX, y = lay.gy + 2, w = lay.thW, h = lay.upperH * 0.92;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(47,143,107,0.07)";
    roundRect(x, y, w, h, 7); ctx.fill();
    ctx.strokeStyle = "rgba(47,143,107,0.3)"; ctx.lineWidth = 1.2;
    roundRect(x, y, w, h, 7); ctx.stroke();
    setFont("700", Math.max(8.5, H * 0.026), "Archivo, system-ui, sans-serif");
    ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillStyle = C.mute;
    withLS("0.08em", () => ctx.fillText("THESIS STATUS", x + 12, y + 11));
    // status text (wraps to 2 lines if needed)
    ctx.globalAlpha = emph;
    ctx.fillStyle = C.green; ctx.textBaseline = "middle";
    const words = THESIS[idx].split(" ");
    const fs = Math.max(14, H * 0.052);
    setFont("800", fs, "Archivo, system-ui, sans-serif");
    if (words.length > 1 && ctx.measureText(THESIS[idx]).width > w - 24) {
      ctx.fillText(words[0], x + 12, y + h * 0.46 - fs * 0.55);
      ctx.fillText(words.slice(1).join(" "), x + 12, y + h * 0.46 + fs * 0.55);
    } else {
      ctx.fillText(THESIS[idx], x + 12, y + h * 0.46);
    }
    ctx.globalAlpha = 1;
    setFont("500", Math.max(9.5, H * 0.029), "Archivo, system-ui, sans-serif");
    ctx.fillStyle = C.body; ctx.textBaseline = "bottom";
    ctx.fillText(THESIS_SUB[idx], x + 12, y + h - 11);
  }

  function drawMonitor(hot) {
    const x = lay.innerX, y = lay.lowerY, w = lay.innerW;
    const colW = w / MON_COLS.length;
    const rowH = lay.lowerH / (MON_ROWS.length + 1);
    // header
    ctx.fillStyle = C.head; ctx.fillRect(x, y, w, rowH);
    setFont("700", Math.max(8.5, H * 0.026), "Archivo, system-ui, sans-serif");
    ctx.textBaseline = "middle"; ctx.fillStyle = C.green;
    MON_COLS.forEach((c, i) => {
      ctx.textAlign = i === 0 ? "left" : "center";
      const cx = i === 0 ? x + 8 : x + (i + 0.5) * colW;
      ctx.fillText(c, cx, y + rowH / 2);
    });
    // rows
    for (let r = 0; r < MON_ROWS.length; r++) {
      const ry = y + rowH * (r + 1);
      if (r === hot) { ctx.fillStyle = "rgba(214,0,108,0.06)"; ctx.fillRect(x, ry, w, rowH); }
      else if (r % 2) { ctx.fillStyle = C.rowAlt; ctx.fillRect(x, ry, w, rowH); }
      MON_ROWS[r].forEach((cell, i) => {
        const cx = i === 0 ? x + 8 : x + (i + 0.5) * colW;
        ctx.textAlign = i === 0 ? "left" : "center";
        setFont(i === 0 ? "700" : "500", Math.max(9, H * 0.028), "Archivo, system-ui, sans-serif");
        ctx.fillStyle = i === 0 ? C.ink : (r === hot ? C.mag : C.body);
        ctx.fillText(cell, cx, ry + rowH / 2);
      });
    }
    // header underline
    ctx.strokeStyle = "rgba(47,143,107,0.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y + rowH); ctx.lineTo(x + w, y + rowH); ctx.stroke();
  }

  function drawSelection(sel) {
    ctx.strokeStyle = C.mag; ctx.lineWidth = 1.6;
    roundRect(sel.x, sel.y, sel.w, sel.h, 3); ctx.stroke();
    // fill handle
    ctx.fillStyle = C.mag;
    ctx.fillRect(sel.x + sel.w - 2.5, sel.y + sel.h - 2.5, 4, 4);
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
  draw(performance.now());

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => { resize(); draw(performance.now()); });
    ro.observe(host);
  }
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { resize(); draw(performance.now()); }, 120); });

  if (REDUCED) draw(performance.now());
  else raf = requestAnimationFrame(loop);

  window.__workbook = {
    resize: resize,
    force: function (sec) { forcedT = (sec || 0) * 1000; draw(performance.now()); forcedT = null; },
    pause: function () { paused = true; if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    resume: function () { if (paused) { paused = false; if (!REDUCED && !raf) raf = requestAnimationFrame(loop); } },
  };
})();
