import type { Config } from 'tailwindcss'

/**
 * Keep these values mirrored with lib/theme.ts (Tailwind can't import TS at
 * build-time). Tokens are PLACEHOLDERS — swap for the real Ecosystem palette.
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B10',
        surface1: '#13131C',
        surface2: '#1B1B27',
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        accent: '#22D3EE',
        'text-primary': '#F4F4FB',
        muted: '#9CA3C4',
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
