import { ChevronRight } from 'lucide-react'
import { useMemo, useRef } from 'react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { CreateStoryCard } from '@/modules/feed/components/create-post-card'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import {
  getStoryItems,
  storyBackground,
  storyPreviewText,
  storyTextStyle,
} from '@/modules/feed/lib/story-content'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

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
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto p-3 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <CreateStoryCard userName={userName} avatarUrl={avatarUrl} onClick={onCreateStory} />

        {stories.map((item, index) => {
          const background = storyBackground(item, index)
          const previewText = storyPreviewText(item)
          const textStyle = storyTextStyle(item)

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onStoryClick(item.id)}
              className="relative h-[200px] w-[112px] shrink-0 overflow-hidden rounded-xl border text-left shadow-sm transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {background.kind === 'image' ? (
                <img src={background.value} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className={cn('absolute inset-0 bg-gradient-to-br', background.value)} />
              )}

              {previewText ? (
                <div className="absolute inset-0 flex items-center justify-center p-3">
                  <p
                    className={cn(
                      'line-clamp-6 text-center text-[11px] leading-snug text-white drop-shadow',
                      textStyle,
                    )}
                  >
                    {previewText}
                  </p>
                </div>
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
              <div className="absolute left-3 top-3">
                <FeedUserAvatar
                  name={item.author.name}
                  avatarUrl={item.author.avatarUrl}
                  className="h-9 w-9 ring-2 ring-primary"
                />
              </div>
              <p className="absolute bottom-3 left-3 right-3 truncate text-xs font-semibold text-white drop-shadow">
                {item.author.name}
              </p>
            </button>
          )
        })}
      </div>

      {stories.length > 3 ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full shadow-md"
          onClick={() => scroll('right')}
          aria-label="Scroll stories"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
