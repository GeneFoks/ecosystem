'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Channel } from '@/lib/database.types'
import { inputStyle, labelStyle, cardStyle, primaryBtn, ghostBtn } from './editor-ui'

export default function ChannelsEditor({ tenantId, initial }: { tenantId: string; initial: Channel[] }) {
  const [rows, setRows] = useState<Channel[]>(initial)
  const [busy, setBusy] = useState(false)

  const addRow = async () => {
    setBusy(true)
    const { data } = await supabase
      .from('channels')
      .insert({ tenant_id: tenantId, platform: '', url: '', sort_order: rows.length })
      .select()
      .single()
    if (data) setRows(r => [...r, data])
    setBusy(false)
  }

  const updateField = (id: string, key: keyof Channel, value: string | number) =>
    setRows(r => r.map(row => (row.id === id ? { ...row, [key]: value } : row)))

  const saveRow = async (row: Channel) => {
    setBusy(true)
    await supabase.from('channels').update({
      platform: row.platform,
      url: row.url,
      description: row.description,
      sort_order: row.sort_order,
    }).eq('id', row.id)
    setBusy(false)
  }

  const deleteRow = async (id: string) => {
    setBusy(true)
    await supabase.from('channels').delete().eq('id', id)
    setRows(r => r.filter(row => row.id !== id))
    setBusy(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {rows.map(row => (
        <div key={row.id} style={cardStyle}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Platform</label>
              <input style={inputStyle} value={row.platform} onChange={e => updateField(row.id, 'platform', e.target.value)} placeholder="e.g. Instagram" />
            </div>
            <div style={{ width: 80 }}>
              <label style={labelStyle}>Order</label>
              <input type="number" style={inputStyle} value={row.sort_order} onChange={e => updateField(row.id, 'sort_order', Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>URL</label>
            <input style={inputStyle} value={row.url} onChange={e => updateField(row.id, 'url', e.target.value)} placeholder="https://" />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <input style={inputStyle} value={row.description} onChange={e => updateField(row.id, 'description', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={primaryBtn} disabled={busy} onClick={() => saveRow(row)}>Save</button>
            <button style={ghostBtn} disabled={busy} onClick={() => deleteRow(row.id)}>Delete</button>
          </div>
        </div>
      ))}
      <button style={{ ...primaryBtn, alignSelf: 'flex-start' }} disabled={busy} onClick={addRow}>
        + Add channel
      </button>
    </div>
  )
}
