import type { FeedCardProps } from '@/modules/feed/lib/feed-type-registry'
import { FeedModelViewer } from '@/modules/feed/components/feed-model-viewer'
import { FeedCardShell, FeedMediaFrame, payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { resolveFeedAssetUrl } from '@/modules/feed/lib/feed-media-url'
import { modelFormatLabel } from '@/modules/feed/lib/media-utils'

export function ModelFeedCard({ item, defaultCommentsOpen, compact }: FeedCardProps) {
  const modelUrl = resolveFeedAssetUrl(payloadString(item.payload, 'modelUrl'))
  const posterUrl = resolveFeedAssetUrl(payloadString(item.payload, 'posterUrl'))
  const sourceFormat = payloadString(item.payload, 'sourceFormat')
  const convertedFormat = payloadString(item.payload, 'convertedFormat')
  const converted = item.payload.converted === true
  const originalName = payloadString(item.payload, 'originalName')
  const alt = originalName ?? item.title ?? '3D model'

  return (
    <FeedCardShell
      item={item}
      defaultCommentsOpen={defaultCommentsOpen}
      compact={compact}
      media={
        modelUrl ? (
          <FeedMediaFrame className="feed-model-viewer-frame">
            <div className="relative">
              <FeedModelViewer
                src={modelUrl}
                iosSrc={convertedFormat === 'usdz' ? modelUrl : undefined}
                poster={posterUrl}
                alt={alt}
              />
              {sourceFormat ? (
                <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
                  {modelFormatLabel(sourceFormat, converted)}
                </span>
              ) : null}
            </div>
          </FeedMediaFrame>
        ) : null
      }
    />
  )
}
