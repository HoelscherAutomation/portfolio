# Website Rework — Design Spec

**Date:** 2026-05-16
**Owner:** Jordan Hoelscher (Hoelscher Automation LLC)
**Status:** Approved for implementation
**Repo:** `HoelscherAutomation/portfolio` (deployed at `hoelscherautomation.com`)
**Implementation branch:** `rebuild-astro`

---

## 1. Context

### Current state

The site at `hoelscherautomation.com` is a single-page vanilla HTML + CSS portfolio
(`portfolio/index.html`, ~462 lines; `portfolio/style.css`, ~1052 lines) deployed
via GitHub Pages from `main` branch root. Last meaningful commit was April 2026.

It's framed as a personal portfolio: *"Jordan Hoelscher | AI Automation Architect."*
Cortex appears on the site as an internal infrastructure-automation case study
(incident response, self-healing). The visual palette is dark-on-emerald-green
(`#10b981`), unrelated to the Hoelscher Automation brand assets (navy + orange).

### Why a rebuild

Since the current site was built, the business has changed materially:

1. **Hoelscher Automation LLC** formed (Ohio). Brand assets, contracts,
   business cards, and brochures all use the LLC framing.
2. **Cortex pivoted** from an internal infrastructure tool to a productized
   self-hosted RAG offering — **Cortex Knowledge** — targeting small (5–30 person)
   law/accounting/consulting firms. See product PRD at
   `business-ops/docs/products/cortex-knowledge-v1-prd.md`.
3. **Brand identity** crystallized around the navy + orange logo palette.
   Current site colors don't reflect this.
4. **Discovery workflow** has matured: intake form spec + booking link via
   Google Appointment Schedules. The site needs to integrate the booking link
   and drop the existing 5-field contact form in favor of a leaner flow.
5. **Legal pages missing.** No terms of use, no privacy policy. Required before
   the site can collect form submissions in good faith.

### Scope of this rework

Full rebuild on a new tech stack. Vanilla HTML/CSS retired. New site has
4 routes (home + 1 product page + 2 legal pages), built with Astro + Tailwind,
deployed to GitHub Pages via Actions. Lean v1 — about/consulting/cortex-overview
all live as sections on the home page rather than dedicated routes.

---

## 2. Core decisions (already made)

| # | Decision | Rationale |
|---|---|---|
| 1 | **Dual offering with Cortex as platform brand** | Cortex is a growing library of self-hosted tools (RAG first); consulting is always-on. Site supports both audiences without choosing one. |
| 2 | **Company-first hero (Hoelscher Automation, not Jordan)** | Aligns with brand assets (logo, brochures, business cards, contracts all LLC-signed). Required for Cortex to feel like a real product company to managing-partner buyers. |
| 3 | **Hybrid architecture** | Single-page home (with Cortex overview, Consulting, About, Contact as in-page sections) + dedicated Cortex tool pages under `/cortex/[tool]`. Future Cortex tools each get their own page. |
| 4 | **Dark navy + orange palette** | Pulls directly from the existing logo (navy `#1B2A4A` background, orange `#E58E26` arrow). Premium tech feel signals "real product company"; brand recognition immediate for anyone with the business card. |
| 5 | **Astro + Tailwind** | Component-based (no duplicated nav/footer markup), zero JS shipped by default, static output deploys identically to GH Pages. Tailwind makes the brand palette declarative. |
| 6 | **Lean v1 scope** | 4 routes total. Defends against the stall-at-90%-complete failure mode where remaining 10% needs content the founder hasn't written. |

### Resolved gaps

| Gap | Resolution |
|---|---|
| GitHub link in footer | `github.com/HoelscherAutomation` (org, not personal) |
| About-section visual | Use `logo-square-navy.png` (no headshot for now) |
| Cortex Knowledge pricing | "Contact for a quote during demo" — no public number in v1 |
| Cortex Knowledge docs URL | Omitted from hero until docs exist; single CTA in hero ("Book a Cortex demo") |
| Analytics | Cloudflare Web Analytics (cookieless, no PII, no banner needed) |

---

## 3. Sitemap & Page Inventory

### Routes

```
/                       Home — single scrolling page, all primary content
/cortex/knowledge       Cortex Knowledge product detail
/terms                  Terms of Use
/privacy                Privacy Policy
```

### Global navigation (every page)

