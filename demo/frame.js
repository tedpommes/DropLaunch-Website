// Runs inside the demo's app window (demo/tour.js loads it after app/mock.js and before app.js):
// tells the tour what DropLaunch does (its commands, the setup's progress, the server's events)
// and lets the app resize its window the way it does on a PC (More options makes it wider).
(() => {
  const tour = window.parent !== window ? window.parent.__demoTour : null;
  const api = window.__TAURI__;
  if (!tour || !api) return;

  // util.js takes invoke from here when app.js loads, so the tour sees every command.
  const invoke = api.core.invoke;
  async function run(cmd, args = {}) {
    const channel = args?.onEvent;
    const deliver = (ev) => {
      tour.progress(cmd, ev);
      channel.onmessage?.(ev);
    };
    const call = channel
      ? {
          ...args,
          onEvent: {
            get onmessage() {
              return cmd === "setup_all" ? (ev) => setupEvent(ev, deliver) : deliver;
            },
          },
        }
      : args;
    tour.command(cmd, args, "start");
    try {
      const result = await invoke(cmd, call);
      tour.command(cmd, args, "done", result);
      return result;
    } catch (err) {
      tour.command(cmd, args, "failed", err);
      throw err;
    }
  }
  api.core.invoke = (cmd, args = {}) => {
    if (cmd === "setup_all") return setupAll(args);
    if (cmd === "update_setup_options" && setup) {
      Object.assign(setup.options, args.options);
      Object.assign(setup.mock, args.options, { startServer: false });
    }
    return run(cmd, args);
  };

  // ---------------------------------------------------------------- the setup
  // The mock plans the setup with the options it starts with, plays it fast and starts the server
  // right at its end. Here the setup goes slower, so there's time to look at the options (and
  // change them while it downloads, as in the app), and the server waits until the setup window
  // closes: Continue, or by itself when Continue when done is ticked.
  /** How much slower the mock's timers run during the setup. */
  const SETUP_SLOWER = 3;
  let slower = 1;
  const setTimer = window.setTimeout;
  window.setTimeout = function (fn, ms, ...rest) {
    if (slower > 1 && ms > 0 && /\/mock\.js(\?[^:\s]*)?:\d/.test(new Error().stack)) ms *= slower;
    return setTimer.call(this, fn, ms, ...rest);
  };

  const FRAMEWORKS = { carbon: "Carbon", oxide: "Oxide" };
  /** The setup that runs: the window's options (as changed meanwhile) and the mock's copy. */
  let setup = null;

  /**
   * In the app the options close once the downloads are done (they're used from then on), which
   * in the demo is only part of the way. Here they stay open to the end, to read them and try
   * Detect my Steam IDs. Done, Continue when done goes and Cancel turns into Next, as in the app;
   * Next shows how it went.
   */
  function keepOptionsOpen() {
    const [options, tasks, log, result, start] = ["setup-options", "setup-tasks", "setup-log", "setup-result", "setup-start"].map((id) => document.getElementById(id));
    // Nothing to download (the server's there already): straight to the steps, as in the app.
    if (!options || options.hidden) return;
    // The app stops passing on changed options once they'd be used: Run test map server still counts.
    const follow = () => setup && (setup.options.startServer = start.checked);
    const hold = () => {
      if (!result.hidden) {
        watch.disconnect();
        start.removeEventListener("change", follow);
        return;
      }
      if (options.hidden) options.hidden = false;
      if (!log.hidden) log.hidden = true;
      if (!tasks.classList.contains("compact")) tasks.classList.add("compact");
    };
    const watch = new MutationObserver(hold);
    for (const node of [options, log, result]) watch.observe(node, { attributes: true, attributeFilter: ["hidden"] });
    watch.observe(tasks, { attributes: true, attributeFilter: ["class"] });
    start.addEventListener("change", follow);
  }

  async function setupAll(args) {
    const options = { ...args.options };
    const mock = { ...options, startServer: false };
    setup = { options, mock, framework: false };
    slower = SETUP_SLOWER;
    keepOptionsOpen();
    let summary;
    try {
      summary = await run("setup_all", { ...args, options: mock });
    } finally {
      slower = 1;
      setup = null;
    }
    if (!summary?.ok || !options.startServer) return summary;
    const box = document.getElementById("setup");
    const start = () =>
      invoke("start_server", { target: options.startMap ? { kind: "map", path: options.startMap } : { kind: "procgen" }, prefab: options.prefab }).catch(() => {});
    if (box.hidden) start();
    else {
      const closed = new MutationObserver(() => {
        if (!box.hidden) return;
        closed.disconnect();
        start();
      });
      closed.observe(box, { attributes: true, attributeFilter: ["hidden"] });
    }
    // Continue when done ticked: the app presses Continue by itself.
    const waits = !box.hidden && !document.getElementById("setup-auto").checked;
    return { ...summary, detail: `${summary.detail} · ${waits ? "the server starts when you press Continue" : "server starting"}` };
  }

  /** The mock's setup events, fixed up for options changed while it ran. */
  function setupEvent(ev, deliver) {
    const o = setup?.options;
    if (!o) return deliver(ev);
    const name = FRAMEWORKS[o.framework];
    const task = (state, detail = "") => deliver({ kind: "task", task: "framework", state, detail });
    if (ev.kind === "task" && ev.task === "launch") {
      // The mock skips it (see setupAll): the tour waits for Next and Continue, or for the
      // countdown when Continue when done is ticked.
      if (o.startServer) tour.progress("setup_all", { ...ev, state: "waiting", auto: document.getElementById("setup-auto")?.checked === true });
      else deliver(ev);
      return;
    }
    if (ev.kind === "task") {
      setup.framework = ev.task === "framework" && ev.state === "active";
      if (ev.task !== "framework") return deliver(ev);
      if (!name) return ev.state === "active" ? task("skipped", "Not selected") : ev.state === "skipped" && deliver(ev);
      if (ev.state === "skipped") {
        task("active");
        return task("done", `${name}${o.rustedit ? " + RustEdit extension" : " installed"}`);
      }
      return deliver(ev.state === "done" ? { ...ev, detail: `${name}${o.rustedit ? " + RustEdit extension" : " installed"}` } : ev);
    }
    if (!setup.framework) return deliver(ev);
    if (name) deliver(ev.text ? { ...ev, text: ev.text.replace(/Oxide|Carbon/g, name) } : ev);
  }

  for (const name of ["server", "playtest"]) api.event.listen(name, (e) => tour.event(name, e.payload));

  // ---------------------------------------------------------------- dragging files in
  // A file dragged from the tour's Downloads folder (tour.dragging names it) reaches the app as on
  // a PC: the window shows what a drop would do, and the drop adds it. Files from the visitor's own
  // PC show that too; demo.js hands them over by name when they're dropped.
  let depth = 0;
  const fromPc = (e) => [...(e.dataTransfer?.types ?? [])].includes("Files");
  const drag = (type, names) => window.__mockDrag?.(type, names);
  document.addEventListener("dragenter", (e) => {
    if (!tour.dragging && !fromPc(e)) return;
    e.preventDefault();
    if (depth++ === 0) drag("enter", tour.dragging);
  });
  document.addEventListener("dragover", (e) => {
    if (!tour.dragging && !fromPc(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });
  document.addEventListener("dragleave", () => {
    if (depth > 0 && --depth === 0) drag("leave", null);
  });
  document.addEventListener("drop", (e) => {
    depth = 0;
    const names = tour.dragging;
    if (!names) return;
    e.preventDefault();
    e.stopPropagation();
    drag("drop", names);
  });
  /** The drag ended or went back to the page: the drop overlay goes. */
  window.__demoDragEnd = () => {
    if (depth === 0) return;
    depth = 0;
    drag("leave", null);
  };

  // The tour explains each step already, so the app's own tips start off (ticking Show me around
  // on the welcome screen still turns them on).
  const guide = document.getElementById("welcome-guide");
  if (guide) guide.checked = false;

  const win = api.window.getCurrentWindow();
  win.setSize = async (size) => tour.resize(size.width / devicePixelRatio, size.height / devicePixelRatio);
  win.setMinSize = async (size) => tour.minSize(size.width, size.height);
})();
