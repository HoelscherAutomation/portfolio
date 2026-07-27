# Family Pricing + Intake Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Price the family video offering (strikethrough $199 → $99 launch price), correct photo guidance to 10-15 photos, and add an intake form that emails Jordan via the existing contact-form Worker.

**Architecture:** Purely additive: a `type: "family"` branch in the existing Cloudflare Worker (contact path untouched), a new focused `FamilyIntakeForm.astro` component following ContactSection's exact submit pattern, and copy edits inside VideoSection's family block. One shared endpoint (`CONTACT_ENDPOINT`), one inbox, distinct subject line.

**Tech Stack:** Astro 5 + Tailwind tokens, vanilla TS in component script, Cloudflare Worker (plain JS) + Resend, vitest (worker unit test), Playwright MCP, Lighthouse, wrangler deploy.

**Spec:** `docs/superpowers/specs/2026-07-27-family-pricing-intake-design.md`

## Global Constraints

- Copy rules: **no em dashes or en dashes** in any user-visible site copy; plain human tone.
- Existing contact-form behavior must not change: payloads without `type` follow the exact current code path.
- Form posts JSON to `CONTACT_ENDPOINT` (`https://api.hoelscherautomation.com/contact`) with `type: "family"`.
- Native HTML validation only; no new dependencies anywhere.
- Follow existing patterns: `SectionLabel`, `reveal`, input classes copied from `ContactSection.astro`, status classes `text-ok`/`text-err`.
- Theme options (exact strings, used in both form and worker): `Dragons & castles`, `Space adventure`, `Under the sea`, `Enchanted forest`, `Superhero`, `Something else (tell us below)`.
- Length options (exact strings): `About 1 minute ($99)`, `Longer (we will quote it)`.
- Repo root: `/home/t1/hoelscher-automation/portfolio`.
- Ship gates: Jordan confirms the real end-to-end email before done; push to `main` only on Jordan's explicit go.

---

### Task 1: Worker family branch (TDD)

**Files:**
- Modify: `workers/contact-form/index.js`
- Test: `workers/contact-form/worker.test.js` (new)

**Interfaces:**
- Consumes: existing worker default export `{ fetch(request, env) }`; env vars `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`, `ALLOWED_ORIGIN`.
- Produces: POST handling for JSON bodies with `type: "family"` and fields `{name, email, childName, childAge, theme, length, favoriteColor?, special?, notes?}`. Task 3's component sends exactly this payload; Task 4 asserts its shape.

- [ ] **Step 1: Write the failing tests**

Create `workers/contact-form/worker.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from './index.js';

const env = {
  RESEND_API_KEY: 'test-key',
  FROM_EMAIL: 'from@test',
  TO_EMAIL: 'to@test',
  ALLOWED_ORIGIN: 'https://hoelscherautomation.com',
};

function post(body) {
  return new Request('https://api.test/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const familyBody = {
  type: 'family',
  name: 'Pat Parent',
  email: 'pat@example.com',
  childName: 'Sam',
  childAge: 7,
  theme: 'Dragons & castles',
  length: 'About 1 minute ($99)',
  favoriteColor: 'teal',
  special: 'our dog Biscuit',
  notes: 'birthday is in September',
};

describe('family intake branch', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
  });

  it('accepts a valid family submission and emails it', async () => {
    const res = await worker.fetch(post(familyBody), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const call = globalThis.fetch.mock.calls[0];
    expect(call[0]).toBe('https://api.resend.com/emails');
    const sent = JSON.parse(call[1].body);
    expect(sent.subject).toBe('Family video request: Pat Parent, Dragons & castles');
    expect(sent.reply_to).toBe('pat@example.com');
    expect(sent.text).toContain('Child: Sam, age 7');
    expect(sent.text).toContain('Favorite color: teal');
    expect(sent.text).toContain('our dog Biscuit');
  });

  it('rejects a missing required field', async () => {
    const res = await worker.fetch(post({ ...familyBody, childName: '' }), env);
    expect(res.status).toBe(400);
  });

  it('rejects an unknown theme', async () => {
    const res = await worker.fetch(post({ ...familyBody, theme: 'Hogwarts' }), env);
    expect(res.status).toBe(400);
  });

  it('rejects an out-of-range age', async () => {
    const res = await worker.fetch(post({ ...familyBody, childAge: 30 }), env);
    expect(res.status).toBe(400);
  });

  it('leaves the contact path working unchanged', async () => {
    const res = await worker.fetch(
      post({ name: 'A', email: 'a@b.co', message: 'hi' }), env);
    expect(res.status).toBe(200);
    const sent = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(sent.subject).toBe('Hoelscher Automation contact: A');
  });
});
```

