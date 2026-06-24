import type { FeedCardProps } from '@/modules/feed/lib/feed-card-props'
import { FeedCardShell, FeedMediaFrame, musicTrackContextLine, payloadString } from '@/modules/feed/components/cards/feed-card-shell'

export function ImageFeedCard({ item, defaultCommentsOpen, compact }: FeedCardProps) {
  const imageUrl = payloadString(item.payload, 'imageUrl')
  const alt = payloadString(item.payload, 'alt') ?? item.title ?? 'Feed image'
  const audioLine = musicTrackContextLine(item.payload)

  return (
    <FeedCardShell
      item={item}
      defaultCommentsOpen={defaultCommentsOpen}
      compact={compact}
      headerAudioLabel={audioLine || undefined}
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
