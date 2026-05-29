import clsx from 'clsx'
import type { LinkPreview } from '@/lib/community/linkPreview'
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
  let hostname = preview.siteName
  try {
    hostname = hostname || new URL(preview.url).hostname.replace(/^www\./, '')
  } catch {
    hostname = preview.siteName || 'Link'
  }

  return (
    <div className={clsx('community-link-preview', compact && 'community-link-preview-compact', className)}>
      {preview.imageUrl && (
        <div className="community-link-preview-image">
          <IOSImage
            src={preview.imageUrl}
            alt=""
            width={compact ? 120 : 480}
            crop="limit"
            className="community-link-preview-img"
          />
        </div>
      )}
      <div className="community-link-preview-body">
        <p className="community-link-preview-site">{hostname}</p>
        {preview.title && <p className="community-link-preview-title">{preview.title}</p>}
        {preview.description && !compact && (
          <p className="community-link-preview-desc">{preview.description}</p>
        )}
        <p className="community-link-preview-url">{preview.url}</p>
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
  )
}
