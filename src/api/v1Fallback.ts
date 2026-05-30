import { allowDirectSupabaseDataAccess } from '@/lib/api/v1Security'

/** When /api/v1 is missing (404) on Vercel, fall back to direct Supabase in local dev only. */
export function isV1RouteMissingError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /Request failed \(404\)|\b404\b.*not found/i.test(msg)
}

export async function withV1Fallback<T>(
  v1Call: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await v1Call()
  } catch (err) {
    if (!isV1RouteMissingError(err)) throw err
    if (!allowDirectSupabaseDataAccess()) {
      console.error('[v1] API route missing — direct Supabase fallback blocked in production')
      throw err
    }
    console.warn('[v1] API unavailable, using direct Supabase', err)
    return fallback()
  }
}
