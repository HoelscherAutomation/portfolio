# Website Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `hoelscherautomation.com` from a single-file vanilla HTML portfolio into a 4-page Astro + Tailwind static site that frames Hoelscher Automation as a company offering both the Cortex platform (starting with Cortex Knowledge) and custom automation consulting.

**Architecture:** Astro 5 static-site generation with Tailwind for styling. Four routes (`/`, `/cortex/knowledge`, `/terms`, `/privacy`). Single shared layout (`Base.astro`) with Nav and Footer. Components organized by reusability tier (primitives → composed sections → pages). Deployed via GitHub Actions to GitHub Pages (custom domain `hoelscherautomation.com`).

**Tech Stack:** Astro 5, Tailwind 3, TypeScript strict mode, Node 20 LTS, Google Fonts (Newsreader / Manrope / Space Grotesk), Formspree (contact form), Google Calendar Appointment Schedules (booking), Cloudflare Web Analytics, GitHub Pages, GitHub Actions.

**Reference:** Implementation flows from the spec at `docs/superpowers/specs/2026-05-16-website-rework-design.md`. Re-read that for the rationale behind each decision below.

---

## Phase 1 — Project Bootstrap

### Task 1: Create branch and clean repo of legacy files

**Files:**
- Delete: `index.html`, `style.css`
- Modify: `README.md` (will be rewritten in Task 27)

- [ ] **Step 1: Create and switch to feature branch**

Run from `portfolio/`:
```bash
git checkout -b rebuild-astro
git status
```
Expected: branch `rebuild-astro` created from `main`, working tree clean.

- [ ] **Step 2: Delete the legacy site files**

Run:
```bash
rm index.html style.css
ls
```
Expected: remaining files are `CNAME`, `README.md`, `docs/`, `screenshots/`.

- [ ] **Step 3: Commit the deletion**

```bash
git add -A
git commit -m "chore: remove legacy vanilla HTML site (rebuild in progress)"
```

---

### Task 2: Initialize Astro project structure

**Files:**
- Create: `package.json`, `tsconfig.json`, `astro.config.mjs`, `.gitignore`

- [ ] **Step 1: Create `package.json`**

Create `portfolio/package.json`:
```json
{
  "name": "hoelscherautomation-site",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/tailwind": "^5.1.5",
    "@astrojs/sitemap": "^3.2.1",
    "tailwindcss": "^3.4.17"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

Create `portfolio/tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Create `astro.config.mjs`**

Create `portfolio/astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hoelscherautomation.com',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
```

Note: `applyBaseStyles: false` keeps us in control of the global stylesheet (we'll write our own with custom properties + Tailwind directives in Task 4).

- [ ] **Step 4: Create `.gitignore`**

Create `portfolio/.gitignore`:
```
# build output
dist/
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment
.env
.env.*
!.env.example

# editor
.vscode/
.idea/
.DS_Store

# brainstorming sessions
.superpowers/
```

- [ ] **Step 5: Install dependencies**

Run:
```bash
npm install
```
Expected: `node_modules/` populated, `package-lock.json` created, no errors.

- [ ] **Step 6: Verify Astro CLI works**

Run:
```bash
npx astro --version
```
Expected: prints Astro version `5.x.x`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs .gitignore
git commit -m "feat: initialize Astro 5 + Tailwind + sitemap project"
```

---

### Task 3: Configure Tailwind with brand tokens

**Files:**
- Create: `tailwind.config.mjs`

- [ ] **Step 1: Create `tailwind.config.mjs` with full brand palette**

Create `portfolio/tailwind.config.mjs`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#0A0E1A',
        'bg': '#0E1729',
        'bg-elevated': '#18243D',
        'bg-elevated-hi': '#1F2D4A',
        'border-subtle': 'rgba(255,255,255,0.06)',
        'border-default': 'rgba(255,255,255,0.10)',
        'border-hover': 'rgba(255,255,255,0.18)',
        'text-primary': '#E8EBF2',
        'text-secondary': '#A0AABB',
        'text-muted': '#6B7587',
        'brand-orange': '#E58E26',
        'brand-orange-bright': '#F0A653',
        'brand-blue': '#4D8DF5',
        'navy-deep': '#1B2A4A',
        'ok': '#34D399',
        'warn': '#F59E0B',
        'err': '#EF4444',
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        container: '1120px',
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        lg: '8px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
        reveal: '700ms',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.mjs
git commit -m "feat: configure Tailwind with brand palette and typography"
```

---

### Task 4: Set up global styles, fonts, and minimal page skeleton

**Files:**
- Create: `src/styles/global.css`
- Create: `src/lib/constants.ts`
- Create: `src/layouts/Base.astro` (skeleton — components plugged in later)
- Create: `src/pages/index.astro` (placeholder — full content in Task 17)

- [ ] **Step 1: Create global stylesheet**

Create `portfolio/src/styles/global.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-bg-deep text-text-primary font-body antialiased;
    line-height: 1.65;
    margin: 0;
  }

  /* Scroll reveal — added to elements via class="reveal" */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .reveal.revealed {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 2: Create shared constants module**

Create `portfolio/src/lib/constants.ts`:
```ts
export const COMPANY_NAME = 'Hoelscher Automation';
export const COMPANY_LEGAL_NAME = 'Hoelscher Automation LLC';
export const COMPANY_LOCATION = 'Ohio, USA';
export const COMPANY_TAGLINE = 'AI tools and automation for professional services teams';

export const CONSULTING_EMAIL = 'consulting@hoelscherautomation.com';
export const BOOKING_URL = 'https://calendar.app.google/vBKoPc1KpCooomgc6';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/jordanhoelscher/';
export const GITHUB_URL = 'https://github.com/HoelscherAutomation';

export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrezorre';

// Cloudflare Web Analytics beacon token (filled in Task 24)
export const CF_ANALYTICS_TOKEN = '';

export const SITE_URL = 'https://hoelscherautomation.com';
```

- [ ] **Step 3: Create skeleton Base layout**

Create `portfolio/src/layouts/Base.astro`:
```astro
---
import '../styles/global.css';
import { SITE_URL } from '../lib/constants';

interface Props {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

const { title, description, path, ogImage = '/og-image.png' } = Astro.props;
const canonical = new URL(path, SITE_URL).toString();
const ogImageUrl = new URL(ogImage, SITE_URL).toString();
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />

  <!-- Open Graph / Twitter -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImageUrl} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImageUrl} />

  <!-- Favicon (added in Task 22) -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body>
  <slot />

  <script>
    // Scroll reveal — IntersectionObserver activates .reveal elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  </script>
</body>
</html>
```

Nav and Footer slots will be added once those components exist (Tasks 9 and 10).

- [ ] **Step 4: Create placeholder home page**

Create `portfolio/src/pages/index.astro`:
```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Hoelscher Automation — AI for professional services teams"
  description="Self-hosted AI products and custom automation for small professional services firms."
  path="/"
>
  <main class="max-w-container mx-auto px-8 py-24">
    <h1 class="font-display text-5xl text-text-primary">Hello, Astro.</h1>
    <p class="mt-4 text-text-secondary">Placeholder home page. Real content lands in later tasks.</p>
  </main>
</Base>
```

- [ ] **Step 5: Run the dev server and verify**

Run:
```bash
npm run dev
```
Expected: server starts at `http://localhost:4321`. Open in browser. Verify: dark navy background, serif heading "Hello, Astro." in light text, secondary muted paragraph below it. No console errors.

Stop the dev server (Ctrl-C) before continuing.

- [ ] **Step 6: Run a production build to verify Tailwind compiles**

Run:
```bash
npm run build
```
Expected: `dist/` directory created, no errors. Output mentions Tailwind compilation.

- [ ] **Step 7: Inspect the built CSS to confirm brand tokens are present**

Run:
```bash
grep -o "#0A0E1A\|#E58E26" dist/_astro/*.css | head -5
```
Expected: both hex values found at least once (confirms Tailwind generated the brand colors).

- [ ] **Step 8: Commit**

```bash
git add src/ tsconfig.json
git commit -m "feat: global styles, Base layout skeleton, shared constants"
```

---

## Phase 2 — Layout Primitives

### Task 5: Build SectionLabel, Badge, Button components

**Files:**
- Create: `src/components/SectionLabel.astro`
- Create: `src/components/Badge.astro`
- Create: `src/components/Button.astro`

- [ ] **Step 1: Create SectionLabel**

Create `portfolio/src/components/SectionLabel.astro`:
```astro
---
interface Props {
  children?: string;
}
---
<span class="font-mono text-xs uppercase tracking-[0.1em] text-text-muted block mb-2">
  <slot />
</span>
```

- [ ] **Step 2: Create Badge with three variants**

Create `portfolio/src/components/Badge.astro`:
```astro
---
interface Props {
  variant?: 'brand' | 'blue' | 'muted';
}

const { variant = 'brand' } = Astro.props;

const variants = {
  brand: 'bg-brand-orange/[0.12] text-brand-orange-bright border-brand-orange/30',
  blue: 'bg-brand-blue/[0.12] text-brand-blue border-brand-blue/30',
  muted: 'bg-bg-elevated text-text-secondary border-border-default',
} as const;
---
<span
  class:list={[
    'inline-block px-3 py-1 rounded-full text-xs font-medium tracking-wide border',
    variants[variant],
  ]}
>
  <slot />
</span>
```

- [ ] **Step 3: Create Button with three variants and two sizes**

Create `portfolio/src/components/Button.astro`:
```astro
---
interface Props {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'default' | 'sm';
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit';
  class?: string;
}

const {
  variant = 'primary',
  size = 'default',
  href,
  target,
  rel,
  type = 'button',
  class: className = '',
} = Astro.props;

const base = 'inline-flex items-center gap-2 font-semibold transition-colors duration-default cursor-pointer';
const sizes = {
  default: 'px-5 py-3 text-sm rounded',
  sm: 'px-3.5 py-1.5 text-xs rounded',
} as const;
const variants = {
  primary: 'bg-brand-orange text-navy-deep hover:bg-brand-orange-bright',
  outline: 'bg-transparent text-text-primary border border-border-hover hover:bg-bg-elevated-hi hover:border-text-secondary',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
} as const;

const Tag = href ? 'a' : 'button';
---
<Tag
  href={href}
  target={target}
  rel={rel}
  type={!href ? type : undefined}
  class:list={[base, sizes[size], variants[variant], className]}
>
  <slot />
</Tag>
```

