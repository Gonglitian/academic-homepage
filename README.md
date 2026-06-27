# Academic Homepage

Personal academic homepage of **Litian Gong (龚利天)** — minimalist researcher homepage + a
Tufte-style blog (et-book typography, left-fixed TOC, right-margin sidenotes, KaTeX math with
numbered equations, numbered `[1]` citations + bibliography). Built with [Astro](https://astro.build).

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output → dist/
npm run check    # astro type-check (optional; not required for deploy)
```

## Deploy

Fully static site hosted on **Cloudflare Pages**:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22` (pinned via `.nvmrc`)

Pushes to `main` auto-deploy.
