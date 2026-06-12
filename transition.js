/* transition.js — one unbroken camera move across three screens.
   Scrolling sets a target; a damped follower (curScroll) chases it, so jumpy
   wheel input becomes one smooth cinematic motion. Two phases derive from the
   smoothed scroll:
     p (0→1)  S1 living hero chart  →  S2 Equity & Quant Terminal
              (chart shrinks into the terminal's center panel and freezes)
     q (0→1)  S2 terminal → S3 Research Console, staged as a camera dolly:
              q 0→.5  PUSH IN — terminal panels part outward & fade as the
                      camera dives back into the chart; it expands to full
                      screen again, candles dissolving into a bare data grid
              q .5→1  PULL OUT — the grid lands inside the Research Console's
                      event-study panel; research panels glide in around it
   The graph paper never cuts: the same canvas grid is the connective tissue
   from market chart → full-screen data field → econometrics plot. */
(function () {
  "use strict";

  const clip = document.getElementById("chart-clip");
  const pan = document.getElementById("chart-pan");
  const hostS2 = document.getElementById("chart-host");
  const hostS3 = document.getElementById("es-plot");
  const content = document.querySelector(".content");
  const veil = document.querySelector(".veil");
  const chrome = document.querySelector(".chrome");
  const s2 = document.querySelector(".s2");
  const s3 = document.querySelector(".s3");
  const s4 = document.querySelector(".s4");
  const s5 = document.querySelector(".s5");
  if (!clip || !pan || !hostS2 || !s2) return;

  // scroll layout in viewport-height units (V)
  const P_END = 1.15;   // S1→S2 morph completes
  const Q_START = 1.75; // dwell on the terminal, then S2→S3 begins
  const Q_LEN = 1.25;   // S2→S3 span
  const R_START = 3.5;  // dwell on the research console, then S3→S4 begins
  const R_LEN = 1.1;    // S3→S4 pull-back span

  const S_START = 4.78; // dwell on the workspace, then S4 -> S5 begins
  const S_LEN = 1.22;   // S4 -> S5 resume archive span

  let rectA = hostS2.getBoundingClientRect();
  let rectC = hostS3 ? hostS3.getBoundingClientRect() : rectA;
  function measure() {
    rectA = hostS2.getBoundingClientRect();
    if (hostS3) rectC = hostS3.getBoundingClientRect();
  }

  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const win = (t, a, b) => easeInOut(clamp01((t - a) / (b - a)));

  let targetScroll = 0, curScroll = 0;
  let wasS2Live = false, wasS3Live = false, wasS4Live = false, wasS5Live = false;
  let baseMA = null;

  function readTarget() {
    const V = window.innerHeight;
    if (window.__forceScrollV != null) return window.__forceScrollV * V;  // debug: any point
    if (window.__forceP != null) return window.__forceP * P_END * V;      // debug: phase A
    return window.scrollY;
  }

  // camera helper: f=0 chart fills viewport, f=1 chart sits in `rect`
  function morphTo(rect, f, vw, vh) {
    const sFit = Math.max(rect.width / vw, rect.height / vh);
    const s = 1 + (sFit - 1) * f;
    const tx = (rect.left + rect.width / 2 - (vw * sFit) / 2) * f;
    const ty = (rect.top + rect.height / 2 - (vh * sFit) / 2) * f;
    pan.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + s + ")";
    const cl = rect.left * f, ct = rect.top * f;
    const cr = (vw - rect.left - rect.width) * f, cb = (vh - rect.top - rect.height) * f;
    clip.style.clipPath = "inset(" + ct + "px " + cr + "px " + cb + "px " + cl + "px round " + (9 * f) + "px)";
    return { s, tx, ty };
  }

  const lerpRect = (a, b, k) => ({
    left: a.left + (b.left - a.left) * k,
    top: a.top + (b.top - a.top) * k,
    width: a.width + (b.width - a.width) * k,
    height: a.height + (b.height - a.height) * k,
  });

  function render(scroll) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const p = clamp01(scroll / (P_END * vh));
    const q = clamp01((scroll - Q_START * vh) / (Q_LEN * vh));
    const rr = clamp01((scroll - R_START * vh) / (R_LEN * vh));
    const ss = clamp01((scroll - S_START * vh) / (S_LEN * vh));
    const ep = easeInOut(p);

    // ── camera: one continuous move ────────────────────────────────────────────
    // S1→S2: shrink into the terminal panel. S2→S3: the chart panel swells for
    // a closer look (the candles lift off and become coefficients mid-air),
    // then settles into the research console's event-study frame.
    let cam;
    if (q <= 0) {
      cam = morphTo(rectA, ep, vw, vh);                 // S1→S2 (approved, unchanged)
    } else {
      // S2→S3: the chart stays seated — the S2 chart panel and the S3
      // event-study panel occupy nearly the same place, so the frame just
      // glides between the two rects with a gentle mid-transition breath
      // while the candles morph into coefficients inside it.
      const t = win(q, 0.05, 0.95);
      const r0 = lerpRect(rectA, rectC, t);
      const breathe = 1 + 0.045 * (4 * q * (1 - q));    // ≤4.5% swell at mid-q
      const rq = {
        left: r0.left - r0.width * (breathe - 1) / 2,
        top: r0.top - r0.height * (breathe - 1) / 2,
        width: r0.width * breathe,
        height: r0.height * breathe,
      };
      cam = morphTo(rq, 1, vw, vh);
    }

    // ── chart engine: freeze into S2; dissolve candles into bare grid for S3 ──
    const base = window.__heroBaseSpeed != null ? window.__heroBaseSpeed : 24;
    const baseInt = window.__heroBaseIntensity != null ? window.__heroBaseIntensity : 0.42;
    const cfg = (window.HERO_CONFIG = window.HERO_CONFIG || {});
    cfg.speed = base * Math.pow(clamp01(1 - ep / 0.96), 1.3);
    // candles hand off to the morph overlay almost immediately on dive-in
    const dissolve = win(q, 0.02, 0.15);
    cfg.candleOpacity = (baseInt + (0.85 - baseInt) * ep) * (1 - dissolve);
    cfg.showAxis = ep < 0.42;
    cfg.showLastTag = ep < 0.42;
    if (q > 0.04) { if (baseMA == null) { baseMA = cfg.showMA !== false; } cfg.showMA = false; }
    else if (baseMA != null) { cfg.showMA = baseMA; baseMA = null; }

    // ── Screen 1 cross-fade (unchanged) ───────────────────────────────────────
    const s1op = clamp01(1 - p / 0.40);
    if (content) { content.style.opacity = s1op; content.style.pointerEvents = s1op < 0.05 ? "none" : "auto"; }
    if (veil) { veil.style.opacity = s1op; veil.style.visibility = s1op < 0.02 ? "hidden" : "visible"; }
    if (chrome) { chrome.style.opacity = s1op; chrome.style.pointerEvents = "none"; chrome.style.visibility = s1op < 0.02 ? "hidden" : "visible"; }

    // ── Screen 2: arrives with p; parts outward & fades as the camera dives ───
    const s2in = clamp01((p - 0.44) / 0.40);
    const s2out = win(q, 0.04, 0.52);
    const s2op = s2in * (1 - s2out);
    s2.style.opacity = s2op;
    s2.style.visibility = s2op < 0.02 ? "hidden" : "visible";
    s2.style.transform = s2out > 0 ? "scale(" + (1 + 0.025 * s2out) + ")" : "";

    // ── Screen 3: glides in around the landing chart ───────────────────────────
    if (s3) {
      const s3op = win(q, 0.46, 0.88);
      s3.style.opacity = s3op;
      s3.style.visibility = s3op < 0.02 ? "hidden" : "visible";
    }

    const s2Live = p > 0.92 && q < 0.04;
    const s3Live = q > 0.93 && rr < 0.04;
    const s4Live = rr > 0.93 && ss < 0.94;
    const s5Live = ss > 0.92;
    document.body.classList.toggle("s2-live", s2Live);
    document.body.classList.toggle("s3-live", s3Live);
    document.body.classList.toggle("s4-live", s4Live);
    document.body.classList.toggle("s5-live", s5Live);

    // ── phase R: pull back — the console shrinks onto the 3D room's monitor ──
    if (s4) {
      if (rr > 0) {
        if (window.__room3d) window.__room3d.setProgress(rr);
        const sr = window.__room3d && window.__room3d.screenRect ? window.__room3d.screenRect() : null;
        // crossfade: live DOM console → baked screen texture (person fades in)
        const hand = win(rr, 0.55, 0.8);
        if (window.__room3d && window.__room3d.personReveal) window.__room3d.personReveal(hand);
        if (sr) {
          const scx = sr.width / vw, scy = sr.height / vh;
          const tf = "translate(" + sr.left + "px," + sr.top + "px) scale(" + scx + "," + scy + ")";
          s3.style.transformOrigin = "0 0";
          s3.style.transform = tf;
          clip.style.transformOrigin = "0 0";
          clip.style.transform = tf;
          clip.style.zIndex = "5";          // above the room, below the console
        }
        s3.style.pointerEvents = "none";
        const fade = 1 - hand;
        s3.style.opacity = String(parseFloat(s3.style.opacity || "1") * fade);
        clip.style.opacity = String(fade);
        if (fade <= 0.02) s3.style.visibility = "hidden";
      } else {
        s3.style.transform = "";
        s3.style.transformOrigin = "";
        clip.style.transform = "";
        clip.style.transformOrigin = "";
        clip.style.zIndex = "";
        clip.style.opacity = "";
        s3.style.pointerEvents = "";
        if (window.__room3d) { window.__room3d.setProgress(0); window.__room3d.personReveal(0); }
      }
      const s4leave = win(ss, 0.12, 0.78);
      const s4op = win(rr, 0.1, 0.45) * (1 - s4leave);
      s4.style.opacity = s4op;
      s4.style.visibility = s4op < 0.02 ? "hidden" : "visible";
      if (ss > 0) {
        const lift = win(ss, 0.02, 0.74);
        s4.style.transformOrigin = "50% 56%";
        s4.style.transform = "translateY(" + (-28 * lift).toFixed(2) + "px) scale(" + (1 - 0.025 * lift).toFixed(4) + ")";
        s4.style.filter = "blur(" + (5.5 * s4leave).toFixed(2) + "px)";
      } else {
        s4.style.transform = "";
        s4.style.transformOrigin = "";
        s4.style.filter = "";
      }
      if (window.__onRoomMorph) window.__onRoomMorph(rr);
    }

    if (s5) {
      const s5op = win(ss, 0.18, 0.62);
      s5.style.opacity = s5op;
      s5.style.visibility = s5op < 0.02 ? "hidden" : "visible";
      s5.style.transform = "translateY(" + (42 * (1 - s5op)).toFixed(2) + "px)";
      if (window.__resumeArchive && window.__resumeArchive.setProgress) window.__resumeArchive.setProgress(ss);
    }

    // ── expose state ───────────────────────────────────────────────────────────
    window.__morph = { s: cam.s, tx: cam.tx, ty: cam.ty, e: ep, panel: rectA, vw, vh };
    if (window.__onMorph) window.__onMorph(ep);
    if (window.__onResearchMorph) window.__onResearchMorph(q);
    if (window.__onCandleMorph) window.__onCandleMorph(q);

    if (s2Live && !wasS2Live && window.__terminalEnter) window.__terminalEnter();
    if (s3Live && !wasS3Live && window.__researchEnter) window.__researchEnter();
    if (s4Live && !wasS4Live && window.__roomEnter) window.__roomEnter();
    wasS2Live = s2Live; wasS3Live = s3Live; wasS4Live = s4Live; wasS5Live = s5Live;
  }

  // ── damped follower loop (rAF + interval fallback for throttled contexts) ───
  let lastTickAt = performance.now();
  function step() {
    const now = performance.now();
    if (now - lastTickAt < 8) return;
    let dt = (now - lastTickAt) / 1000;
    lastTickAt = now;
    if (dt > 0.05) dt = 0.016;
    targetScroll = readTarget();
    const k = 1 - Math.exp(-dt * 7.5);
    curScroll += (targetScroll - curScroll) * k;
    if (Math.abs(targetScroll - curScroll) < 0.4) curScroll = targetScroll;
    render(curScroll);
  }
  function loop() { step(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  setInterval(step, 1000 / 60);

  window.addEventListener("resize", () => { measure(); render(curScroll); });

  function boot() { measure(); targetScroll = readTarget(); curScroll = targetScroll; render(curScroll); }
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
  window.addEventListener("DOMContentLoaded", boot);
  setTimeout(() => { measure(); render(curScroll); }, 400);
  setTimeout(() => { measure(); render(curScroll); }, 1200);

  // debug / capture: jump instantly to a scroll point (in V units) at scroll 0
  window.__morphMeasure = () => { measure(); targetScroll = readTarget(); curScroll = targetScroll; render(curScroll); };
})();
