import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './providers'
import PWARegister from '@/components/PWARegister'

export const metadata: Metadata = {
  title: 'Ecosystem Platform',
  description: 'Placeholder description — update in app/layout.tsx.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ecosystem',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0B0B10" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <PWARegister />
        </AuthProvider>
      </body>
    </html>
  )
}
