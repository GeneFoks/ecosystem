/**
 * ─── CENTRAL DESIGN TOKENS ───
 *
 * Single source of truth for brand colors & fonts.
 * These are PLACEHOLDERS — replace with the real Ecosystem tokens.
 *
 * Where they are consumed:
 *  - app/globals.css   → CSS custom properties (:root) — keep in sync manually
 *  - tailwind.config.ts → tailwind color/font scale — keep in sync manually
 *  - app/layout.tsx     → theme-color meta + metadata
 *
 * (CSS/Tailwind can't import TS values at build-time, so when you change a
 *  token here, mirror it in globals.css and tailwind.config.ts.)
 */

export const theme = {
  colors: {
    bg: '#0B0B10',          // page background        (placeholder)
    surface1: '#13131C',    // cards / panels         (placeholder)
    surface2: '#1B1B27',    // raised surfaces        (placeholder)
    border: 'rgba(255,255,255,0.10)',
    primary: '#6366F1',     // brand primary          (placeholder)
    primaryDark: '#4F46E5', // brand primary (hover)  (placeholder)
    accent: '#22D3EE',      // secondary accent       (placeholder)
    success: '#34D399',
    danger: '#F87171',
    textPrimary: '#F4F4FB', // (placeholder)
    textMuted: '#9CA3C4',   // (placeholder)
  },
  fonts: {
    heading: "'Plus Jakarta Sans', sans-serif", // (placeholder)
    body: "'Plus Jakarta Sans', sans-serif",    // (placeholder)
  },
  brand: {
    name: 'Ecosystem',
    domain: 'example.com',
    tagline: 'Your tagline here',
  },
} as const

export type Theme = typeof theme
