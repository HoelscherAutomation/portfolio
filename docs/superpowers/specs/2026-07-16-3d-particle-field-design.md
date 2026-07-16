# 3D Particle Field for hoelscherautomation.com — Design

**Date:** 2026-07-16
**Status:** Approved direction (hybrid), pending spec sign-off
**Prototypes:** Workshopped from two live prototypes (hero accent vs. scroll story); scroll story chosen, then calmed and densified per feedback.

## Goal

Add a scroll-driven 3D particle background to the landing page that makes the site feel distinctive and futuristic to prospective clients, without sacrificing the site's existing performance (Lighthouse 87–100), accessibility (100/100), or content.

The visual is a business metaphor: particles morph from a scattered cloud into an ordered grid, then a structured lattice, then a connected network as the visitor scrolls — scattered firm knowledge becoming an ordered, connected system. Color shifts brand blue (#4D8DF5) toward brand orange (#E58E26) across the journey.

## Approach (decided)

**Hybrid.** The current page structure, copy, and components stay. The particle field runs behind them. Rejected alternatives: full narrative rebuild of the landing page (bigger content rewrite, riskier), and a hero-only 3D accent (less memorable; also froze entirely under Reduce Motion in prototype form).

**Mobile gets the same 3D, tuned down** (reduced particle count and pixel ratio), not a static fallback.

## Architecture

### New files
- `src/scripts/particle-field.ts` — all Three.js logic: renderer setup, formations, scroll timeline, morph loop, degradation handling. Vanilla TypeScript; no UI framework added.

### Modified files
- `src/pages/index.astro` (or an opt-in layout prop, whichever fits the existing layout structure) — adds a fixed, `aria-hidden` canvas container and vignette overlay behind content and loads the script deferred/idle. The shared layout must not enable it implicitly on `/cortex`, `/privacy`, or `/terms`.
- Section components (`Hero`, `ConsultingSection`, `CortexOverviewSection`, `AboutSection`/`ContactSection`) — each gains a `data-scene` attribute naming its formation: `scattered`, `grid`, `lattice`, `network`.

### Behavior
1. Page renders fully without the script (progressive enhancement). Script loads on browser idle.
2. On init, the script measures the document offsets of `[data-scene]` sections and builds a scroll timeline from real boundaries, so content edits never require touching the animation code.
3. Each frame (rAF): map smoothed scroll position to a segment between two formations, lerp the shared vertex buffer (single `THREE.Points`, one draw call), lerp material color blue→orange, render.
4. A radial vignette overlay keeps page edges dark and text areas high-contrast.

### Dependencies
- `three` (only new dependency, ~120KB gzipped after tree-shaking, lazy-loaded). No addons.

## Performance budget

- LCP / first paint: unaffected — script is idle-deferred and the page is complete without it.
- Desktop: ≤ 1,300 particles, `pixelRatio ≤ 2`.
- Mobile (< 900px or coarse pointer): ≤ 700 particles, `pixelRatio ≤ 1.5`.
- Rendering pauses when `document.hidden`.
- Hard gate: mobile Lighthouse performance ≥ 90 after integration; tune particle count/pixel ratio down until met.

## Accessibility

- Canvas container `aria-hidden="true"`; zero semantic impact. a11y score stays 100.
- `prefers-reduced-motion: reduce`: ambient rotation, drift, and scroll smoothing are disabled; the scroll-driven morph itself remains (user-controlled timeline). Nothing on the page is ever animation-gated.
- Text contrast preserved by the vignette; verify contrast over the brightest particle regions.

## Error handling / degradation

- No JS, no WebGL, or `WebGLRenderer` construction throws → no canvas; site is today's flat design.
- `webglcontextlost` → cancel rAF loop and remove the canvas silently.
- Script failure must never block or delay page content (idle load + try/catch around init).

## Out of scope

- `/cortex`, `/privacy`, `/terms` pages — unchanged.
- Copy rewrites and added content sections. Density improvements come later with real content; the field is designed to work under whatever sections exist (data-attribute driven).
- Contact form, workers, and build pipeline — untouched.

## Verification plan

- Playwright: screenshots at 390px and 1440px, at top/mid/bottom scroll, plus `prefers-reduced-motion` emulation; console must be error-free.
- Lighthouse before/after on mobile and desktop presets; compare against the ≥ 90 mobile gate.
- Manual check on Jordan's phone and Mac (note: Reduce Motion may be enabled on the Mac — expect scroll-morph without ambient drift there).
