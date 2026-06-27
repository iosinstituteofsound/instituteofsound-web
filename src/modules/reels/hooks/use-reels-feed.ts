import { useCallback, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import * as feedApi from '@/modules/feed/api/feed.api'
import { feedQueryKey, FEED_PAGE_SIZE, type FeedScope } from '@/modules/feed/hooks/use-feed'
import { sortFeedItemsLatest } from '@/modules/feed/lib/feed-sort'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { isReelItem } from '@/modules/reels/lib/reel-item'

export function useReelsFeed(scope: FeedScope = 'all') {
  const query = useInfiniteQuery({
    queryKey: [...feedQueryKey, 'reels', FEED_PAGE_SIZE, scope],
    queryFn: ({ pageParam }) =>
      feedApi.listFeed({
        limit: FEED_PAGE_SIZE,
        cursor: pageParam as string | undefined,
        scope,
        type: 'video',
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const items = useMemo(
    () =>
      sortFeedItemsLatest(query.data?.pages.flatMap((page) => page.items) ?? []).filter(isReelItem),
    [query.data?.pages],
  )

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage()
    }
  }, [query])

  return { ...query, items, loadMore }
}

export type ReelsFeedItem = FeedItemDto
