'use client'

/**
 * Minimal generic onboarding skeleton (2 steps).
 * Persists progress to localStorage and writes name/bio to the `users` row.
 * Extend with your product's steps. No Bestie-specific logic here.
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TOTAL_STEPS = 2

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  // Restore progress
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_progress')
    if (saved) {
      try {
        const p = JSON.parse(saved)
        setStep(p.step || 1)
        setName(p.name || '')
        setBio(p.bio || '')
      } catch {}
    }
  }, [])

  // Persist progress
  useEffect(() => {
    localStorage.setItem('onboarding_progress', JSON.stringify({ step, name, bio }))
  }, [step, name, bio])

  const finish = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({ full_name: name, bio }).eq('id', user.id)
    }
    localStorage.removeItem('onboarding_progress')
    router.push('/')
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          Step {step} of {TOTAL_STEPS}
        </p>

        {step === 1 && (
          <>
            <h1 style={{ fontSize: 22, marginBottom: 16 }}>What should we call you?</h1>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontSize: 22, marginBottom: 16 }}>Tell us a bit about you</h1>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Short bio"
              rows={4}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
            />
          </>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !name.trim()}
              style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: step === 1 && !name.trim() ? 0.5 : 1 }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              {saving ? '…' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
