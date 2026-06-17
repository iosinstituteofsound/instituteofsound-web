export type VideoProvider =
  | 'direct'
  | 'youtube'
  | 'vimeo'
  | 'dailymotion'
  | 'twitch'
  | 'tiktok'
  | 'facebook'
  | 'external'

export interface ParsedExternalVideoLink {
  valid: boolean
  rawUrl: string
  normalizedUrl: string
  provider: VideoProvider
  providerLabel: string
  title: string
  streamUrl?: string
  embedUrl?: string
  posterUrl?: string
  openUrl: string
}

export interface VideoBlockDraft {
  id: string
  title: string
  videoUrl: string
  caption: string
  providerLabel?: string
  posterUrl?: string
}

const VIDEO_FILE_EXT = /\.(mp4|webm|mov|m4v|ogv|ogg)(\?|#|$)/i

const PROVIDER_LABELS: Record<VideoProvider, string> = {
  direct: 'Direct video',
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  dailymotion: 'Dailymotion',
  twitch: 'Twitch',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  external: 'External link',
}

function titleFromUrl(url: URL): string {
  const slug = url.pathname.split('/').filter(Boolean).pop() ?? ''
  const cleaned = decodeURIComponent(slug).replace(/[-_]+/g, ' ').trim()
  return cleaned || PROVIDER_LABELS.external
}

function youtubeVideoId(url: URL): string | null {
  if (url.hostname === 'youtu.be') {
    return url.pathname.slice(1).split('/')[0] || null
  }
  if (url.hostname.includes('youtube.com') || url.hostname === 'music.youtube.com') {
    const v = url.searchParams.get('v')
    if (v) return v
    const parts = url.pathname.split('/').filter(Boolean)
    const embedIdx = parts.indexOf('embed')
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1]!
    const shortsIdx = parts.indexOf('shorts')
    if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1]!
    const liveIdx = parts.indexOf('live')
    if (liveIdx >= 0 && parts[liveIdx + 1]) return parts[liveIdx + 1]!
  }
  return null
}

function youtubePlaylistId(url: URL): string | null {
  return url.searchParams.get('list')
}

function vimeoId(url: URL): string | null {
  const parts = url.pathname.split('/').filter(Boolean)
  const id = parts[0] === 'video' ? parts[1] : parts[0]
  if (!id || !/^\d+$/.test(id)) return null
  return id
}

function dailymotionId(url: URL): string | null {
  const parts = url.pathname.split('/').filter(Boolean)
  const videoIdx = parts.indexOf('video')
  if (videoIdx >= 0 && parts[videoIdx + 1]) return parts[videoIdx + 1]!
  return parts[0] ?? null
}

function twitchEmbed(url: URL): string | null {
  const host = url.hostname.toLowerCase()
  const parts = url.pathname.split('/').filter(Boolean)
  if (host.includes('clips.twitch.tv')) {
    const id = parts[0]
    if (!id) return null
    return `https://clips.twitch.tv/embed?clip=${id}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`
  }
  if (parts[0] === 'videos' && parts[1]) {
    return `https://player.twitch.tv/?video=${parts[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`
  }
  return null
}

function tiktokEmbed(url: URL): string | null {
  const match = url.pathname.match(/\/video\/(\d+)/)
  if (!match?.[1]) return null
  return `https://www.tiktok.com/embed/v2/${match[1]}`
}

