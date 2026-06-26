/* topnav.js — sticky top-nav behavior: controlled-duration smooth scroll to each
   big-title section, plus scroll-spy that highlights the current section.
   The hero -> internship transition is a pinned morph, so "Internship" targets
   the scroll position where that morph completes (the settled Screen-2 view). */
(function () {
  "use strict";
  var nav = document.querySelector(".topnav");
  if (!nav) return;

  function navH() { return nav.offsetHeight || 56; }
  function byId(id) { return document.getElementById(id); }

  // current scroll targets (recomputed each use; layout/heights change as content reveals)
  function targets() {
    var intro = byId("exp-intro");
    var morphEnd = intro ? (intro.offsetTop + intro.offsetHeight - window.innerHeight) : 0;
    function topOf(id) {
      var e = byId(id);
      if (!e) return null;
      return e.getBoundingClientRect().top + window.pageYOffset - navH() - 8;
    }
    return {
      home: 0,
      internship: Math.max(0, morphEnd),
      research: topOf("research"),
      systems: topOf("systems"),
      markets: topOf("markets"),
      resume: topOf("resume")
    };
  }

  var REDUCED = false;
  try { REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches; } catch (e) {}

  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  var animId = 0;
  function scrollToY(y) {
    y = Math.max(0, Math.round(y));
    var startY = window.pageYOffset;
    var dist = y - startY;
    if (Math.abs(dist) < 2) return;
    if (REDUCED) { window.scrollTo(0, y); return; }
    // quick, consistent slide: 0.4ms/px, clamped to a snappy 440-820ms
    var dur = Math.max(440, Math.min(820, Math.abs(dist) * 0.4));
    var t0 = null;
    var myId = ++animId;
    function step(ts) {
      if (myId !== animId) return;            // a newer scroll superseded this one
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var links = [].slice.call(nav.querySelectorAll("[data-go]"));
  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var key = a.getAttribute("data-go");
      var T = targets();
      if (T[key] != null) scrollToY(T[key]);
    });
  });

  // scroll-spy: highlight the section whose start we've most recently passed
  var order = ["home", "internship", "research", "systems", "markets", "resume"];
  var ticking = false;
  function spy() {
    ticking = false;
    var T = targets();
    var probe = window.pageYOffset + navH() + window.innerHeight * 0.28;
    var active = "home";
    order.forEach(function (k) { if (T[k] != null && probe >= T[k]) active = k; });
    links.forEach(function (a) {
      a.classList.toggle("on", a.classList.contains("tn-link") && a.getAttribute("data-go") === active);
    });
  }
  window.addEventListener("scroll", function () {
    if (ticking) return; ticking = true; requestAnimationFrame(spy);
  }, { passive: true });
  window.addEventListener("resize", spy);
  spy();
})();
