import { useQuery } from '@tanstack/react-query'
import * as nationApi from '@/modules/feed/api/nation.api'
import { tokenStorage } from '@/shared/services/api/token-storage'

export const nationTopArtistsQueryKey = (limit: number) => ['nation', 'top-artists', limit] as const

export function useNationTopArtists(limit = 10) {
  return useQuery({
    queryKey: nationTopArtistsQueryKey(limit),
    queryFn: () => nationApi.getNationTopArtists(limit),
    enabled: tokenStorage.hasSession(),
    staleTime: 60_000,
  })
}
