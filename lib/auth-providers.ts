import type { Provider } from '@supabase/supabase-js'

// OAuth providers shown on the login page. Add a new one (e.g. a future
// 'Besti' provider) by appending one entry here — no UI changes needed.
export type OAuthProviderConfig = {
  id: Provider
  label: string
}

export const OAUTH_PROVIDERS: OAuthProviderConfig[] = [
  { id: 'google', label: 'Continue with Google' },
]
