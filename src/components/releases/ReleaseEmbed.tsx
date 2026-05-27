import {
  parseSoundCloudUrl,
  parseSpotifyUrl,
  parseYouTubeUrl,
} from '@/lib/community/musicLinks'

interface ReleaseEmbedProps {
  spotifyUrl?: string
  youtubeUrl?: string
  soundcloudUrl?: string
  locked?: boolean
}

export function ReleaseEmbed({ spotifyUrl, youtubeUrl, soundcloudUrl, locked }: ReleaseEmbedProps) {
  if (locked) {
    return (
      <div className="release-embed-locked ios-card">
        <p className="ios-kicker">Premiere locked</p>
        <p className="text-sm text-muted mt-2">
          Embeds unlock automatically at premiere time. No manual launch — the wire goes live on schedule.
        </p>
      </div>
    )
  }

  const spotify = spotifyUrl ? parseSpotifyUrl(spotifyUrl) : null
  const youtube = youtubeUrl ? parseYouTubeUrl(youtubeUrl) : null
  const soundcloud = soundcloudUrl ? parseSoundCloudUrl(soundcloudUrl) : null

  const embed = spotify ?? youtube ?? soundcloud

  if (!embed) return null

  return (
    <div className="release-embed">
      <iframe
        title={embed.label}
        src={embed.embedUrl}
        loading="lazy"
        allow={
          embed.platform === 'youtube'
            ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            : 'encrypted-media'
        }
        className="release-embed-frame"
      />
    </div>
  )
}