**Header (sticky):**
- Left: Hoelscher Automation logotype + small logo mark, linked to `/`
- Center-right links: **Cortex** (→ `/cortex/knowledge`), **Consulting**
  (→ `/#consulting`), **About** (→ `/#about`)
- Right: **Book a call** button (primary orange) — opens
  `https://calendar.app.google/vBKoPc1KpCooomgc6` in new tab
- Mobile: hamburger toggle, links stack vertically

**Footer (four columns desktop, stacked mobile):**
- **Brand column:** logo mark + 1-sentence company description + "Ohio, USA"
- **Platform column:** Cortex Knowledge (`/cortex/knowledge`)
- **Company column:** About (`/#about`), Contact (`/#contact`)
- **Legal column:** Terms (`/terms`), Privacy (`/privacy`)
- Bottom row: `© 2026 Hoelscher Automation LLC` left;
  LinkedIn + GitHub icon links right
  - LinkedIn: `https://www.linkedin.com/in/jordanhoelscher/`
  - GitHub: `https://github.com/HoelscherAutomation`

### Per-page summary

| Route | Primary purpose | Primary CTA |
|---|---|---|
| `/` | Frame the company; funnel to discovery call | **Book a discovery call** |
| `/cortex/knowledge` | Sell Cortex Knowledge to managing partners | **Book a Cortex demo** |
| `/terms` | Site terms of use | None |
| `/privacy` | Privacy policy | None |

### Explicitly out of scope for v1

- `/about` standalone page (lives as section on `/`)
- `/consulting` standalone page (lives as section on `/`)
- `/cortex` platform-overview page (premature with one product)
- Case studies, blog
- Multi-language, newsletter signup, live chat

---

## 4. Visual System

### Color tokens

| Token | Hex | Use |
|---|---|---|
| `bg-deep` | `#0A0E1A` | Page body, lowest layer |
| `bg` | `#0E1729` | Hero, section backgrounds |
| `bg-elevated` | `#18243D` | Cards, surfaces |
| `bg-elevated-hi` | `#1F2D4A` | Hover/active states |
| `border-subtle` | `rgba(255,255,255,0.06)` | Subtle dividers |
| `border` | `rgba(255,255,255,0.10)` | Card borders |
| `border-hover` | `rgba(255,255,255,0.18)` | Card hover borders |
| `text-primary` | `#E8EBF2` | Headings, body |
| `text-secondary` | `#A0AABB` | Body secondary |
| `text-muted` | `#6B7587` | Captions, timestamps |
| `brand-orange` | `#E58E26` | Primary CTAs (logo arrow color) |
| `brand-orange-bright` | `#F0A653` | Hover, accent italics |
| `brand-blue` | `#4D8DF5` | Secondary accent |
| `navy-deep` | `#1B2A4A` | Text on orange buttons; matches logo bg |
| `ok` | `#34D399` | Success states |
| `warn` | `#F59E0B` | Warning states |
| `err` | `#EF4444` | Error states |

### Typography

Carried over from current site (works well, no need to change):

- **Display:** Newsreader (serif, italic for emphasis) — sophisticated, editorial
- **Body:** Manrope (sans-serif) — clean, neutral, reads well at 16px
- **Mono:** Space Grotesk (fixed-width) — code, technical data

Loaded from Google Fonts with `display=swap` preconnect.

### Component primitives

- **Buttons:**
  - Primary: orange bg, navy-deep text
  - Outline: transparent bg, hover-border text
  - Ghost: text-only, hover-lightens bg
  - Sizes: default + sm
- **Cards:** `bg-elevated` background, `border-subtle`, 8px radius;
  hover lifts to `bg-elevated-hi` with `border-hover`
- **Badges:** pill-shape (999px radius), three variants: brand / blue / muted
- **Form inputs:** `bg-elevated` background, `border` border, 6px radius;
  focus ring uses `brand-orange`

### Geometry

- Radius scale: 4px (sm) · 6px (md) · 8px (lg) · 999px (pill)
- Container max-width: 1120px
- Section padding: 6rem desktop, 3rem mobile
- Base spacing: Tailwind defaults (4px unit)

### Motion

- Hover transitions: 150ms ease
- Scroll reveal: 700ms ease (IntersectionObserver-triggered)
- Terminal animation: ~3s on enter (intersection-triggered)

---

## 5. Project Structure

### Repo and branch

