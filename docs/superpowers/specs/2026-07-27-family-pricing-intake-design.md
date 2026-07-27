# Family Demo: Pricing, Photo Guidance, and Intake Form — Design

Date: 2026-07-27
Status: Approved by Jordan (pending spec review)

## Purpose

Turn the "For families" demo block from a showcase into a sellable product: put a price on it, set accurate photo expectations (10 to 15 photos, not 6), and add an intake form that captures what the family wants so Jordan can scope each request from a single email.

## Decisions already made

- **Price**: $199 anchor with strikethrough, **$99 launch price**, scoped to "about a one minute film, like the demo". Longer or more elaborate films are quoted individually via the form. "Launch price" framing (not a fake countdown sale) so the anchor stays honest indefinitely.
- **Photo requirement**: 10 to 15 everyday photos, varied angles, lighting, and distances. The six-photo strip stays as illustration ("the photos below give you the idea").
- **Form**: inline at the bottom of the family block, posts JSON to the existing `contact-form` Cloudflare Worker (extended), lands in the same inbox with a distinct subject. No photo upload; the reply email carries photo instructions.

## Section A — Copy and pricing changes

In `src/components/VideoSection.astro`, family block only:

- Heading: "Everyday photos in. One adventure out."
- Body: "Send us 10 to 15 everyday photos of your kid, different angles, different lighting, close up and far away, and we make a short film where they are the hero. The photos below give you the idea: nothing fancy."
- Photo strip and AI-disclosure caption unchanged.
- New price line after the video caption, before the form: anchor "$199" struck through in muted text, "$99 launch price" in `brand-orange-bright`, followed by "for a one minute personalized film. Want something longer or more elaborate? Tell us below and we will quote it."
- No em or en dashes in any of this copy.

## Section B — Intake form component

New file `src/components/FamilyIntakeForm.astro`, rendered at the bottom of the family block (inside the same `reveal` container flow). Fields:

| Field | Input | Required | Notes |
|---|---|---|---|
| Parent name | text | yes | max 200 |
| Email | email | yes | max 200 |
| Child's first name | text | yes | max 100 |
| Child's age | number 1-17 | yes | |
| Theme | select | yes | Dragons & castles / Space adventure / Under the sea / Enchanted forest / Superhero / Something else (tell us below) |
| Favorite color | text | no | max 100 |
| Special appearance | textarea | no | placeholder: pet, best friend, favorite toy; max 1000 |
| Desired length | radio | yes | "About 1 minute ($99)" / "Longer (we will quote it)" |
| Anything else | textarea | no | max 2000 |

Behavior (mirrors ContactSection's submit pattern):
- JSON POST to the same worker URL as the contact form, with `type: "family"` added to the payload.
- Button disabled + label swap while sending.
- Inline success: "Got it. We will reply within a day with photo instructions and next steps."
- Inline error surfaces the server message with a mailto fallback.
- Native HTML validation only (required, type=email, number min/max). No JS validation library.
- After-submit expectation is also set BEFORE submit with a one-line note under the button: "After you submit, we will reply with instructions for sending your 10 to 15 photos."

## Section C — Worker extension

`workers/contact-form/index.js` gains a family branch, keyed on `body.type === "family"`:

- Validates: name, email, childName, childAge (1-17), theme (must be one of the six options), length (one of the two options); optional favoriteColor, special, notes. Field length caps per the table above. Same email regex as the contact branch.
- Email composed with subject `Family video request: {name}, {theme}` and a plain-text body listing every field on its own line, `reply_to` set to the parent's email.
- The existing contact behavior (no `type` field) is untouched; unknown `type` values fall through to the contact validation and fail its required-field checks naturally.
- Same CORS handling and env vars; no new secrets.
- Deploy: `wrangler deploy` from `workers/contact-form/` using the Cloudflare token from the homelab SOPS secrets (`secrets/hoelscherautomation/credentials.env` on Skynet).

## Section D — Verification and ship

- `npm run build` + greps: form present, price line present, no em/en dashes introduced.
- `npm test` (existing vitest suite).
- Playwright against the preview build: required-field validation blocks empty submit; a filled submit fires a POST with the expected JSON shape to the worker URL (intercepted/stubbed, since preview should not send real email); success and error UI states render.
- Lighthouse gate: scores hold at the current baseline (0.98+/1.0/1.0/1.0); form is static below-the-fold HTML.
- Worker deployed, then ONE real end-to-end submission from the live site; Jordan confirms the email arrived and reads well before the task is called done.
- Push to `main` (site deploy) gated on Jordan's explicit go.

## Out of scope

- Photo upload in the form (email reply carries instructions instead).
- Payment collection (invoicing happens after scoping, off-site).
- Any changes to the organizations block, nav, or other sections.
- Spam hardening beyond field caps and CORS (revisit only if junk submissions actually appear).

## Risks / notes

- The worker serves both forms; a regression there breaks the existing contact form. Mitigation: contact path code untouched, family branch purely additive, and post-deploy verification includes a contact-form smoke test submission.
- Cloudflare token access is the only step outside the repo; if the token lacks worker-deploy scope, Jordan deploys via dashboard paste as fallback.
