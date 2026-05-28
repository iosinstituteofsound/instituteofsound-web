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
      <span
        className={clsx(
          variant === 'frame' ? 'ios-brand-frame-title' : 'ios-brand-title font-display font-extrabold',
          size === 'sm' && variant === 'frame' && 'ios-brand-frame-title-sm',
          variant === 'bar' && size === 'md' && 'text-lg md:text-xl tracking-tight',
          variant === 'bar' && size === 'sm' && 'text-base tracking-tight',
        )}
      >
        INSTITUTE
        <br />
        OF SOUND
      </span>
      {showSub && (
        <span
          className={clsx(
            variant === 'frame' ? 'ios-brand-frame-sub' : 'ios-brand-sub text-[10px] tracking-[0.35em] text-muted uppercase mt-0.5',
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
