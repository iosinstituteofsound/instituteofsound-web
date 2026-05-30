import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, requireEnv } from './env.js'

let adminClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      requireEnv('SUPABASE_URL', 'VITE_SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    )
  }
  return adminClient
}

/** User-scoped client — RLS applies via JWT. */
export function createSupabaseUserClient(accessToken: string): SupabaseClient {
  return createClient(
    requireEnv('SUPABASE_URL', 'VITE_SUPABASE_URL'),
    requireEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'),
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    },
  )
}

export function createSupabaseAnonClient(): SupabaseClient {
  return createClient(
    requireEnv('SUPABASE_URL', 'VITE_SUPABASE_URL'),
    requireEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
}

export function isSupabaseServerConfigured(): boolean {
  return Boolean(
    env('SUPABASE_URL', 'VITE_SUPABASE_URL') &&
      env('SUPABASE_SERVICE_ROLE_KEY') &&
      env('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'),
  )
}
