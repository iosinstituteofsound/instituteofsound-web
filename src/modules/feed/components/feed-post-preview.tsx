import { Globe, Music2, ExternalLink, Pause, Play } from 'lucide-react'
import { FeedPostOptionsMenu } from '@/modules/feed/components/feed-post-options-menu'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { buildPostCaptionText, FeedPostCaption } from '@/modules/feed/components/feed-post-caption'
import { LinkPreviewCard } from '@/modules/feed/components/link-preview-card'
import { FeedMediaFrame, musicTrackContextLine, payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { FeedPostTimestamp } from '@/modules/feed/components/feed-post-timestamp'
import { parseLinkPreviewFromPayload } from '@/modules/feed/lib/link-preview'
import { feedItemToPlayerTrack } from '@/modules/player/lib/feed-track'
import { usePlayer } from '@/modules/player/hooks/use-player'
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

function MusicFeedPreviewBlock({ item }: { item: FeedItemDto }) {
  const payload = item.payload
  const trackTitle = payloadString(payload, 'trackTitle')
  const artistName = payloadString(payload, 'artistName')
  const youtubeUrl = payloadString(payload, 'youtubeUrl')
  const spotifyUrl = payloadString(payload, 'spotifyUrl')
  const audioUrl = payloadString(payload, 'audioUrl')
  const link = spotifyUrl ?? youtubeUrl
  const playerTrack = feedItemToPlayerTrack(item)
  const { isCurrentTrack, isPlaying, play, togglePlay } = usePlayer()
  const isActive = playerTrack ? isCurrentTrack(playerTrack.id) : false
  const showPause = isActive && isPlaying

  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
      <button
        type="button"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-primary/10 text-primary"
        disabled={!playerTrack}
        aria-label={showPause ? 'Pause track' : 'Play track'}
        onClick={() => {
          if (!playerTrack) return
          if (isActive) {
            togglePlay()
            return
          }
          play(playerTrack)
        }}
      >
        {showPause ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-sm">{trackTitle ?? 'Shared track'}</p>
        {artistName ? <p className="truncate text-xs text-muted-foreground">{artistName}</p> : null}
        {!audioUrl && link ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">Stream link only — no in-app audio</p>
        ) : null}
      </div>
      {link ? (
        <Button variant="outline" size="sm" className="shrink-0 rounded-lg" asChild>
          <a href={link} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-1 h-3.5 w-3.5" />
            Listen
          </a>
        </Button>
      ) : playerTrack ? (
        <Button
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          className="shrink-0 rounded-lg"
          onClick={() => {
            if (isActive) {
              togglePlay()
              return
            }
            play(playerTrack)
          }}
        >
          {showPause ? 'Pause' : 'Play'}
        </Button>
      ) : null}
    </div>
  )
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
    return (
      <div className="feed-post-preview__extra">
        <MusicFeedPreviewBlock item={item} />
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
  menuPortalContainer?: HTMLElement | null
}

export function FeedPostPreview({ item, menuPortalContainer }: FeedPostPreviewProps) {
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
            <FeedPostTimestamp value={item.createdAt} />
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
        <FeedPostOptionsMenu
          author={item.author}
          postId={item.id}
          portalContainer={menuPortalContainer}
          triggerClassName="feed-post-preview__menu h-auto w-auto min-h-0 rounded-none hover:bg-transparent"
        />
      </header>

      {captionText ? <FeedPostCaption text={captionText} className="feed-post-preview__caption" /> : null}

      {media ? <div className="feed-post-preview__media">{media}</div> : null}
      {extra}
    </div>
  )
}
