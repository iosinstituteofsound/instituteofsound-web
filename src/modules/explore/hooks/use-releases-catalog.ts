import { useQuery } from '@tanstack/react-query'
import { getReleasesCatalog } from '@/modules/explore/api/explore.api'

export function useReleasesCatalog() {
  return useQuery({
    queryKey: ['explore', 'releases-catalog'],
    queryFn: getReleasesCatalog,
    staleTime: 60_000,
  })
}
