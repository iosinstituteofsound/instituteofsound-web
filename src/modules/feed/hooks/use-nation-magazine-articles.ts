import { useQuery } from '@tanstack/react-query'
import * as nationApi from '@/modules/feed/api/nation.api'
import { tokenStorage } from '@/shared/services/api/token-storage'

export const nationMagazineArticlesQueryKey = (limit: number) =>
  ['nation', 'magazine-articles', limit] as const

export function useNationMagazineArticles(limit = 8) {
  return useQuery({
    queryKey: nationMagazineArticlesQueryKey(limit),
    queryFn: () => nationApi.getNationMagazineArticles(limit),
    enabled: tokenStorage.hasSession(),
    staleTime: 60_000,
  })
}
