import { useQuery } from '@tanstack/react-query'
import { getProfileCuratorOverview } from '@/modules/explore/api/explore.api'

export function useProfileCuratorOverview(userId: string) {
  return useQuery({
    queryKey: ['profile-curator-overview', userId],
    queryFn: () => getProfileCuratorOverview(userId),
    enabled: Boolean(userId),
    staleTime: 60_000,
    retry: false,
  })
}
