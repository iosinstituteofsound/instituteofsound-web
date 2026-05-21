type CatalogItem = {
  id: string
  kind: 'track' | 'album' | 'single' | 'ep' | 'video'
  title: string
  streamUrl: string
  coverUrl?: string
  playCount?: number
  releaseYear?: number
}

type CatalogResult = {
  platform: string
  profileUrl: string
  suggestions: Record<string, unknown>
  items: CatalogItem[]
  warnings: string[]
}

type VercelRequest = { query?: { url?: string | string[] } }
type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => void
  json: (body: unknown) => void
}

function detectPlatform(url: string) {
  const n = url.trim().toLowerCase()
  if (!n) return 'unsupported'
  if (n.includes('spotify.com')) return 'spotify'
  if (n.includes('youtube.com') || n.includes('youtu.be') || n.includes('music.youtube.com')) {
    return 'youtube'
  }
  if (n.includes('soundcloud.com')) return 'soundcloud'
  return 'unsupported'
}

function parseSpotifyArtistId(url: string) {
  const match = url.trim().match(/spotify\.com\/(?:intl-[^/]+\/)?artist\/([a-zA-Z0-9]+)/i)
  return match?.[1] ?? null
}

function releaseYear(date?: string) {
  if (!date) return undefined
  const year = parseInt(date.slice(0, 4), 10)
  return Number.isFinite(year) ? year : undefined
}

function albumKind(albumType: string): CatalogItem['kind'] {
  if (albumType === 'single') return 'single'
  if (albumType === 'compilation' || albumType === 'ep') return 'ep'
  return 'album'
}

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim()
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET missing on server')
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
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

async function spotifyGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Spotify API ${res.status}: ${text.slice(0, 120)}`)
  }
  return res.json() as Promise<T>
}

async function fetchSpotifyTracks(
  token: string,
  artist: { id: string; name: string },
  market: string
) {
  const tracks: {
    id: string
    name: string
    external_urls?: { spotify?: string }
    album?: { images?: { url: string }[]; release_date?: string }
    artists?: { id: string }[]
  }[] = []
  const seen = new Set<string>()

  const addTrack = (track: (typeof tracks)[0]) => {
    if (!track?.id || seen.has(track.id)) return
    const primary = track.artists?.[0]?.id
    if (primary && primary !== artist.id) return
    seen.add(track.id)
    tracks.push(track)
  }

  try {
    const search = await spotifyGet<{ tracks?: { items?: (typeof tracks)[0][] } }>(
      `/search?q=${encodeURIComponent(`artist:${artist.name}`)}&type=track&limit=10&market=${encodeURIComponent(market)}`,
      token
    )
    for (const track of search.tracks?.items ?? []) {
      addTrack(track)
      if (tracks.length >= 10) return tracks
    }
  } catch {
    /* continue */
  }

  if (tracks.length >= 5) return tracks

  try {
    const albumsRes = await spotifyGet<{ items: { id: string; images?: { url: string }[]; release_date?: string }[] }>(
      `/artists/${artist.id}/albums?include_groups=album,single&limit=10&market=${encodeURIComponent(market)}`,
      token
    )
    for (const album of albumsRes.items.slice(0, 5)) {
      try {
        const albumTracks = await spotifyGet<{
          items?: { id: string; name: string; external_urls?: { spotify?: string } }[]
        }>(`/albums/${album.id}/tracks?limit=10&market=${encodeURIComponent(market)}`, token)
        for (const item of albumTracks.items ?? []) {
          addTrack({
            id: item.id,
            name: item.name,
            external_urls: item.external_urls,
            album: { images: album.images, release_date: album.release_date },
            artists: [{ id: artist.id }],
          })
          if (tracks.length >= 10) return tracks
        }
      } catch {
        continue
      }
    }
  } catch {
    /* continue */
  }

  return tracks
}

async function importFromSpotify(profileUrl: string): Promise<CatalogResult> {
  const artistId = parseSpotifyArtistId(profileUrl)
  if (!artistId) throw new Error('Invalid Spotify artist URL')

  const warnings: string[] = []
  if (!process.env.SPOTIFY_CLIENT_ID?.trim() || !process.env.SPOTIFY_CLIENT_SECRET?.trim()) {
    return {
      platform: 'spotify',
      profileUrl,
      suggestions: { spotifyUrl: profileUrl },
      items: [],
      warnings: [
        'Spotify keys server pe missing. Vercel env mein SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET add karo.',
      ],
    }
  }

  let token: string
  try {
    token = await getSpotifyToken()
  } catch (err) {
    warnings.push(err instanceof Error ? err.message : 'Spotify auth failed')
    return { platform: 'spotify', profileUrl, suggestions: { spotifyUrl: profileUrl }, items: [], warnings }
  }

  const market = process.env.SPOTIFY_MARKET?.trim() || 'IN'
  let artist: { id: string; name: string; images?: { url: string; height: number }[]; genres?: string[] }
  try {
    artist = await spotifyGet(`/artists/${artistId}`, token)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('403') || msg.toLowerCase().includes('premium')) {
      warnings.push(
        'Spotify API blocked: app owner account pe active Spotify Premium chahiye (2026 dev rule).'
      )
      return { platform: 'spotify', profileUrl, suggestions: { spotifyUrl: profileUrl }, items: [], warnings }
    }
    throw err
  }

  let albumsRes = { items: [] as { id: string; name: string; album_type: string; external_urls: { spotify: string }; images?: { url: string }[]; release_date?: string }[] }
  try {
    albumsRes = await spotifyGet(
      `/artists/${artistId}/albums?include_groups=album,single,compilation&limit=10&market=${encodeURIComponent(market)}`,
      token
    )
  } catch {
    /* optional */
  }

  const trackList = await fetchSpotifyTracks(token, artist, market)
  const items: CatalogItem[] = []
  const seenUrls = new Set<string>()

  for (const track of trackList) {
    const streamUrl = track.external_urls?.spotify
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

  const albumGroups = new Map<string, (typeof albumsRes.items)[0]>()
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

  const images = [...(artist.images ?? [])].sort((a, b) => b.height - a.height)

  if (items.length === 0) {
    warnings.push('Spotify se tracks nahi mile. App owner Premium + dev mode check karo.')
  }

  return {
    platform: 'spotify',
    profileUrl,
    suggestions: {
      displayName: artist.name,
      avatarUrl: images[0]?.url,
      bannerUrl: images[1]?.url ?? images[0]?.url,
      genres: (artist.genres ?? []).slice(0, 6),
      tagline: artist.name ? `${artist.name} on Spotify` : undefined,
      spotifyUrl: profileUrl,
    },
    items,
    warnings,
  }
}

export async function buildArtistCatalogFromUrl(profileUrl: string): Promise<CatalogResult> {
  const url = profileUrl.trim()
  if (!url) throw new Error('Profile URL is required')
  const platform = detectPlatform(url)
  if (platform === 'spotify') return importFromSpotify(url)
  return {
    platform,
    profileUrl: url,
    suggestions: {},
    items: [],
    warnings: [
      platform === 'youtube'
        ? 'YouTube import ke liye YOUTUBE_API_KEY Vercel env mein add karo.'
        : 'Unsupported URL. Spotify artist link use karo.',
    ],
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')

  try {
    const raw = req.query?.url
    const url = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined

    if (!url?.trim()) {
      return res.status(400).json({ error: 'Missing url query parameter' })
    }

    const catalog = await buildArtistCatalogFromUrl(url)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json(catalog)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Catalog import failed'
    return res.status(502).json({ error: message })
  }
}
