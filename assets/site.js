// droplaunch.gg: the menu on small screens, the screenshot viewer and the latest release from
// GitHub. Everything works without it; it only adds to the page.
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // The menu on small screens.
  const top = $(".top");
  const menu = $(".menu-btn");
  if (top && menu) {
    const set = (open) => {
      top.classList.toggle("open", open);
      menu.setAttribute("aria-expanded", String(open));
    };
    menu.addEventListener("click", () => set(!top.classList.contains("open")));
    $$(".nav a").forEach((a) => a.addEventListener("click", () => set(false)));
    document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  // Screenshots open large: arrows and swipes go through them, Esc closes.
  const box = $("#lightbox");
  const shots = $$("[data-shot]");
  if (box && shots.length) {
    const img = $("img", box);
    const caption = $(".caption", box);
    const prev = $(".prev", box);
    const next = $(".next", box);
    let at = 0;
    const show = (i) => {
      at = (i + shots.length) % shots.length;
      const s = shots[at];
      img.src = s.dataset.shot;
      img.alt = $("img", s).alt;
      caption.textContent = s.dataset.caption || $("img", s).alt;
    };
    shots.forEach((s, i) =>
      s.addEventListener("click", () => {
        show(i);
        box.showModal();
      }),
    );
    prev.addEventListener("click", () => show(at - 1));
    next.addEventListener("click", () => show(at + 1));
    $(".close", box).addEventListener("click", () => box.close());
    // A click beside the picture closes it.
    box.addEventListener("click", (e) => {
      if (e.target === box || e.target.classList.contains("stage")) box.close();
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(at - 1);
      if (e.key === "ArrowRight") show(at + 1);
    });
    let x0 = null;
    box.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    box.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    box.addEventListener("close", () => img.removeAttribute("src"));
  }

  // The latest release: its version, size, date and notes. Kept for an hour in this tab, since
  // GitHub allows 60 requests an hour without an account.
  const fields = $$("[data-release]");
  if (!fields.length) return;
  const KEY = "droplaunch-release";
  const fill = (r) => {
    const exe = (r.assets || []).find((a) => a.name === "DropLaunch.exe");
    const values = {
      version: r.tag_name,
      size: exe ? `${(exe.size / 1024 / 1024).toFixed(1)} MB` : "",
      date: r.published_at ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(r.published_at)) : "",
    };
    for (const el of fields) {
      const name = el.dataset.release;
      if (name === "notes") {
        if (r.body) el.replaceChildren(...notes(r.body));
      } else if (name === "page") {
        if (r.html_url) el.href = r.html_url;
      } else if (values[name]) {
        el.textContent = values[name];
      }
      el.closest("[data-release-hide]")?.removeAttribute("hidden");
    }
  };
  // The release notes, plain: "- " lines as a list, the rest as paragraphs, `code` as code.
  const inline = (text) =>
    text
      .replace(/\*\*|__/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .split("`")
      .map((part, i) => {
        if (i % 2 === 0) return document.createTextNode(part);
        const code = document.createElement("code");
        code.textContent = part;
        return code;
      });
  const notes = (body) => {
    const out = [];
    let list = null;
    for (const raw of body.replace(/\r/g, "").split("\n")) {
      const line = raw.trim();
      if (!line) {
        list = null;
        continue;
      }
      const item = line.match(/^[-*]\s+(.*)/);
      if (item) {
        if (!list) out.push((list = document.createElement("ul")));
        const li = document.createElement("li");
        li.append(...inline(item[1]));
        list.append(li);
      } else {
        list = null;
        const p = document.createElement("p");
        p.append(...inline(line.replace(/^#+\s*/, "")));
        out.push(p);
      }
    }
    return out;
  };
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (saved && Date.now() - saved.at < 3600e3) return fill(saved.release);
  } catch {}
  fetch("https://api.github.com/repos/tedpommes/DropLaunch/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((r) => {
      const release = { tag_name: r.tag_name, published_at: r.published_at, html_url: r.html_url, body: r.body, assets: (r.assets || []).map((a) => ({ name: a.name, size: a.size })) };
      fill(release);
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), release }));
      } catch {}
    })
    .catch(() => {});
})();
