import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface MediaPreviewRowProps {
  artwork?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  className?: string
  onClick?: () => void
}

export function MediaPreviewRow({
  artwork,
  title,
  subtitle,
  trailing,
  className,
  onClick,
}: MediaPreviewRowProps) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-3 text-left',
        onClick && 'transition-colors hover:bg-accent/40',
        className,
      )}
      onClick={onClick}
    >
      {artwork ? <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md">{artwork}</div> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </Comp>
  )
}
