import { Globe, MoreHorizontal, Music2, ExternalLink } from 'lucide-react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { buildPostCaptionText, FeedPostCaption } from '@/modules/feed/components/feed-post-caption'
import { LinkPreviewCard } from '@/modules/feed/components/link-preview-card'
import { FeedMediaFrame, musicTrackContextLine, payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { formatFeedTimestamp } from '@/modules/feed/lib/feed-time'
import { parseLinkPreviewFromPayload } from '@/modules/feed/lib/link-preview'
import { Button } from '@/shared/components/ui/button'

function FeedPostMedia({ item }: { item: FeedItemDto }) {
  const payload = item.payload

  switch (item.type) {
    case 'image': {
      const imageUrl = payloadString(payload, 'imageUrl')
      const alt = payloadString(payload, 'alt') ?? item.title ?? 'Feed image'
      if (!imageUrl) return null
      return (
        <FeedMediaFrame>
          <img src={imageUrl} alt={alt} />
        </FeedMediaFrame>
      )
    }
    case 'video': {
      const videoUrl = payloadString(payload, 'videoUrl')
      const posterUrl = payloadString(payload, 'posterUrl')
      if (!videoUrl) return null
      return (
        <FeedMediaFrame>
          <video controls poster={posterUrl}>
            <source src={videoUrl} />
          </video>
        </FeedMediaFrame>
      )
    }
    case 'article': {
      const coverUrl = payloadString(payload, 'coverUrl')
      if (!coverUrl) return null
      return (
        <FeedMediaFrame>
          <img src={coverUrl} alt={item.title ?? 'Article'} />
        </FeedMediaFrame>
      )
    }
    default:
      return null
  }
}

function FeedPostExtra({ item }: { item: FeedItemDto }) {
  const payload = item.payload

  if (item.type === 'text') {
    const linkPreview = parseLinkPreviewFromPayload(payload)
    if (!linkPreview) return null
    return (
      <div className="feed-post-preview__extra">
        <LinkPreviewCard preview={linkPreview} />
      </div>
    )
  }

  if (item.type === 'music') {
    const trackTitle = payloadString(payload, 'trackTitle')
    const artistName = payloadString(payload, 'artistName')
    const youtubeUrl = payloadString(payload, 'youtubeUrl')
    const spotifyUrl = payloadString(payload, 'spotifyUrl')
    const audioUrl = payloadString(payload, 'audioUrl')
    const link = spotifyUrl ?? youtubeUrl

    return (
      <div className="feed-post-preview__extra">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Music2 className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-sm">{trackTitle ?? 'Shared track'}</p>
            {artistName ? <p className="truncate text-xs text-muted-foreground">{artistName}</p> : null}
          </div>
          {link ? (
            <Button variant="outline" size="sm" className="shrink-0 rounded-lg" asChild>
              <a href={link} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                Listen
              </a>
            </Button>
          ) : null}
        </div>
        {audioUrl ? (
          <audio controls className="mt-2 w-full">
            <source src={audioUrl} />
          </audio>
        ) : null}
      </div>
    )
  }

  if (item.type === 'article') {
    const excerpt = payloadString(payload, 'excerpt')
    if (!excerpt) return null
    return (
      <div className="feed-post-preview__extra">
        <p className="text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
      </div>
    )
  }

  return null
}

interface FeedPostPreviewProps {
  item: FeedItemDto
}

export function FeedPostPreview({ item }: FeedPostPreviewProps) {
  const captionText =
    item.type === 'text'
      ? buildPostCaptionText(undefined, payloadString(item.payload, 'text') ?? item.body)
      : buildPostCaptionText(item.title, item.body)

  const musicContextLine = item.type === 'music' ? musicTrackContextLine(item.payload) : ''

  const media = <FeedPostMedia item={item} />
  const extra = <FeedPostExtra item={item} />

  return (
    <div className="feed-post-preview">
      <header className="feed-post-preview__header">
        <FeedUserAvatar name={item.author.name} avatarUrl={item.author.avatarUrl} className="h-10 w-10 shrink-0" />
        <div className="feed-post-preview__meta">
          <p className="feed-post-preview__name-line">
            <span className="feed-post-preview__name">{item.author.name}</span>
          </p>
          <p className="feed-post-preview__meta-line">
            <span>{formatFeedTimestamp(item.createdAt)}</span>
            <span aria-hidden> · </span>
            <Globe className="feed-post-preview__globe" aria-label="Public" />
          </p>
          {musicContextLine ? (
            <p className="feed-post-preview__context-line">
              <Music2 aria-hidden />
              <span className="truncate">{musicContextLine}</span>
            </p>
          ) : null}
        </div>
        <button type="button" className="feed-post-preview__menu" aria-label="Post options">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      {captionText ? <FeedPostCaption text={captionText} className="feed-post-preview__caption" /> : null}

      {media ? <div className="feed-post-preview__media">{media}</div> : null}
      {extra}
    </div>
  )
}
