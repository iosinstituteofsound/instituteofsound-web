import { useState } from 'react'
import { resolveMediaUrl } from '@/shared/lib/resolve-media-url'
import { cn } from '@/shared/lib/cn'

type MessageMediaBubbleProps = {
  mediaUrl?: string
  isOutgoing: boolean
  caption?: string
  isTail?: boolean
  isStacked?: boolean
}

const MEDIA_WIDTH = 248
const MEDIA_MAX_HEIGHT = 320
const MEDIA_MIN_HEIGHT = 160

export function MessageMediaBubble({
  mediaUrl,
  isOutgoing,
  caption,
  isTail,
  isStacked,
}: MessageMediaBubbleProps) {
  const resolvedUrl = resolveMediaUrl(mediaUrl)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (!resolvedUrl) return null

  const mediaHeight = Math.min(
    MEDIA_MAX_HEIGHT,
    Math.max(MEDIA_MIN_HEIGHT, Math.round(MEDIA_WIDTH / Math.max(0.55, aspectRatio))),
  )
  const hasCaption = Boolean(caption?.trim())

  return (
    <div
      className={cn(
        'messenger-media-bubble',
        isOutgoing ? 'is-outgoing' : 'is-incoming',
        isStacked && 'is-stacked',
        isTail && (isOutgoing ? 'is-tail-out' : 'is-tail-in'),
        hasCaption && 'has-caption',
      )}
    >
      <div className="messenger-media-bubble__frame" style={{ height: mediaHeight }}>
        {hasError ? (
          <div className="messenger-media-bubble__error">Could not load image</div>
        ) : (
          <img
            src={resolvedUrl}
            alt=""
            className="messenger-media-bubble__image"
            loading="lazy"
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget
              if (naturalWidth > 0 && naturalHeight > 0) {
                setAspectRatio(naturalWidth / naturalHeight)
              }
              setIsLoading(false)
              setHasError(false)
            }}
            onError={() => {
              setIsLoading(false)
              setHasError(true)
            }}
          />
        )}
        {isLoading && !hasError ? (
          <div className="messenger-media-bubble__loading" aria-hidden />
        ) : null}
      </div>
      {hasCaption ? <div className="messenger-media-bubble__caption">{caption}</div> : null}
    </div>
  )
}
