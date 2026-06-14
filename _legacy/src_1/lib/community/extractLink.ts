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

/** Remove a link URL from post text when the link preview card carries it. */
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

export function isBodyOnlyLink(body: string, linkUrl: string): boolean {
  const trimmed = body.trim()
  if (!trimmed) return true
  if (!linkUrl.trim()) return false
  const detected = extractFirstUrl(trimmed)
  if (!detected || !urlsMatch(detected, linkUrl)) return false
  return stripUrlFromText(trimmed, linkUrl).length === 0
}

export function isMusicStreamUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return (
      host.includes('spotify.com') ||
      host.includes('youtube.com') ||
      host === 'youtu.be' ||
      host.includes('soundcloud.com')
    )
  } catch {
    return false
  }
}
