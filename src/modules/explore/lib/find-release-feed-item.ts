import { getFeedItemByRelease } from '@/modules/feed/api/feed-release.api'

export function releaseFeedItemQueryKey(releaseId: string) {
  return ['release-feed-item', releaseId] as const
}

export async function findReleaseFeedItem(releaseId: string) {
  if (!releaseId) return null
  return getFeedItemByRelease(releaseId)
}
