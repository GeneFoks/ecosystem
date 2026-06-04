import { createSupabaseServer } from '@/lib/supabase-server'

export default async function Dashboard() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ minHeight: '100dvh', padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</h1>
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}
          >
            Sign out
          </button>
        </form>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Signed in as {user?.email}.
      </p>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { href: '/dashboard/person', label: 'Profile' },
          { href: '/dashboard/pillars', label: 'Projects' },
          { href: '/dashboard/offers', label: 'Offers' },
          { href: '/dashboard/facts', label: 'Facts' },
          { href: '/dashboard/channels', label: 'Channels' },
        ].map(item => (
          <a key={item.href} href={item.href} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
            {item.label}
          </a>
        ))}
      </nav>
    </main>
  )
}
