// The start file generator (droplaunch.gg/generator): the start files and update script DropLaunch
// writes for its own servers (src-tauri/src/startfile.rs in the app), for any server folder.
// Everything happens on this page; the settings are kept in this browser only.
(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("gen-form");
  const out = $("out");
  const KEY = "droplaunch-generator";
  const MARK = "Made with DropLaunch.gg";
  const RUST_SERVER_APP_ID = 258550;
  const STEAMCMD_DOWNLOAD = {
    win: "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip",
    linux: "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz",
  };
  const OXIDE_ZIP = {
    win: "https://github.com/OxideMod/Oxide.Rust/releases/latest/download/Oxide.Rust.zip",
    linux: "https://github.com/OxideMod/Oxide.Rust/releases/latest/download/Oxide.Rust-linux.zip",
  };
  // DropLaunch's prefab test mode: quiets everything that gets in the way of testing unfinished maps.
  const PREFAB_ARGS = [
    "+cargoship.event_enabled false",
    "+baseboat.generate_paths false",
    "+ai.ocean_patrol_path_iterations 0",
    "+server.events false",
    "+antihack.terrain_protection 0",
  ];
  const PASSWORD_CHARS = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let tab = "start";
  let os = "win";

  // ------------------------------------------------------------ values

  const el = (name) => form.elements[name];
  const text = (name) => el(name).value.replace(/[\r\n]+/g, " ").trim();
  const on = (name) => el(name).checked;
  // A whole number in range, or the fallback (and the field marked) when it isn't one.
  const num = (name, min, max, fallback) => {
    const field = el(name);
    const raw = field.value.trim();
    const n = Number(raw);
    const ok = raw !== "" && Number.isInteger(n) && n >= min && n <= max;
    field.setAttribute("aria-invalid", String(!ok));
    return ok ? n : fallback;
  };

  // Batch files expand %: double it. Unquoted text (title, echo, rem) also escapes the command characters.
  const bat = (s) => s.replace(/%/g, "%%");
  const batBare = (s) => s.replace(/[%^&|<>]/g, (c) => (c === "%" ? "%%" : `^${c}`));
  // Inside bash's double quotes.
  const sh = (s) => s.replace(/[\\"$`]/g, "\\$&");
  const noQuotes = (s) => s.replace(/"/g, "'");
  const identity = (s) => s.replace(/[^A-Za-z0-9_.-]+/g, "_").replace(/^[._]+|[._]+$/g, "") || "my_server";
  // Branch names are plain words: never let one inject script syntax.
  const branch = (s) => s.replace(/[^A-Za-z0-9_.-]/g, "") || "public";
  const isUrl = (s) => /^https?:\/\//i.test(s);
  const fileName = (path) => path.split(/[\\/]/).filter(Boolean).pop() || path;

  const random = (n) => {
    const a = new Uint32Array(n);
    crypto.getRandomValues(a);
    return a;
  };
  const newPassword = () => [...random(16)].map((v) => PASSWORD_CHARS[v % PASSWORD_CHARS.length]).join("");
  const newSeed = () => random(1)[0] % 2147483647;

  // ------------------------------------------------------------ start file

  function startOptions() {
    const o = {
      mode: el("mode").value,
      worldsize: num("worldsize", 1000, 6000, 3000),
      seed: num("seed", 0, 2147483647, 1184645116),
      map: text("map"),
      hostname: noQuotes(text("hostname")) || "My Rust server",
      description: noQuotes(text("description")),
      identity: identity(text("identity")),
      maxplayers: num("maxplayers", 1, 1000, 50),
      port: num("port", 1, 65535, 28015),
      saveinterval: num("saveinterval", 30, 86400, 600),
      rconport: num("rconport", 1, 65535, 28016),
      rconpassword: noQuotes(text("rconpassword")),
      rconlocal: on("rconlocal"),
      prefab: on("prefab"),
      restart: on("restart"),
      pause: on("pause"),
      log: on("log"),
      extra: el("extra")
        .value.split(/\r?\n/)
        .map((l) => l.trim().replace(/\s*[\^\\]$/, ""))
        .filter(Boolean)
        .map((l) => (/^[+-]/.test(l) ? l : `+${l}`)),
    };
    o.wipe = o.mode === "procgen" ? on("wipeProc") : on("wipeMap");
    o.local = o.mode === "map" && !isUrl(o.map);
    el("map").setAttribute("aria-invalid", String(o.mode === "map" && !o.map));
    el("rconpassword").setAttribute("aria-invalid", String(!o.rconpassword));
    if (!o.map) o.map = "maps/my_map.map";
    // A path in the system's own style (a link stays as it is).
    if (o.local) o.map = os === "win" ? o.map.replace(/\//g, "\\") : o.map.replace(/\\/g, "/");
    return o;
  }

  function serverArgs(o, win) {
    const q = (s) => `"${win ? bat(s) : sh(s)}"`;
    const args = [`+server.port ${o.port}`];
    if (o.mode === "procgen") args.push('+server.level "Procedural Map"', `+server.seed ${o.seed}`, `+server.worldsize ${o.worldsize}`);
    else if (!o.local) args.push(`+server.levelurl ${q(o.map)}`);
    else args.push(win ? '+server.levelurl "%LEVEL_URL%"' : '+server.levelurl "$LEVEL_URL"');
    args.push(`+server.maxplayers ${o.maxplayers}`, `+server.hostname ${q(o.hostname)}`);
    if (o.description) args.push(`+server.description ${q(o.description)}`);
    args.push(`+server.identity "${o.identity}"`, `+server.saveinterval ${o.saveinterval}`);
    if (o.prefab) args.push(...PREFAB_ARGS);
    args.push(`+rcon.ip ${o.rconlocal ? "127.0.0.1" : "0.0.0.0"}`, `+rcon.port ${o.rconport}`, `+rcon.password ${q(o.rconpassword)}`, "+rcon.web 1");
    // Extra arguments take the place of one with the same name, or are added.
    for (const extra of o.extra) {
      const arg = win ? bat(extra) : extra;
      const name = arg.split(/\s/)[0].toLowerCase();
      const at = args.findIndex((a) => a.split(" ")[0].toLowerCase() === name);
      if (at >= 0) args[at] = arg;
      else args.push(arg);
    }
    if (o.log) args.push(win ? `-logfile "logs\\${o.identity}.log"` : `-logfile "logs/${o.identity}.log"`);
    return args;
  }

  const what = (o) =>
    o.mode === "procgen" ? `a procedural map (seed ${o.seed}, size ${o.worldsize})` : o.local ? fileName(o.map) : `the map at ${o.map}`;

  function startBat(o) {
    const title = batBare(o.hostname);
    const L = ["@echo off", `rem Starts the Rust server "${title}" with ${batBare(what(o))}. ${MARK}`];
    L.push("rem Put it in the server folder, next to RustDedicated.exe, and double-click it.");
    if (o.prefab) L.push("rem Prefab test mode: no cargo ship, boat paths, ocean patrols, events or terrain protection.");
    L.push(`title ${title}`, 'cd /d "%~dp0"');
    if (o.restart) L.push(":start");
    if (o.local) {
      L.push(`set "MAP_FILE=${bat(o.map)}"`);
      L.push('for %%I in ("%MAP_FILE%") do set "MAP_FILE=%%~fI"');
      L.push('if not exist "%MAP_FILE%" goto map_missing');
      L.push('set "LEVEL_URL=file:///%MAP_FILE:\\=/%"');
    }
    if (o.wipe) {
      L.push("rem Fresh world: remove the server's copy of the map and the save from the last run.");
      L.push(`if exist "server\\${o.identity}\\" del /q "server\\${o.identity}\\*.map" "server\\${o.identity}\\*.sav*" >nul 2>&1`);
    }
    if (o.log) L.push('if not exist "logs\\" mkdir logs');
    L.push(`echo Starting ${title}. ${MARK}`);
    if (o.mode === "procgen") L.push("echo The first start generates the map, give it a few minutes.");
    L.push(`echo When it says "Server startup complete": open Rust, press F1 and type  client.connect 127.0.0.1:${o.port}`);
    L.push("echo.");
    L.push('"%~dp0RustDedicated.exe" -batchmode ^');
    const args = serverArgs(o, true);
    args.forEach((a, i) => L.push(i === args.length - 1 ? ` ${a}` : ` ${a} ^`));
    L.push("echo.");
    if (o.restart) {
      L.push("echo The server has stopped. It starts again in 10 seconds: close this window to stop it.");
      // ping waits even without a keyboard (timeout quits at once when input is redirected).
      L.push("ping -n 11 127.0.0.1 >nul", "goto start");
    } else {
      L.push("echo The server has stopped.");
    }
    if (o.local) {
      if (!o.restart) L.push("goto done");
      L.push(":map_missing");
      L.push('echo The map file was not found: "%MAP_FILE%"');
      L.push("echo Fix the MAP_FILE line in this file.");
      if (!o.restart) L.push(":done");
    }
    // With a restart, only a missing map gets here.
    if (o.pause && (!o.restart || o.local)) L.push("pause");
    // cmd.exe needs the UTF-8 code page for anything that isn't ASCII (the file is UTF-8).
    if (L.some((l) => /[^\x00-\x7f]/.test(l))) L.splice(1, 0, "chcp 65001 >nul");
    return L;
  }

  function startSh(o) {
    const L = ["#!/usr/bin/env bash", `# Starts the Rust server "${o.hostname}" with ${what(o)}. ${MARK}`];
    L.push("# Put it in the server folder, next to RustDedicated, then: chmod +x it and run it.");
    if (o.prefab) L.push("# Prefab test mode: no cargo ship, boat paths, ocean patrols, events or terrain protection.");
    L.push('HERE="$(cd "$(dirname "$0")" && pwd)"', 'cd "$HERE"');
    if (o.local) {
      const path = o.map.startsWith("/") ? sh(o.map) : o.map.startsWith("~/") ? `$HOME/${sh(o.map.slice(2))}` : `$HERE/${sh(o.map)}`;
      L.push(`MAP_FILE="${path}"`);
      L.push('[ -f "$MAP_FILE" ] || { echo "Map file not found: $MAP_FILE"; exit 1; }');
      L.push('LEVEL_URL="file://$MAP_FILE"');
    }
    if (o.log) L.push("mkdir -p logs");
    L.push('export LD_LIBRARY_PATH="$HERE/RustDedicated_Data/Plugins/x86_64:$LD_LIBRARY_PATH"');
    L.push("[ -f carbon/tools/environment.sh ] && source carbon/tools/environment.sh");
    const pad = o.restart ? "  " : "";
    if (o.restart) L.push("while true; do");
    if (o.wipe) {
      L.push(`${pad}# Fresh world: remove the server's copy of the map and the save from the last run.`);
      L.push(`${pad}rm -f "server/${o.identity}/"*.map "server/${o.identity}/"*.sav*`);
    }
    L.push(`${pad}echo "When it says \\"Server startup complete\\": open Rust, press F1 and type  client.connect 127.0.0.1:${o.port}"`);
    L.push(`${pad}./RustDedicated -batchmode \\`);
    const args = serverArgs(o, false);
    args.forEach((a, i) => L.push(i === args.length - 1 ? `${pad}  ${a}` : `${pad}  ${a} \\`));
    if (o.restart) {
      L.push('  echo "The server has stopped. It starts again in 10 seconds: press Ctrl+C to stop it."');
      L.push("  sleep 10", "done");
    }
    return L;
  }

  // ------------------------------------------------------------ update script

  function updateOptions() {
    return {
      steamcmd: text(os === "win" ? "steamcmd" : "steamcmdLinux") || (os === "win" ? "C:\\steamcmd\\steamcmd.exe" : "~/steamcmd/steamcmd.sh"),
      branch: branch(text("branch")),
      validate: on("validate"),
      getSteamcmd: on("getSteamcmd"),
      oxide: on("oxide"),
    };
  }

  function updateBat(o) {
    const app = `+login anonymous +app_update ${RUST_SERVER_APP_ID} -beta ${o.branch}`;
    const steamcmd = (validate) => `"%STEAMCMD%" +@ShutdownOnFailedCommand 1 +@NoPromptForPassword 1 +force_install_dir "%~dp0." ${app} ${validate} +quit`;
    const wait = (label) => [
      `:${label}`,
      `tasklist /NH /FI "IMAGENAME eq steamcmd.exe" 2>nul | find /i "steamcmd.exe" >nul && (ping -n 3 127.0.0.1 >nul & goto ${label})`,
    ];
    const L = [
      "@echo off",
      `rem Installs or updates the Rust server in this folder with SteamCMD (${o.branch} branch). ${MARK}`,
      "rem Put it in the server folder. Run it as  update_server.bat validate  to also check every file.",
      "rem Stop the server first: files that are in use can't be updated.",
      "title Update the Rust server",
      'cd /d "%~dp0"',
      `set "STEAMCMD=${bat(o.steamcmd)}"`,
    ];
    if (o.getSteamcmd) {
      L.push(
        'if exist "%STEAMCMD%" goto steamcmd_ok',
        "echo Downloading SteamCMD...",
        'for %%I in ("%STEAMCMD%") do set "STEAMCMD_DIR=%%~dpI"',
        'if not exist "%STEAMCMD_DIR%" mkdir "%STEAMCMD_DIR%"',
        `"%SystemRoot%\\System32\\curl.exe" -fL --retry 2 -o "%TEMP%\\steamcmd.zip" "${STEAMCMD_DOWNLOAD.win}" || goto steamcmd_missing`,
        '"%SystemRoot%\\System32\\tar.exe" -xf "%TEMP%\\steamcmd.zip" -C "%STEAMCMD_DIR%." || goto steamcmd_missing',
        'del "%TEMP%\\steamcmd.zip" >nul 2>&1',
        ":steamcmd_ok",
      );
    }
    L.push('if not exist "%STEAMCMD%" goto steamcmd_missing');
    L.push(o.validate ? 'set "VALIDATE=validate"' : 'set "VALIDATE="');
    if (!o.validate) L.push('if /i "%~1"=="validate" set "VALIDATE=validate"');
    L.push(`echo Updating the Rust server (${o.branch} branch) with SteamCMD...`, "echo.");
    L.push(steamcmd("%VALIDATE%"));
    L.push("rem SteamCMD restarts itself after updating itself: wait until it's really done.");
    L.push(...wait("wait_steamcmd"));
    L.push("rem Steam's manifest says StateFlags 4 when the update went through. When it didn't, files it had to");
    L.push("rem patch were often missing: Steam has marked them now, and a run that checks every file gets them again.");
    L.push(`findstr /c:"StateFlags" "steamapps\\appmanifest_${RUST_SERVER_APP_ID}.acf" 2>nul | findstr /c:"\\"4\\"" >nul && goto updated`);
    L.push("echo.", "echo The update didn't go through. Checking every file and trying again...", "echo.");
    L.push(steamcmd("validate"));
    L.push(...wait("wait_steamcmd_again"));
    L.push(":updated");
    if (o.oxide) {
      L.push(
        "rem Oxide replaces Rust files that every update puts back: re-apply it when that happened.",
        'if not exist "RustDedicated_Data\\Managed\\Oxide.Rust.dll" goto finished',
        'findstr /m /c:"Oxide.Core" "RustDedicated_Data\\Managed\\Assembly-CSharp.dll" >nul 2>&1 && goto finished',
        "echo.",
        "echo The update removed Oxide, putting it back...",
        `"%SystemRoot%\\System32\\curl.exe" -fL --retry 2 -o "%TEMP%\\oxide.zip" "${OXIDE_ZIP.win}" || goto oxide_failed`,
        '"%SystemRoot%\\System32\\tar.exe" -xf "%TEMP%\\oxide.zip" -C "%~dp0." || goto oxide_failed',
        'del "%TEMP%\\oxide.zip" >nul 2>&1',
        "echo Oxide re-applied.",
        "goto finished",
        ":oxide_failed",
        "echo Could not re-apply Oxide: unpack Oxide.Rust.zip from umod.org in this folder.",
      );
    }
    L.push(
      "goto finished",
      ":steamcmd_missing",
      'echo SteamCMD was not found at "%STEAMCMD%".',
      "echo Fix the STEAMCMD line in this file.",
      ":finished",
      "echo.",
      "echo Done.",
      "pause",
    );
    if (L.some((l) => /[^\x00-\x7f]/.test(l))) L.splice(1, 0, "chcp 65001 >nul");
    return L;
  }

  function updateSh(o) {
    const path = o.steamcmd.startsWith("~/") ? `$HOME/${sh(o.steamcmd.slice(2))}` : sh(o.steamcmd);
    const app = `+login anonymous +app_update ${RUST_SERVER_APP_ID} -beta ${o.branch}`;
    const L = [
      "#!/usr/bin/env bash",
      `# Installs or updates the Rust server in this folder with SteamCMD (${o.branch} branch). ${MARK}`,
      "# Put it in the server folder. Run it as  ./update_server.sh validate  to also check every file.",
      "# Stop the server first: files that are in use can't be updated.",
      'HERE="$(cd "$(dirname "$0")" && pwd)"',
      `STEAMCMD="${path}"`,
    ];
    if (o.getSteamcmd) {
      L.push(
        'if ! command -v "$STEAMCMD" >/dev/null; then',
        '  echo "Downloading SteamCMD..."',
        '  mkdir -p "$(dirname "$STEAMCMD")"',
        `  curl -fsSL "${STEAMCMD_DOWNLOAD.linux}" | tar -xz -C "$(dirname "$STEAMCMD")" || exit 1`,
        "fi",
      );
    }
    L.push(o.validate ? 'VALIDATE="validate"' : 'VALIDATE="$1"');
    L.push(`"$STEAMCMD" +force_install_dir "$HERE" ${app} $VALIDATE +quit`);
    L.push("# Not through (StateFlags 4 in Steam's manifest)? Often files it had to patch were missing: Steam has");
    L.push("# marked them now, and a run that checks every file gets them again.");
    L.push(
      `grep -q '"StateFlags"[[:space:]]*"4"' "$HERE/steamapps/appmanifest_${RUST_SERVER_APP_ID}.acf" 2>/dev/null || "$STEAMCMD" +force_install_dir "$HERE" ${app} validate +quit`,
    );
    if (o.oxide) {
      L.push(
        "# Oxide replaces Rust files that every update puts back: re-apply it when that happened.",
        'if [ -f "$HERE/RustDedicated_Data/Managed/Oxide.Rust.dll" ] && ! grep -q "Oxide.Core" "$HERE/RustDedicated_Data/Managed/Assembly-CSharp.dll"; then',
        '  echo "The update removed Oxide, putting it back..."',
        `  curl -fsSL -o /tmp/oxide.zip "${OXIDE_ZIP.linux}" && unzip -oq /tmp/oxide.zip -d "$HERE" && rm -f /tmp/oxide.zip`,
        "fi",
      );
    }
    L.push('echo "Done."');
    return L;
  }

  // ------------------------------------------------------------ the page

  let current = { name: "", text: "" };

  function render() {
    const win = os === "win";
    let lines;
    let name;
    if (tab === "start") {
      const o = startOptions();
      lines = win ? startBat(o) : startSh(o);
      name = `start_${o.identity}.${win ? "bat" : "sh"}`;
      $("out-note").textContent = win
        ? "Put it in the server folder, next to RustDedicated.exe, and double-click it."
        : "Put it in the server folder, next to RustDedicated, then run chmod +x on it and start it.";
    } else {
      lines = win ? updateBat(updateOptions()) : updateSh(updateOptions());
      name = `update_server.${win ? "bat" : "sh"}`;
      $("out-note").textContent = win
        ? "Put it in the folder for the server files (an empty one for a new server) and double-click it."
        : "Put it in the folder for the server files (an empty one for a new server), then run chmod +x on it and start it.";
    }
    current = { name, text: lines.join(win ? "\r\n" : "\n") + (win ? "\r\n" : "\n") };
    $("out-name").textContent = name;
    // Comments in grey.
    out.replaceChildren(
      ...lines.flatMap((l) => {
        const comment = /^\s*(rem |#(?!!))/.test(l);
        if (!comment) return [document.createTextNode(`${l}\n`)];
        const span = document.createElement("span");
        span.className = "c";
        span.textContent = l;
        return [span, document.createTextNode("\n")];
      }),
    );
    save();
  }

  function showOs() {
    for (const b of document.querySelectorAll("[data-os-pick]")) b.setAttribute("aria-pressed", String(b.dataset.osPick === os));
    for (const node of document.querySelectorAll("[data-os]")) node.hidden = node.dataset.os !== os;
  }

  function showTab() {
    for (const b of document.querySelectorAll('[role="tab"]')) {
      const selected = b.dataset.tab === tab;
      b.setAttribute("aria-selected", String(selected));
      b.tabIndex = selected ? 0 : -1;
      $(b.getAttribute("aria-controls")).hidden = !selected;
    }
  }

  function showMode() {
    const mode = el("mode").value;
    for (const node of document.querySelectorAll("[data-mode]")) node.hidden = node.dataset.mode !== mode;
  }

  function save() {
    const values = {};
    for (const f of form.elements) {
      if (!f.name || f.type === "button") continue;
      if (f.type === "radio") {
        if (f.checked) values[f.name] = f.value;
      } else values[f.name] = f.type === "checkbox" ? f.checked : f.value;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify({ tab, os, values }));
    } catch {}
  }

  function load() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || "null");
    } catch {}
    if (saved?.values) {
      for (const [name, value] of Object.entries(saved.values)) {
        const f = el(name);
        if (!f) continue;
        if (f instanceof RadioNodeList) f.value = value;
        else if (f.type === "checkbox") f.checked = Boolean(value);
        else f.value = value;
      }
    }
    if (saved?.tab === "start" || saved?.tab === "update") tab = saved.tab;
    if (saved?.os === "win" || saved?.os === "linux") os = saved.os;
    if (!el("rconpassword").value) el("rconpassword").value = newPassword();
    // A link to #update opens that tab.
    if (location.hash === "#update") tab = "update";
  }

  let toastTimer = 0;
  function toast(message) {
    const t = $("toast");
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  form.addEventListener("input", render);
  form.addEventListener("change", () => {
    showMode();
    render();
  });
  form.addEventListener("submit", (e) => e.preventDefault());

  for (const b of document.querySelectorAll('[role="tab"]')) {
    b.addEventListener("click", () => {
      tab = b.dataset.tab;
      showTab();
      render();
    });
    // Arrow keys move between the tabs.
    b.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      const next = tabs[(tabs.indexOf(b) + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      next.click();
    });
  }
  for (const b of document.querySelectorAll("[data-os-pick]")) {
    b.addEventListener("click", () => {
      os = b.dataset.osPick;
      showOs();
      render();
    });
  }
  $("new-seed").addEventListener("click", () => {
    el("seed").value = newSeed();
    render();
  });
  $("new-password").addEventListener("click", () => {
    el("rconpassword").value = newPassword();
    render();
  });
  $("copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(current.text);
      toast(`Copied ${current.name}`);
    } catch {
      // No clipboard (an old browser, or not allowed): select the text to copy by hand.
      getSelection().selectAllChildren(out);
      toast("Press Ctrl+C to copy");
    }
  });
  $("download").addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([current.text], { type: "application/octet-stream" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: current.name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Downloaded ${current.name}`);
  });
  $("reset").addEventListener("click", () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    form.reset();
    el("rconpassword").value = newPassword();
    showMode();
    render();
    toast("Back to the defaults");
  });

  load();
  showTab();
  showOs();
  showMode();
  render();
})();
