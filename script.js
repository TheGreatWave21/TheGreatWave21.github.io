/* ==========================================================================
   Kenan | Code & Circuits Guy: small enhancements
   --------------------------------------------------------------------------
   The page works fully without this file. It adds:
     1. Header: background once you scroll, highlight of the current section
     2. Fade-up entrance for content as it scrolls into view
     3. Soft spotlight on project cards that follows the pointer
     4. Hidden commands: type a word anywhere on the page
          whoami · sudo · coffee · quote · wave · matrix · warp
        plus the Konami code (up up down down left right left right b a)
     5. Screensaver after 90 s without input (or type "warp")
   ========================================================================== */
"use strict";

/* Messages for the hidden commands. Edit freely. */
const MESSAGES = {
  whoami: "guest · visiting Kenan: student, founder of Barcona Systems, code & circuits guy.",
  sudo: "Permission denied: guest is not in the sudoers file. This incident will be reported. (To nobody. But still.)",
  coffee: "418 I’m a teapot. Brewing anyway. Productivity +10 for the next 25 minutes. Maybe try Flow?",
  quote: "“Force without power falls to its own weight.”",
  wave: {
    art:
      "            ___\n" +
      "        .-~~   ~~-.\n" +
      "     .-~    .-~~-. \\\n" +
      "   .~     .~      '~'\n" +
      "~~~   ~~~~   ~~~~~   ~~~",
    text: "The great wave, in five lines of ASCII.",
  },
  matrix: "Wake up, guest … (any key or click to stop)",
  konami: "Cheat code accepted. +30 lives, unlimited coffee, zero bugs (that last one is a lie).",
  reduced: "Skipped: your system asks for reduced motion.",
};

