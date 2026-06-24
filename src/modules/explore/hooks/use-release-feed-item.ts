import { useQuery } from '@tanstack/react-query'
import { findReleaseFeedItem, releaseFeedItemQueryKey } from '@/modules/explore/lib/find-release-feed-item'

export function useReleaseFeedItem(releaseId: string) {
  return useQuery({
    queryKey: releaseFeedItemQueryKey(releaseId),
    queryFn: () => findReleaseFeedItem(releaseId),
    enabled: Boolean(releaseId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}

export { releaseFeedItemQueryKey }
