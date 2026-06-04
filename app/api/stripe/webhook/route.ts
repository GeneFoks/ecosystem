// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

/**
 * Generic Stripe webhook PATTERN.
 *
 * Verifies the signature, then handles the common subscription lifecycle:
 *  - checkout.session.completed        → mark user as paid
 *  - customer.subscription.deleted     → mark user as free
 *  - invoice.payment_failed            → (optional) flag account
 *
 * Adapt the DB writes (`users.is_plus` etc.) to your schema.
 *
 * Required env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 */
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 })
  }

  const db = admin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (userId) {
        await db.from('users').update({
          is_plus: true,
          stripe_customer_id: session.customer as string,
        }).eq('id', userId)
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await db.from('users').update({ is_plus: false }).eq('stripe_customer_id', sub.customer as string)
      break
    }
    case 'invoice.payment_failed': {
      // Optional: flag the account / send a dunning email here.
      break
    }
  }

  return NextResponse.json({ received: true })
}
