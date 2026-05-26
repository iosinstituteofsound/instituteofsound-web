/** Supabase REST — published editorial for share previews (bots / link unfurl). */

import { siteOrigin } from './shareProfile.js'

export type ShareEditorialRow = {
  title: string
  subject: string | null
  body: string
  cover_image_url: string | null
  type: string
  slug: string
  editor_name: string
}

function env(...keys: string[]) {
  for (const key of keys) {
    const v = process.env[key]?.trim()
    if (v) return v
  }
  return ''
}

export function stripHtml(html: string, maxLen = 160): string {
  const plain = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= maxLen) return plain
  return plain.slice(0, maxLen - 1) + '…'
}

/** Article cover for OG/Twitter — use hero image URL as-is (Cloudinary CDN). */
export function editorialCoverForOg(cover: string | null | undefined, origin?: string): string {
  const base = (origin ?? siteOrigin()).replace(/\/$/, '')
  const fallback = `${base}/og/site-og.jpg`
  const raw = cover?.trim()
  if (!raw) return fallback
  if (/^https?:\/\//i.test(raw)) return raw
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`
}

export async function fetchPublishedEditorialForShare(
  slug: string
): Promise<ShareEditorialRow | null> {
  const supabaseBase = env('VITE_SUPABASE_URL', 'SUPABASE_URL')
  const key = env('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY')
  if (!supabaseBase || !key) return null

  const params = new URLSearchParams({
    slug: `eq.${slug}`,
    status: 'eq.published',
    select: 'title,subject,body,cover_image_url,type,slug,editor_name',
  })

  const res = await fetch(
    `${supabaseBase.replace(/\/$/, '')}/rest/v1/editorial_drafts?${params}`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    }
  )

  if (!res.ok) return null
  const rows = (await res.json()) as ShareEditorialRow[]
  return rows[0] ?? null
}
