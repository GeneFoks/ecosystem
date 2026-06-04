import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { requireTenantId } from '@/lib/get-tenant'
import FactsEditor from '@/components/FactsEditor'

export default async function FactsPage() {
  const { tenantId } = await requireTenantId()
  const supabase = createSupabaseServer()
  const { data: facts } = await supabase
    .from('facts')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('sort_order', { ascending: true })

  return (
    <main style={{ minHeight: '100dvh', padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
        &larr; Dashboard
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '16px 0 24px' }}>Facts</h1>
      <FactsEditor tenantId={tenantId} initial={facts ?? []} />
    </main>
  )
}
