import { ExternalLink, Link2, X } from 'lucide-react'
import {
  normalizeLinkPreviewForDisplay,
  type LinkPreview,
} from '@/modules/feed/lib/link-preview'
import { premiumSurfaceClass } from '@/shared/lib/surface-classes'
import { cn } from '@/shared/lib/cn'

interface LinkPreviewCardProps {
  preview: LinkPreview
  className?: string
  compact?: boolean
  onRemove?: () => void
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

  const content = (
    <>
      {display.imageUrl ? (
        <div className={cn('overflow-hidden bg-muted', compact ? 'h-20 w-20 shrink-0' : 'aspect-[1.91/1] w-full')}>
          <img
            src={display.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className={cn('h-full w-full object-cover', compact ? 'h-20 w-20' : '')}
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center bg-muted text-muted-foreground',
            compact ? 'h-20 w-20 shrink-0' : 'aspect-[1.91/1] w-full',
          )}
          aria-hidden
        >
          <Link2 className={cn(compact ? 'h-6 w-6' : 'h-10 w-10', 'opacity-50')} />
        </div>
      )}

      <div className={cn('min-w-0 flex-1 p-3', compact && 'py-2 pl-3 pr-2')}>
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {hostname}
        </p>
        {display.title ? (
          <p className={cn('mt-1 font-semibold leading-snug text-foreground', compact ? 'line-clamp-2 text-sm' : 'line-clamp-2')}>
            {display.title}
          </p>
        ) : null}
        {display.description && !compact ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{display.description}</p>
        ) : null}
        {!inComposer ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
            Open link
            <ExternalLink className="h-3 w-3" />
          </p>
        ) : null}
      </div>
    </>
  )

  const shellClass = cn(
    premiumSurfaceClass,
    'relative overflow-hidden text-left transition-colors',
    compact ? 'flex' : 'block',
    !inComposer && 'hover:bg-muted/30',
    className,
  )

  return (
    <div className="space-y-2">
      {inComposer ? (
        <div className={shellClass}>
          {content}
          <button
            type="button"
            className="absolute right-2 top-2 rounded-full bg-background/90 p-1 text-muted-foreground shadow-sm hover:text-foreground"
            aria-label="Remove link preview"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <a href={display.url} target="_blank" rel="noreferrer" className={shellClass}>
          {content}
        </a>
      )}

      {inComposer && isMinimal ? (
        <p className="text-xs text-muted-foreground">
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
        premiumSurfaceClass,
        'animate-pulse overflow-hidden',
        compact ? 'flex' : 'block',
      )}
    >
      <div className={cn('bg-muted', compact ? 'h-20 w-20' : 'aspect-[1.91/1] w-full')} />
      <div className="flex-1 space-y-2 p-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        {!compact ? <div className="h-3 w-full rounded bg-muted" /> : null}
      </div>
    </div>
  )
}
