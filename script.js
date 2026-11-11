/* ==========================================================================
   GREATWAVE OS 4.0: behaviour for the home page
   --------------------------------------------------------------------------
   The page content is plain HTML in index.html. This file only adds:
     1. Panel switching (sidebar + #hash links, back/forward, keys 1-4)
     2. Header readouts (date, local time, session time, panel number)
     3. Boot screen + frame power-on (first visit per session, skippable)
     4. Faint pointer trail (mouse only)
     5. Hidden easter eggs: type a word anywhere on the page
     6. Screensaver after 90 s idle (or type "warp")
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
  engage: "Engaging. Course laid in for wherever Kenan is building next.",
  beam: "Energizing … panel rematerialized. All pieces accounted for.",
  konami: "Cheat code accepted. +30 lives, unlimited coffee, zero bugs (that last one is a lie).",
};

const BOOT = {
  status: "Initializing",
  left: "Greatwave OS <b>4.0</b>",
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

    const num = String(PANELS.indexOf(id) + 1).padStart(2, "0");
    document.getElementById("ro-panel").textContent = num;
    document.getElementById("panel-tag").textContent = num + " · " + id;
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
       whoami · sudo · coffee · wave · quote · redalert · matrix
       warp · engage · beam
     Also: the Konami code, and clicking the "GW-21" cap five times.           */
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
    warp: function () { screensaver.start(); },
    engage: function () { toast("engage", EGGS.engage); screensaver.start({ burst: 1800 }); },
    beam: function () { beam(); },
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

  /* ---- Easter egg: beam (transporter shimmer on the panel) --------------- */
  function beam() {
    toast("beam", EGGS.beam);
    if (REDUCED) return;
    scroller.classList.remove("beaming");
    void scroller.offsetWidth;
    scroller.classList.add("beaming");
    setTimeout(function () { scroller.classList.remove("beaming"); }, 1700);
  }

  /* ---- Easter egg: Konami code (up up down down left right left right b a) */
  const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft",
    "arrowright", "arrowleft", "arrowright", "b", "a"];
  let konamiAt = 0;
  document.addEventListener("keydown", function (e) {
    const k = e.key.toLowerCase();
    konamiAt = k === KONAMI[konamiAt] ? konamiAt + 1 : (k === KONAMI[0] ? 1 : 0);
    if (konamiAt === KONAMI.length) {
      konamiAt = 0;
      toast("konami", EGGS.konami);
      if (REDUCED) return;
      root.classList.add("konami");
      setTimeout(function () { root.classList.remove("konami"); }, 4000);
    }
  });

  /* ---- Easter egg: click the "GW-21" cap five times ---------------------- */
  const cap = document.querySelector(".side-cap-top");
  let capClicks = 0;
  let capTimer = 0;
  if (cap) {
    cap.addEventListener("click", function () {
      capClicks++;
      clearTimeout(capTimer);
      capTimer = setTimeout(function () { capClicks = 0; }, 1500);
      if (capClicks < 5) return;
      capClicks = 0;
      const up = Math.floor((Date.now() - started) / 1000);
      toast("diagnostics",
        "Display " + innerWidth + "×" + innerHeight + " @" + (window.devicePixelRatio || 1) + "x · " +
        "session " + pad(Math.floor(up / 60)) + ":" + pad(up % 60) + " · " +
        "panels 4/4 online · coffee reserves: low · all systems nominal.");
    });
  }

  /* ---- Screensaver --------------------------------------------------------
     After IDLE_MS without input (or when you type "warp"), a full-screen
     standby display appears: many horizontal stripes, each carrying a soft
     glow that travels right to left. The glows are staggered from stripe to
     stripe so together they form a rolling wave. Any input closes it.     */
  const IDLE_MS = 90000;

  const screensaver = (function () {
    let overlay = null;
    let raf = 0;
    let stopTimer = 0;
    let t0 = 0;
    let guardUntil = 0;
    let onResize = null;

    function draw(canvas, ctx, now) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const t = (now - t0) / 1000;
      const css = getComputedStyle(root);
      const cols = [
        css.getPropertyValue("--cyan").trim() || "#45b4de",
        css.getPropertyValue("--f3").trim() || "#a6aeca",
        css.getPropertyValue("--salmon").trim() || "#f0876a",
      ];

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const rows = Math.max(14, Math.min(44, Math.round(h / 24)));
      const band = h / rows;
      const thick = band * 0.5;
      const len = w * 0.42;          // length of each glow
      const period = 4.2;            // seconds for one glow to cross
      const span = w + len;

      for (let r = 0; r < rows; r++) {
        const y = r * band + (band - thick) / 2;
        const p = r / rows;
        // Stagger: a sine across the rows makes the glows form a wave.
        const lag = (Math.sin(p * Math.PI * 1.6) * 0.32 + p * 0.25) * period;
        const pos = (((t + lag) / period) % 1) * span;
        const head = w - pos;        // moves right -> left
        const col = r % 9 === 4 ? cols[2] : (r % 3 === 0 ? cols[1] : cols[0]);

        // faint resting stripe
        ctx.globalAlpha = 0.045;
        ctx.fillStyle = cols[1];
        ctx.fillRect(0, y, w, thick);

        // travelling glow: bright head on the left, fading tail to the right
        const g = ctx.createLinearGradient(head, 0, head + len, 0);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.04, col);
        g.addColorStop(0.35, col);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.11;                       // soft halo
        ctx.fillRect(head, y - thick * 0.6, len, thick * 2.2);
        ctx.globalAlpha = 0.34;                       // core
        ctx.fillRect(head, y, len, thick);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    function start(opts) {
      opts = opts || {};
      if (overlay || matrixStop) return;
      if (REDUCED) {
        if (!opts.burst) toast("warp", "Standby animation skipped: your system asks for reduced motion.");
        return;
      }

      overlay = el("div", "saver");
      overlay.setAttribute("aria-hidden", "true");
      const canvas = el("canvas");
      const label = el("div", "saver-label");
      const clock = el("b", "saver-clock");
      label.append(el("span", "", opts.burst ? "Warp" : "Greatwave OS · Standby"), clock);
      if (!opts.burst) label.append(el("small", "", "Move the mouse or press any key"));
      overlay.append(canvas, label);
      document.body.append(overlay);

      const ctx = canvas.getContext("2d");
      onResize = function () {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      onResize();
      window.addEventListener("resize", onResize);

      t0 = performance.now();
      let last = 0;
      (function loop(now) {
        raf = requestAnimationFrame(loop);
        if (now - last < 25) return;   // ~40 fps is plenty
        last = now;
        clock.textContent = ro.time.textContent;
        draw(canvas, ctx, now);
      })(t0);

      requestAnimationFrame(function () { if (overlay) overlay.classList.add("on"); });
      guardUntil = performance.now() + 400;  // ignore the input that started it
      if (opts.burst) stopTimer = setTimeout(stop, opts.burst);
    }

    function stop() {
      if (!overlay) return;
      cancelAnimationFrame(raf);
      clearTimeout(stopTimer);
      window.removeEventListener("resize", onResize);
      const o = overlay;
      overlay = null;
      o.classList.remove("on");
      setTimeout(function () { o.remove(); }, 450);
    }

    return {
      start: start,
      stop: stop,
      active: function () { return !!overlay; },
      guarded: function () { return performance.now() < guardUntil; },
    };
  })();

  // Idle timer: any input resets it, and closes the screensaver if it is up.
  let idleTimer = 0;
  function activity(e) {
    if (screensaver.active() && !screensaver.guarded()) {
      if (e.type === "keydown" || e.type === "pointerdown") {
        e.preventDefault();
        e.stopPropagation(); // the key or click that wakes it does nothing else
      }
      screensaver.stop();
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (!document.hidden) screensaver.start();
    }, IDLE_MS);
  }
  ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"].forEach(function (type) {
    window.addEventListener(type, activity, { capture: true, passive: type !== "keydown" && type !== "pointerdown" });
  });
  activity({ type: "init" });

  /* ---- Start -------------------------------------------------------------- */
  show(panelFromHash(), { focus: false });
  boot();
  if (MOUSE && !REDUCED) initTrail();
})();
