import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// Server client bound to the request cookies — use in Server Components,
// Route Handlers, and Server Actions. Reads the logged-in user's session.
export function createSupabaseServer() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // set() throws in Server Components (read-only cookies).
            // Session refresh happens in middleware/route handlers instead.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Same as above — ignore in read-only contexts.
          }
        },
      },
    }
  )
}

// Service-role client — bypasses RLS. Create it LOCALLY inside an API route,
// never as a module-level singleton, so the key never leaks to the client.
// Use only for trusted server-side operations (e.g. tenant bootstrap).
//
//   const admin = createSupabaseAdmin()
//   await admin.from('tenants').insert(...)
export function createSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
