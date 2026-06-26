/* transition.js — the pinned shared-element morph (Screen 1 → Screen 2).

   .exp-stage is position:sticky inside the tall .exp-intro, so the scene pins to
   the viewport while the page scrolls through it. Scroll progress p (0→1) over
   the pinned span drives everything on the ONE pinned scene, every value a pure
   function of scroll (so reverse-scroll is exact, and there is no re-parenting,
   re-render, or layout switch):

     • the single K-line (#chart-clip / #chart-pan) morphs by transform + clip
       from filling the stage to sitting exactly in the lead internship's chart
       module (#chart-host) — the canvas bitmap never resizes or reloads, it is
       only translated/scaled, so the candles keep scrolling without a hitch;
     • the hero layer (#stage-hero) fades out and lifts;
     • the Screen-2 layer (#stage-s2) fades in once the chart nears its target.

   After p reaches 1 the sticky releases and the rest of Screen 2 scrolls. The
   K-line is a child of the stage, so it travels with the page on release —
   staying locked inside its module — with no hand-off. */
(function () {
  "use strict";

  const stage = document.getElementById("exp-stage");
  const wrap = document.getElementById("chart-clip");
  const pan = document.getElementById("chart-pan");
  const hero = document.getElementById("stage-hero");
  const content = hero ? hero.querySelector(".content") : null;
  const s2 = document.getElementById("stage-s2");
  if (!stage || !wrap || !pan) return;

  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const win = (t, a, b) => easeInOut(clamp01((t - a) / (b - a)));

  // pin span in viewport heights (must match: .exp-intro height − 100vh).
  // Longer span ⇒ the morph takes several wheel notches, not one flick.
  const PIN_VH = 3;

  let W = 0, H = 0, target = null;
  function measure() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    const host = document.getElementById("chart-host");
    if (host && s2) {
      // measure the module's RESTING rect (Screen-2 layer un-translated), so the
      // K-line always lands on the final spot while the layer slides up to meet it
      const saved = s2.style.transform;
      s2.style.transform = "none";
      const hr = host.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      s2.style.transform = saved;
      if (hr.width > 1 && hr.height > 1) {
        target = { left: hr.left - sr.left, top: hr.top - sr.top, width: hr.width, height: hr.height };
      }
    }
  }

  // f=0 → chart fills the stage; f=1 → chart sits exactly in rect `r` (stage coords)
  function morphTo(r, f) {
    const sFit = Math.max(r.width / W, r.height / H);
    const s = 1 + (sFit - 1) * f;
    const tx = (r.left + r.width / 2 - (W * sFit) / 2) * f;
    const ty = (r.top + r.height / 2 - (H * sFit) / 2) * f;
    pan.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + s + ")";
    const cl = r.left * f, ct = r.top * f;
    const cr = (W - r.left - r.width) * f, cb = (H - r.top - r.height) * f;
    wrap.style.clipPath = "inset(" + ct + "px " + cr + "px " + cb + "px " + cl + "px round " + (14 * f) + "px)";
  }

  function render() {
    // While a case study owns the chart (it reparents #chart-clip and flies it
    // into the article figure), this scroll-morph stays out of the way.
    if (window.__caseOpen) return;
    const vh = window.innerHeight;
    const p = clamp01(window.scrollY / (PIN_VH * vh));
    const ep = easeInOut(p);

    if (!target) measure();
    if (!W || !H) { W = stage.clientWidth; H = stage.clientHeight; }
    const r = target || { left: 0, top: 0, width: W, height: H };
    morphTo(r, target ? ep : 0);

    // chart engine: stay visible and gently alive once landed (no hard freeze,
    // no reset); candles keep scrolling, opacity & density ramp with the zoom.
    const cfg = (window.HERO_CONFIG = window.HERO_CONFIG || {});
    cfg.speed = 24 * (1 - 0.55 * ep);
    cfg.candleOpacity = 0.30 + (1.0 - 0.30) * ep;
    cfg.detail = ep;            // fades in the volume sub-panel + crisp grid as it settles
    cfg.footprint = false;      // editorial figure (A+B) — clean candles, no order-flow footprint
    cfg.showAxis = true;
    cfg.showLastTag = true;
    cfg.showMA = true;

    // hero cross-fade + lift (front-loaded: gone before the chart lands)
    const hf = clamp01(1 - p / 0.4);
    if (hero) {
      hero.style.opacity = hf;
      hero.style.visibility = hf < 0.02 ? "hidden" : "visible";
      hero.style.pointerEvents = p > 0.5 ? "none" : "";
    }
    if (content) content.style.transform = "translateY(" + (-52 * (1 - hf)) + "px)";

    // Screen-2 layer is a SOLID panel that pushes UP into place (v1 feel): an
    // upward slide plus an early opacity ramp (so it reads solid, not a fade),
    // settling its module exactly where the K-line is landing.
    if (s2) {
      const rise = win(p, 0.16, 0.82);          // 0 → 1 travel
      const appear = win(p, 0.16, 0.46);        // reaches solid early
      s2.style.opacity = appear;
      s2.style.transform = "translateY(" + ((1 - rise) * 0.72 * H).toFixed(2) + "px)";
    }

    window.__morph = { e: ep, p: p };
  }

  // driven from a synchronous scroll listener (always fresh, even in
  // throttled/offscreen contexts) + an rAF loop (live chart, reflow) + interval.
  const draw = () => render();
  function loop() { draw(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  setInterval(draw, 1000 / 60);

  window.addEventListener("scroll", draw, { passive: true });
  window.addEventListener("resize", () => { measure(); draw(); });

  function boot() { measure(); draw(); }
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
  window.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 400);
  setTimeout(boot, 1200);

  window.__morphMeasure = boot;
})();
