import { NextRequest, NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/push'

/**
 * Internal push-send endpoint. Guard with INTERNAL_API_SECRET so only your
 * own server / cron functions can trigger pushes to arbitrary users.
 *
 * POST { userId, title, body?, link? }  with header  x-internal-secret: <secret>
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, title, body, link } = await req.json()
  if (!userId || !title) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  await sendPushToUser(userId, { title, body, link })
  return NextResponse.json({ ok: true })
}
