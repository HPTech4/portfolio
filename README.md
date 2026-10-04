# Alimi Azeez Opeyemi — Portfolio

A static portfolio for software developer roles. Two pages, no framework, no
build step, no backend.

Live at **https://hptech.netlify.app**

---

## Stack

Plain HTML, CSS, and JavaScript. Nothing is compiled, bundled, or transpiled —
what's in the repo is what ships.

| Concern | Choice |
|---|---|
| Markup | Hand-written HTML, one file per page |
| Styling | One stylesheet, CSS custom properties for the scales |
| Behaviour | One script, plus optional GSAP + ScrollTrigger from a CDN |
| Icons | Inline SVG — no icon font |
| Type | Google Fonts: Fraunces (display), Inter (everything else) |
| Theming | `data-theme` attribute on `<html>`, two hand-built palettes |
| Forms | Formspree |
| Offline | Service worker, shell caching |

There is deliberately no `package.json`. Nothing needs installing.

---

## Files

The site lives entirely in `frontend/`, which is the deploy root. Everything
the browser requests is referenced with an absolute path (`/style.css`,
`/Assets/…`), so those paths resolve against `frontend/` and nothing else needs
to move with them.

```
/
├── README.md
└── frontend/               ← publish directory
    ├── index.html          Home — hero, projects, skills, experience, about, contact
    ├── projects.html       All projects — six case studies, filterable
    ├── offline.html        Shown by the service worker when a page isn't cached
    ├── style.css           Shared stylesheet for all three pages
    ├── script.js           Shared behaviour for both main pages
    ├── sw.js               Service worker
    ├── manifest.json       PWA manifest
    ├── robots.txt
    ├── sitemap.xml
    └── Assets/
        ├── Alimi Azeez.pdf   Resume, linked from the hero and contact section
        ├── icon-*.png        PWA and favicon icons
        ├── cbt-center.svg    CBT Center illustration — not a screenshot
        ├── cropCare.PNG      Crop Care screenshot
        ├── ctransit.PNG      CTransit screenshot
        ├── dayve.PNG         Dayve Autos screenshot
        ├── devping.PNG       DevPing screenshot
        ├── trustlayer.PNG    TrustLayer screenshot
        └── My Pic.png        Hero portrait — needs re-exporting, see "Images"
```

`README.md` deliberately stays outside `frontend/` — it documents the repo, and
publishing it would serve it at `/README.md`.

`/projects` is served from `projects.html` by Netlify's pretty-URL handling.
It will not resolve from the local filesystem — open `frontend/projects.html`
directly when working offline.

---

## Theming

Two themes, switched by a `data-theme` attribute on `<html>`. Both palettes are
written out in full in `style.css` and are **not** inversions of one another —
the dark palette was designed and contrast-checked against its own dark
background.

An inline script in the `<head>` of both pages sets the attribute **before
first paint**, so the correct theme is applied before anything is drawn and
there is no flash of the wrong theme:

```js
var saved = localStorage.getItem("theme");
theme = saved === "light" || saved === "dark"
  ? saved
  : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
document.documentElement.setAttribute("data-theme", theme);
```

It must stay inline and above the stylesheet. Moving it into `script.js` — which
loads at the end of `<body>` — reintroduces the flash.

| Situation | Result |
|---|---|
| First visit, OS light | Light |
| First visit, OS dark | Dark |
| Returning visit, choice saved | Saved choice, OS ignored |
| Toggle clicked | Theme switches, choice written to `localStorage` |
| JavaScript disabled | No attribute set; `prefers-color-scheme` decides |
| `localStorage` unavailable | Falls back to light, toggle still works for the session |

The toggle is hidden until `.js-enabled` is present. Without scripting it would
be a dead button, and the OS preference already handles the theme.

`script.js` keeps the toggle's `aria-label` ("Switch to dark theme") and
`aria-pressed` in sync, and updates `<meta name="theme-color">` so the browser
chrome matches the active theme.

### The two variable blocks

