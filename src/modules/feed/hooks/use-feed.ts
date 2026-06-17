import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import * as feedApi from '@/modules/feed/api/feed.api'
import { sortFeedItemsLatest } from '@/modules/feed/lib/feed-sort'
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

function isFeedListCache(data: unknown): data is InfiniteData<FeedListResponse, string | undefined> {
  return Boolean(data && typeof data === 'object' && 'pages' in data && Array.isArray(data.pages))
}

export function useCreateFeedItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateFeedItemInput) => feedApi.createFeedItem(input),
    onSuccess: (item) => {
      queryClient.setQueriesData<InfiniteData<FeedListResponse, string | undefined>>(
        { queryKey: feedQueryKey },
        (current) => {
          if (!isFeedListCache(current)) return current

          const pages = current.pages
          if (!pages.length) {
            return {
              pages: [{ items: [item], nextCursor: null }],
              pageParams: current.pageParams.length ? current.pageParams : [undefined],
            }
          }

          const [firstPage, ...rest] = pages
          const existingItems = firstPage?.items ?? []
          const alreadyListed = existingItems.some((entry) => entry.id === item.id)
          if (alreadyListed) return current

          return {
            pages: [{ ...firstPage, items: sortFeedItemsLatest([item, ...existingItems]) }, ...rest],
            pageParams: current.pageParams,
          }
        },
      )
      void queryClient.invalidateQueries({ queryKey: feedQueryKey })
      void queryClient.invalidateQueries({ queryKey: ['profile-posts'] })
    },
  })
}
