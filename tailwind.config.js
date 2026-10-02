/** @type {import('tailwindcss').Config} */
// Colours carried over from the previous site's tokens.css so the brand stays the same.
module.exports = {
  content: ['./app/**/*.{js,jsx,mdx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cosmos: {
          950: '#04000f',
          900: '#0d0028',
          800: '#18013d',
          700: '#220052',
          600: '#3b0080',
          500: '#6C3FB5',
          400: '#9333ea',
          300: '#b67ff5',
          200: '#e0c8ff',
          100: '#f5f0ff',
        },
        gold: { DEFAULT: '#f59e0b', soft: '#fbbf24', deep: '#C9A84C' },
        rose: { DEFAULT: '#e91e63' },
        aqua: { DEFAULT: '#14b8a6' },
        ink: { 1: '#f0eaff', 2: '#9d8ec0', 3: '#5c5078' },
      },
      fontFamily: {
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        line: 'rgba(108,63,181,.22)',
        'line-2': 'rgba(108,63,181,.42)',
      },
      backgroundImage: {
        'gold-grad': 'linear-gradient(135deg,#fbbf24 0%,#f59e0b 45%,#C9A84C 100%)',
        'violet-grad': 'linear-gradient(135deg,#9333ea 0%,#6C3FB5 55%,#3b0080 100%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(147,51,234,.35)',
        'glow-gold': '0 0 32px rgba(245,158,11,.35)',
      },
      keyframes: {
        twinkle: { '0%,100%': { opacity: '.25' }, '50%': { opacity: '1' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        // Continuous left-scroll for the specialist carousel (track holds the list twice)
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        // Same track, moving right (language band rows drift toward / away from the centre)
        'marquee-rev': { from: { transform: 'translateX(-50%)' }, to: { transform: 'translateX(0)' } },
        // Dashes travelling along the language band's connector lines
        dash: { to: { strokeDashoffset: '-24' } },
        // Rings breathing around the language band's centre
        breathe: { '0%,100%': { transform: 'scale(1)', opacity: '.55' }, '50%': { transform: 'scale(1.04)', opacity: '1' } },
      },
      animation: {
        twinkle: 'twinkle 4s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        'spin-slow': 'spin 120s linear infinite',
        marquee: 'marquee 60s linear infinite',
        'marquee-rev': 'marquee-rev 60s linear infinite',
        dash: 'dash 1.2s linear infinite',
        breathe: 'breathe 5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
