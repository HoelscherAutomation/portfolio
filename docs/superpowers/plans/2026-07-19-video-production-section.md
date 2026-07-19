# Video Production Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Video Production section to the hoelscherautomation.com landing page with a bilingual (Español / Oʻzbekcha) demo player, three use-case blurbs, and a nav link.

**Architecture:** One new Astro component (`VideoSection.astro`) inserted into the existing single-page landing flow, backed by two re-encoded demo mp4s served same-origin from `public/videos/`. The player is a plain `<video>` with `preload="none"` and a poster; the language toggle is a small vanilla JS enhancement inside the component. No new dependencies, no new particle formations.

**Tech Stack:** Astro 5, Tailwind (design tokens from `tailwind.config.mjs`), vanilla TS/JS, ffmpeg (asset prep), GitHub Pages deploy.

**Spec:** `docs/superpowers/specs/2026-07-19-video-production-section-design.md`

## Global Constraints

- Copy rules: **no em dashes or en dashes** in any user-visible site copy; plain human tone, no AI-tell phrasing.
- Demo videos: 720p H.264 + AAC, `-movflags +faststart`, each file **≤7MB**.
- Video element must have `preload="none"`, a `poster`, `controls`, and `playsinline` so nothing beyond the poster JPEG loads before the visitor presses play (protects Lighthouse scores).
- New section uses `data-scene="grid"` (existing formation; do NOT add formations).
- Follow existing component patterns: `SectionLabel`, `reveal` class for scroll animation (handled globally by `Base.astro`), Tailwind token classes (`text-text-primary`, `brand-orange-bright`, `bg-bg-deep/40`, `max-w-container`, `duration-default`).
- Repo root for all paths: `/home/t1/hoelscher-automation/portfolio`.

---

### Task 1: Encode and commit demo assets

**Files:**
- Create: `public/videos/demo-es.mp4`
- Create: `public/videos/demo-uz.mp4`
- Create: `public/videos/poster-es.jpg`
- Create: `public/videos/poster-uz.jpg`

**Interfaces:**
- Consumes: source videos in `/home/t1/hoelscher-automation/business-ops/clients/imagination-library-video/assets/` (`imagination-spanish-demo-v3-calm.mp4`, `imagination-uzbek-demo-r2.mp4`). Both are already 1280x720 H.264/AAC, 70s and 80s, ~12MB each.
- Produces: the four asset paths above, referenced verbatim by Task 2's component (`/videos/demo-es.mp4`, `/videos/demo-uz.mp4`, `/videos/poster-es.jpg`, `/videos/poster-uz.jpg`).

- [ ] **Step 1: Re-encode both videos**

```bash
cd /home/t1/hoelscher-automation/portfolio
mkdir -p public/videos
SRC=/home/t1/hoelscher-automation/business-ops/clients/imagination-library-video/assets
ffmpeg -y -i "$SRC/imagination-spanish-demo-v3-calm.mp4" \
  -c:v libx264 -crf 26 -preset medium -c:a aac -b:a 96k \
  -movflags +faststart public/videos/demo-es.mp4
ffmpeg -y -i "$SRC/imagination-uzbek-demo-r2.mp4" \
  -c:v libx264 -crf 26 -preset medium -c:a aac -b:a 96k \
  -movflags +faststart public/videos/demo-uz.mp4
```

Expected: both commands finish without error (a few minutes each on the Pi; these are short single-pass re-encodes, not offload candidates).

- [ ] **Step 2: Verify size and integrity**

```bash
du -h public/videos/demo-es.mp4 public/videos/demo-uz.mp4
ffprobe -v error -show_entries format=duration -of csv public/videos/demo-es.mp4
ffprobe -v error -show_entries format=duration -of csv public/videos/demo-uz.mp4
```

Expected: each mp4 ≤7MB; durations ~69.5s and ~80.5s (matching sources). If a file exceeds 7MB, re-run its ffmpeg command with `-crf 28` and re-check.

- [ ] **Step 3: Extract poster frames**

Pick a visually strong scene frame (not frame 0, which may be black or a fade-in):

```bash
ffmpeg -y -ss 12 -i public/videos/demo-es.mp4 -frames:v 1 -q:v 3 public/videos/poster-es.jpg
ffmpeg -y -ss 12 -i public/videos/demo-uz.mp4 -frames:v 1 -q:v 3 public/videos/poster-uz.jpg
```

Then eyeball both JPEGs (Read tool renders images). If a poster is a dull or transitional frame, try another timestamp (e.g. `-ss 20` or `-ss 35`) until the frame shows a clear illustrated scene (the lion or the mouse, not a title card or mid-dissolve blur).

- [ ] **Step 4: Commit**

