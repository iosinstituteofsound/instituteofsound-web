import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

interface ReleaseGridCardProps {
  to?: string
  className?: string
  ariaLabel?: string
  artwork?: ReactNode
  title?: ReactNode
  meta?: ReactNode
  badges?: ReactNode
  actions?: ReactNode
}

export function ReleaseGridCard({
  to,
  className,
  ariaLabel,
  artwork,
  title,
  meta,
  badges,
  actions,
}: ReleaseGridCardProps) {
  const inner = (
    <div className="rel-grid-card__inner">
      <div className="rel-grid-card__art">
        {artwork}
        {badges}
        {actions}
      </div>
      {title ? <div className="rel-grid-card__body">{title}</div> : null}
      {meta ? <div className="rel-grid-card__foot">{meta}</div> : null}
    </div>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={cn('rel-grid-card', className)}
        aria-label={ariaLabel}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div className={cn('rel-grid-card', className)} aria-label={ariaLabel}>
      {inner}
    </div>
  )
}
