/** @typedef {'spotify'|'youtube'|'soundcloud'|'unsupported'} CatalogPlatform */
/** @typedef {'track'|'album'|'single'|'ep'|'video'} CatalogItemKind */

/**
 * @param {string} url
 * @returns {CatalogPlatform}
 */
function detectPlatform(url) {
  const n = url.trim().toLowerCase()
  if (!n) return 'unsupported'
  if (n.includes('spotify.com')) return 'spotify'
  if (n.includes('youtube.com') || n.includes('youtu.be') || n.includes('music.youtube.com')) {
    return 'youtube'
  }
  if (n.includes('soundcloud.com')) return 'soundcloud'
  return 'unsupported'
}

/**
 * @param {string} url
 */
function parseSpotifyArtistId(url) {
  const match = url.trim().match(/spotify\.com\/(?:intl-[^/]+\/)?artist\/([a-zA-Z0-9]+)/i)
  return match ? match[1] : null
}

function releaseYear(date) {
  if (!date) return undefined
  const year = parseInt(String(date).slice(0, 4), 10)
  return Number.isFinite(year) ? year : undefined
}

function albumKind(albumType) {
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
  const data = await res.json()
  return data.access_token
}

async function spotifyGet(path, token) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Spotify API ${res.status}: ${text.slice(0, 120)}`)
  }
  return res.json()
}

async function fetchSpotifyTracks(token, artist, market) {
  const tracks = []
  const seen = new Set()

  const addTrack = (track) => {
    if (!track?.id || seen.has(track.id)) return
    const primary = track.artists?.[0]?.id
    if (primary && primary !== artist.id) return
    seen.add(track.id)
    tracks.push(track)
  }

  try {
    const search = await spotifyGet(
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
    const albumsRes = await spotifyGet(
      `/artists/${artist.id}/albums?include_groups=album,single&limit=10&market=${encodeURIComponent(market)}`,
      token
    )
    for (const album of (albumsRes.items ?? []).slice(0, 5)) {
      try {
        const albumTracks = await spotifyGet(
          `/albums/${album.id}/tracks?limit=10&market=${encodeURIComponent(market)}`,
          token
        )
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

/**
 * @param {string} profileUrl
 */
async function importFromSpotify(profileUrl) {
  const artistId = parseSpotifyArtistId(profileUrl)
  if (!artistId) throw new Error('Invalid Spotify artist URL')

  const warnings = []
  if (!process.env.SPOTIFY_CLIENT_ID?.trim() || !process.env.SPOTIFY_CLIENT_SECRET?.trim()) {
    return {
      platform: 'spotify',
      profileUrl,
      suggestions: { spotifyUrl: profileUrl },
      items: [],
      warnings: [
        'Spotify keys server pe missing. Vercel env mein SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET add karo, phir Redeploy.',
      ],
    }
  }

  let token
  try {
    token = await getSpotifyToken()
  } catch (err) {
    warnings.push(err instanceof Error ? err.message : 'Spotify auth failed')
    return {
      platform: 'spotify',
      profileUrl,
      suggestions: { spotifyUrl: profileUrl },
      items: [],
      warnings,
    }
  }

  const market = process.env.SPOTIFY_MARKET?.trim() || 'IN'
  let artist
  try {
    artist = await spotifyGet(`/artists/${artistId}`, token)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('403') || msg.toLowerCase().includes('premium')) {
      warnings.push(
        'Spotify API blocked: app owner account pe active Spotify Premium chahiye (2026 dev rule). Premium lagao, 1-2 ghante wait, phir dubara Fetch karo.'
      )
      return {
        platform: 'spotify',
        profileUrl,
        suggestions: { spotifyUrl: profileUrl },
        items: [],
        warnings,
      }
    }
    throw err
  }

  let albumsRes = { items: [] }
  try {
    albumsRes = await spotifyGet(
      `/artists/${artistId}/albums?include_groups=album,single,compilation&limit=10&market=${encodeURIComponent(market)}`,
      token
    )
  } catch {
    /* optional */
  }

  const trackList = await fetchSpotifyTracks(token, artist, market)
  const items = []
  const seenUrls = new Set()

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

  const albumGroups = new Map()
  for (const album of albumsRes.items ?? []) {
    const key = `${album.name}-${album.album_type}`
    const existing = albumGroups.get(key)
    if (!existing || (album.images?.[0]?.url && !existing.images?.[0]?.url)) {
      albumGroups.set(key, album)
    }
  }

  for (const album of albumGroups.values()) {
    const streamUrl = album.external_urls?.spotify
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

  const images = [...(artist.images ?? [])].sort((a, b) => (b.height ?? 0) - (a.height ?? 0))

  if (items.length === 0) {
    warnings.push(
      'Spotify se tracks nahi mile. App owner Spotify Premium + Development Mode check karo.'
    )
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

/**
 * @param {string} profileUrl
 */
async function buildArtistCatalogFromUrl(profileUrl) {
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
        : platform === 'soundcloud'
          ? 'SoundCloud import abhi limited hai — Spotify artist URL try karo.'
          : 'Unsupported URL. Spotify artist link use karo.',
    ],
  }
}

/**
 * Vercel serverless handler
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
async function handler(req, res) {
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

module.exports = handler
module.exports.buildArtistCatalogFromUrl = buildArtistCatalogFromUrl
