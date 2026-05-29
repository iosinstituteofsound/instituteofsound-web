import { resolveThumbnailFromUrl } from './thumbnail.js'

export interface ResolvedLinkPreview {
  url: string
  title?: string
  description?: string
  imageUrl?: string
  siteName?: string
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function readMeta(html: string, key: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']og:${key}["'][^>]+content=["']([^"']+)`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${key}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]?.trim()) return decodeHtmlEntities(match[1].trim())
  }
  return undefined
}

function readTitleTag(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match?.[1]?.trim() ? decodeHtmlEntities(match[1].trim()) : undefined
}

type NoembedPayload = {
  title?: string
  description?: string
  thumbnail_url?: string
  provider_name?: string
}

function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

/** Server-side: resolve Open Graph / oEmbed metadata for link previews. */
export async function resolveLinkPreview(url: string): Promise<ResolvedLinkPreview> {
  const normalized = url.trim()
  const preview: ResolvedLinkPreview = { url: normalized }

  try {
    const host = new URL(normalized).hostname.replace(/^www\./, '')
    preview.siteName = host
  } catch {
    return preview
  }

  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(normalized)}`, {
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      const data = (await res.json()) as NoembedPayload
      if (data.title?.trim()) preview.title = data.title.trim()
      if (data.description?.trim()) preview.description = data.description.trim()
      if (data.thumbnail_url?.trim()) preview.imageUrl = data.thumbnail_url.trim()
      if (data.provider_name?.trim()) preview.siteName = data.provider_name.trim()
    }
  } catch {
    /* noembed optional */
  }

  if (!preview.title || !preview.imageUrl) {
    try {
      const res = await fetchWithTimeout(
        normalized,
        {
          headers: {
            Accept: 'text/html',
            'User-Agent':
              'Mozilla/5.0 (compatible; InstituteOfSound/1.0; +https://instituteofsound.in)',
          },
          redirect: 'follow',
        },
        10_000
      )
      if (res.ok) {
        const html = (await res.text()).slice(0, 120_000)
        preview.title =
          preview.title || readMeta(html, 'title') || readTitleTag(html) || preview.title
        preview.description = preview.description || readMeta(html, 'description')
        preview.imageUrl = preview.imageUrl || readMeta(html, 'image')
        preview.siteName = preview.siteName || readMeta(html, 'site_name')
      }
    } catch {
      /* HTML fetch optional */
    }
  }

  if (!preview.imageUrl) {
    const thumb = await resolveThumbnailFromUrl(normalized)
    if (thumb) preview.imageUrl = thumb
  }

  return preview
}
