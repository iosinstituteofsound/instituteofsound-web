import { ExternalLink, Film } from 'lucide-react'
import { parseExternalVideoLink } from '@/modules/editor/lib/external-video-link'
import { cn } from '@/shared/lib/cn'

interface ArticleSessionVideoPlayerProps {
  videoUrl: string
  videoTitle?: string
  caption?: string
  posterUrl?: string
  className?: string
  interactive?: boolean
}

export function ArticleSessionVideoPlayer({
  videoUrl,
  videoTitle = 'Session video',
  caption = 'Watch the session',
  posterUrl,
  className,
  interactive = true,
}: ArticleSessionVideoPlayerProps) {
  const parsed = parseExternalVideoLink(videoUrl)

  if (!parsed.valid) {
    return (
      <div className={cn('article-session-video__empty', className)}>
        Paste a valid video link
      </div>
    )
  }

  if (parsed.streamUrl && parsed.provider === 'direct') {
    return (
      <div className={cn('article-session-video', className)}>
        <div className="article-session-video__head">
          <Film className="h-3.5 w-3.5" />
          <span>{caption}</span>
          <span className="article-session-video__provider">{parsed.providerLabel}</span>
        </div>
        <p className="article-session-video__title">{videoTitle}</p>
        <video
          controls={interactive}
          poster={posterUrl}
          src={parsed.streamUrl}
          className={cn('article-session-video__native', !interactive && 'pointer-events-none')}
          preload="metadata"
        />
      </div>
    )
  }

  if (parsed.embedUrl) {
    return (
      <div className={cn('article-session-video', className)}>
        <div className="article-session-video__head">
          <Film className="h-3.5 w-3.5" />
          <span>{caption}</span>
          <span className="article-session-video__provider">{parsed.providerLabel}</span>
        </div>
        <p className="article-session-video__title">{videoTitle}</p>
        <div className="article-session-video__frame">
          <iframe
            src={parsed.embedUrl}
            title={`${parsed.providerLabel} player`}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className={cn('article-session-video__iframe', !interactive && 'pointer-events-none')}
          />
        </div>
        {interactive ? (
          <a
            href={parsed.openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="article-session-video__link"
          >
            <ExternalLink className="h-3 w-3" />
            Open on {parsed.providerLabel}
          </a>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('article-session-video', className)}>
      <div className="article-session-video__head">
        <Film className="h-3.5 w-3.5" />
        <span>{caption}</span>
        <span className="article-session-video__provider">{parsed.providerLabel}</span>
      </div>
      <p className="article-session-video__title">{videoTitle}</p>
      <video
        controls={interactive}
        poster={posterUrl ?? parsed.posterUrl}
        src={parsed.streamUrl ?? parsed.normalizedUrl}
        className={cn('article-session-video__native', !interactive && 'pointer-events-none')}
        preload="metadata"
      />
    </div>
  )
}
