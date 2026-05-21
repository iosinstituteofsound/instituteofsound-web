import type { ArtistCatalogImportResult, CatalogImportItem } from './types'

type SoundCloudResolve = {
  kind?: string
  title?: string
  permalink_url?: string
  artwork_url?: string
  tracks?: {
    title?: string
    permalink_url?: string
    artwork_url?: string
    playback_count?: number
  }[]
}

const SOUNDCLOUD_CLIENT_ID =
  process.env.SOUNDCLOUD_CLIENT_ID?.trim() || 'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoY'

function artworkUrl(url?: string): string | undefined {
  if (!url) return undefined
  return url.replace('-large', '-t500x500')
}

async function soundcloudResolve(url: string): Promise<SoundCloudResolve | null> {
  const endpoint = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${SOUNDCLOUD_CLIENT_ID}`
  const res = await fetch(endpoint, { headers: { Accept: 'application/json' } })
  if (!res.ok) return null
  return res.json() as Promise<SoundCloudResolve>
}

export async function importCatalogFromSoundCloud(
  profileUrl: string
): Promise<ArtistCatalogImportResult> {
  const warnings: string[] = []
  const resolved = await soundcloudResolve(profileUrl)

  if (!resolved) {
    return {
      platform: 'soundcloud',
      profileUrl,
      suggestions: {},
      items: [],
      warnings: ['Could not resolve SoundCloud profile. Check the URL is a public artist page.'],
    }
  }

  const items: CatalogImportItem[] = []
  const isUser = resolved.kind === 'user' || Boolean(resolved.tracks?.length)

  if (isUser && resolved.tracks?.length) {
    for (const [index, track] of resolved.tracks.entries()) {
      if (!track.permalink_url || !track.title) continue
      items.push({
        id: `sc-track-${index}-${track.permalink_url}`,
        kind: 'track',
        title: track.title,
        streamUrl: track.permalink_url,
        coverUrl: artworkUrl(track.artwork_url ?? resolved.artwork_url),
        playCount: track.playback_count,
      })
      if (index >= 14) break
    }
  } else if (resolved.permalink_url && resolved.title) {
    items.push({
      id: `sc-track-single`,
      kind: 'track',
      title: resolved.title,
      streamUrl: resolved.permalink_url,
      coverUrl: artworkUrl(resolved.artwork_url),
    })
    warnings.push('Single track URL detected — paste your SoundCloud artist profile URL for full catalog import.')
  }

  if (items.length === 0) {
    warnings.push('No tracks returned from SoundCloud. Try your main artist profile URL.')
  }

  return {
    platform: 'soundcloud',
    profileUrl,
    suggestions: {
      displayName: resolved.title,
      avatarUrl: artworkUrl(resolved.artwork_url),
    },
    items,
    warnings,
  }
}
