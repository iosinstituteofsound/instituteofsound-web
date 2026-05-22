import { createClient } from '@supabase/supabase-js'

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

function supabase() {
  const url = env('VITE_SUPABASE_URL', 'SUPABASE_URL')
  const key = env('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY')
  if (!url || !key) return null
  return createClient(url, key)
}

export async function fetchPublishedProfileForShare(
  slug: string
): Promise<ShareProfileRow | null> {
  const client = supabase()
  if (!client) return null

  const { data, error } = await client
    .from('artist_profiles')
    .select(
      'display_name, tagline, bio, banner_url, avatar_url, genres, accent_color, published'
    )
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error || !data) return null
  return data as ShareProfileRow
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
