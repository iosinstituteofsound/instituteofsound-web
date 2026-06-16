import { useInfiniteQuery } from '@tanstack/react-query'
import * as feedApi from '@/modules/feed/api/feed.api'
import type { FeedItemType } from '@/modules/feed/types/feed.types'

const PROFILE_POSTS_PAGE_SIZE = 20

export const profilePostsQueryKey = (userId: string, type?: FeedItemType) =>
  ['profile-posts', userId, type ?? 'all'] as const

export function useProfilePosts(userId: string, type?: FeedItemType) {
  return useInfiniteQuery({
    queryKey: profilePostsQueryKey(userId, type),
    queryFn: ({ pageParam }) =>
      feedApi.listFeed({
        limit: PROFILE_POSTS_PAGE_SIZE,
        cursor: pageParam as string | undefined,
        authorId: userId,
        type,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(userId),
  })
}
