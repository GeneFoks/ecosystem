'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { OAUTH_PROVIDERS } from '@/lib/auth-providers'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const callbackUrl = () =>
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined

  const sendMagicLink = async () => {
    setError('')
    if (!email.trim()) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl() },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  const signInWithProvider = async (provider: (typeof OAUTH_PROVIDERS)[number]['id']) => {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl() },
    })
    if (error) setError(error.message)
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Sign in</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          Build and share your ecosystem.
        </p>

        {sent ? (
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 14, lineHeight: 1.6 }}>
            Check your email — we sent a sign-in link to <strong>{email}</strong>.
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMagicLink()}
              placeholder="you@email.com"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', marginBottom: 12 }}
            />
            <button
              onClick={sendMagicLink}
              disabled={loading || !email.trim()}
              style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: loading || !email.trim() ? 0.5 : 1 }}
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--text-muted)', fontSize: 12 }}>
              <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              or
              <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {OAUTH_PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => signInWithProvider(p.id)}
                style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}
              >
                {p.label}
              </button>
            ))}
          </>
        )}

        {error && (
          <p style={{ color: '#f87171', fontSize: 13, marginTop: 16 }}>{error}</p>
        )}
      </div>
    </main>
  )
}
