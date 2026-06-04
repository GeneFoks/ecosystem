'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Fact } from '@/lib/database.types'
import { inputStyle, labelStyle, cardStyle, primaryBtn, ghostBtn } from './editor-ui'

export default function FactsEditor({ tenantId, initial }: { tenantId: string; initial: Fact[] }) {
  const [rows, setRows] = useState<Fact[]>(initial)
  const [busy, setBusy] = useState(false)

  const addRow = async () => {
    setBusy(true)
    const { data } = await supabase
      .from('facts')
      .insert({ tenant_id: tenantId, label: '', value: '', sort_order: rows.length })
      .select()
      .single()
    if (data) setRows(r => [...r, data])
    setBusy(false)
  }

  const updateField = (id: string, key: keyof Fact, value: string | number) =>
    setRows(r => r.map(row => (row.id === id ? { ...row, [key]: value } : row)))

  const saveRow = async (row: Fact) => {
    setBusy(true)
    await supabase.from('facts').update({
      label: row.label,
      value: row.value,
      sort_order: row.sort_order,
    }).eq('id', row.id)
    setBusy(false)
  }

  const deleteRow = async (id: string) => {
    setBusy(true)
    await supabase.from('facts').delete().eq('id', id)
    setRows(r => r.filter(row => row.id !== id))
    setBusy(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {rows.map(row => (
        <div key={row.id} style={cardStyle}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Label</label>
              <input style={inputStyle} value={row.label} onChange={e => updateField(row.id, 'label', e.target.value)} placeholder="e.g. Experience" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Value</label>
              <input style={inputStyle} value={row.value} onChange={e => updateField(row.id, 'value', e.target.value)} placeholder="e.g. 10 years" />
            </div>
            <div style={{ width: 80 }}>
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
        + Add fact
      </button>
    </div>
  )
}