export function isAcceptableVideoLink(input: string): boolean {
  const trimmed = input.trim()
  if (!trimmed) return false
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function parseExternalVideoLink(input: string): ParsedExternalVideoLink {
  const trimmed = input.trim()
  const invalid: ParsedExternalVideoLink = {
    valid: false,
    rawUrl: trimmed,
    normalizedUrl: trimmed,
    provider: 'external',
    providerLabel: PROVIDER_LABELS.external,
    title: 'External video',
    openUrl: trimmed,
  }

  if (!isAcceptableVideoLink(trimmed)) return invalid

  const url = new URL(trimmed)
  const normalizedUrl = url.toString()
  const host = url.hostname.toLowerCase()
  const title = titleFromUrl(url)

  if (VIDEO_FILE_EXT.test(url.pathname) || VIDEO_FILE_EXT.test(normalizedUrl)) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'direct',
      providerLabel: PROVIDER_LABELS.direct,
      title,
      streamUrl: normalizedUrl,
      openUrl: normalizedUrl,
    }
  }

  const ytId = youtubeVideoId(url)
  if (ytId) {
    const playlistId = youtubePlaylistId(url)
    const embedUrl = playlistId
      ? `https://www.youtube.com/embed/${ytId}?list=${playlistId}`
      : `https://www.youtube.com/embed/${ytId}`
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'youtube',
      providerLabel: PROVIDER_LABELS.youtube,
      title,
      embedUrl,
      posterUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      openUrl: normalizedUrl,
    }
  }

  if (host.includes('youtube.com') && url.pathname.includes('/playlist')) {
    const playlistId = youtubePlaylistId(url)
    if (playlistId) {
      return {
        valid: true,
        rawUrl: trimmed,
        normalizedUrl,
        provider: 'youtube',
        providerLabel: PROVIDER_LABELS.youtube,
        title,
        embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}`,
        openUrl: normalizedUrl,
      }
    }
  }

  const vimeo = vimeoId(url)
  if (vimeo && host.includes('vimeo.com')) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'vimeo',
      providerLabel: PROVIDER_LABELS.vimeo,
      title,
      embedUrl: `https://player.vimeo.com/video/${vimeo}`,
      openUrl: normalizedUrl,
    }
  }

  if (host.includes('dailymotion.com')) {
    const id = dailymotionId(url)
    if (id) {
      return {
        valid: true,
        rawUrl: trimmed,
        normalizedUrl,
        provider: 'dailymotion',
        providerLabel: PROVIDER_LABELS.dailymotion,
        title,
        embedUrl: `https://www.dailymotion.com/embed/video/${id}`,
        openUrl: normalizedUrl,
      }
    }
  }

  if (host.includes('twitch.tv')) {
    const embed = twitchEmbed(url)
    if (embed) {
      return {
        valid: true,
        rawUrl: trimmed,
        normalizedUrl,
        provider: 'twitch',
        providerLabel: PROVIDER_LABELS.twitch,
        title,
        embedUrl: embed,
        openUrl: normalizedUrl,
      }
    }
  }

  if (host.includes('tiktok.com')) {
    const embed = tiktokEmbed(url)
    if (embed) {
      return {
        valid: true,
        rawUrl: trimmed,
        normalizedUrl,
        provider: 'tiktok',
        providerLabel: PROVIDER_LABELS.tiktok,
        title,
        embedUrl: embed,
        openUrl: normalizedUrl,
      }
    }
  }

  if (host.includes('facebook.com') || host.includes('fb.watch')) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'facebook',
      providerLabel: PROVIDER_LABELS.facebook,
      title,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(normalizedUrl)}&show_text=false`,
      openUrl: normalizedUrl,
    }
  }

  return {
    valid: true,
    rawUrl: trimmed,
    normalizedUrl,
    provider: 'external',
    providerLabel: PROVIDER_LABELS.external,
    title,
    streamUrl: normalizedUrl,
    openUrl: normalizedUrl,
  }
}

export function videoDraftFromExternal(parsed: ParsedExternalVideoLink): VideoBlockDraft {
  return {
    id: `external-${parsed.normalizedUrl}`,
    title: parsed.title,
    videoUrl: parsed.rawUrl,
    caption: 'Watch the session',
    providerLabel: parsed.providerLabel,
    posterUrl: parsed.posterUrl,
  }
}

export function videoDraftFromSiteItem(item: {
  id: string
  title: string
  videoUrl: string
  sourceLabel?: string
  posterUrl?: string
}): VideoBlockDraft {
  return {
    id: item.id,
    title: item.title,
    videoUrl: item.videoUrl,
    caption: 'Watch the session',
    providerLabel: item.sourceLabel ?? 'Site video',
    posterUrl: item.posterUrl,
  }
}
