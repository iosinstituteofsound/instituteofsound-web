import { useQuery } from '@tanstack/react-query'
import { getProfileLabelOverview } from '@/modules/explore/api/explore.api'

export function useProfileLabelOverview(userId: string) {
  return useQuery({
    queryKey: ['profile-label-overview', userId],
    queryFn: () => getProfileLabelOverview(userId),
    enabled: Boolean(userId),
    staleTime: 60_000,
    retry: false,
  })
}
