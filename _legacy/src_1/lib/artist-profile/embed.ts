import type { StreamPlatform } from './streamPlatform'
import { streamPlatform } from './streamPlatform'

export interface StreamEmbed {
  platform: StreamPlatform
  embedUrl: string
  /** CSS aspect-ratio value e.g. 16/9 or 352/152 */
  aspectRatio: string
  title: string
}

function spotifyEmbed(path: string, title: string): StreamEmbed {
  return {
    platform: 'spotify',
    embedUrl: `https://open.spotify.com/embed/${path}?utm_source=generator&theme=0`,
    aspectRatio: path.startsWith('track/') ? '352/152' : '352/380',
    title,
  }
}

export function getYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null
    if (u.searchParams.get('v')) return u.searchParams.get('v')
    const m = u.pathname.match(/\/embed\/([^/?]+)/)
    return m?.[1] ?? null
  } catch {
    return null
  }
}

function soundcloudEmbed(url: string, title: string): StreamEmbed {
  return {
    platform: 'soundcloud',
    embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23d40000&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`,
    aspectRatio: '16/9',
    title,
  }
}

/** Build an iframe embed URL when the platform supports it */
export function getStreamEmbed(url: string, title = 'Play'): StreamEmbed | null {
  const trimmed = url?.trim()
  if (!trimmed) return null

  const platform = streamPlatform(trimmed)

  if (platform === 'spotify') {
    const track = trimmed.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/)
    if (track) return spotifyEmbed(`track/${track[1]}`, title)
    const album = trimmed.match(/spotify\.com\/album\/([a-zA-Z0-9]+)/)
    if (album) return spotifyEmbed(`album/${album[1]}`, title)
    const playlist = trimmed.match(/spotify\.com\/playlist\/([a-zA-Z0-9]+)/)
    if (playlist) return spotifyEmbed(`playlist/${playlist[1]}`, title)
    const episode = trimmed.match(/spotify\.com\/episode\/([a-zA-Z0-9]+)/)
    if (episode) return spotifyEmbed(`episode/${episode[1]}`, title)
  }

  if (platform === 'youtube') {
    const id = getYoutubeVideoId(trimmed)
    if (id) {
      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
        aspectRatio: '16/9',
        title,
      }
    }
  }

  if (platform === 'soundcloud') {
    return soundcloudEmbed(trimmed, title)
  }

  return null
}

/** Muted loop background for hero (YouTube only) */
export function getYoutubeHeroEmbedUrl(url: string): string | null {
  const id = getYoutubeVideoId(url?.trim() ?? '')
  if (!id) return null
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    loop: '1',
    playlist: id,
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    showinfo: '0',
    iv_load_policy: '3',
  })
  return `https://www.youtube.com/embed/${id}?${params}`
}
