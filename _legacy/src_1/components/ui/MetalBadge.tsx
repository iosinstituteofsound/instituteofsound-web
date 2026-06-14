import clsx from 'clsx'
import type { ReactNode } from 'react'

interface MetalBadgeProps {
  children: ReactNode
  variant?: 'red' | 'crimson' | 'dark' | 'live'
  className?: string
}

export function MetalBadge({ children, variant = 'red', className }: MetalBadgeProps) {
  return (
    <span
      className={clsx(
        'metal-badge',
        variant === 'crimson' && 'metal-badge-crimson',
        variant === 'dark' && 'metal-badge-dark',
        variant === 'live' && 'metal-badge-live',
        className
      )}
    >
      {variant === 'live' && <span className="metal-badge-dot" aria-hidden />}
      {children}
    </span>
  )
}