- [ ] **Step 4: Smoke-test by adding the components to the placeholder home page**

Edit `portfolio/src/pages/index.astro` — replace the existing `<main>` block with:
```astro
  <main class="max-w-container mx-auto px-8 py-24 space-y-8">
    <SectionLabel>Test label</SectionLabel>
    <h1 class="font-display text-5xl text-text-primary">Component smoke test</h1>
    <div class="flex gap-3">
      <Badge variant="brand">Platform</Badge>
      <Badge variant="blue">New</Badge>
      <Badge variant="muted">Beta</Badge>
    </div>
    <div class="flex gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  </main>
```

Add the imports at the top (after the existing import):
```astro
import SectionLabel from '../components/SectionLabel.astro';
import Badge from '../components/Badge.astro';
import Button from '../components/Button.astro';
```

- [ ] **Step 5: Run dev server and verify all three render**

Run:
```bash
npm run dev
```
Open `http://localhost:4321`. Verify: section label in muted mono caps, three badge pills with different colors, three buttons (orange filled, outlined, ghost). Hover each button — orange should brighten, outline should lighten background.

Stop dev server.

- [ ] **Step 6: Commit**

```bash
git add src/components/ src/pages/index.astro
git commit -m "feat: add SectionLabel, Badge, Button primitives"
```

---

### Task 6: Build Card and BookCallButton components

**Files:**
- Create: `src/components/Card.astro`
- Create: `src/components/BookCallButton.astro`

- [ ] **Step 1: Create Card component**

Create `portfolio/src/components/Card.astro`:
```astro
---
interface Props {
  href?: string;
  label?: string;
  title: string;
  description: string;
}

const { href, label, title, description } = Astro.props;
const Tag = href ? 'a' : 'div';
---
<Tag
  href={href}
  class:list={[
    'block bg-bg-elevated border border-border-subtle rounded-lg p-5 transition-all duration-default',
    href ? 'hover:bg-bg-elevated-hi hover:border-border-hover' : '',
  ]}
>
  {label && (
    <div class="font-mono text-xs uppercase tracking-wider text-brand-orange-bright mb-2">
      {label}
    </div>
  )}
  <h3 class="font-display text-xl font-semibold text-text-primary mb-2">{title}</h3>
  <p class="text-sm text-text-secondary leading-relaxed">{description}</p>
  {href && (
    <span class="block mt-3 text-xs font-medium text-brand-orange-bright">
      Learn more →
    </span>
  )}
</Tag>
```

- [ ] **Step 2: Create BookCallButton convenience component**

Create `portfolio/src/components/BookCallButton.astro`:
```astro
---
import Button from './Button.astro';
import { BOOKING_URL } from '../lib/constants';

interface Props {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'default' | 'sm';
  label?: string;
}

const { variant = 'primary', size = 'default', label = 'Book a discovery call' } = Astro.props;
---
<Button
  variant={variant}
  size={size}
  href={BOOKING_URL}
  target="_blank"
  rel="noopener"
>
  {label}
</Button>
```

- [ ] **Step 3: Smoke-test by adding to home page**

Edit `portfolio/src/pages/index.astro` — add imports and content. Replace the `<main>` block with:
```astro
  <main class="max-w-container mx-auto px-8 py-24 space-y-8">
    <SectionLabel>Test label</SectionLabel>
    <h1 class="font-display text-5xl text-text-primary">Component smoke test</h1>
    <div class="flex gap-3">
      <Badge variant="brand">Platform</Badge>
      <Badge variant="blue">New</Badge>
      <Badge variant="muted">Beta</Badge>
    </div>
    <div class="flex gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <BookCallButton size="sm" />
    </div>
    <div class="grid grid-cols-2 gap-4 max-w-2xl">
      <Card
        label="Platform"
        title="Cortex Knowledge"
        description="Self-hosted document Q&A with mandatory citations."
        href="/cortex/knowledge"
      />
      <Card
        label="Service"
        title="Custom Automation"
        description="Workflow builds for SMB and agency teams."
      />
    </div>
  </main>
```

Add imports:
```astro
import Card from '../components/Card.astro';
import BookCallButton from '../components/BookCallButton.astro';
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`, open `localhost:4321`. Verify both cards render with hover state on the linked one (Cortex). BookCallButton shows as small primary button labeled "Book a discovery call".

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/Card.astro src/components/BookCallButton.astro src/pages/index.astro
git commit -m "feat: add Card and BookCallButton components"
```

---

### Task 7: Build Nav component

**Files:**
- Create: `src/components/Nav.astro`

- [ ] **Step 1: Create Nav with desktop links and mobile toggle**

Create `portfolio/src/components/Nav.astro`:
```astro
---
import BookCallButton from './BookCallButton.astro';
import { COMPANY_NAME } from '../lib/constants';
---
<nav class="sticky top-0 z-50 bg-bg-deep/80 backdrop-blur border-b border-border-subtle">
  <div class="max-w-container mx-auto px-8 py-4 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 font-display font-semibold text-text-primary hover:text-brand-orange-bright transition-colors duration-default">
      <img src="/assets/logo/logo-square-navy.png" alt="" class="w-7 h-7 rounded" />
      <span>{COMPANY_NAME}</span>
    </a>

    <div class="hidden md:flex items-center gap-8 text-sm">
      <a href="/cortex/knowledge" class="text-text-secondary hover:text-text-primary transition-colors duration-default">Cortex</a>
      <a href="/#consulting" class="text-text-secondary hover:text-text-primary transition-colors duration-default">Consulting</a>
      <a href="/#about" class="text-text-secondary hover:text-text-primary transition-colors duration-default">About</a>
      <BookCallButton variant="primary" size="sm" label="Book a call" />
    </div>

    <button
      id="nav-toggle"
      class="md:hidden flex flex-col gap-1.5 p-2"
      aria-label="Toggle menu"
    >
      <span class="block w-5 h-0.5 bg-text-primary"></span>
      <span class="block w-5 h-0.5 bg-text-primary"></span>
    </button>
  </div>

  <div id="nav-mobile" class="md:hidden hidden border-t border-border-subtle bg-bg-deep">
    <div class="px-8 py-4 flex flex-col gap-4 text-sm">
      <a href="/cortex/knowledge" class="text-text-secondary hover:text-text-primary">Cortex</a>
      <a href="/#consulting" class="text-text-secondary hover:text-text-primary">Consulting</a>
      <a href="/#about" class="text-text-secondary hover:text-text-primary">About</a>
      <BookCallButton variant="primary" size="sm" label="Book a call" />
    </div>
  </div>
</nav>

<script>
  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('nav-mobile');
  toggle?.addEventListener('click', () => {
    mobile?.classList.toggle('hidden');
  });
</script>
```

- [ ] **Step 2: Wire Nav into Base layout**

Edit `portfolio/src/layouts/Base.astro` — add import at the top (after `import` for global.css):
```astro
import Nav from '../components/Nav.astro';
```

And replace the `<body>` block with:
```astro
<body>
  <Nav />
  <slot />

  <script>
    // ... existing scroll reveal script unchanged
```

- [ ] **Step 3: Verify the Nav renders on the home page**

Run `npm run dev`. Open `localhost:4321`. Verify:
- Sticky nav at top with logo (placeholder broken image is fine — logo asset added in Task 22)
- Three text links (Cortex, Consulting, About) on desktop
- Orange "Book a call" button on the right
- Resize browser narrow — hamburger appears, links hide
- Click hamburger — mobile menu reveals/hides

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.astro src/layouts/Base.astro
git commit -m "feat: add sticky Nav component with mobile toggle"
```

---

### Task 8: Build Footer component

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create Footer with four columns and social links**

Create `portfolio/src/components/Footer.astro`:
```astro
---
import {
  COMPANY_NAME,
  COMPANY_LEGAL_NAME,
  COMPANY_LOCATION,
  COMPANY_TAGLINE,
  LINKEDIN_URL,
  GITHUB_URL,
} from '../lib/constants';

const year = new Date().getFullYear();
---
<footer class="border-t border-border-subtle bg-bg-deep">
  <div class="max-w-container mx-auto px-8 py-16">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      <div>
        <div class="flex items-center gap-2 mb-3">
          <img src="/assets/logo/logo-square-navy.png" alt="" class="w-7 h-7 rounded" />
          <span class="font-display font-semibold text-text-primary">{COMPANY_NAME}</span>
        </div>
        <p class="text-sm text-text-secondary leading-relaxed">{COMPANY_TAGLINE}</p>
        <p class="text-xs text-text-muted mt-3">{COMPANY_LOCATION}</p>
      </div>

      <div>
        <h4 class="font-mono text-xs uppercase tracking-wider text-text-muted mb-3">Platform</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/cortex/knowledge" class="text-text-secondary hover:text-text-primary transition-colors duration-default">Cortex Knowledge</a></li>
        </ul>
      </div>

      <div>
        <h4 class="font-mono text-xs uppercase tracking-wider text-text-muted mb-3">Company</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/#about" class="text-text-secondary hover:text-text-primary transition-colors duration-default">About</a></li>
          <li><a href="/#contact" class="text-text-secondary hover:text-text-primary transition-colors duration-default">Contact</a></li>
        </ul>
      </div>

      <div>
        <h4 class="font-mono text-xs uppercase tracking-wider text-text-muted mb-3">Legal</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/terms" class="text-text-secondary hover:text-text-primary transition-colors duration-default">Terms of Use</a></li>
          <li><a href="/privacy" class="text-text-secondary hover:text-text-primary transition-colors duration-default">Privacy Policy</a></li>
        </ul>
      </div>
    </div>

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 border-t border-border-subtle text-xs text-text-muted">
      <p>© {year} {COMPANY_LEGAL_NAME}</p>
      <div class="flex items-center gap-4">
        <a href={LINKEDIN_URL} target="_blank" rel="noopener" aria-label="LinkedIn" class="text-text-secondary hover:text-text-primary transition-colors duration-default">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noopener" aria-label="GitHub" class="text-text-secondary hover:text-text-primary transition-colors duration-default">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Wire Footer into Base layout**

Edit `portfolio/src/layouts/Base.astro` — add import at top (with other imports):
```astro
import Footer from '../components/Footer.astro';
```

And add `<Footer />` after the `<slot />`:
```astro
<body>
  <Nav />
  <slot />
  <Footer />
  <script>
    ...
