import { useQuery } from '@tanstack/react-query'
import * as nationApi from '@/modules/feed/api/nation.api'
import { tokenStorage } from '@/shared/services/api/token-storage'

export const nationTrendingTracksQueryKey = (limit: number) =>
  ['nation', 'trending-tracks', limit] as const

export function useNationTrendingTracks(limit = 5) {
  return useQuery({
    queryKey: nationTrendingTracksQueryKey(limit),
    queryFn: () => nationApi.getNationTrendingTracks(limit),
    enabled: tokenStorage.hasSession(),
    staleTime: 60_000,
  })
}
