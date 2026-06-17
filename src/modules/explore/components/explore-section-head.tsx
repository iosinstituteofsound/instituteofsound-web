import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export type ExploreSectionHeadActionProps = {
  label: string
  href?: string
  to?: string
  className?: string
}

export function ExploreSectionHeadAction({
  label,
  href,
  to,
  className,
}: ExploreSectionHeadActionProps) {
  const content = (
    <>
      <span className="explore-section-head__action-text">{label}</span>
      <span className="explore-section-head__action-arrow" aria-hidden>
        →
      </span>
    </>
  )
  const classNames = cn('explore-section-head__action', className)

  if (to) {
    return (
      <Link to={to} className={classNames}>
        {content}
      </Link>
    )
  }

  return (
    <a href={href ?? '#'} className={classNames}>
      {content}
    </a>
  )
}

export type ExploreSectionHeadProps = {
  index: number | string
  title: string
  kicker?: string
  description?: string
  action?: ReactNode
  aside?: ReactNode
  footer?: ReactNode
  className?: string
}

function formatSectionIndex(index: number | string) {
  return typeof index === 'number' ? String(index).padStart(2, '0') : index
}

export function ExploreSectionHead({
  index,
  title,
  kicker,
  description,
  action,
  aside,
  footer,
  className,
}: ExploreSectionHeadProps) {
  return (
    <header className={cn('explore-section-head', className)}>
      <div className="explore-section-head__row">
        <div className="explore-section-head__brand">
          <span className="explore-section-head__num" aria-hidden>
            {formatSectionIndex(index)}
          </span>
          <div className="explore-section-head__copy">
            {kicker ? <p className="explore-section-head__kicker">{kicker}</p> : null}
            <h2 className="explore-section-head__title">{title}</h2>
            {description ? <p className="explore-section-head__sub">{description}</p> : null}
          </div>
        </div>

        {aside ? <div className="explore-section-head__aside">{aside}</div> : null}
        {action ? <div className="explore-section-head__actions">{action}</div> : null}
      </div>

      {footer ? <div className="explore-section-head__footer">{footer}</div> : null}
    </header>
  )
}
