/** Supabase REST fetch only — works on Node & Edge (no @supabase/supabase-js bundle). */

export type ShareProfileRow = {
  display_name: string
  tagline: string | null
  bio: string | null
  banner_url: string | null
  avatar_url: string | null
  genres: string[] | null
  accent_color: string | null
  published: boolean
}

function env(...keys: string[]) {
  for (const key of keys) {
    const v = process.env[key]?.trim()
    if (v) return v
  }
  return ''
}

/** Production / preview site origin for OG URLs */
export function siteOrigin(): string {
  const explicit = env('VITE_SITE_URL', 'SITE_URL')
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = env('VERCEL_URL')
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`
  return 'https://instituteofsound.in'
}

export async function fetchPublishedProfileForShare(
  slug: string
): Promise<ShareProfileRow | null> {
  const base = env('VITE_SUPABASE_URL', 'SUPABASE_URL')
  const key = env('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY')
  if (!base || !key) return null

  const params = new URLSearchParams({
    slug: `eq.${slug}`,
    published: 'eq.true',
    select:
      'display_name,tagline,bio,banner_url,avatar_url,genres,accent_color,published',
  })

  const res = await fetch(`${base.replace(/\/$/, '')}/rest/v1/artist_profiles?${params}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) return null
  const rows = (await res.json()) as ShareProfileRow[]
  return rows[0] ?? null
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
