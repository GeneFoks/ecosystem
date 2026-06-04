import type { CSSProperties } from 'react'

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  outline: 'none',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: 'var(--text-muted)',
  marginBottom: 5,
}

export const cardStyle: CSSProperties = {
  background: 'var(--surface-1)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

export const primaryBtn: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 10,
  background: 'var(--primary)',
  border: 'none',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
}

export const ghostBtn: CSSProperties = {
  padding: '8px 14px',
  borderRadius: 10,
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: 14,
}
