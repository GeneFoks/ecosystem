'use client'

import { useState } from 'react'
import { supabase as supabaseClient } from '@/lib/supabase'
const supabase = supabaseClient as any

type PersonFields = {
  name: string
  mission: string
  bio: string
  photo_url: string
  location: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: 'var(--text-muted)',
  marginBottom: 6,
}

export default function PersonForm({
  tenantId,
  initial,
}: {
  tenantId: string
  initial: PersonFields
}) {
  const [fields, setFields] = useState<PersonFields>(initial)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')

  const set = (key: keyof PersonFields, value: string) =>
    setFields(f => ({ ...f, [key]: value }))

  const uploadPhoto = async (file: File) => {
    setUploading(true)
    setStatus('')
    const ext = file.name.split('.').pop()
    const path = `${tenantId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) {
      setStatus(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    set('photo_url', data.publicUrl)
    setUploading(false)
  }

  const save = async () => {
    setSaving(true)
    setStatus('')
    const { error } = await supabase
      .from('persons')
      .upsert(
        { tenant_id: tenantId, ...fields, updated_at: new Date().toISOString() },
        { onConflict: 'tenant_id' }
      )
    setSaving(false)
    setStatus(error ? `Error: ${error.message}` : 'Saved')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={labelStyle}>Photo</label>
        {fields.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fields.photo_url}
            alt=""
            style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', marginBottom: 10, display: 'block' }}
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
          style={{ fontSize: 13, color: 'var(--text-muted)' }}
        />
        {uploading && <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>Uploading…</span>}
      </div>

      <div>
        <label style={labelStyle}>Name</label>
        <input style={inputStyle} value={fields.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
      </div>

      <div>
        <label style={labelStyle}>Mission</label>
        <input style={inputStyle} value={fields.mission} onChange={e => set('mission', e.target.value)} placeholder="One line about what you do" />
      </div>

      <div>
        <label style={labelStyle}>Bio</label>
        <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={4} value={fields.bio} onChange={e => set('bio', e.target.value)} placeholder="A few sentences about you" />
      </div>

      <div>
        <label style={labelStyle}>Location</label>
        <input style={inputStyle} value={fields.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{ padding: '12px 20px', borderRadius: 10, background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {status && <span style={{ fontSize: 14, color: status === 'Saved' ? '#4ade80' : '#f87171' }}>{status}</span>}
      </div>
    </div>
  )
}
