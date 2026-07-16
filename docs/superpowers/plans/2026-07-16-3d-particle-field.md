# 3D Particle Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scroll-driven Three.js particle background to the hoelscherautomation.com landing page that morphs scattered → grid → lattice → network as the visitor scrolls, without hurting performance or accessibility.

**Architecture:** One pure TypeScript module (`formations.ts`, unit-tested) generates particle formations and maps scroll position to a morph state. One runtime module (`particle-field.ts`) owns Three.js and the DOM: it lazy-initializes after browser idle, reads `[data-scene]` sections to build its timeline, and degrades silently on any failure. `index.astro` opts in explicitly; section components get `data-scene` attributes and translucent backgrounds so the fixed canvas shows through.

**Tech Stack:** Astro 5, Tailwind 3, Three.js (new runtime dep), Vitest (new dev dep), Playwright MCP + Lighthouse for verification.

**Spec:** `docs/superpowers/specs/2026-07-16-3d-particle-field-design.md`

## Global Constraints

- Repo: `/home/t1/hoelscher-automation/portfolio`. All paths below are relative to it.
- Brand colors: field lerps `#4D8DF5` (blue) → `#E58E26` (orange); page background `#0A0E1A`.
- Particle caps: 1,300 desktop / 700 mobile (`(max-width: 900px), (pointer: coarse)`); `pixelRatio` ≤ 2 desktop, ≤ 1.5 mobile.
- Hard gate: mobile Lighthouse performance ≥ 90 after integration (compare to baseline from Task 1 on the same machine).
- The page must be complete and fully functional with the script absent, failed, or WebGL unavailable.
- Canvas container is `aria-hidden="true"`; a11y score stays 100.
- `prefers-reduced-motion: reduce` disables ambient rotation/drift and scroll smoothing; scroll-driven morph remains.
- Landing page only: `/cortex`, `/privacy`, `/terms` must not gain the canvas.
- No copy changes. No em dashes in any user-visible copy.
- Section page order (real, differs from spec prose): Hero=scattered, Cortex=grid, Consulting=lattice, About=network; Contact stays on network (no tag).
- Conventional commits with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` footer.

---

### Task 1: Capture Lighthouse baseline

**Files:**
- Create: `docs/superpowers/plans/artifacts/lighthouse-baseline-mobile.json`
- Create: `docs/superpowers/plans/artifacts/lighthouse-baseline-desktop.json`

**Interfaces:**
- Consumes: nothing (runs against current `main`, before any code changes).
- Produces: baseline performance scores that Task 5 compares against.

- [ ] **Step 1: Build and serve the current site**

```bash
cd /home/t1/hoelscher-automation/portfolio
npm run build
nohup npx astro preview --port 4321 >/dev/null 2>&1 &
sleep 3 && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4321/
```
Expected: `200`

- [ ] **Step 2: Locate a Chrome binary for Lighthouse**

```bash
export CHROME_PATH=$(find ~/.cache/ms-playwright -type f -name chrome 2>/dev/null | head -1)
echo "$CHROME_PATH"
```
Expected: a path like `~/.cache/ms-playwright/chromium-*/chrome-linux/chrome`. If empty, run `npx playwright install chromium` first.

- [ ] **Step 3: Run Lighthouse mobile and desktop**

```bash
mkdir -p docs/superpowers/plans/artifacts
npx lighthouse http://localhost:4321/ --output=json \
  --output-path=docs/superpowers/plans/artifacts/lighthouse-baseline-mobile.json \
  --chrome-flags="--headless=new --no-sandbox" --quiet
npx lighthouse http://localhost:4321/ --preset=desktop --output=json \
  --output-path=docs/superpowers/plans/artifacts/lighthouse-baseline-desktop.json \
  --chrome-flags="--headless=new --no-sandbox" --quiet
