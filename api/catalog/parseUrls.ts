import type { CatalogPlatform } from './types'

export function detectCatalogPlatform(url: string): CatalogPlatform {
  const normalized = url.trim().toLowerCase()
  if (!normalized) return 'unsupported'
  if (normalized.includes('spotify.com')) return 'spotify'
  if (
    normalized.includes('youtube.com') ||
    normalized.includes('youtu.be') ||
    normalized.includes('music.youtube.com')
  ) {
    return 'youtube'
  }
  if (normalized.includes('soundcloud.com')) return 'soundcloud'
  return 'unsupported'
}

export function parseSpotifyArtistId(url: string): string | null {
  const match = url.trim().match(/spotify\.com\/(?:intl-[^/]+\/)?artist\/([a-zA-Z0-9]+)/i)
  return match?.[1] ?? null
}

export function parseYouTubeChannelRef(
  url: string
): { kind: 'channelId' | 'handle' | 'user'; value: string } | null {
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^www\./, '')
    if (host !== 'youtube.com' && host !== 'm.youtube.com' && host !== 'music.youtube.com') {
      return null
    }
    const channelMatch = u.pathname.match(/^\/channel\/([^/?]+)/)
    if (channelMatch) return { kind: 'channelId', value: channelMatch[1] }
    const handleMatch = u.pathname.match(/^\/@([^/?]+)/)
    if (handleMatch) return { kind: 'handle', value: handleMatch[1] }
    const userMatch = u.pathname.match(/^\/user\/([^/?]+)/)
    if (userMatch) return { kind: 'user', value: userMatch[1] }
    const cMatch = u.pathname.match(/^\/c\/([^/?]+)/)
    if (cMatch) return { kind: 'handle', value: cMatch[1] }
  } catch {
    return null
  }
  return null
}
