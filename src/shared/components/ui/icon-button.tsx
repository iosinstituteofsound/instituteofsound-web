import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'text-destructive hover:bg-destructive/10',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-9 w-9',
        lg: 'h-10 w-10',
      },
      shape: {
        square: 'rounded-lg',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
      shape: 'square',
    },
  },
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  'aria-label': string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, shape, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(iconButtonVariants({ variant, size, shape, className }))}
      {...props}
    />
  ),
)
IconButton.displayName = 'IconButton'
