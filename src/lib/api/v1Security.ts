import { isV1ApiEnabled } from '@/api/v1Client'
import { isSupabaseConfigured } from '@/lib/supabase/client'

/**
 * Production + VITE_USE_V1_API: browser must not read/write app data via Supabase client.
 * Auth (getSupabase().auth) is still allowed.
 */
export function allowDirectSupabaseDataAccess(): boolean {
  if (!isSupabaseConfigured()) return true
  if (import.meta.env.PROD && isV1ApiEnabled()) return false
  if (import.meta.env.PROD && !isV1ApiEnabled()) return false
  return true
}

export function assertDirectSupabaseAllowed(context?: string): void {
  if (!allowDirectSupabaseDataAccess()) {
    throw new Error(
      context
        ? `${context} is unavailable — enable VITE_USE_V1_API and deploy /api/v1 routes.`
        : 'This action requires the server API in production.',
    )
  }
}
