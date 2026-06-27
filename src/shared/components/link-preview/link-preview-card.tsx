import { ExternalLink, Link2, X } from 'lucide-react'
import {
  normalizeLinkPreviewForDisplay,
  type LinkPreview,
} from '@/shared/lib/link-preview/link-preview'
import { cn } from '@/shared/lib/cn'
import '@/shared/components/link-preview/link-preview-card.css'

interface LinkPreviewCardProps {
  preview: LinkPreview
  className?: string
  compact?: boolean
  onRemove?: () => void
}

function linkCtaLabel(siteName: string): string {
  const name = siteName.trim()
  if (!name || name === 'Link') return 'Open link'
  return `Open on ${name}`
}

export function LinkPreviewCard({ preview, className, compact = false, onRemove }: LinkPreviewCardProps) {
  const { preview: display, isMinimal } = normalizeLinkPreviewForDisplay(preview)
  const inComposer = Boolean(onRemove)

  let hostname = display.siteName
  try {
    hostname = hostname || new URL(display.url).hostname.replace(/^www\./, '')
  } catch {
    hostname = display.siteName || 'Link'
  }

  const shellClass = cn(
    'ios-link-preview',
    compact && 'ios-link-preview--compact',
    !inComposer && 'ios-link-preview--interactive',
    className,
  )

  const media = (
    <div className="ios-link-preview__media">
      {display.imageUrl ? (
        <img
          src={display.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="ios-link-preview__img"
        />
      ) : (
        <div className="ios-link-preview__hero-placeholder" aria-hidden>
          <Link2 className={cn(compact ? 'h-6 w-6' : 'h-10 w-10', 'opacity-45')} />
        </div>
      )}

      <span className="ios-mh-badge ios-link-preview__badge">{hostname}</span>

      {!inComposer ? (
        <span className="ios-link-preview__hover-icon" aria-hidden>
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      ) : null}

      <div className="ios-link-preview__overlay">
        {display.title ? (
          <p className="ios-link-preview__title">{display.title}</p>
        ) : compact ? (
          <p className="ios-link-preview__title">{hostname}</p>
        ) : null}
        {display.description && !compact ? (
          <p className="ios-link-preview__desc">{display.description}</p>
        ) : null}
        {!inComposer ? (
          <span className="ios-link-preview__cta">
            {linkCtaLabel(hostname)}
            <ExternalLink className="ios-link-preview__cta-icon" aria-hidden />
          </span>
        ) : null}
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'ios-link-preview-outer',
        compact && 'ios-link-preview-outer--compact',
      )}
    >
      {inComposer ? (
        <div className={shellClass}>
          {media}
          <button
            type="button"
            className="ios-link-preview__remove"
            aria-label="Remove link preview"
            onClick={onRemove}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <a href={display.url} target="_blank" rel="noreferrer" className={shellClass}>
          {media}
        </a>
      )}

      {inComposer && isMinimal ? (
        <p className="ios-link-preview__note">
          This site limits automated previews — your link will still post.
        </p>
      ) : null}
    </div>
  )
}

export function LinkPreviewCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'ios-link-preview-outer',
        compact && 'ios-link-preview-outer--compact',
      )}
    >
      <div
        className={cn(
          'ios-link-preview ios-link-preview--skeleton',
          compact && 'ios-link-preview--compact',
        )}
      >
        <div className="ios-link-preview__media" />
        {compact ? (
          <div className="ios-link-preview__overlay">
            <div className="ios-link-preview__skel-line ios-link-preview__skel-line--sm" />
            <div className="ios-link-preview__skel-line ios-link-preview__skel-line--md" />
          </div>
        ) : (
          <div className="ios-link-preview__overlay">
            <div className="ios-link-preview__skel-line ios-link-preview__skel-line--md" />
            <div className="ios-link-preview__skel-line ios-link-preview__skel-line--sm" />
          </div>
        )}
      </div>
    </div>
  )
}
