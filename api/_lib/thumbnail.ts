/** Parse YouTube video ID from common URL shapes. */
export function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return id || null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = u.searchParams.get('v')
      if (v) return v
      const embed = u.pathname.match(/^\/embed\/([^/?]+)/)
      if (embed) return embed[1]
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/)
      if (shorts) return shorts[1]
    }
  } catch {
    /* invalid URL */
  }
  return null
}

export function youtubeThumbnailFromUrl(url: string): string | null {
  const id = parseYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

type OembedPayload = {
  thumbnail_url?: string
}

async function readOembedThumbnail(endpoint: string): Promise<string | null> {
  const res = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  const data = (await res.json()) as OembedPayload
  const thumb = data.thumbnail_url?.trim()
  return thumb || null
}

async function fetchSpotifyOembed(url: string): Promise<string | null> {
  return readOembedThumbnail(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
  )
}

async function fetchSoundCloudOembed(url: string): Promise<string | null> {
  return readOembedThumbnail(
    `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`
  )
}

async function fetchNoembed(url: string): Promise<string | null> {
  return readOembedThumbnail(`https://noembed.com/embed?url=${encodeURIComponent(url)}`)
}

/** Server-side: resolve thumbnail via oEmbed providers. */
export async function fetchOembedThumbnail(url: string): Promise<string | null> {
  const normalized = url.trim()
  if (!normalized) return null

  const host = (() => {
    try {
      return new URL(normalized).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  })()

  if (host.includes('spotify.com')) {
    const thumb = await fetchSpotifyOembed(normalized)
    if (thumb) return thumb
  }

  if (host.includes('soundcloud.com')) {
    const thumb = await fetchSoundCloudOembed(normalized)
    if (thumb) return thumb
  }

  return fetchNoembed(normalized)
}

/** Resolve best thumbnail for a stream / media URL (YouTube sync, else oEmbed). */
export async function resolveThumbnailFromUrl(url: string): Promise<string | null> {
  const normalized = url.trim()
  if (!normalized) return null

  const youtube = youtubeThumbnailFromUrl(normalized)
  if (youtube) return youtube

  return fetchOembedThumbnail(normalized)
}
