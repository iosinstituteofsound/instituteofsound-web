export type StreamPlatform =
  | 'spotify'
  | 'youtube'
  | 'soundcloud'
  | 'bandcamp'
  | 'apple'
  | 'other'

export function streamPlatform(url: string): StreamPlatform {
  const u = url.toLowerCase()
  if (u.includes('spotify.com')) return 'spotify'
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  if (u.includes('soundcloud.com')) return 'soundcloud'
  if (u.includes('bandcamp.com')) return 'bandcamp'
  if (u.includes('music.apple.com') || u.includes('itunes.apple.com')) return 'apple'
  return 'other'
}

export const STREAM_PLATFORM_LABEL: Record<StreamPlatform, string> = {
  spotify: 'Spotify',
  youtube: 'YouTube',
  soundcloud: 'SoundCloud',
  bandcamp: 'Bandcamp',
  apple: 'Apple Music',
  other: 'Listen',
}