```

- [ ] **Step 3: Verify Footer renders**

Run `npm run dev`. Open `localhost:4321`. Scroll to bottom. Verify four columns on desktop, two on mobile (resize). Verify LinkedIn and GitHub icons link out (right-click → check link target — should open in new tab when clicked).

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro src/layouts/Base.astro
git commit -m "feat: add Footer with 4 columns, social links, legal links"
```

---

## Phase 3 — Home Page Sections

### Task 9: Build Hero section

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Create Hero component**

Create `portfolio/src/components/Hero.astro`:
```astro
---
import Badge from './Badge.astro';
import Button from './Button.astro';
import BookCallButton from './BookCallButton.astro';
---
<header class="relative overflow-hidden">
  <div class="max-w-container mx-auto px-8 pt-24 pb-32 md:pt-32 md:pb-40">
    <div class="reveal max-w-3xl">
      <Badge variant="brand">AI for professional services teams</Badge>
      <h1 class="mt-6 font-display text-4xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-text-primary">
        Build the AI tools your firm <em class="text-brand-orange-bright not-italic md:italic">already needs</em>.
      </h1>
      <p class="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
        We build self-hosted products and custom automation for small professional services firms. Your data stays with you. We don't disappear after delivery.
      </p>
      <div class="mt-10 flex flex-wrap gap-3">
        <BookCallButton />
        <Button variant="outline" href="#cortex">Explore Cortex</Button>
      </div>
    </div>
  </div>

  <!-- Subtle orange glow at bottom for depth -->
  <div class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent"></div>
</header>
```

- [ ] **Step 2: Wire Hero into the home page**

Edit `portfolio/src/pages/index.astro`. Replace ENTIRE file with:
```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
---
<Base
  title="Hoelscher Automation — AI for professional services teams"
  description="Self-hosted AI products and custom automation for small professional services firms."
  path="/"
>
  <Hero />
</Base>
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Open `localhost:4321`. Verify:
- Large serif headline with the italic emphasized phrase in bright orange
- Sub-headline in lighter text below
- Two CTAs: primary orange "Book a discovery call", outline "Explore Cortex"
- Reveal animation triggers on page load (subtle fade-in slide-up)
- Mobile: headline scales down, CTAs stack reasonably

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat: add home hero with dual CTAs and reveal animation"
```

---

### Task 10: Build CortexOverviewSection

**Files:**
- Create: `src/components/CortexOverviewSection.astro`

- [ ] **Step 1: Create CortexOverviewSection**

Create `portfolio/src/components/CortexOverviewSection.astro`:
```astro
---
import SectionLabel from './SectionLabel.astro';
import Card from './Card.astro';
---
<section id="cortex" class="bg-bg border-y border-border-subtle">
  <div class="max-w-container mx-auto px-8 py-24">
    <div class="reveal max-w-2xl">
      <SectionLabel>Platform</SectionLabel>
      <h2 class="mt-4 font-display text-3xl md:text-4xl font-semibold text-text-primary">
        Cortex — tools that run on your infrastructure.
      </h2>
      <p class="mt-6 text-lg text-text-secondary leading-relaxed">
        Cortex is a growing library of self-hosted AI tools built for small professional services firms. Each tool ships as a Docker image, runs on your hardware, and keeps your data inside your firm.
      </p>
    </div>

    <div class="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl">
      <div class="reveal">
        <Card
          label="Available now"
          title="Cortex Knowledge"
          description="Self-hosted document Q&A with mandatory citations. Drop in your PDFs and DOCXs, ask questions in plain English, get answers that cite their sources."
          href="/cortex/knowledge"
        />
      </div>
      <div class="reveal hidden md:flex items-center justify-start">
        <p class="text-sm text-text-muted italic">
          More tools coming.
        </p>
      </div>
    </div>

    <p class="md:hidden mt-4 text-sm text-text-muted italic">More tools coming.</p>
  </div>
</section>
```

- [ ] **Step 2: Wire into home page**

Edit `portfolio/src/pages/index.astro` — add import and section:
```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import CortexOverviewSection from '../components/CortexOverviewSection.astro';
---
<Base
  title="Hoelscher Automation — AI for professional services teams"
  description="Self-hosted AI products and custom automation for small professional services firms."
  path="/"
>
  <Hero />
  <CortexOverviewSection />
</Base>
```

- [ ] **Step 3: Verify**

Run `npm run dev`. Scroll past the hero. Verify Cortex section appears with section label, headline, intro paragraph, and Cortex Knowledge card. Card should hover-lift. Right side shows "More tools coming." text.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/CortexOverviewSection.astro src/pages/index.astro
git commit -m "feat: add Cortex platform overview section to home"
```

---

### Task 11: Build ConsultingSection

**Files:**
- Create: `src/components/ConsultingSection.astro`

- [ ] **Step 1: Create ConsultingSection with three package cards and a 4-step process**

Create `portfolio/src/components/ConsultingSection.astro`:
```astro
---
import SectionLabel from './SectionLabel.astro';
import Card from './Card.astro';

const packages = [
  {
    label: 'Audit',
    title: 'Automation Audit',
    description: 'Map workflows, identify automation opportunities, deliver prioritized ROI roadmap. 2–3 weeks.',
  },
  {
    label: 'Build',
    title: 'Workflow Build',
    description: 'Design and implement specific automation; integrate with existing tools; documentation and training. 4–8 weeks.',
  },
  {
    label: 'Retainer',
    title: 'Ongoing Support',
    description: 'Maintenance and optimization, priority support, new automation builds. Monthly.',
  },
];

