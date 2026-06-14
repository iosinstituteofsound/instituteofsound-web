import type { FeedCardProps } from '@/modules/feed/lib/feed-type-registry'
import { FeedCardShell, payloadString } from '@/modules/feed/components/cards/feed-card-shell'

export function VideoFeedCard({ item, defaultCommentsOpen }: FeedCardProps) {
  const videoUrl = payloadString(item.payload, 'videoUrl')
  const posterUrl = payloadString(item.payload, 'posterUrl')

  return (
    <FeedCardShell
      item={item}
      defaultCommentsOpen={defaultCommentsOpen}
      media={
        videoUrl ? (
          <video controls className="max-h-[520px] w-full bg-black" poster={posterUrl}>
            <source src={videoUrl} />
          </video>
        ) : null
      }
    />
  )
}
