# Gensolve — company website

**Generational problems. Generative ideas.**

The website for Gensolve, a technology company building AI-first products and software across
AI, web development, software engineering and app development. Our first product is
[NewVis AI](https://newvis.gensolve.in/).

It is a static site: plain HTML, CSS and a little JavaScript, with no build step and no dependencies.

## Run it locally

There is nothing to install from npm or pip, and no build step. You serve the folder with any
static file server and open it in a browser.

### Prerequisites

| You need | Version | Check it with | Get it from |
| -------- | ------- | ------------- | ----------- |
| **Git** | any recent | `git --version` | <https://git-scm.com/downloads> |
| **Python** | 3.8 or newer | `python --version` (or `python3 --version`) | <https://www.python.org/downloads/> |
| **A modern browser** | Chrome, Edge, Firefox or Safari from the last 2 years | — | — |
| **Access to this repo** | — | You can open <https://github.com/GenSolve/website> | Ask a GenSolve org admin |

Notes:

- **Windows:** when installing Python, tick **"Add python.exe to PATH"** on the first screen.
  If `python` opens the Microsoft Store instead, turn off the `python.exe` alias in
  *Settings → Apps → Advanced app settings → App execution aliases*, or use `py` instead of `python`.
- **macOS / Linux:** Python 3 is usually already installed as `python3`. Use `python3` wherever
  this guide says `python`.
- **Repo access:** the repo is private. Cloning over HTTPS will ask you to sign in to GitHub
  (Git Credential Manager opens a browser window on Windows and macOS). If you use SSH keys,
  clone with `git@github.com:GenSolve/website.git` instead.
- **Browser:** the animated background uses WebGL. If WebGL is off or unavailable, the site still
  works with a plain background.

### Step by step

1. Get the code (first time only):

   ```bash
   git clone https://github.com/GenSolve/website.git
   cd website
   ```

   Already cloned? Get the latest instead:

   ```bash
   git pull
   ```

2. Start a local server from inside the `website` folder:

   ```bash
   python -m http.server 8100
   ```

   You should see `Serving HTTP on :: port 8100 ...`. Leave this terminal open.

3. Open <http://localhost:8100> in your browser.

4. Stop the server with `Ctrl + C` in that terminal.

Opening `index.html` by double-clicking it (a `file://` address) is not supported: fonts,
icons and the background can fail to load. Always use a local server.

### Other ways to serve it

Any static server works. Use whichever you already have:

| Tool | Command |
| ---- | ------- |
| Python (recommended) | `python -m http.server 8100` |
| Node.js | `npx serve -l 8100` |
| VS Code | Install the **Live Server** extension, right-click `index.html` → *Open with Live Server* |

### Try it on your phone

Your phone and computer must be on the same Wi-Fi.

1. Start the server so other devices can reach it:

   ```bash
   python -m http.server 8100 --bind 0.0.0.0
   ```

2. Find your computer's local IP address: `ipconfig` on Windows (look for *IPv4 Address*),
   or `ipconfig getifaddr en0` on macOS.
3. On the phone, open `http://<that-ip>:8100`, for example `http://192.168.1.20:8100`.

On Windows, allow Python through the firewall if it asks (private networks only).

### Useful preview options

Add these to the address while previewing:

| Address | What it does |
| ------- | ------------ |
| `/?bg=aurora` | Previews another background (`liquid`, `aurora`, `contour`, `mesh`, `network`, `dots`, `ribbons`, `beams`). |
| `/?lab` | Shows a small switcher for trying the backgrounds live. |

Use the sun/moon button in the top bar to switch between light and dark mode. The site remembers
your choice. To reset it, clear the site's data in your browser.

### NewVis link when running locally

When previewed locally, the NewVis links point to `http://localhost:8000/`, so if you also run the
NewVis site locally the product link works end to end. On the live site they point to
`https://newvis.gensolve.in/`.

### Troubleshooting

| Problem | Fix |
| ------- | --- |
| `python` is not recognised | Reinstall Python with "Add to PATH" ticked, or use `py` (Windows) or `python3` (macOS/Linux). |
| `Address already in use` / `OSError: [Errno 98]` / `[WinError 10048]` | Port 8100 is taken. Use another port, e.g. `python -m http.server 8200`, and open `http://localhost:8200`. |
| `git clone` says *Repository not found* | You're not signed in, or don't have access yet. Ask a GenSolve org admin to add you. |
| You changed a file but the page looks the same | Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (macOS). |
| The background is plain or missing | WebGL is off. In Chrome, check `chrome://gpu`; turning on *Use graphics acceleration when available* in the browser settings usually fixes it. |
| The site doesn't animate at all | Your device has *Reduce motion* turned on. That's intended: the site respects it. |

## Files

| Path | What it is |
| ---- | ---------- |
| `index.html` | The whole site: markup, styles and script in one file. |
| `404.html` | Not-found page. |
| `static/favicon.svg` | The Gensolve network mark: three idea-nodes joined around a core (also used as the logo). |
| `static/apple-touch-icon.png` | iPhone home-screen icon. |
| `static/og-image.jpg` | Image shown when the link is shared (WhatsApp, LinkedIn, Slack, X). |
| `static/newvis-preview.jpg` | NewVis screenshot on the product card. |
| `robots.txt`, `sitemap.xml` | For search engines. |

## Editing

- **Text:** edit `index.html` directly. Sections are marked with comments (`HERO`, `THE NAME`,
  `WHAT WE BUILD`, `PRODUCTS`, `HOW WE WORK`, `CONTACT`).
- **Adding a product:** in the `PRODUCTS` section, replace one of the "Coming soon" cards with a
  card like the NewVis one.
- **Contact email:** the "Email us" button (`id="mailBtn"`) uses a `mailto:` link near the bottom of `index.html`.
- **Colours and fonts:** all design tokens are CSS variables at the top of the `<style>` block
  (`:root` for dark, `html[data-theme="light"]` for light). The brand gradient is `--grad`.

## Design and performance notes

- Light theme by default, dark on request (sun/moon button; the choice is remembered).
- Live WebGL background (`static/hero-bg.js`), one per theme: **dot-matrix** in light, **liquid** in dark.
  Other styles can be previewed with `?bg=aurora|contour|mesh|network|ribbons|beams` or `?lab`.
- Continuous motion only animates `transform` and `opacity`, so it stays smooth on phones. The
  only exceptions are short one-off effects: the logo drawing itself and the headline gradient
  sweep on load, and the circular theme switch. The hero orb and the scrolling strip pause when
  they're off screen or the tab is hidden, and all motion is off for visitors who turn on
  "reduce motion".
- Pointer effects (buttons that pull toward the cursor, the tilting NewVis card) only run on
  devices with a mouse.
- Fonts: Space Grotesk (headings) and Archivo (body), self-hosted in `static/fonts/` (both are
  open-source, SIL Open Font License) and preloaded so text appears fast.

## Before you ship a change

- Check widths 375, 768, 1024 and 1440px: nothing should scroll sideways.
- Check both themes.
- Keep claims honest: no client logos, numbers or testimonials we can't back up.
