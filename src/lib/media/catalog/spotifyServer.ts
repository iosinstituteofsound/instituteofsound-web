import { parseSpotifyArtistId } from './parseUrls'
import type { ArtistCatalogImportResult, CatalogImportItem } from './types'

type SpotifyToken = { access_token: string }

type SpotifyArtist = {
  id: string
  name: string
  images?: { url: string; height: number }[]
  genres?: string[]
}

type SpotifyTrack = {
  id: string
  name: string
  external_urls: { spotify: string }
  album?: { images?: { url: string }[]; release_date?: string }
  artists?: { id: string }[]
}

type SpotifyAlbum = {
  id: string
  name: string
  album_type: string
  external_urls: { spotify: string }
  images?: { url: string }[]
  release_date?: string
}

function spotifyConfigured(): boolean {
  return Boolean(process.env.SPOTIFY_CLIENT_ID?.trim() && process.env.SPOTIFY_CLIENT_SECRET?.trim())
}

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim()
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new Error('Spotify API keys not configured on server')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error('Spotify authentication failed')
  const data = (await res.json()) as SpotifyToken
  return data.access_token
}

async function spotifyGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Spotify API error: ${res.status} ${text.slice(0, 120)}`)
  }
  return res.json() as Promise<T>
}

function releaseYear(date?: string): number | undefined {
  if (!date) return undefined
  const year = parseInt(date.slice(0, 4), 10)
  return Number.isFinite(year) ? year : undefined
}

function albumKind(albumType: string): CatalogImportItem['kind'] {
  if (albumType === 'single') return 'single'
  if (albumType === 'compilation' || albumType === 'ep') return 'ep'
  return 'album'
}

/** Spotify removed /artists/{id}/top-tracks (Feb 2026) — use search + album tracks. */
async function fetchArtistTracks(
  token: string,
  artist: SpotifyArtist,
  market: string
): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = []
  const seen = new Set<string>()

  const addTrack = (track: SpotifyTrack) => {
    if (!track.id || seen.has(track.id)) return
    const primaryArtist = track.artists?.[0]?.id
    if (primaryArtist && primaryArtist !== artist.id) return
    seen.add(track.id)
    tracks.push(track)
  }

  try {
    const search = await spotifyGet<{ tracks?: { items?: SpotifyTrack[] } }>(
      `/search?q=${encodeURIComponent(`artist:${artist.name}`)}&type=track&limit=10&market=${encodeURIComponent(market)}`,
      token
    )
    for (const track of search.tracks?.items ?? []) {
      addTrack(track)
      if (tracks.length >= 10) return tracks
    }
  } catch {
    /* search unavailable — fall through to albums */
  }

  if (tracks.length >= 5) return tracks

  try {
    const albumsRes = await spotifyGet<{ items: SpotifyAlbum[] }>(
      `/artists/${artist.id}/albums?include_groups=album,single&limit=10&market=${encodeURIComponent(market)}`,
      token
    )

    for (const album of albumsRes.items.slice(0, 5)) {
      try {
        const albumTracks = await spotifyGet<{ items?: { id: string; name: string; external_urls: { spotify: string }; album?: SpotifyTrack['album'] }[] }>(
          `/albums/${album.id}/tracks?limit=10&market=${encodeURIComponent(market)}`,
          token
        )
        for (const item of albumTracks.items ?? []) {
          addTrack({
            id: item.id,
            name: item.name,
            external_urls: item.external_urls,
            album: item.album ?? { images: album.images, release_date: album.release_date },
            artists: [{ id: artist.id }],
          })
          if (tracks.length >= 10) return tracks
        }
      } catch {
        continue
      }
    }
  } catch {
    /* albums/tracks fetch failed */
  }

  return tracks
}

export async function importCatalogFromSpotify(profileUrl: string): Promise<ArtistCatalogImportResult> {
  const artistId = parseSpotifyArtistId(profileUrl)
  if (!artistId) {
    throw new Error('Invalid Spotify artist URL')
  }

  const warnings: string[] = []
  if (!spotifyConfigured()) {
    return {
      platform: 'spotify',
      profileUrl,
      suggestions: { spotifyUrl: profileUrl },
      items: [],
      warnings: [
        'Spotify import needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET on the server (Vercel env). Add keys from Spotify Developer Dashboard, then redeploy.',
      ],
    }
  }

  const token = await getSpotifyAccessToken()
  const market = process.env.SPOTIFY_MARKET?.trim() || 'IN'

  const artist = await spotifyGet<SpotifyArtist>(`/artists/${artistId}`, token)
  const [trackList, albumsRes] = await Promise.all([
    fetchArtistTracks(token, artist, market),
    spotifyGet<{ items: SpotifyAlbum[] }>(
      `/artists/${artistId}/albums?include_groups=album,single,compilation&limit=10&market=${encodeURIComponent(market)}`,
      token
    ).catch(() => ({ items: [] as SpotifyAlbum[] })),
  ])

  const items: CatalogImportItem[] = []
  const seenUrls = new Set<string>()

  for (const track of trackList) {
    const streamUrl = track.external_urls.spotify
    if (!streamUrl || seenUrls.has(streamUrl)) continue
    seenUrls.add(streamUrl)
    items.push({
      id: `spotify-track-${track.id}`,
      kind: 'track',
      title: track.name,
      streamUrl,
      coverUrl: track.album?.images?.[0]?.url,
      releaseYear: releaseYear(track.album?.release_date),
    })
  }

  const albumGroups = new Map<string, SpotifyAlbum>()
  for (const album of albumsRes.items) {
    const key = `${album.name}-${album.album_type}`
    const existing = albumGroups.get(key)
    if (!existing || (album.images?.[0]?.url && !existing.images?.[0]?.url)) {
      albumGroups.set(key, album)
    }
  }

  for (const album of albumGroups.values()) {
    const streamUrl = album.external_urls.spotify
    if (!streamUrl || seenUrls.has(streamUrl)) continue
    seenUrls.add(streamUrl)
    items.push({
      id: `spotify-album-${album.id}`,
      kind: albumKind(album.album_type),
      title: album.name,
      streamUrl,
      coverUrl: album.images?.[0]?.url,
      releaseYear: releaseYear(album.release_date),
    })
  }

  const sortedImages = [...(artist.images ?? [])].sort((a, b) => b.height - a.height)
  const avatarUrl = sortedImages[0]?.url
  const bannerUrl = sortedImages[1]?.url ?? sortedImages[0]?.url

  if (items.length === 0) {
    warnings.push(
      'Spotify se tracks nahi mile. Dev app owner ke paas Spotify Premium hona chahiye (2026 rule), aur app Development Mode mein ho.'
    )
  }

  return {
    platform: 'spotify',
    profileUrl,
    suggestions: {
      displayName: artist.name,
      avatarUrl,
      bannerUrl,
      genres: artist.genres?.slice(0, 6),
      tagline: artist.name ? `${artist.name} on Spotify` : undefined,
      spotifyUrl: profileUrl,
    },
    items,
    warnings,
  }
}
