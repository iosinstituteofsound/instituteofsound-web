import { isV1ApiEnabled } from '@/api/v1Client'
import { withV1Fallback } from '@/api/v1Fallback'
import { allowDirectSupabaseDataAccess, assertDirectSupabaseAllowed } from '@/lib/api/v1Security'
import { isSupabaseConfigured } from '@/lib/supabase/client'

/** Prefer `/api/v1` when enabled; direct Supabase only in local dev (never production). */
export async function viaV1Api<T>(v1Call: () => Promise<T>, directCall: () => Promise<T>): Promise<T> {
  if (!isSupabaseConfigured()) {
    return directCall()
  }

  if (!isV1ApiEnabled()) {
    assertDirectSupabaseAllowed('Supabase data access')
    return directCall()
  }

  if (allowDirectSupabaseDataAccess()) {
    return withV1Fallback(v1Call, directCall)
  }

  return v1Call()
}
