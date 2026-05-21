import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

const PLACEHOLDER_URL = 'YOUR_PROJECT_REF'
const PLACEHOLDER_KEY = 'your_supabase_anon_public_key_here'

export function isSupabaseConfigured(): boolean {
  if (!url || !anonKey) return false
  if (url.includes(PLACEHOLDER_URL)) return false
  if (anonKey === PLACEHOLDER_KEY || anonKey.length < 100) return false
  return true
}

export function getSupabaseConfigError(): string | null {
  if (!url || !anonKey) {
    return 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env'
  }
  if (url.includes(PLACEHOLDER_URL)) {
    return 'Replace YOUR_PROJECT_REF in .env with your real Supabase project URL, then save & restart npm run dev'
  }
  if (anonKey === PLACEHOLDER_KEY || !anonKey.startsWith('eyJ')) {
    return 'Replace the anon key in .env with your real key from Supabase → Settings → API, then save & restart'
  }
  return null
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  const configError = getSupabaseConfigError()
  if (configError) {
    throw new Error(configError)
  }
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  }
  return client
}
