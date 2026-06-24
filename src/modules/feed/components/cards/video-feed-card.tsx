import type { FeedCardProps } from '@/modules/feed/lib/feed-card-props'
import { FeedCardShell, FeedMediaFrame, musicTrackContextLine, payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { Music2 } from 'lucide-react'

export function VideoFeedCard({ item, defaultCommentsOpen, compact }: FeedCardProps) {
  const videoUrl = payloadString(item.payload, 'videoUrl')
  const posterUrl = payloadString(item.payload, 'posterUrl')
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
