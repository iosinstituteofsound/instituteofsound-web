import type { SessionAudioTrack } from '@/modules/editor/lib/session-audio-tracks'

export type AudioProvider =
  | 'direct'
  | 'soundcloud'
  | 'spotify'
  | 'youtube'
  | 'bandcamp'
  | 'apple_music'
  | 'mixcloud'
  | 'audiomack'
  | 'deezer'
  | 'vimeo'
  | 'external'

export type AudioLinkKind = 'track' | 'album' | 'playlist' | 'episode' | 'show' | 'artist' | 'single' | 'unknown'

export interface ParsedExternalAudioLink {
  valid: boolean
  rawUrl: string
  normalizedUrl: string
  provider: AudioProvider
  providerLabel: string
  linkKind: AudioLinkKind
  title: string
  streamUrl?: string
  embedUrl?: string
  openUrl: string
}

export interface AudioBlockDraft {
  id: string
  title: string
  audioUrl: string
  sessionLabel: string
  durationSec?: number
  providerLabel?: string
  sessionTracks?: SessionAudioTrack[]
}

const AUDIO_FILE_EXT = /\.(mp3|wav|ogg|m4a|aac|flac|webm|opus)(\?|#|$)/i

const PROVIDER_LABELS: Record<AudioProvider, string> = {
  direct: 'Direct audio',
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  youtube: 'YouTube',
  bandcamp: 'Bandcamp',
  apple_music: 'Apple Music',
  mixcloud: 'Mixcloud',
  audiomack: 'Audiomack',
  deezer: 'Deezer',
  vimeo: 'Vimeo',
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
  if (url.hostname.includes('youtube.com')) {
    const v = url.searchParams.get('v')
    if (v) return v
    const parts = url.pathname.split('/').filter(Boolean)
    const embedIdx = parts.indexOf('embed')
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1]!
    const shortsIdx = parts.indexOf('shorts')
    if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1]!
    const listIdx = parts.indexOf('playlist')
    if (listIdx >= 0 && parts[listIdx + 1]) return parts[listIdx + 1]!
  }
  return null
}

function spotifyLinkKind(type: string): AudioLinkKind {
  if (type === 'album') return 'album'
  if (type === 'playlist') return 'playlist'
  if (type === 'track') return 'track'
  if (type === 'episode') return 'episode'
  if (type === 'show') return 'show'
  if (type === 'artist') return 'artist'
  return 'unknown'
}

function deezerLinkKind(type: string): AudioLinkKind {
  if (type === 'album') return 'album'
  if (type === 'playlist') return 'playlist'
  if (type === 'track') return 'track'
  return 'unknown'
}

function audiomackLinkKind(type: string): AudioLinkKind {
  if (type === 'album') return 'album'
  if (type === 'playlist') return 'playlist'
  if (type === 'song') return 'track'
  return 'unknown'
}

function spotifyEmbed(url: URL): { embedUrl: string; linkKind: AudioLinkKind } | null {
  const parts = url.pathname.split('/').filter(Boolean)
  const type = parts[0]
  const id = parts[1]?.split('?')[0]
  if (!type || !id) return null
  if (!['track', 'album', 'episode', 'playlist', 'show', 'artist'].includes(type)) return null
  return {
    embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
    linkKind: spotifyLinkKind(type),
  }
}

function appleMusicEmbed(url: URL): { embedUrl: string; linkKind: AudioLinkKind } | null {
  if (!url.hostname.includes('music.apple.com')) return null
  const parts = url.pathname.split('/').filter(Boolean)
  const type = parts[2]
  const linkKind =
    type === 'album' ? 'album' : type === 'playlist' ? 'playlist' : type === 'song' ? 'track' : 'unknown'
  return {
    embedUrl: url.toString().replace('music.apple.com', 'embed.music.apple.com'),
    linkKind,
  }
}

function deezerEmbed(url: URL): { embedUrl: string; linkKind: AudioLinkKind } | null {
  const parts = url.pathname.split('/').filter(Boolean)
  const type = parts[0]
  const id = parts[1]
  if (!type || !id) return null
  if (!['track', 'album', 'playlist', 'episode', 'show'].includes(type)) return null
  return {
    embedUrl: `https://widget.deezer.com/widget/dark/${type}/${id}`,
    linkKind: deezerLinkKind(type),
  }
}

function mixcloudEmbed(url: URL): string | null {
  if (!url.hostname.includes('mixcloud.com')) return null
  const path = url.pathname
  if (path.length < 2) return null
  return `https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=${encodeURIComponent(path)}`
}

function audiomackEmbed(url: URL): { embedUrl: string; linkKind: AudioLinkKind } | null {
  if (!url.hostname.includes('audiomack.com')) return null
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 2) return null
  const [type, slug] = parts
  if (!['song', 'album', 'playlist'].includes(type)) return null
  return {
    embedUrl: `https://audiomack.com/embed/${type}/${slug}`,
    linkKind: audiomackLinkKind(type),
  }
}

function bandcampEmbed(url: URL): string | null {
  if (!url.hostname.includes('bandcamp.com')) return null
  return `https://bandcamp.com/EmbeddedPlayer/album=0/size=large/bgcol=111111/linkcol=ffffff/minimal=true/transparent=true/?url=${encodeURIComponent(url.toString())}`
}

function vimeoEmbed(url: URL): string | null {
  const parts = url.pathname.split('/').filter(Boolean)
  const id = parts[0] === 'video' ? parts[1] : parts[0]
  if (!id || !/^\d+$/.test(id)) return null
  return `https://player.vimeo.com/video/${id}`
}