node -e "for (const f of ['mobile','desktop']) { const r = require('./docs/superpowers/plans/artifacts/lighthouse-baseline-' + f + '.json'); console.log(f, Object.fromEntries(Object.entries(r.categories).map(([k,v]) => [k, v.score]))); }"
```
Expected: printed scores for performance/accessibility/best-practices/seo on both presets. Accessibility should be 1.0. Note the absolute numbers; on the Pi they may read lower than production — only the before/after delta matters.

- [ ] **Step 4: Stop the preview server and commit**

```bash
kill %1 2>/dev/null || pkill -f 'astro preview'
git add docs/superpowers/plans/artifacts/
git commit -m "test: capture Lighthouse baseline before 3D particle field

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Formations module (pure math, TDD)

**Files:**
- Create: `src/scripts/formations.ts`
- Create: `tests/formations.test.ts`
- Modify: `package.json` (add `vitest` devDependency and `test` script)

**Interfaces:**
- Consumes: nothing.
- Produces (used verbatim by Task 3):
  - `type FormationName = 'scattered' | 'grid' | 'lattice' | 'network'`
  - `makeFormation(name: FormationName, count: number, rand?: () => number): Float32Array` — length `count * 3`.
  - `interface TimelinePoint { anchor: number; formation: FormationName }` — `anchor` is a document-Y pixel position.
  - `progressAt(scrollCenter: number, points: TimelinePoint[]): { from: FormationName; to: FormationName; mix: number; t: number }` — `mix` is the eased 0..1 blend between `from` and `to`; `t` is overall 0..1 journey progress for color. Clamps below the first and above the last anchor. Throws on an empty timeline.

- [ ] **Step 1: Install vitest and add the test script**

```bash
cd /home/t1/hoelscher-automation/portfolio
npm install -D vitest
```
Then in `package.json` `"scripts"`, add:
```json
"test": "vitest run"
```

- [ ] **Step 2: Write the failing tests**

Create `tests/formations.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { makeFormation, progressAt, type TimelinePoint } from '../src/scripts/formations';

const NAMES = ['scattered', 'grid', 'lattice', 'network'] as const;

describe('makeFormation', () => {
  it('returns count*3 floats for every formation', () => {
    for (const name of NAMES) {
      expect(makeFormation(name, 100)).toHaveLength(300);
    }
  });

  it('is deterministic given a seeded rand', () => {
    let s = 42;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    let s2 = 42;
    const rand2 = () => ((s2 = (s2 * 16807) % 2147483647) / 2147483647);
    expect(makeFormation('scattered', 50, rand)).toEqual(makeFormation('scattered', 50, rand2));
  });

  it('grid is flat (z = 0) and centered near the origin', () => {
    const a = makeFormation('grid', 100);
    let sumX = 0;
    for (let i = 0; i < 100; i++) {
      expect(a[i * 3 + 2]).toBe(0);
      sumX += a[i * 3];
    }
    expect(Math.abs(sumX / 100)).toBeLessThan(0.5);
  });

  it('network points sit on shells of radius 2.6 or 3.3', () => {
    const a = makeFormation('network', 70);
    for (let i = 0; i < 70; i++) {
      const r = Math.hypot(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]);
      const onShell = Math.abs(r - 2.6) < 1e-6 || Math.abs(r - 3.3) < 1e-6;
      expect(onShell).toBe(true);
    }
  });
});

describe('progressAt', () => {
  const timeline: TimelinePoint[] = [
    { anchor: 0, formation: 'scattered' },
    { anchor: 1000, formation: 'grid' },
    { anchor: 2000, formation: 'lattice' },
    { anchor: 3000, formation: 'network' },
  ];

  it('clamps before the first anchor', () => {
    expect(progressAt(-50, timeline)).toEqual({ from: 'scattered', to: 'scattered', mix: 0, t: 0 });
  });

  it('clamps after the last anchor', () => {
    expect(progressAt(9999, timeline)).toEqual({ from: 'network', to: 'network', mix: 1, t: 1 });
  });

  it('midpoint of a segment eases to 0.5 with correct neighbors', () => {
    const p = progressAt(1500, timeline);
    expect(p.from).toBe('grid');
    expect(p.to).toBe('lattice');
    expect(p.mix).toBeCloseTo(0.5, 5);
    expect(p.t).toBeCloseTo(0.5, 5);
  });

  it('mix is monotonic within a segment', () => {
    const mixes = [1100, 1300, 1500, 1700, 1900].map((y) => progressAt(y, timeline).mix);
    for (let i = 1; i < mixes.length; i++) expect(mixes[i]).toBeGreaterThan(mixes[i - 1]);
  });

  it('throws on an empty timeline', () => {
    expect(() => progressAt(0, [])).toThrow();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/scripts/formations`.

