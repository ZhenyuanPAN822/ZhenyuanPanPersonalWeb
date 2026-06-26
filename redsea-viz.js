/* redsea-viz.js : restrained, library-free interactive layers for the Red Sea
   research case study. INDEPENDENT of the paper PNGs (those are untouched);
   these widgets only complete what a single static figure cannot show.

   Nothing is fabricated. The rerouting explorer is pure schematic geometry
   (clearly labelled). The evidence explorer reads only coefficients and
   p-values already reported in the article tables.

   Exposes window.__redseaViz.init(scroller). All interaction is event-driven
   (pointer / throttled scroll) with no persistent animation loop, and respects
   prefers-reduced-motion. */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function dist(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
  function u(px) { return Math.round(px / 6); } // schematic display units

  /* ---------------------------------------------------------------- reroute */
  function buildReroute(box) {
    // schematic geometry (Europe / Africa / Arabia / Asia), viewBox 720x470
    var SUEZ = [392, 168], REF = [176, 150], CAPE = [330, 420];
    var P = [560, 210]; // draggable example port (starts: South Asia gateway)
    var land = "#eef1f4", landStroke = "rgba(20,24,31,0.12)", ocean = "#dCE8F1";

    box.innerHTML =
      '<div class="rs-iv-head"><span class="rs-iv-tag">Interactive</span>' +
      '<span class="rs-iv-title">Rerouting-penalty explorer</span></div>' +
      '<p class="rs-iv-lede">Drag the <b>example port</b> anywhere in the ocean. The two stylized routes and the geographic-exposure value update live, so the formula is visible as geometry rather than a single fixed example.</p>' +
      '<div class="rs-iv-stage">' +
        '<div class="rs-iv-mapwrap"></div>' +
        '<div class="rs-iv-panel">' +
          '<div class="rs-iv-presets"><span>Try:</span>' +
            '<button type="button" data-px="430" data-py="178">Near Suez</button>' +
            '<button type="button" data-px="560" data-py="210">South Asia</button>' +
            '<button type="button" data-px="660" data-py="250">East Asia</button>' +
          '</div>' +
          '<div class="rs-iv-route suez"><span class="rs-iv-rk">via Suez</span><span class="rs-iv-rv" data-k="suez">0</span><span class="rs-iv-ru">= d(P,Suez) + d(Suez,Ref)</span></div>' +
          '<div class="rs-iv-route cape"><span class="rs-iv-rk">via Cape</span><span class="rs-iv-rv" data-k="cape">0</span><span class="rs-iv-ru">= d(P,Cape) + d(Cape,Ref)</span></div>' +
          '<div class="rs-iv-exp"><div class="rs-iv-expk">E<sub>geo,raw</sub> = max( via Cape &minus; via Suez , 0 )</div>' +
            '<div class="rs-iv-bar"><i></i><span class="rs-iv-expv" data-k="exp">0</span></div>' +
            '<div class="rs-iv-expn" data-k="lvl">Move the port to compare exposure.</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="rs-iv-foot">Schematic and not to scale. Distances are great-circle-style proxies in schematic units; the live value illustrates the construction in Eq. (2)-(3), not a port\u2019s estimated kilometres.</div>';

    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 720 470");
    svg.setAttribute("class", "rs-iv-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Drag the example port to compare via-Suez and via-Cape routes");
    function path(d, cls) { var p = document.createElementNS(NS, "path"); p.setAttribute("d", d); if (cls) p.setAttribute("class", cls); return p; }
    function setAttrs(n, o) { for (var k in o) n.setAttribute(k, o[k]); return n; }

    var bg = setAttrs(document.createElementNS(NS, "rect"), { x: 0, y: 0, width: 720, height: 470, fill: ocean });
    svg.appendChild(bg);
    var g = document.createElementNS(NS, "g");
    setAttrs(g, { fill: land, stroke: landStroke, "stroke-width": 1 });
    g.appendChild(path("M110,20 L380,20 L380,95 Q330,108 300,104 Q250,118 210,150 Q150,150 120,120 Q96,80 110,20 Z"));
    g.appendChild(path("M210,150 Q250,140 300,150 Q360,150 380,185 Q372,250 345,300 Q336,360 330,418 Q300,360 275,300 Q235,250 215,205 Q205,178 210,150 Z"));
    g.appendChild(path("M380,95 L520,70 Q560,90 540,140 Q470,150 410,190 Q388,168 380,150 Q378,120 380,95 Z"));
    g.appendChild(path("M520,70 L712,40 L712,210 Q640,215 600,235 Q575,210 560,206 L556,206 Q548,250 532,236 Q520,205 520,175 Q548,150 540,140 Q560,90 520,70 Z"));
    svg.appendChild(g);

    var capeRoute = path("", "rs-iv-rt cape");
    var suezRoute = path("", "rs-iv-rt suez");
    svg.appendChild(capeRoute);
    svg.appendChild(suezRoute);

    function node(x, y, r, cls) { var c = document.createElementNS(NS, "circle"); setAttrs(c, { cx: x, cy: y, r: r, class: cls }); return c; }
    function label(x, y, t, anchor, cls) { var tx = document.createElementNS(NS, "text"); setAttrs(tx, { x: x, y: y, "text-anchor": anchor || "start", class: "rs-iv-mlab " + (cls || "") }); tx.textContent = t; return tx; }
    svg.appendChild(node(REF[0], REF[1], 5, "rs-iv-fix"));
    svg.appendChild(node(SUEZ[0], SUEZ[1], 5, "rs-iv-fix"));
    svg.appendChild(node(CAPE[0], CAPE[1], 5, "rs-iv-fix"));
    svg.appendChild(label(REF[0] - 9, REF[1] - 9, "Reference", "end"));
    svg.appendChild(label(SUEZ[0] + 9, SUEZ[1] - 8, "Suez Canal", "start"));
    svg.appendChild(label(CAPE[0], CAPE[1] + 22, "Cape of Good Hope", "middle"));
    var halo = node(P[0], P[1], 13, "rs-iv-phalo");
    var port = node(P[0], P[1], 7, "rs-iv-port");
    var plab = label(P[0] + 12, P[1] - 10, "Example port (P)", "start", "port");
    svg.appendChild(halo); svg.appendChild(port); svg.appendChild(plab);

    box.querySelector(".rs-iv-mapwrap").appendChild(svg);

    var rv = {}; box.querySelectorAll("[data-k]").forEach(function (n) { rv[n.getAttribute("data-k")] = n; });
    var barFill = box.querySelector(".rs-iv-bar i");
    var EXP_MAX = 120; // schematic-unit ceiling for the bar

    function recompute() {
      var viaSuez = dist(P, SUEZ) + dist(SUEZ, REF);
      var viaCape = dist(P, CAPE) + dist(CAPE, REF);
      var rawPx = Math.max(viaCape - viaSuez, 0);
      var sU = u(viaSuez), cU = u(viaCape), eU = u(rawPx);
      rv.suez.textContent = sU + " u";
      rv.cape.textContent = cU + " u";
      rv.exp.textContent = eU + " u";
      var frac = Math.max(0, Math.min(1, eU / EXP_MAX));
      barFill.style.width = (frac * 100).toFixed(1) + "%";
      var lvl = eU < 8 ? "Low Suez dependence \u2014 the Cape detour adds little." :
                eU < 35 ? "Moderate exposure \u2014 a meaningful rerouting penalty." :
                "High exposure \u2014 strong dependence on the Suez corridor.";
      rv.lvl.textContent = lvl;
      rv.lvl.className = "rs-iv-expn " + (eU < 8 ? "lo" : eU < 35 ? "mid" : "hi");
      capeRoute.setAttribute("d", "M" + P[0] + "," + P[1] + " Q470,330 " + CAPE[0] + "," + CAPE[1] + " Q232,300 " + REF[0] + "," + REF[1]);
      suezRoute.setAttribute("d", "M" + P[0] + "," + P[1] + " Q474,182 " + SUEZ[0] + "," + SUEZ[1] + " Q282,150 " + REF[0] + "," + REF[1]);
      halo.setAttribute("cx", P[0]); halo.setAttribute("cy", P[1]);
      port.setAttribute("cx", P[0]); port.setAttribute("cy", P[1]);
      plab.setAttribute("x", P[0] + 12); plab.setAttribute("y", P[1] - 10);
    }

    function clientToSvg(clientX, clientY) {
      var r = svg.getBoundingClientRect();
      var x = (clientX - r.left) / r.width * 720;
      var y = (clientY - r.top) / r.height * 470;
      x = Math.max(300, Math.min(706, x));
      y = Math.max(64, Math.min(442, y));
      return [x, y];
    }
    var dragging = false;
    function onDown(e) { dragging = true; svg.classList.add("dragging"); move(e); if (e.cancelable) e.preventDefault(); }
    function move(e) {
      if (!dragging) return;
      var t = e.touches ? e.touches[0] : e;
      var pt = clientToSvg(t.clientX, t.clientY);
      P[0] = pt[0]; P[1] = pt[1]; recompute();
    }
    function onUp() { dragging = false; svg.classList.remove("dragging"); }
    svg.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    box.querySelectorAll(".rs-iv-presets button").forEach(function (b) {
      b.addEventListener("click", function () {
        var tx = +b.getAttribute("data-px"), ty = +b.getAttribute("data-py");
        if (REDUCED) { P[0] = tx; P[1] = ty; recompute(); return; }
        var sx = P[0], sy = P[1], t0 = performance.now(), DUR = 420;
        (function step(now) {
          var k = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - k, 3);
          P[0] = sx + (tx - sx) * e; P[1] = sy + (ty - sy) * e; recompute();
          if (k < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    });
    recompute();
  }

  /* --------------------------------------------------------------- evidence */
  function buildEvidence(box) {
    // every value below is reproduced from the article's robustness table
    var rows = [
      { s: "Pooled (ALL)", o: "Export", e: "DID", est: "0.730", base: 0.022, drop: 0.021, raw: 0.019, plac: 0.000, status: "Stable" },
      { s: "Group I", o: "Port calls", e: "DID", est: "1.034", base: 0.018, drop: 0.018, raw: 0.020, plac: 0.000, status: "Stable" },
      { s: "Group I", o: "Export", e: "DID", est: "0.726", base: 0.078, drop: 0.078, raw: 0.075, plac: 0.000, status: "Mixed" },
      { s: "Group II", o: "Import", e: "DID", est: "\u22121.385", base: 0.003, drop: 0.002, raw: 0.003, plac: 0.000, status: "Stable", core: true },
      { s: "Group II", o: "Port calls", e: "DDD", est: "0.324", base: 0.000, drop: 0.009, raw: 0.000, plac: 0.070, status: "Supplementary" },
      { s: "Group II", o: "Export", e: "DDD", est: "\u22120.475", base: 0.018, drop: 0.059, raw: 0.018, plac: 0.040, status: "Mixed" }
    ];
    var checks = [["base", "Baseline"], ["drop", "Drop top-1"], ["raw", "Raw-std"], ["plac", "Placebo"]];
    function grade(p) { return p < 0.01 ? "s3" : p < 0.05 ? "s2" : p < 0.10 ? "s1" : "s0"; }
    function pTxt(p) { return p === 0 ? "0.000" : p.toFixed(3); }

    var head =
      '<div class="rs-iv-head"><span class="rs-iv-tag">Interactive</span>' +
      '<span class="rs-iv-title">Evidence robustness explorer</span></div>' +
      '<p class="rs-iv-lede">The heatmaps show point estimates and stars. This panel adds the dimension they cannot: how each headline finding survives every robustness check. Filter by status; hover a dot for its p-value.</p>';

    var filters = '<div class="rs-ev-filters"><button type="button" data-f="all" class="on">All</button>' +
      '<button type="button" data-f="Stable">Stable</button>' +
      '<button type="button" data-f="Supplementary">Supplementary</button>' +
      '<button type="button" data-f="Mixed">Mixed</button></div>';

    var legend = '<div class="rs-ev-legend"><span><i class="d s3"></i>p&lt;0.01</span><span><i class="d s2"></i>p&lt;0.05</span><span><i class="d s1"></i>p&lt;0.10</span><span><i class="d s0"></i>n.s.</span></div>';

    var list = '<div class="rs-ev-list">';
    rows.forEach(function (r, i) {
      var dots = checks.map(function (c) {
        var p = r[c[0]];
        return '<span class="rs-ev-dot ' + grade(p) + '" data-tip="' + c[1] + ' p = ' + pTxt(p) + '"><i></i><em>' + c[1] + '</em></span>';
      }).join("");
      list += '<div class="rs-ev-row" data-status="' + r.status + '" style="--i:' + i + '">' +
        (r.core ? '<span class="rs-ev-core">Core</span>' : "") +
        '<div class="rs-ev-id"><span class="rs-ev-s">' + r.s + '</span>' +
        '<span class="rs-ev-o">' + r.o + ' \u00b7 ' + r.e + '</span></div>' +
        '<div class="rs-ev-est ' + (r.est.indexOf("\u2212") === 0 ? "neg" : "") + '">' + r.est + '</div>' +
        '<div class="rs-ev-dots">' + dots + '</div>' +
        '<span class="rs-ev-status st-' + r.status.toLowerCase() + '">' + r.status + '</span>' +
        '</div>';
    });
    list += '</div>';

    box.innerHTML = head + filters + legend + list +
      '<div class="rs-iv-foot">Filled dots: significant at the labelled threshold (port-clustered SE). Placebo reports exceedances over 200 exposure randomizations; 0.000 means 0 of 200. Stars are raw, not FDR-adjusted.</div>';

    var btns = box.querySelectorAll(".rs-ev-filters button");
    var rowsEl = box.querySelectorAll(".rs-ev-row");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        var f = b.getAttribute("data-f");
        rowsEl.forEach(function (r) {
          var show = f === "all" || r.getAttribute("data-status") === f;
          r.classList.toggle("hide", !show);
        });
      });
    });
  }

  /* ----------------------------------------------------------- count-up + bar */
  function countUp(scroller) {
    var nums = [].slice.call(scroller.querySelectorAll(".rs-funnel-v"));
    nums.forEach(function (n) {
      var raw = n.textContent.replace(/,/g, "");
      var target = parseInt(raw, 10);
      if (isNaN(target)) return;
      n.__target = target; n.__done = false;
      n.textContent = "0";
    });
    function fmt(v) { return v.toLocaleString("en-US"); }
    function run(n) {
      if (n.__done) return; n.__done = true;
      if (REDUCED) { n.textContent = fmt(n.__target); return; }
      var t0 = performance.now(), DUR = 900;
      (function step(now) {
        var k = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - k, 3);
        n.textContent = fmt(Math.round(n.__target * e));
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    }
    function check() {
      var R = scroller.getBoundingClientRect();
      nums.forEach(function (n) {
        if (n.__done) return;
        var r = n.getBoundingClientRect();
        if (r.top < R.bottom - R.height * 0.12) run(n);
      });
    }
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; check(); });
    }
    scroller.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(function () { requestAnimationFrame(check); });
  }

  function progressBar(scroller) {
    var layer = scroller.parentNode;
    if (!layer || layer.querySelector(".rs-progress")) return;
    var bar = el("div", "rs-progress");
    var fill = el("i");
    bar.appendChild(fill);
    layer.appendChild(bar);
    var ticking = false;
    function upd() {
      var max = scroller.scrollHeight - scroller.clientHeight;
      var f = max > 0 ? scroller.scrollTop / max : 0;
      fill.style.transform = "scaleX(" + Math.max(0, Math.min(1, f)).toFixed(4) + ")";
    }
    scroller.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; upd(); });
    }, { passive: true });
    upd();
  }

  /* -------------------------------------------------------------------- init */
  window.__redseaViz = {
    init: function (scroller) {
      if (!scroller || scroller.__rsvizDone) return;
      scroller.__rsvizDone = true;
      try {
        scroller.querySelectorAll('[data-rsviz="reroute"]').forEach(buildReroute);
        scroller.querySelectorAll('[data-rsviz="evidence"]').forEach(buildEvidence);
        countUp(scroller);
        progressBar(scroller);
      } catch (err) { if (window.console) console.warn("redsea-viz", err); }
    }
  };
})();
