/** First http(s) URL in text, or bare domain with https:// added. */
export function extractFirstUrl(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const explicit = trimmed.match(/https?:\/\/[^\s<>"']+/i)?.[0]
  if (explicit) return explicit.replace(/[.,;:!?)]+$/, '')

  const bare = trimmed.match(/(?:^|\s)((?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/i)?.[1]
  if (bare && !bare.includes('@')) {
    return `https://${bare.replace(/[.,;:!?)]+$/, '')}`
  }

  return null
}

function normalizeUrlKey(url: string): string | null {
  try {
    const u = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`)
    const host = u.hostname.replace(/^www\./, '').toLowerCase()
    const path = u.pathname.replace(/\/$/, '') || ''
    return `${u.protocol}//${host}${path}${u.search}`.toLowerCase()
  } catch {
    return null
  }
}

export function urlsMatch(a: string, b: string): boolean {
  const ka = normalizeUrlKey(a)
  const kb = normalizeUrlKey(b)
  if (ka && kb) return ka === kb
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/** Remove a link URL from post text when the preview card carries it. */
export function stripUrlFromText(text: string, linkUrl: string): string {
  const trimmed = text.trim()
  if (!trimmed || !linkUrl.trim()) return trimmed

  const variants = new Set<string>([linkUrl.trim()])
  const detected = extractFirstUrl(trimmed)
  if (detected) variants.add(detected)

  for (const raw of variants) {
    try {
      const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
      variants.add(u.href)
      const noSlash = u.href.replace(/\/$/, '')
      variants.add(noSlash)
      variants.add(`${noSlash}/`)
    } catch {
      /* keep raw only */
    }
  }

  let result = trimmed
  for (const v of variants) {
    const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(escaped, 'gi'), ' ')
  }

  return result.replace(/\s+/g, ' ').trim()
}

export function linkPreviewStub(url: string): LinkPreview {
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    return {
      url: parsed.href,
      siteName: parsed.hostname.replace(/^www\./, ''),
    }
  } catch {
    return { url: trimmed }
  }
}

export interface LinkPreview {
  url: string
  title?: string
  description?: string
  imageUrl?: string
  siteName?: string
}

export function normalizeLinkPreviewForDisplay(preview: LinkPreview): {
  preview: LinkPreview
  isMinimal: boolean
} {
  let hostname = ''
  try {
    hostname = new URL(preview.url).hostname.replace(/^www\./, '')
  } catch {
    /* ignore */
  }

  const siteName = preview.siteName?.trim() || hostname || 'Link'
  let title = preview.title?.trim()

  if (title && hostname) {
    const titleKey = title.toLowerCase()
    const hostKey = hostname.split('.')[0]?.toLowerCase() ?? ''
    const siteKey = siteName.replace(/^www\./, '').split('.')[0]?.toLowerCase() ?? ''
    if (titleKey === hostKey || titleKey === siteKey || titleKey === siteName.toLowerCase()) {
      title = undefined
    }
  }

  const normalized: LinkPreview = {
    ...preview,
    siteName,
    title,
  }

  const isMinimal =
    !normalized.imageUrl && !normalized.description && (!normalized.title || normalized.title === siteName)

  return { preview: normalized, isMinimal }
}

export function parseLinkPreviewFromPayload(payload: Record<string, unknown>): LinkPreview | null {
  const raw = payload.linkPreview
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  if (typeof data.url !== 'string' || !data.url.trim()) return null

  return {
    url: data.url.trim(),
    title: typeof data.title === 'string' ? data.title : undefined,
    description: typeof data.description === 'string' ? data.description : undefined,
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
    siteName: typeof data.siteName === 'string' ? data.siteName : undefined,
  }
}
