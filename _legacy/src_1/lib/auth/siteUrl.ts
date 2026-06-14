/** Production canonical URL (SEO, OG, share meta). */

const PRODUCTION_FALLBACK = 'https://www.instituteofsound.in'

export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return PRODUCTION_FALLBACK
}

/** Hostname for display (no www), e.g. instituteofsound.in or localhost:5173 */
export function getSiteHost(): string {
  try {
    return new URL(getSiteUrl()).host.replace(/^www\./, '')
  } catch {
    return 'instituteofsound.in'
  }
}

/**
 * Google OAuth + email links must return to the same origin that started sign-in.
 * Never use VITE_SITE_URL here — that caused localhost → instituteofsound.in redirects
 * when Supabase rejected an unknown redirect URL and fell back to dashboard Site URL.
 */
export function getAuthEmailRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/auth/callback`
  }

  const fromEnv = import.meta.env.VITE_SITE_URL?.trim()
  if (fromEnv) return `${fromEnv.replace(/\/$/, '')}/auth/callback`

  return `${PRODUCTION_FALLBACK}/auth/callback`
}

/** Dev hint when OAuth may bounce to production (Supabase redirect allow list). */
export function getAuthRedirectSetupHint(): string | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null
  const origin = window.location.origin
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return null
  return `You opened ${origin}. For Google login, use http://localhost:5173 and add that URL in Supabase → Authentication → Redirect URLs.`
}