Light is the default and lives on `:root`. Dark is declared twice — once for the
explicit attribute and once inside `@media (prefers-color-scheme: dark)` — because
CSS cannot share a declaration block between a selector and a media query. **If
you change one, change both.**

```css
:root,
:root[data-theme="light"] {
  color-scheme: light;
  --bg: #faf8f4;          --bg-alt: #f5f2eb;
  --surface: #ffffff;     --tint: #f2efe8;
  --line: #e5e1d8;        --line-strong: #908b80;
  --text: #1c1a17;        --text-muted: #6b6862;
  --accent: #1f4d3a;      --accent-hover: #163829;
  --on-accent: #ffffff;
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #14130f;          --bg-alt: #191713;
  --surface: #1e1c18;     --tint: #221f1b;
  --line: #2e2b26;        --line-strong: #6e6a62;
  --text: #f2efe8;        --text-muted: #a8a49b;
  --accent: #4a9e7a;      --accent-hover: #5fb18c;
  --on-accent: #14130f;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* identical to the [data-theme="dark"] block above */
  }
}
```

Note `--on-accent`. In light mode the accent is dark, so button text on it is
white. In dark mode the accent is light, so button text on it is near-black —
white would only reach **2.83:1** there. One token, two different values, and
the button markup never changes.

`--line` is a decorative hairline and is not contrast-checked. `--line-strong`
draws boundaries that identify a control (form inputs, the toggle, ghost
buttons) and clears **3:1** against both surfaces it sits on, per WCAG 1.4.11.

---

## Design system

All values live in the token blocks in `style.css`. There are no one-off sizes
or colours anywhere else in the file.

### Type

Fraunces for display, Inter for everything else. No third family, no monospace.

| Token | Value | Used for |
|---|---|---|
| `--fs-xs` | 0.8125rem (13px) | Meta labels, timeline dates |
| `--fs-sm` | 0.9375rem (15px) | Secondary copy, nav, buttons |
| `--fs-base` | 1.0625rem (17px) | Body copy |
| `--fs-md` | 1.25rem (20px) | Ledes, project taglines |
| `--fs-lg` | 1.625rem (26px) | Case study titles |
| `--fs-xl` | `clamp(2rem, 1.4rem + 2.2vw, 2.75rem)` | Section titles |
| `--fs-2xl` | `clamp(2.75rem, 1.8rem + 5vw, 4.5rem)` | Hero name |

Seven sizes, no more. Form inputs are pinned at `1rem` (16px) regardless of
`--fs-base`, because anything smaller makes iOS Safari zoom the viewport on
focus.

### Spacing

`--sp-1` (4px) through `--sp-9` (128px). Section padding is fluid:
`clamp(4.5rem, 11vw, 8.5rem)`.

### Colour and contrast

Every pair below was computed against WCAG 2.1 relative luminance. The two
palettes were checked **separately, each against its own backgrounds**. All
clear AA — 4.5:1 for body text, 3:1 for large text and UI.

**Light**

| Foreground | Background | Ratio |
|---|---|---|
| `--text` #1C1A17 | `--bg` #FAF8F4 | 16.37 |
| `--text` #1C1A17 | `--bg-alt` #F5F2EB | 15.53 |
| `--text` #1C1A17 | `--surface` #FFFFFF | 17.36 |
| `--text` #1C1A17 | `--tint` #F2EFE8 | 15.12 |
| `--text-muted` #6B6862 | `--bg` #FAF8F4 | 5.23 |
| `--text-muted` #6B6862 | `--bg-alt` #F5F2EB | 4.97 |
| `--text-muted` #6B6862 | `--surface` #FFFFFF | 5.55 |
| `--text-muted` #6B6862 | `--tint` #F2EFE8 | 4.83 |
| `--accent` #1F4D3A | `--bg` #FAF8F4 | 9.08 |
| `--accent` #1F4D3A | `--bg-alt` #F5F2EB | 8.61 |
| `--accent` #1F4D3A | `--surface` #FFFFFF | 9.63 |
| `--accent` #1F4D3A | `--tint` #F2EFE8 | 8.38 |
| `--accent-hover` #163829 | `--bg` #FAF8F4 | 12.13 |
| `--on-accent` #FFFFFF | `--accent` #1F4D3A | 9.63 |
| `--on-accent` #FFFFFF | `--accent-hover` #163829 | 12.87 |
| `--line-strong` #908B80 | `--bg` #FAF8F4 *(UI, 3:1)* | 3.20 |
| `--line-strong` #908B80 | `--surface` #FFFFFF *(UI, 3:1)* | 3.39 |

