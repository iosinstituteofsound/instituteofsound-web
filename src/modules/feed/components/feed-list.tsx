import { useCallback, useEffect, useMemo, type CSSProperties } from 'react'
import { FeedItemCard } from '@/modules/feed/lib/feed-type-registry'
import { FeedPostSkeleton } from '@/modules/feed/components/feed-post-skeleton'
import {
  useFeedList,
  type FeedScope,
  type UseFeedListOptions,
  FEED_PAGE_SIZE,
} from '@/modules/feed/hooks/use-feed'
import { sortFeedItemsLatest } from '@/modules/feed/lib/feed-sort'
import { isStoryItem } from '@/modules/feed/lib/story-utils'
import type { FeedItemType } from '@/modules/feed/types/feed.types'
import { PageLoader } from '@/shared/components/feedback/loader'
import { EmptyState, ErrorState } from '@/shared/components/feedback/states'
import { useInfiniteScroll } from '@/shared/hooks/use-infinite-scroll'
import { cn } from '@/shared/lib/cn'

export function useFeedListItems(scope: FeedScope = 'all') {
  const query = useFeedList({ limit: FEED_PAGE_SIZE, scope })
  const items = useMemo(
    () => sortFeedItemsLatest(query.data?.pages.flatMap((page) => page.items) ?? []),
    [query.data?.pages],
  )
  return { ...query, items }
}

interface FeedListProps {
  compactLoader?: boolean
  scope?: FeedScope
  authorId?: string
  type?: FeedItemType
  compact?: boolean
  listClassName?: string
  itemClassName?: string
  staggerAnimation?: boolean
  emptyMessage?: string
}

function getFeedListQueryOptions({
  scope = 'all',
  authorId,
  type,
}: Pick<FeedListProps, 'scope' | 'authorId' | 'type'>): UseFeedListOptions {
  return {
    limit: FEED_PAGE_SIZE,
    scope,
    authorId,
    type,
    enabled: authorId ? Boolean(authorId) : true,
  }
}

export function FeedList({
  compactLoader,
  scope = 'all',
  authorId,
  type,
  compact,
  listClassName,
  itemClassName,
  staggerAnimation,
  emptyMessage,
}: FeedListProps) {
  const queryOptions = getFeedListQueryOptions({ scope, authorId, type })
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeedList(queryOptions)

  const items = useMemo(
    () =>
      sortFeedItemsLatest(data?.pages.flatMap((page) => page.items) ?? []).filter(
        (item) => !isStoryItem(item),
      ),
    [data?.pages],
  )

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const sentinelRef = useInfiniteScroll(loadMore, { enabled: Boolean(hasNextPage) })

  useEffect(() => {
    if (isFetchingNextPage || !hasNextPage) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const rect = sentinel.getBoundingClientRect()
    if (rect.top <= window.innerHeight + 240) {
      loadMore()
    }
  }, [hasNextPage, isFetchingNextPage, items.length, loadMore, sentinelRef])

  if (isLoading) {
    if (compactLoader) {
      return <FeedPostSkeleton />
    }
    return <PageLoader />
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />

  if (!items.length) {
    return (
      <EmptyState
        variant="dashed"
        className="p-10"
        title={scope === 'following' ? 'No posts from people you follow' : 'No posts yet'}
        description={
          emptyMessage ??
          (scope === 'following'
            ? 'Follow artists and operators to see their posts here.'
            : authorId
              ? 'Posts from this profile will show up here.'
              : 'Be the first to share something with the community.')
        }
      />
    )
  }

  return (
    <div className={cn(listClassName ?? 'space-y-3')}>
      {items.map((item, index) => {
        const itemStyle: CSSProperties | undefined =
          staggerAnimation && itemClassName
            ? { animationDelay: `${Math.min(index * 45, 360)}ms` }
            : undefined

        if (itemClassName) {
          return (
            <div key={item.id} className={itemClassName} style={itemStyle}>
              <FeedItemCard item={item} compact={compact} />
            </div>
          )
        }

        return <FeedItemCard key={item.id} item={item} compact={compact} />
      })}

      {isFetchingNextPage ? <FeedPostSkeleton count={2} className="space-y-3 pt-1" /> : null}

      {hasNextPage ? <div ref={sentinelRef} className="h-px w-full" aria-hidden /> : null}
    </div>
  )
}
