# Contact Form Worker

Cloudflare Worker that receives contact-form submissions from
[hoelscherautomation.com](https://hoelscherautomation.com) and sends an
email via [Resend](https://resend.com).

Replaces the prior Formspree integration with a self-owned endpoint.

## Files

- `index.js` — Worker source (single file, no build step)
- `wrangler.toml` — deployment config for the `wrangler` CLI
- `README.md` — this file

## Deployment (one-time setup)

### 1. Sign up for Resend (free tier)

1. Go to [resend.com](https://resend.com) and create an account.
2. Verify the email you signed up with.
3. (Optional but recommended for v1.5) Add `hoelscherautomation.com` as a
   sending domain: Resend dashboard → Domains → Add Domain. Resend will
   give you SPF and DKIM TXT records. Add them in Cloudflare DNS, wait
   ~10 min for verification.
4. Create an API key: dashboard → API Keys → Create. Scope: "Sending
   access". Copy the `re_...` value.

### 2. Deploy the Worker

**Option A — Wrangler CLI** (recommended if you have Node installed):

```bash
cd workers/contact-form
npx wrangler login                                  # one-time browser auth
npx wrangler deploy                                  # creates the worker
npx wrangler secret put RESEND_API_KEY               # paste the re_... key
npx wrangler secret put FROM_EMAIL                   # e.g. "Hoelscher Automation <contact@hoelscherautomation.com>"
                                                     # or before domain verification:
                                                     # "Hoelscher Automation <onboarding@resend.dev>"
npx wrangler secret put TO_EMAIL                     # e.g. "jordan.hoelscher@gmail.com"
```

The deploy step prints a URL like
`https://hoelscher-contact-form.<your-subdomain>.workers.dev`. Save it.

**Option B — Cloudflare dashboard** (no Node required):

1. dash.cloudflare.com → Workers & Pages → **Create application** →
   **Create Worker** → name it `hoelscher-contact-form` → Deploy
2. Edit Code → paste contents of `index.js` → Save and Deploy
3. Worker → Settings → **Variables and Secrets**:
   - Add **secret** `RESEND_API_KEY` = your `re_...` key
   - Add **plaintext** `FROM_EMAIL` = `Hoelscher Automation <contact@hoelscherautomation.com>` (or `onboarding@resend.dev` if domain not verified yet)
   - Add **plaintext** `TO_EMAIL` = the inbox you want submissions delivered to
   - Add **plaintext** `ALLOWED_ORIGIN` = `https://hoelscherautomation.com`
4. The deployed Worker's URL is shown at the top of its dashboard page.

### 3. Point the site at the new endpoint

Edit `portfolio/src/lib/constants.ts` and replace the value of
`CONTACT_ENDPOINT` with the deployed Worker URL. Commit + push;
GitHub Actions auto-deploys the site change.

### 4. Test

Submit the form on `hoelscherautomation.com`. Email should arrive in
the inbox set as `TO_EMAIL` within seconds. If it doesn't:

- Check Resend dashboard → Logs for delivery status
- Check Cloudflare dashboard → Worker → Logs for any 5xx errors
- Spam folder

## Optional: custom domain for the Worker

The default `workers.dev` URL works fine. If you want
`contact-api.hoelscherautomation.com` instead:

1. Cloudflare DNS for `hoelscherautomation.com` → Add CNAME
   `contact-api` → `hoelscher-contact-form.<subdomain>.workers.dev`
   (proxied)
2. Worker → Settings → Triggers → Add Custom Domain →
   `contact-api.hoelscherautomation.com`
3. Update `CONTACT_ENDPOINT` in `src/lib/constants.ts`

## What the Worker does

- Accepts `OPTIONS` (CORS preflight) and `POST` only
- Validates JSON body has non-empty `name`, `email`, `message`
- Caps each field's length (200 / 200 / 5000 chars) to discourage spam
- Validates email format with a permissive regex
- Sends via Resend with:
  - **From**: `FROM_EMAIL` (your verified sender)
  - **To**: `TO_EMAIL`
  - **Reply-To**: the visitor's email — so hitting "Reply" in Gmail goes to them
  - **Subject**: `Hoelscher Automation contact: {name}`
- Returns `{ ok: true }` on success or `{ error: string }` on failure

## Limits

- Cloudflare Workers free tier: 100,000 requests/day
- Resend free tier: 100 emails/day, 3,000/month
- Both are 100× larger than expected contact-form volume

## Future enhancements (not implemented)

- Send an auto-reply confirmation to the visitor
- Notify a Discord webhook on submission
- Write submissions to a Cloudflare KV namespace for retention
- Add a honeypot field to filter bots
- Add Turnstile CAPTCHA if spam becomes a problem