**Dark**

| Foreground | Background | Ratio |
|---|---|---|
| `--text` #F2EFE8 | `--bg` #14130F | 16.19 |
| `--text` #F2EFE8 | `--bg-alt` #191713 | 15.58 |
| `--text` #F2EFE8 | `--surface` #1E1C18 | 14.81 |
| `--text` #F2EFE8 | `--tint` #221F1B | 14.29 |
| `--text-muted` #A8A49B | `--bg` #14130F | 7.48 |
| `--text-muted` #A8A49B | `--bg-alt` #191713 | 7.20 |
| `--text-muted` #A8A49B | `--surface` #1E1C18 | 6.84 |
| `--text-muted` #A8A49B | `--tint` #221F1B | 6.60 |
| `--accent` #4A9E7A | `--bg` #14130F | 5.72 |
| `--accent` #4A9E7A | `--bg-alt` #191713 | 5.51 |
| `--accent` #4A9E7A | `--surface` #1E1C18 | 5.24 |
| `--accent` #4A9E7A | `--tint` #221F1B | 5.05 |
| `--accent-hover` #5FB18C | `--bg` #14130F | 7.22 |
| `--on-accent` #14130F | `--accent` #4A9E7A | 5.72 |
| `--on-accent` #14130F | `--accent-hover` #5FB18C | 7.22 |
| `--line-strong` #6E6A62 | `--bg` #14130F *(UI, 3:1)* | 3.45 |
| `--line-strong` #6E6A62 | `--surface` #1E1C18 *(UI, 3:1)* | 3.16 |

The tightest pair in either theme is `--text-muted` on `--tint` in light mode at
**4.83:1**. There is very little headroom there — if you lighten `--text-muted`
or darken `--tint`, re-check it.

