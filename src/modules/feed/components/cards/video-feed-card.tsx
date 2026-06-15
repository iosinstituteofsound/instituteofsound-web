import type { FeedCardProps } from '@/modules/feed/lib/feed-type-registry'
import { FeedCardShell, FeedMediaFrame, payloadString } from '@/modules/feed/components/cards/feed-card-shell'

export function VideoFeedCard({ item, defaultCommentsOpen }: FeedCardProps) {
  const videoUrl = payloadString(item.payload, 'videoUrl')
  const posterUrl = payloadString(item.payload, 'posterUrl')

  return (
    <FeedCardShell
      item={item}
      defaultCommentsOpen={defaultCommentsOpen}
      media={
        videoUrl ? (
          <FeedMediaFrame>
            <video controls poster={posterUrl}>
              <source src={videoUrl} />
            </video>
          </FeedMediaFrame>
        ) : null
      }
    />
  )
}
