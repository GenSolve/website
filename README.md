# Gensolve — company website

**Generational problems. Generative ideas.**

The website for Gensolve, a technology company building AI-first products and software across
AI, web development, software engineering and app development. Our first product is
[NewVis AI](https://newvis.gensolve.in/).

It is a static site: plain HTML, CSS and a little JavaScript, with no build step and no dependencies.

## Run it locally

You only need Python (3.8+), which most machines already have.

```bash
git clone https://github.com/GenSolve/website.git
cd website
python -m http.server 8100
```

Open <http://localhost:8100>. Stop the server with `Ctrl + C`.

When previewed locally, the NewVis links point to `http://localhost:8000/`, so if you also run the
NewVis site locally the product link works end to end. On the live site they point to
`https://newvis.gensolve.in/`.

## Files

| Path | What it is |
| ---- | ---------- |
| `index.html` | The whole site: markup, styles and script in one file. |
| `404.html` | Not-found page. |
| `static/favicon.svg` | The Gensolve "G" mark (also used as the logo). |
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

- Dark and light themes, switched with the sun/moon button; the choice is remembered.
- Only `transform` and `opacity` are animated, so motion stays smooth on phones. The hero orb
  pauses when it's off screen or the tab is hidden, and all motion is off for visitors who turn on
  "reduce motion".
- Fonts: Space Grotesk (headings) and Archivo (body), self-hosted in `static/fonts/` (both are
  open-source, SIL Open Font License) and preloaded so text appears fast.

## Before you ship a change

- Check widths 375, 768, 1024 and 1440px: nothing should scroll sideways.
- Check both themes.
- Keep claims honest: no client logos, numbers or testimonials we can't back up.