Neither background is pure black or pure white. Both are warm (#FAF8F4 and
#14130F), so the two themes read as the same design rather than as a design and
its negative.

---

## Motion

Reveals are driven by GSAP 3.12.5 and ScrollTrigger, loaded deferred from
cdnjs on both pages. They are a progressive enhancement rather than a
dependency: `script.js` picks one of three paths on its first lines and writes
it to `<html>` as a class, before anything below that point can throw.

| Class | When | What drives the reveal |
|---|---|---|
| `reveal-gsap` | GSAP and ScrollTrigger both loaded | Inline styles set by ScrollTrigger |
| `reveal-css` | GSAP missing — offline, blocked, CDN down | IntersectionObserver plus a CSS transition |
| `reveal-off` | `prefers-reduced-motion: reduce` | Nothing is ever hidden |

The hidden state is scoped to `.js-enabled .reveal`, and `.js-enabled` is added
by the inline script in `<head>`. With scripting off it is never added, so the
page renders fully visible rather than blank.

Two safety nets live in `script.js`. If `initMotion()` throws, the page swaps
itself to `reveal-css` instead of staying blank. Separately, a timeout three
seconds after load shows anything still transparent that is already inside the
viewport.

The hero plays on load — including the two stat figures, which count up to the
number the markup already contains. The target and the suffix are read from the
DOM rather than hard-coded, so the animation cannot drift from the text. Every
other element animates once, on a scroll trigger. Nothing loops.

The hero's start state is scoped to `.hero-copy > *` plus `.hero-portrait`,
not to every child of the hero wrapper. The copy is wrapped in `.hero-copy` so
the portrait can be a grid column without silently joining or leaving the
text's stagger — the list of what animates is explicit in both `style.css` and
`script.js`, and those two lists have to be changed together.

---

## Projects page

`projects.html` holds all six case studies and filters them client-side. Each
`<article class="project">` carries a `data-category` of `products`, `ai`, or
`client`; the buttons in `.project-filters` set `aria-pressed` and toggle the
`hidden` attribute to match.

Two things there are load-bearing:

- **`.project[hidden] { display: none }`.** `.project` sets `display: block`,
  which outranks the user-agent rule for `[hidden]`. Without the explicit
  override the attribute would be set and do nothing.
- **The filter re-settles what it reveals.** Articles are measured by
  ScrollTrigger while hidden, and a hidden article measures as zero height —
  its reveal either fires against a collapsed box or never fires at all,
  leaving the contents at opacity 0. `applyFilter()` clears the inline styles
  GSAP left on any article it shows and marks it visible, then refreshes
  ScrollTrigger.

The filter bar is hidden until `.js-enabled` is present, because without
scripting the buttons would be dead controls. With scripting off all six
projects render, unfiltered, which is the correct fallback.

Skills on the home page link into individual projects by anchor
(`/projects.html#ctransit` and so on). The global `:target { scroll-margin-top:
6rem }` keeps the sticky header from covering whichever project is jumped to.

---

## Contact form

The form posts to Formspree. The endpoint is defined in one place: the `action`
attribute on `#contact-form` in `index.html`.

```html
<form action="https://formspree.io/f/xdkznpyz" method="POST" novalidate>
```

To point it at a different form, edit that attribute.

The `action` and `method` are real, not decorative — with JavaScript disabled
the browser posts the form to Formspree natively and the visitor still gets a
working contact form. When JavaScript is available, `script.js` intercepts the
submit, validates the fields, and posts via `fetch` so the visitor stays on the
page.

Spam filtering is Formspree's job. There is no honeypot.

Submissions are never queued. If a visitor is offline the send fails and
they're told so, with the email address as a fallback. The only thing written to
`localStorage` is the theme.

---

## Accessibility notes

Things that are load-bearing and shouldn't be "cleaned up":

- **`.js-enabled` on `<html>`** is added by the inline script in `<head>`. Two
  things depend on it: the `.reveal` hidden state is scoped to
  `.js-enabled .reveal`, and the theme toggle is `display: none` until
  `.js-enabled` is present. Remove that scoping and every section becomes
  permanently invisible without JavaScript, and the toggle becomes a dead
  button.
- **The theme inline script must run before the stylesheet.** It's the only
  thing standing between the visitor and a flash of the wrong theme.
- **Both palettes are checked independently.** Dark mode is not an inversion of
  light mode; verifying one tells you nothing about the other. Re-check both
  after any palette change.
- **`prefers-reduced-motion`** is handled twice — once in CSS for transitions
  (which covers the theme toggle), and once in `script.js`, which skips
  observing reveals entirely and reveals everything immediately. CSS alone
  cannot stop JS-driven motion.
- **`aria-invalid` and `aria-describedby`** wire each form field to its own
  error message, so a screen reader hears which field failed rather than one
  generic error.
- **The nav is a plain `<nav><ul><li><a>`.** No ARIA menu roles — a `menubar`
  promises arrow-key navigation that isn't implemented.
- **The theme toggle is a plain `<button>` with `aria-pressed` and no ARIA
  role.** `aria-label` says what pressing it will do; `aria-pressed` says
  whether dark is currently on.
- **Focus rings are never suppressed.** `:focus-visible` is styled globally and
  uses `--accent`, which clears 3:1 against both backgrounds in both themes.
- **Touch targets are at least 44×44px** — nav links, buttons, the toggle, the
  footer links, and the inline "Live site" links all carry an explicit
  `min-height`.

---

## Deploying

Netlify, with the **publish directory set to `frontend`**. That is already the
setting this repo has been deploying with, so moving the site into `frontend/`
needs no Netlify change.

No build command. Nothing to install.

`style.css` and `script.js` are pre-cached by the service worker, so
**bump `CACHE_VERSION` in `frontend/sw.js` whenever you change either of them.**
Without a bump, returning visitors keep the old copies until the cache is
invalidated.

## Images

Five of the six case studies show a real screenshot. **CBT Center** shows
`Assets/cbt-center.svg` — an illustration authored in the site's own palette
rather than a capture of the product, and its `alt` text says so. Replace it
with a real screenshot when one exists, and update the `alt` text at the same
time: a drawing presented as a screenshot misrepresents the work, which is a
bad trade on a page whose whole job is to be believed.

All five screenshots are full-size PNGs at whatever resolution the source
produced — roughly 1350×650, which is about 2:1. `.project-media` gives each one
a fixed `2 / 1` frame and covers it from the top, so near-2:1 sources lose almost
nothing. **A source much taller or wider than 2:1 will be cropped hard** — check
before adding one, and adjust `object-position` or the frame if it cuts badly.
Give each `<img>` `width` and `height` attributes matching the real file, so the
browser can reserve the right space before the stylesheet lands.

Three of the captures — `ctransit.PNG`, `trustlayer.PNG`, and `dayve.PNG` — come
from dark-themed products. In dark mode `.project-media img` is dimmed slightly,
because a light capture glares off a near-black page. Those three carry
`.project-media--dark`, which opts them out: dimming an already-dark capture
only muddies it. Mark a new dark capture the same way.

Nothing is optimised. Converting to WebP at ~800px wide would cut page weight
substantially — `dayve.PNG` alone is 773 KB. If you do, update the `src`
attributes in both HTML files to match:

```sh
# ImageMagick
magick dayve.PNG -resize 800x -quality 80 dayve.webp
magick trustlayer.PNG -resize 800x -quality 80 trustlayer.webp
```

Two optional assets, neither of them present yet:

- **`Assets/og-image.png`** — 1200×630, for link previews. The `og:image` and
  `twitter:image` tags are deliberately omitted, because a tag pointing at a
  file that does not exist produces a broken preview card. Add the file and the
  tags together: `og:image`, `og:image:width`, `og:image:height`,
  `og:image:alt`, `twitter:image`, and switch `twitter:card` back to
  `summary_large_image`. Both HTML files carry a comment marking the spot.
- **`Assets/icon-maskable-512x512.png`** — a full-bleed 512×512 icon with the
  wordmark inside the central 80% safe zone, for Android's adaptive icon.
  `icon-512x512.png` is a rounded square with transparent corners, so masking
  it would clip the corners and expose the transparency behind them. Declare
  it in `manifest.json` with `"purpose": "maskable"` once it exists.

### The hero portrait

`Assets/My Pic.png` is the headshot in the hero. **It is around 2 MB and has
not been optimised** — that is the single heaviest thing the site downloads,
and it is above the fold, so it cannot be lazy-loaded away. Re-export it in
place at roughly 800px wide before this goes in front of anyone:

```sh
magick "My Pic.png" -resize 800x -quality 80 "My Pic.png"
```

The markup needs no change when you do: `.hero-portrait img` sets
`aspect-ratio: 2 / 3` and `object-fit: cover`, so the frame is the same size
before and after the file loads regardless of the file's real dimensions. That
is also why the `<img>` carries no `width`/`height` — writing dimensions here
would be guessing, and re-exporting would invalidate them.

The `alt` is empty on purpose. The `h1` immediately before it already announces
the name, and alt text that restates adjacent text is noise for a screen reader.

Below 64rem the portrait follows the copy at a capped width rather than sitting
beside it; above 64rem it becomes the hero's second column. It is hidden in
print.

## Deliberately absent

Documented so nobody re-adds them by accident:

- No custom cursor, typewriter, or cursor trail.
- No infinite or looping animation of any kind. Every animation plays once —
  the hero on load, everything else on a single scroll trigger — and then
  gets out of the way.
- No monospace font. Meta labels are Inter; display is Fraunces.
- No analytics — there is no GA tag, so there are no `gtag` calls.
- No offline form queue.
- No backend. There was one; it was removed along with the API key it held.
- No Tailwind, no build step, no bundler. GSAP is the only third-party script,
  and it is optional — see "Motion".