(function () {
  const IDLE_MS = 90000;     // screensaver delay
  const MATRIX_MS = 6000;    // matrix length

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const toastEl = document.getElementById("toast");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---- 1. Header ---------------------------------------------------------- */
  const topbar = document.querySelector(".topbar");
  function onScroll() {
    topbar.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Highlight the nav link of the section in the middle of the screen.
  const navLinks = Array.from(document.querySelectorAll(".nav a"));
  const sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function markCurrent() {
    const mid = window.innerHeight * 0.4;
    let current = -1;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= mid) current = i;
    });
    // at the very bottom, the last section counts as current
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections.length - 1;
    navLinks.forEach(function (a, i) {
      if (i === current) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", markCurrent, { passive: true });
  window.addEventListener("resize", markCurrent);
  markCurrent();

  /* ---- 2. Entrance animations --------------------------------------------- */
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  if (REDUCED || !("IntersectionObserver" in window)) {
    reveals.forEach(function (r) { r.classList.add("in"); });
  } else {
    // Items that appear together get a small stagger.
    const io = new IntersectionObserver(function (entries) {
      let n = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--delay", Math.min(n++, 6) * 70 + "ms");
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (r) { io.observe(r); });
  }

  /* ---- 3. Project card spotlight ------------------------------------------ */
  document.querySelectorAll(".project").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---- 4. Hidden commands -------------------------------------------------- */
  let toastTimer = 0;
  function toast(label, text, art) {
    toastEl.replaceChildren(el("span", "toast-label", "> " + label));
    if (art) toastEl.append(el("pre", "", art));
    toastEl.append(el("span", "", text));
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 6000);
  }

  const COMMANDS = {
    whoami: function () { toast("whoami", MESSAGES.whoami); },
    sudo: function () { toast("sudo", MESSAGES.sudo); },
    coffee: function () { toast("coffee", MESSAGES.coffee); },
    quote: function () { toast("quote", MESSAGES.quote); },
    wave: function () { toast("wave", MESSAGES.wave.text, MESSAGES.wave.art); },
    matrix: function () { matrix(); },
    warp: function () { screensaver(); },
  };

  let typed = "";
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;
    if (e.target.closest && e.target.closest("input, textarea, [contenteditable]")) return;
    typed = (typed + e.key.toLowerCase()).slice(-10);
    Object.keys(COMMANDS).some(function (cmd) {
      if (typed.slice(-cmd.length) !== cmd) return false;
      typed = "";
      COMMANDS[cmd]();
      return true;
    });
  });

  // Konami code
  const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft",
    "arrowright", "arrowleft", "arrowright", "b", "a"];
  let konamiAt = 0;
  document.addEventListener("keydown", function (e) {
    const k = e.key.toLowerCase();
    konamiAt = k === KONAMI[konamiAt] ? konamiAt + 1 : (k === KONAMI[0] ? 1 : 0);
    if (konamiAt < KONAMI.length) return;
    konamiAt = 0;
    toast("konami", MESSAGES.konami);
    if (REDUCED) return;
    root.classList.add("konami");
    setTimeout(function () { root.classList.remove("konami"); }, 4000);
  });

  /* ---- Full-screen canvas overlay (shared by matrix + screensaver) ------- */
  let overlay = null;

  function openOverlay(draw, opts) {
    if (overlay) return null;
    const box = el("div", "overlay");
    box.setAttribute("aria-hidden", "true");
    const canvas = el("canvas");
    box.append(canvas);
    if (opts.label) box.append(opts.label);
    document.body.append(box);

    const ctx = canvas.getContext("2d");
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (opts.onSize) opts.onSize(canvas.clientWidth, canvas.clientHeight);
    }
    size();
    window.addEventListener("resize", size);

    const t0 = performance.now();
    let last = 0;
    let raf = requestAnimationFrame(function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < (opts.frameMs || 25)) return;
      last = now;
      draw(ctx, canvas.clientWidth, canvas.clientHeight, (now - t0) / 1000);
    });
    requestAnimationFrame(function () { box.classList.add("on"); });

    const guardUntil = performance.now() + 400; // ignore the input that opened it
    let timer = opts.duration ? setTimeout(close, opts.duration) : 0;

    function close() {
      if (overlay !== api) return;
      overlay = null;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("resize", size);
      box.classList.remove("on");
      setTimeout(function () { box.remove(); }, 500);
      if (opts.onClose) opts.onClose();
    }

    const api = { close: close, guarded: function () { return performance.now() < guardUntil; } };
    overlay = api;
    return api;
  }

  // Any input closes an open overlay; the input itself does nothing else.
  let idleTimer = 0;
  function activity(e) {
    if (overlay && !overlay.guarded()) {
      if (e.type === "keydown" || e.type === "pointerdown") {
        e.preventDefault();
        e.stopPropagation();
      }
      overlay.close();
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (!document.hidden && !REDUCED) screensaver();
    }, IDLE_MS);
  }
  ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach(function (type) {
    window.addEventListener(type, activity, { capture: true, passive: type !== "keydown" && type !== "pointerdown" });
  });
  activity({ type: "init" });

  /* ---- matrix ------------------------------------------------------------ */
  function matrix() {
    if (REDUCED) return toast("matrix", MESSAGES.reduced);
    const size = 16;
    const glyphs = "アイウエオカキクケコサシスセソタチツテト0123456789<>/_$#";
    let drops = [];
    toast("matrix", MESSAGES.matrix);
    openOverlay(function (ctx, w, h) {
      ctx.fillStyle = "rgba(11,15,12,0.16)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = size + "px monospace";
      drops.forEach(function (y, c) {
        ctx.fillStyle = Math.random() > 0.94 ? "#d8f5e0" : "#5fa36f";
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], c * size, y * size);
        drops[c] = y * size > h && Math.random() > 0.96 ? 0 : y + 1;
      });
    }, {
      frameMs: 50,
      duration: MATRIX_MS,
      onSize: function (w) {
        drops = [];
        for (let c = 0; c < Math.ceil(w / size); c++) drops.push(Math.random() * -40);
      },
      onClose: function () { toastEl.classList.remove("show"); },
    });
  }

  /* ---- 5. Screensaver -------------------------------------------------------
     Many thin horizontal stripes; on each one a soft green glow travels from
     right to left. The glows are staggered from stripe to stripe so together
     they form a rolling wave.                                               */
  function screensaver() {
    if (REDUCED) return toast("warp", MESSAGES.reduced);
    const label = el("div", "overlay-label");
    const clock = el("b");
    label.append(clock, el("span", "", "Move the mouse or press any key"));
    const pad = function (n) { return String(n).padStart(2, "0"); };

    openOverlay(function (ctx, w, h, t) {
      const now = new Date();
      clock.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0b0f0c";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const rows = Math.max(14, Math.min(44, Math.round(h / 24)));
      const band = h / rows;
      const thick = band * 0.45;
      const len = w * 0.42;
      const period = 4.6;
      const span = w + len;

      for (let r = 0; r < rows; r++) {
        const y = r * band + (band - thick) / 2;
        const p = r / rows;
        const lag = (Math.sin(p * Math.PI * 1.6) * 0.32 + p * 0.25) * period;
        const head = w - (((t + lag) / period) % 1) * span; // right -> left
        const col = r % 4 === 0 ? "#8fd8a5" : "#5fa36f";

        ctx.globalAlpha = 0.04;            // faint resting stripe
        ctx.fillStyle = "#3f7d52";
        ctx.fillRect(0, y, w, thick);

        const g = ctx.createLinearGradient(head, 0, head + len, 0);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.04, col);
        g.addColorStop(0.35, col);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.1;             // soft halo
        ctx.fillRect(head, y - thick * 0.6, len, thick * 2.2);
        ctx.globalAlpha = 0.32;            // core
        ctx.fillRect(head, y, len, thick);
      }
    }, { label: label });
  }
})();
