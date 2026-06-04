'use client'

import { useState } from 'react'
import { supabase as supabaseClient } from '@/lib/supabase'
const supabase = supabaseClient as any
import type { Offer } from '@/lib/database.types'
import { inputStyle, labelStyle, cardStyle, primaryBtn, ghostBtn } from './editor-ui'

const KINDS = ['service', 'product', 'content', 'link']

type PillarOption = { id: string; title: string }

export default function OffersEditor({
  tenantId,
  initial,
  pillars,
}: {
  tenantId: string
  initial: Offer[]
  pillars: PillarOption[]
}) {
  const [rows, setRows] = useState<Offer[]>(initial)
  const [busy, setBusy] = useState(false)

  const addRow = async () => {
    setBusy(true)
    const { data } = await supabase
      .from('offers')
      .insert({ tenant_id: tenantId, title: '', sort_order: rows.length })
      .select()
      .single()
    if (data) setRows(r => [...r, data])
    setBusy(false)
  }

  const updateField = (id: string, key: keyof Offer, value: string | number | null) =>
    setRows(r => r.map(row => (row.id === id ? { ...row, [key]: value } : row)))

  const saveRow = async (row: Offer) => {
    setBusy(true)
    await supabase.from('offers').update({
      title: row.title,
      description: row.description,
      kind: row.kind,
      price_cents: row.price_cents,
      currency: row.currency,
      external_url: row.external_url,
      pillar_id: row.pillar_id,
      sort_order: row.sort_order,
    }).eq('id', row.id)
    setBusy(false)
  }

  const deleteRow = async (id: string) => {
    setBusy(true)
    await supabase.from('offers').delete().eq('id', id)
    setRows(r => r.filter(row => row.id !== id))
    setBusy(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {rows.map(row => (
        <div key={row.id} style={cardStyle}>
          <div>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} value={row.title} onChange={e => updateField(row.id, 'title', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={row.description} onChange={e => updateField(row.id, 'description', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kind</label>
              <select style={inputStyle} value={row.kind} onChange={e => updateField(row.id, 'kind', e.target.value)}>
                {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pillar</label>
              <select
                style={inputStyle}
                value={row.pillar_id ?? ''}
                onChange={e => updateField(row.id, 'pillar_id', e.target.value || null)}
              >
                <option value="">— none —</option>
                {pillars.map(p => <option key={p.id} value={p.id}>{p.title || '(untitled)'}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 120 }}>
              <label style={labelStyle}>Price (cents)</label>
              <input type="number" style={inputStyle} value={row.price_cents} onChange={e => updateField(row.id, 'price_cents', Number(e.target.value))} />
            </div>
            <div style={{ width: 90 }}>
              <label style={labelStyle}>Currency</label>
              <input style={inputStyle} value={row.currency} onChange={e => updateField(row.id, 'currency', e.target.value)} />
            </div>
            <div style={{ width: 80 }}>
              <label style={labelStyle}>Order</label>
              <input type="number" style={inputStyle} value={row.sort_order} onChange={e => updateField(row.id, 'sort_order', Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>External URL</label>
            <input style={inputStyle} value={row.external_url} onChange={e => updateField(row.id, 'external_url', e.target.value)} placeholder="https://" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={primaryBtn} disabled={busy} onClick={() => saveRow(row)}>Save</button>
            <button style={ghostBtn} disabled={busy} onClick={() => deleteRow(row.id)}>Delete</button>
          </div>
        </div>
      ))}
      <button style={{ ...primaryBtn, alignSelf: 'flex-start' }} disabled={busy} onClick={addRow}>
        + Add offer
      </button>
    </div>
  )
}
