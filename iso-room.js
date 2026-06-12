/* iso-room.js — Screen 4 illustration behaviour. Builds the layered 2.5D
   scene inside #room3d-host and drives the one-shot zoom in image space:
   progress 0 = the monitor screen exactly fills the viewport (the live DOM
   Research Console sits on it), progress 1 = full illustration. Exposes the
   same contract transition.js already uses:
     setProgress(r) · setParallax(x,y) · screenRect() · personReveal(k)      */
(function () {
  "use strict";
  const host = document.getElementById("room3d-host");
  if (!host) return;

  const DW = 1672, DH = 941;
  const MON = { left: 535, top: 255, width: 565, height: 292 };
  const USE_ASSET_ROOM = true;

  if (USE_ASSET_ROOM) {
    const s4 = document.querySelector(".s4");
    if (s4) s4.classList.add("s4-asset-mode");
    host.innerHTML = [
      '<div class="iso-asset-backdrop" aria-hidden="true">',
      '  <img src="assets/s4-workspace-clean.png" alt="" />',
      '</div>',
      '<div class="iso-asset-haze" aria-hidden="true"></div>',
      '<div class="iso-stage iso-asset-stage" id="iso-stage">',
      '  <img class="iso-asset-edge" src="assets/s4-workspace-clean.png" alt="" aria-hidden="true" />',
      '  <div class="iso-asset-frame">',
      '    <img class="iso-asset-img" src="assets/s4-workspace-clean.png" alt="" aria-hidden="true" />',
      '  </div>',
      '</div>',
    ].join("\n");

    const stage = document.getElementById("iso-stage");
    let progress = 0, parX = 0, parY = 0;
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const lerp = (a, b, k) => a + (b - a) * k;

    function layout() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const e = easeIO(progress);
      const k1 = Math.min(1, vw / DW, vh / DH);
      const k0 = Math.max(vw / MON.width, vh / MON.height);
      const k = k0 * Math.pow(k1 / k0, e);
      const monCx = MON.left + MON.width / 2, monCy = MON.top + MON.height / 2;
      const cx1 = monCx * k1 + (vw - DW * k1) / 2;
      const cy1 = monCy * k1 + (vh - DH * k1) / 2;
      const cx = lerp(vw / 2, cx1, e) + parX * -8 * e;
      const cy = lerp(vh / 2, cy1, e) + parY * -5 * e;
      const tx = cx - monCx * k, ty = cy - monCy * k;
      stage.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + k + ")";
      return { k, tx, ty, vw, vh };
    }

    function screenRect() {
      const m = layout();
      const raw = {
        left: MON.left * m.k + m.tx,
        top: MON.top * m.k + m.ty,
        width: MON.width * m.k,
        height: MON.height * m.k,
      };
      const b = clamp01(progress * 4);
      const r = {
        left: lerp(0, raw.left, b),
        top: lerp(0, raw.top, b),
        width: lerp(m.vw, raw.width, b),
        height: lerp(m.vh, raw.height, b),
      };
      r.cx = r.left + r.width / 2;
      r.cy = r.top + r.height / 2;
      return r;
    }

    function assetRect(box) {
      const m = layout();
      return {
        left: box.left * m.k + m.tx,
        top: box.top * m.k + m.ty,
        width: box.width * m.k,
        height: box.height * m.k,
      };
    }

    setInterval(layout, 16);
    window.addEventListener("resize", layout);
    window.__room3d = {
      setProgress(r) { progress = clamp01(r); },
      setParallax(x, y) { parX = x; parY = y; },
      screenRect,
      assetRect,
      personReveal() {},
    };
    return;
  }

  // ── scene markup ───────────────────────────────────────────────────────────
  const personSVG = [
    '<svg viewBox="0 0 372 560" fill="none" aria-hidden="true">',
    '<defs>',
    '<linearGradient id="iso-shirt" x1="86" y1="196" x2="286" y2="400" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f1ead8"></stop><stop offset="1" stop-color="#d9cfb7"></stop></linearGradient>',
    '<linearGradient id="iso-chair" x1="104" y1="240" x2="272" y2="432" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#333c4b"></stop><stop offset="1" stop-color="#202833"></stop></linearGradient>',
    '<linearGradient id="iso-hair" x1="134" y1="58" x2="238" y2="172" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#303b4a"></stop><stop offset="0.58" stop-color="#18202b"></stop><stop offset="1" stop-color="#111821"></stop></linearGradient>',
    '</defs>',
    // floor shadow
    '<ellipse cx="186" cy="536" rx="150" ry="17" fill="rgba(28,36,52,0.16)"></ellipse>',
    // chair base
    '<g stroke="#2c3340" stroke-width="11" stroke-linecap="round">',
    '<path d="M186 506 L100 530"></path><path d="M186 506 L272 530"></path>',
    '<path d="M186 506 L138 538"></path><path d="M186 506 L234 538"></path>',
    '</g>',
    '<circle cx="96" cy="532" r="8" fill="#2c3340"></circle><circle cx="276" cy="532" r="8" fill="#2c3340"></circle>',
    '<circle cx="134" cy="540" r="8" fill="#2c3340"></circle><circle cx="238" cy="540" r="8" fill="#2c3340"></circle>',
    '<rect x="177" y="448" width="18" height="62" rx="6" fill="#39414f"></rect>',
    // breathing group: torso + head
    '<g class="breathe">',
    // upper arms peeking outside the chair back
    '<path d="M84 256 C70 268 60 304 62 350 C63 368 76 376 88 370 C96 366 98 348 96 326 C94 300 96 274 102 258 Z" fill="#d6cdb8"></path>',
    '<path d="M288 256 C302 268 312 304 310 350 C309 368 296 376 284 370 C276 366 274 348 276 326 C278 300 276 274 270 258 Z" fill="#d6cdb8"></path>',
    // torso (cream sweater)
    '<path d="M86 318 C82 246 110 196 186 196 C262 196 290 246 286 318 L286 400 L86 400 Z" fill="url(#iso-shirt)"></path>',
    '<path d="M86 318 C84 268 98 224 136 206 C112 232 104 280 106 330 L106 400 L86 400 Z" fill="rgba(28,36,52,0.06)"></path>',
    '<path d="M122 238 C142 258 162 268 186 268 C210 268 232 258 250 238" stroke="rgba(255,255,255,0.42)" stroke-width="4" stroke-linecap="round"></path>',
    '<path d="M186 232 L186 392" stroke="rgba(28,36,52,0.06)" stroke-width="3" stroke-linecap="round"></path>',
    '<path d="M132 210 C146 228 160 237 186 238 C212 237 226 228 240 210" stroke="rgba(28,36,52,0.08)" stroke-width="2" stroke-linecap="round"></path>',
    // collar + neck + head
    '<path d="M150 208 C150 196 222 196 222 208 L218 224 L154 224 Z" fill="#d9d0ba"></path>',
    '<rect x="168" y="160" width="36" height="38" rx="12" fill="#cfae93"></rect>',
    '<ellipse cx="186" cy="118" rx="53" ry="59" fill="url(#iso-hair)"></ellipse>',
    '<path d="M134 130 C132 86 156 60 186 60 C216 60 240 86 238 130 C238 108 222 92 186 92 C150 92 134 108 134 130 Z" fill="#2c3543"></path>',
    '<path d="M148 128 C154 92 168 72 188 64" stroke="rgba(255,255,255,0.10)" stroke-width="4" stroke-linecap="round"></path>',
    '<path d="M170 76 C166 104 160 128 146 152" stroke="rgba(0,0,0,0.24)" stroke-width="3" stroke-linecap="round"></path>',
    '<path d="M188 66 C190 96 188 126 180 158" stroke="rgba(0,0,0,0.26)" stroke-width="3" stroke-linecap="round"></path>',
    '<path d="M210 76 C218 104 222 130 224 154" stroke="rgba(0,0,0,0.22)" stroke-width="3" stroke-linecap="round"></path>',
    '<circle cx="132" cy="132" r="8" fill="#cfae93"></circle><circle cx="240" cy="132" r="8" fill="#cfae93"></circle>',
    '</g>',
    // chair back (in front of torso) + armrests
    '<path d="M104 282 C104 252 134 240 186 240 C238 240 268 252 268 282 L272 396 C272 420 248 432 186 432 C124 432 100 420 100 396 Z" fill="url(#iso-chair)"></path>',
    '<path d="M118 286 C118 264 144 256 186 256 C228 256 254 264 254 286 L257 390 C257 408 236 416 186 416 C136 416 115 408 115 390 Z" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="3"></path>',
    '<path d="M138 300 C148 286 162 280 186 280 C210 280 224 286 234 300 L238 390 C238 402 220 408 186 408 C152 408 134 402 134 390 Z" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.05)" stroke-width="2"></path>',
    '<path d="M122 334 L96 338 M250 334 L276 338" stroke="rgba(255,255,255,0.11)" stroke-width="3" stroke-linecap="round"></path>',
    '<rect x="58" y="330" width="40" height="13" rx="6" fill="#39414f"></rect>',
    '<rect x="274" y="330" width="40" height="13" rx="6" fill="#39414f"></rect>',
    '<rect x="72" y="343" width="10" height="36" rx="4" fill="#39414f"></rect>',
    '<rect x="290" y="343" width="10" height="36" rx="4" fill="#39414f"></rect>',
    // seat
    '<path d="M96 430 C96 418 130 412 186 412 C242 412 276 418 276 430 L276 442 C276 454 242 460 186 460 C130 460 96 454 96 442 Z" fill="#333b48"></path>',
    '</svg>',
  ].join("");

  const plantSVG = [
    '<svg viewBox="0 0 240 420" fill="none" aria-hidden="true">',
    '<ellipse cx="120" cy="404" rx="86" ry="13" fill="rgba(28,36,52,0.14)"></ellipse>',
    '<g>',
    '<path d="M120 300 C92 252 60 240 28 248 C58 268 84 292 104 322 Z" fill="#7d9070"></path>',
    '<path d="M120 300 C148 252 180 240 212 248 C182 268 156 292 136 322 Z" fill="#93a585"></path>',
    '<path d="M114 310 C94 230 96 160 120 96 C144 160 146 230 126 310 Z" fill="#86997a"></path>',
    '<path d="M116 308 C84 262 56 200 60 132 C96 176 116 240 124 304 Z" fill="#6f8464"></path>',
    '<path d="M124 308 C156 262 184 200 180 132 C144 176 124 240 116 304 Z" fill="#7d9070"></path>',
    '<path d="M118 312 C106 270 84 246 52 238 C72 274 96 300 112 330 Z" fill="#93a585"></path>',
    '<path d="M122 312 C134 270 156 246 188 238 C168 274 144 300 128 330 Z" fill="#86997a"></path>',
    '</g>',
    '<path d="M84 318 L156 318 L148 404 L92 404 Z" fill="#f0eee8"></path>',
    '<path d="M84 318 L156 318 L154 340 L86 340 Z" fill="rgba(28,36,52,0.07)"></path>',
    '</svg>',
  ].join("");

  const printSVG = [
    '<svg viewBox="0 0 130 140" fill="none" aria-hidden="true">',
    '<line x1="6" y1="118" x2="124" y2="118" stroke="rgba(28,36,52,0.12)"></line>',
    '<line x1="6" y1="80" x2="124" y2="80" stroke="rgba(28,36,52,0.07)"></line>',
    '<line x1="6" y1="42" x2="124" y2="42" stroke="rgba(28,36,52,0.07)"></line>',
    [[14, 56, 30, "#5f7ea8"], [33, 30, 44, "#b06a63"], [52, 44, 36, "#5f7ea8"], [71, 20, 34, "#5f7ea8"], [90, 38, 46, "#b06a63"], [109, 26, 30, "#5f7ea8"]].map(function (b) {
      return '<line x1="' + (b[0] + 4) + '" y1="' + (b[1] - 12) + '" x2="' + (b[0] + 4) + '" y2="' + (b[1] + b[2] + 12) + '" stroke="' + b[3] + '" stroke-width="2"></line>' +
        '<rect x="' + b[0] + '" y="' + b[1] + '" width="9" height="' + b[2] + '" rx="1" fill="' + b[3] + '"></rect>';
    }).join(""),
    '</svg>',
  ].join("");

  const globeSVG = [
    '<svg viewBox="0 0 70 92" fill="none" aria-hidden="true">',
    '<defs><radialGradient id="iso-glb" cx="0.36" cy="0.32" r="0.85">',
    '<stop offset="0" stop-color="#c2d1e0"></stop><stop offset="1" stop-color="#90a5bc"></stop></radialGradient></defs>',
    '<circle cx="35" cy="34" r="26" fill="url(#iso-glb)"></circle>',
    '<ellipse cx="35" cy="34" rx="11" ry="26" stroke="rgba(255,255,255,0.45)" fill="none"></ellipse>',
    '<path d="M9.5 34 a 25.5 25.5 0 0 0 51 0" stroke="rgba(255,255,255,0.4)" fill="none"></path>',
    '<path d="M14 16 a 30 30 0 0 1 0 38" stroke="#4a5363" stroke-width="3.5" fill="none"></path>',
    '<rect x="30" y="60" width="10" height="14" fill="#4a5363"></rect>',
    '<rect x="20" y="74" width="30" height="7" rx="3" fill="#4a5363"></rect>',
    '</svg>',
  ].join("");

  const bullSVG = [
    '<svg viewBox="0 0 74 50" fill="none" aria-hidden="true">',
    '<rect x="4" y="42" width="66" height="7" rx="2.5" fill="#14171c"></rect>',
    '<ellipse cx="34" cy="27" rx="24" ry="13" fill="#a8895c"></ellipse>',
    '<circle cx="56" cy="18" r="9" fill="#a8895c"></circle>',
    '<path d="M60 9 C64 3 70 2 73 4 C69 6 66 9 65 13 Z" fill="#8d7148"></path>',
    '<path d="M52 8 C50 2 44 0 40 2 C44 4 47 8 48 12 Z" fill="#8d7148"></path>',
    '<rect x="16" y="34" width="6" height="10" rx="2.5" fill="#96794e"></rect>',
    '<rect x="30" y="36" width="6" height="8" rx="2.5" fill="#96794e"></rect>',
    '<rect x="44" y="34" width="6" height="10" rx="2.5" fill="#96794e"></rect>',
    '<path d="M11 24 C5 22 3 17 5 13 C8 17 10 19 14 20 Z" fill="#8d7148"></path>',
    '</svg>',
  ].join("");

  const shelfPlantSVG = [
    '<svg viewBox="0 0 50 70" fill="none" aria-hidden="true">',
    '<path d="M25 40 C18 26 10 22 2 24 C10 30 16 36 21 46 Z" fill="#7d9070"></path>',
    '<path d="M25 40 C32 26 40 22 48 24 C40 30 34 36 29 46 Z" fill="#93a585"></path>',
    '<path d="M23 42 C20 26 21 14 25 4 C29 14 30 26 27 42 Z" fill="#86997a"></path>',
    '<path d="M15 44 L35 44 L32 66 L18 66 Z" fill="#d8d2c6"></path>',
    '</svg>',
  ].join("");

  host.innerHTML = [
    '<div class="iso-stage" id="iso-stage">',
    '  <div class="lyr lyr-room">',
    '    <div class="iso-wall"></div>',
    '    <div class="iso-base"></div>',
    '    <div class="iso-floor"></div>',
    '  </div>',
    '  <div class="lyr lyr-decor">',
    '    <div class="iso-print">' + printSVG + '<span class="cap">MKT \u00b7 FIG</span></div>',
    '    <div class="iso-print2"></div>',
    '    <div class="iso-wall-shelf">',
    '      <div class="ws-plank"></div>',
    '      <div class="ws-globe">' + globeSVG + '</div>',
    '      <div class="ws-bookrow"><i></i><i></i><i></i><i></i><i></i></div>',
    '      <div class="ws-stack"><b></b><b></b></div>',
    '    </div>',
    '    <div class="iso-shelf">',
    '      <div class="rail mid"></div>',
    '      <div class="cell c1"></div><div class="cell c2"></div>',
    '      <div class="lip l0"></div><div class="lip l1"></div><div class="lip l2"></div><div class="lip l3"></div>',
      '      <div class="ledstrip s1"></div><div class="ledstrip s2"></div>',
      '      <div id="iso-books"></div>',
      '      <div class="iso-globe" style="left:236px;top:66px;width:70px;height:92px;">' + globeSVG + '</div>',
    '      <div class="iso-shelfplant" style="left:24px;top:252px;width:50px;height:70px;">' + shelfPlantSVG + '</div>',
    '    </div>',
    '    <div class="iso-plant">' + plantSVG + '</div>',
    '  </div>',
    '  <div class="lyr lyr-desk">',
    '    <div class="iso-rug"></div>',
    '    <div class="sh iso-room-shadow"></div>',
    '    <div class="iso-leg rear-l"></div>',
    '    <div class="iso-leg rear-r"></div>',
    '    <div class="iso-desk-top"></div>',
    '    <div class="iso-glow"></div>',
    '    <div class="iso-monitor"></div>',
    '    <div class="iso-screen" id="iso-screen"><canvas id="iso-console" width="1280" height="800"></canvas></div>',
    '    <div class="iso-mon-chin"></div>',
    '    <div class="iso-mon-led"></div>',
    '    <div class="iso-mon-neck"></div>',
    '    <div class="iso-mon-foot"></div>',
    '    <div class="iso-keyboard"></div>',
    '    <div class="iso-mouse"></div>',
    '    <div class="iso-mug"></div>',
    '    <div class="iso-notebook"></div>',
    '    <div class="iso-pen"></div>',
    '    <div class="iso-deskbooks"><div class="b b1"></div><div class="b b2"></div><div class="b b3"></div></div>',
    '    <div class="iso-bull">' + bullSVG + '</div>',
    '    <div class="iso-paper"><div class="h">INVESTOR\u2019S<br>BUSINESS DAILY</div><div class="bars"><i style="height:7px;background:#5f7ea8"></i><i style="height:12px;background:#b06a63"></i><i style="height:9px;background:#5f7ea8"></i><i style="height:15px;background:#5f7ea8"></i></div></div>',
    '    <div class="iso-lamp"><div class="arm"></div><div class="base"></div><div class="head"></div><div class="lite"></div></div>',
    '    <div class="iso-desk-front"></div>',
    '    <div class="iso-leg l"></div>',
    '    <div class="iso-leg r"></div>',
    '  </div>',
    '  <div class="lyr lyr-person"><div class="iso-person">' + personSVG + '</div></div>',
    '</div>',
  ].join("\n");

  // shelf books (two rows, varied heights/colors, one leaning)
  (function () {
    const cont = document.getElementById("iso-books");
    const cols = ["#55677f", "#96775f", "#bfb398", "#66727f", "#7f8c72", "#39434f", "#a6906f", "#76879c"];
    let html = "";
    function row(bottomY, xStart, n, seed, leanLast) {
      let x = xStart;
      for (let i = 0; i < n; i++) {
        const bw = 13 + Math.abs(Math.sin(seed + i * 2.7)) * 9;
        const bh = 64 + Math.abs(Math.sin(seed * 3 + i * 1.9)) * 34;
        const lean = leanLast && i === n - 1 ? "transform:rotate(9deg);transform-origin:bottom right;" : "";
        html += '<div class="iso-book" style="left:' + x.toFixed(1) + "px;bottom:" + bottomY + "px;width:" + bw.toFixed(1) + "px;height:" + bh.toFixed(1) + "px;background:" + cols[(i + seed) % cols.length] + ";" + lean + '"></div>';
        x += bw + 4;
      }
    }
    row(178, 22, 8, 1, true);   // upper cell (bottom offset from shelf container)
    row(14, 22, 7, 4, false);   // lower cell, left
    // flat stack lower-right
    html += '<div class="iso-bookflat" style="left:218px;bottom:14px;width:74px;height:12px;background:#bfb398;"></div>';
    html += '<div class="iso-bookflat" style="left:222px;bottom:26px;width:66px;height:11px;background:#55677f;"></div>';
    html += '<div class="iso-bookflat" style="left:220px;bottom:37px;width:60px;height:10px;background:#96775f;"></div>';
    cont.innerHTML = html;
  })();

  // ── mini Research Console on the monitor (canvas) ──────────────────────────
  const cv = document.getElementById("iso-console");
  (function drawConsole() {
    const c = cv.getContext("2d");
    const W = 1280, H = 800;
    const line = "rgba(28,36,52,0.12)", soft = "#44505f", mute = "#79828f", acc = "#2f5fa8", navy = "#1b2230";
    c.fillStyle = "#f8f9fb"; c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(47,95,168,0.06)"; c.fillRect(0, 0, W, 98);
    c.fillStyle = mute; c.font = "11px monospace"; c.fillText("03   /   EMPIRICAL RESEARCH", 26, 30);
    c.fillStyle = navy; c.font = "600 30px Georgia"; c.fillText("Research Console", 24, 64);
    c.fillStyle = soft; c.font = "13px Georgia"; c.fillText("From data to insight - empirical analysis.", 24, 88);
    c.strokeStyle = "rgba(47,95,168,0.22)"; c.lineWidth = 2; c.beginPath(); c.moveTo(24, 98); c.lineTo(1256, 98); c.stroke();
    c.fillStyle = acc; c.beginPath(); c.arc(1130, 26, 3, 0, 7); c.fill();
    c.fillStyle = mute; c.font = "10px monospace"; c.fillText("RESEARCH ACTIVE", 1142, 30);
    const panel = (x, y, w, h) => {
      c.save();
      c.shadowColor = "rgba(20,28,44,0.08)";
      c.shadowBlur = 12;
      c.shadowOffsetY = 5;
      c.fillStyle = "#ffffff";
      c.strokeStyle = line;
      c.lineWidth = 1;
      c.beginPath();
      c.roundRect(x, y, w, h, 10);
      c.fill();
      c.shadowColor = "transparent";
      c.stroke();
      c.restore();
    };
    panel(20, 104, 248, 596);
    c.fillStyle = mute; c.font = "10px monospace"; c.fillText("RESEARCH PROJECTS", 36, 130);
    ["Red Sea Shipping Crisis", "Social Capital & Fairness RCT", "COVID-19 & Intertemporal", "Advertising & Fertility"].forEach(function (tname, i) {
      const y = 148 + i * 92;
      if (i === 0) { c.fillStyle = "rgba(47,95,168,0.09)"; c.fillRect(22, y - 18, 244, 84); }
      c.fillStyle = i === 0 ? acc : "#1b2230"; c.font = (i === 0 ? "600 " : "") + "14px Georgia";
      c.fillText(tname, 36, y + 6);
      c.strokeStyle = line; [0, 1, 2].forEach(function (j) { c.strokeRect(36 + j * 64, y + 22, 56, 16); });
      c.beginPath(); c.moveTo(22, y + 66); c.lineTo(266, y + 66); c.stroke();
    });
    panel(282, 104, 620, 360);
    c.fillStyle = navy; c.font = "600 15px Georgia"; c.fillText("Event Study - Port Exposure to Red Sea Disruption", 300, 132);
    c.fillStyle = "rgba(47,95,168,0.05)"; c.fillRect(600, 150, 286, 286);
    c.strokeStyle = line;
    for (let i = 0; i < 6; i++) { const y = 168 + i * 50; c.beginPath(); c.moveTo(330, y); c.lineTo(886, y); c.stroke(); }
    const es = [[0.04, 0], [-0.05, 0], [0.0, 0], [0.05, 0], [-0.02, 0], [0.01, 0], [-0.3, 1], [-0.62, 1], [-0.95, 1], [-0.8, 1], [-0.55, 1], [-0.3, 1], [-0.18, 1]];
    es.forEach(function (pt, i) {
      const x = 348 + i * 42, y0 = 250, y = y0 - pt[0] * 140;
      c.strokeStyle = acc; c.globalAlpha = 0.55; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x, y - 38); c.lineTo(x, y + 38); c.stroke();
      c.beginPath(); c.moveTo(x - 5, y - 38); c.lineTo(x + 5, y - 38); c.moveTo(x - 5, y + 38); c.lineTo(x + 5, y + 38); c.stroke();
      c.globalAlpha = 1;
      c.beginPath(); c.arc(x, y, 5.5, 0, 7);
      if (pt[1]) { c.fillStyle = acc; c.fill(); } else { c.fillStyle = "#fff"; c.fill(); c.strokeStyle = acc; c.stroke(); }
    });
    panel(282, 478, 332, 222);
    c.fillStyle = mute; c.font = "9px monospace"; c.fillText("GLOBAL SHIPPING NETWORK - TOP CORRIDORS", 298, 502);
    c.strokeStyle = "rgba(47,95,168,0.5)"; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(320, 560); c.quadraticCurveTo(420, 540, 470, 590); c.quadraticCurveTo(530, 640, 580, 600); c.stroke();
    c.setLineDash([4, 4]); c.beginPath(); c.moveTo(320, 560); c.quadraticCurveTo(400, 660, 540, 650); c.stroke(); c.setLineDash([]);
    [[320, 560], [470, 590], [580, 600], [540, 650]].forEach(function (p, i) {
      c.beginPath(); c.arc(p[0], p[1], 4.5, 0, 7);
      c.fillStyle = i === 1 ? acc : "#fff"; c.fill(); c.strokeStyle = acc; c.stroke();
    });
    panel(628, 478, 274, 222);
    c.fillStyle = mute; c.font = "9px monospace"; c.fillText("PANEL DATA OVERVIEW", 644, 502);
    [[1, "+0.95"], [0.2, "+0.10"], [-0.7, "-0.40"]].forEach(function (g, i) {
      const y = 540 + i * 52;
      c.strokeStyle = acc; c.lineWidth = 1.6; c.beginPath();
      for (let j = 0; j < 8; j++) {
        const x = 648 + j * 22, yy = y + 18 - Math.sin(j / 7 * Math.PI) * 16 * g[0];
        j ? c.lineTo(x, yy) : c.moveTo(x, yy);
      }
      c.stroke();
      c.fillStyle = g[0] > 0.3 ? "#5f7ea8" : g[0] < -0.3 ? "#b06a63" : "#1b2230";
      c.font = "11px monospace"; c.fillText(g[1], 838, y + 22);
    });
    panel(916, 104, 344, 596);
    c.fillStyle = mute; c.font = "10px monospace"; c.fillText("PROJECT DETAILS", 934, 130);
    c.fillStyle = navy; c.font = "14px Georgia";
    c.fillText("How do ports reallocate trade", 934, 168); c.fillText("flows when a major maritime", 934, 188); c.fillText("chokepoint is disrupted?", 934, 208);
    ["DATA", "IDENTIFICATION", "KEY FINDINGS", "ROBUSTNESS"].forEach(function (s, i) {
      const y = 244 + i * 110;
      c.fillStyle = mute; c.font = "9px monospace"; c.fillText(s, 934, y);
      c.fillStyle = "rgba(68,80,95,0.75)";
      for (let j = 0; j < 3; j++) c.fillRect(934, y + 12 + j * 20, 240 - j * 40, 6);
    });
    panel(20, 714, 1240, 66);
    ["175  PORTS", "3  CORRIDORS", "2019-2024  PANEL", "DID + 3-DIFF", "200-ROUND  PLACEBO"].forEach(function (s, i) {
      const x = 48 + i * 248;
      c.fillStyle = "#1b2230"; c.font = "500 18px monospace"; c.fillText(s.split("  ")[0], x, 748);
      c.fillStyle = mute; c.font = "9px monospace"; c.fillText(s.split("  ")[1] || "", x, 766);
      if (i) { c.strokeStyle = line; c.beginPath(); c.moveTo(x - 28, 722); c.lineTo(x - 28, 772); c.stroke(); }
    });
  })();

  // ── zoom choreography (image-space camera) ─────────────────────────────────
  const stage = document.getElementById("iso-stage");
  const decor = host.querySelector(".lyr-decor");
  const personL = host.querySelector(".lyr-person");

  let progress = 0, parX = 0, parY = 0;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, k) => a + (b - a) * k;

  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const e = easeIO(progress);
    // end: whole illustration fits (contain); start: screen covers viewport
    const k1 = Math.min(vw / DW, vh / DH);
    const k0 = Math.max(vw / MON.width, vh / MON.height);
    const k = k0 * Math.pow(k1 / k0, e);
    const monCx = MON.left + MON.width / 2, monCy = MON.top + MON.height / 2;
    // monitor centre: viewport centre → its natural place in the fitted stage
    const cx1 = monCx * k1 + (vw - DW * k1) / 2;
    const cy1 = monCy * k1 + (vh - DH * k1) / 2;
    const px = parX * -8 * e, py = parY * -5 * e;
    const cx = lerp(vw / 2, cx1, e) + px;
    const cy = lerp(vh / 2, cy1, e) + py;
    const tx = cx - monCx * k, ty = cy - monCy * k;
    stage.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + k + ")";
    // layered parallax (decor drifts more, person least)
    if (decor) decor.style.transform = "translate(" + (parX * -7 * e) + "px," + (parY * -4 * e) + "px)";
    if (personL) personL.style.transform = "translate(" + (parX * 3.5 * e) + "px," + (parY * 2 * e) + "px)";
    return { k, tx, ty, vw, vh };
  }

  function screenRect() {
    const m = layout();
    const raw = {
      left: MON.left * m.k + m.tx,
      top: MON.top * m.k + m.ty,
      width: MON.width * m.k,
      height: MON.height * m.k,
    };
    // blend from an exact-viewport rect at progress 0 (screen aspect ≠ viewport)
    const b = clamp01(progress * 4);
    const r = {
      left: lerp(0, raw.left, b),
      top: lerp(0, raw.top, b),
      width: lerp(m.vw, raw.width, b),
      height: lerp(m.vh, raw.height, b),
    };
    r.cx = r.left + r.width / 2;
    r.cy = r.top + r.height / 2;
    return r;
  }

  setInterval(layout, 16); // keeps parallax alive while parked on Screen 4
  window.addEventListener("resize", layout);

  window.__room3d = {
    setProgress(r) { progress = clamp01(r); },
    setParallax(x, y) { parX = x; parY = y; },
    screenRect,
    personReveal(k) { cv.style.opacity = String(k); },
  };
})();
