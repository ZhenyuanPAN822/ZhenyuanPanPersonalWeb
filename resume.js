/* Screen 5 - Resume Archive behaviour and PDF viewer controls. */
(function () {
  "use strict";

  const s5 = document.querySelector(".s5");
  if (!s5) return;

  const head = s5.querySelector(".s5-head");
  const layout = s5.querySelector(".s5-layout");
  const timeline = s5.querySelector(".s5-timeline");
  const viewer = document.getElementById("resume-viewer");
  const contact = s5.querySelector(".s5-contact");
  const scroller = document.getElementById("rv-scroll");
  const pages = document.getElementById("rv-pages");
  const pageStatus = document.getElementById("rv-page-status");
  const zoomLabel = document.getElementById("rv-zoom-label");
  const zoomIn = document.getElementById("rv-zoom-in");
  const zoomOut = document.getElementById("rv-zoom-out");
  const printA = document.getElementById("rv-print");
  const printB = document.getElementById("s5-print-resume");
  const fullscreen = document.getElementById("rv-fullscreen");

  const DESK_DOC = { left: 405, top: 638, width: 230, height: 116 };
  let zoom = 1;

  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const win = (t, a, b) => ease(clamp01((t - a) / (b - a)));

  function fallbackDeskRect() {
    const vw = window.innerWidth, vh = window.innerHeight;
    return { left: vw * 0.29, top: vh * 0.68, width: vw * 0.14, height: vh * 0.12 };
  }

  function deskRect() {
    if (window.__room3d && typeof window.__room3d.assetRect === "function") {
      const r = window.__room3d.assetRect(DESK_DOC);
      if (r && isFinite(r.left) && r.width > 1) return r;
    }
    return fallbackDeskRect();
  }

  function viewerRect() {
    if (!viewer) return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const r = viewer.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  function setOpacityTransform(el, opacity, y, scale) {
    if (!el) return;
    el.style.opacity = String(opacity);
    el.style.setProperty("--reveal-y", y + "px");
    el.style.setProperty("--reveal-scale", scale);
  }

  function setProgress(t) {
    t = clamp01(t);

    const hk = win(t, 0.48, 0.78);
    const lk = win(t, 0.64, 0.98);
    const vk = win(t, 0.36, 0.86);
    const sideK = win(t, 0.72, 0.98);

    setOpacityTransform(head, hk, 12 * (1 - hk), 1);
    setOpacityTransform(layout, lk, 18 * (1 - lk), 1);
    if (viewer) {
      viewer.style.opacity = String(vk);
      viewer.style.setProperty("--viewer-scale", (0.982 + 0.018 * vk).toFixed(4));
    }
    setOpacityTransform(timeline, sideK, 10 * (1 - sideK), 1);
    setOpacityTransform(contact, sideK, 10 * (1 - sideK), 1);
  }

  function updateZoom() {
    if (!pages) return;
    pages.style.setProperty("--resume-zoom", zoom.toFixed(2));
    if (zoomLabel) zoomLabel.textContent = Math.round(zoom * 100) + "%";
    updatePageStatus();
  }

  function updatePageStatus() {
    if (!scroller || !pageStatus) return;
    const pageEls = [...scroller.querySelectorAll(".rv-page")];
    if (!pageEls.length) return;
    const mid = scroller.getBoundingClientRect().top + scroller.clientHeight / 2;
    let best = 0, dist = Infinity;
    pageEls.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      const d = Math.abs((r.top + r.height / 2) - mid);
      if (d < dist) { dist = d; best = i; }
    });
    pageStatus.textContent = "Page " + (best + 1) + " / " + pageEls.length;
  }

  if (zoomIn) zoomIn.addEventListener("click", () => {
    zoom = Math.min(1.25, Math.round((zoom + 0.1) * 10) / 10);
    updateZoom();
  });
  if (zoomOut) zoomOut.addEventListener("click", () => {
    zoom = Math.max(0.8, Math.round((zoom - 0.1) * 10) / 10);
    updateZoom();
  });
  if (scroller) scroller.addEventListener("scroll", updatePageStatus, { passive: true });
  if (printA) printA.addEventListener("click", () => window.print());
  if (printB) printB.addEventListener("click", () => window.print());
  if (fullscreen) fullscreen.addEventListener("click", () => {
    s5.classList.toggle("fullscreen");
    fullscreen.textContent = s5.classList.contains("fullscreen") ? "Exit" : "Fullscreen";
    setTimeout(updatePageStatus, 180);
  });

  window.addEventListener("resize", () => {
    updatePortal(window.__resumeProgress || 0);
    updatePageStatus();
  });

  updateZoom();

  window.__resumeArchive = {
    setProgress(t) {
      window.__resumeProgress = clamp01(t);
      setProgress(window.__resumeProgress);
    },
    deskRect,
    viewerRect,
    bookRect: viewerRect,
  };
})();
