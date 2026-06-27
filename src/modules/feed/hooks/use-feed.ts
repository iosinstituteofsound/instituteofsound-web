import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import * as feedApi from '@/modules/feed/api/feed.api'
import { removeFeedItemFromAllListCaches } from '@/modules/feed/lib/feed-engagement'
import { sortFeedItemsLatest } from '@/modules/feed/lib/feed-sort'
import type { CreateFeedItemInput, FeedItemType, FeedListResponse } from '@/modules/feed/types/feed.types'

export const feedQueryKey = ['feed'] as const
export const FEED_PAGE_SIZE = 20

export type FeedScope = 'all' | 'following'

export type UseFeedListOptions = {
  limit?: number
  scope?: FeedScope
  authorId?: string
  type?: FeedItemType
  enabled?: boolean
}

export function feedListQueryKey({
  limit = FEED_PAGE_SIZE,
  scope = 'all',
  authorId,
  type,
}: UseFeedListOptions = {}) {
  return [...feedQueryKey, limit, scope, authorId ?? null, type ?? null] as const
}

export function useFeedList(options: UseFeedListOptions = {}) {
  const {
    limit = FEED_PAGE_SIZE,
    scope = 'all',
    authorId,
    type,
    enabled,
  } = options

  const resolvedEnabled = enabled ?? (authorId ? Boolean(authorId) : true)

  return useInfiniteQuery({
    queryKey: feedListQueryKey({ limit, scope, authorId, type }),
    queryFn: ({ pageParam }) =>
      feedApi.listFeed({
        limit,
        cursor: pageParam as string | undefined,
        ...(authorId ? { authorId, type } : { scope }),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: resolvedEnabled,
  })
}

/** Fetch state for feed list chrome (e.g. profile filter overlay) without duplicating query options. */
export function useFeedListStatus(options: UseFeedListOptions = {}) {
  const { isFetching, isFetchingNextPage, isLoading } = useFeedList(options)
  return { isFetching, isFetchingNextPage, isLoading }
}

function isFeedListCache(data: unknown): data is InfiniteData<FeedListResponse, string | undefined> {
  return Boolean(data && typeof data === 'object' && 'pages' in data && Array.isArray(data.pages))
}

export function useCreateFeedItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateFeedItemInput) => feedApi.createFeedItem(input),
    onSuccess: (item, variables) => {
      const audience = variables.payload?.audience
      const normalizedItem =
        audience && !item.payload?.audience
          ? { ...item, payload: { ...item.payload, audience } }
          : item

      queryClient.setQueriesData<InfiniteData<FeedListResponse, string | undefined>>(
        { queryKey: feedQueryKey },
        (current) => {
          if (!isFeedListCache(current)) return current

          const pages = current.pages
          if (!pages.length) {
            return {
              pages: [{ items: [normalizedItem], nextCursor: null }],
              pageParams: current.pageParams.length ? current.pageParams : [undefined],
            }
          }

          const [firstPage, ...rest] = pages
          const existingItems = firstPage?.items ?? []
          const alreadyListed = existingItems.some((entry) => entry.id === normalizedItem.id)
          if (alreadyListed) return current

          return {
            pages: [
              { ...firstPage, items: sortFeedItemsLatest([normalizedItem, ...existingItems]) },
              ...rest,
            ],
            pageParams: current.pageParams,
          }
        },
      )
      void queryClient.invalidateQueries({ queryKey: feedQueryKey })
    },
  })
}

export function useDeleteFeedItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => feedApi.deleteFeedItem(id),
    onSuccess: (_result, id) => {
      removeFeedItemFromAllListCaches(queryClient, id)
      void queryClient.invalidateQueries({ queryKey: feedQueryKey })
    },
  })
}
