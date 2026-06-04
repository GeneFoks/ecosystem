/**
 * Generic in-app notification helper.
 *
 * Extend `NotificationType` with your product's events as you build them.
 * Calls the /api/notifications route which writes a `notifications` row and
 * fires a best-effort web-push to the recipient.
 */
export type NotificationType =
  | 'system'
  | 'message'
  | 'mention'
  // add your own domain types here, e.g. 'order_shipped' | 'invite' | ...

export type CreateNotificationParams = {
  userId: string
  type: NotificationType
  title: string
  body?: string
  link?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } catch {
    /* best-effort — never block UI on notification delivery */
  }
}
