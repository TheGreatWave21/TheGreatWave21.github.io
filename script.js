/* ==========================================================================
   GREATWAVE OS 3.0: behaviour for the home page
   --------------------------------------------------------------------------
   The page content is plain HTML in index.html. This file only adds:
     1. Panel switching (sidebar + #hash links, back/forward, keys 1-4)
     2. Header readouts (date, local time, session time, panel number)
     3. Boot screen + frame power-on (first visit per session, skippable)
     4. Faint pointer trail (mouse only)
     5. Hidden easter eggs: type a word anywhere on the page
   Without JavaScript all panels are shown one after another.
   ========================================================================== */
"use strict";

/* Text used by the easter eggs and boot screen. Edit freely. */
const EGGS = {
  whoami: "guest · visiting Kenan: student, founder of Barcona Systems, code & circuits guy.",
  sudo: "Permission denied: guest is not in the sudoers file. This incident will be reported. (To nobody. But still.)",
  coffee: "418 I’m a teapot. Brewing anyway. Productivity +10 for the next 25 minutes: try Flow.",
  wave: {
    art:
      "            ___\n" +
      "        .-~~   ~~-.\n" +
      "     .-~    .-~~-. \\\n" +
      "   .~     .~      '~'\n" +
      "~~~   ~~~~   ~~~~~   ~~~",
    text: "The great wave, in 5 lines of ASCII.",
  },
  quote: "“Force without power falls to its own weight.”",
  alert: "Red alert. False alarm: someone left a soldering iron on. Standing down in 5 seconds.",
  matrix: "Wake up, guest … (any key or click to stop)",
};

const BOOT = {
  status: "Initializing",
  left: "Greatwave OS <b>3.0</b>",
  right: "Kenan // Code &amp; Circuits",
};

