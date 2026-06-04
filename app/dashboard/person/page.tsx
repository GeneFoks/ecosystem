import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { requireTenantId } from '@/lib/get-tenant'
import type { Person } from '@/lib/database.types'
import PersonForm from '@/components/PersonForm'

export default async function PersonPage() {
  const supabase = createSupabaseServer()
  const { tenantId } = await requireTenantId()

  const { data: person } = await supabase
    .from('persons')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle<Person>()

  return (
    <main style={{ minHeight: '100dvh', padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
        &larr; Dashboard
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '16px 0 24px' }}>Your profile</h1>
      <PersonForm
        tenantId={tenantId}
        initial={{
          name: person?.name ?? '',
          mission: person?.mission ?? '',
          bio: person?.bio ?? '',
          photo_url: person?.photo_url ?? '',
          location: person?.location ?? '',
        }}
      />
    </main>
  )
}
