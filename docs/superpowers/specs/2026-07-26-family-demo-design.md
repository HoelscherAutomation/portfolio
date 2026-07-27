# Family Demo: Personalized Fantasy Video — Design

Date: 2026-07-26
Status: Approved by Jordan (pending spec review)

## Purpose

Add a personalized-video demo to the hoelscherautomation.com video section, targeting the "Families" use case. The demo shows a before/after: ordinary phone photos of a kid become a cinematic fantasy video with that kid as the hero. It mirrors the video Jordan made for his niece, which cannot be shown publicly (Warner Bros. IP), so this is a fresh production in an original dragon/castle world.

The demo serves double duty: it sells the offering emotionally, and the example photos implicitly teach parents what to submit (variety of angles, lighting, distances).

## Success criteria

- A visitor understands within seconds: "you send photos, you get a movie of your kid."
- No real child's likeness appears anywhere. The kid is fully AI-generated.
- No third-party IP in prompts, visuals, or audio.
- The new block reads as a distinct offering from the bilingual/organizational demo above it.
- Copy reads human: no em dashes, no AI-tell phrasing.

## Section A — Demo assets

### The kid character

- Fully AI-generated boy, roughly 7 to 9 years old, consistent likeness across all assets.
- Generate the character once, then reuse as reference for photos and video scenes.

### Reference photos (the "before")

- 5 or 6 photos styled as ordinary parent-taken phone photos. Deliberately unremarkable.
- Varied on purpose, because the variety is the submission spec:
  - Framing: close-up face, mid shot, full body
  - Lighting: indoor, outdoor daylight, dimmer light
  - Poses/contexts: casual, candid, different clothing
- These appear on the website as a photo strip captioned to make the point explicit.

### The video (the "after")

- Hybrid trailer style: cinematic with one or two voiceover lines, not a narrated story.
- Length ~45 to 60 seconds, 16:9, six scenes (matches the proven niece-video recipe).
- Produced with Kling 3.0, which provides native ambient sound and sometimes usable spoken lines.
- ElevenLabs (subscription active) is the fallback and finishing tool for voiceover and music when Kling audio is not good enough.
- Draft story arc:
  1. Kid in an ordinary backyard finds a glowing egg
  2. Egg hatches, baby dragon
  3. Kid and dragon in a castle courtyard, bond established
  4. First flight, lifting off over the kingdom
  5. Soaring past spires and through clouds
  6. Sunset landing, kid grinning at camera; VO closer along the lines of "Every adventure starts with a photo."
- Original high-fantasy world only. No Hogwarts, no recognizable franchise visuals, no franchise music cues.

## Section B — Website integration

All changes in `src/components/VideoSection.astro` (plus static assets).

- New sub-block below the existing bilingual demo player and above "Where it fits":
  - Own `SectionLabel` ("For families" or similar) and short heading, e.g. "Six phone photos in. One adventure out."
  - Photo strip of the source photos with caption ("Made from ordinary photos like these").
  - Independent video player styled like the existing one: `controls`, `playsinline`, `preload="none"`, poster image. Not wired into the language-tab logic.
- Light copy tweak to the existing bilingual block so it reads as the organizations/business demo, keeping the two offerings clearly separated.
- Conventions: `reveal` animation classes, existing color tokens (`brand-orange-bright`, `text-secondary`, `border-subtle`), all demo assets together under `public/videos/` (e.g. `demo-family.mp4`, `poster-family.jpg`, `family-photo-1.jpg` through `-6.jpg`), matching the existing `demo-es.mp4` / `poster-es.jpg` pattern.
- No new dependencies, no layout framework changes.

## Out of scope

- No changes to the 3D particle field, nav, or other sections.
- No pricing or package copy for the family offering (contact CTA only, matching existing cards).
- No localization of the family demo video.

## Risks / notes

- Character consistency across 6 photos + 6 scenes is the main production risk. Mitigation: single strong character reference set generated first, approved before scene production begins.
- Kling audio quality is variable. ElevenLabs covers VO and music if needed.
- Full-video encode on the Pi is slow (~35 min); offload single-pass NVENC encode to the gaming PC after 5pm if a full re-encode is needed.
