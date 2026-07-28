# Family Films Dedicated Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the $99 family video product to a dedicated parent-facing page at `/family-films` and slim the homepage family block to a pointer.

**Architecture:** One new Astro page on the shared `Base` layout reusing `FamilyIntakeForm` unchanged; the homepage `VideoSection` family sub-block shrinks to a label + thumbnail + link. No backend, worker, or dependency changes.

**Tech Stack:** Astro 5 + Tailwind tokens, existing `reveal` scroll animation (global in Base/global.css), Playwright via node script (`playwright-core` at `/home/t1/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core`), Lighthouse with `CHROME_PATH=/home/t1/.cache/ms-playwright/chromium-1217/chrome-linux/chrome`.

**Spec:** `docs/superpowers/specs/2026-07-27-family-films-page-design.md`

## Global Constraints

- No em dashes or en dashes in any copy on the new page or in changed homepage copy (homepage total en dash count stays exactly 2, both pre-existing in consulting copy).
- Turnaround promise: "3 to 5 days". Revision promise: "Not happy with a scene? We regenerate it once, free."
- `FamilyIntakeForm.astro` and the worker are NOT modified.
- Assets referenced as-is: `/videos/demo-family.mp4`, `/videos/poster-family.jpg`, `/videos/family-photo-{1..6}.jpg`.
- Video element keeps `controls playsinline preload="none"` + poster.
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- Push to `main` only on Jordan's explicit go.

---

### Task 1: Create `/family-films` page

**Files:**
- Create: `src/pages/family-films.astro`

**Interfaces:**
- Consumes: `Base.astro` layout (`title`, `description`, `path` props), `SectionLabel.astro`, `FamilyIntakeForm.astro` (rendered as-is), global `.reveal`.
- Produces: page at `/family-films` containing `id="family-player"`, `id="family-pricing"`, `id="family-form"` (from the form component), and an FAQ. Task 2 removes these ids from the homepage; Task 3's checks target them on this page.

- [ ] **Step 1: Create the page**

