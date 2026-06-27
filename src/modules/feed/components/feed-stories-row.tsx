import { ChevronRight } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { CreateStoryCard } from '@/modules/feed/components/create-post-card'
import { UserAvatar } from '@/shared/components/user'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import {
  getStoryItems,
  storyBackground,
  storyPreviewText,
  storyTextStyle,
  storyVideoUrl,
} from '@/modules/feed/lib/story-content'
import { cn } from '@/shared/lib/cn'
import './feed-stories-row.css'

interface FeedStoriesRowProps {
  items: FeedItemDto[]
  userName: string
  avatarUrl?: string | null
  onCreateStory: () => void
  onStoryClick: (storyId: string) => void
}

export function FeedStoriesRow({
  items,
  userName,
  avatarUrl,
  onCreateStory,
  onStoryClick,
}: FeedStoriesRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const stories = useMemo(() => getStoryItems(items).slice(0, 8), [items])

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'right' ? 280 : -280, behavior: 'smooth' })
  }

  return (
    <section className="feed-stories-row" aria-label="Stories">
      <div className="feed-stories-row__field">
        <div className="feed-stories-row__head">
          <p className="feed-stories-row__label">Signal Flux</p>
          <span className="feed-stories-row__status">
            <span className="feed-stories-row__status-dot" aria-hidden />
            {stories.length} active
          </span>
        </div>

        <div ref={scrollRef} className="feed-stories-row__track">
          <CreateStoryCard userName={userName} avatarUrl={avatarUrl} onClick={onCreateStory} />

          {stories.map((item, index) => (
            <StoryRowCard key={item.id} item={item} index={index} onClick={() => onStoryClick(item.id)} />
          ))}
        </div>

        {stories.length > 3 ? (
          <button
            type="button"
            className="feed-stories-row__nav"
            onClick={() => scroll('right')}
            aria-label="Scroll stories"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </section>
  )
}

function StoryRowCard({
  item,
  index,
  onClick,
}: {
  item: FeedItemDto
  index: number
  onClick: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const background = storyBackground(item, index)
  const previewText = storyPreviewText(item)
  const textStyle = storyTextStyle(item)
  const videoUrl = storyVideoUrl(item)
  const posterUrl = payloadString(item.payload, 'posterUrl')

  const startPreview = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    void video.play().then(() => setIsPlaying(true)).catch(() => undefined)
  }

  const stopPreview = () => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    setIsPlaying(false)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
      className="feed-story-card"
      style={{ '--story-i': index + 1 } as React.CSSProperties}
    >
      <div className="feed-story-card__orb">
        <span className="feed-story-card__orbit" aria-hidden />
        <UserAvatar
          name={item.author.name}
          avatarUrl={item.author.avatarUrl}
          className="feed-story-card__avatar"
        />
      </div>

      <div className="feed-story-card__capsule">
        <div className="feed-story-card__glass">
          {background.kind === 'image' ? (
            <img src={background.value} alt="" className="feed-story-card__art" />
          ) : (
            <div className={cn('feed-story-card__gradient bg-gradient-to-br', background.value)} />
          )}

          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              muted
              playsInline
              loop
              preload="metadata"
              className={cn(
                'feed-story-card__art transition-opacity duration-200',
                isPlaying ? 'opacity-100' : 'opacity-0',
              )}
            />
          ) : null}

          <span className="feed-story-card__hud" aria-hidden />
          <span className="feed-story-card__index">{String(index + 1).padStart(2, '0')}</span>

          {previewText && !isPlaying ? (
            <div className="feed-story-card__text">
              <p className={textStyle}>{previewText}</p>
            </div>
          ) : null}

          <VerifiedUserName
            name={item.author.name}
            isVerified={item.author.isVerified}
            className="feed-story-card__tag"
            nameClassName="truncate"
          />
        </div>
      </div>
    </button>
  )
}
