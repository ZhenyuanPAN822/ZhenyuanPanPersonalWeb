/* dd-graph.js — Block 02 (Zhuhai Gaoke VC · RISK × ENGINEERING) visualization.
   An animated, illustrative corporate due-diligence network: a target company at
   the centre, edges drawn out to shareholders / affiliates / outbound investments
   and litigation, with a radial scan that surfaces risk nodes (they light magenta
   and a flag tally counts up). Entities and names are FICTIONAL / representative —
   no real company data. Built on canvas, DPR-aware, plays only while in view,
   and degrades to a static frame under prefers-reduced-motion.
   Structured so nodes can become click-to-expand targets later. */
(function () {
  "use strict";

  const host = document.getElementById("dd-graph");
  if (!host) return;
  const canvas = host.querySelector(".dd-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const C = {
    ink: "#14181f",
    body: "#3c4654",
    mute: "#8a909b",
    mag: "#d6006c",
    edge: "rgba(20,24,31,0.16)",
    edgeRisk: "rgba(214,0,108,0.42)",
    ring: "rgba(20,24,31,0.05)",
    bg: "#ffffff",
  };

  // normalized layout in [-1,1], y points down; labels shortened to fit 4:3 frame
  const NODES = [
    { id: "t",  label: "Humanoid Robotics", type: "target", x: 0.00, y: 0.00 },
    { id: "a",  label: "Holding LP",     type: "entity", x: 0.05, y: -0.62 },
    { id: "b",  label: "Founder SPV",    type: "entity", x: 0.64, y: -0.22 },
    { id: "c",  label: "Subsidiary",     type: "entity", x: 0.50, y: 0.56 },
    { id: "d",  label: "Affiliate",      type: "entity", x: -0.50, y: 0.56 },
    { id: "e",  label: "Key Person",     type: "entity", x: -0.64, y: -0.22 },
    { id: "a1", label: "Co-Investor",    type: "entity", x: -0.26, y: -1.00 },
    { id: "a2", label: "Pledged Equity", type: "risk",   x: 0.36, y: -0.96 },
    { id: "b1", label: "Outbound Inv.",  type: "entity", x: 1.04, y: -0.44 },
    { id: "b2", label: "Related Loan",   type: "risk",   x: 1.00, y: 0.18 },
    { id: "c1", label: "Supplier",       type: "entity", x: 0.80, y: 1.00 },
    { id: "c2", label: "Litigation",     type: "risk",   x: 0.22, y: 1.02 },
    { id: "d1", label: "Guarantee",      type: "entity", x: -0.84, y: 0.98 },
    { id: "e1", label: "Litigation",     type: "risk",   x: -1.04, y: -0.56 },
  ];
  const EDGES = [
    ["t", "a"], ["t", "b"], ["t", "c"], ["t", "d"], ["t", "e"],
    ["a", "a1"], ["a", "a2"], ["b", "b1"], ["b", "b2"],
    ["c", "c1"], ["c", "c2"], ["d", "d1"], ["e", "e1"],
    ["b2", "c"], ["a2", "b"],
  ];

  const byId = {};
  NODES.forEach((n) => (byId[n.id] = n));
  const ring1 = ["a", "b", "c", "d", "e"];
  const ring2 = ["a1", "a2", "b1", "b2", "c1", "c2", "d1", "e1"];
  const riskIds = NODES.filter((n) => n.type === "risk").map((n) => n.id);

  // per-node static metadata: appearance window, float phase, scan angle
  NODES.forEach((n, i) => {
    n.phase = (Math.sin(i * 12.9898) * 43758.5453) % (Math.PI * 2);
    n.deg = ((Math.atan2(n.y, n.x) * 180) / Math.PI + 360) % 360;
    if (n.id === "t") { n.t0 = 0.0; n.t1 = 0.12; }
    else if (ring1.indexOf(n.id) >= 0) { const k = ring1.indexOf(n.id); n.t0 = 0.12 + k * 0.05; n.t1 = n.t0 + 0.14; }
    else { const k = ring2.indexOf(n.id); n.t0 = 0.44 + k * 0.035; n.t1 = n.t0 + 0.14; }
  });

  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INTRO_MS = 2400;

  let W = 0, H = 0, cx = 0, cy = 0, scale = 0, baseR = 4, dpr = 1;
  let raf = 0, startT = 0, introDone = false;
  let hideTarget = false;
  const lit = {}; // risk id -> time first lit (ms into idle clock) ; presence = lit

  function resize() {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H / 2;
    scale = Math.min(W, H) * 0.31;
    baseR = Math.max(3, Math.min(W, H) / 88);
  }

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
  function nodeAlpha(n, p) { return easeOut(clamp01((p - n.t0) / (n.t1 - n.t0))); }

  function px(n, idle, alpha) {
    let fx = 0, fy = 0;
    if (!REDUCED && idle > 0) {
      const amp = Math.min(W, H) * 0.011 * (n.id === "t" ? 0.35 : 1) * alpha;
      fx = Math.sin(idle * 0.0007 + n.phase) * amp;
      fy = Math.cos(idle * 0.0006 + n.phase * 1.3) * amp;
    }
    return { x: cx + n.x * scale + fx, y: cy + n.y * scale + fy };
  }

  function setFont(weight, size, family) {
    ctx.font = weight + " " + size + "px " + family;
  }
  function withLS(v, fn) {
    let had = false, prev;
    try { prev = ctx.letterSpacing; ctx.letterSpacing = v; had = true; } catch (e) {}
    fn();
    if (had) { try { ctx.letterSpacing = prev; } catch (e) {} }
  }
  function roundRect(c, x, y, w, h, rad) {
    if (c.roundRect) { c.beginPath(); c.roundRect(x, y, w, h, rad); return; }
    c.beginPath(); c.moveTo(x + rad, y);
    c.arcTo(x + w, y, x + w, y + h, rad); c.arcTo(x + w, y + h, x, y + h, rad);
    c.arcTo(x, y + h, x, y, rad); c.arcTo(x, y, x + w, y, rad); c.closePath();
  }

  function draw(now) {
    const p = REDUCED ? 1 : clamp01((now - startT) / INTRO_MS);
    const idle = introDone ? now - (startT + INTRO_MS) : 0;
    ctx.clearRect(0, 0, W, H);

    // faint concentric guide rings (radar field)
    ctx.strokeStyle = C.ring;
    ctx.lineWidth = 1;
    [0.52, 1.0].forEach((rr) => {
      ctx.beginPath();
      ctx.arc(cx, cy, scale * rr, 0, Math.PI * 2);
      ctx.stroke();
    });

    // scan sweep (intro only): a rotating line that lights risk nodes it passes
    const scanFrac = clamp01((p - 0.5) / 0.5);
    if (scanFrac > 0 && scanFrac < 1 && !REDUCED) {
      const ang = (scanFrac * 360 - 90) * (Math.PI / 180);
      const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(ang) * scale * 1.1, cy + Math.sin(ang) * scale * 1.1);
      grad.addColorStop(0, "rgba(214,0,108,0.28)");
      grad.addColorStop(1, "rgba(214,0,108,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * scale * 1.08, cy + Math.sin(ang) * scale * 1.08);
      ctx.stroke();
    }
    // continuous slow sweep once settled — a faint live-monitoring radar
    if (introDone && !REDUCED) {
      const sweep = (now * 0.00018) % (Math.PI * 2);
      ctx.fillStyle = "rgba(20,24,31,0.022)";
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, scale * 1.04, sweep - 0.6, sweep); ctx.closePath(); ctx.fill();
      const ex = cx + Math.cos(sweep) * scale * 1.04, ey = cy + Math.sin(sweep) * scale * 1.04;
      const g = ctx.createLinearGradient(cx, cy, ex, ey);
      g.addColorStop(0, "rgba(20,24,31,0.10)"); g.addColorStop(1, "rgba(20,24,31,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
    }
    // light risk nodes the scan has passed
    const scanDeg = scanFrac * 360;
    riskIds.forEach((id) => {
      if (lit[id] === undefined && (p >= 1 || scanDeg >= byId[id].deg)) lit[id] = now;
    });

    // edges
    EDGES.forEach((pair) => {
      const n1 = byId[pair[0]], n2 = byId[pair[1]];
      const a = Math.min(nodeAlpha(n1, p), nodeAlpha(n2, p));
      if (a <= 0.01) return;
      const risky = (n1.type === "risk" && lit[n1.id] !== undefined) || (n2.type === "risk" && lit[n2.id] !== undefined);
      const P1 = px(n1, idle, nodeAlpha(n1, p)), P2 = px(n2, idle, nodeAlpha(n2, p));
      ctx.strokeStyle = risky ? C.edgeRisk : C.edge;
      ctx.globalAlpha = a;
      ctx.lineWidth = risky ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(P1.x, P1.y);
      ctx.lineTo(P2.x, P2.y);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // data-flow pulses travelling inward along edges (diligence feeding the centre)
    if (introDone && !REDUCED) {
      EDGES.forEach((pair, i) => {
        const n1 = byId[pair[0]], n2 = byId[pair[1]];
        const P1 = px(n1, idle, 1), P2 = px(n2, idle, 1);
        const t = ((now * 0.00020) + i * 0.137) % 1;
        const x = P2.x + (P1.x - P2.x) * t, y = P2.y + (P1.y - P2.y) * t;
        const risky = (n1.type === "risk" && lit[n1.id] !== undefined) || (n2.type === "risk" && lit[n2.id] !== undefined);
        ctx.fillStyle = risky ? "rgba(214,0,108,0.75)" : "rgba(20,24,31,0.5)";
        ctx.globalAlpha = Math.sin(t * Math.PI);
        ctx.beginPath(); ctx.arc(x, y, risky ? 1.9 : 1.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // nodes
    NODES.forEach((n) => {
      const a = nodeAlpha(n, p);
      if (a <= 0.01) return;
      const P = px(n, idle, a);
      const isLit = n.type === "risk" && lit[n.id] !== undefined;
      let r = n.type === "target" ? baseR * 1.7 : n.type === "risk" ? baseR * 1.25 : baseR;
      ctx.globalAlpha = a;

      // risk ping + pulse once lit
      if (isLit && !REDUCED) {
        const age = (now - lit[n.id]) / 1000;
        const ping = age % 2.6;
        if (ping < 1) {
          ctx.globalAlpha = a * (1 - ping) * 0.5;
          ctx.strokeStyle = C.mag;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(P.x, P.y, r + 2 + ping * 16, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = a;
        }
        r *= 1 + 0.10 * Math.sin(now * 0.005 + n.phase);
      }

      if (n.type === "target") {
        ctx.fillStyle = C.ink;
        ctx.beginPath(); ctx.arc(P.x, P.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(20,24,31,0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(P.x, P.y, r + 4, 0, Math.PI * 2); ctx.stroke();
      } else if (isLit) {
        ctx.fillStyle = C.mag;
        ctx.beginPath(); ctx.arc(P.x, P.y, r, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = C.bg;
        ctx.beginPath(); ctx.arc(P.x, P.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = n.type === "risk" ? "rgba(20,24,31,0.4)" : "rgba(20,24,31,0.55)";
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(P.x, P.y, r, 0, Math.PI * 2); ctx.stroke();
      }

      // label, flipped inward if it would overflow the frame (suppressed for the
      // target node while its name flies into the case-study heading)
      if (!(hideTarget && n.type === "target") && n.type !== "target") {
      const lab = n.label;
      setFont(n.type === "target" ? "700" : "600", n.type === "target" ? 12 : 10.5, "Archivo, system-ui, sans-serif");
      const tw = ctx.measureText(lab).width;
      let lx, align;
      if (n.x >= 0) { lx = P.x + r + 7; align = "left"; if (lx + tw > W - 6) { lx = P.x - r - 7; align = "right"; } }
      else { lx = P.x - r - 7; align = "right"; if (lx - tw < 6) { lx = P.x + r + 7; align = "left"; } }
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.fillStyle = isLit ? C.mag : n.type === "target" ? C.ink : C.body;
      ctx.fillText(lab, lx, P.y);
      }
    });
    ctx.globalAlpha = 1;

    // centre node name — drawn last, centred below the dot on a clean halo so no
    // edge or node ever cuts through it (suppressed while it flies to the heading)
    if (!hideTarget) {
      const t = byId["t"];
      const aT = nodeAlpha(t, p);
      if (aT > 0.01) {
        const P = px(t, idle, aT);
        const rr = baseR * 1.7;
        setFont("700", 12, "Archivo, system-ui, sans-serif");
        const lab = t.label;
        const tw = ctx.measureText(lab).width;
        const ly = P.y + rr + 13;
        ctx.globalAlpha = aT;
        ctx.fillStyle = "rgba(255,255,255,0.94)";
        roundRect(ctx, P.x - tw / 2 - 7, ly - 10, tw + 14, 20, 7);
        ctx.fill();
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = C.ink;
        ctx.fillText(lab, P.x, ly);
        ctx.globalAlpha = 1;
      }
    }

    // overlay chrome
    const litCount = Object.keys(lit).length;
    ctx.textBaseline = "alphabetic";
    setFont("400", 10.5, "'Times New Roman', Georgia, serif");
    ctx.textAlign = "left";
    ctx.fillStyle = C.mute;
    withLS("1.5px", () => ctx.fillText("DUE-DILIGENCE NETWORK", 16, 24));
    ctx.textAlign = "right";
    ctx.fillStyle = litCount > 0 ? C.mag : C.mute;
    withLS("1.5px", () => ctx.fillText((litCount ? litCount : "0") + " RISK FLAGS", W - 16, 24));
    ctx.fillStyle = "rgba(138,144,155,0.65)";
    setFont("400", 10, "'Source Serif 4', Georgia, serif");
    ctx.fillStyle = "rgba(138,144,155,0.7)";
    ctx.save();
    ctx.font = "italic 10px 'Source Serif 4', Georgia, serif";
    ctx.fillText("Illustrative", W - 16, H - 14);
    ctx.restore();

    if (!introDone && p >= 1) introDone = true;
  }

  function loop(now) {
    if (!startedVisible) {
      if (visible()) { startedVisible = true; startT = now; }
    }
    if (startedVisible) draw(now);
    raf = requestAnimationFrame(loop);
  }

  let startedVisible = false;
  function visible() {
    const r = host.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.width > 0 && r.bottom > vh * 0.12 && r.top < vh * 0.88;
  }

  resize();
  // initial synchronous paint so the frame is never blank before the loop ramps
  startT = performance.now();
  draw(startT);
  startT = 0;

  let rz;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { resize(); if (REDUCED && startedVisible) draw(performance.now() + INTRO_MS); }, 120); });

  if (REDUCED) {
    const tick = () => { if (visible()) { startedVisible = true; resize(); draw(performance.now() + INTRO_MS); } else requestAnimationFrame(tick); };
    tick();
  } else {
    raf = requestAnimationFrame(loop);
  }

  // verification hook (harmless): force a frame at a given progress
  window.__ddGraph = {
    draw: draw, resize: resize, lit: lit,
    force: function (ms) { startedVisible = true; startT = performance.now() - ms; draw(performance.now()); },
    setHideTarget: function (b) { hideTarget = !!b; },
    targetInfo: function () {
      const r = host.getBoundingClientRect();
      const t = byId["t"];
      const P = { x: cx + t.x * scale, y: cy + t.y * scale };
      const rr = baseR * 1.7;
      setFont("700", 12, "Archivo, system-ui, sans-serif");
      const tw = ctx.measureText(t.label).width;
      return { x: r.left + P.x - tw / 2, y: r.top + P.y + rr + 13, fs: 12, text: t.label };
    }
  };
})();
