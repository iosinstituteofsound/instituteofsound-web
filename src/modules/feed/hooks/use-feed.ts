import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as feedApi from '@/modules/feed/api/feed.api'
import type { CreateFeedItemInput } from '@/modules/feed/types/feed.types'

export const feedQueryKey = ['feed'] as const

export function useFeedList(limit = 20) {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedQueryKey })
    },
  })
}