`src/pages/family-films.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import SectionLabel from '../components/SectionLabel.astro';
import FamilyIntakeForm from '../components/FamilyIntakeForm.astro';

const familyPhotos = [
  { src: '/videos/family-photo-1.jpg', alt: 'Example photo: close up of a boy indoors by a window' },
  { src: '/videos/family-photo-2.jpg', alt: 'Example photo: boy grinning in a kitchen' },
  { src: '/videos/family-photo-3.jpg', alt: 'Example photo: full length shot of a boy in a backyard with a soccer ball' },
  { src: '/videos/family-photo-4.jpg', alt: 'Example photo: boy reading on a couch in lamp light' },
  { src: '/videos/family-photo-5.jpg', alt: 'Example photo: boy at a park on a cloudy day' },
  { src: '/videos/family-photo-6.jpg', alt: 'Example photo: boy running outside, slightly blurry' },
];

const steps = [
  {
    num: '01',
    title: 'Send us your photos',
    body: '10 to 15 everyday photos of your kid. Different angles, different lighting, close up and far away. Phone photos are perfect, nothing fancy.',
  },
  {
    num: '02',
    title: 'We build their adventure',
    body: 'An original story in an original world. Your kid picks the theme, and their favorite color, best friend, or beloved pet can make an appearance.',
  },
  {
    num: '03',
    title: 'Get their film in 3 to 5 days',
    body: 'A short film delivered ready to watch, rewatch, and share with the grandparents.',
  },
];

const faqs = [
  {
    q: 'What photos work best?',
    a: 'Variety beats quality. A close up by a window, a full body shot in the yard, one in dim light, one mid run. The more angles and lighting we see, the better your kid looks in every scene.',
  },
  {
    q: "Are my kid's photos safe?",
    a: 'Your photos are used only to make your film. They are never used for marketing, never used to train anything, and deleted on request.',
  },
  {
    q: 'Is this made with AI?',
    a: 'Yes. That is how one minute of cinema costs $99 and not $10,000. The example kid on this page is AI generated, so no real child appears here.',
  },
  {
    q: 'How long does it take, and what if something looks off?',
    a: 'Your film arrives in 3 to 5 days. If a scene does not look right, we regenerate it once, free.',
  },
];
---
<Base
  title="Personalized Adventure Films for Kids | Hoelscher Automation"
  description="Send 10 to 15 everyday photos and get a short film where your kid is the hero. Dragons, space, enchanted forests. $99 launch price, delivered in 3 to 5 days."
  path="/family-films"
>
  <main class="max-w-3xl mx-auto px-8 py-20">
    <div class="reveal">
      <SectionLabel>Family films</SectionLabel>
      <h1 class="mt-4 font-display text-4xl md:text-5xl font-semibold text-text-primary leading-tight">
        Your kid. The hero of their own adventure.
      </h1>
      <p class="mt-6 text-lg text-text-secondary leading-relaxed">
        We turn everyday photos into a short film where your child rides dragons, explores space, or walks an enchanted forest.
      </p>

      <video
        id="family-player"
        class="mt-8 w-full rounded-lg border border-border-subtle"
        controls
        playsinline
        preload="none"
        poster="/videos/poster-family.jpg"
        src="/videos/demo-family.mp4"
        aria-label="Demo video: a boy's dragon adventure, generated from everyday photos"
      ></video>
      <p class="mt-3 text-sm text-text-muted">
        This whole film was made from a handful of ordinary photos. Original story, original world.
      </p>
    </div>

    <div class="reveal mt-20">
      <SectionLabel>How it works</SectionLabel>
      <div class="mt-6 space-y-10">
        {steps.map((s) => (
          <div>
            <div class="font-mono text-2xl text-brand-orange-bright mb-2">{s.num}</div>
            <h2 class="font-display text-xl font-semibold text-text-primary mb-1">{s.title}</h2>
            <p class="text-text-secondary leading-relaxed">{s.body}</p>
            {s.num === '01' && (
              <>
                <div class="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {familyPhotos.map((p) => (
                    <img
                      src={p.src}
                      alt={p.alt}
                      loading="lazy"
                      width="480"
                      height="640"
                      class="rounded border border-border-subtle aspect-[3/4] object-cover w-full"
                    />
                  ))}
                </div>
                <p class="mt-2 text-xs text-text-muted">
                  The boy in these examples is AI generated, so no real child appears on this page. Your family's photos are used only for your film.
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>

    <div class="reveal mt-20">
      <SectionLabel>Pricing</SectionLabel>
      <div id="family-pricing" class="mt-6 flex items-baseline gap-3 flex-wrap">
        <span class="text-lg text-text-muted line-through"><span class="sr-only">Regular price </span>$199</span>
        <span class="font-display text-3xl font-semibold text-brand-orange-bright">$99</span>
        <span class="text-sm font-medium uppercase tracking-wide text-brand-orange-bright">launch price</span>
      </div>
      <p class="mt-2 text-text-secondary leading-relaxed">
        For a one minute personalized film. Want something longer or more elaborate? Tell us below and we will quote it.
      </p>
      <p class="mt-1 text-text-secondary leading-relaxed">
        Not happy with a scene? We regenerate it once, free.
      </p>
    </div>

    <div class="reveal mt-16">
      <FamilyIntakeForm />
    </div>

    <div class="reveal mt-20">
      <SectionLabel>Questions</SectionLabel>
      <div class="mt-6 space-y-8">
        {faqs.map((f) => (
          <div>
            <h3 class="font-display text-lg font-semibold text-text-primary mb-1">{f.q}</h3>
            <p class="text-text-secondary leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  </main>
</Base>
```

- [ ] **Step 2: Build and grep**

```bash
cd /home/t1/hoelscher-automation/portfolio && npm run build
grep -c 'id="family-form"' dist/family-films/index.html
grep -c 'id="family-pricing"' dist/family-films/index.html
grep -c 'regenerate it once, free' dist/family-films/index.html
grep -c '3 to 5 days' dist/family-films/index.html
grep -c $'—' dist/family-films/index.html || true; grep -c $'–' dist/family-films/index.html || true
```

Expected: form 1, pricing 1, revision line ≥1, "3 to 5 days" ≥2 (step 03 + FAQ), both dash greps 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/family-films.astro
git commit -m "feat: add dedicated family films page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Slim the homepage family block to a pointer

**Files:**
- Modify: `src/components/VideoSection.astro`

**Interfaces:**
- Consumes: `/family-films` page from Task 1; `/videos/poster-family.jpg`.
- Produces: homepage without `#family-player` / `#family-pricing` / `#family-form`, with an `a[href="/family-films"]` pointer. Task 3 asserts exactly this.

- [ ] **Step 1: Remove the moved content**

In `src/components/VideoSection.astro`:
1. Delete the `familyPhotos` array from the frontmatter.
2. Delete the `import FamilyIntakeForm from './FamilyIntakeForm.astro';` line.
3. Replace the entire family sub-block `<div class="reveal mt-20 max-w-3xl">...</div>` (the one opening with `<SectionLabel>For families</SectionLabel>` and ending after `<FamilyIntakeForm />` and the closing caption markup) with:

