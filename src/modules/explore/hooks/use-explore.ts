import { useQuery } from '@tanstack/react-query'
import { getArticle, getExplore } from '@/modules/explore/api/explore.api'

export function useExplore() {
  return useQuery({
    queryKey: ['explore'],
    queryFn: getExplore,
    staleTime: 60_000,
  })
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticle(slug),
    enabled: Boolean(slug),
  })
}
