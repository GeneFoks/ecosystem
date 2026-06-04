import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { requireTenantId } from '@/lib/get-tenant'
import OffersEditor from '@/components/OffersEditor'

export default async function OffersPage() {
  const { tenantId } = await requireTenantId()
  const supabase = createSupabaseServer()

  const [{ data: offers }, { data: pillars }] = await Promise.all([
    supabase.from('offers').select('*').eq('tenant_id', tenantId).order('sort_order', { ascending: true }),
    supabase.from('pillars').select('id, title').eq('tenant_id', tenantId).order('sort_order', { ascending: true }),
  ])

  return (
    <main style={{ minHeight: '100dvh', padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
        &larr; Dashboard
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '16px 0 24px' }}>Offers</h1>
      <OffersEditor tenantId={tenantId} initial={offers ?? []} pillars={pillars ?? []} />
    </main>
  )
}