```astro
    <div class="reveal mt-20 max-w-3xl">
      <SectionLabel>For families</SectionLabel>
      <h3 class="mt-4 font-display text-2xl md:text-3xl font-semibold text-text-primary">
        Everyday photos in. One adventure out.
      </h3>
      <p class="mt-4 text-text-secondary leading-relaxed">
        Personalized adventure films for kids, made from your photos.
      </p>
      <a href="/family-films" class="block mt-6 max-w-md group">
        <img
          src="/videos/poster-family.jpg"
          alt="A boy discovering a glowing dragon egg, a scene from our family demo film"
          loading="lazy"
          width="1280"
          height="720"
          class="rounded-lg border border-border-subtle group-hover:border-brand-orange transition-colors duration-default w-full"
        />
      </a>
      <a href="/family-films" class="inline-block mt-4 text-sm font-medium text-brand-orange-bright hover:text-brand-orange transition-colors duration-default">
        See family films →
      </a>
    </div>
```

Everything else in the file (organizations block, tabs, script, "Where it fits") stays byte-identical.

- [ ] **Step 2: Build, grep, test**

```bash
npm run build
grep -c 'id="family-player"' dist/index.html || true
grep -c 'id="family-form"' dist/index.html || true
grep -c 'href="/family-films"' dist/index.html
grep -c 'id="demo-player"' dist/index.html
grep -c $'–' dist/index.html
npm test
```

Expected: family-player 0, family-form 0, family-films link 2, demo-player 1, en dash exactly 2, vitest 16/16.

- [ ] **Step 3: Commit**

```bash
git add src/components/VideoSection.astro
git commit -m "feat: slim homepage family block to pointer at /family-films

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Browser + Lighthouse verification

**Files:**
- Artifacts: `docs/superpowers/plans/artifacts/lighthouse-family-films-{home,page}-desktop.json`

**Interfaces:**
- Consumes: ids from Tasks 1-2; node playwright-core pattern from the scratchpad scripts.

- [ ] **Step 1: Serve**

```bash
cd /home/t1/hoelscher-automation/portfolio && npm run build
(nohup npx astro preview --port 4321 > /tmp/preview.log 2>&1 & disown); until curl -s -o /dev/null http://localhost:4321/; do sleep 1; done
```

- [ ] **Step 2: Playwright checks (node script, stubbed endpoint)**

Checks against http://localhost:4321:
1. `/family-films`: form present; fill all fields; submit with `page.route` stub on `https://api.hoelscherautomation.com/contact` returning `{"ok":true}`; assert payload has `type:"family"`, `childAge` numeric, exact theme string; success message with `text-ok`.
2. `/family-films`: `#family-player` has `preload="none"` and poster set.
3. `/`: no `#family-form`, no `#family-player`; `a[href="/family-films"]` present; clicking it lands on the new page (h1 contains "hero of their own adventure").
4. `/`: language tabs still swap `#demo-player` src to `demo-uz.mp4`.

- [ ] **Step 3: Lighthouse both pages**

```bash
CHROME_PATH=/home/t1/.cache/ms-playwright/chromium-1217/chrome-linux/chrome npx lighthouse http://localhost:4321 --preset=desktop --output=json --output-path=docs/superpowers/plans/artifacts/lighthouse-family-films-home-desktop.json --chrome-flags="--headless --no-sandbox" --quiet
CHROME_PATH=/home/t1/.cache/ms-playwright/chromium-1217/chrome-linux/chrome npx lighthouse http://localhost:4321/family-films --preset=desktop --output=json --output-path=docs/superpowers/plans/artifacts/lighthouse-family-films-page-desktop.json --chrome-flags="--headless --no-sandbox" --quiet
node -e "for (const f of ['home','page']) { const r=require('./docs/superpowers/plans/artifacts/lighthouse-family-films-'+f+'-desktop.json'); console.log(f, Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,v.score]))) }"
```

Expected: both pages ≥0.97 performance, 1.0 accessibility, 1.0 best-practices, 1.0 SEO.

- [ ] **Step 4: Kill preview, commit artifacts**

```bash
pkill -f "astro preview"
```

Then separately: `git add docs/superpowers/plans/artifacts/ && git commit` with message `test: verify Lighthouse gates for family films page` + co-author footer.

---

### Task 4: Gated ship

- [ ] **Step 1: Jordan's go, then push**

```bash
cd /home/t1/hoelscher-automation/portfolio && git push origin main
```

- [ ] **Step 2: Watch deploy, spot-check production**

```bash
gh run watch $(gh run list --limit 1 --json databaseId -q '.[0].databaseId') --exit-status
curl -s https://hoelscherautomation.com/family-films/ | grep -c 'id="family-form"'
curl -s https://hoelscherautomation.com/ | grep -c 'href="/family-films"'
curl -s https://hoelscherautomation.com/ | grep -c 'id="family-form"' || true
```

Expected: 1, 2, 0. Optionally one live form submission from the production page (same node script pattern, real submit, clearly-labeled test data) if Jordan wants a final end-to-end proof.
