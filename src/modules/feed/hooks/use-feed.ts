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
      queryClient.setQueriesData<InfiniteData<FeedListResponse, string | undefined>>(
        { queryKey: feedQueryKey },
        (current) => {
          const pages = current?.pages
          if (!pages?.length) {
            return {
              pages: [{ items: [item], nextCursor: null }],
<<<<<<< Updated upstream
              pageParams: current?.pageParams ?? [undefined],
=======
              pageParams: [undefined],
>>>>>>> Stashed changes
            }
          }

          const [firstPage, ...rest] = pages
          const existingItems = firstPage?.items ?? []
          const alreadyListed = existingItems.some((entry) => entry.id === item.id)
<<<<<<< Updated upstream
          if (alreadyListed) return current

          return {
            ...current,
            pages: [{ ...firstPage, items: [item, ...existingItems] }, ...rest],
=======
          if (alreadyListed || !current) return current

          return {
            pages: [{ ...firstPage, items: [item, ...existingItems] }, ...rest],
            pageParams: current.pageParams,
>>>>>>> Stashed changes
          }
        },
      )
      void queryClient.invalidateQueries({ queryKey: feedQueryKey })
    },
  })
}
