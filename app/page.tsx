export default function Home() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)' }}>
        Ecosystem Platform
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.6 }}>
        Empty starter scaffold. The reusable skeleton (Supabase, web-push, email,
        Stripe, cron) is wired up — start building your product here.
      </p>
    </main>
  )
}
