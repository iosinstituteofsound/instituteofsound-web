import { Link } from 'react-router-dom'
import clsx from 'clsx'

type Props = {
  to?: string
  onClick?: () => void
  className?: string
  /** Sidebar / footer masthead. `bar` = compact top nav. */
  variant?: 'frame' | 'bar'
  size?: 'sm' | 'md'
  showSub?: boolean
}

export function IosBrandLockup({
  to = '/',
  onClick,
  className,
  variant = 'frame',
  size = 'md',
  showSub = true,
}: Props) {
  const content =
    variant === 'frame' ? (
      <span
        className={clsx('ios-brand-plate', size === 'sm' && 'ios-brand-plate--sm')}
      >
        <span className="ios-brand-plate__idx" aria-hidden>
          01
        </span>
        <span className="ios-brand-plate__body">
          <span className="ios-brand-plate__eyebrow">Institute</span>
          <span className="ios-brand-plate__title">of Sound</span>
          {showSub && <span className="ios-brand-plate__sub">Underground HQ</span>}
        </span>
      </span>
    ) : (
      <>
        <span
          className={clsx(
            'ios-brand-title font-display font-extrabold tracking-tight uppercase',
            size === 'md' && 'text-lg md:text-xl',
            size === 'sm' && 'text-base',
          )}
        >
          Institute
          <span className="text-mh-red"> of Sound</span>
        </span>
        {showSub && (
          <span className="ios-brand-sub text-[10px] text-muted mt-1 tracking-[0.28em] uppercase">
            Underground HQ
          </span>
        )}
      </>
    )

  const classes = clsx(
    variant === 'frame' && 'ios-brand-frame',
    variant === 'bar' && 'ios-brand-lockup group flex flex-col leading-none',
    className,
  )

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={classes} aria-label="Institute of Sound — home">
        {content}
      </Link>
    )
  }

  return <div className={classes}>{content}</div>
}
