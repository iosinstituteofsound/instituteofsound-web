import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as followApi from '@/shared/services/social/follow.api'

export function useFollowingUsers(userId?: string) {
  return useQuery({
    queryKey: ['following-users', userId],
    queryFn: async () => {
      const result = await followApi.listFollowing(userId!, { limit: 100 })
      return result.users
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useFollowingUserIds(userId?: string) {
  const query = useFollowingUsers(userId)
  const ids = useMemo(() => query.data?.map((user) => user.id) ?? [], [query.data])
  return { ...query, ids }
}