- [ ] **Step 2: Run tests to verify the family ones fail**

Run: `cd /home/t1/hoelscher-automation/portfolio && npx vitest run workers/contact-form/worker.test.js`
Expected: the 4 family tests FAIL (family payload falls into contact validation → 400 or wrong subject); the contact test PASSES.

- [ ] **Step 3: Implement the family branch**

In `workers/contact-form/index.js`, after the `body` parse and before the existing contact validation, insert:

```js
    if (body.type === 'family') {
      return handleFamily(body, env);
    }
```

And append at module level (below the default export object, above `corsHeaders`):

```js
const FAMILY_THEMES = [
  'Dragons & castles',
  'Space adventure',
  'Under the sea',
  'Enchanted forest',
  'Superhero',
  'Something else (tell us below)',
];
const FAMILY_LENGTHS = ['About 1 minute ($99)', 'Longer (we will quote it)'];

async function handleFamily(body, env) {
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const childName = String(body.childName ?? '').trim();
  const childAge = Number(body.childAge);
  const theme = String(body.theme ?? '');
  const length = String(body.length ?? '');
  const favoriteColor = String(body.favoriteColor ?? '').trim();
  const special = String(body.special ?? '').trim();
  const notes = String(body.notes ?? '').trim();

  if (!name || !email || !childName) {
    return json({ error: 'Name, email, and your child\'s first name are required.' }, 400, env);
  }
  if (!Number.isInteger(childAge) || childAge < 1 || childAge > 17) {
    return json({ error: 'Please provide your child\'s age (1-17).' }, 400, env);
  }
  if (!FAMILY_THEMES.includes(theme)) {
    return json({ error: 'Please pick a theme from the list.' }, 400, env);
  }
  if (!FAMILY_LENGTHS.includes(length)) {
    return json({ error: 'Please pick a video length.' }, 400, env);
  }
  if (name.length > 200 || email.length > 200 || childName.length > 100
      || favoriteColor.length > 100 || special.length > 1000 || notes.length > 2000) {
    return json({ error: 'One or more fields exceeded the maximum length.' }, 400, env);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please provide a valid email address.' }, 400, env);
  }

  const lines = [
    'New family video request from hoelscherautomation.com',
    '',
    `Parent: ${name}`,
    `Email: ${email}`,
    `Child: ${childName}, age ${childAge}`,
    `Theme: ${theme}`,
    `Length: ${length}`,
    `Favorite color: ${favoriteColor || '(not given)'}`,
    `Special appearance: ${special || '(not given)'}`,
    `Notes: ${notes || '(not given)'}`,
    '',
    '---',
    `Reply directly to this email to respond to ${name}.`,
  ];

  const resendResp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: env.TO_EMAIL,
      reply_to: email,
      subject: `Family video request: ${name}, ${theme}`,
      text: lines.join('\n'),
    }),
  });

  if (!resendResp.ok) {
    const detail = await resendResp.text().catch(() => '');
    console.error('Resend send failed', resendResp.status, detail);
    return json({ error: 'Email delivery failed. Please try again or email directly.' }, 502, env);
  }
  return json({ ok: true }, 200, env);
}
```

- [ ] **Step 4: Run all tests**

Run: `npx vitest run workers/contact-form/worker.test.js && npm test`
Expected: all worker tests PASS; existing suite still green.

- [ ] **Step 5: Commit**

```bash
git add workers/contact-form/index.js workers/contact-form/worker.test.js
git commit -m "feat: add family intake branch to contact-form worker

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Copy + price line in VideoSection

**Files:**
- Modify: `src/components/VideoSection.astro` (family block: heading ~line 118, body copy, and insert price line after the closing caption `<p>` under `#family-player`)

**Interfaces:**
- Consumes: existing family block markup (`#family-player`, captions).
- Produces: `#family-pricing` div; Task 3 renders the form immediately after it; Task 4 greps for `id="family-pricing"` and the copy strings.

- [ ] **Step 1: Update heading and body copy**

Replace the heading text `Six phone photos in. One adventure out.` with:

```
Everyday photos in. One adventure out.
```

