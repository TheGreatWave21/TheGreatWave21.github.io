/* ==========================================================================
   Kenan | Code & Circuits Guy: small enhancements
   --------------------------------------------------------------------------
   The page works fully without this file. It adds:
     1. Header: background on scroll, current-section marker, progress bar
     2. Step-in entrance for content as it scrolls into view
     3. Soft spotlight on project cards that follows the pointer
     4. Pixel icons + the pixel robot (drawn from small bitmaps below)
     5. The pixel wave in the hero
     6. Hidden commands: type a word anywhere on the page
          whoami · sudo · coffee · quote · wave · matrix · warp · play
        plus the Konami code (up up down down left right left right b a)
     7. Screensaver after 90 s without input (or type "warp")
     8. Bug Hop: a tiny game (click the robot or type "play")
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

/* --------------------------------------------------------------------------
   Pixel art (original). Each string is one row; each character one pixel.
   Icons: "X" = filled (drawn in the current text colour), "." = empty.
   -------------------------------------------------------------------------- */
const ICONS = {
  code: [
    "...X...XX...",
    "..X...X..X..",
    ".X....X...X.",
    "X....X.....X",
    ".X...X....X.",
    "..X.X....X..",
    "...XX...X...",
  ],
  gear: [
    "....X....",
    ".X.XXX.X.",
    "..XX.XX..",
    ".XX...XX.",
    "XXX...XXX",
    ".XX...XX.",
    "..XX.XX..",
    ".X.XXX.X.",
    "....X....",
  ],
  chip: [
    "...X.X.X...",
    "..XXXXXXX..",
    "XXX.....XXX",
    "..X.XXX.X..",
    "XXX.X.X.XXX",
    "..X.XXX.X..",
    "XXX.....XXX",
    "..XXXXXXX..",
    "...X.X.X...",
  ],
  robot: [
    ".....X.....",
    ".....X.....",
    "..XXXXXXX..",
    ".X.......X.",
    ".X.XX.XX.X.",
    "XX.......XX",
    ".X..XXX..X.",
    ".X.......X.",
    "..XXXXXXX..",
  ],
  flask: [
    "..XXXXX..",
    "...X.X...",
    "...X.X...",
    "...X.X...",
    "..X...X..",
    ".X.....X.",
    "X..X.X..X",
    "X.XXXXX.X",
    ".XXXXXXX.",
  ],
  arrow: [
    "..XXXX",
    "....XX",
    "...X.X",
    "..X..X",
    ".X....",
    "X.....",
  ],
};

/* The robot ("Bit"), an original sprite. Colours by letter: ROBOT_COLORS. */
const ROBOT = [
  "......rr......",
  "......kk......",
  "..kkkkkkkkkk..",
  ".kmmmmmmmmmmk.",
  ".kmllllllllgk.",
  ".kmlwwllwwlgk.",
  ".kmlwellwelgk.",
  ".kmllllllllgk.",
  ".kmllkkkkllgk.",
  ".kggggggggggk.",
  "..kkkkkkkkkk..",
  "...kmllllgk...",
  "..kkmlrrlgkk..",
  "...kmllllgk...",
  "...kkkkkkkk...",
  "...kk....kk...",
];
const ROBOT_BLINK_ROWS = { 5: ".kmllllllllgk.", 6: ".kmlkkllkklgk." };
const ROBOT_STEP_ROW = { 15: "....kk..kk...." };
const ROBOT_COLORS = {
  k: "#06110a", m: "#d8f5e0", l: "#8fd8a5", g: "#5fa36f",
  w: "#ffffff", e: "#0b0f0c", r: "#f0876a",
};

/* A bug for the game (two walking frames) */
const BUG = [
  "k......k",
  ".k.kk.k.",
  "..krrk..",
  ".krrrrk.",
  "kkrrrrkk",
  ".k.kk.k.",
];
const BUG_STEP = [
  "k......k",
  ".k.kk.k.",
  "..krrk..",
  ".krrrrk.",
  "kkrrrrkk",
  "k..kk..k",
];
const BUG_COLORS = { k: "#f0876a", r: "#9c3d2a" };

