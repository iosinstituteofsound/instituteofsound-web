/** Production site URL for auth emails — NOT localhost when deployed */

const PRODUCTION_FALLBACK = 'https://instituteofsound.in'

export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return PRODUCTION_FALLBACK
}

/** Where Supabase email confirm / magic links send the user */
export function getAuthEmailRedirectUrl(): string {
  return `${getSiteUrl()}/auth/callback`
}
