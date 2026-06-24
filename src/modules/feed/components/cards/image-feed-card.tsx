import type { FeedCardProps } from '@/modules/feed/lib/feed-card-props'
import { FeedCardShell, FeedMediaFrame, musicTrackContextLine, payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { Music2 } from 'lucide-react'

export function ImageFeedCard({ item, defaultCommentsOpen, compact }: FeedCardProps) {
  const imageUrl = payloadString(item.payload, 'imageUrl')
  const alt = payloadString(item.payload, 'alt') ?? item.title ?? 'Feed image'
  const audioLine = musicTrackContextLine(item.payload)

  return (
    <FeedCardShell
      item={item}
      defaultCommentsOpen={defaultCommentsOpen}
      compact={compact}
      headerContext={
        audioLine ? (
          <>
            <Music2 aria-hidden />
            <span>{audioLine}</span>
          </>
        ) : undefined
      }
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