(function () {
  const IDLE_MS = 90000;   // screensaver delay
  const MATRIX_MS = 6000;  // matrix length

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const toastEl = document.getElementById("toast");
  const SVGNS = "http://www.w3.org/2000/svg";

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* Turns a bitmap into a crisp SVG (one <path> per colour). */
  function pixelSVG(rows, colors) {
    const h = rows.length;
    const w = rows[0].length;
    const paths = {};
    rows.forEach(function (row, y) {
      for (let x = 0; x < w; x++) {
        const ch = row[x];
        if (ch === ".") continue;
        (paths[ch] = paths[ch] || []).push("M" + x + " " + y + "h1v1h-1z");
      }
    });
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    Object.keys(paths).forEach(function (ch) {
      const p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", paths[ch].join(""));
      p.setAttribute("fill", colors && colors[ch] ? colors[ch] : "currentColor");
      svg.append(p);
    });
    return svg;
  }

  /* Same bitmap, drawn onto a small canvas (for the game). */
  function pixelCanvas(rows, colors) {
    const c = document.createElement("canvas");
    c.width = rows[0].length;
    c.height = rows.length;
    const x = c.getContext("2d");
    rows.forEach(function (row, y) {
      for (let i = 0; i < row.length; i++) {
        if (row[i] === ".") continue;
        x.fillStyle = colors[row[i]];
        x.fillRect(i, y, 1, 1);
      }
    });
    return c;
  }

  function withRows(base, changes) {
    return base.map(function (row, i) { return changes[i] || row; });
  }

  /* ---- 1. Header ---------------------------------------------------------- */
  const topbar = document.querySelector(".topbar");
  const bar = document.getElementById("progress");
  const navLinks = Array.from(document.querySelectorAll(".nav a"));
  const sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });

  function onScroll() {
    topbar.classList.toggle("scrolled", window.scrollY > 8);

    // block progress bar: width snaps to whole 12px blocks
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const share = max > 0 ? window.scrollY / max : 0;
    bar.style.width = Math.round((share * window.innerWidth) / 12) * 12 + "px";

    // current section = the one crossing 40% of the screen height
    const mid = window.innerHeight * 0.4;
    let current = -1;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= mid) current = i;
    });
    if (max > 0 && window.scrollY >= max - 4) current = sections.length - 1;
    navLinks.forEach(function (a, i) {
      if (i === current) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---- 2. Entrance animations --------------------------------------------- */
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  if (REDUCED || !("IntersectionObserver" in window)) {
    reveals.forEach(function (r) { r.classList.add("in"); });
  } else {
    const io = new IntersectionObserver(function (entries) {
      let n = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--delay", Math.min(n++, 6) * 80 + "ms");
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

  /* ---- 4. Pixel icons + robot --------------------------------------------- */
  document.querySelectorAll(".picon[data-icon]").forEach(function (slot) {
    const bitmap = ICONS[slot.dataset.icon];
    if (bitmap) slot.append(pixelSVG(bitmap));
  });

  const mascot = document.getElementById("mascot");
  const sprite = document.getElementById("mascot-sprite");
  if (mascot && sprite) {
    const open = pixelSVG(ROBOT, ROBOT_COLORS);
    const shut = pixelSVG(withRows(ROBOT, ROBOT_BLINK_ROWS), ROBOT_COLORS);
    open.classList.add("open-frame");
    shut.classList.add("blink-frame");
    sprite.append(open, shut);
    mascot.hidden = false;
    mascot.addEventListener("click", function () { bugHop(mascot); });
    if (!REDUCED) {
      (function blink() {
        setTimeout(function () {
          sprite.classList.add("blinking");
          setTimeout(function () { sprite.classList.remove("blinking"); blink(); }, 160);
        }, 2500 + Math.random() * 2500);
      })();
    }
  }

  /* ---- 5. Hero pixel wave -------------------------------------------------
     A grid of points forms a surface of overlapping sine waves; every few
     seconds a bigger swell rolls from right to left. Each point is drawn as
     a square snapped to a pixel grid, in a limited 8-bit green palette.
     Tilts a little toward the mouse; pauses when off screen.              */
  (function initWave() {
    const canvas = document.getElementById("wave");
    if (!canvas || !canvas.getContext) return;
    const box = canvas.parentElement;
    const ctx = canvas.getContext("2d");

    const COLS = 46;
    const ROWS = 26;
    const PALETTE = ["#1f3325", "#2f5a3c", "#3f7d52", "#5fa36f", "#8fd8a5", "#d8f5e0"];
    let w = 0, h = 0, focal = 0, px = 4;
    let tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;
    let running = false, visible = true, raf = 0;
    const t0 = performance.now();

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      focal = Math.min(w, h) * 1.25;
      px = Math.max(3, Math.round(Math.min(w, h) / 120)); // size of one "pixel"
    }

    function surface(x, z, t) {
      const swellX = 1.9 - ((t * 0.32) % 3.8); // right -> left
      const swell = 0.34 * Math.exp(-Math.pow((x - swellX) * 2.4, 2)) * (0.75 + 0.25 * Math.sin(z * 2.2 + t));
      return 0.11 * Math.sin(x * 3.1 + t * 1.15) +
             0.08 * Math.sin(z * 4.2 - t * 0.85 + x * 1.4) +
             0.045 * Math.sin((x + z) * 7 - t * 1.9) +
             swell;
    }

    function frame(now) {
      const t = (now - t0) / 1000;
      tiltX += (aimX - tiltX) * 0.05;
      tiltY += (aimY - tiltY) * 0.05;
      const yaw = -0.55 + tiltX * 0.3;
      const pitch = 0.62 + tiltY * 0.16;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);

      ctx.clearRect(0, 0, w, h);
      const pts = [];
      for (let r = 0; r < ROWS; r++) {
        const z = (r / (ROWS - 1)) * 2 - 1;
        for (let c = 0; c < COLS; c++) {
          const x = (c / (COLS - 1)) * 2 - 1;
          const y = surface(x, z, t);
          const X = x * 1.55, Z = z * 1.55;
          const x1 = X * cy - Z * sy;
          const z1 = X * sy + Z * cy;
          const y2 = y * cp - z1 * sp;
          const z2 = y * sp + z1 * cp;
          const s = focal / (3.4 + z2);
          pts.push({ x: w / 2 + x1 * s, y: h * 0.52 - y2 * s, d: z2, k: y });
        }
      }
      pts.sort(function (a, b) { return b.d - a.d; }); // far first

      for (const p of pts) {
        const near = Math.max(0, Math.min(1, (1.6 - p.d) / 3.2));
        const m = Math.max(0, Math.min(1, (p.k + 0.18) / 0.62));
        const idx = Math.min(PALETTE.length - 1, Math.floor((m * 0.7 + near * 0.45) * PALETTE.length * 0.86));
        const sz = near > 0.62 ? px + Math.round(px / 2) : px;
        ctx.fillStyle = PALETTE[Math.max(0, idx)];
        // snap to the pixel grid for the 8-bit look
        ctx.fillRect(Math.round(p.x / px) * px, Math.round(p.y / px) * px, sz, sz);
      }
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      frame(now);
    }

    function update() {
      const should = visible && !document.hidden && !REDUCED;
      if (should && !running) { running = true; raf = requestAnimationFrame(loop); }
      if (!should && running) { running = false; cancelAnimationFrame(raf); }
    }

    size();
    if (REDUCED) frame(t0 + 2600); // one still frame
    box.classList.add("ready");

    window.addEventListener("resize", function () { size(); if (!running) frame(performance.now()); });
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      aimX = e.clientX / window.innerWidth - 0.5;
      aimY = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    document.addEventListener("visibilitychange", update);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        update();
      }).observe(box);
    }
    update();
  })();

  /* ---- 6. Hidden commands -------------------------------------------------- */
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
    play: function () { bugHop(null); },
  };

  let typed = "";
  document.addEventListener("keydown", function (e) {
    if (overlay) return;
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
    if (overlay) return;
    const k = e.key.toLowerCase();
    konamiAt = k === KONAMI[konamiAt] ? konamiAt + 1 : (k === KONAMI[0] ? 1 : 0);
    if (konamiAt < KONAMI.length) return;
    konamiAt = 0;
    toast("konami", MESSAGES.konami);
    if (REDUCED) return;
    root.classList.add("konami");
    setTimeout(function () { root.classList.remove("konami"); }, 4000);
  });

  /* ---- Full-screen canvas overlay (matrix, screensaver, game) ------------ */
  let overlay = null;

  function openOverlay(draw, opts) {
    if (overlay) return null;
    const box = el("div", "overlay" + (opts.className ? " " + opts.className : ""));
    if (opts.dialogLabel) {
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", opts.dialogLabel);
    } else {
      box.setAttribute("aria-hidden", "true");
    }
    const canvas = el("canvas");
    canvas.setAttribute("aria-hidden", "true");
    box.append(canvas);
    if (opts.extra) box.append(opts.extra);
    document.body.append(box);

    const ctx = canvas.getContext("2d");
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
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
    const timer = opts.duration ? setTimeout(close, opts.duration) : 0;

    function close() {
      if (overlay !== api) return;
      overlay = null;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("resize", size);
      box.classList.remove("on");
      setTimeout(function () { box.remove(); }, 450);
      if (opts.onClose) opts.onClose();
    }

    const api = {
      box: box,
      close: close,
      interactive: !!opts.interactive,
      guarded: function () { return performance.now() < guardUntil; },
    };
    overlay = api;
    return api;
  }

  // Any input closes a passive overlay (matrix, screensaver) and does nothing
  // else; it also resets the idle timer for the screensaver.
  let idleTimer = 0;
  function activity(e) {
    if (overlay && !overlay.interactive && !overlay.guarded()) {
      if (e.type === "keydown" || e.type === "pointerdown") {
        e.preventDefault();
        e.stopPropagation();
      }
      overlay.close();
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (!document.hidden && !REDUCED && !overlay) screensaver();
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

  /* ---- 7. Screensaver ------------------------------------------------------
     Thin horizontal stripes; on each one a soft green glow travels from right
     to left, staggered from stripe to stripe so they form a rolling wave.  */
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
      const thick = Math.max(4, Math.round(band * 0.45 / 4) * 4);
      const len = w * 0.42;
      const period = 4.6;
      const span = w + len;

      for (let r = 0; r < rows; r++) {
        const y = Math.round(r * band + (band - thick) / 2);
        const p = r / rows;
        const lag = (Math.sin(p * Math.PI * 1.6) * 0.32 + p * 0.25) * period;
        const head = Math.round((w - (((t + lag) / period) % 1) * span) / 8) * 8; // stepped
        const col = r % 4 === 0 ? "#8fd8a5" : "#5fa36f";

        ctx.globalAlpha = 0.04;
        ctx.fillStyle = "#3f7d52";
        ctx.fillRect(0, y, w, thick);

        // the glow as a row of fading blocks (8-bit style)
        const blocks = 24;
        const bw = len / blocks;
        ctx.fillStyle = col;
        for (let i = 0; i < blocks; i++) {
          const fade = i < 2 ? 0.6 : 1 - (i - 2) / (blocks - 2);
          ctx.globalAlpha = 0.34 * fade;
          ctx.fillRect(head + i * bw, y, Math.ceil(bw) - 2, thick);
        }
      }
    }, { extra: label });
  }

  /* ---- 8. Bug Hop -----------------------------------------------------------
     A tiny endless runner: the robot jumps over bugs. Space / up / W / tap to
     jump, Esc or the Quit button to leave. Drawn on a 320x180 buffer and
     scaled up with crisp pixels.                                           */
  function bugHop(opener) {
    if (overlay) return;
    const VW = 320, VH = 180, GROUND = 148;
    const buf = document.createElement("canvas");
    buf.width = VW;
    buf.height = VH;
    const b = buf.getContext("2d");

    const robotA = pixelCanvas(ROBOT, ROBOT_COLORS);
    const robotB = pixelCanvas(withRows(ROBOT, ROBOT_STEP_ROW), ROBOT_COLORS);
    const bugA = pixelCanvas(BUG, BUG_COLORS);
    const bugB = pixelCanvas(BUG_STEP, BUG_COLORS);

    let best = 0;
    try { best = Number(localStorage.getItem("bughop.best")) || 0; } catch (e) { best = 0; }

    const S = { state: "ready", y: 0, vy: 0, bugs: [], speed: 95, spawn: 1, score: 0, last: 0, ground: 0, stars: [] };
    for (let i = 0; i < 46; i++) S.stars.push({ x: Math.random() * VW, y: Math.random() * 110, big: Math.random() < 0.2 });

    function start() {
      S.state = "play";
      S.y = 0; S.vy = 0; S.bugs = []; S.speed = 95; S.spawn = 0.9; S.score = 0;
    }

    function jump() {
      if (S.state !== "play") { start(); return; }
      if (S.y === 0) S.vy = 240;
    }

    function update(dt) {
      if (S.state !== "play") return;
      S.speed = Math.min(240, S.speed + 3.2 * dt);
      S.score += dt * 10;
      S.vy -= 760 * dt;
      S.y = Math.max(0, S.y + S.vy * dt);
      if (S.y === 0) S.vy = 0;

      S.spawn -= dt;
      if (S.spawn <= 0) {
        S.bugs.push({ x: VW + 8 });
        if (Math.random() < 0.18 && S.speed > 130) S.bugs.push({ x: VW + 20 }); // a pair
        S.spawn = (0.75 + Math.random() * 1.1) * (120 / S.speed) + 0.35;
      }
      S.bugs.forEach(function (bug) { bug.x -= S.speed * dt; });
      S.bugs = S.bugs.filter(function (bug) { return bug.x > -12; });

      // collision (boxes trimmed a little to feel fair)
      const rx1 = 42, rx2 = 52, ry2 = GROUND - S.y, ry1 = ry2 - 13;
      const hit = S.bugs.some(function (bug) {
        return bug.x + 1 < rx2 && bug.x + 7 > rx1 && GROUND - 5 < ry2 && GROUND > ry1;
      });
      if (hit) {
        S.state = "over";
        const sc = Math.floor(S.score);
        if (sc > best) {
          best = sc;
          try { localStorage.setItem("bughop.best", String(best)); } catch (e) { /* storage blocked */ }
        }
      }
    }

    function text(str, x, y, sizePx, color, align) {
      b.font = sizePx + 'px "Pixelify Sans", monospace';
      b.textAlign = align || "left";
      b.textBaseline = "top";
      b.fillStyle = "#06110a";
      b.fillText(str, x + 1, y + 1);
      b.fillStyle = color;
      b.fillText(str, x, y);
    }

    function render(t, dt) {
      b.fillStyle = "#0b0f0c";
      b.fillRect(0, 0, VW, VH);

      // stars (slow parallax)
      S.stars.forEach(function (s) {
        if (S.state === "play") s.x -= S.speed * 0.12 * dt;
        if (s.x < 0) s.x += VW;
        b.fillStyle = s.big ? "#3f7d52" : "#1f3325";
        b.fillRect(Math.round(s.x), Math.round(s.y), s.big ? 2 : 1, s.big ? 2 : 1);
      });

      // ground
      if (S.state === "play") S.ground = (S.ground + S.speed * dt) % 8;
      b.fillStyle = "#2f5a3c";
      b.fillRect(0, GROUND + 1, VW, 1);
      b.fillStyle = "#1f3325";
      for (let x = -S.ground; x < VW; x += 8) b.fillRect(Math.round(x), GROUND + 5, 4, 1);
      for (let x = -S.ground * 0.5; x < VW; x += 16) b.fillRect(Math.round(x) + 6, GROUND + 10, 2, 1);

      // bugs
      const step = Math.floor(t * 8) % 2;
      S.bugs.forEach(function (bug) { b.drawImage(step ? bugB : bugA, Math.round(bug.x), GROUND - 5); });

      // robot
      const legs = S.state === "play" && S.y === 0 && step ? robotB : robotA;
      b.drawImage(legs, 40, Math.round(GROUND - 15 - S.y));

      // HUD
      text("HI " + String(best).padStart(5, "0") + "   " + String(Math.floor(S.score)).padStart(5, "0"), VW - 8, 8, 10, "#8fd8a5", "right");
      if (S.state === "ready") {
        text("BUG HOP", VW / 2, 52, 24, "#d8f5e0", "center");
        text("SPACE / TAP TO JUMP", VW / 2, 84, 10, "#8fd8a5", "center");
        text("ESC TO QUIT", VW / 2, 98, 10, "#5fa36f", "center");
      } else if (S.state === "over") {
        text("GAME OVER", VW / 2, 56, 20, "#f0876a", "center");
        text("SPACE / TAP TO RETRY", VW / 2, 84, 10, "#8fd8a5", "center");
      }
    }

    const quit = el("button", "game-quit", "Quit");
    quit.type = "button";

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); game.close(); return; }
      if (e.target === quit && e.key === "Enter") return; // Enter on Quit quits
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === "Enter") {
        e.preventDefault();
        if (!e.repeat) jump();
      }
    }
    function onPointer(e) {
      if (e.target === quit) return;
      e.preventDefault();
      jump();
    }

    const game = openOverlay(function (ctx, w, h, t) {
      const dt = Math.min(0.05, t - S.last);
      S.last = t;
      update(dt);
      render(t, dt);
      let scale = Math.min(w / VW, h / VH);
      if (scale >= 2) scale = Math.floor(scale);
      const dw = Math.round(VW * scale), dh = Math.round(VH * scale);
      ctx.fillStyle = "#0b0f0c";
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, Math.round((w - dw) / 2), Math.round((h - dh) / 2), dw, dh);
    }, {
      className: "game",
      interactive: true,
      dialogLabel: "Bug Hop mini-game. Space or tap to jump, Escape to quit.",
      frameMs: 14,
      extra: quit,
      onClose: function () {
        window.removeEventListener("keydown", onKey, true);
        if (opener) opener.focus();
      },
    });
    if (!game) return;

    quit.addEventListener("click", function () { game.close(); });
    game.box.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey, true);
    // Focus the game area (not the Quit button), so Space always jumps.
    game.box.tabIndex = -1;
    game.box.focus({ preventScroll: true });
  }
})();