const steps = [
  { num: '01', title: 'Discovery', body: 'Understand your workflows, pain, and goals.' },
  { num: '02', title: 'Proposal', body: 'Clear scope, timeline, and price. No surprises.' },
  { num: '03', title: 'Build', body: 'Develop and test with regular check-ins.' },
  { num: '04', title: 'Deliver', body: 'Deployed, documented, your team trained. We don\'t disappear.' },
];
---
<section id="consulting" class="bg-bg-deep">
  <div class="max-w-container mx-auto px-8 py-24">
    <div class="reveal max-w-2xl">
      <SectionLabel>Services</SectionLabel>
      <h2 class="mt-4 font-display text-3xl md:text-4xl font-semibold text-text-primary">
        Custom automation, built by an engineer.
      </h2>
      <p class="mt-6 text-lg text-text-secondary leading-relaxed">
        Stop paying people to do what software can do better. We build automation and AI integrations for businesses ready to eliminate manual work, reduce errors, and free their teams to focus on what actually matters.
      </p>
    </div>

    <div class="mt-12 grid md:grid-cols-3 gap-4">
      {packages.map((pkg) => (
        <div class="reveal">
          <Card label={pkg.label} title={pkg.title} description={pkg.description} />
          <a href="#contact" class="block mt-3 text-xs font-medium text-brand-orange-bright hover:text-brand-orange transition-colors duration-default">
            Discuss this →
          </a>
        </div>
      ))}
    </div>

    <div class="reveal mt-20">
      <SectionLabel>How it works</SectionLabel>
      <div class="mt-6 grid md:grid-cols-4 gap-6">
        {steps.map((step) => (
          <div>
            <div class="font-mono text-2xl text-brand-orange-bright mb-2">{step.num}</div>
            <h3 class="font-display text-lg font-semibold text-text-primary mb-1">{step.title}</h3>
            <p class="text-sm text-text-secondary leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Wire into home page**

Edit `portfolio/src/pages/index.astro` — add import and section after CortexOverviewSection:
```astro
import ConsultingSection from '../components/ConsultingSection.astro';
```
And add `<ConsultingSection />` after `<CortexOverviewSection />` in the markup.

- [ ] **Step 3: Verify**

Run `npm run dev`. Scroll to consulting section. Verify three package cards in a row (stacked on mobile), each with "Discuss this →" link below. Verify 4-step process row below with orange step numbers.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/ConsultingSection.astro src/pages/index.astro
git commit -m "feat: add consulting section with packages and process"
```

---

### Task 12: Build AboutSection

**Files:**
- Create: `src/components/AboutSection.astro`

- [ ] **Step 1: Create AboutSection**

Create `portfolio/src/components/AboutSection.astro`:
```astro
---
import SectionLabel from './SectionLabel.astro';

const valueProps = [
  {
    title: 'You own what we build.',
    body: 'No vendor lock-in. No recurring license fees for your own software.',
  },
  {
    title: 'We speak your language.',
    body: 'No jargon, no black boxes. You\'re never dependent on us to understand your own systems.',
  },
  {
    title: 'Built by an engineer, not a salesman.',
    body: 'Every solution designed and built by Jordan Hoelscher — hands-on, end-to-end.',
  },
];
---
<section id="about" class="bg-bg border-y border-border-subtle">
  <div class="max-w-container mx-auto px-8 py-24">
    <div class="grid md:grid-cols-[1fr_auto] gap-12 md:gap-20 items-start">
      <div class="reveal max-w-2xl">
        <SectionLabel>About</SectionLabel>
        <h2 class="mt-4 font-display text-3xl md:text-4xl font-semibold text-text-primary">
          Built by an engineer, not a salesman.
        </h2>
        <div class="mt-6 space-y-4 text-text-secondary leading-relaxed">
          <p>
            Hoelscher Automation is a one-person consultancy and product studio based in Ohio. Jordan Hoelscher founded it to build the AI tools small professional services firms actually need — without the enterprise sales theater.
          </p>
          <p>
            Every engagement is designed, scoped, and built by Jordan personally. No account managers, no offshore handoffs, no proposal decks. You talk to the person doing the work.
          </p>
          <p>
            Before Hoelscher Automation, Jordan spent years building production infrastructure and automation systems — running 50+ services, designing self-healing AI agents, and shipping software that has to work unattended at 3 AM.
          </p>
        </div>
      </div>

      <div class="reveal flex justify-center md:justify-end">
        <img
          src="/assets/logo/logo-square-navy.png"
          alt="Hoelscher Automation logo"
          width="240"
          height="240"
          class="rounded-lg w-48 h-48 md:w-60 md:h-60"
        />
      </div>
    </div>

    <div class="reveal mt-16 grid md:grid-cols-3 gap-8">
      {valueProps.map((vp) => (
        <div>
          <h3 class="font-display text-lg font-semibold text-text-primary mb-2">{vp.title}</h3>
          <p class="text-sm text-text-secondary leading-relaxed">{vp.body}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Wire into home page**

Edit `portfolio/src/pages/index.astro` — add import + `<AboutSection />` after ConsultingSection.

- [ ] **Step 3: Verify**

Run `npm run dev`. Scroll to About. Verify two-column layout with text left, logo right (logo will show broken image until Task 22 — placeholder is fine). Three value props in row below.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/AboutSection.astro src/pages/index.astro
git commit -m "feat: add About section with founder copy and value props"
```

---

### Task 13: Build ContactSection with Formspree AJAX

**Files:**
- Create: `src/components/ContactSection.astro`

- [ ] **Step 1: Create ContactSection**

Create `portfolio/src/components/ContactSection.astro`:
```astro
---
import SectionLabel from './SectionLabel.astro';
import BookCallButton from './BookCallButton.astro';
import { FORMSPREE_ENDPOINT, CONSULTING_EMAIL } from '../lib/constants';
---
<section id="contact" class="bg-bg-deep">
  <div class="max-w-container mx-auto px-8 py-24">
    <div class="reveal max-w-2xl">
      <SectionLabel>Get in touch</SectionLabel>
      <h2 class="mt-4 font-display text-3xl md:text-4xl font-semibold text-text-primary">
        Let's talk.
      </h2>
    </div>

    <div class="mt-12 grid md:grid-cols-2 gap-12">
      <!-- Primary: book a call -->
      <div class="reveal">
        <h3 class="font-display text-xl font-semibold text-text-primary mb-3">
          Book a 30-minute discovery call
        </h3>
        <p class="text-text-secondary leading-relaxed mb-6">
          Come prepared to describe a workflow you'd like to fix. I'll come prepared with questions. No pitch deck — just a conversation.
        </p>
        <BookCallButton />
        <p class="mt-6 text-sm text-text-muted">
          Or reach out directly at <a href={`mailto:${CONSULTING_EMAIL}`} class="text-text-secondary hover:text-text-primary underline transition-colors duration-default">{CONSULTING_EMAIL}</a>.
        </p>
      </div>

      <!-- Secondary: contact form -->
      <div class="reveal">
        <h3 class="font-display text-xl font-semibold text-text-primary mb-3">
          Send a message
        </h3>
        <p class="text-text-secondary leading-relaxed mb-6">
          Not ready for a call? Drop a note and I'll reply within one business day.
        </p>
        <form id="contact-form" action={FORMSPREE_ENDPOINT} method="POST" class="space-y-4">
          <div>
            <label for="name" class="block text-sm text-text-secondary mb-1">Name</label>
            <input
              type="text" id="name" name="name" required
              class="w-full px-3 py-2.5 bg-bg-elevated border border-border-default rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-orange transition-colors duration-default"
            />
          </div>
          <div>
            <label for="email" class="block text-sm text-text-secondary mb-1">Email</label>
            <input
              type="email" id="email" name="email" required
              class="w-full px-3 py-2.5 bg-bg-elevated border border-border-default rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-orange transition-colors duration-default"
            />
          </div>
          <div>
            <label for="message" class="block text-sm text-text-secondary mb-1">What's on your mind?</label>
            <textarea
              id="message" name="message" rows="4" required
              class="w-full px-3 py-2.5 bg-bg-elevated border border-border-default rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-orange transition-colors duration-default resize-y"
            ></textarea>
          </div>
          <button
            type="submit"
            id="contact-submit"
            class="w-full px-5 py-3 bg-brand-orange text-navy-deep font-semibold rounded hover:bg-brand-orange-bright transition-colors duration-default disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Send message
          </button>
          <div id="form-status" class="text-sm hidden"></div>
        </form>
      </div>
    </div>
  </div>
</section>

<script>
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const submit = document.getElementById('contact-submit') as HTMLButtonElement | null;
  const status = document.getElementById('form-status') as HTMLDivElement | null;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!submit || !status) return;

    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.className = 'text-sm hidden';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        status.textContent = "Thanks — I'll be in touch within 24 hours.";
        status.className = 'text-sm text-ok';
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        status.textContent = (data as { errors?: { message: string }[] }).errors
          ? (data as { errors: { message: string }[] }).errors.map((er) => er.message).join(', ')
          : 'Something went wrong. Try emailing me directly.';
        status.className = 'text-sm text-err';
      }
    } catch {
      status.textContent = 'Network error. Try emailing me directly.';
      status.className = 'text-sm text-err';
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send message';
    }
  });
</script>
```

- [ ] **Step 2: Wire into home page**

Edit `portfolio/src/pages/index.astro` — add import + `<ContactSection />` after AboutSection.

- [ ] **Step 3: Verify form renders and submits**

Run `npm run dev`. Scroll to Contact. Verify:
- Two columns: book-a-call on left, form on right
- Form has 3 fields (name, email, "What's on your mind?")
- Submit button is orange
- Tab through fields — focus ring is orange

Don't actually submit yet (that would fire a real Formspree submission — test in Phase 9 once site is in final shape).

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/ContactSection.astro src/pages/index.astro
git commit -m "feat: add Contact section with booking link and Formspree form"
```

---

## Phase 4 — Cortex Knowledge Page

### Task 14: Build Terminal animation component

**Files:**
- Create: `src/components/Terminal.astro`

- [ ] **Step 1: Create Terminal component with type-on animation**

Create `portfolio/src/components/Terminal.astro`:
```astro
---
interface Line {
  prompt?: string;
  ts?: string;
  text: string;
  type?: 'cmd' | 'log' | 'ok' | 'warn' | 'output';
}

interface Props {
  title?: string;
  lines: Line[];
}

const { title = 'cortex — knowledge query', lines } = Astro.props;

const typeColors = {
  cmd: 'text-text-primary',
  log: 'text-text-secondary',
  ok: 'text-ok',
  warn: 'text-warn',
  output: 'text-brand-orange-bright',
} as const;
---
<div class="terminal max-w-4xl mx-auto bg-bg-elevated border border-border-default rounded-lg overflow-hidden font-mono text-sm">
  <div class="flex items-center gap-2 px-4 py-2.5 bg-bg-elevated-hi border-b border-border-default">
    <span class="block w-2.5 h-2.5 rounded-full bg-err/70"></span>
    <span class="block w-2.5 h-2.5 rounded-full bg-warn/70"></span>
    <span class="block w-2.5 h-2.5 rounded-full bg-ok/70"></span>
    <span class="ml-3 text-xs text-text-muted">{title}</span>
  </div>
  <div class="p-5 space-y-1.5 min-h-[280px]">
    {lines.map((line, i) => (
      <div
        class:list={[
          'terminal-line opacity-0 transition-opacity duration-300',
          typeColors[line.type ?? 'log'],
        ]}
        data-line-index={i}
      >
        {line.prompt && <span class="text-brand-orange-bright mr-2">{line.prompt}</span>}
        {line.ts && <span class="text-text-muted mr-2">{line.ts}</span>}
        <span>{line.text}</span>
      </div>
    ))}
  </div>
</div>

<script>
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const terminal = entry.target as HTMLElement;
        const lineEls = terminal.querySelectorAll<HTMLElement>('.terminal-line');
        lineEls.forEach((el, i) => {
          setTimeout(() => {
            el.style.opacity = '1';
          }, i * 380);
        });
        observer.unobserve(terminal);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.terminal').forEach((el) => observer.observe(el));
</script>
```

- [ ] **Step 2: Smoke-test on home page**

Edit `portfolio/src/pages/index.astro` temporarily — add the terminal import and a test block. Add import:
```astro
import Terminal from '../components/Terminal.astro';
```

Add this BEFORE `<ContactSection />`:
```astro
  <section class="bg-bg-deep py-24">
    <div class="max-w-container mx-auto px-8">
      <Terminal
        title="cortex — smoke test"
        lines={[
          { prompt: '$', text: 'cortex query "test"', type: 'cmd' },
          { ts: '[14:23:01]', text: 'Searching documents...', type: 'log' },
          { ts: '[14:23:02]', text: 'Done.', type: 'ok' },
        ]}
      />
    </div>
  </section>
```

- [ ] **Step 3: Verify the animation**

Run `npm run dev`. Scroll until the terminal is in view. Verify lines fade in sequentially with ~380ms delay. The traffic-light circles render correctly. The title shows "cortex — smoke test".

Stop dev server.

- [ ] **Step 4: Remove the smoke-test section from home page**

Edit `portfolio/src/pages/index.astro` — REMOVE the Terminal import and the smoke-test `<section>` you just added. (Terminal will live on the Cortex Knowledge page only.)

- [ ] **Step 5: Commit**

```bash
git add src/components/Terminal.astro src/pages/index.astro
git commit -m "feat: add Terminal component with sequential line-reveal animation"
```

---

### Task 15: Build /cortex/knowledge page

**Files:**
- Create: `src/pages/cortex/knowledge.astro`

- [ ] **Step 1: Create the Cortex Knowledge page**

Create directory and file:
```bash
mkdir -p src/pages/cortex
```

Create `portfolio/src/pages/cortex/knowledge.astro`:
```astro
---
import Base from '../../layouts/Base.astro';
import SectionLabel from '../../components/SectionLabel.astro';
import Badge from '../../components/Badge.astro';
import Button from '../../components/Button.astro';
import Terminal from '../../components/Terminal.astro';
import { BOOKING_URL } from '../../lib/constants';

const v1Features = [
  'Document ingestion — PDF, DOCX, TXT, Markdown',
  'Auto-indexing — new, changed, and removed files reflected automatically',
  'Citation-required answers with click-through to source passages',
  'Local user accounts (admin + members)',
  'Three LLM modes — bring your own Anthropic API key, run on local Ollama, or use our proxy',
  'Admin dashboard — doc count, index status, users, query log, usage stats',
  'In-app updates from container registry',
  'Single-command backup and restore',
];

const terminalLines = [
  { prompt: '$', text: 'cortex query "What was our position in the Henderson matter?"', type: 'cmd' as const },
  { ts: '[14:23:01]', text: 'Searching 4,217 indexed documents...', type: 'log' as const },
  { ts: '[14:23:02]', text: 'Top matches: smith-v-henderson-brief.pdf, henderson-strategy-memo.docx', type: 'log' as const },
  { ts: '[14:23:03]', text: 'Synthesizing answer with citations...', type: 'log' as const },
  { ts: '[14:23:04]', text: 'Answer ready.', type: 'ok' as const },
  { text: '', type: 'log' as const },
  { text: 'Our position was that the prior agreement [1] did not extend to', type: 'output' as const },
  { text: 'consequential damages because the carve-out clause [2] specifically', type: 'output' as const },
  { text: 'excluded such recovery.', type: 'output' as const },
  { text: '', type: 'log' as const },
  { text: '[1] smith-v-henderson-brief.pdf, p.7', type: 'log' as const },
  { text: '[2] henderson-strategy-memo.docx, p.3', type: 'log' as const },
];

const cortexDemoUrl = `${BOOKING_URL}?source=cortex-page`;
---
<Base
  title="Cortex Knowledge — Self-hosted document Q&A | Hoelscher Automation"
  description="A self-hosted document Q&A system for small professional services firms. Drop in your PDFs, ask in plain English, get answers with citations. Your data never leaves your firm."
  path="/cortex/knowledge"
>
  <!-- Hero -->
  <header class="bg-bg-deep">
    <div class="max-w-container mx-auto px-8 pt-12 pb-20 md:pt-16 md:pb-28">
      <div class="reveal max-w-3xl">
        <div class="font-mono text-xs text-text-muted mb-4">
          <a href="/cortex/knowledge" class="hover:text-text-secondary transition-colors duration-default">Cortex</a>
          <span class="mx-1">/</span>
          <span class="text-text-secondary">Knowledge</span>
        </div>
        <Badge variant="brand">Self-hosted · Privacy-first · Citation-required</Badge>
        <h1 class="mt-6 font-display text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight text-text-primary">
          Make 12 years of work product instantly findable.
        </h1>
        <p class="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
          Cortex Knowledge is a self-hosted document Q&A system for small professional services firms. Drop in your PDFs, DOCXs, and notes. Ask questions in plain English. Every answer cites its source.
        </p>
        <div class="mt-10">
          <Button variant="primary" href={cortexDemoUrl} target="_blank" rel="noopener">
            Book a Cortex demo
          </Button>
        </div>
      </div>
    </div>
  </header>

  <!-- The problem -->
  <section class="bg-bg border-y border-border-subtle">
    <div class="max-w-container mx-auto px-8 py-20">
      <div class="reveal max-w-3xl">
        <SectionLabel>The problem</SectionLabel>
        <blockquote class="mt-6 font-display text-2xl md:text-3xl text-text-primary leading-snug border-l-2 border-brand-orange-bright pl-6">
          "We have 12 years of work product nobody can find. The senior people remember where things are. The junior people give up and ask the seniors. We waste hours per day."
        </blockquote>
        <p class="mt-8 text-text-secondary leading-relaxed">
          Generic search doesn't synthesize — you still have to open every result. ChatGPT can synthesize but can't be trusted with client data and won't cite sources. Both fail this use case for the same reason: small professional services firms need both <em class="text-text-primary not-italic font-medium">precision</em> and <em class="text-text-primary not-italic font-medium">privacy</em>, and neither alone is enough.
        </p>
      </div>
    </div>
  </section>

  <!-- Terminal demo -->
  <section class="bg-bg-deep">
    <div class="max-w-container mx-auto px-8 py-20">
      <div class="reveal">
        <SectionLabel>How a query works</SectionLabel>
        <h2 class="mt-4 font-display text-2xl md:text-3xl font-semibold text-text-primary mb-10">
          Watch a real query in action.
        </h2>
      </div>
      <div class="reveal">
        <Terminal title="cortex — knowledge query" lines={terminalLines} />
        <p class="mt-4 text-sm text-text-muted text-center max-w-2xl mx-auto">
          Click any citation to open the source document at the cited passage.
        </p>
      </div>
    </div>
  </section>

  <!-- How it works (architecture) -->
  <section class="bg-bg border-y border-border-subtle">
    <div class="max-w-container mx-auto px-8 py-20">
      <div class="reveal max-w-2xl">
        <SectionLabel>Architecture</SectionLabel>
        <h2 class="mt-4 font-display text-2xl md:text-3xl font-semibold text-text-primary">
          Three steps, end to end.
        </h2>
      </div>
      <div class="mt-12 grid md:grid-cols-3 gap-8">
        <div class="reveal">
          <div class="font-mono text-3xl text-brand-orange-bright mb-3">01</div>
          <h3 class="font-display text-lg font-semibold text-text-primary mb-2">Drop files in</h3>
          <p class="text-sm text-text-secondary leading-relaxed">PDF, DOCX, TXT, Markdown. Watched folder or web upload. Auto-indexed.</p>
        </div>
        <div class="reveal">
          <div class="font-mono text-3xl text-brand-orange-bright mb-3">02</div>
          <h3 class="font-display text-lg font-semibold text-text-primary mb-2">Ask in plain English</h3>
          <p class="text-sm text-text-secondary leading-relaxed">RAG-powered retrieval against your vectorized library. Local embeddings by default.</p>
        </div>
        <div class="reveal">
          <div class="font-mono text-3xl text-brand-orange-bright mb-3">03</div>
          <h3 class="font-display text-lg font-semibold text-text-primary mb-2">Get cited answers</h3>
          <p class="text-sm text-text-secondary leading-relaxed">Every claim links to source doc and page. Click through to verify.</p>
        </div>
      </div>
      <p class="reveal mt-12 text-sm text-text-muted max-w-3xl">
        Runs in Docker on your hardware. Postgres + Qdrant. Three LLM modes: bring your own Anthropic API key, run on local Ollama, or use our proxy.
      </p>
    </div>
  </section>

  <!-- Comparison table -->
  <section class="bg-bg-deep">
    <div class="max-w-container mx-auto px-8 py-20">
      <div class="reveal max-w-2xl">
        <SectionLabel>Why this way</SectionLabel>
        <h2 class="mt-4 font-display text-2xl md:text-3xl font-semibold text-text-primary">
          Self-hosted is the differentiator.
        </h2>
      </div>
      <div class="reveal mt-10 overflow-x-auto">
        <table class="w-full text-sm border border-border-default rounded-lg overflow-hidden">
          <thead class="bg-bg-elevated">
            <tr>
              <th class="text-left p-4 font-mono text-xs uppercase tracking-wider text-text-muted"></th>
              <th class="text-left p-4 font-semibold text-brand-orange-bright">Cortex Knowledge</th>
              <th class="text-left p-4 font-medium text-text-secondary">ChatGPT / Claude</th>
              <th class="text-left p-4 font-medium text-text-secondary">Microsoft Copilot</th>
              <th class="text-left p-4 font-medium text-text-secondary">Glean / Hebbia</th>
            </tr>
          </thead>
          <tbody class="text-text-secondary">
            <tr class="border-t border-border-subtle">
              <td class="p-4 font-medium text-text-primary">Where your data lives</td>
              <td class="p-4 text-brand-orange-bright">Your infrastructure</td>
              <td class="p-4">Vendor's</td>
              <td class="p-4">Vendor's</td>
              <td class="p-4">Vendor's</td>
            </tr>
            <tr class="border-t border-border-subtle">
              <td class="p-4 font-medium text-text-primary">Per-seat cost</td>
              <td class="p-4 text-brand-orange-bright">None</td>
              <td class="p-4">$20/user/mo</td>
              <td class="p-4">$30/user/mo</td>
              <td class="p-4">$50K–$200K/yr</td>
            </tr>
            <tr class="border-t border-border-subtle">
              <td class="p-4 font-medium text-text-primary">Right-sized for 5–30 person firms</td>
              <td class="p-4 text-brand-orange-bright">Yes</td>
              <td class="p-4">N/A</td>
              <td class="p-4">Bloated</td>
              <td class="p-4">Enterprise only</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- v1 features -->
  <section class="bg-bg border-y border-border-subtle">
    <div class="max-w-container mx-auto px-8 py-20">
      <div class="reveal max-w-2xl">
        <SectionLabel>v1 features</SectionLabel>
        <h2 class="mt-4 font-display text-2xl md:text-3xl font-semibold text-text-primary">
          What ships in the first release.
        </h2>
      </div>
      <ul class="reveal mt-10 grid md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl">
        {v1Features.map((feature) => (
          <li class="flex items-start gap-3 text-text-secondary">
            <span class="flex-none mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-orange-bright"></span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>

  <!-- Pricing -->
  <section class="bg-bg-deep">
    <div class="max-w-container mx-auto px-8 py-20">
      <div class="reveal max-w-2xl">
        <SectionLabel>Pricing</SectionLabel>
        <h2 class="mt-4 font-display text-2xl md:text-3xl font-semibold text-text-primary">
          Flat install fee plus optional managed support.
        </h2>
        <p class="mt-6 text-text-secondary leading-relaxed">
          Concrete numbers vary by firm size and LLM mode. Contact for a quote during your demo.
        </p>
      </div>
    </div>
  </section>

  <!-- Final CTA -->
  <section class="bg-bg border-t border-border-subtle">
    <div class="max-w-container mx-auto px-8 py-20 text-center">
      <h2 class="reveal font-display text-3xl md:text-4xl font-semibold text-text-primary">
        Ready to see it on your documents?
      </h2>
      <p class="reveal mt-4 text-text-secondary max-w-xl mx-auto">
        Book a 30-minute demo. I'll show you the system running against a sample legal/accounting corpus, then we'll talk about what installation looks like for your firm.
      </p>
      <div class="reveal mt-8">
        <Button variant="primary" href={cortexDemoUrl} target="_blank" rel="noopener">
          Book a Cortex demo
        </Button>
      </div>
    </div>
  </section>
</Base>
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`. Open `http://localhost:4321/cortex/knowledge`. Verify:
- Breadcrumb "Cortex / Knowledge" at top
- Badge and headline
- Single primary CTA "Book a Cortex demo"
- Problem section with quote
- Terminal demo with animated lines
- 3-step architecture
- Comparison table
- Bulleted v1 features
- Pricing section
- Final CTA

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/cortex/
git commit -m "feat: build /cortex/knowledge product detail page"
```

---

## Phase 5 — Legal Pages

### Task 16: Draft and build /terms

**Files:**
- Create: `src/pages/terms.astro`

- [ ] **Step 1: Create Terms of Use page**

Create `portfolio/src/pages/terms.astro`:
```astro
---
import Base from '../layouts/Base.astro';
import { COMPANY_LEGAL_NAME, CONSULTING_EMAIL } from '../lib/constants';

const effectiveDate = '2026-05-16';
---
<Base
  title="Terms of Use | Hoelscher Automation"
  description="Terms of use for hoelscherautomation.com."
  path="/terms"
>
  <article class="max-w-3xl mx-auto px-8 py-20 prose-invert">
    <p class="font-mono text-xs text-text-muted">Effective: {effectiveDate}</p>
    <h1 class="mt-4 font-display text-4xl font-semibold text-text-primary">Terms of Use</h1>

    <div class="mt-10 space-y-8 text-text-secondary leading-relaxed">
      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">1. Acceptance</h2>
        <p>By accessing or using <strong>hoelscherautomation.com</strong> (the "Site"), you agree to these Terms of Use. If you do not agree, do not use the Site.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">2. Description of Services</h2>
        <p>The Site is the public marketing and informational website of {COMPANY_LEGAL_NAME}, an Ohio limited liability company. The Site describes consulting services and software products offered by {COMPANY_LEGAL_NAME}.</p>
        <p class="mt-3">Software products listed on the Site (including Cortex Knowledge) are governed by their own separate license agreements provided at the time of installation or purchase. Nothing on the Site constitutes a license to any such product.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">3. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul class="mt-3 space-y-2 list-disc pl-6">
          <li>Use the Site in violation of any applicable law or regulation</li>
          <li>Attempt to gain unauthorized access to any portion of the Site or its underlying systems</li>
          <li>Scrape, harvest, or systematically extract content from the Site without express written permission</li>
          <li>Use automated systems (bots, crawlers) in a manner that imposes an unreasonable load on the Site</li>
          <li>Impersonate {COMPANY_LEGAL_NAME} or any other person</li>
          <li>Submit false or misleading information through any form on the Site</li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">4. Intellectual Property</h2>
        <p>All content on the Site — text, graphics, logos, code, layout — is owned by {COMPANY_LEGAL_NAME} or its licensors and is protected by copyright and other intellectual property laws. The Hoelscher Automation name, logo, and brand marks are property of {COMPANY_LEGAL_NAME} and may not be used without prior written permission.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">5. Disclaimers</h2>
        <p>The Site is provided "as is" and "as available," without warranty of any kind, express or implied. {COMPANY_LEGAL_NAME} makes no representations regarding the accuracy, completeness, or reliability of any content on the Site.</p>
        <p class="mt-3">Nothing on the Site constitutes legal, accounting, tax, or other professional advice. Information about software capabilities, pricing, timelines, or outcomes is provided for general reference; specific terms apply only when memorialized in a signed engagement letter.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">6. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, {COMPANY_LEGAL_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site. Total liability of {COMPANY_LEGAL_NAME} for any claim arising from your use of the Site (separate from any signed engagement) shall not exceed one hundred US dollars ($100).</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">7. Governing Law</h2>
        <p>These Terms are governed by the laws of the State of Ohio, without regard to conflict-of-laws principles. Any dispute arising out of or relating to these Terms shall be brought exclusively in the state or federal courts located in Ohio.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">8. Changes to These Terms</h2>
        <p>{COMPANY_LEGAL_NAME} may revise these Terms at any time. The revised Terms become effective when posted to the Site. Your continued use of the Site after changes are posted constitutes your acceptance of the revised Terms. The "Effective" date at the top of this page reflects the most recent revision.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">9. Contact</h2>
        <p>Questions about these Terms: <a href={`mailto:${CONSULTING_EMAIL}`} class="text-brand-orange-bright underline">{CONSULTING_EMAIL}</a></p>
      </section>

      <p class="pt-8 mt-12 border-t border-border-subtle font-mono text-xs text-text-muted">
        Effective: {effectiveDate} · © {new Date().getFullYear()} {COMPANY_LEGAL_NAME}
      </p>
    </div>
  </article>
</Base>
```

- [ ] **Step 2: Verify**

Run `npm run dev`. Open `http://localhost:4321/terms`. Verify all 9 sections render, body text is readable, headings have correct hierarchy, contact email is clickable.

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/terms.astro
git commit -m "feat: add Terms of Use page"
```

---

### Task 17: Draft and build /privacy

**Files:**
- Create: `src/pages/privacy.astro`

- [ ] **Step 1: Create Privacy Policy page**

Create `portfolio/src/pages/privacy.astro`:
```astro
---
import Base from '../layouts/Base.astro';
import { COMPANY_LEGAL_NAME, CONSULTING_EMAIL } from '../lib/constants';

const effectiveDate = '2026-05-16';
---
<Base
  title="Privacy Policy | Hoelscher Automation"
  description="Privacy policy for hoelscherautomation.com — what we collect, how we use it, who we share with."
  path="/privacy"
>
  <article class="max-w-3xl mx-auto px-8 py-20">
    <p class="font-mono text-xs text-text-muted">Effective: {effectiveDate}</p>
    <h1 class="mt-4 font-display text-4xl font-semibold text-text-primary">Privacy Policy</h1>

    <div class="mt-10 space-y-8 text-text-secondary leading-relaxed">
      <section>
        <p class="text-text-primary">
          This Privacy Policy describes how {COMPANY_LEGAL_NAME} handles information collected through <strong>hoelscherautomation.com</strong> (the "Site").
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">1. What We Collect</h2>
        <h3 class="font-medium text-text-primary mt-4 mb-2">Contact form submissions</h3>
        <p>When you submit the contact form, we collect the name, email address, and message you provide. The form is processed by Formspree (see Section 3).</p>

        <h3 class="font-medium text-text-primary mt-4 mb-2">Scheduling</h3>
        <p>When you book a discovery call through our Google Calendar Appointment Schedules link, Google collects your name, email, and any additional information you provide on the booking form. We receive a calendar invitation containing this information.</p>

        <h3 class="font-medium text-text-primary mt-4 mb-2">Analytics</h3>
        <p>We use <strong>Cloudflare Web Analytics</strong> to understand aggregate Site usage. Cloudflare collects pageviews, referrer, country, and device type. <strong>Cloudflare Web Analytics does not use cookies, does not collect IP addresses, and does not contain any personally identifiable information.</strong></p>

        <h3 class="font-medium text-text-primary mt-4 mb-2">Cookies</h3>
        <p>{COMPANY_LEGAL_NAME} does not set any first-party cookies on the Site. Embedded third-party services (Formspree, Google Calendar) may set their own cookies; see their privacy policies for details.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">2. How We Use Information</h2>
        <ul class="mt-3 space-y-2 list-disc pl-6">
          <li>To respond to contact-form inquiries</li>
          <li>To schedule and conduct discovery calls</li>
          <li>To understand which parts of the Site are useful and improve them</li>
          <li>To comply with legal obligations</li>
        </ul>
        <p class="mt-3">We do <strong>not</strong> use collected information for advertising, profiling, or any marketing not initiated by you.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">3. Service Providers We Share With</h2>
        <ul class="mt-3 space-y-3 list-disc pl-6">
          <li>
            <strong>Formspree</strong> — processes contact-form submissions.
            <a href="https://formspree.io/legal/privacy-policy/" target="_blank" rel="noopener" class="text-brand-orange-bright underline">Formspree privacy policy</a>
          </li>
          <li>
            <strong>Google</strong> — provides calendar booking, font hosting, and (if you click to book) videoconferencing through Google Meet.
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" class="text-brand-orange-bright underline">Google privacy policy</a>
          </li>
          <li>
            <strong>Cloudflare</strong> — provides analytics and CDN delivery.
            <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener" class="text-brand-orange-bright underline">Cloudflare privacy policy</a>
          </li>
        </ul>
        <p class="mt-4">
          <strong>We do not sell your information.</strong> We do not share information with data brokers, marketing networks, or any third party not listed above.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">4. Data Retention</h2>
        <p>Contact-form submissions are retained until your inquiry is fully resolved, plus twelve (12) months for reference. Calendar bookings are retained for the duration required by Google Calendar's own retention policies. Cloudflare analytics data is aggregated and does not contain personal information; it is retained per Cloudflare's policies.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">5. Your Rights</h2>
        <p>You may request that we delete the contact-form submission or scheduling information we hold about you by emailing <a href={`mailto:${CONSULTING_EMAIL}`} class="text-brand-orange-bright underline">{CONSULTING_EMAIL}</a>.</p>
        <p class="mt-3">If you are a resident of the European Union or the United Kingdom, you have rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, delete, or restrict processing of your personal data, and the right to data portability.</p>
        <p class="mt-3">If you are a resident of California, you have rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to delete personal information, and the right to opt out of any sale of personal information (note: we do not sell personal information).</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">6. Cortex Knowledge</h2>
        <p>This Privacy Policy covers <strong>hoelscherautomation.com</strong>. Cortex Knowledge is a self-hosted software product that runs entirely on customer infrastructure. {COMPANY_LEGAL_NAME} does not have access to customer documents, queries, or any data processed by a Cortex Knowledge installation, unless a customer explicitly provides such data during a support engagement.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">7. Changes to This Policy</h2>
        <p>{COMPANY_LEGAL_NAME} may update this Privacy Policy from time to time. The "Effective" date at the top of this page reflects the most recent revision. Material changes will be highlighted at the top of this page for at least 30 days following the change.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-semibold text-text-primary mb-3">8. Contact</h2>
        <p>Questions about this Privacy Policy or requests regarding your personal information: <a href={`mailto:${CONSULTING_EMAIL}`} class="text-brand-orange-bright underline">{CONSULTING_EMAIL}</a></p>
      </section>

      <p class="pt-8 mt-12 border-t border-border-subtle font-mono text-xs text-text-muted">
        Effective: {effectiveDate} · © {new Date().getFullYear()} {COMPANY_LEGAL_NAME}
      </p>
    </div>
  </article>
</Base>
```

- [ ] **Step 2: Verify**

Run `npm run dev`. Open `http://localhost:4321/privacy`. Verify all 8 sections render. Verify the three external links (Formspree, Google, Cloudflare privacy policies) open in new tabs.

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/privacy.astro
git commit -m "feat: add Privacy Policy page"
```

---

## Phase 6 — Assets, Analytics, and Polish

### Task 18: Copy logo assets and add favicon to public/

**Files:**
- Create: `public/assets/logo/logo-square-navy.png`, `logo-circle-safe-navy.png`, `logo-transparent.png`
- Create: `public/favicon-32.png`, `public/favicon.ico`
- Create: `public/robots.txt`

- [ ] **Step 1: Copy logos into Astro public directory**

Run from `portfolio/`:
```bash
mkdir -p public/assets/logo
cp ../business-ops/assets/logo/logo-square-navy.png public/assets/logo/
cp ../business-ops/assets/logo/logo-circle-safe-navy.png public/assets/logo/
cp ../business-ops/assets/logo/logo-transparent.png public/assets/logo/
cp ../business-ops/assets/logo/favicon-32.png public/
ls public/assets/logo/ public/
```
Expected output: lists logos in `public/assets/logo/` and `favicon-32.png` in `public/`.

- [ ] **Step 2: Generate favicon.ico from the 32px favicon**

Run:
```bash
python3 << 'EOF'
from PIL import Image
img = Image.open('public/favicon-32.png')
img.save('public/favicon.ico', format='ICO', sizes=[(32, 32), (16, 16)])
print(f"Created public/favicon.ico ({img.size})")
EOF
ls -la public/favicon.ico
```
Expected: `favicon.ico` created with size > 0.

- [ ] **Step 3: Create robots.txt**

Create `portfolio/public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://hoelscherautomation.com/sitemap-index.xml
```

- [ ] **Step 4: Verify favicons load on home page**

Run `npm run dev`. Open `http://localhost:4321`. Check browser tab — favicon should now appear. Inspect Nav and Footer — logo image should render (no broken-image icon). Inspect About section on home — large logo should render.

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add public/
git commit -m "feat: add logo assets, favicon, and robots.txt"
```

---

### Task 19: Generate Open Graph social-share image

**Files:**
- Create: `scripts/build-og-image.py`
- Create: `public/og-image.png`

- [ ] **Step 1: Create the OG image generation script**

Create `portfolio/scripts/build-og-image.py`:
```python
"""Generate the Open Graph social share image (1200×630).

Composites the navy logo with the company name and tagline.
Run once; commit the output. Re-run if the logo or tagline changes.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUTPUT = Path("public/og-image.png")
LOGO = Path("public/assets/logo/logo-square-navy.png")
WIDTH, HEIGHT = 1200, 630
NAVY = (10, 14, 26)  # bg-deep
ORANGE = (240, 166, 83)  # brand-orange-bright
TEXT = (232, 235, 242)  # text-primary
MUTED = (160, 170, 187)  # text-secondary

COMPANY = "Hoelscher Automation"
TAGLINE = "AI tools and automation for professional services teams"


def find_font(name_substrings: list[str], size: int) -> ImageFont.FreeTypeFont:
    """Find a system font by name fragment, fall back to default."""
    import subprocess
    try:
        out = subprocess.check_output(
            ["fc-list", ":", "file"], text=True, stderr=subprocess.DEVNULL
        )
        for line in out.splitlines():
            path = line.split(":")[0].strip()
            low = path.lower()
            if any(s.lower() in low for s in name_substrings):
                try:
                    return ImageFont.truetype(path, size)
                except Exception:
                    continue
    except Exception:
        pass
    return ImageFont.load_default()


def main() -> None:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), NAVY)
    draw = ImageDraw.Draw(canvas)

    # Subtle orange accent line
    draw.rectangle([(0, HEIGHT - 6), (WIDTH, HEIGHT)], fill=ORANGE)

    # Logo on left
    logo = Image.open(LOGO).convert("RGBA")
    logo.thumbnail((280, 280))
    canvas.paste(logo, (80, (HEIGHT - logo.height) // 2), logo)

    # Text on right
    text_x = 80 + 280 + 60

    company_font = find_font(["DejaVuSerif-Bold", "Georgia", "TimesNewRoman"], 64)
    tagline_font = find_font(["DejaVuSans", "Helvetica", "Arial"], 32)

    draw.text((text_x, 220), COMPANY, font=company_font, fill=TEXT)
    draw.text((text_x, 320), TAGLINE, font=tagline_font, fill=MUTED)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT, optimize=True)
    print(f"Wrote {OUTPUT} ({WIDTH}×{HEIGHT})")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the script to generate the OG image**

Run from `portfolio/`:
```bash
mkdir -p scripts
python3 scripts/build-og-image.py
ls -la public/og-image.png
```
Expected: `public/og-image.png` exists, > 10 KB.

- [ ] **Step 3: Verify the OG image visually**

Open `public/og-image.png` in an image viewer or with the Read tool. Verify:
- Navy background
- Logo on left, properly sized
- "Hoelscher Automation" in serif on right
- Tagline below in muted color
- Thin orange accent at bottom

If text rendering fails (system fonts unavailable), the script falls back to PIL's default font — image will be ugly but functional. Acceptable for v1.

- [ ] **Step 4: Commit the script and the generated image**

```bash
git add scripts/build-og-image.py public/og-image.png
git commit -m "feat: generate Open Graph social share image"
```

---

### Task 20: Add Cloudflare Web Analytics beacon

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/layouts/Base.astro`

**Prerequisite (manual, do this in Cloudflare dashboard before the code change):**

Open `dash.cloudflare.com` → Analytics → Web Analytics → "Add a site" → hostname `hoelscherautomation.com` → copy the beacon token (a long alphanumeric string). Save it to paste in Step 1 below.

- [ ] **Step 1: Update constants.ts with the beacon token**

Open `portfolio/src/lib/constants.ts`. Replace the `CF_ANALYTICS_TOKEN` line with the actual token from Cloudflare:
```ts
export const CF_ANALYTICS_TOKEN = 'PASTE_BEACON_TOKEN_HERE';
```

- [ ] **Step 2: Add beacon script to Base layout**

Edit `portfolio/src/layouts/Base.astro`. Add import to the frontmatter:
```astro
import { SITE_URL, CF_ANALYTICS_TOKEN } from '../lib/constants';
```

Add the beacon script just before the closing `</body>` tag (after the existing scroll-reveal `<script>`):
```astro
  {CF_ANALYTICS_TOKEN && (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${CF_ANALYTICS_TOKEN}"}`}
    ></script>
  )}
```

- [ ] **Step 3: Verify the beacon loads**

Run `npm run dev`. Open `localhost:4321`. Open browser DevTools → Network tab → reload page. Look for a request to `static.cloudflareinsights.com/beacon.min.js` — should be 200 OK.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.ts src/layouts/Base.astro
git commit -m "feat: add Cloudflare Web Analytics beacon"
```

---

## Phase 7 — Deployment Setup

### Task 21: Verify CNAME and configure Astro for GitHub Pages

**Files:**
- Move: `CNAME` from repo root → `public/CNAME` (Astro copies `public/` to `dist/`)

- [ ] **Step 1: Move CNAME into public/ so it survives Astro builds**

Run from `portfolio/`:
```bash
mv CNAME public/CNAME
cat public/CNAME
```
Expected: outputs `hoelscherautomation.com`.

- [ ] **Step 2: Build the site and verify CNAME ends up in dist/**

Run:
```bash
npm run build
ls dist/CNAME
cat dist/CNAME
```
Expected: `dist/CNAME` exists with content `hoelscherautomation.com`.

- [ ] **Step 3: Commit**

```bash
git add CNAME public/CNAME
git commit -m "chore: move CNAME into public/ so Astro preserves it across builds"
```

---

### Task 22: Create GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the deploy workflow**

Run from `portfolio/`:
```bash
mkdir -p .github/workflows
```

Create `portfolio/.github/workflows/deploy.yml`:
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
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Astro site
        run: npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow to build and deploy Astro site"
```

---

### Task 23: Rewrite README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README with build-and-deploy instructions**

Replace `portfolio/README.md` contents with:
```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README with build/deploy instructions for Astro site"
```

---

## Phase 8 — Final Verification

### Task 24: Full local build and smoke test

**Files:** none

- [ ] **Step 1: Clean build from scratch**

Run from `portfolio/`:
```bash
rm -rf dist .astro node_modules
npm install
npm run build
```
Expected: build completes with no errors. `dist/` directory populated.

- [ ] **Step 2: Verify all expected files exist in dist/**

Run:
```bash
ls dist/
test -f dist/index.html && echo "✓ index.html"
test -f dist/terms/index.html && echo "✓ terms"
test -f dist/privacy/index.html && echo "✓ privacy"
test -f dist/cortex/knowledge/index.html && echo "✓ cortex/knowledge"
test -f dist/CNAME && echo "✓ CNAME"
test -f dist/favicon.ico && echo "✓ favicon.ico"
test -f dist/og-image.png && echo "✓ og-image.png"
test -f dist/robots.txt && echo "✓ robots.txt"
test -f dist/sitemap-index.xml && echo "✓ sitemap"
test -f dist/assets/logo/logo-square-navy.png && echo "✓ logo asset"
```
Expected: all checks print `✓`.

- [ ] **Step 3: Preview the built site locally**

Run:
```bash
npm run preview
```
Open the printed URL (typically `http://localhost:4321`). Click through:
- Home page renders fully (Hero, Cortex section, Consulting, About, Contact, Footer)
- Click "Cortex" in nav → lands on Cortex Knowledge page
- Click "Terms" in footer → lands on Terms page
- Click "Privacy" in footer → lands on Privacy page
- Click "Book a call" → opens scheduling link in new tab
- Click LinkedIn icon → opens LinkedIn in new tab
- Click GitHub icon → opens GitHub org in new tab
- Resize browser to mobile width — Nav collapses to hamburger, sections stack
- All images render (logo, OG preview if testing share)
- No console errors in DevTools

Stop preview server.

- [ ] **Step 4: Run Lighthouse against the built site**

In a fresh `npm run preview` session, open Chrome DevTools → Lighthouse tab → run audit on Performance, Accessibility, Best Practices, SEO (desktop mode).

Expected: all four ≥ 90 (we're targeting 95+ but 90 is the floor). If any drops below 90, capture which audits failed for follow-up.

Stop preview server.

- [ ] **Step 5: No commit (verification only)**

If everything passes, proceed to Task 25. If anything fails, fix and re-run this task.

---

### Task 25: Push branch and open PR

**Files:** none

- [ ] **Step 1: Push the rebuild-astro branch**

Run from `portfolio/`:
```bash
git push -u origin rebuild-astro
```
Expected: branch pushed, GitHub returns a URL to create a PR.

- [ ] **Step 2: Open PR via `gh` CLI**

Run:
```bash
gh pr create --title "Rebuild website on Astro + Tailwind" --body "$(cat <<'EOF'
## Summary

- Full website rebuild from vanilla HTML to Astro 5 + Tailwind 3
- New brand palette (dark navy + orange) replaces previous emerald-green portfolio theme
- Repositions Cortex as a platform brand with Cortex Knowledge as the first product
- Adds dedicated Terms of Use and Privacy Policy pages
- Adds Cloudflare Web Analytics (cookieless)
- Adds Open Graph social-share image
- Replaces contact-form-only flow with paired "Book a call" + "Send a message" paths

## Routes

- `/` — home (single-page scroll with Cortex overview, Consulting, About, Contact)
- `/cortex/knowledge` — Cortex Knowledge product detail
- `/terms` — Terms of Use
- `/privacy` — Privacy Policy

## Deployment changes required

Before merging, switch GH Pages Source in repo Settings:
- From: **Deploy from a branch** (main /)
- To: **GitHub Actions**

After merge, the deploy workflow runs automatically. First deploy takes ~2 min.

## Test plan

- [ ] All four routes load on `https://hoelscherautomation.com` post-deploy
- [ ] Anchor links work (`#consulting`, `#about`, `#contact`)
- [ ] Booking link opens Google Calendar scheduling page
- [ ] Contact form successfully submits to Formspree
- [ ] Cloudflare Analytics dashboard shows traffic within 24h
- [ ] Mobile rendering correct on real device
- [ ] OG preview renders correctly when URL is pasted into Slack/iMessage

## Reference

- Spec: `docs/superpowers/specs/2026-05-16-website-rework-design.md`
- Plan: `docs/superpowers/plans/2026-05-16-website-rework.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
Expected: PR created, URL returned.

- [ ] **Step 3: Capture PR URL**

The PR URL is returned by the previous command. Save it for the next task's verification.

---

### Task 26: Cutover — switch Pages source, merge, verify

**Files:** none (changes happen in GitHub UI + post-merge verification)

- [ ] **Step 1: Change GitHub Pages source setting**

In a browser, go to: `https://github.com/HoelscherAutomation/portfolio/settings/pages`

Under "Build and deployment":
- **Source:** change from "Deploy from a branch" to **"GitHub Actions"**
- Save (no separate button — change is immediate)

The existing site continues to serve from the previous deploy until a new artifact is published.

- [ ] **Step 2: Merge the PR**

Either via `gh pr merge --squash <PR_NUMBER>` or in the GitHub UI. Use squash merge to keep main history clean.

- [ ] **Step 3: Watch the deploy workflow**

Go to: `https://github.com/HoelscherAutomation/portfolio/actions`

Watch the most recent "Deploy Astro to GitHub Pages" workflow. Build job (~30s) → Deploy job (~30s). Total ~1–2 min.

If the workflow fails: open the failed step's logs, fix the issue (likely a TypeScript or Tailwind config error), push the fix to main, workflow re-runs.

- [ ] **Step 4: Verify the live site (after workflow succeeds)**

Wait 30 seconds for Pages CDN to propagate, then in a private/incognito browser window check:

- `https://hoelscherautomation.com` — new home page loads (not vanilla)
- `https://hoelscherautomation.com/cortex/knowledge` — Cortex page loads
- `https://hoelscherautomation.com/terms` — Terms page loads
- `https://hoelscherautomation.com/privacy` — Privacy page loads
- Click "Book a call" — opens scheduling link in new tab
- Click "Cortex" in nav — lands on Cortex Knowledge page
- Click footer LinkedIn / GitHub — opens in new tab
- Scroll through home — anchor links to `#consulting`, `#about`, `#contact` work
- Mobile rendering OK (resize browser narrow)

- [ ] **Step 5: Test the contact form with a real submission**

Submit the contact form on `https://hoelscherautomation.com/#contact` with a real test message (e.g., "Site cutover test from Jordan — please ignore"). Verify:
- Success message appears
- Email arrives at `consulting@hoelscherautomation.com` within 1 minute
- Formspree dashboard (formspree.io) shows the submission

- [ ] **Step 6: Paste the URL into a chat platform to verify OG image**

Open Slack, Discord, or iMessage. Paste `https://hoelscherautomation.com`. Wait ~3 seconds for unfurl. Verify the OG preview card shows:
- Navy background
- Logo
- "Hoelscher Automation" text
- Tagline

If unfurl fails: clear cache by appending `?_=1` to URL and re-pasting.

- [ ] **Step 7: Verify Cloudflare Analytics is receiving data**

Open `dash.cloudflare.com` → Analytics → Web Analytics → hoelscherautomation.com. Within 24 hours, the dashboard should show pageviews. If after 48 hours there's nothing, recheck the `CF_ANALYTICS_TOKEN` in `src/lib/constants.ts` against the dashboard.

- [ ] **Step 8: Delete the rebuild-astro branch**

Once everything is verified working, clean up:
```bash
git checkout main
git pull
git branch -d rebuild-astro
git push origin --delete rebuild-astro
```

- [ ] **Step 9: Done**

Site is live with the new design. Cutover complete. Next steps (out of scope for this plan):
- Wordsmith hero copy if anything feels off after seeing it live
- Consider future Cortex tool pages as they exist
- Consider adding case studies once first paying engagement is documentable
- Revisit weekend slot availability in 3 months per scheduling-setup runbook

---

## Self-Review

**1. Spec coverage** — every spec section has at least one task:

| Spec section | Implementing task(s) |
|---|---|
| §3 Sitemap & nav | Tasks 7, 8, 15, 16, 17 |
| §4 Visual system (colors, type, components) | Tasks 3, 4, 5, 6 |
| §5 Project structure | Tasks 1, 2, 3, 4 |
| §6 Home page content | Tasks 9, 10, 11, 12, 13 |
| §6 Cortex Knowledge content | Tasks 14, 15 |
| §6 Terms + Privacy content | Tasks 16, 17 |
| §7 Integrations — Formspree, Booking, Fonts | Tasks 4, 6, 13 |
| §7 Cloudflare Analytics | Task 20 |
| §7 OG image | Task 19 |
| §7 Social links | Task 8 |
| §8 GH Actions workflow | Task 22 |
| §8 CNAME preservation | Task 21 |
| §8 Cutover sequence | Tasks 25, 26 |
| §8 Post-cutover verification | Task 26 |

No spec section is unimplemented.

**2. Placeholder scan** — no "TBD", "TODO", or "fill in later" placeholders. The only intentional placeholder is `PASTE_BEACON_TOKEN_HERE` in Task 20 Step 1, which is explicitly a runtime configuration value sourced from the Cloudflare dashboard (covered by the prerequisite instruction).

**3. Type consistency** — checked component prop names, file paths, and constant identifiers across all tasks:

- `BookCallButton` accepts `variant` / `size` / `label` — consistent across uses in Tasks 7, 8, 9, 13
- `Card` accepts `href` / `label` / `title` / `description` — consistent across uses in Tasks 6, 10, 11
- `Button` accepts `variant` / `size` / `href` / `target` / `rel` / `type` / `class` — consistent across uses
- `Terminal.Line` interface uses `prompt` / `ts` / `text` / `type` — terminal lines in Task 15 use the same field names
- Constants in `src/lib/constants.ts` (BOOKING_URL, FORMSPREE_ENDPOINT, etc.) — consistent across all consumers

No drift detected.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-16-website-rework.md`.**

## Two execution options

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