(function () {
  /* ---- Settings ---------------------------------------------------------- */
  const PANELS = ["home", "about", "projects", "contact"]; // order = keys 1-4
  const BOOT_MS = 1500;      // boot screen length
  const MATRIX_MS = 6000;    // matrix effect length
  const TRAIL_ALPHA = 0.14;  // pointer trail visibility (0 turns it off)
  const BOOT_KEY = "greatwave.booted";

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOUSE = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const root = document.documentElement;
  const display = document.getElementById("display");
  const scroller = document.getElementById("panels");
  const toastEl = document.getElementById("toast");
  const navLinks = Array.from(document.querySelectorAll(".nav-btn[data-panel]"));

  function store(method, key, value) {
    try {
      return window.sessionStorage[method](key, value);
    } catch (err) {
      return null; // storage blocked: the page still works
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---- 1. Panels ----------------------------------------------------------
     The URL hash picks the panel (#about, #projects …), so links can be
     shared and the browser's back button works.                            */
  let current = "";

  function panelFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    return PANELS.indexOf(id) !== -1 ? id : "home";
  }

  function show(id, opts) {
    opts = opts || {};
    if (id === current) return;
    const first = current === "";
    current = id;

    PANELS.forEach(function (name) {
      const panel = document.getElementById(name);
      const on = name === id;
      panel.hidden = !on;
      panel.classList.remove("enter");
      if (on && !first && !REDUCED) {
        void panel.offsetWidth; // restart the animation
        panel.classList.add("enter");
      }
    });

    navLinks.forEach(function (a) {
      if (a.dataset.panel === id) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    document.getElementById("ro-panel").textContent = String(PANELS.indexOf(id) + 1).padStart(2, "0");
    scroller.scrollTop = 0;

    if (!first) {
      if (!REDUCED) {
        display.classList.remove("scan");
        void display.offsetWidth;
        display.classList.add("scan");
      }
      // Move focus to the new panel so keyboard and screen-reader users
      // land on its heading.
      if (opts.focus !== false) document.getElementById(id).focus({ preventScroll: true });
    }
  }

  window.addEventListener("hashchange", function () {
    show(panelFromHash());
  });

  // Clicking the link of the panel already on screen: nothing to change.
  document.addEventListener("click", function (e) {
    const link = e.target.closest("a[data-panel]");
    if (link && link.dataset.panel === current && location.hash === "#" + current) e.preventDefault();
  });

  // Keys 1-4 switch panels (ignored while typing in a form field).
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || matrixStop) return;
    const n = Number(e.key);
    if (n >= 1 && n <= PANELS.length) location.hash = PANELS[n - 1];
  });

  /* ---- 2. Header readouts ------------------------------------------------ */
  const started = Date.now();
  const pad = function (n) { return String(n).padStart(2, "0"); };
  const ro = {
    date: document.getElementById("ro-date"),
    time: document.getElementById("ro-time"),
    up: document.getElementById("ro-up"),
  };

  function tick() {
    const now = new Date();
    const up = Math.floor((Date.now() - started) / 1000);
    ro.date.textContent = now.getFullYear() + "." + pad(now.getMonth() + 1) + "." + pad(now.getDate());
    ro.time.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    ro.up.textContent = pad(Math.floor(up / 3600)) + ":" + pad(Math.floor(up / 60) % 60) + ":" + pad(up % 60);
  }
  tick();
  setInterval(tick, 1000);

  function fillTicks(container, count) {
    for (let i = 0; i < count; i++) {
      const t = el("i");
      t.style.setProperty("--t", i);
      container.append(t);
    }
    return Array.from(container.children);
  }
  fillTicks(document.getElementById("head-ticks"), 22);

  /* ---- 3. Boot screen ----------------------------------------------------- */
  function boot() {
    if (REDUCED || store("getItem", BOOT_KEY) === "1") return;
    store("setItem", BOOT_KEY, "1");

    const screen = el("div", "boot");
    screen.setAttribute("aria-hidden", "true");
    const box = el("div", "boot-box");
    box.append(el("span", "boot-tab", "SYS · INIT"));
    box.append(el("div", "boot-status", BOOT.status));
    const ticks = fillTicks(el("div", "ticks"), 16);
    box.append(ticks[0].parentNode);
    const meta = el("div", "boot-meta");
    const left = el("span"); left.innerHTML = BOOT.left;
    const right = el("span"); right.innerHTML = BOOT.right;
    meta.append(left, right);
    box.append(meta);
    screen.append(box);
    display.append(screen);
    root.classList.add("powering");

    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const lit = Math.ceil(((now - start) / BOOT_MS) * ticks.length);
      ticks.forEach(function (t, i) { t.classList.toggle("on", i < lit); });
      if (now - start < BOOT_MS) frame = requestAnimationFrame(step);
      else finish();
    });

    function finish() {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", finish, true);
      window.removeEventListener("pointerdown", finish, true);
      screen.classList.add("done");
      setTimeout(function () { screen.remove(); }, 500);
      setTimeout(function () { root.classList.remove("powering"); }, 900);
    }

    // Any key or click skips it.
    window.addEventListener("keydown", finish, true);
    window.addEventListener("pointerdown", finish, true);
  }

  /* ---- 4. Pointer trail ---------------------------------------------------
     A thin line of tiny dots that fades in about a quarter of a second.     */
  function initTrail() {
    if (!TRAIL_ALPHA) return;
    const canvas = document.getElementById("trail");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.classList.add("on");

    const LIFE = 260;
    const points = [];
    let frame = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now) {
      frame = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      while (points.length && now - points[0].t > LIFE) points.shift();
      ctx.fillStyle = getComputedStyle(root).getPropertyValue("--c3").trim() || "#67caf0";
      points.forEach(function (p) {
        const life = 1 - (now - p.t) / LIFE;
        ctx.globalAlpha = TRAIL_ALPHA * life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + 1.5 * life, 0, Math.PI * 2);
        ctx.fill();
      });
      if (points.length) frame = requestAnimationFrame(draw);
    }

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      const last = points[points.length - 1];
      if (!last || Math.hypot(e.clientX - last.x, e.clientY - last.y) > 5) {
        points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
        if (points.length > 18) points.shift();
      }
      if (!frame) frame = requestAnimationFrame(draw);
    }, { passive: true });

    window.addEventListener("resize", resize);
    resize();
  }

  /* ---- 5. Easter eggs -----------------------------------------------------
     Type one of these words anywhere on the page:
       whoami · sudo · coffee · wave · quote · redalert · matrix           */
  let toastTimer = 0;
  function toast(label, text, art) {
    toastEl.replaceChildren(el("span", "toast-label", label));
    if (art) toastEl.append(el("pre", "", art));
    toastEl.append(el("span", "", text));
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 6000);
  }

  let alertTimer = 0;
  const CODES = {
    whoami: function () { toast("whoami", EGGS.whoami); },
    sudo: function () { toast("sudo", EGGS.sudo); },
    coffee: function () { toast("coffee", EGGS.coffee); },
    wave: function () { toast("wave", EGGS.wave.text, EGGS.wave.art); },
    quote: function () { toast("quote", EGGS.quote); },
    redalert: function () {
      toast("Red alert", EGGS.alert);
      root.classList.add("red-alert");
      clearTimeout(alertTimer);
      alertTimer = setTimeout(function () { root.classList.remove("red-alert"); }, 5000);
    },
    matrix: function () { matrix(); },
  };

  let typed = "";
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    if (!/[a-z]/i.test(e.key)) return;
    typed = (typed + e.key.toLowerCase()).slice(-12);
    Object.keys(CODES).some(function (code) {
      if (typed.slice(-code.length) === code) {
        typed = "";
        CODES[code]();
        return true;
      }
      return false;
    });
  });

  let matrixStop = null;
  function matrix() {
    if (REDUCED) {
      toast("matrix", "Skipped: your system asks for reduced motion.");
      return;
    }
    if (matrixStop) return;

    const canvas = el("canvas", "matrix");
    canvas.setAttribute("aria-hidden", "true");
    display.append(canvas);
    toast("matrix", EGGS.matrix);
    const ctx = canvas.getContext("2d");
    const size = 16;
    canvas.width = display.clientWidth;
    canvas.height = display.clientHeight;
    const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789<>/_$#";
    const drops = [];
    for (let c = 0; c < Math.ceil(canvas.width / size); c++) drops.push(Math.random() * -40);
    const css = getComputedStyle(root);
    const main = css.getPropertyValue("--c2").trim();
    const hi = css.getPropertyValue("--c4").trim();

    const timer = setInterval(function () {
      ctx.fillStyle = "rgba(0,0,0,0.14)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = size + "px monospace";
      drops.forEach(function (y, c) {
        ctx.fillStyle = Math.random() > 0.94 ? hi : main;
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], c * size, y * size);
        drops[c] = y * size > canvas.height && Math.random() > 0.96 ? 0 : y + 1;
      });
    }, 50);
    const timeout = setTimeout(stop, MATRIX_MS);

    function stop(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      clearInterval(timer);
      clearTimeout(timeout);
      window.removeEventListener("keydown", stop, true);
      window.removeEventListener("pointerdown", stop, true);
      matrixStop = null;
      canvas.classList.add("out");
      setTimeout(function () { canvas.remove(); }, 400);
      toastEl.classList.remove("show");
    }

    matrixStop = stop;
    setTimeout(function () {
      if (matrixStop !== stop) return;
      window.addEventListener("keydown", stop, true);
      window.addEventListener("pointerdown", stop, true);
    }, 0);
  }

  /* ---- Start -------------------------------------------------------------- */
  show(panelFromHash(), { focus: false });
  boot();
  if (MOUSE && !REDUCED) initTrail();
})();