- [ ] **Step 4: Implement the module**

Create `src/scripts/formations.ts`:
```ts
export type FormationName = 'scattered' | 'grid' | 'lattice' | 'network';

export interface TimelinePoint {
  /** Document-Y pixel position where this formation is fully assembled. */
  anchor: number;
  formation: FormationName;
}

export interface Progress {
  from: FormationName;
  to: FormationName;
  /** Eased 0..1 blend between `from` and `to`. */
  mix: number;
  /** Overall 0..1 journey progress, used for the blue-to-orange color lerp. */
  t: number;
}

const smoothstep = (x: number): number => x * x * (3 - 2 * x);

export function makeFormation(
  name: FormationName,
  count: number,
  rand: () => number = Math.random,
): Float32Array {
  const a = new Float32Array(count * 3);
  if (name === 'scattered') {
    for (let i = 0; i < count; i++) {
      a[i * 3] = (rand() - 0.5) * 16;
      a[i * 3 + 1] = (rand() - 0.5) * 10;
      a[i * 3 + 2] = (rand() - 0.5) * 8;
    }
  } else if (name === 'grid') {
    const cols = Math.ceil(Math.sqrt(count * 1.6));
    const rows = Math.ceil(count / cols);
    for (let i = 0; i < count; i++) {
      a[i * 3] = ((i % cols) - (cols - 1) / 2) * 0.24;
      a[i * 3 + 1] = (Math.floor(i / cols) - (rows - 1) / 2) * 0.24;
      a[i * 3 + 2] = 0;
    }
  } else if (name === 'lattice') {
    const n = Math.ceil(Math.cbrt(count));
    for (let i = 0; i < count; i++) {
      a[i * 3] = ((i % n) - (n - 1) / 2) * 0.42;
      a[i * 3 + 1] = ((Math.floor(i / n) % n) - (n - 1) / 2) * 0.42;
      a[i * 3 + 2] = (Math.floor(i / (n * n)) - (n - 1) / 2) * 0.42;
    }
  } else {
    // network: points on two spherical shells (every 7th point on the outer one)
    for (let i = 0; i < count; i++) {
      let x = rand() * 2 - 1;
      let y = rand() * 2 - 1;
      let z = rand() * 2 - 1;
      const len = Math.hypot(x, y, z) || 1;
      const r = i % 7 === 0 ? 3.3 : 2.6;
      a[i * 3] = (x / len) * r;
      a[i * 3 + 1] = (y / len) * r;
      a[i * 3 + 2] = (z / len) * r;
    }
  }
  return a;
}

export function progressAt(scrollCenter: number, points: TimelinePoint[]): Progress {
  if (points.length === 0) throw new Error('progressAt: empty timeline');
  const first = points[0];
  const last = points[points.length - 1];
  if (points.length === 1 || scrollCenter <= first.anchor) {
    return { from: first.formation, to: first.formation, mix: 0, t: 0 };
  }
  if (scrollCenter >= last.anchor) {
    return { from: last.formation, to: last.formation, mix: 1, t: 1 };
  }
  let i = 0;
  while (points[i + 1].anchor < scrollCenter) i++;
  const seg = (scrollCenter - points[i].anchor) / (points[i + 1].anchor - points[i].anchor);
  return {
    from: points[i].formation,
    to: points[i + 1].formation,
    mix: smoothstep(seg),
    t: (i + seg) / (points.length - 1),
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 9 tests.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/formations.ts tests/formations.test.ts package.json package-lock.json
git commit -m "feat: add particle formation generators and scroll timeline math

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Particle field runtime (Three.js + DOM)

**Files:**
- Create: `src/scripts/particle-field.ts`
- Modify: `package.json` (add `three` and `@types/three`)

**Interfaces:**
- Consumes: `makeFormation`, `progressAt`, `FormationName`, `TimelinePoint` from `./formations` (signatures in Task 2).
- Produces: `initParticleField(container: HTMLElement): void` — the only export. Never throws; on any failure it removes `container` and returns. Task 4's inline script calls it.

No unit tests for this module (it is WebGL + DOM glue); it is exercised end-to-end in Task 4 via Playwright and must compile in `astro build`.

- [ ] **Step 1: Install three**

```bash
cd /home/t1/hoelscher-automation/portfolio
npm install three
npm install -D @types/three
```

- [ ] **Step 2: Implement the runtime**

Create `src/scripts/particle-field.ts`:
```ts
import * as THREE from 'three';
import {
  makeFormation,
  progressAt,
  type FormationName,
  type TimelinePoint,
} from './formations';