```bash
git add public/videos/
git commit -m "feat: add bilingual Lion and the Mouse demo videos and posters

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: VideoSection component and landing page wiring

**Files:**
- Create: `src/components/VideoSection.astro`
- Modify: `src/pages/index.astro` (import at top; render between `<ConsultingSection />` and `<AboutSection />`)

**Interfaces:**
- Consumes: asset paths from Task 1; `SectionLabel.astro` (default slot); global `.reveal` scroll animation from `Base.astro`; particle formation name `grid` (already defined in `src/scripts/formations.ts`).
- Produces: `<section id="video" data-scene="grid">` containing `<video id="demo-player">` and two `button.demo-lang` elements with `data-src`/`data-poster` attributes. Task 4's verification steps target these ids/classes verbatim.

- [ ] **Step 1: Create `src/components/VideoSection.astro`**

```astro
---
import SectionLabel from './SectionLabel.astro';

const useCases = [
  {
    num: '01',
    title: 'Libraries & Nonprofits',
    body: 'Bilingual read-along and educational story videos that bring your programs to families in their own language.',
  },
  {
    num: '02',
    title: 'Businesses',
    body: 'Explainer and promo videos that show what you do without a film crew or a studio budget.',
  },
  {
    num: '03',
    title: 'Families',
    body: 'Personalized story videos for birthdays and special occasions, starring the people who matter.',
  },
];
---
<section id="video" class="bg-bg/85 border-y border-border-subtle" data-scene="grid">
  <div class="max-w-container mx-auto px-8 py-24">
    <div class="reveal max-w-2xl">
      <SectionLabel>Video Production</SectionLabel>
      <h2 class="mt-4 font-display text-3xl md:text-4xl font-semibold text-text-primary">
        Story videos, produced with AI.
      </h2>
      <p class="mt-6 text-lg text-text-secondary leading-relaxed">
        Narrated, animated video in any language, produced end to end with an AI pipeline we built and run ourselves. From bilingual read-alongs for libraries to explainers for businesses to personalized stories for families.
      </p>
    </div>

    <div class="reveal mt-12 max-w-3xl">
      <div class="flex gap-2 mb-4" role="group" aria-label="Demo language">
        <button
          type="button"
          class="demo-lang px-4 py-1.5 text-sm font-medium rounded border transition-colors duration-default border-brand-orange-bright text-brand-orange-bright"
          data-src="/videos/demo-es.mp4"
          data-poster="/videos/poster-es.jpg"
          aria-pressed="true"
        >
          Español
        </button>
        <button
          type="button"
          class="demo-lang px-4 py-1.5 text-sm font-medium rounded border transition-colors duration-default border-border-subtle text-text-secondary hover:text-text-primary"
          data-src="/videos/demo-uz.mp4"
          data-poster="/videos/poster-uz.jpg"
          aria-pressed="false"
        >
          Oʻzbekcha
        </button>
      </div>

      <video
        id="demo-player"
        class="w-full rounded-lg border border-border-subtle"
        controls
        playsinline
        preload="none"
        poster="/videos/poster-es.jpg"
        src="/videos/demo-es.mp4"
        aria-label="Demo video: The Lion and the Mouse, AI narrated story"
      ></video>

      <p class="mt-3 text-sm text-text-muted">
        Aesop's "The Lion and the Mouse". Original illustrations, AI narration and animation, produced in Spanish and Uzbek from the same pipeline.
      </p>
    </div>

    <div class="reveal mt-20">
      <SectionLabel>Where it fits</SectionLabel>
      <div class="mt-6 grid md:grid-cols-3 gap-6">
        {useCases.map((uc) => (
          <div>
            <div class="font-mono text-2xl text-brand-orange-bright mb-2">{uc.num}</div>
            <h3 class="font-display text-lg font-semibold text-text-primary mb-1">{uc.title}</h3>
            <p class="text-sm text-text-secondary leading-relaxed">{uc.body}</p>
            <a href="#contact" class="block mt-3 text-xs font-medium text-brand-orange-bright hover:text-brand-orange transition-colors duration-default">
              Discuss this →
            </a>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

<script>
  const player = document.getElementById('demo-player') as HTMLVideoElement | null;
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.demo-lang'));

  const ACTIVE = ['border-brand-orange-bright', 'text-brand-orange-bright'];
  const INACTIVE = ['border-border-subtle', 'text-text-secondary', 'hover:text-text-primary'];

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (!player || tab.getAttribute('aria-pressed') === 'true') return;
      player.pause();
      player.src = tab.dataset.src ?? '';
      player.poster = tab.dataset.poster ?? '';
      player.load();
      tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute('aria-pressed', String(active));
        t.classList.remove(...(active ? INACTIVE : ACTIVE));
        t.classList.add(...(active ? ACTIVE : INACTIVE));
      });
    });
  });
</script>
```

Notes for the implementer:
- The caption and pitch copy above is final approved copy. Do not "improve" it. It intentionally contains no em or en dashes.
- `player.load()` after swapping `src` resets the element to poster state; combined with `preload="none"` no video bytes download until play is pressed.
- Without JS the Spanish demo still works because `src`/`poster` are static attributes.

- [ ] **Step 2: Wire into `src/pages/index.astro`**

Add the import after the `ConsultingSection` import:

```astro
import ConsultingSection from '../components/ConsultingSection.astro';
import VideoSection from '../components/VideoSection.astro';
```

Render it between consulting and about:

```astro
  <ConsultingSection />
  <VideoSection />
  <AboutSection />
