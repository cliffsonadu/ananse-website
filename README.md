# Anansé Creative Haus — Website

Static site for a Warsaw-based production house. No build step, no dependencies:
plain HTML, one shared stylesheet, one shared script.

## Run locally

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Open with a server, not `file://` — the pages use relative paths and the
project galleries build their DOM from JS.

## Structure

```
index.html              Home
work.html               Filterable gallery grid
services.html
about.html
contact.html            mailto-based enquiry form
rehard-bags.html        ┐
vanity-of-the-soul.html ├ project pages (JS masonry + lightbox)
harry-j-makeup.html     ┘
css/style.css           Shared design system: tokens, nav, footer, buttons
js/main.js              Cursor, nav, scroll reveal, filters, contact form
images/                 WebP only, two widths per photo (-640, -1280)
```

Page-specific CSS lives in a `<style>` block in each page. Anything shared
belongs in `css/style.css`.

## Images

Photos are committed as WebP at two widths and referenced with `srcset`:

```html
<img src="…-640.webp"
     srcset="…-640.webp 640w, …-1280.webp 1280w"
     sizes="(max-width: 768px) 100vw, 33vw"
     width="1280" height="1920" loading="lazy" decoding="async">
```

Always ship both widths and always set `width`/`height` — they are the
intrinsic ratio the browser uses to reserve space, which is what keeps
cumulative layout shift at zero.

To add photos to a project gallery, drop the WebP pair into
`images/work/<project>/` and add an entry to that page's `photos` array:

```js
{ s: 'images/work/<project>/<name>', w: 1365, h: 2048 }
```

`s` is the path **without** the `-640.webp` suffix; `w`/`h` are the original
pixel dimensions (they drive both the masonry column balance and CLS).

## Conventions

- **Design tokens** live in `:root` in `css/style.css`. Use `var(--red)`,
  `var(--cream)` etc. rather than repeating literal values.
- **Text contrast** holds WCAG AA (4.5:1). On `#070707`, cream text needs
  alpha ≥ 0.50. Borders and decorative glyphs may go lower.
- **`.rv`** marks a scroll-reveal element. It is visible by default and only
  hidden once `html.js` confirms JS is running, so a script failure can never
  blank the page.
- **The custom cursor** is pointer-only. Touch and reduced-motion users get
  the native cursor back — do not add `cursor: none` inline.

## Contact address

`info@ananse.agency`, defined once as `CONTACT_EMAIL` in `js/main.js` and
mirrored in each page footer. Change both together.

## Deploy

Served as static files from the repository root. `sitemap.xml`, `robots.txt`
and the canonical/OG tags all reference `https://ananse.agency` — update them
together if the domain changes.
