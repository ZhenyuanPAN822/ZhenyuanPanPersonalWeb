/* ============================================================================
   hero-chart.js — institutional candlestick background engine
   - realistic OHLC via damped momentum random-walk (looks like a real market)
   - continuous right -> left scroll; new candles form on the right
   - old candles fade out on the left, new ones fade in on the right
   - smooth vertical auto-scale (the frame breathes like a live terminal)
   - low-opacity muted blue (up) / muted red (down) over a light grid
   Reads live settings from window.HERO_CONFIG so the Tweaks panel can drive it.
   ============================================================================ */
(function () {
  "use strict";

  const DEFAULTS = {
    speed: 24,            // horizontal scroll, px / second
    candleOpacity: 0.42,  // master opacity for candle bodies/wicks
    upColor: "#5f7ea8",   // muted institutional blue
    downColor: "#b06a63", // muted institutional red
    gridColor: "rgba(28, 36, 52, 0.055)",
    axisText: "rgba(40, 50, 66, 0.34)",
    maColor: "rgba(60, 74, 96, 0.30)",
    slotWidth: 15,        // px per candle column (body + gap)
    bodyWidth: 7,         // px candle body
    showMA: true,
    showAxis: true,
  };

  function cfg() {
    return Object.assign({}, DEFAULTS, window.HERO_CONFIG || {});
  }

  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W = 0, H = 0, dpr = 1;
  let candles = [];        // {o,h,l,c,v}
  let scroll = 0;          // sub-slot pixel offset [0, slotWidth)
  let dispMin = 0, dispMax = 0, inited = false;
  let chTop = 0, chH = 0;  // chart plot band (canvas px) for external projection

  // ---- market data: damped momentum walk ----------------------------------
  let price = 100;
  let velocity = 0;
  function nextCandle() {
    const baseVol = 0.42;
    // momentum that mean-reverts -> trends then pulls back (realistic waves)
    velocity += (Math.random() - 0.5) * 0.26;
    velocity *= 0.9;
    velocity -= (price - 100) * 0.0016; // gentle pull toward a center band
    const o = price;
    let c = o + velocity + (Math.random() - 0.5) * baseVol;
    const span = Math.abs(c - o) + baseVol * (0.5 + Math.random());
    const h = Math.max(o, c) + Math.random() * span * 0.7;
    const l = Math.min(o, c) - Math.random() * span * 0.7;
    price = c;
    // volume: bigger on wider-range / trending bars (looks real)
    const v = 0.4 + Math.abs(c - o) * 1.8 + Math.abs(velocity) * 1.2 + Math.random() * 0.6;
    return { o, h, l, c, v };
  }

  function slotsNeeded() {
    return Math.ceil(W / cfg().slotWidth) + 4; // +buffer off the right edge
  }

  function seed() {
    candles = [];
    price = 100; velocity = 0;
    const n = slotsNeeded();
    for (let i = 0; i < n; i++) candles.push(nextCandle());
    inited = false;
  }

  // ---- responsive sizing ---------------------------------------------------
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const need = slotsNeeded();
    while (candles.length < need) candles.push(nextCandle());
    if (candles.length > need + 2) candles.splice(0, candles.length - need);
  }

  // ---- helpers -------------------------------------------------------------
  function visibleExtent() {
    let lo = Infinity, hi = -Infinity;
    for (const k of candles) { if (k.l < lo) lo = k.l; if (k.h > hi) hi = k.h; }
    const pad = (hi - lo) * 0.14 || 1;
    return [lo - pad, hi + pad];
  }

  function niceStep(range, target) {
    const raw = range / target;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    const step = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
    return step * mag;
  }

  function edgeAlpha(x) {
    const inR = Math.min(1, Math.max(0, (W - x) / 90));        // fade in on right
    const outL = Math.min(1, Math.max(0, (x - 8) / 150));      // fade out on left
    return Math.min(inR, outL);
  }

  // ---- render --------------------------------------------------------------
  function draw() {
    const c = cfg();
    const slotW = c.slotWidth, bodyW = c.bodyWidth;
    ctx.clearRect(0, 0, W, H);

    const padTop = 28, padBot = 26;
    const top = padTop, ch = H - padTop - padBot;
    chTop = top; chH = ch;

    // smooth auto-scale
    const [tMin, tMax] = visibleExtent();
    if (!inited) { dispMin = tMin; dispMax = tMax; inited = true; }
    else { dispMin += (tMin - dispMin) * 0.05; dispMax += (tMax - dispMax) * 0.05; }
    const range = dispMax - dispMin || 1;
    const yOf = (p) => top + (dispMax - p) / range * ch;

    // horizontal grid + right price scale
    const step = niceStep(range, 6);
    const start = Math.ceil(dispMin / step) * step;
    ctx.lineWidth = 1;
    ctx.font = "11px ui-monospace, 'IBM Plex Mono', SFMono-Regular, Menlo, monospace";
    ctx.textBaseline = "middle";
    for (let p = start; p <= dispMax; p += step) {
      const y = yOf(p);
      ctx.strokeStyle = c.gridColor;
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
      ctx.stroke();
      if (c.showAxis) {
        ctx.fillStyle = c.axisText;
        ctx.textAlign = "right";
        ctx.fillText(p.toFixed(2), W - 12, y);
      }
    }

    // faint static vertical grid
    const vStep = slotW * 6;
    const vOff = scroll % vStep;
    for (let x = W - vOff; x > 0; x -= vStep) {
      ctx.strokeStyle = c.gridColor;
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, top - 6);
      ctx.lineTo(Math.round(x) + 0.5, top + ch + 6);
      ctx.stroke();
    }

    // moving-average overlay (quant/terminal credibility)
    if (c.showMA) {
      const P = 14;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < candles.length; i++) {
        if (i < P) continue;
        let s = 0; for (let j = i - P; j < i; j++) s += candles[j].c;
        const ma = s / P;
        const x = i * slotW - scroll;
        const y = yOf(ma);
        const a = edgeAlpha(x);
        if (a <= 0) { started = false; continue; }
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = c.maColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // candles
    for (let i = 0; i < candles.length; i++) {
      const k = candles[i];
      const x = i * slotW - scroll;
      if (x < -slotW || x > W + slotW) continue;
      const a = edgeAlpha(x);
      if (a <= 0) continue;
      const up = k.c >= k.o;
      const col = up ? c.upColor : c.downColor;
      ctx.globalAlpha = a * c.candleOpacity;
      ctx.strokeStyle = col;
      ctx.fillStyle = col;

      const cx = x;
      // wick
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(cx, yOf(k.h));
      ctx.lineTo(cx, yOf(k.l));
      ctx.stroke();
      // body
      const yO = yOf(k.o), yC = yOf(k.c);
      const bt = Math.min(yO, yC), bh = Math.max(1.5, Math.abs(yC - yO));
      ctx.fillRect(Math.round(cx - bodyW / 2), bt, bodyW, bh);
    }
    ctx.globalAlpha = 1;

    // last-price tag on the right edge (live feel)
    const last = candles[candles.length - 3]; // last fully on-screen-ish
    if (last) {
      if (c.showLastTag === false) { /* DOM provides it in terminal mode */ }
      else {
      const up = last.c >= last.o;
      const col = up ? c.upColor : c.downColor;
      const y = yOf(last.c);
      const label = last.c.toFixed(2);
      ctx.font = "11px ui-monospace, 'IBM Plex Mono', SFMono-Regular, Menlo, monospace";
      const tw = ctx.measureText(label).width;
      const bw = tw + 16, bh = 18, bx = W - bw - 6;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = up ? "rgba(95,126,168,0.16)" : "rgba(176,106,99,0.16)";
      ctx.fillRect(bx, y - bh / 2, bw, bh);
      ctx.strokeStyle = col; ctx.globalAlpha = 0.55; ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, y - bh / 2 + 0.5, bw, bh);
      ctx.globalAlpha = 1;
      ctx.fillStyle = col;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, bx + bw / 2, y);
      ctx.beginPath();
      ctx.strokeStyle = col; ctx.globalAlpha = 0.4;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(0, y + 0.5); ctx.lineTo(bx, y + 0.5); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
    }
  }

  // ---- loop ----------------------------------------------------------------
  // Drive with rAF for vsync smoothness, but keep a setInterval safety net:
  // some embedded/preview contexts throttle rAF to zero. Movement is wall-clock
  // (speed * dt) so either driver yields the same velocity; a short dedupe
  // window stops them from double-drawing when both are live.
  let lastT = performance.now();
  let lastTickAt = 0;

  function tick() {
    const now = performance.now();
    if (now - lastTickAt < 8) return;       // dedupe overlapping drivers
    let dt = (now - lastT) / 1000;
    lastT = now; lastTickAt = now;
    if (dt > 0.05) dt = 0.016;              // clamp tab-switch / first-frame jumps
    const c = cfg();
    scroll += c.speed * dt;
    while (scroll >= c.slotWidth) {
      scroll -= c.slotWidth;
      candles.push(nextCandle());
      candles.shift();
    }
    draw();
  }

  function rafLoop() {
    tick();
    requestAnimationFrame(rafLoop);
  }

  function startLoop() {
    lastT = performance.now();
    requestAnimationFrame(rafLoop);
    setInterval(tick, 1000 / 60);           // safety net when rAF is throttled
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) lastT = performance.now(); // avoid a dt spike on return
    });
  }

  // ---- boot ----------------------------------------------------------------
  function boot() {
    seed();
    resize();
    startLoop();
  }
  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(resize, 120);
  });
  if (document.readyState === "complete" || document.readyState === "interactive") boot();
  else window.addEventListener("DOMContentLoaded", boot);

  // expose for the live last-price ticker in the DOM chrome
  window.__heroLastPrice = () => candles.length ? candles[candles.length - 3] : null;

  // expose full state so the terminal layer can project markers / volume onto
  // the (scaled, clipped) chart with exact alignment while it is frozen.
  window.__hero = {
    state: () => ({
      candles, slotW: cfg().slotWidth, scroll, W, H,
      top: chTop, ch: chH, dispMin, dispMax,
    }),
  };
})();
