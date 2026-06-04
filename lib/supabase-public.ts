import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Cookie-less anon client for public, cacheable reads (ISR pages).
// No session — only sees data exposed by public SELECT policies.
export const supabasePublic = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)
