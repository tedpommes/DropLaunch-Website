// The public demo's own layer (dev/build_demo.py): DropLaunch's real interface on a stand-in
// backend (dev/mock.js). It only adds a line saying nothing is installed, and notes on what a click
// does on a real PC; the app's own welcome and tips (Show me around) explain the rest.
// Loaded after mock.js and before app.js.
(() => {
  const DOWNLOAD = "https://github.com/tedpommes/DropLaunch/releases/latest";
  const HOME = "https://droplaunch.gg/";
  const make = (tag, props = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) k === "text" ? (node.textContent = v) : node.setAttribute(k, v);
    node.append(...children);
    return node;
  };

  document.body.classList.add("demo");
  document.body.prepend(
    make(
      "div",
      { id: "demo-bar" },
      make("b", { text: "Demo" }),
      make("span", { text: "Click around freely: downloads, the server and Rust are simulated, so nothing is installed." }),
      make("a", { href: HOME, text: "DropLaunch.gg" }),
      make("a", { href: DOWNLOAD, target: "_blank", rel: "noopener", text: "Download DropLaunch" }),
    ),
  );

  // A file dropped on the page would open in the tab: the app gets it instead (by name).
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", (e) => {
    e.preventDefault();
    const names = [...(e.dataTransfer?.files ?? [])].map((f) => f.name);
    if (names.length) window.__mockDrop(names);
  });

  // What a click does on a real PC, where the demo can't do it.
  const note = make("div", { id: "demo-note", role: "status", hidden: "" });
  document.body.append(note);
  let timer = 0;
  window.__demoNote = (text) => {
    note.replaceChildren(make("b", { text: "Simulated" }), make("span", { text }));
    note.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => (note.hidden = true), 5000);
  };
})();
