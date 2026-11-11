/* ==========================================================================
   GREATWAVE OS: terminal home page
   --------------------------------------------------------------------------
   1. CONTENT   all the copy and links. Edit this part to change the text.
   2. ENGINE    printing, commands, keyboard handling, boot sequence, effects.
                You should not need to touch it to change wording.

   Mini-markup you can use inside any CONTENT string:
     [label](url)   a link (http… opens in a new tab, /path stays in this tab)
     {command}      a clickable command, runs exactly as if typed
     "# Title"      a heading line
     "- item"       a bullet line
     "~ text"       a dimmer, secondary line
     "! text"       a highlighted line
     ""             an empty line

   NOTE: index.html contains a <noscript> copy of the main text for visitors
   without JavaScript. If you change wording here, update it there too.
   ========================================================================== */
"use strict";

/* ==========================================================================
   1. CONTENT
   ========================================================================== */

const LINKS = {
  github: "https://github.com/TheGreatWave21",
  linkedin: "https://www.linkedin.com/in/kenan-busch-barcona-systems/",
  barcona: "/barcona-systems/",                 // separate page on this domain
  barconaOfficial: "https://barconasystems.de", // official company site
  flow: "/flow/",                               // separate page on this domain
};

const CONTENT = {
  prompt: "kenan@greatwave:~$",

  /* ---- Boot sequence + greeting ---------------------------------------- */
  boot: [
    "Greatwave OS 2.0 · initializing display system",
    "Linking /home/kenan ··· online",
  ],
  greeting: "Heya, I'm Kenan.",
  tagline: "Software · Engineering · Robotics",
  intro: "I'm a student interested in software, engineering, physics, automation, and applied technology.",
  quote: "Force without power falls to its own weight.",
  hint: "~ Pick a command from the panel, or type {help} and press Enter.",

  /* ---- help: public commands, in display order. Anything not listed here
          is a hidden easter egg. ----------------------------------------- */
  help: {
    about: "who I am, what I focus on, what I'm exploring",
    focus: "focus areas only",
    now: "what I'm currently exploring",
    projects: "selected work",
    barcona: "go to the Barcona Systems page",
    flow: "go to Flow, a free focus timer",
    github: "open my GitHub profile in a new tab",
    contact: "where to reach me",
    ls: "list what's in this directory",
    clear: "clear the screen (Ctrl+L)",
    help: "show this list",
  },
  helpTips: "~ Tab completes · ↑/↓ history · Ctrl+L clears · every command is clickable",
  footer: "~ Built with HTML, CSS, JS, and GitHub Pages.",

  /* ---- ls: [name shown, command it runs] ------------------------------- */
  ls: [
    ["about.txt", "about"],
    ["focus.txt", "focus"],
    ["now.txt", "now"],
    ["projects/", "projects"],
    ["barcona-systems/", "barcona"],
    ["flow/", "flow"],
    ["github.url", "github"],
    ["contact.txt", "contact"],
  ],

  /* ---- about / focus / now --------------------------------------------- */
  about: [
    "# About",
    "I like turning ideas into working systems, especially where AI-driven automation, technical problem-solving, and practical engineering meet.",
    "",
    "I founded [Barcona Systems](" + LINKS.barcona + ") to build software and systems for logistics that connect research, experimentation, and real-world use.",
  ],
  focus: [
    "# Focus Areas",
    "- Software development",
    "- Automation",
    "- Engineering systems",
    "- Robotics",
    "- Research-driven projects",
  ],
  now: [
    "# Currently Exploring",
    "Sharpening my programming, building practical systems, and learning how research can be applied to real-world technical problems.",
    "",
    "I'm also digging deeper into physics.",
  ],
  aboutMore: "~ next: {projects} · {contact}",

  /* ---- projects --------------------------------------------------------- */
  projectsTitle: "# Selected Work",
  projects: [
    {
      title: "Barcona Systems",
      url: LINKS.barcona,
      desc: "Software, automation, and engineering systems for logistics.",
      extra: "official site: [barconasystems.de](" + LINKS.barconaOfficial + ")",
    },
    {
      title: "Flow",
      url: LINKS.flow,
      // TODO(Kenan): adjust the Flow wording here (and in `flow` below,
      // in help.flow above, and in the <noscript> block of index.html).
      desc: "A free focus timer for getting into deep work, built as a no-cost alternative to the Flow app.",
    },
    {
      title: "GitHub",
      url: LINKS.github,
      desc: "Coding projects, experiments, and technical notes.",
    },
    {
      title: "Technical Projects",
      url: "", // no link yet
      // TODO(Kenan): replace this placeholder with specific project names.
      // Copy one of the entries above for each project, for example:
      //   { title: "Project name", url: "https://…", desc: "One line about it." },
      desc: "Personal experiments in automation, security systems, and applied technology.",
      extra: "write-ups to follow; nothing published here yet.",
    },
  ],

  /* ---- contact (no email address on purpose) ---------------------------- */
  contact: [
    "# Contact",
    { row: ["github", "[github.com/TheGreatWave21](" + LINKS.github + ")"] },
    { row: ["linkedin", "[linkedin.com/in/kenan-busch-barcona-systems](" + LINKS.linkedin + ")"] },
  ],

  /* ---- commands that leave the page ------------------------------------- */
  barcona: [
    "# Barcona Systems",
    "Software, automation, and engineering systems for logistics.",
    "~ official site: [barconasystems.de](" + LINKS.barconaOfficial + ")",
    "",
    "Loading [/barcona-systems/](" + LINKS.barcona + ") ...",
  ],
  flow: [
    "# Flow",
    // TODO(Kenan): adjust the Flow wording.
    "A free focus timer for getting into deep work, built as a no-cost alternative to the Flow app.",
    "",
    "Loading [/flow/](" + LINKS.flow + ") ...",
  ],
  github: [
    "Opening [github.com/TheGreatWave21](" + LINKS.github + ") in a new tab ...",
    "~ Nothing happened? Your browser blocked the pop-up; use the link above.",
  ],

  /* ---- errors ------------------------------------------------------------ */
  notFound: "command not found: %s. ", // %s = what was typed
  notFoundHint: "Type {help}.",

  /* ---- easter eggs (hidden: not in help, not Tab-completed) -------------- */
  eggs: {
    whoami: [
      "guest",
      "~ ...visiting kenan: student, founder of Barcona Systems, code & circuits guy.",
    ],
    sudo: [
      "[sudo] password for guest: ********",
      "! Permission denied: guest is not in the sudoers file.",
      "~ This incident will be reported. (To nobody. But still.)",
    ],
    coffee: [
      { art: "     ( (\n      ) )\n   ........\n   |      |]\n   \\      /\n    `----'" },
      "! 418 I'm a teapot.",
      "~ Brewing anyway. Productivity +10 for the next 25 minutes: try {flow}.",
    ],
    wave: [
      {
        art:
          "              ___\n" +
          "          .-~~   ~~-.\n" +
          "       .-~    .-~~-. \\\n" +
          "     .~     .~      '~'\n" +
          "   .~     .~\n" +
          "~~~   ~~~~   ~~~~~   ~~~~~~",
      },
      "~ the great wave, rendered in 6 lines of ASCII.",
    ],
    exit: ["~ There is no exit, only the close-tab button."],
    cd: ["~ You're already home."],
    alert: [
      "! RED ALERT. All hands to battle stations.",
      "~ ...false alarm. Someone left a soldering iron on. Standing down in 5 seconds.",
    ],
    alertReduced: ["! RED ALERT (no flashing: your system asks for reduced motion). Standing down in 5 seconds."],
    matrixIntro: ["Wake up, guest ...", "~ (any key or click to stop)"],
    matrixOutro: ["~ Back in the real world. Try {help}."],
    matrixReduced: ["~ matrix: skipped, because your system asks for reduced motion.", "Wake up, guest ... and follow the white rabbit: {projects}"],
  },
};