- **Repo:** `HoelscherAutomation/portfolio` (existing)
- **Branch:** `rebuild-astro` (new) → PR to `main`
- Existing vanilla files (`index.html`, `style.css`) deleted in rebuild;
  git history retains them

### File layout

```
portfolio/
├── astro.config.mjs             # site URL, integrations
├── tailwind.config.mjs          # extends theme with brand tokens
├── tsconfig.json                # strict TS for type-safe component props
├── package.json
├── public/                      # static, served as-is
│   ├── CNAME                    # hoelscherautomation.com
│   ├── favicon.ico
│   ├── favicon-32.png
│   ├── og-image.png             # 1200×630, generated from logo + tagline
│   ├── robots.txt
│   └── assets/
│       └── logo/                # copied from business-ops/assets/logo/
│           ├── logo-square-navy.png
│           ├── logo-transparent.png
│           └── logo-circle-safe-navy.png
├── src/
│   ├── styles/
│   │   └── global.css           # @tailwind directives + custom properties
│   ├── layouts/
│   │   └── Base.astro           # <html>, <head>, fonts, Nav + Footer wrapper
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── Button.astro                  # variant: primary | outline | ghost
│   │   ├── Card.astro                    # product/service card
│   │   ├── Badge.astro                   # variant: brand | blue | muted
│   │   ├── SectionLabel.astro            # uppercase mono label
│   │   ├── Hero.astro                    # home hero
│   │   ├── ConsultingSection.astro
│   │   ├── AboutSection.astro
│   │   ├── ContactSection.astro
│   │   ├── CortexOverviewSection.astro
│   │   ├── BookCallButton.astro          # baked-in URL, target=_blank
│   │   └── Terminal.astro                # repurposed terminal animation
│   └── pages/
│       ├── index.astro          # /
│       ├── terms.astro          # /terms
│       ├── privacy.astro        # /privacy
│       └── cortex/
│           └── knowledge.astro  # /cortex/knowledge
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-05-16-website-rework-design.md   # this file
├── .github/
│   └── workflows/
│       └── deploy.yml           # build + deploy to GH Pages
├── .gitignore                   # node_modules/, dist/, .astro/
└── README.md                    # rewritten: build/dev instructions
```

### Component design notes

- **`Base.astro`** is the only layout. Props: `title`, `description`, `ogImage`,
  `path`. Wraps everything in `Nav` + slot + `Footer`. Sets `<title>`, meta tags,
  Open Graph, canonical URL.
- **Stateless and prop-driven** — Astro components compile to HTML at build.
- **Two pieces of client-side JS** carry over from current site:
  scroll-reveal IntersectionObserver and the terminal animation. Live in
  scoped `<script>` blocks within their components.
- **Iconography:** inline SVGs. Reused icons get their own `.astro` component;
  one-offs stay inline. No `astro-icon` dependency.
- **Forms:** contact form is HTML with `action=` to Formspree. AJAX submit JS
  extracted into a small `<script>` in `ContactSection.astro`.

### Tailwind config (excerpt)

```js
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#0A0E1A',
        'bg': '#0E1729',
        'bg-elevated': '#18243D',
        'bg-elevated-hi': '#1F2D4A',
        'text-primary': '#E8EBF2',
        'text-secondary': '#A0AABB',
        'text-muted': '#6B7587',
        'brand-orange': '#E58E26',
        'brand-orange-bright': '#F0A653',
        'brand-blue': '#4D8DF5',
        'navy-deep': '#1B2A4A',
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      maxWidth: { container: '1120px' },
    },
  },
}
```

### Explicitly not included

- Content collections (no blog/case studies in v1)
- MDX (plain `.astro` files are simpler)
- Svelte/React islands (no interactive widgets that need it)
- `astro-icon`, `astro-seo` (built-in Astro features cover with less indirection)
- i18n, CMS, server-side anything

---

## 6. Page-by-page Content Plan

### Page 1 — `/` (Home)

Single scrolling page. Hero above the fold; sections separated by `bg-deep`/`bg`
alternation; each section uses container max-width 1120px.

#### Section order and content

1. **Sticky Nav** — see Section 3 global navigation.

