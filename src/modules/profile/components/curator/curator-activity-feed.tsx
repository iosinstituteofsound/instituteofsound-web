import { useCallback, useMemo, useState } from 'react'
import { FileText, ListMusic, Plus, Radio, Star } from 'lucide-react'
import type { CuratorActivityItemDto } from '@/modules/explore/types/explore.types'
import { curatorActivityDate } from '@/modules/profile/lib/curator-format'
import { CuratorGlassSection } from '@/modules/profile/components/curator/curator-glass-section'
import { useInfiniteScroll } from '@/shared/hooks/use-infinite-scroll'

type CuratorActivityFeedProps = {
  items: CuratorActivityItemDto[]
  viewAllHref?: string
}

const PAGE_SIZE = 5

const ICONS: Record<CuratorActivityItemDto['type'], typeof Plus> = {
  playlist_add: ListMusic,
  article: FileText,
  review: Star,
  signal_pick: Radio,
  follow: Plus,
}

export function CuratorActivityFeed({ items, viewAllHref = '/home' }: CuratorActivityFeedProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount])
  const hasMore = visibleCount < items.length

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((count) => Math.min(count + PAGE_SIZE, items.length))
    }
  }, [hasMore, items.length])

  const sentinelRef = useInfiniteScroll(loadMore, { enabled: hasMore })

  if (items.length === 0) return null

  return (
    <CuratorGlassSection
      title="Activity Feed"
      id="curator-activity-heading"
      viewAllHref={viewAllHref}
      viewAllLabel="View all"
      className="curator-activity"
    >
      <ul className="curator-activity__list">
        {visibleItems.map((item) => {
          const Icon = ICONS[item.type] ?? Plus

          return (
            <li key={item.id} className="curator-activity__item">
              <span className="curator-activity__icon" aria-hidden>
                <Icon size={14} strokeWidth={2} />
              </span>
              <p className="curator-activity__text">{item.text}</p>
              <time className="curator-activity__date" dateTime={item.date}>
                {curatorActivityDate(item.date)}
              </time>
            </li>
          )
        })}
      </ul>
      {hasMore ? <div ref={sentinelRef} className="curator-activity__sentinel" aria-hidden /> : null}
    </CuratorGlassSection>
  )
}
