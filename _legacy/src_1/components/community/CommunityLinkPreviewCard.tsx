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
  const rich = !compact
  const showUrl = !inComposer && !compact

  let hostname = display.siteName
  try {
    hostname = hostname || new URL(display.url).hostname.replace(/^www\./, '')
  } catch {
    hostname = display.siteName || 'Link'
  }

  return (
    <div
      className={clsx(
        'community-link-preview-wrap',
        inComposer && isMinimal && 'community-link-preview-wrap-minimal'
      )}
    >
      <div
        className={clsx(
          'community-link-preview',
          rich && 'community-link-preview-rich',
          compact && 'community-link-preview-compact',
          className
        )}
      >
        {rich ? (
          <>
            {display.imageUrl ? (
              <div className="community-link-preview-hero">
                <IOSImage
                  src={display.imageUrl}
                  alt=""
                  width={760}
                  crop="limit"
                  className="community-link-preview-hero-img"
                />
              </div>
            ) : (
              <div className="community-link-preview-hero community-link-preview-hero-placeholder" aria-hidden>
                <span className="community-link-preview-hero-icon">⛓</span>
              </div>
            )}
            <div className="community-link-preview-body">
              <p className="community-link-preview-site">{hostname}</p>
              {display.title && (
                <p className="community-link-preview-title">{display.title}</p>
              )}
              {display.description && (
                <p className="community-link-preview-desc">{display.description}</p>
              )}
              {showUrl && <p className="community-link-preview-url">{display.url}</p>}
            </div>
          </>
        ) : (
          <>
            {display.imageUrl && (
              <div className="community-link-preview-image">
                <IOSImage
                  src={display.imageUrl}
                  alt=""
                  width={120}
                  crop="limit"
                  className="community-link-preview-img"
                />
              </div>
            )}
            <div className="community-link-preview-body">
              <p className="community-link-preview-site">{hostname}</p>
              {display.title && <p className="community-link-preview-title">{display.title}</p>}
              {display.description && (
                <p className="community-link-preview-desc">{display.description}</p>
              )}
              {showUrl && <p className="community-link-preview-url">{display.url}</p>}
            </div>
          </>
        )}
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
          This site limits automated previews — your link will still post. Try a specific article URL
          for a richer card.
        </p>
      )}
    </div>
  )
}
