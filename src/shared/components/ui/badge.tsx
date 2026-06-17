import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center border px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] transition-colors',
  {
    variants: {
      variant: {
        default: 'rounded-full border-transparent bg-primary text-primary-foreground',
        secondary: 'rounded-full border-transparent bg-secondary text-secondary-foreground',
        destructive: 'rounded-full border-transparent bg-destructive text-destructive-foreground',
        outline: 'rounded-full text-foreground',
        metal: 'ios-mh-badge',
        'metal-live': 'ios-mh-badge ios-mh-badge--live',
        'metal-crimson': 'ios-mh-badge ios-mh-badge--crimson',
        'metal-dark': 'ios-mh-badge ios-mh-badge--dark',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  const showLiveDot = variant === 'metal-live'
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {showLiveDot ? <span className="ios-mh-badge-dot" aria-hidden /> : null}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
