// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Generic subscription checkout PATTERN.
 *
 * Creates a Stripe Checkout session for the logged-in user and returns the
 * redirect URL. Adapt `metadata` and price selection to your product's model.
 *
 * Required env: STRIPE_SECRET_KEY, STRIPE_PRICE_PLUS, URL
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = process.env.URL || 'http://localhost:3000'
  const priceId = process.env.STRIPE_PRICE_PLUS
  if (!priceId) return NextResponse.json({ error: 'STRIPE_PRICE_PLUS not configured' }, { status: 500 })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email ?? undefined,
    // The webhook reads this to know who/what to upgrade.
    metadata: { kind: 'personal', userId: user.id },
    success_url: `${site}/?checkout=success`,
    cancel_url: `${site}/?checkout=cancel`,
  })

  return NextResponse.json({ url: session.url })
}
