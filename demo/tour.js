// droplaunch.gg/demo: DropLaunch's real interface (app/, built by the app's dev/build_demo.py) in a
// window the size of the app's, and a tour beside it that ticks off each step as it happens in
// there. frame.js, loaded into the window before the app, reports what the app does.
(() => {
  const $ = (id) => document.getElementById(id);
  const HERE = new URL("/demo/", location.href);
  const APP = new URL("app/", HERE);

  const main = $("main");
  const win = $("win");
  const body = $("win-body");
  const frame = $("app");
  const cover = $("win-cover");
  const panel = $("tour");
  const list = $("tour-list");

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const clamp = (v, lo, hi) => Math.round(Math.max(lo, Math.min(v, hi)));
  const doc = () => {
    try {
      return frame.contentDocument;
    } catch {
      return null;
    }
  };

  // ---------------------------------------------------------------- the window
  /** The size DropLaunch opens at (src-tauri/tauri.conf.json). */
  const START = { width: 640, height: 950 };
  /** Never bigger than More options makes it: a first look shouldn't fill the whole screen. */
  const BIGGEST = { width: 1240, height: 950 };
  const LEAST = { width: 640, height: 560 };
  /** The current view's smallest size: the app sets it, like on Windows (app.js VIEW_MIN). */
  let least = { ...LEAST };
  /** The size asked for, by a drag or by the app: the window is that, or as much as fits. */
  let wanted = { ...START };
  /** The size it is (null on a small screen, where it's as wide as the page). */
  let shown = null;
  const wide = matchMedia("(min-width: 1100px)");

  /** How big the window can be next to the tour. */
  function room() {
    const cs = getComputedStyle(main);
    const chromeW = win.offsetWidth - body.offsetWidth;
    const chromeH = win.offsetHeight - body.offsetHeight;
    const width = main.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.columnGap) - panel.offsetWidth - chromeW;
    const height = main.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - chromeH;
    return { width: Math.min(BIGGEST.width, width), height: Math.min(BIGGEST.height, height) };
  }

  function fit(width, height, smooth = false) {
    if (!wide.matches) {
      body.style.removeProperty("width");
      body.style.removeProperty("height");
      shown = null;
    } else {
      const max = room();
      const w = clamp(width, Math.min(least.width, max.width), max.width);
      const h = clamp(height, Math.min(least.height, max.height), max.height);
      win.classList.toggle("smooth", smooth);
      body.style.width = `${w}px`;
      body.style.height = `${h}px`;
      shown = { width: w, height: h };
    }
    const size = shown ?? { width: body.clientWidth, height: body.clientHeight };
    $("win-size").textContent = `${size.width} × ${size.height}`;
  }

  // The edges resize it. The window stays in the middle, so each side moves half of what it grows.
  for (const grip of win.querySelectorAll(".grip")) {
    grip.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || !shown) return;
      e.preventDefault();
      const edge = grip.dataset.edge;
      const from = { x: e.clientX, y: e.clientY, ...shown };
      grip.setPointerCapture(e.pointerId);
      document.body.classList.add("resizing");
      document.body.dataset.edge = edge;
      const move = (ev) => {
        const dx = ev.clientX - from.x;
        const width = edge.includes("e") ? from.width + 2 * dx : edge.includes("w") ? from.width - 2 * dx : from.width;
        const height = edge.includes("s") ? from.height + ev.clientY - from.y : from.height;
        fit(width, height);
        wanted = { ...shown };
      };
      const end = () => {
        grip.removeEventListener("pointermove", move);
        grip.removeEventListener("pointerup", end);
        grip.removeEventListener("pointercancel", end);
        document.body.classList.remove("resizing");
        delete document.body.dataset.edge;
      };
      grip.addEventListener("pointermove", move);
      grip.addEventListener("pointerup", end);
      grip.addEventListener("pointercancel", end);
    });
  }
  $("win-bar").addEventListener("dblclick", () => {
    fit(START.width, START.height, true);
    if (shown) wanted = { ...shown };
  });
  new ResizeObserver(() => fit(wanted.width, wanted.height)).observe(main);

  // ---------------------------------------------------------------- the steps
  const steps = [...document.querySelectorAll(".step")].map((node) => ({
    id: node.dataset.step,
    node,
    head: node.querySelector(".step-head"),
    title: node.querySelector(".step-title").textContent,
    note: node.querySelector(".step-note"),
    body: node.querySelector(".step-body"),
    live: null,
    state: "todo",
    /** Opened or closed with a click (null: open while it's the next step). */
    open: null,
  }));
  const byId = Object.fromEntries(steps.map((s) => [s.id, s]));
  const finished = (s) => s.state === "done" || s.state === "skipped";
  /** The first step not done yet. */
  let current = null;

  function render() {
    const next = steps.find((s) => !finished(s)) ?? null;
    const moved = next !== current;
    current = next;
    for (const s of steps) {
      const open = s.open ?? s === current;
      s.node.dataset.state = s.state;
      s.node.classList.toggle("current", s === current);
      s.head.setAttribute("aria-expanded", String(open));
      s.body.hidden = !open;
    }
    const n = steps.filter(finished).length;
    $("tour-bar").style.width = `${(n / steps.length) * 100}%`;
    $("tour-count").textContent = `${n} of ${steps.length} done`;
    $("tour-mini-count").textContent = `${n} of ${steps.length}`;
    $("tour-mini-title").textContent = current ? current.title : "All done";
    $("tour-end").hidden = Boolean(current);
    if (moved) requestAnimationFrame(() => reveal(current ? current.node : $("tour-end")));
  }

  /** Scrolls the tour (when it scrolls by itself, beside the window) to the next step. */
  function reveal(node) {
    if (list.scrollHeight <= list.clientHeight) return;
    const top = node.offsetTop - 44;
    const bottom = node.offsetTop + node.offsetHeight + 12;
    if (top < list.scrollTop || bottom > list.scrollTop + list.clientHeight) list.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function mark(id, state, note = "") {
    const s = byId[id];
    // Done stays done (until Start over).
    if (!s || s.state === state || finished(s)) return;
    s.state = state;
    s.note.textContent = note;
    if (state !== "active") s.live.hidden = true;
    if (finished(s)) {
      s.open = null;
      s.node.classList.add("just");
      setTimeout(() => s.node.classList.remove("just"), 900);
    }
    render();
  }

  /** What a running step is doing: percent (undefined keeps the bar, null: not known) and a line. */
  function live(id, percent, text) {
    const s = byId[id];
    if (!s || s.state !== "active") return;
    s.live.hidden = false;
    const bar = s.live.querySelector("i");
    if (percent !== undefined) {
      s.live.classList.toggle("unknown", percent == null);
      bar.style.width = percent == null ? "" : `${Math.max(2, Math.min(100, percent))}%`;
      s.note.textContent = percent == null ? "" : `${Math.floor(percent)}%`;
    }
    if (text != null) s.live.querySelector("span").textContent = text;
  }

  const amount = (done, total) => {
    const unit = total >= 1e9 ? [1e9, "GB"] : total >= 1e6 ? [1e6, "MB"] : [1e3, "KB"];
    const f = (v) => (v / unit[0]).toFixed(unit[0] === 1e3 ? 0 : 1);
    return `${f(done)} of ${f(total)} ${unit[1]}`;
  };

  // ---------------------------------------------------------------- what happens in the window
  /** The setup's parts (mock.js setupScript, like the app's backend) and their steps. */
  const SETUP_TASKS = { steamcmd: "steamcmd", server: "server", framework: "framework", startfile: "startfile", launch: "launch" };
  /** The step a running job's progress belongs to. */
  let jobStep = null;
  /** Bug reports on the bug reports page's map. */
  let reports = 0;

  window.__demoTour = {
    command(cmd, args, phase, result) {
      if (phase === "start") {
        if (cmd === "setup_all") mark("setup", "done");
        if (cmd === "server_update") {
          jobStep = "update";
          mark("update", "active");
          live("update", null, "Starting SteamCMD…");
        }
        return;
      }
      const ok = phase === "done";
      switch (cmd) {
        case "setup_all":
          // Cancelled or failed: what was running isn't done.
          if (!ok || !result?.ok) for (const id of Object.values(SETUP_TASKS)) if (byId[id].state === "active") mark(id, "todo");
          jobStep = null;
          break;
        case "server_update":
          mark("update", ok && result?.ok ? "done" : "todo");
          jobStep = null;
          break;
        case "start_server":
          if (ok && args.target?.kind === "map" && ["started", "queued"].includes(result?.result)) mark("map", "done");
          break;
        case "join_server":
        case "restart_rust_and_join":
          if (ok) mark("join", "done");
          break;
        case "create_start_file":
          if (ok && args.target?.kind === "map") mark("mapfiles", "done");
          break;
        case "server_command":
          // Not the profiler's own commands.
          if (ok && !/^c\.profile\b/.test(args.text ?? "")) mark("console", "done");
          break;
        case "kit_give":
          if (ok) mark("kits", "done");
          break;
        case "stop_server":
          if (ok) mark("stop", "done");
          break;
      }
    },

    progress(cmd, ev) {
      if (cmd === "setup_all" && ev.kind === "task" && SETUP_TASKS[ev.task]) {
        const id = SETUP_TASKS[ev.task];
        if (ev.state === "active") {
          jobStep = id;
          mark(id, "active");
          live(id, null, "Starting…");
        } else if (ev.state === "done") mark(id, "done");
        else if (ev.state === "skipped") mark(id, "skipped", "Skipped");
        else mark(id, "todo");
        return;
      }
      if (!jobStep) return;
      if (ev.kind === "progress") live(jobStep, ev.percent, ev.total ? `${ev.text} · ${amount(ev.done, ev.total)}` : ev.text);
      else if (ev.kind === "status") live(jobStep, undefined, ev.text);
    },

    event(name, payload) {
      if (name === "playtest") {
        reports = payload?.reports?.length ?? 0;
        return;
      }
      if (payload?.kind !== "state") return;
      const s = payload.server;
      const up = s && (s.phase === "booting" || s.phase === "ready");
      if (!up) {
        if (byId.ready.state === "active") mark("ready", "todo");
        return;
      }
      mark("launch", "done");
      if (s.phase === "ready") return mark("ready", "done");
      mark("ready", "active");
      live("ready", s.boot?.percent ?? null, s.boot?.detail || "Starting the server…");
    },

    resize(width, height) {
      wanted = { width, height };
      fit(width, height, true);
    },

    minSize(width, height) {
      least = { width, height };
      fit(wanted.width, wanted.height, true);
    },
  };

  // The bug reports page is open with a report on it.
  setInterval(() => {
    if (reports > 0 && doc()?.body?.classList.contains("playtest-open")) mark("bug", "done");
  }, 400);

  // ---------------------------------------------------------------- Show me
  const visible = (node) => (node && node.getClientRects().length && !node.closest("[hidden]") ? node : null);
  const find = (d, selector) => visible(d.querySelector(selector));
  const setupTasks = (d) => find(d, "#setup-tasks") ?? find(d, "#strip");
  const customMap = (d) => [...d.querySelectorAll("#map-list .map-row")].find((row) => /\.map$/i.test(row.title) && visible(row));
  /** More options (the console, server files, kits and bug reports): the window gets wider. */
  async function moreOptions(d) {
    if (!d.body.classList.contains("simple")) return;
    d.getElementById("btn-view")?.click();
    await wait(450);
  }
  async function unfold(d, id) {
    const card = d.getElementById(id);
    if (!card?.classList.contains("folded")) return;
    card.querySelector(".fold-btn")?.click();
    await wait(120);
  }

  /** What each step's Show me points at (null: its Do it line flashes instead). */
  const SHOW = {
    setup: (d) => find(d, "#welcome-host") ?? find(d, "#setup-fix") ?? find(d, "#strip-action"),
    steamcmd: setupTasks,
    server: setupTasks,
    framework: (d) => find(d, "#setup-framework") ?? setupTasks(d),
    startfile: setupTasks,
    launch: (d) => setupTasks(d) ?? find(d, "#map-list .map-row .row-play"),
    ready: (d) => find(d, "#server-panel"),
    join: (d) => find(d, "#server-panel .btn-primary"),
    map: (d) => customMap(d)?.querySelector(".row-play") ?? null,
    async mapfiles(d) {
      const row = customMap(d);
      if (!row) return null;
      const r = row.getBoundingClientRect();
      row.dispatchEvent(new d.defaultView.MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
      await wait(60);
      return [...d.querySelectorAll(".ctx-menu [role=menuitem]")].find((b) => /start file/i.test(b.textContent)) ?? row;
    },
    async bug(d) {
      await moreOptions(d);
      await unfold(d, "bugs-card");
      return find(d, "#bugs-card");
    },
    async console(d) {
      await moreOptions(d);
      return find(d, "#console-form");
    },
    async kits(d) {
      await moreOptions(d);
      await unfold(d, "kits-card");
      return find(d, "#kits-card");
    },
    stop: (d) => find(d, "#server-panel .btn-danger"),
    async update(d) {
      await moreOptions(d);
      if (!find(d, "#view-files")) {
        d.getElementById("tab-files")?.click();
        await wait(150);
      }
      return find(d, "#btn-primary:not([disabled])") ?? find(d, "#btn-verify");
    },
  };

  /** A ring around `target` in the window for a few seconds. */
  let stopRing = null;
  function ring(d, target) {
    stopRing?.();
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
    const view = d.defaultView;
    const node = d.createElement("div");
    node.className = "tour-ring";
    d.body.append(node);
    const until = performance.now() + 3200;
    let raf = 0;
    const stop = () => {
      view.cancelAnimationFrame(raf);
      node.classList.add("out");
      setTimeout(() => node.remove(), 300);
      if (stopRing === stop) stopRing = null;
    };
    const follow = (now) => {
      const r = target.getBoundingClientRect();
      Object.assign(node.style, { left: `${r.left - 5}px`, top: `${r.top - 5}px`, width: `${r.width + 10}px`, height: `${r.height + 10}px` });
      if (now < until && target.isConnected && r.width) raf = view.requestAnimationFrame(follow);
      else stop();
    };
    stopRing = stop;
    raf = view.requestAnimationFrame(follow);
  }

  async function showMe(s) {
    const d = doc();
    const target = d?.body ? await Promise.resolve().then(() => SHOW[s.id](d)).catch(() => null) : null;
    if (target) return ring(d, target);
    const how = s.body.querySelector(".step-how");
    how.classList.remove("nudge");
    void how.offsetWidth;
    how.classList.add("nudge");
  }

  for (const s of steps) {
    s.node.querySelector(".step-mark").innerHTML = '<svg class="icon"><use href="#i-check" /></svg>';
    s.live = document.createElement("div");
    s.live.className = "step-live";
    s.live.hidden = true;
    s.live.innerHTML = '<div class="tour-bar"><i></i></div><span></span>';
    s.body.querySelector(".step-how")?.before(s.live);
    if (SHOW[s.id]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn small step-show";
      button.innerHTML = '<svg class="icon"><use href="#i-target" /></svg>Show me';
      button.addEventListener("click", () => showMe(s));
      s.body.append(button);
    }
    s.head.addEventListener("click", () => {
      s.open = !(s.open ?? s === current);
      render();
    });
  }

  // ---------------------------------------------------------------- the app
  // app/index.html as it is, plus a <base> so its files load from app/, and frame.js and
  // frame.css (the app's demo.js and mock.js stay as they are).
  let page = null;
  /** The window loads what load() gave it; any other load is the app reloading itself. */
  let expected = false;

  function prepare(html) {
    const mock = /<script src="mock\.js"[^>]*><\/script>/;
    if (!mock.test(html) || !html.includes("<head>")) throw new Error("app/index.html isn't the page tour.js expects");
    return html
      .replace("<head>", `<head>\n    <base href="${APP}" />`)
      .replace("</head>", `  <link rel="stylesheet" href="${new URL("frame.css", HERE)}" />\n  </head>`)
      .replace(mock, (tag) => `${tag}\n    <script src="${new URL("frame.js", HERE)}"></script>`);
  }

  async function load() {
    cover.hidden = false;
    cover.textContent = "Loading DropLaunch…";
    try {
      if (!page) {
        const reply = await fetch(APP);
        if (!reply.ok) throw new Error(`HTTP ${reply.status}`);
        page = prepare(await reply.text());
      }
      expected = true;
      frame.srcdoc = page;
    } catch (err) {
      console.error(err);
      cover.textContent = "The demo didn't load. Reload the page to try again.";
    }
  }

  frame.addEventListener("load", () => {
    if (!doc()?.body?.classList.contains("demo")) return;
    cover.hidden = true;
    // The app started again by itself (Settings can do that): so does the tour.
    if (!expected) reset();
    expected = false;
  });

  /** Every step back to not done, and the window to its starting size. */
  function reset() {
    for (const s of steps) {
      Object.assign(s, { state: "todo", open: null });
      s.note.textContent = "";
      s.live.hidden = true;
    }
    reports = 0;
    jobStep = null;
    least = { ...LEAST };
    wanted = { ...START };
    fit(START.width, START.height);
    current = null;
    render();
  }

  // Start over asks once more when something's done already.
  const restart = $("tour-restart");
  let sure = 0;
  restart.addEventListener("click", () => {
    const label = restart.querySelector("span");
    if (steps.some((s) => s.state !== "todo") && !sure) {
      label.textContent = "Sure? Click again";
      sure = setTimeout(() => {
        sure = 0;
        label.textContent = "Start over";
      }, 3000);
      return;
    }
    clearTimeout(sure);
    sure = 0;
    label.textContent = "Start over";
    reset();
    load();
  });

  fit(START.width, START.height);
  render();
  load();
})();
