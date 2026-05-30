import { isV1ApiEnabled } from '@/api/v1Client'
import { withV1Fallback } from '@/api/v1Fallback'
import { isSupabaseConfigured } from '@/lib/supabase/client'

/** Prefer `/api/v1` when enabled; fall back to direct Supabase only if v1 route is missing (404). */
export async function viaV1Api<T>(v1Call: () => Promise<T>, directCall: () => Promise<T>): Promise<T> {
  if (!isV1ApiEnabled() || !isSupabaseConfigured()) {
    return directCall()
  }
  return withV1Fallback(v1Call, directCall)
}
