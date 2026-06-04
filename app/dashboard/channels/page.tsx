import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { requireTenantId } from '@/lib/get-tenant'
import ChannelsEditor from '@/components/ChannelsEditor'

export default async function ChannelsPage() {
  const { tenantId } = await requireTenantId()
  const supabase = createSupabaseServer()
  const { data: channels } = await supabase
    .from('channels')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('sort_order', { ascending: true })

  return (
    <main style={{ minHeight: '100dvh', padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
        &larr; Dashboard
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '16px 0 24px' }}>Channels</h1>
      <ChannelsEditor tenantId={tenantId} initial={channels ?? []} />
    </main>
  )
}
