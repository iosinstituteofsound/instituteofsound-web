import { useCallback, useEffect, useMemo } from 'react'
import { FeedItemCard } from '@/modules/feed/lib/feed-type-registry'
import { useFeedList } from '@/modules/feed/hooks/use-feed'
import { sortFeedItemsLatest } from '@/modules/feed/lib/feed-sort'
import { isStoryItem } from '@/modules/feed/lib/story-utils'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useInfiniteScroll } from '@/shared/hooks/use-infinite-scroll'

export function useFeedListItems() {
  const query = useFeedList()
  const items = useMemo(
    () => sortFeedItemsLatest(query.data?.pages.flatMap((page) => page.items) ?? []),
    [query.data?.pages],
  )
  return { ...query, items }
}

interface FeedListProps {
  compactLoader?: boolean
}

export function FeedList({ compactLoader }: FeedListProps) {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeedList()

  const items = useMemo(
    () => sortFeedItemsLatest(data?.pages.flatMap((page) => page.items) ?? []).filter((item) => !isStoryItem(item)),
    [data?.pages],
  )

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const sentinelRef = useInfiniteScroll(loadMore, { enabled: Boolean(hasNextPage) })

  // Keep loading if the first page does not fill the scroll area.
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
      return (
        <div className="space-y-4">
          {[1, 2].map((key) => (
            <div key={key} className="feed-social-card overflow-hidden p-4">
              <div className="mb-3 flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )
    }
    return <PageLoader />
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-10 text-center shadow-sm">
        <p className="font-medium">No posts yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Be the first to share something with the community.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FeedItemCard key={item.id} item={item} />
      ))}

      {isFetchingNextPage ? (
        <div className="space-y-3 pt-1">
          {[1, 2].map((key) => (
            <div key={key} className="feed-social-card overflow-hidden p-4">
              <div className="mb-3 flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : null}

      {hasNextPage ? <div ref={sentinelRef} className="h-px w-full" aria-hidden /> : null}
    </div>
  )
}
