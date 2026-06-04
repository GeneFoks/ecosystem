import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Browser client (cookie-based via @supabase/ssr) — single shared instance
// for Client Components. Storing the session in cookies lets the server-side
// /auth/callback route complete the PKCE code exchange.
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