Replace the body paragraph text (currently "Send us a handful of everyday photos and we make a short film where your kid is the hero. Photos like these are all it takes: different angles, different light, nothing fancy.") with:

```
Send us 10 to 15 everyday photos of your kid, different angles, different lighting, close up and far away, and we make a short film where they are the hero. The photos below give you the idea: nothing fancy.
```

- [ ] **Step 2: Insert the price line**

Directly after the caption paragraph `Every scene came from the six photos above. Original story, original world, produced end to end with our pipeline.` (keep that caption), insert:

```astro
      <div id="family-pricing" class="mt-8 flex items-baseline gap-3 flex-wrap">
        <span class="text-lg text-text-muted line-through">$199</span>
        <span class="font-display text-3xl font-semibold text-brand-orange-bright">$99</span>
        <span class="text-sm font-medium uppercase tracking-wide text-brand-orange-bright">launch price</span>
      </div>
      <p class="mt-2 text-text-secondary leading-relaxed">
        For a one minute personalized film. Want something longer or more elaborate? Tell us below and we will quote it.
      </p>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
grep -c 'Everyday photos in' dist/index.html
grep -c '10 to 15 everyday photos' dist/index.html
grep -c 'id="family-pricing"' dist/index.html
grep -c 'launch price' dist/index.html
grep -c $'—' dist/index.html || true; grep -c $'–' dist/index.html || true
```

Expected: first four greps print 1; em dash 0; en dash 2 (both pre-existing in consulting copy, unchanged).

- [ ] **Step 4: Commit**

```bash
git add src/components/VideoSection.astro
git commit -m "feat: add family pricing line and 10-15 photo guidance

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: FamilyIntakeForm component

**Files:**
- Create: `src/components/FamilyIntakeForm.astro`
- Modify: `src/components/VideoSection.astro` (import + render after the pricing paragraph from Task 2)

**Interfaces:**
- Consumes: `CONTACT_ENDPOINT` from `../lib/constants`; input styling copied from `ContactSection.astro`; Task 1's payload contract.
- Produces: `<form id="family-form">` with fields named `name, email, childName, childAge, theme, favoriteColor, special, length, notes`; `#family-submit`, `#family-form-status`. Task 4 targets these ids.

- [ ] **Step 1: Create `src/components/FamilyIntakeForm.astro`**