/* ==========================================================================
   2. ENGINE
   ========================================================================== */
(function () {
  /* ---- Settings ---------------------------------------------------------- */
  const NAV_DELAY = 1400;   // ms the description stays up before barcona/flow navigate
  const MATRIX_MS = 6000;   // how long the matrix effect runs on its own
  const BOOT_KEY = "greatwave.booted";

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOUSE = matchMedia("(hover: hover) and (pointer: fine)").matches; // false on touch devices

  /* ---- Elements ---------------------------------------------------------- */
  const root = document.documentElement;
  const term = document.getElementById("console");
  const display = document.getElementById("display");
  const out = document.getElementById("output");
  const form = document.getElementById("prompt");
  const input = document.getElementById("cmd");
  const cursor = document.getElementById("cursor");

  form.querySelector(".prompt-label").textContent = CONTENT.prompt;

  /* ---- Small helpers ----------------------------------------------------- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function store(method, key, value) {
    try {
      return window.sessionStorage[method](key, value);
    } catch (err) {
      return null; // storage blocked (private mode etc.): the page still works
    }
  }

  function makeLink(label, url) {
    const a = el("a", "", label);
    a.href = url;
    if (/^https?:\/\//.test(url)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  }

  function makeCmd(label, cmd) {
    const b = el("button", "cmd-link", label);
    b.type = "button";
    b.dataset.cmd = cmd;
    return b;
  }

  /* Turns the mini-markup ([label](url) and {command}) into DOM nodes.
     Everything else stays plain text, so nothing is ever parsed as HTML. */
  function inline(text) {
    const frag = document.createDocumentFragment();
    const re = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]*)\)|\{([a-z]+)\}/g;
    let last = 0;
    let m;
    while ((m = re.exec(text))) {
      if (m.index > last) frag.append(text.slice(last, m.index));
      frag.append(m[3] ? makeCmd(m[3], m[3]) : makeLink(m[1], m[2]));
      last = re.lastIndex;
    }
    if (last < text.length) frag.append(text.slice(last));
    return frag;
  }

  /* Builds the DOM node for one content item (see the markup notes on top). */
  function render(item) {
    if (typeof item === "string") {
      const kinds = { "# ": ["h2", "heading"], "- ": ["p", "line bullet"], "~ ": ["p", "line dim"], "! ": ["p", "line alert"] };
      const kind = kinds[item.slice(0, 2)];
      const node = kind ? el(kind[0], kind[1]) : el("p", "line");
      node.append(inline(kind ? item.slice(2) : item));
      return node;
    }
    if (item.art) return el("pre", "art", item.art);
    if (item.row) {
      const node = el("p", "row");
      item.row.forEach(function (cell) {
        const span = el("span");
        span.append(inline(cell));
        node.append(span);
      });
      return node;
    }
    if (item.files) {
      const node = el("p", "files");
      item.files.forEach(function (f) {
        node.append(makeCmd(f[0], f[1]));
      });
      return node;
    }
    if (item.entry) {
      const e = item.entry;
      const node = el("p", "entry");
      const title = el("span", "entry-title");
      title.append(e.url ? makeLink(e.title, e.url) : e.title);
      const desc = el("span", "entry-desc");
      desc.append(inline(e.desc));
      node.append(title, desc);
      if (e.extra) {
        const extra = el("span", "entry-extra");
        extra.append(inline(e.extra));
        node.append(extra);
      }
      return node;
    }
    return el("p", "line");
  }

  /* A block = one command's echo line plus its output. */
  function newBlock() {
    const block = el("div", "block");
    let i = 0;
    out.append(block);
    return {
      node: block,
      add: function (node) {
        node.style.setProperty("--i", Math.min(i++, 30)); // staggered reveal
        block.append(node);
        return node;
      },
      print: function (items) {
        items.forEach(function (item) {
          this.add(render(item));
        }, this);
      },
    };
  }

  function echo(block, text) {
    const line = el("p", "line echo");
    line.append(el("span", "ps1", CONTENT.prompt + " "), el("span", "typed", text));
    block.add(line);
  }

  /* Scroll so the command just run starts at the top of the output area
     (or simply to the bottom when everything fits). */
  function reveal(block) {
    out.scrollTop = block.node.offsetTop - parseFloat(getComputedStyle(out).paddingTop) / 2;
  }

  /* ---- Commands ----------------------------------------------------------
     Each command gets the block to print into. Public commands are the ones
     with a description in CONTENT.help; the rest are easter eggs.          */
  const PUBLIC = Object.keys(CONTENT.help);

  const COMMANDS = {
    help: function (b) {
      b.print(["# Commands"]);
      b.print(PUBLIC.map(function (name) {
        return { row: ["{" + name + "}", CONTENT.help[name]] };
      }));
      b.print(["", CONTENT.helpTips, CONTENT.footer]);
    },
    ls: function (b) {
      b.print([{ files: CONTENT.ls }]);
    },
    about: function (b) {
      b.print([].concat(CONTENT.about, "", CONTENT.focus, "", CONTENT.now, "", CONTENT.aboutMore));
    },
    focus: function (b) {
      b.print(CONTENT.focus);
    },
    now: function (b) {
      b.print(CONTENT.now);
    },
    projects: function (b) {
      b.print([CONTENT.projectsTitle]);
      b.print(CONTENT.projects.map(function (p) {
        return { entry: p };
      }));
    },
    contact: function (b) {
      b.print(CONTENT.contact);
    },
    barcona: function (b) {
      b.print(CONTENT.barcona);
      navigate(LINKS.barcona);
    },
    flow: function (b) {
      b.print(CONTENT.flow);
      navigate(LINKS.flow);
    },
    github: function (b) {
      b.print(CONTENT.github);
      window.open(LINKS.github, "_blank", "noopener,noreferrer");
    },
    quote: function (b) {
      b.print(["! “" + CONTENT.quote + "”"]);
    },

    /* easter eggs */
    whoami: function (b) { b.print(CONTENT.eggs.whoami); },
    sudo: function (b) { b.print(CONTENT.eggs.sudo); },
    coffee: function (b) { b.print(CONTENT.eggs.coffee); },
    wave: function (b) { b.print(CONTENT.eggs.wave); },
    exit: function (b) { b.print(CONTENT.eggs.exit); },
    cd: function (b) { b.print(CONTENT.eggs.cd); },
    matrix: function (b) { matrix(b); },
    alert: function (b) { redAlert(b); },
  };

  /* Other spellings people will try. */
  const ALIASES = {
    "?": "help", man: "help", commands: "help",
    dir: "ls", ll: "ls", la: "ls",
    cls: "clear",
    "barcona-systems": "barcona",
    work: "projects", project: "projects",
    linkedin: "contact", email: "contact", mail: "contact",
    git: "github",
    logout: "exit", quit: "exit",
    tea: "coffee",
    red: "alert", redalert: "alert", "red-alert": "alert",
  };

  /* "cat about.txt", "cd flow/", "./projects" … all resolve to a command. */
  function resolve(raw) {
    const parts = raw.toLowerCase().split(/\s+/);
    let name = parts[0];
    if (["cat", "cd", "open", "less", "more", "run", "start"].indexOf(name) !== -1 && parts[1]) {
      const target = clean(parts[1]);
      if (COMMANDS[target] || ALIASES[target] || target === "clear") name = target;
      else if (name !== "cd") name = parts[1];
    } else {
      name = clean(name);
    }
    return ALIASES[name] || name;
  }

  function clean(word) {
    return word.replace(/^(\.\/|\/|~\/)/, "").replace(/\/$/, "").replace(/\.(txt|url|lnk)$/, "") || word;
  }

  let navTimer = 0;
  function navigate(url) {
    clearTimeout(navTimer);
    navTimer = setTimeout(function () {
      window.location.assign(url); // same tab
    }, NAV_DELAY);
  }

  /* ---- Running a command (typed, clicked or tapped: same path) ----------- */
  const history = [];
  let historyPos = 0; // index into history; history.length = "new line"
  let draft = "";

  function run(raw) {
    if (booting) {
      // A command issued during the boot sequence skips it, then runs.
      skipBoot();
      bootDone.then(function () { run(raw); });
      return;
    }
    const text = String(raw).trim().slice(0, 120);
    if (text) {
      if (history[history.length - 1] !== text) history.push(text);
      historyPos = history.length;
    }
    const name = text ? resolve(text) : "";
    if (text) setCount(commandCount + 1);
    markCurrent(name);

    if (name === "clear") {
      clearScreen();
      return;
    }

    const block = newBlock();
    echo(block, text);
    if (name) {
      if (Object.prototype.hasOwnProperty.call(COMMANDS, name)) {
        COMMANDS[name](block);
      } else {
        const line = el("p", "line alert");
        line.append(CONTENT.notFound.replace("%s", function () { return name; }), inline(CONTENT.notFoundHint));
        block.add(line);
      }
    }
    reveal(block);
  }

  function clearScreen() {
    out.replaceChildren();
    out.scrollTop = 0;
  }

  /* Highlights the panel button for the command that just ran. */
  const buttons = Array.from(document.querySelectorAll(".cmds .btn"));
  function markCurrent(name) {
    buttons.forEach(function (btn) {
      const on = btn.dataset.cmd === name;
      btn.classList.toggle("is-current", on);
      if (on) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
  }

  /* ---- Header readouts: real date, local time, session time, commands ---- */
  const started = Date.now();
  let commandCount = 0;
  const ro = {
    date: document.getElementById("ro-date"),
    time: document.getElementById("ro-time"),
    up: document.getElementById("ro-up"),
    cmds: document.getElementById("ro-cmds"),
  };
  const pad = function (n) { return String(n).padStart(2, "0"); };

  function tickClock() {
    const now = new Date();
    const up = Math.floor((Date.now() - started) / 1000);
    ro.date.textContent = now.getFullYear() + "." + pad(now.getMonth() + 1) + "." + pad(now.getDate());
    ro.time.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    ro.up.textContent = pad(Math.floor(up / 3600)) + ":" + pad(Math.floor(up / 60) % 60) + ":" + pad(up % 60);
  }

  function setCount(n) {
    commandCount = n;
    ro.cmds.textContent = String(n).padStart(3, "0");
  }

  tickClock();
  setInterval(tickClock, 1000);

  /* ---- Clicks: chips, commands in the output, focus ---------------------- */
  document.addEventListener("click", function (e) {
    const trigger = e.target.closest("[data-cmd]");
    if (trigger) {
      run(trigger.dataset.cmd);
      // Desktop: hand focus back to the prompt. Touch: don't, it would pop
      // up the on-screen keyboard after every tap.
      if (MOUSE) input.focus({ preventScroll: true });
      return;
    }
    // Clicking empty terminal space focuses the prompt (unless selecting text).
    if (MOUSE && term.contains(e.target) && !e.target.closest("a, button, input") &&
        String(window.getSelection()) === "") {
      input.focus({ preventScroll: true });
    }
  });

  /* ---- Keyboard ---------------------------------------------------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const value = input.value;
    input.value = "";
    draft = "";
    syncCursor();
    run(value);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyPos === history.length) draft = input.value;
      if (historyPos > 0) setInput(history[--historyPos]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPos < history.length) {
        historyPos++;
        setInput(historyPos === history.length ? draft : history[historyPos]);
      }
    } else if (e.key === "Tab" && !e.shiftKey && input.value.trim() !== "") {
      // Only when something is typed, so Tab still moves focus normally
      // from an empty prompt.
      e.preventDefault();
      complete();
    } else if (e.key === "Escape") {
      setInput("");
    }
  });

  function setInput(value) {
    input.value = value;
    input.setSelectionRange(value.length, value.length);
    syncCursor();
  }

  function complete() {
    const typed = input.value.trim().toLowerCase();
    const matches = PUBLIC.filter(function (name) {
      return name.indexOf(typed) === 0;
    });
    if (matches.length === 1) {
      setInput(matches[0]);
    } else if (matches.length > 1) {
      // Extend to the longest shared prefix and list the candidates.
      let prefix = matches[0];
      matches.forEach(function (name) {
        while (name.indexOf(prefix) !== 0) prefix = prefix.slice(0, -1);
      });
      setInput(prefix);
      const block = newBlock();
      echo(block, typed);
      block.print([{ files: matches.map(function (name) { return [name, name]; }) }]);
      reveal(block);
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      if (booting) skipBoot();
      bootDone.then(clearScreen);
      return;
    }
    // Start typing anywhere and it lands in the prompt.
    const printable = e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.altKey && !e.metaKey;
    if (printable && e.target !== input && !matrixStop) input.focus({ preventScroll: true });
  });

  /* ---- Block cursor ------------------------------------------------------
     The real caret is hidden; this positions the block where the caret is. */
  const measure = el("span");
  measure.setAttribute("aria-hidden", "true");
  measure.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;white-space:pre;pointer-events:none";
  input.parentNode.append(measure);

  function syncCursor() {
    const start = input.selectionStart == null ? input.value.length : input.selectionStart;
    const hasSelection = input.selectionEnd !== start;
    measure.textContent = input.value.slice(0, start);
    const x = measure.getBoundingClientRect().width - input.scrollLeft;
    const max = input.clientWidth - cursor.offsetWidth;
    cursor.hidden = hasSelection;
    cursor.style.setProperty("--x", Math.max(0, Math.min(x, Math.max(0, max))) + "px");
  }

  ["input", "keyup", "click", "focus", "blur", "select", "scroll"].forEach(function (type) {
    input.addEventListener(type, syncCursor);
  });
  input.addEventListener("keydown", function () {
    requestAnimationFrame(syncCursor); // after the caret has moved
  });
  window.addEventListener("resize", syncCursor);

  /* ---- Phones: keep the prompt above the on-screen keyboard --------------
     The panel is sized to the *visible* viewport, which shrinks when the
     keyboard opens.                                                        */
  const vv = window.visualViewport;
  function fitViewport() {
    root.style.setProperty("--app-h", (vv ? vv.height : window.innerHeight) + "px");
    term.style.transform = vv && vv.offsetTop ? "translateY(" + vv.offsetTop + "px)" : "";
  }
  fitViewport();
  if (vv) {
    vv.addEventListener("resize", fitViewport);
    vv.addEventListener("scroll", fitViewport);
  }
  window.addEventListener("resize", fitViewport);
  input.addEventListener("focus", function () {
    setTimeout(function () { out.scrollTop = out.scrollHeight; }, 250); // after the keyboard animates in
  });

  /* ---- Boot sequence -----------------------------------------------------
     ~2 s, skippable with any key or click, shown once per session.         */
  let booting = true;
  let skipped = REDUCED || store("getItem", BOOT_KEY) === "1";
  const waiters = new Set();
  let bootDone;

  function sleep(ms) {
    if (skipped) return Promise.resolve();
    return new Promise(function (resolve) {
      const finish = function () {
        clearTimeout(timer);
        waiters.delete(finish);
        resolve();
      };
      const timer = setTimeout(finish, ms);
      waiters.add(finish);
    });
  }

  function skipBoot() {
    if (!booting || skipped) return;
    skipped = true;
    root.classList.remove("powering");
    Array.from(waiters).forEach(function (finish) { finish(); });
  }

  /* Types text into a node, a few characters per frame. Instant if skipped. */
  async function type(node, text, msPerChar) {
    node.classList.add("typing");
    const step = Math.max(1, Math.round(16 / msPerChar));
    for (let i = 0; i < text.length && !skipped; i += step) {
      node.textContent = text.slice(0, i + step);
      await sleep(Math.max(16, msPerChar));
    }
    node.textContent = text;
    node.classList.remove("typing");
  }

  async function boot() {
    const replay = !skipped; // false: seen this session, or reduced motion
    out.setAttribute("aria-busy", "true"); // don't announce letter by letter
    window.addEventListener("keydown", skipBoot, true);
    window.addEventListener("pointerdown", skipBoot, true);

    const block = newBlock();
    if (replay) {
      root.classList.add("powering"); // panel power-on animation (CSS)
      await sleep(450);
      for (const text of CONTENT.boot) {
        await type(block.add(el("p", "line boot")), text, 6);
        await sleep(110);
      }
      block.add(el("p", "line"));
    }

    await type(block.add(el("p", "headline")), CONTENT.greeting, 42);
    await type(block.add(el("p", "tagline")), CONTENT.tagline, 10);

    const rest = newBlock();
    rest.add(el("p", "line", CONTENT.intro));
    rest.add(el("p", "line"));
    rest.add(el("p", "line quote", "“" + CONTENT.quote + "”"));
    rest.print(["", CONTENT.hint]);

    window.removeEventListener("keydown", skipBoot, true);
    window.removeEventListener("pointerdown", skipBoot, true);
    store("setItem", BOOT_KEY, "1");
    out.setAttribute("aria-busy", "false");
    booting = false;
    setTimeout(function () { root.classList.remove("powering"); }, 600);
  }

  /* ---- Pointer trail (mouse devices only) --------------------------------
     A faint, thin line of small dots that fades within ~1/4 s. No halo.
     TRAIL_ALPHA sets how visible it is (0 turns it off).                   */
  const TRAIL_ALPHA = 0.16;

  function initTrail() {
    if (!TRAIL_ALPHA) return;
    const canvas = document.getElementById("trail");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.classList.add("on");

    const LIFE = 260; // ms a dot lives
    const points = [];
    let frame = 0;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      schedule();
    }

    function draw(now) {
      frame = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      while (points.length && now - points[0].t > LIFE) points.shift();
      ctx.fillStyle = getComputedStyle(root).getPropertyValue("--p2").trim() || "#ffcc99";
      points.forEach(function (p) {
        const life = 1 - (now - p.t) / LIFE;
        ctx.globalAlpha = TRAIL_ALPHA * life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + 1.5 * life, 0, Math.PI * 2);
        ctx.fill();
      });
      if (points.length) schedule();
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      const last = points[points.length - 1];
      if (!last || Math.hypot(e.clientX - last.x, e.clientY - last.y) > 5) {
        points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
        if (points.length > 18) points.shift();
      }
      schedule();
    }, { passive: true });

    window.addEventListener("resize", resize);
    resize();
  }

  /* ---- Easter egg: red alert ---------------------------------------------- */
  let alertTimer = 0;
  function redAlert(block) {
    block.print(REDUCED ? CONTENT.eggs.alertReduced : CONTENT.eggs.alert);
    root.classList.add("red-alert");
    clearTimeout(alertTimer);
    alertTimer = setTimeout(function () {
      root.classList.remove("red-alert");
    }, 5000);
  }

  /* ---- Easter egg: matrix ------------------------------------------------ */
  let matrixStop = null;

  function matrix(block) {
    if (REDUCED) {
      block.print(CONTENT.eggs.matrixReduced);
      return;
    }
    if (matrixStop) return;
    block.print(CONTENT.eggs.matrixIntro);

    const canvas = el("canvas", "matrix");
    canvas.setAttribute("aria-hidden", "true");
    display.append(canvas);
    const ctx = canvas.getContext("2d");
    const size = 16;
    canvas.width = display.clientWidth;
    canvas.height = display.clientHeight;
    const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789<>/_$#";
    const drops = [];
    for (let c = 0; c < Math.ceil(canvas.width / size); c++) drops.push(Math.random() * -40);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tick = setInterval(function () {
      ctx.fillStyle = "rgba(0,0,0,0.14)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = size + "px monospace";
      drops.forEach(function (y, c) {
        ctx.fillStyle = Math.random() > 0.94 ? "#e9ffee" : "#3cff74";
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], c * size, y * size);
        drops[c] = y * size > canvas.height && Math.random() > 0.96 ? 0 : y + 1;
      });
    }, 50);

    const timeout = setTimeout(stop, MATRIX_MS);

    function stop(e) {
      if (e) { // the key/click that ends the effect does nothing else
        e.preventDefault();
        e.stopPropagation();
      }
      clearInterval(tick);
      clearTimeout(timeout);
      window.removeEventListener("keydown", stop, true);
      window.removeEventListener("pointerdown", stop, true);
      matrixStop = null;
      canvas.classList.add("out");
      setTimeout(function () { canvas.remove(); }, 400);
      block.print(CONTENT.eggs.matrixOutro);
      reveal(block);
      if (MOUSE) input.focus({ preventScroll: true });
    }

    matrixStop = stop;
    // Registered on the next tick so the Enter/click that started it doesn't end it.
    setTimeout(function () {
      if (matrixStop !== stop) return;
      window.addEventListener("keydown", stop, true);
      window.addEventListener("pointerdown", stop, true);
    }, 0);
  }

  /* ---- Start -------------------------------------------------------------- */
  clearScreen(); // drops the <noscript> placeholder
  syncCursor();
  if (MOUSE) input.focus({ preventScroll: true });
  if (MOUSE && !REDUCED) initTrail();
  bootDone = boot();
})();
