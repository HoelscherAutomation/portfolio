# Dedicated Family Films Page — Design

Date: 2026-07-27
Status: Approved by Jordan (pending spec review)

## Purpose

Separate the consumer product from the B2B site. The $99 family video offering moves off the business-focused homepage onto a dedicated parent-facing page at `/family-films`. The homepage keeps its premium B2B coherence; the family product gets a focused, shareable landing page for parent-facing marketing (social links, referrals, QR codes).

## Decisions already made

- Turnaround promise: **3 to 5 days**.
- Revision policy: **one free revision round** ("Not happy with a scene? We regenerate it once, free.").
- URL: `/family-films`.
- The homepage video section keeps the "For families" label as a compact pointer (thumbnail + one line + link); demo player, photo strip, pricing, and form all move to the new page.
- Same `Base` layout (standard nav/footer); no Three.js or new dependencies on the new page.
- Backend untouched: `FamilyIntakeForm` is reused as-is against the same worker.

## Section A — New page `src/pages/family-films.astro`

Order and content, all copy parent-facing, no em or en dashes:

1. **Hero**: h1 "Your kid. The hero of their own adventure." Subline: "We turn everyday photos into a short film where your child rides dragons, explores space, or walks an enchanted forest." Demo video (`/videos/demo-family.mp4`, poster `/videos/poster-family.jpg`, `controls playsinline preload="none"`) directly beneath.
2. **How it works**: three steps in the site's existing numbered-card style (mirroring the homepage "Where it fits" pattern: mono number, heading, body):
   - 01 "Send us your photos" — 10 to 15 everyday photos, different angles, different lighting, close up and far away, nothing fancy. Includes the six-photo example strip (`/videos/family-photo-1..6.jpg`, same alt texts as today) and the AI-disclosure caption ("The boy in these examples is AI generated, so no real child appears on this page. Your family's photos are used only for your film.").
   - 02 "We build their adventure" — original story and world; the child's theme, favorite color, and special requests shape the scenes.
   - 03 "Get their film in 3 to 5 days" — a short film delivered ready to share.
3. **Pricing**: the `#family-pricing` block moved verbatim ($199 struck with sr-only "Regular price" label, $99, "launch price"), the "For a one minute personalized film..." line, plus the new revision line: "Not happy with a scene? We regenerate it once, free."
4. **Intake form**: `<FamilyIntakeForm />` unchanged.
5. **FAQ**: four items, plain h3 + paragraph:
   - "What photos work best?" — variety guidance (angles, lighting, distances; phone photos are perfect).
   - "Are my kid's photos safe?" — used only to make your film, never for marketing or model training, deleted on request.
   - "Is this made with AI?" — yes; that is how one minute of cinema costs $99 and not $10,000. The example kid is AI generated; no real child appears on this page.
   - "How long does it take, and what if something looks off?" — 3 to 5 days; one free revision round.

SEO: `title="Personalized Adventure Films for Kids | Hoelscher Automation"`, description pitched to parents, `path="/family-films"`. Sitemap picks the page up automatically via @astrojs/sitemap.

## Section B — Homepage `VideoSection.astro` slims down

The family sub-block becomes a compact pointer, keeping `reveal` and the "For families" `SectionLabel`:
- One line of copy: "Personalized adventure films for kids, made from your photos."
- The poster image (`/videos/poster-family.jpg`) as a clickable thumbnail linking to `/family-films` (with meaningful alt text; not a `<video>` element, so the homepage loses zero performance).
- A text link styled like the existing "Discuss this →" links: "See family films →" to `/family-films`.
- Removed from homepage: photo strip, `#family-player`, `#family-pricing`, the form, and their captions.
- Untouched: "For organizations" block, language tabs, "Where it fits" cards.

`FamilyIntakeForm.astro` itself is unchanged and now imported only by the new page.

## Section C — Verification and ship

- `npm run build`; greps: `/family-films/` page exists in dist with form, pricing, FAQ; homepage no longer contains `id="family-player"` or `id="family-form"` but does contain the pointer link; no new em/en dashes on either page (en dash count on homepage stays 2, new page 0).
- `npm test` (worker suite unaffected).
- Playwright on preview: (1) new page form submits with stubbed endpoint, exact payload shape, success state; (2) homepage "See family films →" navigates to the new page; (3) org language tabs still swap correctly; (4) new page video has `preload="none"`.
- Lighthouse on `/` and `/family-films` (desktop preset, CHROME_PATH workaround): both ≥0.97 performance, 1.0 accessibility, 1.0 best practices, 1.0 SEO.
- Push to `main` gated on Jordan's explicit go; spot-check production after deploy.

## Out of scope

- No changes to the worker, form fields, or pricing values.
- No nav changes (the page is reached via the homepage pointer and direct marketing links; main nav stays B2B).
- No testimonials, extra themes, or payment collection (future follow-ups once orders exist).
- No separate domain or brand.

## Risks / notes

- Anyone who bookmarked the homepage form loses it; acceptable, the pointer is one click away and the page is brand new.
- The homepage en dash count check (2) guards against copy regressions during the block removal.