```

- [ ] **Step 3: Build and verify output**

```bash
cd /home/t1/hoelscher-automation/portfolio
npm run build
grep -c 'id="video"' dist/index.html
grep -c 'preload="none"' dist/index.html
grep -c 'demo-uz.mp4' dist/index.html
```

Expected: build succeeds; each grep prints `1` or more. Also confirm section order in the built page:

```bash
grep -o 'id="consulting"\|id="video"\|id="about"' dist/index.html
```

Expected output order: `id="consulting"`, `id="video"`, `id="about"`.

- [ ] **Step 4: Run unit tests**

```bash
npm test
```

Expected: all existing vitest tests pass (formations unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/components/VideoSection.astro src/pages/index.astro
git commit -m "feat: add video production section with bilingual demo player

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Nav links

**Files:**
- Modify: `src/components/Nav.astro` (desktop menu ~line 14, mobile menu ~line 32)

**Interfaces:**
- Consumes: `#video` section id from Task 2.
- Produces: "Video" links in both menus.

- [ ] **Step 1: Add desktop link**

In the `hidden md:flex` div, after the Consulting link:

```astro
      <a href="/#consulting" class="text-text-secondary hover:text-text-primary transition-colors duration-default">Consulting</a>
      <a href="/#video" class="text-text-secondary hover:text-text-primary transition-colors duration-default">Video</a>
      <a href="/#about" class="text-text-secondary hover:text-text-primary transition-colors duration-default">About</a>
```

- [ ] **Step 2: Add mobile link**

In the `#nav-mobile` div, after the Consulting link:

```astro
      <a href="/#consulting" class="text-text-secondary hover:text-text-primary">Consulting</a>
      <a href="/#video" class="text-text-secondary hover:text-text-primary">Video</a>
      <a href="/#about" class="text-text-secondary hover:text-text-primary">About</a>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
grep -c 'href="/#video"' dist/index.html
```

Expected: `2` (desktop + mobile).

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.astro
git commit -m "feat: add Video link to nav menus

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Browser and Lighthouse verification

**Files:**
- None modified (verification only; artifacts may be written to `docs/superpowers/plans/artifacts/`)

**Interfaces:**
- Consumes: `#video`, `#demo-player`, `.demo-lang` from Task 2; nav links from Task 3.
- Produces: verified build ready to push; Lighthouse artifacts.

- [ ] **Step 1: Serve the built site**

```bash
cd /home/t1/hoelscher-automation/portfolio
npm run build
npx astro preview --port 4321 &
```

Expected: preview server on http://localhost:4321.

- [ ] **Step 2: Playwright checks**

Using the Playwright MCP browser tools against http://localhost:4321:

1. Navigate to `/#video`; snapshot shows the Video Production section with the Español tab pressed (`aria-pressed="true"`).
2. Evaluate `document.getElementById('demo-player').getAttribute('preload')` → `"none"`; `.currentSrc` or `src` ends with `demo-es.mp4`.
3. Click the Oʻzbekcha tab; evaluate `document.getElementById('demo-player').src` → ends with `demo-uz.mp4`, poster ends with `poster-uz.jpg`, Uzbek button has `aria-pressed="true"`, Spanish `"false"`.
4. Evaluate `document.getElementById('demo-player').paused` → `true` after the swap.
5. Keyboard: focus a tab and press Enter; it activates (native button behavior).
6. Click play on the video; confirm playback starts (`paused` → `false`), then pause.
7. Click the nav "Video" link from the top of the page; page scrolls to the section.

- [ ] **Step 3: Lighthouse gates**

```bash
npx lighthouse http://localhost:4321 --preset=desktop \
  --output=json --output-path=docs/superpowers/plans/artifacts/lighthouse-video-desktop.json \
  --chrome-flags="--headless" --quiet
node -e "const r=require('./docs/superpowers/plans/artifacts/lighthouse-video-desktop.json'); console.log(Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,v.score])))"
```

Expected: scores match the pre-change baseline (performance ~1.00, accessibility ≥0.99, SEO 1.0 per the particle-field launch). The video must not appear in LCP or network traces beyond its poster JPEG. If performance drops, confirm `preload="none"` survived the build and the poster JPEGs are reasonably sized (<200KB; re-extract with `-q:v 5` if larger).

- [ ] **Step 4: Kill preview, commit artifacts**

```bash
kill %1
git add docs/superpowers/plans/artifacts/
git commit -m "test: verify Lighthouse gates hold with video section

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Ship**

Confirm with Jordan before pushing (push to `main` triggers the GitHub Pages deploy):

```bash
git push origin main
```

Then spot-check https://hoelscherautomation.com/#video once the deploy workflow finishes.
