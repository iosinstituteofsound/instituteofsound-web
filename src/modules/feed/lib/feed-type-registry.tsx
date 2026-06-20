import type { ComponentType } from 'react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import type { FeedCardProps } from '@/modules/feed/lib/feed-card-props'
import { ArticleFeedCard } from '@/modules/feed/components/cards/article-feed-card'
import { ImageFeedCard } from '@/modules/feed/components/cards/image-feed-card'
import { MusicFeedCard } from '@/modules/feed/components/cards/music-feed-card'
import { TextFeedCard } from '@/modules/feed/components/cards/text-feed-card'
import { VideoFeedCard } from '@/modules/feed/components/cards/video-feed-card'
import { ModelFeedCard } from '@/modules/feed/components/cards/model-feed-card'

export type { FeedCardProps } from '@/modules/feed/lib/feed-card-props'

export const FEED_RENDERERS: Record<FeedItemDto['type'], ComponentType<FeedCardProps>> = {
  music: MusicFeedCard,
  video: VideoFeedCard,
  image: ImageFeedCard,
  text: TextFeedCard,
  article: ArticleFeedCard,
<<<<<<< Updated upstream
  model: ModelFeedCard,
} satisfies Record<FeedItemDto['type'], ComponentType<FeedCardProps>>
=======
}
>>>>>>> Stashed changes

export function FeedItemCard({ item, defaultCommentsOpen, compact }: FeedCardProps) {
  const Renderer = FEED_RENDERERS[item.type] ?? TextFeedCard
  return <Renderer item={item} defaultCommentsOpen={defaultCommentsOpen} compact={compact} />
}
