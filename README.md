# Hoelscher Automation — Public Website

Source for [hoelscherautomation.com](https://hoelscherautomation.com).

Static site built with [Astro 5](https://astro.build) and
[Tailwind CSS](https://tailwindcss.com). Deployed to GitHub Pages via
GitHub Actions on every push to `main`.

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:4321`. Hot reload enabled.

## Production build

```bash
npm run build       # outputs to dist/
npm run preview     # serves dist/ for local verification
```

## Project structure

```
src/
├── components/   # Astro components (Nav, Footer, Hero, sections, primitives)
├── layouts/      # Base.astro — global <head>, fonts, Nav + Footer wrapper
├── lib/          # constants.ts — shared URLs and identifiers
├── pages/        # Routes (file-based routing)
│   ├── index.astro              # /
│   ├── terms.astro              # /terms
│   ├── privacy.astro            # /privacy
│   └── cortex/knowledge.astro   # /cortex/knowledge
└── styles/       # global.css — Tailwind directives + custom layer

public/           # static assets served as-is
├── CNAME                        # hoelscherautomation.com
├── og-image.png                 # 1200×630 social share
├── favicon.ico, favicon-32.png
├── robots.txt
└── assets/logo/                 # brand marks

scripts/
└── build-og-image.py            # Pillow script to regenerate OG image

docs/
└── superpowers/                 # design specs and implementation plans

.github/workflows/
└── deploy.yml                   # build + deploy to GitHub Pages
```

## Deployment

Pushes to `main` trigger the deploy workflow (build → upload artifact →
deploy to Pages). The repo's Pages settings must be configured as:

- **Source:** GitHub Actions
- **Custom domain:** `hoelscherautomation.com`
- **Enforce HTTPS:** enabled

If switching from the legacy "Deploy from branch" mode, change the Source
in repo Settings → Pages before merging the first build.

## Updating content

- **Copy edits:** edit the relevant `.astro` file under `src/components/`
  or `src/pages/`. Hot reload picks up changes immediately in `npm run dev`.
- **URLs, emails, company info:** edit `src/lib/constants.ts`. All
  references are centralized.
- **Brand colors / typography:** edit `tailwind.config.mjs`.
- **OG image:** edit the tagline in `scripts/build-og-image.py` and re-run
  `python3 scripts/build-og-image.py`; commit the regenerated PNG.

## Reference

- Design spec: `docs/superpowers/specs/2026-05-16-website-rework-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-16-website-rework.md`
