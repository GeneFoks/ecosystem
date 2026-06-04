import { redirect } from 'next/navigation'
import { createSupabaseServer } from './supabase-server'

// Resolves the current user's tenant id for dashboard pages.
// Redirects to /login or /dashboard if missing.
export async function requireTenantId(): Promise<{ tenantId: string; userId: string }> {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) redirect('/dashboard')
  return { tenantId: membership.tenant_id, userId: user.id }
}
