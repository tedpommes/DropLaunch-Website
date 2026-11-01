# DropLaunch website

The site at [droplaunch.gg](https://droplaunch.gg): plain HTML, CSS and JavaScript with no build
step and nothing loaded from other sites. Cloudflare Pages publishes this repository as it is.

| Path | What it is |
| --- | --- |
| `index.html` | The start page. The download buttons point at the latest release's `DropLaunch.exe`; the version, size, date and notes come from GitHub's API when the page loads. |
| `generator.html` | The start file generator (served at `/generator`). `assets/generator.js` writes the same start files and update script as DropLaunch (`src-tauri/src/startfile.rs` in the app). |
| `demo/` | The demo page: the app's window at its real size, with a guided tour beside it that ticks off each step as it happens (`tour.js`, `tour.css`). `frame.js` and `frame.css` go into the window with the app: they tell the tour what the app does. |
| `demo/app/` | DropLaunch's real interface on a simulated backend. Built from the app repository, don't edit it here (see below). |
| `404.html` | Shown for pages that don't exist. |
| `assets/` | `site.css`, `site.js`, `generator.js`, the screenshots (`img/`, WebP in two sizes), icons and the link preview picture (`og.jpg`). |
| `_headers` | Cache and security headers for Cloudflare Pages. |
| `robots.txt`, `sitemap.xml` | For search engines. |

## Changing things

- **After editing `site.css`, `site.js` or `generator.js`**, raise the `?v=` number where the pages
  load them (`?v=1` → `?v=2`): browsers keep files from `assets/` for a week.
- **New screenshots**: save them as WebP at two widths next to the old ones in `assets/img/` and
  update the `srcset` in `index.html`. With ffmpeg:

      ffmpeg -i main.png -vf scale=640:-1 -quality 85 assets/img/main-640.webp

- **The demo**: in the DropLaunch repository run

      py dev/build_demo.py <this folder>/demo/app

  then delete `demo/app/artifact.html` (it's for other hosts). The tour reads the app's commands
  and element ids (`#setup-tasks`, `#server-panel`, `#btn-view`…): when the app renames one, the
  matching step in `demo/tour.js` needs the new name.

## Trying it locally

Any static file server works, for example `py -m http.server` in this folder, then open
<http://localhost:8000>. Links to `/generator` need `/generator.html` there; Cloudflare Pages
serves both.
