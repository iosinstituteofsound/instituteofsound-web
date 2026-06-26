import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import * as followApi from '@/modules/social/api/follow.api'

export const followStatsQueryKey = (userId: string) => ['follow-stats', userId] as const
export const followStatusQueryKey = (userId: string) => ['follow-status', userId] as const
export const followingListQueryKey = ['following-list'] as const

export function useFollowStats(userId?: string) {
  return useQuery({
    queryKey: followStatsQueryKey(userId ?? ''),
    queryFn: () => followApi.getFollowStats(userId!),
    enabled: Boolean(userId),
    staleTime: 30_000,
  })
}

export function useFollowStatus(userId?: string) {
  return useQuery({
    queryKey: followStatusQueryKey(userId ?? ''),
    queryFn: () => followApi.getFollowStatus(userId!),
    enabled: Boolean(userId),
    staleTime: 30_000,
  })
}

export function useToggleFollow(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (currentlyFollowing: boolean) => {
      if (currentlyFollowing) return followApi.unfollowUser(userId)
      return followApi.followUser(userId)
    },
    onMutate: async (currentlyFollowing) => {
      await queryClient.cancelQueries({ queryKey: followStatusQueryKey(userId) })
      await queryClient.cancelQueries({ queryKey: followStatsQueryKey(userId) })

      const previousStatus = queryClient.getQueryData<followApi.FollowStatusDto>(
        followStatusQueryKey(userId),
      )
      const nextFollowing = !currentlyFollowing

      queryClient.setQueryData(followStatusQueryKey(userId), { following: nextFollowing })
      queryClient.setQueryData<followApi.FollowStatsDto>(followStatsQueryKey(userId), (current) =>
        current
          ? {
              ...current,
              isFollowing: nextFollowing,
              followerCount: Math.max(0, current.followerCount + (nextFollowing ? 1 : -1)),
            }
          : current,
      )

      queryClient.setQueryData(
        ['public-profile', userId],
        (current: { followerCount?: number; isFollowing?: boolean } | undefined) =>
          current
            ? {
                ...current,
                isFollowing: nextFollowing,
                followerCount: Math.max(0, (current.followerCount ?? 0) + (nextFollowing ? 1 : -1)),
              }
            : current,
      )

      return { previousStatus }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(followStatusQueryKey(userId), context.previousStatus)
      }
      void queryClient.invalidateQueries({ queryKey: followStatusQueryKey(userId) })
      void queryClient.invalidateQueries({ queryKey: followStatsQueryKey(userId) })
    },
    onSuccess: (result) => {
      queryClient.setQueryData(followStatusQueryKey(userId), result)
      void queryClient.invalidateQueries({ queryKey: followStatsQueryKey(userId) })
      void queryClient.invalidateQueries({ queryKey: ['public-profile', userId] })
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
      void queryClient.invalidateQueries({ queryKey: followingListQueryKey })
      void queryClient.invalidateQueries({ queryKey: ['following-users'] })
    },
  })
}

export function useFollowersList(userId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['followers', userId],
    queryFn: ({ pageParam }) =>
      followApi.listFollowers(userId, { limit: 20, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && Boolean(userId),
  })
}

export function useFollowingUsersList(userId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['following', userId],
    queryFn: ({ pageParam }) =>
      followApi.listFollowing(userId, { limit: 20, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && Boolean(userId),
  })
}
