import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import * as feedApi from '@/modules/feed/api/feed.api'
import type { CreateFeedItemInput, FeedListResponse } from '@/modules/feed/types/feed.types'

export const feedQueryKey = ['feed'] as const
const FEED_PAGE_SIZE = 20

export function useFeedList(limit = FEED_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: [...feedQueryKey, limit],
    queryFn: ({ pageParam }) => feedApi.listFeed({ limit, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}

export function useCreateFeedItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateFeedItemInput) => feedApi.createFeedItem(input),
    onSuccess: (item) => {
      queryClient.setQueriesData<InfiniteData<FeedListResponse>>(
        { queryKey: feedQueryKey },
        (current) => {
          if (!current?.pages.length) return current
          const [firstPage, ...rest] = current.pages
          const alreadyListed = firstPage.items.some((entry) => entry.id === item.id)
          if (alreadyListed) return current
          return {
            ...current,
            pages: [{ ...firstPage, items: [item, ...firstPage.items] }, ...rest],
          }
        },
      )
      void queryClient.invalidateQueries({ queryKey: feedQueryKey })
    },
  })
}
