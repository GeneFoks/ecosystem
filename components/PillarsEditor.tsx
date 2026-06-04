'use client'

import { useState } from 'react'
import { supabase as supabaseClient } from '@/lib/supabase'
const supabase = supabaseClient as any
import type { Pillar } from '@/lib/database.types'
import { inputStyle, labelStyle, cardStyle, primaryBtn, ghostBtn } from './editor-ui'

const STATUSES = ['active', 'building', 'idea']

export default function PillarsEditor({ tenantId, initial }: { tenantId: string; initial: Pillar[] }) {
  const [rows, setRows] = useState<Pillar[]>(initial)
  const [busy, setBusy] = useState(false)

  const addRow = async () => {
    setBusy(true)
    const { data } = await supabase
      .from('pillars')
      .insert({ tenant_id: tenantId, title: '', sort_order: rows.length })
      .select()
      .single()
    if (data) setRows(r => [...r, data])
    setBusy(false)
  }

  const updateField = (id: string, key: keyof Pillar, value: string | number) =>
    setRows(r => r.map(row => (row.id === id ? { ...row, [key]: value } : row)))

  const saveRow = async (row: Pillar) => {
    setBusy(true)
    await supabase.from('pillars').update({
      title: row.title,
      description: row.description,
      icon: row.icon,
      status: row.status,
      sort_order: row.sort_order,
    }).eq('id', row.id)
    setBusy(false)
  }

  const deleteRow = async (id: string) => {
    setBusy(true)
    await supabase.from('pillars').delete().eq('id', id)
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
              <label style={labelStyle}>Icon</label>
              <input style={inputStyle} value={row.icon} onChange={e => updateField(row.id, 'icon', e.target.value)} placeholder="e.g. star" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={row.status} onChange={e => updateField(row.id, 'status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ width: 90 }}>
              <label style={labelStyle}>Order</label>
              <input type="number" style={inputStyle} value={row.sort_order} onChange={e => updateField(row.id, 'sort_order', Number(e.target.value))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={primaryBtn} disabled={busy} onClick={() => saveRow(row)}>Save</button>
            <button style={ghostBtn} disabled={busy} onClick={() => deleteRow(row.id)}>Delete</button>
          </div>
        </div>
      ))}
      <button style={{ ...primaryBtn, alignSelf: 'flex-start' }} disabled={busy} onClick={addRow}>
        + Add pillar
      </button>
    </div>
  )
}
