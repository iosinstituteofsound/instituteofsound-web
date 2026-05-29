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

export function urlsMatch(a: string, b: string): boolean {
  try {
    return new URL(a).href === new URL(b).href
  } catch {
    return a.trim() === b.trim()
  }
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
