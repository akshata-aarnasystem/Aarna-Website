# Aarna Systems website

Plain HTML, CSS and JavaScript on top of Bootstrap 5. No build step is needed to run it.

## How to open it

Just double-click `index.html`. It works in any browser, no server needed.

The shared header and footer come from `components/`. When a page is opened by double-click, the browser blocks reading those files, so the site uses a bundled copy in `assets/js/components.js` instead. **After you edit anything in `components/`, run `node build.js`** to refresh that bundle. If you run the site through a web server (VS Code Live Server, `npx serve .`), it reads `components/` live and no rebuild is needed.

## Folder guide

| Path | What it is |
| --- | --- |
| `index.html` | Home page |
| `pages/` | about, contact, resources, services |
| `components/header.html`, `footer.html` | Shared navbar and footer, edit once for every page |
| `assets/css/style.css` | All styles. Bootstrap is imported at the top and these rules override it |
| `assets/js/config.js` | Site name, email, form endpoint (public values only) |
| `assets/js/include.js` | Loads the header and footer into every page |
| `assets/js/components.js` | Generated copy of `components/` (made by `build.js`) |
| `assets/js/main.js` | Menu, scroll effects, animations, contact form |
| `assets/images/` | Logo, favicon and WebP images |
| `seo/seo.json` | Title and description for every page |
| `build.js` | Refreshes `components.js`, writes SEO tags into each page, builds `sitemap.xml` |
| `.env` | Secrets and per-environment values. Not committed |
| `.env.example` | Empty copy of `.env` |

## Everyday edits

- **Change the menu or footer links:** edit `components/header.html` or `components/footer.html`, then run `node build.js`.
- **Change email, site name or footer callout:** edit `assets/js/config.js`.
- **Change colours:** edit the `:root` variables at the top of `assets/css/style.css` (`--lime`, `--ink`, `--violet`).
- **Replace the logo:** overwrite `assets/images/logo.png` and `logo.webp` (keep the same names).
- **Contact form:** by default it opens the visitor's email app. To post to a service such as Formspree, put its URL in `formEndpoint` in `config.js`.

## Add a new page

1. Copy `pages/about.html` to `pages/your-page.html` and change the content. Keep `<body data-root="../">`.
2. Add an entry for it in `seo/seo.json`.
3. Add a link in `components/header.html` if it should be in the menu.
4. Run `node build.js`.

## Before you publish

1. Put your real domain in `.env` (`SITE_URL=https://yourdomain.com`) and in `assets/js/config.js`.
2. Run `node build.js`. It updates the SEO tags, `sitemap.xml` and the Sitemap line in `robots.txt`.
3. Upload the folder to any static host. `.env`, `README.md` and `build.js` do not need to be uploaded.

The page copy, client names and numbers are placeholders. Replace them with your own before launch.


## Running locally (including animations)

- Extract the ZIP and open `index.html` in a modern browser. The shared header/footer use the bundled `assets/js/components.js` fallback for `file://` preview.
- For the most reliable preview, run a local static server from this folder: `python3 -m http.server 8000`, then visit `http://localhost:8000`.
- Scroll reveal, hero intro, progress indicator and canvas motion are vanilla JavaScript/CSS; no animation library is required.
- If your operating system/browser has **Reduce motion** enabled, motion effects are intentionally minimized for accessibility. Turn that setting off to see the full animation.
