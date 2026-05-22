import { getStreamEmbed } from '@/lib/artist-profile/embed'
import { STREAM_PLATFORM_LABEL } from '@/lib/artist-profile/streamPlatform'

interface ArtistStreamEmbedProps {
  streamUrl: string
  title: string
  className?: string
}

export function ArtistStreamEmbed({ streamUrl, title, className = '' }: ArtistStreamEmbedProps) {
  const embed = getStreamEmbed(streamUrl, title)
  if (!embed) return null

  return (
    <div className={`artist-site-player ${className}`.trim()}>
      <div className="artist-site-player-chrome">
        <span className="artist-site-player-label">Now playing</span>
        <span className="artist-site-player-platform">
          {STREAM_PLATFORM_LABEL[embed.platform]}
        </span>
      </div>
      <div
        className="artist-site-player-frame"
        style={{ aspectRatio: embed.aspectRatio }}
      >
        <iframe
          src={embed.embedUrl}
          title={`${title} — ${STREAM_PLATFORM_LABEL[embed.platform]} player`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="artist-site-player-iframe"
        />
      </div>
    </div>
  )
}
