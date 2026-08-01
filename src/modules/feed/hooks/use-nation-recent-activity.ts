import { useQuery } from '@tanstack/react-query'
import * as nationApi from '@/modules/feed/api/nation.api'
import { tokenStorage } from '@/shared/services/api/token-storage'

export const nationRecentActivityQueryKey = ['nation', 'recent-activity'] as const

export function useNationRecentActivity() {
  return useQuery({
    queryKey: nationRecentActivityQueryKey,
    queryFn: nationApi.getNationRecentActivity,
    enabled: tokenStorage.hasSession(),
    staleTime: 60_000,
  })
}
