import { useQuery } from '@tanstack/react-query'
import { searchLabelFeaturedReleases } from '@/modules/explore/api/explore.api'

export function useLabelFeaturedReleaseSearch(query: string, enabled: boolean) {
  const trimmed = query.trim()

  return useQuery({
    queryKey: ['label-featured-release-search', trimmed],
    queryFn: () => searchLabelFeaturedReleases(trimmed),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 30_000,
  })
}
