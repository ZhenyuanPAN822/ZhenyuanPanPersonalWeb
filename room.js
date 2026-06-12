/* room.js — Screen 4 overlay behaviour: cursor parallax (forwarded to the 3D
   camera), callout wires, and the staggered reveal choreography driven each
   frame by transition.js via __onRoomMorph(r). */
(function () {
  "use strict";

  const s4 = document.querySelector(".s4");
  if (!s4) return;
  const wires = document.getElementById("s4-wires");
  const callouts = [...s4.querySelectorAll(".callout")];
  const head = s4.querySelector(".s4-head");
  const corner = s4.querySelector(".s4-corner");
  const fig = s4.querySelector(".s4-fig");
  const badge = s4.querySelector(".s4-badge");

  // ── cursor parallax (damped, forwarded to the 3D camera) ───────────────────
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let mx = 0, my = 0, cx = 0, cy = 0;
  window.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  setInterval(() => {
    if (reduced) { mx = 0; my = 0; }
    cx += (mx - cx) * 0.05;
    cy += (my - cy) * 0.05;
    if (window.__room3d) window.__room3d.setParallax(cx, cy);
    // cards drift very slightly, opposite the camera, for depth
    callouts.forEach((c) => {
      c.style.marginLeft = (cx * -5) + "px";
      c.style.marginTop = (cy * -3) + "px";
    });
  }, 16);

  // ── callout wires ──────────────────────────────────────────────────────────
  const NS = "http://www.w3.org/2000/svg";
  function buildWires() {
    if (!wires) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    wires.setAttribute("viewBox", "0 0 " + vw + " " + vh);
    wires.innerHTML = "";
    callouts.forEach((c) => {
      const ax = (parseFloat(c.dataset.ax) / 100) * vw;
      const ay = (parseFloat(c.dataset.ay) / 100) * vh;
      const save = c.style.transform; c.style.transform = "none";
      const r = c.getBoundingClientRect();
      c.style.transform = save;
      const cardSide = c.dataset.side === "r" ? 1 : -1;
      const sx = cardSide === 1 ? r.right : r.left;
      const sy = r.top + r.height / 2;
      const bend = Math.min(96, Math.max(34, Math.abs(ax - sx) * 0.34));
      const hx = sx + cardSide * bend;
      const mx = ax - cardSide * Math.min(46, bend * 0.58);
      const ln = document.createElementNS(NS, "path");
      ln.setAttribute("d", "M " + sx + " " + sy + " C " + hx + " " + sy + ", " + mx + " " + ay + ", " + ax + " " + ay);
      wires.appendChild(ln);
      const ce = document.createElementNS(NS, "circle");
      ce.setAttribute("cx", sx); ce.setAttribute("cy", sy); ce.setAttribute("r", 2.4);
      ce.setAttribute("class", "cend");
      wires.appendChild(ce);
      const ae = document.createElementNS(NS, "circle");
      ae.setAttribute("cx", ax); ae.setAttribute("cy", ay); ae.setAttribute("r", 3.1);
      ae.setAttribute("class", "aend");
      wires.appendChild(ae);
    });
  }
  if (document.readyState === "complete") buildWires();
  else window.addEventListener("load", buildWires);
  setTimeout(buildWires, 600);
  let rT;
  window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(buildWires, 150); });

  // ── reveal choreography (r ∈ 0..1 from transition.js) ──────────────────────
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const win = (t, a, b) => easeOut(Math.max(0, Math.min(1, (t - a) / (b - a))));

  window.__onRoomMorph = function (r) {
    if (r <= 0) {
      callouts.forEach((c) => { c.style.opacity = "0"; c.style.transform = ""; });
      [head, corner, fig, badge].forEach((n) => { if (n) { n.style.opacity = "0"; } });
      if (wires) wires.style.opacity = "0";
      return;
    }
    callouts.forEach((c, i) => {
      const k = win(r, 0.55 + i * 0.04, 0.82 + i * 0.04);
      c.style.opacity = String(k);
      const from = c.classList.contains("co-r") ? 20 : -20;
      c.style.transform = "translateX(" + (from * (1 - k)) + "px)";
    });
    if (wires) wires.style.opacity = String(win(r, 0.76, 0.97) * 0.9);
    const hk = win(r, 0.5, 0.8);
    if (head) { head.style.opacity = String(hk); head.style.transform = "translateY(" + (-14 * (1 - hk)) + "px)"; }
    const ck = win(r, 0.6, 0.88);
    if (corner) corner.style.opacity = String(ck);
    if (fig) fig.style.opacity = String(ck);
    const bk = win(r, 0.74, 0.97);
    if (badge) { badge.style.opacity = String(bk); badge.style.transform = "translateY(" + (10 * (1 - bk)) + "px)"; }
  };

  window.__roomEnter = function () { buildWires(); };
})();
