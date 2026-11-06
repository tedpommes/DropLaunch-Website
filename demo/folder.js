// droplaunch.gg/demo: a Downloads folder next to DropLaunch's window, like Windows' File Explorer,
// with one of each kind of file DropLaunch takes (app/mock.js lists them: __mockDownloads). Drag
// one onto the window as on a PC (frame.js hands the drag to the app), or pick one and press Drop
// on DropLaunch (or double-click it, or press Enter), which works on a phone too.
(() => {
  const $ = (id) => document.getElementById(id);
  const frame = $("app");
  const box = $("downloads");
  const list = $("dl-files");
  const about = $("dl-about");
  const dropButton = $("dl-drop");
  const count = $("dl-count");
  const info = $("dl-info");
  const tour = window.__demoTour;
  if (!box || !tour) return;

  /** What DropLaunch does with each kind of file. */
  const ABOUT = {
    map: "A map, as RustEdit saves it. DropLaunch starts it right where it is, so a re-export is picked up on the next start.",
    zip: "A map with its start file, the way maps get shared. DropLaunch unpacks it into its Maps folder, uses the start file's settings and starts the map.",
    startfile: "A start file, like one from the start file generator. The procedural map starts with its settings: players, port, server name and the rest.",
    kit: "A kit: tools and building materials to hand to players with Give items, in More options.",
    theme: "A theme: DropLaunch's window takes its colours right away. Settings → Visuals switches back.",
    language: "A language file: DropLaunch's texts in Dutch. Lines it leaves out stay English.",
  };
  const HINT = "Drag a file onto DropLaunch, like on your PC. Or pick one and press Drop on DropLaunch.";

  // Windows-like file icons (32 × 32).
  const page = (inner) =>
    `<path d="M7.5 2.5h11l7 7v19a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-25a1 1 0 0 1 1-1z" fill="#f3f3f3" stroke="#b4b4b4"/><path d="M18.5 2.5v6a1 1 0 0 0 1 1h6" fill="#dcdcdc" stroke="#b4b4b4" stroke-linejoin="round"/>${inner}`;
  const json = page('<text x="16" y="24" text-anchor="middle" font-family="Consolas, Menlo, monospace" font-size="10" font-weight="700" fill="#7c4dd6">{ }</text>');
  const ICONS = {
    map: page('<rect x="9.5" y="13" width="13" height="12" rx="1.5" fill="#3a86c8"/><path d="M11 24.5c.6-3.6 2.6-6.3 5.4-6.3 2 0 3.3 1.4 4.6 3.6l.5 2.7z" fill="#62b35a"/><path d="M14.5 21.2c.8-.9 1.6-1.3 2.4-1.3" stroke="#e9dca8" stroke-width="1.2" fill="none" stroke-linecap="round"/>'),
    startfile: page('<rect x="9" y="13" width="14" height="12" rx="1.5" fill="#262626"/><path d="M11.8 16.6l2.6 2.2-2.6 2.2M15.8 22.2h4.4" stroke="#e8e8e8" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
    zip: '<path d="M2.5 8a2 2 0 0 1 2-2h7.6l3 3h12.4a2 2 0 0 1 2 2v14.5a2 2 0 0 1-2 2h-23a2 2 0 0 1-2-2z" fill="#e2a52b"/><path d="M2.5 12.5h27v13a2 2 0 0 1-2 2h-23a2 2 0 0 1-2-2z" fill="#ffcb4c"/><path d="M15 9.5v17.5" stroke="#5d4a1c" stroke-width="2.6" stroke-dasharray="1.5 1.5"/><rect x="13" y="16" width="4" height="5" rx="1" fill="#5d4a1c"/>',
    kit: json,
    theme: json,
    language: json,
  };
  const svg = (inner) => `<svg class="dl-icon" viewBox="0 0 32 32" aria-hidden="true">${inner}</svg>`;
  /** Explorer's sizes: whole KB, with thousands separators. */
  const kb = (bytes) => `${Math.max(1, Math.ceil(bytes / 1024)).toLocaleString("en-US")} KB`;
  const mb = (bytes) => (bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(2)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`);

  let files = [];
  let selected = null;

  function render() {
    const fromApp = frame.contentWindow?.__mockDownloads;
    if (!Array.isArray(fromApp) || !fromApp.length) return;
    files = fromApp;
    if (!files.some((f) => f.name === selected)) selected = null;
    list.replaceChildren(
      ...files.map((f) => {
        const row = document.createElement("li");
        row.className = "dl-file";
        row.id = `dl-${f.kind}`;
        row.setAttribute("role", "option");
        row.draggable = true;
        row.dataset.name = f.name;
        row.title = `${f.name}\nType: ${f.type}\nSize: ${kb(f.size)}`;
        row.innerHTML = `${svg(ICONS[f.kind] ?? json)}<span class="dl-text"><span class="dl-name"></span><span class="dl-meta"></span></span>`;
        row.querySelector(".dl-name").textContent = f.name;
        row.querySelector(".dl-meta").textContent = `${f.type} · ${kb(f.size)}`;
        return row;
      }),
    );
    count.textContent = `${files.length} items`;
    show();
  }

  function show() {
    const file = files.find((f) => f.name === selected);
    for (const row of list.children) {
      const on = row.dataset.name === selected;
      row.classList.toggle("selected", on);
      row.setAttribute("aria-selected", String(on));
    }
    if (file) list.setAttribute("aria-activedescendant", `dl-${file.kind}`);
    else list.removeAttribute("aria-activedescendant");
    about.textContent = file ? ABOUT[file.kind] ?? "" : HINT;
    dropButton.disabled = !file;
    info.textContent = file ? `1 item selected  ${mb(file.size)}` : "";
  }

  function select(name) {
    selected = name;
    show();
  }

  /** As if dragged onto the window and dropped. */
  function drop(name) {
    if (!name) return;
    const app = frame.contentWindow;
    if (typeof app?.__mockDrop !== "function") return;
    app.__mockDrop([name]);
  }

  list.addEventListener("click", (e) => {
    const row = e.target.closest(".dl-file");
    select(row ? row.dataset.name : null);
  });
  list.addEventListener("dblclick", (e) => drop(e.target.closest(".dl-file")?.dataset.name));
  list.addEventListener("keydown", (e) => {
    const at = files.findIndex((f) => f.name === selected);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = files[Math.max(0, Math.min(files.length - 1, at + (e.key === "ArrowDown" ? 1 : -1)))];
      if (next) select(next.name);
      list.querySelector(".dl-file.selected")?.scrollIntoView({ block: "nearest", inline: "nearest" });
    } else if (e.key === "Enter" && selected) {
      e.preventDefault();
      drop(selected);
    }
  });
  dropButton.addEventListener("click", () => drop(selected));

  // Dragged out of the folder: frame.js knows what's coming by these names (a page can't tell
  // another what a drag holds until it's dropped).
  list.addEventListener("dragstart", (e) => {
    const row = e.target.closest(".dl-file");
    if (!row) return;
    select(row.dataset.name);
    tour.dragging = [row.dataset.name];
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", row.dataset.name);
    box.classList.add("dragging");
  });
  list.addEventListener("dragend", () => {
    tour.dragging = null;
    box.classList.remove("dragging");
    frame.contentWindow?.__demoDragEnd?.();
  });
  // Back over this page from the window: the window's drop overlay goes.
  document.addEventListener("dragenter", () => tour.dragging && frame.contentWindow?.__demoDragEnd?.());

  frame.addEventListener("load", render);
  render();
})();
