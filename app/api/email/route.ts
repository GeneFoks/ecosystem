import { NextRequest, NextResponse } from 'next/server'

/**
 * Generic transactional email via Resend (raw HTTP, no SDK).
 *
 * POST { to, subject, title, body, ctaText?, ctaUrl? }
 *
 * This is a minimal, brand-agnostic starter. Add typed templates as your
 * product grows (e.g. switch on a `type` field like the original Bestie route).
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'Ecosystem <noreply@example.com>'

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
  })
  return res.ok
}

function emailTemplate(title: string, body: string, ctaText?: string, ctaUrl?: string) {
  const cta = ctaText && ctaUrl
    ? `<a href="${ctaUrl}" style="display:inline-block;padding:12px 28px;border-radius:12px;background:#6366F1;color:#fff;font-weight:700;font-size:14px;text-decoration:none;">${ctaText}</a>`
    : ''
  return `
    <div style="background:#0B0B10;padding:40px 24px;font-family:sans-serif;">
      <div style="max-width:520px;margin:0 auto;">
        <div style="background:#13131C;border:1px solid rgba(99,102,241,0.2);border-radius:20px;padding:32px;">
          <h1 style="font-size:22px;color:#F4F4FB;margin:0 0 12px;">${title}</h1>
          <p style="font-size:15px;color:#9CA3C4;line-height:1.7;margin:0 0 24px;">${body}</p>
          ${cta}
        </div>
      </div>
    </div>
  `
}

export async function POST(req: NextRequest) {
  try {
    if (!RESEND_API_KEY) {
      return NextResponse.json({ ok: false, error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    const { to, subject, title, body, ctaText, ctaUrl } = await req.json()
    if (!to || !subject || !title) {
      return NextResponse.json({ error: 'Missing fields (to, subject, title)' }, { status: 400 })
    }

    const html = emailTemplate(title, body || '', ctaText, ctaUrl)
    const ok = await sendEmail(to, subject, html)

    return NextResponse.json({ ok })
  } catch (e: any) {
    console.error('[email] error:', e?.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
