import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { IosBrandMarkSvg } from '@/components/brand/IosBrandMarkSvg'

type Props = {
  /** Set to false for display-only (no home link). */
  to?: string | false
  onClick?: () => void
  className?: string
  /** xs = top nav · sm = footer/auth · md = sidebar · lg = loader/hero */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Pulse glow — loader / hero moments */
  animated?: boolean
}

export function IosBrandLockup({
  to = '/',
  onClick,
  className,
  size = 'md',
  animated = false,
}: Props) {
  const mark = <IosBrandMarkSvg animated={animated} />

  const classes = clsx('ios-brand-mark', `ios-brand-mark--${size}`, className)

  if (to !== false) {
    return (
      <Link to={to} onClick={onClick} className={classes} aria-label="Institute of Sound — home">
        {mark}
      </Link>
    )
  }

  return <div className={classes}>{mark}</div>
}