const COLOR_FROM = 0x4d8df5; // brand blue
const COLOR_TO = 0xe58e26; // brand orange
const BG = 0x0a0e1a; // bg-deep

/**
 * Boots the particle field inside `container`. Progressive enhancement only:
 * any failure removes the container and leaves the page untouched.
 */
export function initParticleField(container: HTMLElement): void {
  try {
    start(container);
  } catch {
    container.remove();
  }
}

function start(container: HTMLElement): void {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));
  if (sections.length < 2) {
    container.remove();
    return;
  }

  const small = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const count = small ? 700 : 1300;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 7, 14);
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 8;

  const cache = new Map<FormationName, Float32Array>();
  const formationFor = (name: FormationName): Float32Array => {
    let f = cache.get(name);
    if (!f) {
      f = makeFormation(name, count);
      cache.set(name, f);
    }
    return f;
  };

  const firstScene = sections[0].dataset.scene as FormationName;
  const positions = new Float32Array(formationFor(firstScene));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: COLOR_FROM,
    size: 0.04,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const colFrom = new THREE.Color(COLOR_FROM);
  const colTo = new THREE.Color(COLOR_TO);

  let timeline: TimelinePoint[] = [];
  const measure = (): void => {
    timeline = sections.map((el) => {
      const top = el.getBoundingClientRect().top + scrollY;
      return {
        anchor: top + Math.min(el.offsetHeight, innerHeight) / 2,
        formation: el.dataset.scene as FormationName,
      };
    });
  };
  measure();

  let smooth = scrollY + innerHeight / 2;
  let raf = 0;
  const clock = new THREE.Clock();

  const frame = (): void => {
    raf = requestAnimationFrame(frame);
    const target = scrollY + innerHeight / 2;
    smooth = reduceMotion.matches ? target : smooth + (target - smooth) * 0.07;
    const p = progressAt(smooth, timeline);
    const from = formationFor(p.from);
    const to = formationFor(p.to);
    for (let i = 0; i < positions.length; i++) {
      positions[i] = from[i] + (to[i] - from[i]) * p.mix;
    }
    geometry.attributes.position.needsUpdate = true;
    material.color.copy(colFrom).lerp(colTo, p.t);
    const t = clock.getElapsedTime();
    if (reduceMotion.matches) {
      points.rotation.y = p.t * 0.35;
      points.rotation.x = 0;
    } else {
      points.rotation.y = t * 0.02 + p.t * 0.35;
      points.rotation.x = Math.sin(t * 0.15) * 0.03;
    }
    renderer.render(scene, camera);
  };

  const startLoop = (): void => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const stopLoop = (): void => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });

  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    measure();
  });

  renderer.domElement.addEventListener('webglcontextlost', () => {
    stopLoop();
    container.remove();
  });

  startLoop();
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: build succeeds. (The module is not imported anywhere yet; this checks types and syntax via Astro's TS pipeline. If the unused file is not type-checked by the build, run `npx tsc --noEmit` instead.)

- [ ] **Step 4: Commit**

```bash
git add src/scripts/particle-field.ts package.json package-lock.json
git commit -m "feat: add Three.js particle field runtime with graceful degradation

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Landing page integration

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/Hero.astro:6`
- Modify: `src/components/CortexOverviewSection.astro:5`
- Modify: `src/components/ConsultingSection.astro:30`
- Modify: `src/components/AboutSection.astro:19`
- Modify: `src/components/ContactSection.astro:6`

**Interfaces:**
- Consumes: `initParticleField(container: HTMLElement)` from `src/scripts/particle-field` (Task 3); `[data-scene]` attribute contract from Task 2's `FormationName`.
- Produces: the live feature. Container element id: `particle-field`.

- [ ] **Step 1: Tag sections and make backgrounds translucent**

`src/components/Hero.astro` line 6 — add the attribute (class unchanged):
```astro
<header class="relative overflow-hidden" data-scene="scattered">
```

`src/components/CortexOverviewSection.astro` line 5 — `bg-bg` becomes `bg-bg/85`:
```astro
<section id="cortex" class="bg-bg/85 border-y border-border-subtle" data-scene="grid">
```

`src/components/ConsultingSection.astro` line 30 — `bg-bg-deep` becomes `bg-bg-deep/40`:
```astro
<section id="consulting" class="bg-bg-deep/40" data-scene="lattice">
```

`src/components/AboutSection.astro` line 19 — `bg-bg` becomes `bg-bg/85`:
```astro
<section id="about" class="bg-bg/85 border-y border-border-subtle" data-scene="network">
```

`src/components/ContactSection.astro` line 6 — translucent, deliberately NO `data-scene` (field holds the network formation):
```astro
<section id="contact" class="bg-bg-deep/40">
```

- [ ] **Step 2: Add the canvas container and loader to index.astro**

Replace the full contents of `src/pages/index.astro` with:
```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import CortexOverviewSection from '../components/CortexOverviewSection.astro';
import ConsultingSection from '../components/ConsultingSection.astro';
import AboutSection from '../components/AboutSection.astro';
import ContactSection from '../components/ContactSection.astro';
---
<Base
  title="Hoelscher Automation | AI for professional services teams"
  description="Self-hosted AI products and custom automation for small professional services firms."
  path="/"
>
  <div id="particle-field" aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10">
    <div
      class="absolute inset-0 z-10"
      style="background: radial-gradient(ellipse at center, rgba(10,14,26,0) 40%, rgba(10,14,26,0.75) 100%);"
    ></div>
  </div>
  <Hero />
  <CortexOverviewSection />
  <ConsultingSection />
  <AboutSection />
  <ContactSection />
</Base>

<style>
  #particle-field :global(canvas) {
    position: absolute;
    inset: 0;
  }
</style>

<script>
  const boot = () => {
    const el = document.getElementById('particle-field');
    if (!el) return;
    if (!('WebGLRenderingContext' in window)) {
      el.remove();
      return;
    }
    import('../scripts/particle-field')
      .then(({ initParticleField }) => initParticleField(el))
      .catch(() => el.remove());
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(boot, { timeout: 3000 });
  } else {
    setTimeout(boot, 800);
  }
</script>
```

- [ ] **Step 3: Build and serve**

```bash
npm run build
nohup npx astro preview --port 4321 >/dev/null 2>&1 &
sleep 3 && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4321/
```
Expected: build succeeds (three is code-split into its own lazy chunk — confirm the main page JS did not grow by checking `dist/_astro/` chunk sizes), then `200`.

- [ ] **Step 4: Playwright verification (desktop)**

Using the Playwright MCP browser: resize to 1440x900, navigate to `http://localhost:4321/`, wait 4s (idle boot), then verify:
- Console has no errors (favicon aside).
- `document.querySelector('#particle-field canvas')` exists.
- Screenshot at top, then `scrollTo` 40% and 95% of the document; screenshot each. Particles must be visible behind the Consulting/About sections and text must remain readable.

- [ ] **Step 5: Playwright verification (mobile + reduced motion)**

- Resize to 390x844, reload, wait 4s: canvas exists, no console errors, screenshot.
- Emulate `prefers-reduced-motion: reduce` (via `browser_evaluate` with `matchMedia` override or CDP emulation), reload: page renders, morph still tracks scroll position (screenshot at two scroll depths differs).

- [ ] **Step 6: Verify non-landing pages have no canvas**

Navigate to `http://localhost:4321/cortex` (and `/privacy`): `document.getElementById('particle-field')` is null.

- [ ] **Step 7: Stop server and commit**

```bash
kill %1 2>/dev/null || pkill -f 'astro preview'
git add src/pages/index.astro src/components/
git commit -m "feat: wire scroll-driven particle field into landing page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Lighthouse gate and tuning

**Files:**
- Create: `docs/superpowers/plans/artifacts/lighthouse-after-mobile.json`
- Create: `docs/superpowers/plans/artifacts/lighthouse-after-desktop.json`
- Possibly modify: `src/scripts/particle-field.ts` (tuning constants only)

**Interfaces:**
- Consumes: baseline JSONs from Task 1; the integrated site from Task 4.
- Produces: evidence the performance/accessibility gates hold.

- [ ] **Step 1: Run Lighthouse on the integrated build**

```bash
cd /home/t1/hoelscher-automation/portfolio
npm run build
nohup npx astro preview --port 4321 >/dev/null 2>&1 &
sleep 3
export CHROME_PATH=$(find ~/.cache/ms-playwright -type f -name chrome 2>/dev/null | head -1)
npx lighthouse http://localhost:4321/ --output=json \
  --output-path=docs/superpowers/plans/artifacts/lighthouse-after-mobile.json \
  --chrome-flags="--headless=new --no-sandbox" --quiet
npx lighthouse http://localhost:4321/ --preset=desktop --output=json \
  --output-path=docs/superpowers/plans/artifacts/lighthouse-after-desktop.json \
  --chrome-flags="--headless=new --no-sandbox" --quiet
node -e "for (const w of ['baseline','after']) for (const f of ['mobile','desktop']) { const r = require('./docs/superpowers/plans/artifacts/lighthouse-' + w + '-' + f + '.json'); console.log(w, f, Object.fromEntries(Object.entries(r.categories).map(([k,v]) => [k, v.score]))); }"
```
Expected: after-mobile performance ≥ 0.90 AND within 3 points of baseline-mobile; accessibility still 1.0 on both.

- [ ] **Step 2: Tune if the gate fails**

If mobile performance < 0.90 or dropped more than 3 points from baseline: in `src/scripts/particle-field.ts`, lower the mobile branch to `count = 500` and pixel ratio cap to `1.25`, rebuild, and re-run Step 1. If it still fails, check the Lighthouse JSON `audits` for the actual culprit (it is usually main-thread work during load — confirm the boot is really idle-deferred) rather than blindly reducing further.

- [ ] **Step 3: Run the full test suite one final time**

Run: `npm test`
Expected: PASS (9 tests).

- [ ] **Step 4: Stop server, commit artifacts**

```bash
kill %1 2>/dev/null || pkill -f 'astro preview'
git add docs/superpowers/plans/artifacts/ src/scripts/particle-field.ts
git commit -m "test: verify Lighthouse gates hold with particle field enabled

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Manual device check (Jordan)**

Serve over LAN (`npx astro preview --port 4321 --host`) and have Jordan check `http://192.168.10.13:4321/` on his phone and Mac. Note: his Mac likely has Reduce Motion enabled — expect scroll-tracked morph without ambient drift there; that is correct behavior, not a bug. Deployment to production happens only after his sign-off (deploy is out of scope for this plan).