2. **Hero** (`<Hero>`)
   - Badge: `AI for professional services teams`
   - Headline (display, with italic emphasis):
     **"Build the AI tools your firm *already needs*."**
   - Sub-headline (~2 sentences):
     *"We build self-hosted products and custom automation for small
     professional services firms. Your data stays with you. We don't disappear
     after delivery."*
   - Primary CTA: **Book a discovery call** (scheduling link, new tab)
   - Secondary CTA: **Explore Cortex** (anchor to `#cortex`)
   - No stats — current site's operator-portfolio numbers don't translate

3. **Cortex Platform section** (id=`cortex`, `<CortexOverviewSection>`)
   - Section label: `PLATFORM`
   - Section title: *"Cortex — tools that run on your infrastructure."*
   - Intro (~2 sentences): what Cortex IS as a platform — growing library of
     self-hosted AI tools for small professional services firms.
   - One product card:
     **Cortex Knowledge** — *"Self-hosted document Q&A with mandatory
     citations. Your data never leaves your firm."* Card links to
     `/cortex/knowledge`.
   - Small line below: *"More tools coming."*

4. **Consulting section** (id=`consulting`, `<ConsultingSection>`)
   - Section label: `SERVICES`
   - Section title: *"Custom automation, built by an engineer."*
   - Intro (~3 sentences, adapted from
     `business-ops/marketing/direct-client-brochure.md`):
     *"Stop paying people to do what software can do better. We build
     automation and AI integrations for businesses ready to eliminate manual
     work, reduce errors, and free their teams to focus on what actually
     matters."*
   - Three package cards (from `business-ops/business/pricing.md`):
     - **Automation Audit** — *"Map workflows, identify automation
       opportunities, deliver prioritized ROI roadmap. 2–3 weeks."*
     - **Workflow Build** — *"Design and implement specific automation;
       integrate with existing tools; documentation and training. 4–8 weeks."*
     - **Ongoing Support Retainer** — *"Maintenance and optimization, priority
       support, new automation builds. Monthly."*
   - **No prices on cards** — each ends with `Discuss this →` anchor to
     `#contact`
   - Below cards: 4-step "How it works" flow (Discovery → Proposal → Build →
     Deliver), rendered as a numbered horizontal flow with brief descriptions.

5. **About section** (id=`about`, `<AboutSection>`)
   - Section label: `ABOUT`
   - Section title: *"Built by an engineer, not a salesman."*
   - Two-column desktop: text left, `logo-square-navy.png` right (centered in
     column, max ~280px square)
   - Body (~3 short paragraphs):
     - Who Jordan is (one sentence)
     - Why Hoelscher Automation exists
     - One credibility line about hands-on building
   - Three value props (from brochure):
     - *"You own what we build"* (no vendor lock-in)
     - *"We speak your language"* (no jargon, no black boxes)
     - *"Built by an engineer, not a salesman"*

