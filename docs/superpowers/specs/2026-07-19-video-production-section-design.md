# Video Production Section — Design

**Date:** 2026-07-19
**Status:** Approved pending user review
**Motivation:** Two independent signals suggest a video services market: the Warren County
Imagination Library bid (institutional, bilingual educational video) and organic parent interest
in a personalized birthday video. The site should present video generation as a service.

## Goal

Add a Video Production section to the hoelscherautomation.com landing page that presents
AI video production as one umbrella service spanning three audiences (libraries/nonprofits,
businesses, families), with an embedded, copyright-clean demo player proving the bilingual
capability.

## Decisions made

| Decision | Choice |
|---|---|
| Audience framing | One umbrella service; inquiries self-sort |
| Placement | New landing-page section with demo player (not a card, not a sub-page) |
| Demo content | Existing "The Lion and the Mouse" bilingual POC videos (Aesop, public domain, original illustrations; copyright-clean) |
| Demo presentation | One player with Español / Oʻzbekcha language toggle |
| Hosting | Self-hosted, re-encoded mp4s committed to the repo, served same-origin from GitHub Pages |
| Sequencing | Ship now; personal-side demo (kid in a scene) added later as a third tab or second player |

## Components

### 1. `src/components/VideoSection.astro` (new)

Inserted in `src/pages/index.astro` between `ConsultingSection` and `AboutSection`.

- `<section id="video" data-scene="grid">` — reuses the existing `grid` particle formation.
  Neighbors are `lattice` (consulting) and `network` (about), so scroll transitions still
  animate. No new formation code.
- Follows the existing section pattern: `SectionLabel` ("Video Production"), display headline
  ("Story videos, produced with AI." or similar), one short umbrella pitch paragraph.
- Copy constraints: no em dashes or en dashes, no AI-tell phrasing, plain human tone.

### 2. Demo player

- One `<video controls playsinline preload="none" poster="...">` element. Nothing beyond the
  poster JPEG loads until the visitor presses play; this preserves the Lighthouse scores.
- Two tab buttons above the player (Español / Oʻzbekcha) swap `src` and `poster` via a small
  vanilla JS script in the component. Active tab styled with the existing brand-orange accent;
  buttons are real `<button>` elements with `aria-pressed`.
- Switching tabs pauses and resets the player.
- Caption line under the player names the story: Aesop's "The Lion and the Mouse," original
  illustrations, AI narration and animation.
- Layout leaves room for a future third tab or second player (personal demo); no visible
  placeholder ships now.

### 3. Use-case blurbs

Three items in the same grid style as the consulting "How it works" steps:

1. **Libraries & Nonprofits** — bilingual read-along and educational story videos.
2. **Businesses** — explainer and promo videos.
3. **Families** — personalized story videos for kids and occasions.

Each is one sentence and ends with the existing "Discuss this →" link pattern pointing
at `#contact`.

### 4. Assets

Source files (in `business-ops/clients/imagination-library-video/assets/`):

- `imagination-spanish-demo-v3-calm.mp4` (12MB) → Spanish demo
- `imagination-uzbek-demo-r2.mp4` (13MB) → Uzbek demo

Pipeline (ffmpeg, run locally on the Pi; short single-pass re-encodes, not the filter-bound
full builds that get offloaded):

- Re-encode both to 720p H.264 + AAC, `-movflags +faststart`, target ≤7MB each.
- Extract one poster frame per video as JPEG (a visually strong scene frame, not frame 0).
- Output: `public/videos/demo-es.mp4`, `public/videos/demo-uz.mp4`,
  `public/videos/poster-es.jpg`, `public/videos/poster-uz.jpg` (all demo assets together
  in one directory).

### 5. Nav

Add "Video" → `/#video` to both the desktop and mobile menus in `Nav.astro`, between
"Consulting" and "About" to match section order.

## Error handling

- Browser without JS: player still works with the default (Spanish) source; tabs are
  progressive enhancement.
- Video fails to load: native `<video>` element error UI; no custom handling needed.

## Verification

- `npm run build` and `npm test` (vitest) pass.
- Playwright pass against the preview build: tab toggle swaps `src`/`poster` and pauses
  playback, video plays on click, reveal animations and particle scene transitions unaffected,
  nav links scroll to the section.
- Lighthouse run on the built site confirms performance/accessibility/SEO gates hold
  (same procedure as the particle-field launch: 1.00 / 0.99 / 1.0).
- Confirm poster images have alt-equivalent labeling (`aria-label` on the video) and tabs are
  keyboard operable.

## Out of scope

- Producing the personal-side demo (kid in a scene) — separate follow-up project.
- Pricing on the site (existing service cards show none).
- A dedicated `/video` sub-page.
- New particle formations.
