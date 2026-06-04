import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabasePublic } from '@/lib/supabase-public'

// ── SPACEX-STYLE THEME TOKENS ──
// Pure black, high contrast, bold uppercase typography, sharp edges.
const THEME = {
  bg: '#000000',
  surface: '#0A0A0A',
  surface2: '#111111',
  border: '#1F1F1F',
  borderStrong: '#333333',
  text: '#FFFFFF',
  muted: '#9A9A9A',
  accent: '#FFFFFF',
  font: '"Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif',
  maxWidth: 1100,
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

  // ── Shared styles ──
  const wrap: React.CSSProperties = { maxWidth: THEME.maxWidth, margin: '0 auto', padding: '0 24px' }
  const sectionLabel: React.CSSProperties = {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 4,
    color: THEME.muted,
    fontWeight: 700,
    marginBottom: 28,
  }
  const ctaOutline: React.CSSProperties = {
    display: 'inline-block',
    padding: '14px 32px',
    border: `1px solid ${THEME.text}`,
    color: THEME.text,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textDecoration: 'none',
    background: 'transparent',
  }

  return (
    <main style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: THEME.font, WebkitFontSmoothing: 'antialiased' }}>

      {/* ── HERO ── full-bleed, cinematic ── */}
      <section
        style={{
          position: 'relative',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        {person?.photo_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={person.photo_url}
              alt={person?.name || ''}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 30%',
                opacity: 0.55,
                filter: 'grayscale(15%) contrast(1.05)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.95) 100%)`,
              }}
            />
          </>
        )}
        <div style={{ ...wrap, position: 'relative', width: '100%', paddingBottom: 64 }}>
          <h1
            style={{
              fontSize: 'clamp(40px, 8vw, 92px)',
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: -1,
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {person?.name || params.handle}
          </h1>
          {person?.mission && (
            <p
              style={{
                fontSize: 'clamp(16px, 2.4vw, 22px)',
                color: THEME.text,
                maxWidth: 680,
                marginTop: 24,
                lineHeight: 1.4,
                fontWeight: 400,
              }}
            >
              {person.mission}
            </p>
          )}
          {person?.location && (
            <p style={{ fontSize: 13, color: THEME.muted, marginTop: 18, letterSpacing: 3, textTransform: 'uppercase' }}>
              {person.location}
            </p>
          )}
        </div>
      </section>

      {/* ── BIO ── */}
      {person?.bio && (
        <section style={{ borderBottom: `1px solid ${THEME.border}`, padding: '72px 0' }}>
          <div style={wrap}>
            <div style={sectionLabel}>About</div>
            <p style={{ fontSize: 'clamp(18px, 2.4vw, 26px)', lineHeight: 1.5, maxWidth: 820, fontWeight: 300 }}>
              {person.bio}
            </p>
          </div>
        </section>
      )}

      {/* ── PILLARS ── full-width bands ── */}
      {pillars && pillars.length > 0 && (
        <section style={{ borderBottom: `1px solid ${THEME.border}`, padding: '72px 0' }}>
          <div style={wrap}>
            <div style={sectionLabel}>Ecosystem</div>
            <div style={{ display: 'grid', gap: 1, background: THEME.border, border: `1px solid ${THEME.border}` }}>
              {pillars.map(p => {
                const pillarOffers = offersByPillar.get(p.id) ?? []
                return (
                  <div key={p.id} style={{ background: THEME.bg, padding: '40px 36px' }}>
                    <h3
                      style={{
                        fontSize: 'clamp(24px, 4vw, 40px)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: -0.5,
                        margin: 0,
                      }}
                    >
                      {p.title}
                    </h3>
                    {p.description && (
                      <p style={{ color: THEME.muted, fontSize: 17, lineHeight: 1.6, marginTop: 14, maxWidth: 720 }}>
                        {p.description}
                      </p>
                    )}

                    {pillarOffers.length > 0 && (
                      <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
                        {pillarOffers.map(o => (
                          <OfferRow key={o.id} offer={o} />
                        ))}
                      </div>
                    )}

                    {p.link_url && (
                      <a
                        href={p.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...ctaOutline, marginTop: 28 }}
                      >
                        Learn more &nbsp;&rarr;
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── LOOSE OFFERS ── */}
      {looseOffers.length > 0 && (
        <section style={{ borderBottom: `1px solid ${THEME.border}`, padding: '72px 0' }}>
          <div style={wrap}>
            <div style={sectionLabel}>Offers</div>
            <div style={{ display: 'grid', gap: 1, background: THEME.border, border: `1px solid ${THEME.border}` }}>
              {looseOffers.map(o => (
                <div key={o.id} style={{ background: THEME.bg, padding: '28px 36px' }}>
                  <OfferRow offer={o} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FACTS ── stat grid ── */}
      {facts && facts.length > 0 && (
        <section style={{ borderBottom: `1px solid ${THEME.border}`, padding: '72px 0' }}>
          <div style={wrap}>
            <div style={sectionLabel}>By the numbers</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: THEME.border, border: `1px solid ${THEME.border}` }}>
              {facts.map(f => (
                <div key={f.id} style={{ background: THEME.bg, padding: '32px 28px' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>{f.value}</div>
                  <div style={{ color: THEME.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginTop: 8 }}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CHANNELS ── */}
      {channels && channels.length > 0 && (
        <section style={{ borderBottom: `1px solid ${THEME.border}`, padding: '72px 0' }}>
          <div style={wrap}>
            <div style={sectionLabel}>Connect</div>
            <div style={{ display: 'grid', gap: 1, background: THEME.border, border: `1px solid ${THEME.border}` }}>
              {channels.map(c => (
                <a
                  key={c.id}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: THEME.bg, padding: '24px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: THEME.text }}
                >
                  <span style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>{c.platform}</span>
                  <span style={{ color: THEME.muted, fontSize: 14 }}>{c.description || 'Visit →'}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GATE / FOOTER ── */}
      <footer style={{ padding: '96px 0', textAlign: 'center' }}>
        <div style={wrap}>
          <a href="/login" style={ctaOutline}>
            Create your own ecosystem
          </a>
        </div>
      </footer>

    </main>
  )

  function OfferRow({ offer }: { offer: NonNullable<typeof offers>[number] }) {
    const price = formatPrice(offer.price_cents, offer.currency)
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, paddingTop: 12, borderTop: `1px solid ${THEME.border}` }}>
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{offer.title}</div>
          {offer.description && <div style={{ color: THEME.muted, fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>{offer.description}</div>}
        </div>
        <div style={{ textAlign: 'right', whiteSpace: 'nowrap', paddingTop: 4 }}>
          {price && <div style={{ fontWeight: 800, fontSize: 16 }}>{price}</div>}
          {offer.external_url && (
            <a href={offer.external_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: THEME.text, textDecoration: 'underline', letterSpacing: 1, textTransform: 'uppercase' }}>
              View
            </a>
          )}
        </div>
      </div>
    )
  }
}
