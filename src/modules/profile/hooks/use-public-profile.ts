import { useQuery } from '@tanstack/react-query'
import { getPublicProfile } from '@/modules/search/api/search.api'

export function usePublicProfile(userId?: string) {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () => getPublicProfile(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}
