import type { Config } from '@netlify/functions'

/**
 * Netlify Scheduled Function — PATTERN.
 *
 * Fires on a cron schedule and calls an internal API route, authenticating
 * with a shared secret (INTERNAL_API_SECRET) so only the scheduler can hit it.
 * Duplicate this file per job and point it at the route you need.
 */
export default async (req: Request) => {
  const secret = Netlify.env.get('INTERNAL_API_SECRET')
  const site   = Netlify.env.get('URL') || 'http://localhost:3000'
  if (!secret) {
    return new Response('INTERNAL_API_SECRET not configured', { status: 500 })
  }

  const res = await fetch(`${site}/api/your-cron-endpoint`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-internal-secret': secret,
    },
  })
  const body = await res.text()
  console.log('[example-cron] response:', res.status, body)
  return new Response(body, { status: res.status, headers: { 'content-type': 'application/json' } })
}

export const config: Config = {
  schedule: '0 18 * * *', // every day at 18:00 UTC — change as needed
}