6. **Contact section** (id=`contact`, `<ContactSection>`)
   - Section label: `GET IN TOUCH`
   - Section title: *"Let's talk."*
   - Two-column desktop:
     - **Left (primary path):** "Book a 30-minute discovery call" — big
       primary button → Google Calendar link. Supporting text below:
       *"Come prepared to describe a workflow you'd like to fix. I'll come
       prepared with questions. No pitch deck."*
     - **Right (secondary path):** Short contact form — 3 fields only:
       - `name` (text, required)
       - `email` (email, required, HTML5 validation)
       - `message` (textarea, 4 rows, required, placeholder: *"What's on your
         mind?"*)
       - Submit posts to existing Formspree endpoint (`mrezorre`)
       - Success: replaces form with *"Thanks — I'll be in touch within 24
         hours."*
       - Error: inline message + fallback *"or email `consulting@` directly."*

7. **Footer** — see Section 3 global navigation.

---

### Page 2 — `/cortex/knowledge`

Product detail page. Content driven by
`business-ops/docs/products/cortex-knowledge-v1-prd.md`.

#### Section order and content

1. **Nav** (global)

2. **Hero**
   - Breadcrumb: `Cortex / Knowledge` (small, mono, top-left)
   - Badge: `Self-hosted · Privacy-first · Citation-required`
   - Headline: *"Make 12 years of work product instantly findable."*
   - Sub-headline (~2 sentences):
     *"Cortex Knowledge is a self-hosted document Q&A system for small
     professional services firms. Drop in your PDFs, DOCXs, and notes. Ask
     questions in plain English. Every answer cites its source."*
   - Single CTA: **Book a Cortex demo** (primary, opens the standard
     scheduling link in a new tab). _Optional refinement during implementation:
     append a `?source=cortex-page` query param to the booking URL so that
     bookings originating from this page are visually distinguishable in your
     booking analytics. Google Calendar passes unknown query params through
     harmlessly; this is just a tagging convention, not a Calendar feature._

3. **The problem**
   - Section label: `THE PROBLEM`
   - Pull-quote from PRD §2:
     *"We have 12 years of work product nobody can find. The senior people
     remember where things are. The junior people give up and ask the seniors.
     We waste hours per day."*
   - Short paragraph: why generic search and ChatGPT both fail this use case
     (generic search: no synthesis; ChatGPT: can't trust with client data,
     no citations).

4. **Live terminal demo** (`<Terminal>`, repurposed)
   - Animated terminal showing a Cortex query → retrieval → cited answer
     flow. Lines (sequenced):
     ```
     $ cortex query "What was our position in the Henderson matter?"
     [14:23:01] Searching 4,217 indexed documents...
     [14:23:02] Top matches: smith-v-henderson-brief.pdf, henderson-strategy-memo.docx
     [14:23:03] Synthesizing answer with citations...
     [14:23:04] Answer ready.

     Our position was that the prior agreement [1] did not extend
     to consequential damages because the carve-out clause [2]
     specifically excluded such recovery.

     [1] smith-v-henderson-brief.pdf, p.7
     [2] henderson-strategy-memo.docx, p.3
     ```
   - Caption below: *"Click any citation to open the source document at the
     cited passage."*

5. **How it works** — `ARCHITECTURE`
   - Three-step flow:
     1. **Drop files in** — PDF, DOCX, TXT, Markdown. Auto-indexed.
     2. **Ask in plain English** — RAG-powered retrieval against your
        vectorized library.
     3. **Get answers with citations** — Every claim links to source doc +
        page.
   - Below: short paragraph on architecture — *"Runs in Docker on your
     hardware. Postgres + Qdrant. Three LLM modes: bring your own
     Anthropic API key, run on local Ollama, or use our proxy."*

6. **Why self-hosted matters** — `WHY THIS WAY`
   - Comparison table:

| | Cortex Knowledge | ChatGPT/Claude | Microsoft Copilot | Glean/Hebbia |
|---|---|---|---|---|
| Where your data lives | Your infrastructure | Vendor's | Vendor's | Vendor's |
| Per-seat cost | None | $20/user/mo | $30/user/mo | $50K–$200K/yr |
| Right-sized for 5–30 person firms | Yes | N/A | Bloated | No (enterprise only) |

7. **What v1 ships with** — `V1 FEATURES`
   - Bulleted list from PRD §4 "In scope":
     - Document ingestion (PDF, DOCX, TXT, Markdown)
     - Auto-indexing (new/changed/removed files reflected automatically)
     - Citation-required answers with click-through to source
     - Local user accounts (admin + members)
     - Three LLM modes (BYO Anthropic, BYO Ollama, Hoelscher proxy)
     - Admin dashboard (doc count, index status, users, query log, usage)
     - In-app updates from container registry
     - Single-command backup and restore

8. **Pricing** — `PRICING`
   - Short paragraph: *"Flat installation fee + optional managed-support
     retainer. Concrete numbers vary by firm size and LLM mode. Contact
     for a quote during your demo."*

9. **Final CTA**
   - Repeat: **Book a Cortex demo** (primary)

10. **Footer** (global)

---

### Page 3 — `/terms`

Standard terms-of-use page. Single column, sans-serif headings, regular body.
Plain visual treatment — doesn't try to look like marketing.

#### Sections to draft during implementation

1. **Effective date** (top-of-page, also bottom)
2. **Acceptance** — using the site = accepting terms
3. **Description of services** — site is informational marketing; Cortex
   Knowledge is a separately-licensed product (cross-reference its EULA
   when one exists — out of scope for this rebuild)
4. **Acceptable use** — no scraping, no automated abuse, no impersonation
5. **Intellectual property** — site content owned by Hoelscher Automation LLC;
   brand marks not licensed
6. **Disclaimers / no warranty** — info-only, no professional advice
7. **Limitation of liability** — capped at $0 for site visitors (no
   engagement = no liability beyond site visit)
8. **Governing law** — Ohio
9. **Changes to terms** — may update; effective on posting
10. **Contact** — `consulting@hoelscherautomation.com`

---

### Page 4 — `/privacy`

Same visual treatment as `/terms`. Single column, plain.

#### Sections to draft during implementation

1. **Effective date** (top-of-page, also bottom)
2. **What we collect:**
   - Contact form (Formspree): name, email, message
   - Scheduling (Google Calendar): name, email, anything added to booking
   - **Analytics: Cloudflare Web Analytics** — aggregated pageviews, country,
     device type. **No cookies, no PII, no IP storage.**
   - Cookies set by us: none. Third parties (Formspree, Google Calendar
     embed) may set their own.
3. **How we use it** — reply to inquiries, schedule and conduct calls,
   improve the site (analytics)
4. **Who we share with** — Formspree (form processor; link to their privacy),
   Google (calendar + fonts; link to their privacy), Cloudflare (analytics;
   link to their privacy). **No sale, no marketing partners, no data brokers.**
5. **Retention** — form submissions retained until response complete + 12
   months; analytics aggregated indefinitely
6. **Your rights** — request deletion via `consulting@`; full GDPR/CCPA
   rights apply where applicable
7. **Cortex Knowledge note** —
   *"This privacy policy covers `hoelscherautomation.com`. Cortex Knowledge
   is self-hosted on customer infrastructure; we do not have access to
   customer documents or query history."*
8. **Contact** — `consulting@hoelscherautomation.com`

---

## 7. Integrations & Forms

### Outbound (we link/send to these)

| Integration | Use | Setup needed |
|---|---|---|
| Google Calendar Appointment Schedules | Discovery + Cortex demo bookings | None — link live at `https://calendar.app.google/vBKoPc1KpCooomgc6` |
| Formspree | Contact form processor | None — existing form ID `mrezorre` carries over |
| `mailto:consulting@` | Direct email link | None |
| Google Fonts | Newsreader, Manrope, Space Grotesk | None — preconnect + stylesheet link in `Base.astro` |

### Inbound (collect from visitors)

| Integration | Collects | Setup |
|---|---|---|
| Cloudflare Web Analytics | Pageviews, referrer, country, device type. No cookies, no PII, no IP. | **One-time:** Cloudflare dashboard → Analytics → Web Analytics → add `hoelscherautomation.com` → copy beacon token → paste into `<script>` tag in `Base.astro` |

### Contact form spec

Three fields only (dropped Company and Service dropdowns from current site —
ask those on the discovery call):

| Field | Type | Required |
|---|---|---|
| `name` | text | yes |
| `email` | email | yes (HTML5 validation) |
| `message` | textarea, 4 rows | yes |

AJAX submit, success/error inline. Posts to Formspree `mrezorre`.

### Social and external links (footer)

- LinkedIn: `https://www.linkedin.com/in/jordanhoelscher/`
- GitHub: `https://github.com/HoelscherAutomation`
- Both with `rel="noopener"` and `target="_blank"`

### OG image (social share previews)

- **Spec:** 1200×630 PNG, logo mark + company name + one-line tagline
- **Location:** `public/og-image.png`
- **Referenced via** `<meta property="og:image">` and
  `<meta name="twitter:image">` in `Base.astro`
- **Generation:** at build time using Pillow to compose existing
  `logo-square-navy.png` with tagline text

### Not in v1

Live chat, CRM integrations, Calendly, newsletter signup, cookie banner
(unnecessary given cookieless analytics + user-initiated interactions),
server-side anything.

---

## 8. Deployment & Migration

### Branch strategy

```
main                                # current: vanilla index.html + style.css
└── rebuild-astro                   # all work happens here
    ├── new: package.json, astro.config.mjs, tailwind.config.mjs
    ├── new: src/**, public/**, .github/workflows/deploy.yml
    ├── deleted: index.html, style.css (at repo root)
    └── rewritten: README.md
```

### GitHub Actions deploy workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy Astro to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### GitHub Pages settings change

After PR is ready to merge:
- Repo Settings → Pages → Source: change from
  **"Deploy from a branch"** to **"GitHub Actions"**
- This is a one-time setting change

### Cutover sequence

Brief downtime is acceptable (site has minimal traffic). The order below is
the zero-downtime path, but steps 3 and 4 can be swapped without harm if
downtime doesn't matter:

1. Develop everything on `rebuild-astro` branch
2. Verify workflow builds successfully (push commits, watch Actions tab)
3. Switch Pages source to "GitHub Actions" in repo settings
4. Merge `rebuild-astro` → `main`
5. Workflow runs on main, deploys new site
6. Verify within ~2 minutes

### CNAME preservation

`hoelscherautomation.com` lives at `public/CNAME` (NOT repo root). Astro
copies `public/` verbatim to `dist/`, preserving the custom domain.

### DNS — no changes

Current Cloudflare DNS for `hoelscherautomation.com` continues to point at
GitHub Pages. Build pipeline change doesn't affect DNS.

### HTTPS

GitHub Pages auto-provisions Let's Encrypt for custom domains. Switching
deploy source does not trigger re-issue. If HTTPS breaks: Settings → Pages
→ uncheck "Enforce HTTPS" → wait 1 min → re-check.

### Rollback plan

If new site is broken: revert the merge commit on main → workflow re-runs
on revert → previous state rebuilt and deployed. Recovery ~2 min.

If revert fails: Settings → Pages → switch Source back to
"Deploy from a branch" → main → root. Old `index.html` serves immediately.

### Post-cutover verification

- [ ] `https://hoelscherautomation.com` loads new home page (not vanilla)
- [ ] `https://hoelscherautomation.com/cortex/knowledge` loads
- [ ] `https://hoelscherautomation.com/terms` loads
- [ ] `https://hoelscherautomation.com/privacy` loads
- [ ] Nav anchor links work (`#consulting`, `#about`, `#contact`)
- [ ] "Book a call" opens scheduling link in new tab
- [ ] Contact form submits to Formspree (test with real submission)
- [ ] Mobile rendering is correct (resize browser or use phone)
- [ ] Cloudflare Analytics beacon is firing (check dashboard within 24h)
- [ ] Social share preview shows OG image (paste URL into Slack/Discord)
- [ ] Old anchor links (`#cortex`, `#work`) from previous site don't 404
      (they may scroll to nowhere; acceptable)

### Not doing in this rebuild

- Cloudflare Pages migration (staying on GH Pages)
- 301 redirects from old anchors to new pages (the only structural change
  is Cortex moving from `#cortex` to `/cortex/knowledge`; bookmarked anchor
  links land on home page, scroll to nowhere — acceptable)
- Staging environment (local `npm run dev` is sufficient)

---

## 9. Open gaps deferred to implementation or later

1. **Final tagline / hero copy wordsmithing** — directional copy in this spec
   is intentional; final phrasing to be refined during build
2. **Terms and Privacy actual legal copy** — section structure defined here;
   the actual text drafted as part of implementation. Both should be
   reviewed by Jordan before site goes live.
3. **OG image visual design** — spec says "logo + tagline 1200×630"; actual
   layout and font choices decided during the image-generation step
4. **Cortex Knowledge EULA** — separate from site `/terms`; the product
   needs its own license when it ships. Out of scope for this rebuild.
5. **Cortex Knowledge install docs URL** — once docs exist publicly, add a
   secondary "See install docs" CTA on the Cortex Knowledge page hero
6. **Roadmap visibility for Cortex** — currently kept private; consider
   public "what's next" once 1–2 prospects are mid-evaluation
7. **Future Cortex tool pages** — when tool #2 exists, add a `/cortex`
   platform overview page and convert nav "Cortex" link to a dropdown

---

## 10. Success criteria

The rebuild is done when:

1. All 4 routes render correctly on desktop and mobile
2. CNAME preserved, `hoelscherautomation.com` serves the new site
3. HTTPS valid, no certificate warnings
4. Contact form submits successfully to Formspree
5. Booking link opens correct Google Calendar Appointment Schedule
6. Cloudflare Web Analytics beacon registers in the dashboard within 24h
7. Lighthouse score ≥ 95 across Performance / Accessibility / Best
   Practices / SEO (Astro static + minimal JS should hit this easily)
8. No 404s on internal navigation
9. Jordan has reviewed and approved Terms and Privacy actual copy

---

## 11. Out of scope (this is not what we're building)

- A blog or content marketing engine
- Case studies (none ready to publish)
- A separate consulting deep-dive page
- A separate platform overview page (`/cortex`)
- A standalone about page
- Email newsletter / mailing list
- Live chat
- CRM integration
- Multi-language support
- Authentication or gated content
- Server-side rendering or any non-static behavior
- Cortex Knowledge product itself (separate codebase, separate spec)
