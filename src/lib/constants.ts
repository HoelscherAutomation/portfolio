export const COMPANY_NAME = 'Hoelscher Automation';
export const COMPANY_LEGAL_NAME = 'Hoelscher Automation LLC';
export const COMPANY_LOCATION = 'Ohio, USA';
export const COMPANY_TAGLINE = 'AI tools and automation for professional services teams';

export const CONSULTING_EMAIL = 'consulting@hoelscherautomation.com';
export const BOOKING_URL = 'https://calendar.app.google/vBKoPc1KpCooomgc6';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/jordanhoelscher/';
export const GITHUB_URL = 'https://github.com/HoelscherAutomation';

// Contact-form backend. Send POST with JSON {name, email, message}.
// Currently points at the legacy Formspree form; replace with the
// deployed Cloudflare Worker URL once the Resend pipeline is verified.
// See workers/contact-form/README.md for deployment steps.
export const CONTACT_ENDPOINT = 'https://formspree.io/f/mrezorre';

// Cloudflare Web Analytics beacon token. To enable analytics:
//   1. Sign in to dash.cloudflare.com → Analytics → Web Analytics
//   2. Add hoelscherautomation.com as a new site
//   3. Copy the beacon token (long alphanumeric string)
//   4. Paste it as the value below
// While empty, the beacon script in Base.astro is not rendered.
export const CF_ANALYTICS_TOKEN = '';

export const SITE_URL = 'https://hoelscherautomation.com';
