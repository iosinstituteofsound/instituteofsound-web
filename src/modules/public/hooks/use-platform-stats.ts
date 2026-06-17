import { useQuery } from '@tanstack/react-query'
import { getPlatformStats } from '@/modules/public/api/platform-stats.api'

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: getPlatformStats,
    staleTime: 60_000,
  })
}
