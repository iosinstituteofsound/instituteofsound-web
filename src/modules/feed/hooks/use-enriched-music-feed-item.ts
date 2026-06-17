import { useMemo } from 'react'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import { enrichMusicFeedItem } from '@/modules/feed/lib/feed-release-payload'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'

export function useEnrichedMusicFeedItem(item: FeedItemDto): FeedItemDto {
  const { data: explore } = useExplore()

  return useMemo(() => enrichMusicFeedItem(item, explore), [item, explore])
}
