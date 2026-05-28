import { Link } from 'react-router-dom'
import clsx from 'clsx'

type Props = {
  to?: string
  onClick?: () => void
  className?: string
  /** Red rectangle frame (sidebar / hero). `bar` = legacy left-stroke. */
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
  const content = (
    <>
      {variant === 'frame' ? (
        <span
          className={clsx('ios-brand-frame-title', size === 'sm' && 'ios-brand-frame-title-sm')}
        >
          <span className="ios-brand-frame-line">Institute</span>
          <span className="ios-brand-frame-line ios-brand-frame-line-accent">of Sound</span>
        </span>
      ) : (
        <span
          className={clsx(
            'ios-brand-title font-sans font-bold tracking-tight',
            size === 'md' && 'text-lg md:text-xl',
            size === 'sm' && 'text-base',
          )}
        >
          Institute
          <span className="text-mh-red"> of Sound</span>
        </span>
      )}
      {showSub && (
        <span
          className={clsx(
            variant === 'frame' ? 'ios-brand-frame-sub' : 'ios-brand-sub text-[10px] text-muted mt-1',
            size === 'sm' && variant === 'frame' && 'ios-brand-frame-sub-sm',
          )}
        >
          Underground HQ
        </span>
      )}
    </>
  )

  const classes = clsx(
    variant === 'frame' && 'ios-brand-frame',
    variant === 'frame' && size === 'sm' && 'ios-brand-frame-sm',
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
