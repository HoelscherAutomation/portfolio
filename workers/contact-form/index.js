/**
 * Cloudflare Worker: contact-form
 *
 * Receives POST submissions from hoelscherautomation.com's contact form,
 * validates them, and sends an email via Resend.
 *
 * Required environment variables (set in Cloudflare dashboard or wrangler.toml):
 *   RESEND_API_KEY    (Secret)  — re_xxxxxxxx from resend.com dashboard
 *   FROM_EMAIL        (Plain)   — "Hoelscher Automation <contact@hoelscherautomation.com>"
 *                                 (or "onboarding@resend.dev" before domain verification)
 *   TO_EMAIL          (Plain)   — your inbox, e.g. "jordan.hoelscher@gmail.com"
 *   ALLOWED_ORIGIN    (Plain)   — "https://hoelscherautomation.com"
 *
 * Expects JSON body: { "name": string, "email": string, "message": string }
 * Returns JSON: { ok: true } on success or { error: string } on failure.
 */

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, env);
    }

    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!name || !email || !message) {
      return json({ error: 'Name, email, and message are required.' }, 400, env);
    }
    if (name.length > 200 || email.length > 200 || message.length > 5000) {
      return json({ error: 'One or more fields exceeded the maximum length.' }, 400, env);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Please provide a valid email address.' }, 400, env);
    }

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
        subject: `Hoelscher Automation contact: ${name}`,
        text: [
          `New contact form submission from hoelscherautomation.com`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          ``,
          `Message:`,
          message,
          ``,
          `---`,
          `Reply directly to this email to respond to ${name}.`,
        ].join('\n'),
      }),
    });

    if (!resendResp.ok) {
      const detail = await resendResp.text().catch(() => '');
      console.error('Resend send failed', resendResp.status, detail);
      return json({ error: 'Email delivery failed. Please try again or email directly.' }, 502, env);
    }

    return json({ ok: true }, 200, env);
  },
};

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body, status, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}