```astro
---
import { CONTACT_ENDPOINT } from '../lib/constants';

const themes = [
  'Dragons & castles',
  'Space adventure',
  'Under the sea',
  'Enchanted forest',
  'Superhero',
  'Something else (tell us below)',
];

const inputClass =
  'w-full px-3 py-2.5 bg-bg-elevated border border-border-default rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-orange transition-colors duration-default';
---
<div class="mt-10">
  <h4 class="font-display text-xl font-semibold text-text-primary mb-2">
    Start your kid's adventure
  </h4>
  <p class="text-text-secondary leading-relaxed mb-6">
    Tell us a little about your kid and the story you want. We reply within a day.
  </p>

  <form id="family-form" action={CONTACT_ENDPOINT} method="POST" class="space-y-4 max-w-xl">
    <div class="grid sm:grid-cols-2 gap-4">
      <div>
        <label for="fam-name" class="block text-sm text-text-secondary mb-1">Your name</label>
        <input type="text" id="fam-name" name="name" required maxlength="200" class={inputClass} />
      </div>
      <div>
        <label for="fam-email" class="block text-sm text-text-secondary mb-1">Email</label>
        <input type="email" id="fam-email" name="email" required maxlength="200" class={inputClass} />
      </div>
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <div>
        <label for="fam-child" class="block text-sm text-text-secondary mb-1">Child's first name</label>
        <input type="text" id="fam-child" name="childName" required maxlength="100" class={inputClass} />
      </div>
      <div>
        <label for="fam-age" class="block text-sm text-text-secondary mb-1">Child's age</label>
        <input type="number" id="fam-age" name="childAge" required min="1" max="17" class={inputClass} />
      </div>
    </div>

    <div>
      <label for="fam-theme" class="block text-sm text-text-secondary mb-1">Theme</label>
      <select id="fam-theme" name="theme" required class={inputClass}>
        {themes.map((t) => <option value={t}>{t}</option>)}
      </select>
    </div>

    <div>
      <label for="fam-color" class="block text-sm text-text-secondary mb-1">Favorite color (optional)</label>
      <input type="text" id="fam-color" name="favoriteColor" maxlength="100" class={inputClass} />
    </div>

    <div>
      <label for="fam-special" class="block text-sm text-text-secondary mb-1">
        Anything special that should make an appearance? (optional)
      </label>
      <textarea id="fam-special" name="special" rows="2" maxlength="1000" class={`${inputClass} resize-y`}
        placeholder="A pet, a best friend, a favorite toy"></textarea>
    </div>

    <fieldset>
      <legend class="block text-sm text-text-secondary mb-2">Video length</legend>
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-text-primary">
          <input type="radio" name="length" value="About 1 minute ($99)" required checked class="accent-brand-orange" />
          About 1 minute ($99)
        </label>
        <label class="flex items-center gap-2 text-text-primary">
          <input type="radio" name="length" value="Longer (we will quote it)" class="accent-brand-orange" />
          Longer (we will quote it)
        </label>
      </div>
    </fieldset>

    <div>
      <label for="fam-notes" class="block text-sm text-text-secondary mb-1">Anything else we should know? (optional)</label>
      <textarea id="fam-notes" name="notes" rows="3" maxlength="2000" class={`${inputClass} resize-y`}></textarea>
    </div>

    <button type="submit" id="family-submit"
      class="w-full px-5 py-3 bg-brand-orange text-navy-deep font-semibold rounded hover:bg-brand-orange-bright transition-colors duration-default disabled:opacity-60 disabled:cursor-not-allowed">
      Request my kid's film
    </button>
    <p class="text-xs text-text-muted">
      After you submit, we will reply with instructions for sending your 10 to 15 photos.
    </p>
    <div id="family-form-status" class="text-sm hidden"></div>
  </form>
</div>

<script>
  const form = document.getElementById('family-form') as HTMLFormElement | null;
  const submit = document.getElementById('family-submit') as HTMLButtonElement | null;
  const status = document.getElementById('family-form-status') as HTMLDivElement | null;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!submit || !status) return;

    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.className = 'text-sm hidden';

    try {
      const formData = new FormData(form);
      const payload = {
        type: 'family',
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        childName: String(formData.get('childName') ?? ''),
        childAge: Number(formData.get('childAge') ?? 0),
        theme: String(formData.get('theme') ?? ''),
        favoriteColor: String(formData.get('favoriteColor') ?? ''),
        special: String(formData.get('special') ?? ''),
        length: String(formData.get('length') ?? ''),
        notes: String(formData.get('notes') ?? ''),
      };

      const res = await fetch(form.action, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        status.textContent = 'Got it. We will reply within a day with photo instructions and next steps.';
        status.className = 'text-sm text-ok';
        form.reset();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        status.textContent = data.error ?? 'Something went wrong. Try emailing us directly.';
        status.className = 'text-sm text-err';
      }
    } catch {
      status.textContent = 'Network error. Try emailing us directly.';
      status.className = 'text-sm text-err';
    } finally {
      submit.disabled = false;
      submit.textContent = "Request my kid's film";
    }
  });
</script>
```

Note: the em dash character must not appear anywhere; the ellipsis in `Sending…` matches ContactSection exactly.

- [ ] **Step 2: Wire into VideoSection**

In `src/components/VideoSection.astro` frontmatter add:

```astro
import FamilyIntakeForm from './FamilyIntakeForm.astro';
```

Render `<FamilyIntakeForm />` immediately after the pricing paragraph from Task 2, inside the family block's outer div.

- [ ] **Step 3: Build, grep, test**

```bash
npm run build
grep -c 'id="family-form"' dist/index.html
grep -c 'Dragons &amp; castles' dist/index.html
grep -c 'Request my kid' dist/index.html
npm test
```

Expected: greps ≥1 (theme string appears 1x in select; HTML-escaped `&amp;`); vitest green.

- [ ] **Step 4: Commit**

```bash
git add src/components/FamilyIntakeForm.astro src/components/VideoSection.astro
git commit -m "feat: add family video intake form

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Browser + Lighthouse verification

**Files:**
- None modified (artifact: `docs/superpowers/plans/artifacts/lighthouse-family-intake-desktop.json`)

**Interfaces:**
- Consumes: `#family-form`, `#family-submit`, `#family-form-status`, `#family-pricing` from Tasks 2-3.

- [ ] **Step 1: Serve the build**

```bash
cd /home/t1/hoelscher-automation/portfolio && npm run build
npx astro preview --port 4321 &
```

