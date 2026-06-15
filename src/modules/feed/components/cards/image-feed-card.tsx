import type { FeedCardProps } from '@/modules/feed/lib/feed-type-registry'
import { FeedCardShell, FeedMediaFrame, payloadString } from '@/modules/feed/components/cards/feed-card-shell'

export function ImageFeedCard({ item, defaultCommentsOpen }: FeedCardProps) {
  const imageUrl = payloadString(item.payload, 'imageUrl')
  const alt = payloadString(item.payload, 'alt') ?? item.title ?? 'Feed image'

  return (
    <FeedCardShell
      item={item}
      defaultCommentsOpen={defaultCommentsOpen}
      media={
        imageUrl ? (
          <FeedMediaFrame>
            <img src={imageUrl} alt={alt} />
          </FeedMediaFrame>
        ) : null
      }
    />
  )
}
