import type { InfiniteData } from '@tanstack/react-query'
import type { FeedEngagementSummary, FeedItemDto, FeedListResponse } from '@/modules/feed/types/feed.types'
import { feedQueryKey } from '@/modules/feed/hooks/use-feed'

export const emptyReactionCounts = (): FeedEngagementSummary['reactions'] => ({
  like: 0,
  love: 0,
  haha: 0,
  wow: 0,
  sad: 0,
  angry: 0,
})

export function defaultEngagement(): FeedEngagementSummary {
  return {
    reactions: emptyReactionCounts(),
    reactionTotal: 0,
    commentCount: 0,
    myReaction: null,
  }
}

export function getEngagement(item: FeedItemDto): FeedEngagementSummary {
  return item.engagement ?? defaultEngagement()
}

export function patchFeedItemInCache(
  data: InfiniteData<FeedListResponse> | undefined,
  feedItemId: string,
  patch: (item: FeedItemDto) => FeedItemDto,
): InfiniteData<FeedListResponse> | undefined {
  if (!data || !Array.isArray(data.pages)) return data

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => (item.id === feedItemId ? patch(item) : item)),
    })),
  }
}

export const profilePostsQueryKeyPrefix = ['profile-posts'] as const

export function patchFeedItemInAllListCaches(
  queryClient: {
    setQueriesData: <T>(
      filters: { queryKey: readonly unknown[] },
      updater: (old: T | undefined) => T | undefined,
    ) => void
    setQueryData: <T>(queryKey: readonly unknown[], updater: T | ((old: T | undefined) => T | undefined)) => void
  },
  feedItemId: string,
  patch: (item: FeedItemDto) => FeedItemDto,
) {
  const patchList = (old: InfiniteData<FeedListResponse> | undefined) =>
    patchFeedItemInCache(old, feedItemId, patch)

  queryClient.setQueriesData<InfiniteData<FeedListResponse>>(
    { queryKey: feedQueryKey },
    patchList,
  )

  queryClient.setQueriesData<InfiniteData<FeedListResponse>>(
    { queryKey: profilePostsQueryKeyPrefix },
    patchList,
  )
}

export function feedItemQueryKey(id: string) {
  return [...feedQueryKey, 'item', id] as const
}

export function feedCommentsQueryKey(feedItemId: string) {
  return [...feedQueryKey, 'comments', feedItemId] as const
}

export function feedCommentReactionsQueryKey(feedItemId: string, commentId: string) {
  return [...feedQueryKey, 'comment-reactions', feedItemId, commentId] as const
}
