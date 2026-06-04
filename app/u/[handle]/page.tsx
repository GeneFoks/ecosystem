import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabasePublic } from '@/lib/supabase-public'

// ── THEME TOKENS (placeholder) ──
// Swap these for the real design system later. All visuals reference THEME.
const THEME = {
  bg: '#0B0B10',
  surface: '#13131C',
  surface2: '#1B1B27',
  border: '#262636',
  text: '#F4F4FB',
  muted: '#9CA3C4',
  accent: '#6366F1',
  font: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  radius: 16,
  maxWidth: 720,
}

export const revalidate = 60

type Params = { params: { handle: string } }

async function loadTenant(handle: string) {
  const { data: tenant } = await supabasePublic
    .from('tenants')
    .select('id, handle')
    .eq('handle', handle)
    .maybeSingle()
  return tenant
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const tenant = await loadTenant(params.handle)
  if (!tenant) return { title: 'Not found' }
  const { data: person } = await supabasePublic
    .from('persons')
    .select('name, mission, photo_url')
    .eq('tenant_id', tenant.id)
    .maybeSingle()

  const title = person?.name || params.handle
  const description = person?.mission || 'Personal ecosystem'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: person?.photo_url ? [{ url: person.photo_url }] : [],
    },
  }
}

function formatPrice(cents: number, currency: string) {
  if (!cents) return ''
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`
  }
}

export default async function PublicPage({ params }: Params) {
  const tenant = await loadTenant(params.handle)
  if (!tenant) notFound()
  const tid = tenant.id

  const [{ data: person }, { data: pillars }, { data: offers }, { data: facts }, { data: channels }] =
    await Promise.all([
      supabasePublic.from('persons').select('*').eq('tenant_id', tid).maybeSingle(),
      supabasePublic.from('pillars').select('*').eq('tenant_id', tid).eq('status', 'active').order('sort_order'),
      supabasePublic.from('offers').select('*').eq('tenant_id', tid).order('sort_order'),
      supabasePublic.from('facts').select('*').eq('tenant_id', tid).order('sort_order'),
      supabasePublic.from('channels').select('*').eq('tenant_id', tid).order('sort_order'),
    ])

  const offersByPillar = new Map<string, typeof offers>()
  const looseOffers: NonNullable<typeof offers> = []
  for (const o of offers ?? []) {
    if (o.pillar_id) {
      const list = offersByPillar.get(o.pillar_id) ?? []
      list.push(o)
      offersByPillar.set(o.pillar_id, list)
    } else {
      looseOffers.push(o)
    }
  }

  const section: React.CSSProperties = { marginBottom: 48 }
  const h2: React.CSSProperties = { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: THEME.muted, marginBottom: 16 }
  const card: React.CSSProperties = { background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: THEME.radius, padding: 18 }

  return (
    <main style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: THEME.font }}>
      <div style={{ maxWidth: THEME.maxWidth, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Hero */}
        <header style={{ ...section, textAlign: 'center' }}>
          {person?.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={person.photo_url} alt={person?.name || ''} style={{ width: 112, height: 112, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 18px', display: 'block' }} />
          )}
          <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>{person?.name || params.handle}</h1>
          {person?.mission && <p style={{ fontSize: 18, color: THEME.muted, maxWidth: 520, margin: '0 auto' }}>{person.mission}</p>}
          {person?.location && <p style={{ fontSize: 14, color: THEME.muted, marginTop: 10 }}>{person.location}</p>}
          {person?.bio && <p style={{ fontSize: 15, lineHeight: 1.7, marginTop: 20, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>{person.bio}</p>}
        </header>

        {/* Pillars */}
        {pillars && pillars.length > 0 && (
          <section style={section}>
            <h2 style={h2}>Pillars</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {pillars.map(p => (
                <div key={p.id} style={card}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{p.title}</h3>
                  {p.description && <p style={{ color: THEME.muted, fontSize: 15, lineHeight: 1.6 }}>{p.description}</p>}

                  {/* Offers under this pillar */}
                  {(offersByPillar.get(p.id) ?? []).map(o => (
                    <OfferRow key={o.id} offer={o} />
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Loose offers (no pillar) */}
        {looseOffers.length > 0 && (
          <section style={section}>
            <h2 style={h2}>Offers</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {looseOffers.map(o => (
                <div key={o.id} style={card}><OfferRow offer={o} /></div>
              ))}
            </div>
          </section>
        )}

        {/* Facts */}
        {facts && facts.length > 0 && (
          <section style={section}>
            <h2 style={h2}>About</h2>
            <div style={{ ...card, display: 'grid', gap: 10 }}>
              {facts.map(f => (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 15 }}>
                  <span style={{ color: THEME.muted }}>{f.label}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{f.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Channels */}
        {channels && channels.length > 0 && (
          <section style={section}>
            <h2 style={h2}>Channels</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {channels.map(c => (
                <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: THEME.text }}>
                  <span style={{ fontWeight: 600 }}>{c.platform}</span>
                  {c.description && <span style={{ color: THEME.muted, fontSize: 14 }}>{c.description}</span>}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Gate */}
        <footer style={{ textAlign: 'center', marginTop: 64, paddingTop: 32, borderTop: `1px solid ${THEME.border}` }}>
          <a href="/login" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 12, background: THEME.accent, color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
            Create your own ecosystem
          </a>
        </footer>

      </div>
    </main>
  )

  function OfferRow({ offer }: { offer: NonNullable<typeof offers>[number] }) {
    const price = formatPrice(offer.price_cents, offer.currency)
    return (
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{offer.title}</div>
          {offer.description && <div style={{ color: THEME.muted, fontSize: 14, marginTop: 4 }}>{offer.description}</div>}
        </div>
        <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          {price && <div style={{ fontWeight: 700 }}>{price}</div>}
          {offer.external_url && (
            <a href={offer.external_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: THEME.accent, textDecoration: 'none' }}>
              View
            </a>
          )}
        </div>
      </div>
    )
  }
}
