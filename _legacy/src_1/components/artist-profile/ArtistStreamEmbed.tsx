import clsx from 'clsx'
import { getStreamEmbed } from '@/lib/artist-profile/embed'
import { STREAM_PLATFORM_LABEL } from '@/lib/artist-profile/streamPlatform'

interface ArtistStreamEmbedProps {
  streamUrl: string
  title: string
  className?: string
  /** featured = large hero player; inline = under each track */
  variant?: 'featured' | 'inline'
  index?: number
}

export function ArtistStreamEmbed({
  streamUrl,
  title,
  className = '',
  variant = 'featured',
  index,
}: ArtistStreamEmbedProps) {
  const embed = getStreamEmbed(streamUrl, title)
  if (!embed) return null

  const isInline = variant === 'inline'

  return (
    <div
      className={clsx(
        'artist-site-player',
        isInline && 'artist-site-player-inline',
        className
      )}
    >
      <div className={clsx('artist-site-player-chrome', isInline && 'artist-site-player-chrome-inline')}>
        <span className="artist-site-player-label">
          {index != null ? `${String(index).padStart(2, '0')} · ` : ''}
          {title}
        </span>
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
