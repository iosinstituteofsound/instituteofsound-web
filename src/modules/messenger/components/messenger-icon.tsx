import { cn } from '@/shared/lib/cn'

type MessengerIconProps = {
  className?: string
}

/**
 * Chat bubble + lightning bolt tuned for the header utility chip.
 * The bolt cutout uses --ios-messenger-bolt so it matches the circular button bg.
 */
export function MessengerIcon({ className }: MessengerIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('ios-messenger-icon shrink-0', className)}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 1.75c-5.11 0-9.25 3.49-9.25 7.84 0 2.33 1.16 4.41 2.97 5.7-.15.72-.48 1.78-1.08 3.04 0 0 2.12-.42 4.01-1.61.54.08 1.09.13 1.66.13 5.11 0 9.25-3.49 9.25-7.84S17.11 1.75 12 1.75Z"
      />
      <path
        className="ios-messenger-icon__bolt"
        fill="var(--ios-messenger-bolt, var(--background))"
        d="M13.52 7.35 10.05 11.95h2.26l-1.41 4.15 4.8-5.2h-2.54l2.36-3.55Z"
      />
    </svg>
  )
}
