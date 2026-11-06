// Browser-only stand-in for the Tauri bridge, used by dev/preview_server.py to review the UI.
// It replays real SteamCMD lines and a real server boot log captured on 2026-10-07.
//   ?fresh    nothing installed (setup window opens)
//   ?nocache  no branch list yet (and quick_branches fails, like being offline)
//   ?oxide    Oxide installed but switched off by an update
//   ?running  a server is already running when the UI opens
//   ?empty    no maps in the Maps folder
//   ?hang     a custom map hangs on the ocean paths (the prefab test mode hint shows after 40 s)
//   ?issues   the cargo ship throws errors once the server is up (prefab test mode hint)
//   ?saved    a map in the active folder is saved after 4 s (window.__mockSave(i) does it too)
//   ?rustopen Rust counts as running when Join is pressed
//   ?update   a new DropLaunch is available (Update in the top bar); ?updatefail fails to install
//   ?norust   the Rust game isn't installed
//   ?demo     the public demo (dev/build_demo.py): made-up names and folders, testers join a running
//             server and send bug reports, links open in a new tab
(() => {
  const params = new URLSearchParams(location.search);
  const demo = params.has("demo") || Boolean(document.currentScript?.hasAttribute("data-demo"));
  const SPEED = demo ? 4 : 3; // replay faster than real time
  const base = demo ? "C:\\Users\\You\\Desktop\\DropLaunch" : "C:\\Users\\TP\\Desktop\\Droplaaauc";
  const server = `${base}\\Server_Files`;
  const branches = [
    { name: "public", buildid: "25681086", timeUpdated: 1790979007, description: "" },
    { name: "staging", buildid: "25765323", timeUpdated: 1791331311, description: "" },
    { name: "release", buildid: "25745342", timeUpdated: 1791268526, description: "Release, before public" },
    { name: "last-month", buildid: "25454815", timeUpdated: 1790074315, description: "last-month" },
    { name: "aux02", buildid: "24494353", timeUpdated: 1785506546, description: "Up and coming" },
    { name: "debug", buildid: "17041002", timeUpdated: 1737126347, description: "debug" },
  ];
  const fresh = params.has("fresh") || (demo && !params.has("installed"));
  const oxide = params.has("oxide");
  const installedServer = {
    buildid: "25681086",
    branch: "public",
    stateFlags: 4,
    fullyInstalled: true,
    sizeOnDisk: 6103829589,
    lastUpdated: 1791328625,
    executableFound: true,
  };
  const now = Math.floor(Date.now() / 1000);
  const snap = {
    version: "2.0.3",
    platform: "windows",
    canHost: true,
    baseDir: base,
    // ?busy=desktop (or drive, downloads, documents, home): DropLaunch isn't in a folder of its own.
    busyPlace: params.get("busy") || null,
    configFile: `${base}\\DropLaunch-data\\settings.json`,
    dataDir: `${base}\\DropLaunch-data`,
    configWarning: null,
    folders: [
      { key: "steamcmd", label: "SteamCMD", path: `${base}\\SteamCMD`, exists: !fresh },
      { key: "server", label: "Server files", path: server, exists: !fresh },
      { key: "maps", label: "Active maps folder", path: `${base}\\Maps`, exists: true },
    ],
    steamcmdInstalled: !fresh,
    steamcmdFound: !fresh,
    linked: true,
    serverFound: !fresh,
    server: fresh ? null : installedServer,
    installs: fresh
      ? []
      : [
          { branch: "public", path: server, buildid: "25681086", fullyInstalled: true, lastUpdated: 1791328625, active: true },
          ...(params.has("branches") ? [{ branch: "staging", path: `${server}_staging`, buildid: "25690112", fullyInstalled: true, lastUpdated: 1791428625, active: false }] : []),
        ],
    setupNeeded: fresh,
    framework: fresh ? "none" : oxide ? "oxide" : "carbon",
    rustedit: !fresh,
    profiler: false,
    profilesDir: `${server}\\carbon\\profiles`,
    playtest: !fresh || demo,
    oxideInactive: oxide,
    startFile: fresh ? null : `${server}\\start_procgen_server.bat`,
    procgen: { seed: "1184645116", size: "3000", file: null },
    updateScript: fresh ? null : `${server}\\update_server.bat`,
    steamcmdUpdateScript: fresh ? null : `${base}\\SteamCMD\\update_rust_server.bat`,
    startFiles: fresh
      ? []
      : demo
      ? [{ path: `${server}\\start_procgen_server.bat`, map: null, prefab: false }]
      : [
          { path: `${server}\\start_6KRaceDownv2.bat`, map: "6KRaceDownv2", prefab: false },
          { path: `${server}\\start_6KRaceDownv2_prefab.bat`, map: "6KRaceDownv2", prefab: true },
          { path: `${server}\\start_procgen_server.bat`, map: null, prefab: false },
        ],
    connectCommand: "client.connect 127.0.0.1:28015",
    freeSpace: params.has("lowspace") ? 3.2 * 1024 ** 3 : 214 * 1024 ** 3,
    steamcmdFreeSpace: 214 * 1024 ** 3,
    branch: "public",
    branchCache: null,
    autoJoin: false,
    notifySaves: true,
    desktopNotifications: true,
    cleanClientMaps: true,
    updateCheck: true,
    updateFramework: true,
    skippedUpdate: null,
    owner: null,
    whitelist: false,
    whitelistIds: [],
    backupClientMaps: true,
    mapBackupsDir: `${base}\\DropLaunch-data\\ClientMapBackups`,
    busy: false,
    serverRunning: false,
    welcomed: !fresh,
    guide: { on: false, seen: [], done: [] },
  };
  const maps = params.has("empty")
    ? []
    : demo
    ? [
        { path: `${base}\\Maps\\Rally\\Canyon_Rally_v18.map`, name: "Canyon_Rally_v18", folder: "Rally", size: 9211650, modified: now - 3600, startFile: null, outside: false },
        { path: `${base}\\Maps\\Harbor_Island_v3.map`, name: "Harbor_Island_v3", folder: "", size: 13985865, modified: now - 86400 * 2, startFile: null, outside: false },
        { path: `${base}\\Maps\\Training\\Training_Grounds_4.8.map`, name: "Training_Grounds_4.8", folder: "Training", size: 15291428, modified: now - 86400 * 9, startFile: null, outside: false },
        { path: `${base}\\Maps\\Training\\Old\\Training_Grounds_4.7.map`, name: "Training_Grounds_4.7", folder: "Training\\Old", size: 15102411, modified: now - 86400 * 40, startFile: null, outside: false },
      ]
    : [
        { path: `${base}\\Maps\\Race tests\\6KRaceDownv2.map`, name: "6KRaceDownv2", folder: "Race tests", size: 8011650, modified: now - 3600, startFile: `${server}\\start_6KRaceDownv2.bat`, prefabFile: `${server}\\start_6KRaceDownv2_prefab.bat`, outside: false },
        { path: `${base}\\Maps\\Koala_Kopters_V-7.8.map`, name: "Koala_Kopters_V-7.8", folder: "", size: 13985865, modified: now - 86400 * 2, startFile: null, outside: false },
        { path: `${base}\\Maps\\Training\\A42TrainingV4.8.3.map`, name: "A42TrainingV4.8.3", folder: "Training", size: 15291428, modified: now - 86400 * 9, startFile: null, outside: false },
        { path: `${base}\\Maps\\Training\\Old\\A42TrainingV4.7.map`, name: "A42TrainingV4.7", folder: "Training\\Old", size: 15102411, modified: now - 86400 * 40, startFile: null, outside: false },
      ];
  const recent = params.has("empty")
    ? []
    : demo
    ? [{ path: "D:\\RustEdit\\Exports\\Frost_Valley_test.map", name: "Frost_Valley_test", folder: "D:\\RustEdit\\Exports", size: 7228587, modified: now - 7200, startFile: null, outside: true, started: now - 5400 }]
    : [{ path: "D:\\RustEdit\\Exports\\DISABLE_ZAPRET3.map", name: "DISABLE_ZAPRET3", folder: "D:\\RustEdit\\Exports", size: 7228587, modified: now - 7200, startFile: null, outside: true, started: now - 5400 }];

  let cancelled = false;
  const wait = (s) => new Promise((r) => setTimeout(r, (s * 1000) / SPEED));
  const line = (text, source = "steamcmd") => ({ kind: "line", source, text });

  // ------------------------------------------------------------ events
  const listeners = {};
  function emit(name, payload) {
    for (const cb of listeners[name] ?? []) cb({ event: name, payload });
  }
  const event = {
    listen(name, cb) {
      (listeners[name] ??= []).push(cb);
      return Promise.resolve(() => {});
    },
  };
  const webview = {
    getCurrentWebview: () => ({
      onDragDropEvent(cb) {
        listeners.__drag = [cb];
        return Promise.resolve(() => {});
      },
    }),
  };
  /** Files dropped on the window (names only: a browser doesn't tell where they are). */
  window.__mockDrop = async (names) => {
    const paths = names.map((n) => `D:\\Downloads\\${n}`);
    listeners.__drag?.[0]({ payload: { type: "enter", paths } });
    await new Promise((r) => setTimeout(r, 700));
    listeners.__drag?.[0]({ payload: { type: "drop", paths } });
  };
  /** What a click does on a real PC, where the demo can't (the demo shows it as a note). */
  const onPc = (text) => demo && window.__demoNote?.(text);
  // In the preview, ?drop simulates dragging a map over the window after 2 s.
  if (params.has("drop")) {
    setTimeout(() => listeners.__drag?.[0]({ payload: { type: "enter", paths: ["D:\\Downloads\\NewMap.map"] } }), 2000);
  }

  // ------------------------------------------------------------ SteamCMD replays
  const loginScript = [
    [0.04, line(`Redirecting stderr to '${base}\\SteamCMD\\logs\\stderr.txt'`)],
    [0.0, line("[  0%] Checking for available updates...")],
    [0.0, { kind: "status", text: "Checking for SteamCMD updates…" }],
    [7.8, line("[----] Verifying installation...")],
    [0.0, { kind: "status", text: "SteamCMD: Verifying installation" }],
    [0.26, line("Steam Console Client (c) Valve Corporation - version 1788292693")],
    [0.05, line("Loading Steam API...OK")],
    [0.0, { kind: "phase", phase: "login" }],
    [0.0, { kind: "status", text: "Connecting to Steam…" }],
    [8.0, line("Connecting anonymously to Steam Public...OK")],
    [0.0, { kind: "status", text: "Connected, signing in anonymously…" }],
    [1.25, line("Waiting for client config...OK")],
    [0.02, line("Waiting for user info...OK")],
    [0.0, { kind: "phase", phase: "files" }],
  ];

  function progressSteps(text, total, steps, seconds, source) {
    const out = [];
    for (let i = 1; i <= steps; i++) {
      const pct = (i / steps) * 100;
      const done = Math.round((total * pct) / 100);
      if (source) out.push([seconds / steps, line(source(pct, done))]);
      out.push([source ? 0 : seconds / steps, { kind: "progress", text, percent: pct, done, total }]);
    }
    return out;
  }

  const validateScript = [
    [0.0, line(`Verifying the Rust server (public branch) in ${server}`, "app")],
    [0.0, { kind: "phase", phase: "steamcmd" }],
    [0.0, { kind: "status", text: "Starting SteamCMD…" }],
    ...loginScript,
    [0.0, { kind: "status", text: "Signed in, checking the server files…" }],
    ...progressSteps("Verifying files", 6103829589, 5, 10, (p, d) => ` Update state (0x5) verifying install, progress: ${p.toFixed(2)} (${d} / 6103829589)`),
    [0.3, line("Success! App '258550' fully installed.")],
    [0.1, { kind: "phase", phase: "done" }],
    [0.0, line("Files verified: Build 25681086 on the public branch", "app")],
  ];

  const task = (task, state, detail = "") => ({ kind: "task", task, state, detail });
  const setupScript = (opts) => [
    [0.0, task("steamcmd", "active")],
    [0.0, line(`SteamCMD not found in ${base}\\SteamCMD - downloading it.`, "app")],
    ...progressSteps("Downloading SteamCMD", 775000, 4, 1.2),
    [0.2, line("SteamCMD downloaded. First start: it updates itself, this can take a minute.", "app")],
    [0.0, { kind: "status", text: "Setting up SteamCMD…" }],
    ...progressSteps("Updating SteamCMD", 43472 * 1024, 6, 3, (p, d) => `[${String(Math.round(p)).padStart(3)}%] Downloading update (${Math.round(d / 1024).toLocaleString("en")} of 43,472 KB)...`),
    [0.3, line("[----] Update complete, launching Steamcmd...")],
    [0.2, line("SteamCMD is ready.", "app")],
    [0.0, task("steamcmd", "done", "Downloaded and up to date")],
    [0.0, task("server", "active")],
    [0.0, line(`Installing the Rust server (${opts.branch} branch) in ${server}`, "app")],
    ...loginScript.slice(5),
    [0.0, { kind: "status", text: "Signed in, getting the server files…" }],
    ...progressSteps("Downloading", 5520792242, 8, 16, (p, d) => ` Update state (0x61) downloading, progress: ${p.toFixed(2)} (${d} / 5520792242)`),
    ...progressSteps("Verifying download", 5520792242, 3, 4, (p, d) => ` Update state (0x81) verifying update, progress: ${p.toFixed(2)} (${d} / 5520792242)`),
    [0.3, line("Success! App '258550' fully installed.")],
    [0.0, task("server", "done", `Build 25681086 (${opts.branch} branch)`)],
    ...(opts.framework === "none"
      ? [[0.0, task("framework", "skipped", "Not selected")]]
      : [
          [0.0, task("framework", "active")],
          ...progressSteps(`Downloading ${opts.framework === "carbon" ? "Carbon" : "Oxide"}`, 21379761, 5, 2.5),
          [0.1, line(`${opts.framework === "carbon" ? "Carbon" : "Oxide"} installed into ${server}`, "app")],
          ...(opts.rustedit ? progressSteps("Downloading the RustEdit extension", 98304, 2, 0.6) : []),
          [0.0, task("framework", "done", `${opts.framework === "carbon" ? "Carbon" : "Oxide"}${opts.rustedit ? " + RustEdit extension" : " installed"}`)],
        ]),
    [0.0, task("startfile", "active")],
    [0.4, line(`Start file: ${server}\\start_procgen_server.bat`, "app")],
    [0.0, task("startfile", "done", "start_procgen_server.bat + update_server.bat")],
    ...(opts.startServer
      ? [
          [0.0, task("launch", "active")],
          [0.5, line("Starting the server in its own window.", "app")],
          [0.0, task("launch", "done", "Running in its own window, DropLaunch shows its progress")],
        ]
      : [[0.0, task("launch", "skipped", "Not selected")]]),
    [0.0, { kind: "phase", phase: "done" }],
  ];

  async function play(script, channel) {
    for (const [delay, ev] of script) {
      if (cancelled) return false;
      if (delay) await wait(delay);
      channel.onmessage?.(ev);
    }
    return !cancelled;
  }

  // ------------------------------------------------------------ server simulation
  const bootLog = [
    [0.4, "[Bootstrap] Opening Bundles"],
    [0.4, "Loading shared/content.bundle"],
    [0.5, "[Bootstrap] Loading Menu Prefabs"],
    [2.1, "[Bootstrap] Loading Game Manifest"],
    [0.6, "[Bootstrap] Bootstrap Config"],
    [0.2, "Command 'rcon.password' not found"],
    [0.3, "[Bootstrap] Loading Items"],
    [1.2, "Carbon 2.0.262.0 [2026.10.01.0] 8a81d70 on Windows"],
    [1.0, "Preloaded plugin RustEdit Core v1.0.1 by Chaos"],
    [0.4, "Asset Warmup (1/8996)"],
    [0.6, "Asset Warmup (8996/8996)"],
    [0.1, "WebSocket RCON Started on 127.0.0.1:28016"],
    [0.3, "Generating procedural map of size 3000 with seed 1184645116"],
    [1.3, "[1.3s] Loading Monument Prefabs"],
    [7.1, "[7.1s] Terrain Erosion"],
    [1.2, "[1.2s] River Layout"],
    [9.2, "[9.2s] Main Monuments"],
    [3.3, "[3.3s] Tunnel Entrances"],
    [6.4, "[6.4s] Caves"],
    [6.4, "[6.4s] Cliffs Hills"],
    [7.0, "[71.3s] Processing World"],
    [2.7, "[2.7s] Saving World"],
    [0.5, "Couldn't load server/droplaunch_procgen/proceduralmap.3000.1184645116.289.sav - file doesn't exist"],
    [0.5, "Spawning 3081 entities from map"],
    [0.8, "Postprocessing 3081 entities from map"],
    [0.4, "[RustNav] No navmesh loaded from save, building navmesh now"],
    [1.2, "Initializing 40189 entity links"],
    [0.6, "Preparing Occlusion Grid (1500, 100, 1500)"],
    [5.9, "SteamServer Initialized"],
    [0.8, "Server startup complete"],
  ];
  const hang = params.has("hang");
  const customLog = (path) => [
    ...bootLog.slice(0, 12),
    [0.3, `Loading custom map from file:///${path.replace(/\\/g, "/")}`],
    [0.5, "[0.5s] Downloading World"],
    [0.2, "[RustEdit] - IO data loaded and ready to be processed!"],
    [3.3, "[3.3s] Spawning World"],
    [0.7, "[0.7s] Terrain Mesh"],
    [0.9, "[0.9s] Processing World"],
    [0.1, "[RustEdit] - No ocean patrol path data found in map file"],
    [hang ? 400 : 4.4, "Generated ocean patrol path with node count: 292"],
    [0.0, "[4.4s] Ocean Patrol Paths"],
    [0.5, "Couldn't load server/droplaunch_map/map.sav - file doesn't exist"],
    [0.5, "Spawning 1301 entities from map"],
    [0.8, "Postprocessing 1301 entities from map"],
    [0.4, "[RustNav] No navmesh loaded from save, building navmesh now"],
    [1.2, "Initializing 12034 entity links"],
    [0.6, "Preparing Occlusion Grid (1500, 100, 1500)"],
    [2.9, "SteamServer Initialized"],
    [0.8, "Server startup complete"],
  ];
  /** Like the backend's boot::Tracker::source. */
  function sourceOf(text, kind) {
    if (kind === "cmd" || kind === "reply") return "rcon";
    if (kind === "app" || (kind !== "log" && kind !== "ok" && kind !== "warn" && kind !== "error")) return "droplaunch";
    if (/ is ready\. Join with F1/.test(text) || /^(Started |Stopping |Stopped\.)/.test(text)) return "droplaunch";
    if (text.startsWith("[RustEdit]")) return "rustedit";
    if (text.startsWith("Carbon") || text.startsWith("Preloaded plugin") || text.startsWith("Loaded plugin")) return "carbon";
    if (text.startsWith("WebSocket RCON")) return "rcon";
    if (/^(Loading custom map|Generating procedural map|Generated ocean|Couldn't load server\/|Spawning \d|Postprocessing )/.test(text) || (/^\[[\d.]+s\] /.test(text) && !text.includes("asset_warmup"))) return "map";
    return "server";
  }
  const consoleLines = [];
  let serverView = null;
  let mockKits = [{"id": "701d3973-7cf3-4060-9276-9920cfbf4118", "name": "Basic Build Kit", "wear": [], "belt": [{"item": "building.planner", "amount": 1, "slot": 0}, {"item": "hammer", "amount": 1, "slot": 1}, {"item": "lock.code", "amount": 99999, "slot": 2}], "main": [{"item": "wood", "amount": 99999, "slot": 0}, {"item": "stones", "amount": 99999, "slot": 1}, {"item": "metal.fragments", "amount": 99999, "slot": 2}, {"item": "metal.refined", "amount": 99999, "slot": 3}, {"item": "door.hinged.toptier", "amount": 9999, "slot": 4}, {"item": "door.hinged.metal", "amount": 99999, "slot": 5}, {"item": "wall.frame.garagedoor", "amount": 99999, "slot": 6}, {"item": "door.double.hinged.metal", "amount": 99999, "slot": 7}, {"item": "cupboard.tool", "amount": 999, "slot": 8}, {"item": "furnace", "amount": 9999, "slot": 9}]}, {"id": "raid", "name": "Raid kit", "wear": [{"item": "metal.facemask", "amount": 1, "slot": 0}, {"item": "metal.plate.torso", "amount": 1, "slot": 1}], "belt": [{"item": "rifle.ak", "amount": 1, "slot": 0}, {"item": "syringe.medical", "amount": 5, "slot": 1}], "main": [{"item": "explosive.timed", "amount": 8, "slot": 0}, {"item": "ammo.rifle", "amount": 256, "slot": 1}]}];
  let serverRun = 0;
  let nextId = 1;
  /** Start files dropped on the window (Settings, Dropped assets) and the ones in use. */
  let droppedStartFiles = [];
  /** The themes (ui/themes, and ones dropped in the preview) and the one in use. */
  let mockThemes = null;
  let mockThemeId = "default";
  const chosenStart = { procgen: null, maps: null };

  function pushLines(lines) {
    const out = lines.map(([text, kind]) => ({ text, kind, source: sourceOf(text, kind), time: Date.now() }));
    consoleLines.push(...out);
    emit("server", { kind: "lines", lines: out });
  }
  function emitState() {
    emit("server", { kind: "state", server: serverView && structuredClone(serverView) });
    emitPlaytest();
  }
  const NEXT_WORK = { "Downloading World": "spawningWorld", "Spawning World": "terrainMesh", "Terrain Mesh": "processingWorld", "Processing World": "oceanPaths", "Ocean Patrol Paths": null };
  const WORK_LABEL = { spawningWorld: "Spawning the world", terrainMesh: "Building the terrain", processingWorld: "Processing the world", oceanPaths: "Generating the ocean paths" };
  function feed(boot, text) {
    const set = (stage, detail, pct) => {
      Object.assign(boot, { stage, detail, percent: Math.max(boot.percent, pct) });
      if (!["starting", "gameFiles", "mods", "map"].includes(stage)) boot.work = null;
    };
    const work = (w) => Object.assign(boot, { work: w, workSince: Date.now() });
    if (text.startsWith("Loading custom map")) {
      set("map", "Loading the custom map", 30);
      return work("readingMap");
    }
    if (text.startsWith("[RustEdit] - No ocean")) {
      boot.detail = "Generating the ocean paths…";
      return work("oceanPaths");
    }
    const step = text.match(/^\[[\d.]+s\] (.+)$/)?.[1];
    if (step && step in NEXT_WORK && boot.stage === "map") {
      const next = NEXT_WORK[step];
      work(next);
      return set("map", next ? `${WORK_LABEL[next]}…` : `${step} done`, Math.min(70, boot.percent + 6));
    }
    if (text.startsWith("[Bootstrap] Opening")) set("gameFiles", "Opening game bundles", 6);
    else if (text.startsWith("[Bootstrap] Loading Menu")) set("gameFiles", "Loading prefabs", 9);
    else if (text.startsWith("[Bootstrap] Loading Game")) set("gameFiles", "Loading the game manifest", 12);
    else if (text.startsWith("[Bootstrap] Loading Items")) set("gameFiles", "Loading items", 16);
    else if (text.startsWith("Carbon ")) {
      boot.framework = "Carbon";
      set("mods", "Starting Carbon", 18);
    } else if (text.startsWith("Preloaded plugin")) set("mods", "Loading plugins: RustEdit Core", 20);
    else if (text.startsWith("Asset Warmup")) set(boot.stage, text.replace("Asset Warmup", "Warming up assets"), text.includes("8996/") ? 28 : 21);
    else if (text.startsWith("Generating procedural")) {
      set("map", "Generating the procedural map", 30);
      work("generating");
    }
    else if (/^\[\d/.test(text)) set("map", text.replace(/^\[[\d.]+s\] /, ""), Math.min(70, boot.percent + 4));
    else if (text.startsWith("Couldn't load")) set("entities", "Loading the save", 72);
    else if (text.startsWith("Spawning")) set("entities", text, 74);
    else if (text.startsWith("Postprocessing")) set("entities", text, 80);
    else if (text.startsWith("[RustNav]")) set("finishing", "Building the navmesh", 86);
    else if (text.startsWith("Initializing")) set("finishing", "Linking entities", 88);
    else if (text.startsWith("Preparing")) set("finishing", "Preparing the occlusion grid", 91);
    else if (text.startsWith("SteamServer")) set("finishing", "Connecting to Steam", 96);
    else if (text.startsWith("Server startup complete")) set("ready", "", 100);
  }

  async function bootServer(target, prefab = false) {
    const run = ++serverRun;
    // A start file of yours from the map list: the procedural map with its settings.
    const preset = target.kind === "preset" ? target.name : null;
    const procgen = target.kind === "procgen" || Boolean(preset);
    prefab = prefab && !procgen;
    const m = procgen ? null : [...maps, ...recent].find((x) => x.path === target.path);
    const title = preset ? preset.replace(/\.[^.]+$/, "") : procgen ? "Procedural map" : m?.name ?? "map";
    const key = preset ? `procgen_${title}` : title.replace(/[^A-Za-z0-9-]+/g, "_");
    const startFile = preset ? `${server}\\start_${key}.bat` : procgen ? `${server}\\start_procgen_server.bat` : `${server}\\start_${key}${prefab ? "_prefab" : ""}.bat`;
    const kept = preset && droppedStartFiles.find((f) => f.name === preset);
    if (kept) kept.startFile = startFile;
    shown = { procgen: procgen && !preset, path: procgen ? null : target.path, title };
    if (m) {
      m.startFile = `${server}\\start_${key}.bat`;
      m.prefabFile = `${server}\\start_${key}_prefab.bat`;
    }
    serverView = {
      id: nextId++,
      title,
      map: procgen ? null : target.path,
      procgen,
      preset,
      prefab,
      startFile,
      logFile: `${server}\\logs\\droplaunch_${procgen && !preset ? "procgen" : key}${prefab ? "_prefab" : ""}.log`,
      phase: "booting",
      boot: { stage: "starting", detail: "", percent: 2, framework: null, rconStarted: false, work: null, workSince: 0, issues: [] },
      startedAt: Date.now(),
      readyAt: null,
      endedAt: null,
      rcon: false,
      info: null,
      port: 28015,
      connect: "client.connect 127.0.0.1:28015",
      attached: false,
      restarting: false,
      message: null,
      branch: snap.branch,
    };
    snap.serverRunning = true;
    pushLines([[`Started ${startFile.split("\\").pop()} (${title}), console window opened.`, "app"]]);
    emitState();
    for (const [delay, text] of procgen ? bootLog : customLog(target.path)) {
      await wait(delay);
      if (run !== serverRun || !serverView || serverView.phase !== "booting") return;
      feed(serverView.boot, text);
      if (text.startsWith("WebSocket RCON")) {
        serverView.boot.rconStarted = true;
        setTimeout(() => serverView && ((serverView.rcon = true), emitState()), 300);
      }
      if (!text.startsWith("Command '")) pushLines([[text, text.startsWith("Server startup") ? "ok" : "log"]]);
      emitState();
    }
    serverView.phase = "ready";
    serverView.readyAt = Date.now();
    pushLines([[`${title} is ready. Join with F1 → client.connect 127.0.0.1:28015`, "ok"]]);
    serverView.info = { players: 0, maxPlayers: 10, joining: 0, entityCount: 31337, framerate: 256, uptime: 0 };
    emitState();
    startTesters(run);
    if (params.has("issues") && !prefab && !procgen) {
      setTimeout(() => {
        if (run !== serverRun) return;
        pushLines([["NullReferenceException: Object reference not set to an instance of an object", "error"], ["  at CargoShip.UpdateMovement () [0x0001c] in <00000000000000000000000000000000>:0", "log"]]);
        serverView.boot.issues = ["cargoShip"];
        emitState();
      }, 3000);
    }
    const tick = setInterval(() => {
      if (run !== serverRun || serverView?.phase !== "ready") return clearInterval(tick);
      serverView.info.uptime = Math.round((Date.now() - serverView.readyAt) / 1000);
      serverView.info.framerate = 240 + Math.round(Math.random() * 30);
      emitState();
    }, 5000);
  }

  async function stopServer(force, then, thenPrefab = false) {
    if (!serverView) throw "No server is running.";
    const graceful = !force && serverView.phase === "ready";
    stopTesters();
    serverView.phase = "stopping";
    serverView.restarting = Boolean(then);
    pushLines([[graceful ? `Stopping ${serverView.title} (saving first)…` : `Stopping ${serverView.title}…`, "app"]]);
    emitState();
    await wait(graceful ? 6 : 1);
    pushLines([["Saving complete", "log"], ["Stopped.", "app"]]);
    serverView = { ...serverView, phase: "stopped", rcon: false, endedAt: Date.now(), message: "Stopped." };
    snap.serverRunning = false;
    serverRun++;
    emitState();
    if (then) setTimeout(() => bootServer(then, thenPrefab), 400);
  }

  // ------------------------------------------------------------ map pictures
  // DropLaunch draws the real .map's terrain; here every map gets a made-up island of its own (the
  // same DLM1 picture format: a 16-byte header, then RGBA pixels).
  function hashOf(text) {
    let h = 2166136261;
    for (const c of String(text)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return h >>> 0;
  }
  function lattice(ix, iy, seed) {
    let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + seed) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function noise(x, y, seed) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = lattice(ix, iy, seed), b = lattice(ix + 1, iy, seed), c = lattice(ix, iy + 1, seed), d = lattice(ix + 1, iy + 1, seed);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function fbm(x, y, seed) {
    let v = 0, amp = 0.5, f = 1;
    for (let o = 0; o < 5; o++, amp /= 2, f *= 2) v += amp * noise(x * f, y * f, seed + o * 101);
    return v;
  }
  const SEA = 0.42;
  const MONUMENT_NAMES = ["Launch Site", "Airfield", "Harbor", "Outpost", "Bandit Camp", "Water Treatment Plant", "Military Tunnels", "Lighthouse", "Gas Station", "Supermarket", "Satellite Dish", "Sewer Branch"];
  const sizeOf = (path) => (path ? 3500 + (hashOf(path) % 3) * 500 : 3000);
  const islands = new Map();

  /** The island's heights and monuments (pixels px on a side). */
  function island(path, px) {
    const key = `${path ?? "procgen"}|${px}`;
    if (islands.has(key)) return islands.get(key);
    const seed = hashOf(path ?? "procgen") % 100000;
    const height = new Float32Array(px * px);
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const u = x / px, v = y / px;
        const dx = u - 0.5, dy = v - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.06 * (fbm(u * 3, v * 3, seed + 7) - 0.5);
        height[y * px + x] = fbm(u * 4, v * 4, seed) * 0.7 + 0.58 - dist * 1.45;
      }
    }
    // Monuments: spread over low land, never too close to each other.
    const spots = [];
    const pick = (i) => ((hashOf(`${seed}:${i}`) % 10000) / 10000) * 0.8 + 0.1;
    for (let i = 0; spots.length < 8 && i < 400; i++) {
      const u = pick(i * 2), v = pick(i * 2 + 1);
      const h = height[Math.floor(v * px) * px + Math.floor(u * px)];
      if (h < SEA + 0.04 || h > SEA + 0.22 || spots.some((s) => Math.hypot(s.u - u, s.v - v) < 0.16)) continue;
      spots.push({ u, v, name: MONUMENT_NAMES[(seed + spots.length * 5) % MONUMENT_NAMES.length] });
    }
    const out = { height, spots, seed };
    islands.set(key, out);
    return out;
  }

  function mapPicture(path, px) {
    const { height, spots, seed } = island(path, px);
    const buffer = new ArrayBuffer(16 + px * px * 4);
    const head = new DataView(buffer);
    "DLM1".split("").forEach((c, i) => head.setUint8(i, c.charCodeAt(0)));
    head.setUint32(4, px, true);
    head.setUint32(8, sizeOf(path), true);
    const rgba = new Uint8ClampedArray(buffer, 16);
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const h = height[y * px + x];
        const v = y / px;
        let c;
        if (h < SEA - 0.1) c = [44, 78, 98];
        else if (h < SEA) c = mix([44, 78, 98], [80, 132, 140], (h - SEA + 0.1) / 0.1);
        else if (h < SEA + 0.018) c = [206, 190, 146];
        else {
          const lush = fbm((x / px) * 9, v * 9, seed + 31);
          c = lush > 0.56 ? [86, 110, 66] : [132, 150, 90];
          if (v < 0.3) c = mix(c, [226, 230, 232], Math.min(1, (0.3 - v) / 0.12));
          if (v > 0.72) c = mix(c, [204, 176, 116], Math.min(1, (v - 0.72) / 0.1));
          if (h > SEA + 0.3) c = mix(c, [140, 134, 122], Math.min(1, (h - SEA - 0.3) / 0.08));
          // Light from the north-west.
          const left = height[y * px + Math.max(0, x - 1)], up = height[Math.max(0, y - 1) * px + x];
          c = c.map((ch) => ch * (1 + (h - left + h - up) * (px / 6)));
        }
        rgba.set([c[0], c[1], c[2], 255], (y * px + x) * 4);
      }
    }
    const r = Math.max(1, Math.round(px / 120));
    for (const s of spots) {
      const cx = Math.round(s.u * px), cy = Math.round(s.v * px);
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          const edge = x === cx - r || x === cx + r || y === cy - r || y === cy + r;
          rgba.set(edge ? [92, 92, 88, 255] : [178, 176, 168, 255], (y * px + x) * 4);
        }
      }
    }
    return buffer;
  }

  const monumentsOf = (path) => {
    const size = sizeOf(path);
    return island(path, 128).spots.map((s) => ({ name: s.name, x: (s.u - 0.5) * size, z: (0.5 - s.v) * size }));
  };
  /** Rust's grid: 146.3 m squares from the top left, "A0" first. */
  const gridOf = (size) => ({ cell: 146.3, cellZ: 146.3, x0: -size / 2, z0: size / 2, first: "A0" });
  function gridName(x, z, size) {
    const col = Math.floor((x + size / 2) / 146.3), row = Math.floor((size / 2 - z) / 146.3);
    const letters = col < 26 ? String.fromCharCode(65 + col) : String.fromCharCode(64 + Math.floor(col / 26)) + String.fromCharCode(65 + (col % 26));
    return `${letters}${row}`;
  }

  // ------------------------------------------------------------ bug reports (the DropLaunch plugin)
  /** The map the bug reports page shows: the running server's, else the last one's. */
  let shown = null;
  const books = {};
  const versionsKey = (title) => title.replace(/[_ -]*v?\d+([._]\d+)*$/i, "") || title;
  function mapView() {
    if (!shown) return null;
    const m = [...maps, ...recent].find((x) => x.path === shown.path);
    return { key: shown.procgen ? "procgen" : versionsKey(shown.title), title: shown.procgen ? "Procedural map" : versionsKey(shown.title), version: shown.procgen ? "Procedural map" : `${shown.title}.map`, procgen: shown.procgen, saved: m?.modified ? m.modified * 1000 : null };
  }
  const bookOf = (key) => (books[key] ??= { next: 0, reports: [] });
  function playtestView() {
    const s = serverView && ["booting", "ready", "stopping"].includes(serverView.phase) ? serverView : null;
    const map = mapView();
    const plugin = !s ? "noServer" : !snap.playtest ? "off" : snap.framework === "none" ? "noFramework" : s.phase === "booting" ? (s.boot.percent < 30 ? "starting" : "loading") : "active";
    const size = shown ? sizeOf(shown.path) : null;
    return {
      enabled: snap.playtest,
      plugin,
      server: s ? { id: s.id, title: s.title, phase: s.phase } : null,
      map,
      reports: map ? structuredClone(bookOf(map.key).reports) : [],
      monuments: map && (plugin === "active" || bookOf(map.key).reports.length) ? monumentsOf(shown.path) : [],
      grid: size ? gridOf(size) : null,
      size,
    };
  }
  function emitPlaytest() {
    emit("playtest", playtestView());
  }

  const BUG_TEXTS = [
    "The ramp after the second jump clips into the rock, my car got stuck",
    "Floating tree near the bridge",
    "Can see through the cliff from this side",
    "Checkpoint 3 doesn't light up when I drive through it",
    "Water here is too shallow for the boat",
    "Missing collider on the wooden fence",
  ];
  const TESTERS = [
    { id: "76561198000000002", name: "MapTester" },
    { id: "76561198000000003", name: "Friend" },
    { id: "76561198000000004", name: "RallyFan" },
  ];
  let testers = [];
  let testerTimers = [];
  let bugCount = 0;

  function addReport(tester, text) {
    const map = mapView();
    if (!map) return;
    const book = bookOf(map.key);
    if (!book.reports.length) book.next = 0;
    book.next += 1;
    const size = sizeOf(shown.path);
    const yaw = tester.yaw;
    const look = 10 + Math.random() * 20;
    book.reports.push({
      id: `r${Date.now()}${book.next}`,
      n: book.next,
      text,
      name: tester.name,
      steamId: tester.id,
      grid: gridName(tester.x, tester.z, size),
      x: tester.x,
      y: tester.y,
      z: tester.z,
      yaw,
      pitch: -8,
      look: "rock_formation_large",
      lookAt: [tester.x + Math.sin((yaw * Math.PI) / 180) * look, tester.y, tester.z + Math.cos((yaw * Math.PI) / 180) * look],
      lookDistance: look,
      time: Date.now(),
      version: map.version,
      fixed: null,
    });
    pushLines([[`[DropLaunch] Bug #${book.next} from ${tester.name} in ${gridName(tester.x, tester.z, size)}: ${text}`, "log"]]);
    emitPlaytest();
  }
  /** The tour's "send a bug report" (a tester types /bug in Rust's chat). */
  window.__mockBug = () => {
    if (!testers.length) return false;
    addReport(testers[bugCount % testers.length], BUG_TEXTS[bugCount++ % BUG_TEXTS.length]);
    return true;
  };

  function startTesters(run) {
    if (!demo && !params.has("testers")) return;
    stopTesters();
    const size = sizeOf(shown?.path);
    const land = island(shown?.path, 128);
    const later = (s, fn) => testerTimers.push(setTimeout(() => run === serverRun && serverView?.phase === "ready" && fn(), s * 1000));
    TESTERS.forEach((t, i) => {
      later(3 + i * 4, () => {
        const spot = land.spots[(i * 3) % land.spots.length] ?? { u: 0.5, v: 0.5 };
        testers.push({ ...t, x: (spot.u - 0.5) * size, y: 20, z: (0.5 - spot.v) * size, yaw: Math.random() * 360, sleeping: false, dead: false });
        pushLines([[`${t.name} joined [windows/${t.id}]`, "log"]]);
        serverView.info.players = testers.length;
        emitState();
      });
    });
    if (snap.playtest) {
      later(16, () => window.__mockBug());
      later(45, () => window.__mockBug());
    }
    const walk = setInterval(() => {
      if (run !== serverRun || serverView?.phase !== "ready") return clearInterval(walk);
      for (const p of testers) {
        p.yaw = (p.yaw + (Math.random() - 0.5) * 50 + 360) % 360;
        const step = 12 + Math.random() * 18;
        p.x = Math.max(-size / 2 + 50, Math.min(size / 2 - 50, p.x + Math.sin((p.yaw * Math.PI) / 180) * step));
        p.z = Math.max(-size / 2 + 50, Math.min(size / 2 - 50, p.z + Math.cos((p.yaw * Math.PI) / 180) * step));
      }
      if (testers.length && snap.playtest) emit("playtest-players", { serverId: serverView.id, players: structuredClone(testers) });
    }, 1500);
    testerTimers.push(walk);
  }
  function stopTesters() {
    testerTimers.forEach((id) => (clearTimeout(id), clearInterval(id)));
    testerTimers = [];
    testers = [];
  }

  /** Opens a link in a new tab (the app opens it in the browser). */
  function openLink(url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.append(a);
    a.click();
    a.remove();
  }

  if (params.has("running") && !fresh) setTimeout(() => bootServer({ kind: "map", path: maps[0].path }), 50);

  /** A map in the active folder was saved (RustEdit). */
  window.__mockSave = (i = 0) => {
    const m = maps[i];
    if (!m) return;
    m.modified = Math.floor(Date.now() / 1000);
    emit("maps-changed", { saved: { path: m.path, name: m.name, new: false } });
  };
  if (params.has("saved")) setTimeout(() => window.__mockSave(params.get("saved") ? Number(params.get("saved")) : 1), 4000);

  const clientCache = params.has("norust")
    ? { gameDir: null, cacheDir: null, maps: 0, bytes: 0 }
    : { gameDir: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Rust", cacheDir: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Rust\\maps", maps: 44, bytes: 1000341504 };

  class Channel {
    onmessage = null;
  }

  async function invoke(cmd, args = {}) {
    switch (cmd) {
      case "get_state":
        return structuredClone(snap);
      case "language_state": {
        const file = await (await fetch("lang/en.json")).json();
        const languages = [{ code: "en", name: "English", source: "builtIn", file: null }];
        return { code: "en", name: "English", strings: file.strings, languages, folder: "C:\\Users\\TP\\AppData\\Local\\DropLaunch\\Languages" };
      }
      case "set_language":
        return null;
      case "add_languages":
        return { added: [], problems: ["mock: no language files in the preview"] };
      case "open_languages_folder":
        return null;
      case "export_language":
        return null;
      case "theme_state": {
        mockThemes ??= await Promise.all(
          ["default", "light", "grey", "vibrant"].map(async (id) => {
            const file = await (await fetch(`themes/${id}.json`)).json();
            return { id, name: file.theme.name, mode: file.theme.mode, source: "builtIn", file: null, colors: file.colors };
          }),
        );
        return { id: mockThemeId, themes: structuredClone(mockThemes), folder: `${base}\\DropLaunch-data\\Themes` };
      }
      case "set_theme":
        mockThemeId = args.id;
        return null;
      case "add_themes": {
        // A dropped file with "theme" in its name is a theme (Default's colours with a pink accent).
        const added = [];
        const rest = [];
        for (const path of args.paths) {
          const fileName = path.split(/[\\/]/).pop();
          if (!/theme/i.test(fileName)) {
            rest.push(path);
            continue;
          }
          const name = fileName.replace(/(\.theme)?\.json$/i, "");
          const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const theme = { id, name, mode: "dark", source: "added", file: `${base}\\DropLaunch-data\\Themes\\${id}.json`, colors: { ...mockThemes[0].colors, accent: "#e879b9", "accent-hover": "#ef94c7" } };
          mockThemes = [...mockThemes.filter((t) => t.id !== id), theme];
          added.push(theme);
        }
        return { added, rest, problems: [] };
      }
      case "remove_theme":
        mockThemes = mockThemes.filter((t) => t.id !== args.id);
        if (mockThemeId === args.id) mockThemeId = "default";
        return null;
      case "open_themes_folder":
      case "save_theme":
        return null;
      case "set_branch": {
        snap.branch = args.branch;
        const here = snap.installs.find((i) => i.branch === args.branch);
        snap.installs.forEach((i) => (i.active = i.branch === args.branch));
        snap.installs.sort((a, b) => b.active - a.active);
        snap.server = here ? { ...installedServer, branch: here.branch, buildid: here.buildid } : null;
        snap.setupNeeded = !here;
        return structuredClone(snap);
      }
      case "branch_folder": {
        const here = snap.installs.find((i) => i.branch === args.branch);
        const path = here?.path ?? (snap.installs.length ? `${server}_${args.branch}` : server);
        return { path, exists: Boolean(here), installed: here ? { ...installedServer, branch: here.branch, buildid: here.buildid } : null };
      }
      case "console_commands":
        return [
          { name: "status", help: "Print out currently connected clients", source: "rust" },
          { name: "say", help: "Sends a message in chat", source: "rust" },
          { name: "kick", help: "Kicks the specified player from the server with an optional reason", source: "rust" },
          { name: "teleportpos", help: "Teleports the calling admin or a named player to exact world coordinates specified as X Y Z arguments", source: "rust" },
          { name: "server.seed", help: "Seed value used for procedural world generation; changing this produces a completely different map layout", source: "rust" },
          { name: "server.save", help: "Force save the current game", source: "rust" },
          { name: "server.stop", help: "Stops the server", source: "rust" },
          { name: "server.secure", help: "Enable VAC", source: "rust" },
          { name: "spawn", help: "Spawns an entity at the position you're looking at", source: "rust" },
          { name: "env.time", help: "Current time of day (0-24)", source: "rust" },
          { name: "c.plugins", help: "Prints the list of loaded plugins", source: "carbon" },
          { name: "c.reload", help: "Reloads a plugin", source: "carbon" },
        ];
      case "console_history":
        return ["status", "say hello", "teleportpos 0 100 0"];
      case "console_history_add":
        return null;
      case "install_rust_game":
        onPc("On your PC this opens Steam to install Rust.");
        return null;
      case "show_rust":
        onPc("On your PC this brings the Rust window to the front.");
        return true;
      case "restart_rust_and_join":
        onPc("On your PC this restarts Rust and joins the server.");
        await wait(1);
        return null;
      case "set_options":
        if (args.options.autoJoin != null) snap.autoJoin = args.options.autoJoin;
        if (args.options.notifySaves != null) snap.notifySaves = args.options.notifySaves;
        for (const key of ["desktopNotifications", "cleanClientMaps", "updateCheck", "welcomed", "whitelist", "whitelistIds", "backupClientMaps", "profiler", "updateFramework"]) if (args.options[key] != null) snap[key] = args.options[key];
        if (args.options.skippedUpdate != null) snap.skippedUpdate = args.options.skippedUpdate || null;
        if (args.options.guide) {
          const g = args.options.guide;
          if (g.reset) Object.assign(snap.guide, { seen: [], done: [] });
          if (g.on != null) snap.guide.on = g.on;
          for (const key of ["seen", "done"]) for (const id of g[key] ?? []) if (!snap.guide[key].includes(id)) snap.guide[key].push(id);
        }
        return structuredClone(snap);
      case "client_cache":
        return structuredClone(clientCache);
      case "clear_client_cache": {
        const cleaned = { removed: clientCache.maps, bytes: clientCache.bytes, inUse: 0 };
        Object.assign(clientCache, { maps: 0, bytes: 0 });
        return { cleaned, cache: structuredClone(clientCache) };
      }
      case "notify":
        console.log("[notification]", args.toast);
        return true;
      case "check_update":
        await new Promise((r) => setTimeout(r, 500));
        return params.has("update") || params.has("updatefail")
          ? { current: snap.version, version: "2.1.0", notes: "- Map previews in the list\n- Bug reports from testers, with their position on the map\n- Faster map pictures", published: "2026-10-20", size: 16400000, page: "https://github.com/tedpommes/DropLaunch/releases/latest" }
          : null;
      case "install_update": {
        const total = 16400000;
        for (let done = 0; done <= total; done += 1640000) {
          args.onEvent?.onmessage?.({ done, total });
          await new Promise((r) => setTimeout(r, 250));
        }
        if (params.has("updatefail")) throw "DropLaunch can't write to C:\\Program Files\\DropLaunch, so it can't update itself there. Download the new version from GitHub instead.";
        return null;
      }
      case "set_folder":
        return structuredClone(snap);
      case "pick_folder":
        onPc("On your PC this opens a window to pick a folder.");
        return null;
      case "open_folder":
      case "reveal":
        onPc("On your PC this opens the folder in Explorer.");
        return null;
      case "join_server":
        onPc("On your PC this starts Rust, or uses the one that's open, and connects you to the server.");
        return { state: params.has("wrongrust") ? "wrong" : params.has("norustgame") ? "missing" : params.has("rustopen") ? "running" : "started", port: 28015, connect: "client.connect 127.0.0.1:28015", branch: snap.branch, game: snap.branch === "staging" ? "Rust - Staging Branch" : "Rust", appId: snap.branch === "staging" ? 700580 : 252490, runningGame: params.has("wrongrust") ? (snap.branch === "staging" ? "Rust" : "Rust - Staging Branch") : null, note: null };
      case "open_link":
        openLink(args.url);
        return null;
      case "forget_map":
      case "update_setup_options":
        return null;
      case "steam_accounts":
        return params.has("nosteam") ? [] : [{ steamId: "76561198000000001", name: demo ? "You" : "Map Maker", active: true }, { steamId: "76561198000000005", name: "Alt account", active: false }];
      case "steam_avatar":
        throw "mock: no Steam pictures";
      // Pictures of the maps (made-up islands, see mapPicture).
      case "map_picture":
        return mapPicture(args.path ?? null, 512);
      case "map_thumbnail":
        return mapPicture(args.path ?? null, 96);
      case "playtest_picture":
        if (!shown) throw "No map yet.";
        return mapPicture(shown.path, 512);
      case "map_notes": {
        const m = [...maps, ...recent].find((x) => x.path === args.path);
        const key = args.path ? versionsKey(m?.name ?? "") : "procgen";
        const reports = books[key]?.reports ?? [];
        return { reports: structuredClone(reports), monuments: reports.length || shown?.path === (args.path ?? null) ? monumentsOf(args.path ?? null) : [] };
      }
      // Bug reports.
      case "playtest_status":
        return playtestView();
      case "playtest_set_enabled":
        snap.playtest = args.on;
        emitPlaytest();
        return playtestView();
      case "playtest_set_fixed": {
        const r = Object.values(books).flatMap((b) => b.reports).find((x) => x.id === args.id);
        if (r) r.fixed = args.fixed ? { time: Date.now(), version: mapView()?.version ?? r.version } : null;
        return playtestView();
      }
      case "playtest_delete":
        for (const b of Object.values(books)) b.reports = b.reports.filter((x) => x.id !== args.id);
        return playtestView();
      case "playtest_teleport":
        if (!testers.length && serverView?.phase !== "ready") throw "No server is running.";
        return null;
      case "playtest_teleport_to":
        if (serverView?.phase !== "ready") throw "No server is running.";
        return args.player ? 1 : testers.length;
      case "playtest_save_report":
        throw demo ? "The demo can't save files. In DropLaunch this saves the reports as one HTML page you can send to someone." : "mock: no files";
      case "bug_reports_summary": {
        const kept = Object.values(books).filter((b) => b.reports.length);
        return { reports: kept.reduce((n, b) => n + b.reports.length, 0), maps: kept.length };
      }
      case "bug_reports_clear": {
        let n = 0;
        for (const b of Object.values(books)) (n += b.reports.length), (b.reports = []), (b.next = 0);
        emitPlaytest();
        return n;
      }
      case "reset_settings":
        return null;
      case "server_ask":
        if (!serverView?.rcon) throw "The console isn't connected yet.";
        return args.text === "c.profilestatus" ? "False" : "Saved the profile to 'carbon/profiles/demo.cprf'";
      // Settings, Dropped assets.
      case "assets_list":
        return {
          maps: recent.map((m) => ({ path: m.path, name: m.name, added: m.started ?? now, modified: m.modified, size: m.size, exists: true, made: [] })),
          zips: demo ? [{ path: "D:\\Downloads\\Canyon_Rally_pack.zip", name: "Canyon_Rally_pack", added: now - 86400, modified: now - 86400, size: 9811650, exists: true, made: [maps[0]?.path].filter(Boolean) }] : [],
          languages: [{ code: "en", name: "English", source: "builtIn", path: null, added: 0 }],
          startFiles: snap.startFiles.map((f) => ({ path: f.path, name: f.path.split("\\").pop(), map: f.map ? maps.find((m) => m.name === f.map)?.path ?? null : null, mapName: f.map ?? "Procedural map", prefab: f.prefab, modified: now - 3600, branch: snap.branch, own: true, settings: ["+server.port 28015", "+server.maxplayers 10", "+server.hostname \"DropLaunch test server\""] })),
          droppedStartFiles: structuredClone(droppedStartFiles),
          chosenProcgen: chosenStart.procgen,
          chosenMaps: chosenStart.maps,
          startDefaults: { seed: 1184645116, size: 3000, players: 10, port: 28015 },
          kits: mockKits.map((k) => ({ id: k.id, builtIn: k.name === "Basic Build Kit", name: k.name, path: `${base}\\DropLaunch-data\\Kits\\${k.name}.json`, items: k.wear.length + k.belt.length + k.main.length, modified: now - 7200 })),
          kitsDir: `${base}\\DropLaunch-data\\Kits`,
        };
      case "assets_forget":
        return null;
      // A browser can't read a dropped file: its name says what it's for.
      case "start_files_add": {
        const added = [];
        const problems = [];
        for (const path of args.paths) {
          const file = path.split("\\").pop();
          if (!/\.(bat|cmd|sh)$/i.test(file) || /update/i.test(file)) {
            problems.push(`${file}: not a Rust server start file (it doesn't start RustDedicated with server settings)`);
            continue;
          }
          const usage = /map|custom|level/i.test(file) ? "maps" : "procgen";
          const stem = file.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9-]+/g, "_").replace(/^_+|_+$/g, "") || "map";
          const name = `${stem}.${file.split(".").pop().toLowerCase()}`;
          // (What DropLaunch's own take: not a procedural map's level, seed and size.)
          const settings =
            usage === "procgen"
              ? [["server.port", "28015"], ["server.maxplayers", "50"], ["server.hostname", "My server"]]
              : [["server.port", "28015"], ["server.maxplayers", "50"], ["server.hostname", "My server"], ["decay.scale", "0"]];
          droppedStartFiles = droppedStartFiles.filter((f) => f.name.toLowerCase() !== name.toLowerCase());
          const seed = String(1000 + (hashOf(name) % 90000));
          droppedStartFiles.unshift({ name, path: `${base}\\DropLaunch-data\\StartFiles\\${name}.txt`, usage, args: settings, seed, size: "4000", added: Math.floor(Date.now() / 1000) });
          added.push({ name, usage, inUse: chosenStart[usage]?.toLowerCase() === name.toLowerCase() });
        }
        return { added, problems };
      }
      case "start_file_use": {
        const f = args.name ? droppedStartFiles.find((x) => x.name === args.name && x.usage === args.usage) : null;
        if (args.name && !f) throw `The start file ${args.name} is gone: drop it on DropLaunch again.`;
        chosenStart[args.usage] = f?.name ?? null;
        // The procedural map keeps its own seed and size.
        if (args.usage === "procgen") snap.procgen = { seed: "1184645116", size: "3000", file: f?.name ?? null };
        return null;
      }
      case "start_file_forget":
        droppedStartFiles = droppedStartFiles.filter((f) => f.name !== args.name);
        for (const usage of ["procgen", "maps"]) {
          if (chosenStart[usage] === args.name) chosenStart[usage] = null;
        }
        if (!chosenStart.procgen) snap.procgen = { seed: "1184645116", size: "3000", file: null };
        return null;
      case "kits_built_in":
        return [mockKits[0].id];
      case "set_owner": {
        const id = (args.steamId ?? "").trim().replace(/\/+$/, "").split("/").pop();
        if (!id) snap.owner = null;
        else if (!/^7656119\d{10}$/.test(id)) throw "A Steam64 ID has 17 digits and starts with 7656119.";
        else snap.owner = { steamId: id, name: args.name || "owner" };
        return structuredClone(snap);
      }
      case "cancel_job":
        cancelled = true;
        return null;
      case "quick_branches":
        await wait(0.6);
        if (params.has("nocache")) throw "offline";
        snap.branchCache = { checkedAt: Math.floor(Date.now() / 1000), source: "steamcmd.net", branches };
        return structuredClone(snap);
      case "fetch_branches": {
        cancelled = false;
        const ok = await play(loginScript.concat([[0.3, { kind: "phase", phase: "done" }]]), args.onEvent);
        if (!ok) throw "Cancelled";
        snap.branchCache = { checkedAt: Math.floor(Date.now() / 1000), source: "Steam", branches };
        return structuredClone(snap);
      }
      case "server_update": {
        if (snap.serverRunning) throw "A server from this folder is running. Stop it first: files that are in use can't be updated.";
        cancelled = false;
        const started = Date.now();
        const ok = await play(validateScript, args.onEvent);
        const seconds = (Date.now() - started) / 1000;
        if (!ok) {
          args.onEvent.onmessage?.({ kind: "phase", phase: "failed" });
          return { ok: false, cancelled: true, title: "Cancelled", detail: "SteamCMD was stopped.", buildid: null, seconds };
        }
        return { ok: true, cancelled: false, title: "Files verified", detail: "Build 25681086 on the public branch", buildid: "25681086", seconds };
      }
      case "reapply_oxide": {
        cancelled = false;
        await play(progressSteps("Downloading Oxide", 13291754, 5, 2), args.onEvent);
        snap.oxideInactive = false;
        return { ok: true, cancelled: false, title: "Oxide re-applied", detail: "Plugins load again on the next server start.", buildid: null, seconds: 2 };
      }
      case "server_space":
        return params.has("lowspace") && !snap.server ? { free: 3.2 * 1024 ** 3, needed: 6.5 * 1024 ** 3, drive: "drive C:" } : null;
      case "setup_all": {
        cancelled = false;
        const started = Date.now();
        const opts = args.options;
        const ok = await play(setupScript(opts), args.onEvent);
        const seconds = (Date.now() - started) / 1000;
        if (!ok) {
          args.onEvent.onmessage?.(task("server", "failed", "Cancelled"));
          return { ok: false, cancelled: true, title: "Cancelled", detail: "SteamCMD was stopped.", buildid: null, seconds };
        }
        snap.installs.forEach((i) => (i.active = false));
        snap.installs = snap.installs.filter((i) => i.branch !== opts.branch);
        snap.installs.unshift({ branch: opts.branch, path: snap.installs.length ? `${server}_${opts.branch}` : server, buildid: "25681086", fullyInstalled: true, lastUpdated: Math.floor(Date.now() / 1000), active: true });
        Object.assign(snap, {
          steamcmdInstalled: true,
          server: { ...installedServer, branch: opts.branch },
          setupNeeded: false,
          steamcmdFound: true,
          serverFound: true,
          framework: opts.framework,
          rustedit: opts.rustedit,
          playtest: Boolean(opts.playtest),
          profiler: Boolean(opts.profiler),
          whitelist: Boolean(opts.whitelist),
          backupClientMaps: opts.backupMaps !== false,
          startFile: `${server}\\start_procgen_server.bat`,
          updateScript: `${server}\\update_server.bat`,
          steamcmdUpdateScript: `${base}\\SteamCMD\\update_rust_server.bat`,
          startFiles: [{ path: `${server}\\start_procgen_server.bat`, map: null, prefab: false }],
          branch: opts.branch,
        });
        snap.folders.forEach((f) => (f.exists = true));
        if (opts.startServer) bootServer(opts.startMap ? { kind: "map", path: opts.startMap } : { kind: "procgen" });
        const fw = opts.framework === "none" ? [] : [`${opts.framework === "carbon" ? "Carbon" : "Oxide"}${opts.rustedit ? " + RustEdit extension" : " installed"}`];
        const detail = [`Build 25681086 (${opts.branch} branch)`, ...fw, ...(opts.startServer ? ["server starting"] : [])].join(" · ");
        return { ok: true, cancelled: false, title: "DropLaunch is ready", detail, buildid: "25681086", seconds };
      }
      case "list_maps":
        await wait(0.1);
        return {
          mapsDir: `${base}\\Maps`,
          mapsDirExists: true,
          maps: structuredClone(maps),
          history: structuredClone(recent),
          presets: droppedStartFiles
            .filter((f) => f.usage === "procgen")
            .map((f) => ({ name: f.name, title: f.name.replace(/\.[^.]+$/, ""), seed: f.seed, size: f.size, copy: f.path, startFile: f.startFile ?? null, added: f.added })),
        };
      case "import_files": {
        const dropped = args.paths.filter((p) => /\.map$/i.test(p));
        for (const p of dropped) {
          if ([...maps, ...recent].some((m) => m.path === p)) continue;
          const name = p.split("\\").pop().replace(/\.map$/i, "");
          recent.unshift({ path: p, name, folder: p.slice(0, p.lastIndexOf("\\")), size: 8811650 + (hashOf(p) % 4000000), modified: Math.floor(Date.now() / 1000), startFile: null, outside: true, started: Math.floor(Date.now() / 1000) });
        }
        return { maps: dropped, problems: args.paths.filter((p) => !/\.(map|zip)$/i.test(p)).map((p) => `${p.split("\\").pop()}: not a supported file. Check Dropped assets in Settings to see what DropLaunch supports.`) };
      }
      case "take_pending_files":
        return [];
      case "start_server": {
        if (snap.setupNeeded) throw "Install the server files first.";
        if (snap.oxideInactive && !args.ignoreOxide) return { result: "oxideInactive" };
        if (serverView && ["booting", "ready", "stopping"].includes(serverView.phase)) {
          if (!args.replace) return { result: "busy", title: serverView.title };
          const title = serverView.title;
          stopServer(false, args.target, args.prefab);
          return { result: "queued", title };
        }
        bootServer(args.target, args.prefab);
        await wait(0.05);
        return { result: "started", server: structuredClone(serverView) };
      }
      case "stop_server":
        stopServer(args.force);
        return null;
      case "restart_server":
        if (!serverView) throw "No server is running.";
        stopServer(false, serverView.preset ? { kind: "preset", name: serverView.preset } : serverView.procgen ? { kind: "procgen" } : { kind: "map", path: serverView.map }, serverView.prefab);
        return null;
      case "server_command":
        if (!serverView?.rcon) throw "The console isn't connected yet.";
        pushLines([[`> ${args.text}`, "cmd"]]);
        setTimeout(() => pushLines([[args.text === "status" ? `hostname: DropLaunch test server\nplayers : ${testers.length} (10 max)${testers.map((p) => `\n${p.id}  "${p.name}"`).join("")}` : `Command '${args.text}' ran`, "reply"]]), 300);
        return null;
      case "server_status":
        return { server: serverView && structuredClone(serverView), lines: structuredClone(consoleLines) };
      case "create_start_file": {
        const target = args.target;
        if (target.kind === "preset") {
          const kept = droppedStartFiles.find((f) => f.name === target.name);
          if (!kept) throw `The start file ${target.name} is gone: drop it on DropLaunch again.`;
          kept.startFile = `${server}\\start_procgen_${target.name.replace(/\.[^.]+$/, "")}.bat`;
          return [kept.startFile];
        }
        const m = target.kind === "map" ? maps.find((x) => x.path === target.path) : null;
        if (!m) return [`${server}\\start_procgen_server.bat`];
        m.startFile = `${server}\\start_${m.name}.bat`;
        m.prefabFile = `${server}\\start_${m.name}_prefab.bat`;
        return [m.startFile, m.prefabFile];
      }
      // Kits ("Give items"): two kits, three players while a server is up.
      case "kits_load":
        return structuredClone(mockKits);
      case "kits_save": {
        // New or changed kits and deleted ids; the others stay.
        const gone = new Set([...(args.removed ?? []), ...args.kits.map((k) => k.id)]);
        mockKits = [...mockKits.filter((k) => !gone.has(k.id)), ...structuredClone(args.kits)].sort((a, b) => a.name.localeCompare(b.name));
        return structuredClone(mockKits);
      }
      case "kits_import":
        return { imported: [], rest: args.paths };
      case "kit_items":
        throw "mock: the built-in item list";
      case "item_icon":
        throw "mock: no pictures";
      case "kit_players":
        if (!serverView?.rcon) throw "No server is running.";
        if (demo) return testers.map((p) => ({ id: p.id, name: p.name }));
        return [
          { id: "76561198000000001", name: "TedPommes" },
          { id: "76561198000000002", name: "MapTester" },
          { id: "76561198000000003", name: "A friend with a really long name here" },
        ];
      case "kit_give":
        await wait(0.6);
        return { players: args.players.length, exact: true };
      default:
        throw `mock: unknown command ${cmd}`;
    }
  }

  // The window: a browser tab can't be moved or resized, so these only answer.
  class Size {
    constructor(width, height) {
      Object.assign(this, { width, height });
    }
  }
  class Position {
    constructor(x, y) {
      Object.assign(this, { x, y });
    }
  }
  const ok = (value) => () => Promise.resolve(value);
  const thisWindow = {
    requestUserAttention: ok(),
    isMaximized: ok(false),
    isFullscreen: ok(false),
    scaleFactor: () => Promise.resolve(devicePixelRatio || 1),
    innerSize: () => Promise.resolve(new Size(Math.round(innerWidth * devicePixelRatio), Math.round(innerHeight * devicePixelRatio))),
    outerSize: () => Promise.resolve(new Size(Math.round(innerWidth * devicePixelRatio), Math.round(innerHeight * devicePixelRatio))),
    outerPosition: ok(new Position(0, 0)),
    setSize: ok(),
    setPosition: ok(),
    setMinSize: ok(),
    setFocus: ok(),
    onResized: ok(() => {}),
  };
  const window_ = { getCurrentWindow: () => thisWindow, currentMonitor: ok(null) };
  const dpi = { LogicalSize: Size, PhysicalSize: Size, PhysicalPosition: Position };
  window.__TAURI__ = { core: { invoke, Channel }, event, webview, window: window_, dpi };
})();
