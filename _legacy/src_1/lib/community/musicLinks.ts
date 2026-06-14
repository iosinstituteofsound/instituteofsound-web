export type MusicPlatform = 'spotify' | 'youtube' | 'soundcloud'

export interface ParsedMusicLink {
  platform: MusicPlatform
  url: string
  embedUrl: string
  label: string
}

const SPOTIFY_HOSTS = new Set(['open.spotify.com', 'spotify.com', 'www.spotify.com'])
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'youtu.be', 'music.youtube.com'])
const SOUNDCLOUD_HOSTS = new Set(['soundcloud.com', 'www.soundcloud.com', 'm.soundcloud.com'])

function normalizeUrl(raw: string): URL | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    return new URL(withProto)
  } catch {
    return null
  }
}

export function parseSpotifyUrl(raw: string): ParsedMusicLink | null {
  const url = normalizeUrl(raw)
  if (!url || !SPOTIFY_HOSTS.has(url.hostname)) return null

  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 2) return null

  const type = parts[0]
  const id = parts[1]?.split('?')[0]
  if (!id || !['track', 'album', 'playlist', 'episode', 'artist'].includes(type)) return null

  const canonical = `https://open.spotify.com/${type}/${id}`
  const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`

  const labels: Record<string, string> = {
    track: 'Spotify track',
    album: 'Spotify album',
    playlist: 'Spotify playlist',
    episode: 'Spotify episode',
    artist: 'Spotify artist',
  }

  return {
    platform: 'spotify',
    url: canonical,
    embedUrl,
    label: labels[type] ?? 'Spotify',
  }
}

export function parseYouTubeUrl(raw: string): ParsedMusicLink | null {
  const url = normalizeUrl(raw)
  if (!url) return null

  let videoId: string | null = null

  if (url.hostname === 'youtu.be') {
    videoId = url.pathname.slice(1).split('/')[0] || null
  } else if (YOUTUBE_HOSTS.has(url.hostname)) {
    if (url.pathname.startsWith('/watch')) {
      videoId = url.searchParams.get('v')
    } else if (url.pathname.startsWith('/shorts/')) {
      videoId = url.pathname.split('/')[2] ?? null
    } else if (url.pathname.startsWith('/embed/')) {
      videoId = url.pathname.split('/')[2] ?? null
    }
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) return null

  const canonical = `https://www.youtube.com/watch?v=${videoId}`
  const embedUrl = `https://www.youtube.com/embed/${videoId}`

  return {
    platform: 'youtube',
    url: canonical,
    embedUrl,
    label: 'YouTube',
  }
}

export function validateSpinInput(spotifyRaw: string, youtubeRaw: string): {
  spotify: ParsedMusicLink | null
  youtube: ParsedMusicLink | null
  error: string | null
} {
  const spotify = spotifyRaw.trim() ? parseSpotifyUrl(spotifyRaw) : null
  const youtube = youtubeRaw.trim() ? parseYouTubeUrl(youtubeRaw) : null

  if (!spotifyRaw.trim() && !youtubeRaw.trim()) {
    return { spotify: null, youtube: null, error: 'Add a Spotify or YouTube link.' }
  }
  if (spotifyRaw.trim() && !spotify) {
    return { spotify: null, youtube, error: 'Spotify link must be a track, album, or playlist URL.' }
  }
  if (youtubeRaw.trim() && !youtube) {
    return { spotify, youtube: null, error: 'YouTube link must be a valid watch or shorts URL.' }
  }
  if (!spotify && !youtube) {
    return { spotify: null, youtube: null, error: 'Add at least one valid music link.' }
  }

  return { spotify, youtube, error: null }
}

export function parseSoundCloudUrl(raw: string): ParsedMusicLink | null {
  const url = normalizeUrl(raw)
  if (!url || !SOUNDCLOUD_HOSTS.has(url.hostname)) return null

  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 2) return null

  const canonical = `https://soundcloud.com/${parts[0]}/${parts[1]}`
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(canonical)}&color=%23d40000&auto_play=false&hide_related=true&show_comments=false`

  return {
    platform: 'soundcloud',
    url: canonical,
    embedUrl,
    label: 'SoundCloud',
  }
}

export function validateReleaseEmbedInput(
  spotifyRaw: string,
  youtubeRaw: string,
  soundcloudRaw: string
): {
  spotify: ParsedMusicLink | null
  youtube: ParsedMusicLink | null
  soundcloud: ParsedMusicLink | null
  error: string | null
} {
  const spotify = spotifyRaw.trim() ? parseSpotifyUrl(spotifyRaw) : null
  const youtube = youtubeRaw.trim() ? parseYouTubeUrl(youtubeRaw) : null
  const soundcloud = soundcloudRaw.trim() ? parseSoundCloudUrl(soundcloudRaw) : null

  if (!spotifyRaw.trim() && !youtubeRaw.trim() && !soundcloudRaw.trim()) {
    return {
      spotify: null,
      youtube: null,
      soundcloud: null,
      error: 'Add a Spotify, YouTube, or SoundCloud link.',
    }
  }
  if (spotifyRaw.trim() && !spotify) {
    return { spotify: null, youtube, soundcloud, error: 'Invalid Spotify URL.' }
  }
  if (youtubeRaw.trim() && !youtube) {
    return { spotify, youtube: null, soundcloud, error: 'Invalid YouTube URL.' }
  }
  if (soundcloudRaw.trim() && !soundcloud) {
    return { spotify, youtube, soundcloud: null, error: 'Invalid SoundCloud URL.' }
  }
  if (!spotify && !youtube && !soundcloud) {
    return {
      spotify: null,
      youtube: null,
      soundcloud: null,
      error: 'Add at least one valid embed link.',
    }
  }

  return { spotify, youtube, soundcloud, error: null }
}
