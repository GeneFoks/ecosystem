import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Ensure the user has a tenant. On first login they have none, so we
  // bootstrap one (creates tenant + owner membership + empty person).
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) {
    const desiredHandle = (user.email ?? 'user').split('@')[0]
    // Cast to bypass rpc type inference (Netlify build was rejecting the
    // typed args). The function is defined in migration_002_bootstrap.sql.
    const { error } = await (supabase.rpc as any)('bootstrap_tenant', {
      desired_handle: desiredHandle,
    })
    if (error) throw error
  }

  return <>{children}</>
}
