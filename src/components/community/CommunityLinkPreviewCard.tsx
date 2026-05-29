import clsx from 'clsx'
import { normalizeLinkPreviewForDisplay, type LinkPreview } from '@/lib/community/linkPreview'
import { IOSImage } from '@/components/ui/IOSImage'

interface CommunityLinkPreviewCardProps {
  preview: LinkPreview
  className?: string
  compact?: boolean
  onRemove?: () => void
}

export function CommunityLinkPreviewCard({
  preview,
  className,
  compact = false,
  onRemove,
}: CommunityLinkPreviewCardProps) {
  const { preview: display, isMinimal } = normalizeLinkPreviewForDisplay(preview)
  const inComposer = Boolean(onRemove)
  const showUrl = !inComposer && !compact

  let hostname = display.siteName
  try {
    hostname = hostname || new URL(display.url).hostname.replace(/^www\./, '')
  } catch {
    hostname = display.siteName || 'Link'
  }

  return (
    <div className={clsx('community-link-preview-wrap', inComposer && isMinimal && 'community-link-preview-wrap-minimal')}>
      <div className={clsx('community-link-preview', compact && 'community-link-preview-compact', className)}>
        {display.imageUrl && (
          <div className="community-link-preview-image">
            <IOSImage
              src={display.imageUrl}
              alt=""
              width={compact ? 120 : 480}
              crop="limit"
              className="community-link-preview-img"
            />
          </div>
        )}
        <div className="community-link-preview-body">
          <p className="community-link-preview-site">{hostname}</p>
          {display.title && <p className="community-link-preview-title">{display.title}</p>}
          {display.description && !compact && (
            <p className="community-link-preview-desc">{display.description}</p>
          )}
          {showUrl && <p className="community-link-preview-url">{display.url}</p>}
        </div>
        {onRemove && (
          <button
            type="button"
            className="community-link-preview-remove"
            aria-label="Remove link preview"
            onClick={onRemove}
          >
            ✕
          </button>
        )}
      </div>
      {inComposer && isMinimal && (
        <p className="community-composer-preview-note text-sm text-muted">
          This site doesn&apos;t share a full preview; your link will still post.
        </p>
      )}
    </div>
  )
}
