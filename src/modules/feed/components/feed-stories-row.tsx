import { ChevronRight } from 'lucide-react'
import { useMemo, useRef } from 'react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { CreateStoryCard } from '@/modules/feed/components/create-post-card'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const STORY_GRADIENTS = [
  'from-violet-600/80 to-fuchsia-500/80',
  'from-sky-600/80 to-cyan-400/80',
  'from-orange-500/80 to-amber-400/80',
  'from-emerald-600/80 to-lime-400/80',
  'from-rose-600/80 to-pink-400/80',
]

function storyBackground(item: FeedItemDto) {
  return (
    payloadString(item.payload, 'imageUrl') ??
    payloadString(item.payload, 'coverUrl') ??
    payloadString(item.payload, 'posterUrl') ??
    null
  )
}

interface FeedStoriesRowProps {
  items: FeedItemDto[]
  userName: string
  avatarUrl?: string | null
  onCreateStory: () => void
}

export function FeedStoriesRow({ items, userName, avatarUrl, onCreateStory }: FeedStoriesRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const storyAuthors = useMemo(() => {
    const seen = new Set<string>()
    const result: { author: FeedItemDto['author']; background?: string }[] = []

    for (const item of items) {
      if (seen.has(item.author.id)) continue
      seen.add(item.author.id)
      result.push({ author: item.author, background: storyBackground(item) ?? undefined })
      if (result.length >= 8) break
    }

    return result
  }, [items])

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

        {storyAuthors.map(({ author, background }, index) => (
          <div
            key={author.id}
            className="relative h-[200px] w-[112px] shrink-0 overflow-hidden rounded-xl border shadow-sm"
          >
            {background ? (
              <img src={background} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className={cn('absolute inset-0 bg-gradient-to-br', STORY_GRADIENTS[index % STORY_GRADIENTS.length])} />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
            <div className="absolute left-3 top-3">
              <FeedUserAvatar name={author.name} avatarUrl={author.avatarUrl} className="h-9 w-9 ring-2 ring-primary" />
            </div>
            <p className="absolute bottom-3 left-3 right-3 truncate text-xs font-semibold text-white drop-shadow">
              {author.name}
            </p>
          </div>
        ))}
      </div>

      {storyAuthors.length > 3 ? (
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
