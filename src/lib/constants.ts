export const COMPANY_NAME = 'Hoelscher Automation';
export const COMPANY_LEGAL_NAME = 'Hoelscher Automation LLC';
export const COMPANY_LOCATION = 'Ohio, USA';
export const COMPANY_TAGLINE = 'AI tools and automation for professional services teams';

export const CONSULTING_EMAIL = 'consulting@hoelscherautomation.com';
export const BOOKING_URL = 'https://calendar.app.google/vBKoPc1KpCooomgc6';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/jordanhoelscher/';
export const GITHUB_URL = 'https://github.com/HoelscherAutomation';

// Contact-form backend: a Cloudflare Worker that validates JSON
// submissions and sends them via Resend. Source + deployment guide at
// workers/contact-form/. Served at api.hoelscherautomation.com/contact
// via a Cloudflare Custom Domain binding on the Worker; the path
// segment reserves room for future Workers under the same api.* host
// (e.g. /cortex/demo, /scheduler/hooks) without re-architecting.
export const CONTACT_ENDPOINT = 'https://api.hoelscherautomation.com/contact';

// Cloudflare Web Analytics beacon token. To enable analytics:
//   1. Sign in to dash.cloudflare.com → Analytics → Web Analytics
//   2. Add hoelscherautomation.com as a new site
//   3. Copy the beacon token (long alphanumeric string)
//   4. Paste it as the value below
// While empty, the beacon script in Base.astro is not rendered.
export const CF_ANALYTICS_TOKEN = '';

export const SITE_URL = 'https://hoelscherautomation.com';
