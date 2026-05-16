/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#0A0E1A',
        'bg': '#0E1729',
        'bg-elevated': '#18243D',
        'bg-elevated-hi': '#1F2D4A',
        'border-subtle': 'rgba(255,255,255,0.06)',
        'border-default': 'rgba(255,255,255,0.10)',
        'border-hover': 'rgba(255,255,255,0.18)',
        'text-primary': '#E8EBF2',
        'text-secondary': '#A0AABB',
        'text-muted': '#6B7587',
        'brand-orange': '#E58E26',
        'brand-orange-bright': '#F0A653',
        'brand-blue': '#4D8DF5',
        'navy-deep': '#1B2A4A',
        'ok': '#34D399',
        'warn': '#F59E0B',
        'err': '#EF4444',
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        container: '1120px',
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        lg: '8px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
        reveal: '700ms',
      },
    },
  },
  plugins: [],
};