- [ ] **Step 2: Playwright checks** (against http://localhost:4321/#video)

1. Pricing renders: `#family-pricing` visible with `$199` struck and `$99` present.
2. Empty submit is blocked: click `#family-submit` with empty form; evaluate `document.getElementById('family-form').checkValidity()` → `false`, and no network request fires.
3. Payload shape: intercept/stub `fetch` via `page.route` on `https://api.hoelscherautomation.com/contact` returning `{"ok":true}`; fill every field (name "Test Parent", email "test@example.com", child "Sam", age 7, theme "Space adventure", color "teal", special "dog Biscuit", length default, notes "n/a"); submit; assert the intercepted request body parses to `type:"family"`, `childAge` is the number 7, and theme matches the exact string.
4. Success state: `#family-form-status` shows the "Got it." message with class `text-ok`, and the form fields reset.
5. Error state: re-route to return status 400 `{"error":"Please pick a theme from the list."}`; submit again; status shows that message with `text-err`.
6. Regression: the language tabs and `#family-player` behave as before.

- [ ] **Step 3: Lighthouse gate**

```bash
CHROME_PATH=/home/t1/.cache/ms-playwright/chromium-1217/chrome-linux/chrome npx lighthouse http://localhost:4321 --preset=desktop \
  --output=json --output-path=docs/superpowers/plans/artifacts/lighthouse-family-intake-desktop.json \
  --chrome-flags="--headless --no-sandbox" --quiet
node -e "const r=require('./docs/superpowers/plans/artifacts/lighthouse-family-intake-desktop.json'); console.log(Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,v.score])))"
```

Expected: ≥0.97 performance, 1.0 accessibility (labels on every field, fieldset/legend for radios), 1.0 best-practices, 1.0 SEO. If accessibility drops, check label `for` attributes match input ids.

- [ ] **Step 4: Kill preview, commit artifact**

```bash
pkill -f "astro preview"
```

Then in a fresh command: `git add docs/superpowers/plans/artifacts/ && git commit -m "test: verify Lighthouse gates hold with family intake form"` (with co-author footer).

---

### Task 5: Worker deploy, end-to-end proof, ship

**Files:**
- None in repo (Cloudflare deploy + live verification)

**Interfaces:**
- Consumes: deployed worker `hoelscher-contact-form`; Cloudflare API token from homelab SOPS secrets (`secrets/hoelscherautomation/credentials.env` on Skynet, SOPS encrypted).

- [ ] **Step 1: Deploy the worker**

```bash
cd /home/t1/hoelscher-automation/portfolio/workers/contact-form
export CLOUDFLARE_API_TOKEN=$(sops -d /home/t1/homelab/secrets/hoelscherautomation/credentials.env | grep CLOUDFLARE_API_TOKEN | cut -d= -f2)
npx wrangler deploy
```

Expected: deploy succeeds to `hoelscher-contact-form`. If the token lacks Workers scope, STOP and hand Jordan the diff for dashboard paste instead.

- [ ] **Step 2: Contact-form smoke test (regression)**

```bash
curl -s -X POST https://api.hoelscherautomation.com/contact \
  -H 'Content-Type: application/json' -H 'Origin: https://hoelscherautomation.com' \
  -d '{"name":"Smoke Test","email":"consulting@hoelscherautomation.com","message":"contact path still works after family branch deploy"}'
```

Expected: `{"ok":true}` and the email arrives in the inbox.

- [ ] **Step 3: Family branch live test**

```bash
curl -s -X POST https://api.hoelscherautomation.com/contact \
  -H 'Content-Type: application/json' -H 'Origin: https://hoelscherautomation.com' \
  -d '{"type":"family","name":"E2E Test","email":"consulting@hoelscherautomation.com","childName":"Sam","childAge":7,"theme":"Dragons & castles","length":"About 1 minute ($99)","favoriteColor":"teal","special":"dog Biscuit","notes":"end to end test"}'
```

Expected: `{"ok":true}`; Jordan confirms the "Family video request: E2E Test, Dragons & castles" email arrived and reads well. STOP for his confirmation.

- [ ] **Step 4: Ship the site**

On Jordan's explicit go:

```bash
cd /home/t1/hoelscher-automation/portfolio && git push origin main
```

Watch the Pages deploy, then submit ONE real form fill from https://hoelscherautomation.com/#video in a real browser (or Jordan does) to prove the full path: live site → worker → inbox.
