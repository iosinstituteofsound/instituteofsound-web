import clsx from 'clsx'
import type { ReactNode } from 'react'

export type DismissibleBannerVariant = 'error' | 'success' | 'info'

interface DismissibleBannerProps {
  variant: DismissibleBannerVariant
  children: ReactNode
  onDismiss: () => void
  className?: string
}

const variantClass: Record<DismissibleBannerVariant, string> = {
  error: 'ios-banner-error',
  success: 'ios-banner-success',
  info: 'ios-banner-info',
}

export function DismissibleBanner({
  variant,
  children,
  onDismiss,
  className,
}: DismissibleBannerProps) {
  return (
    <div
      className={clsx('ios-banner', variantClass[variant], className)}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div className="ios-banner-body">{children}</div>
      <button
        type="button"
        className="ios-banner-close"
        onClick={onDismiss}
        aria-label="Close message"
      >
        Close
      </button>
    </div>
  )
}