function soundcloudLinkKind(url: URL): AudioLinkKind {
  const path = url.pathname
  if (path.includes('/sets/')) return 'playlist'
  if (path.includes('/albums/')) return 'album'
  return 'track'
}

export function isCollectionLink(parsed: ParsedExternalAudioLink): boolean {
  return parsed.linkKind === 'album' || parsed.linkKind === 'playlist' || parsed.linkKind === 'show'
}

export function isAcceptableAudioLink(input: string): boolean {
  const trimmed = input.trim()
  if (!trimmed) return false
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function parseExternalAudioLink(input: string): ParsedExternalAudioLink {
  const trimmed = input.trim()
  const invalid: ParsedExternalAudioLink = {
    valid: false,
    rawUrl: trimmed,
    normalizedUrl: trimmed,
    provider: 'external',
    providerLabel: PROVIDER_LABELS.external,
    linkKind: 'unknown',
    title: 'External audio',
    openUrl: trimmed,
  }

  if (!isAcceptableAudioLink(trimmed)) return invalid

  const url = new URL(trimmed)
  const normalizedUrl = url.toString()
  const host = url.hostname.toLowerCase()
  const title = titleFromUrl(url)

  if (AUDIO_FILE_EXT.test(url.pathname) || AUDIO_FILE_EXT.test(normalizedUrl)) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'direct',
      providerLabel: PROVIDER_LABELS.direct,
      linkKind: 'single',
      title,
      streamUrl: normalizedUrl,
      openUrl: normalizedUrl,
    }
  }

  if (host.includes('soundcloud.com')) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'soundcloud',
      providerLabel: PROVIDER_LABELS.soundcloud,
      linkKind: soundcloudLinkKind(url),
      title,
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(normalizedUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`,
      openUrl: normalizedUrl,
    }
  }

  const spotify = host.includes('spotify.com') ? spotifyEmbed(url) : null
  if (spotify) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'spotify',
      providerLabel: PROVIDER_LABELS.spotify,
      linkKind: spotify.linkKind,
      title,
      embedUrl: spotify.embedUrl,
      openUrl: normalizedUrl,
    }
  }

  const ytId = youtubeVideoId(url)
  if (ytId) {
    const isPlaylist = url.pathname.includes('/playlist') || url.searchParams.has('list')
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'youtube',
      providerLabel: PROVIDER_LABELS.youtube,
      linkKind: isPlaylist ? 'playlist' : 'track',
      title,
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      openUrl: normalizedUrl,
    }
  }

  const apple = appleMusicEmbed(url)
  if (apple) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'apple_music',
      providerLabel: PROVIDER_LABELS.apple_music,
      linkKind: apple.linkKind,
      title,
      embedUrl: apple.embedUrl,
      openUrl: normalizedUrl,
    }
  }

  const bandcamp = bandcampEmbed(url)
  if (bandcamp) {
    const isAlbum = url.pathname.includes('/album/') || url.searchParams.has('album')
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'bandcamp',
      providerLabel: PROVIDER_LABELS.bandcamp,
      linkKind: isAlbum ? 'album' : 'track',
      title,
      embedUrl: bandcamp,
      openUrl: normalizedUrl,
    }
  }

  const mixcloud = mixcloudEmbed(url)
  if (mixcloud) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'mixcloud',
      providerLabel: PROVIDER_LABELS.mixcloud,
      linkKind: 'show',
      title,
      embedUrl: mixcloud,
      openUrl: normalizedUrl,
    }
  }

  const audiomack = audiomackEmbed(url)
  if (audiomack) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'audiomack',
      providerLabel: PROVIDER_LABELS.audiomack,
      linkKind: audiomack.linkKind,
      title,
      embedUrl: audiomack.embedUrl,
      openUrl: normalizedUrl,
    }
  }

  const deezer = deezerEmbed(url)
  if (deezer) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'deezer',
      providerLabel: PROVIDER_LABELS.deezer,
      linkKind: deezer.linkKind,
      title,
      embedUrl: deezer.embedUrl,
      openUrl: normalizedUrl,
    }
  }

  const vimeo = vimeoEmbed(url)
  if (vimeo) {
    return {
      valid: true,
      rawUrl: trimmed,
      normalizedUrl,
      provider: 'vimeo',
      providerLabel: PROVIDER_LABELS.vimeo,
      linkKind: 'track',
      title,
      embedUrl: vimeo,
      openUrl: normalizedUrl,
    }
  }

  return {
    valid: true,
    rawUrl: trimmed,
    normalizedUrl,
    provider: 'external',
    providerLabel: PROVIDER_LABELS.external,
    linkKind: 'unknown',
    title,
    streamUrl: normalizedUrl,
    openUrl: normalizedUrl,
  }
}

export function audioDraftFromExternal(
  parsed: ParsedExternalAudioLink,
  sessionTracks?: SessionAudioTrack[],
): AudioBlockDraft {
  return {
    id: `external-${parsed.normalizedUrl}`,
    title: parsed.title,
    audioUrl: parsed.rawUrl,
    sessionLabel: 'Listen to the session',
    providerLabel: parsed.providerLabel,
    sessionTracks,
  }
}

export function audioDraftFromSiteTrack(
  track: {
    id: string
    title: string
    streamUrl: string
    durationSec?: number
    sourceLabel?: string
  },
  sessionTracks?: SessionAudioTrack[],
): AudioBlockDraft {
  return {
    id: track.id,
    title: track.title,
    audioUrl: track.streamUrl,
    sessionLabel: 'Listen to the session',
    durationSec: track.durationSec,
    providerLabel: track.sourceLabel ?? 'Site audio',
    sessionTracks,
  }
}
