import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import './engagement-action-bar.css'

interface EngagementActionBarProps {
  children: ReactNode
  className?: string
}

export function EngagementActionBar({ children, className }: EngagementActionBarProps) {
  return <div className={cn('ios-engagement-action-bar', className)}>{children}</div>
}

interface EngagementActionSlotProps {
  children: ReactNode
  className?: string
  trailing?: boolean
}

export function EngagementActionSlot({ children, className, trailing }: EngagementActionSlotProps) {
  return (
    <div
      className={cn(
        'ios-engagement-action-bar__slot',
        trailing && 'ios-engagement-action-bar__slot--trailing',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface EngagementActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function EngagementActionButton({
  children,
  className,
  ...props
}: EngagementActionButtonProps) {
  return (
    <button type="button" className={cn('ios-engagement-action-bar__btn', className)} {...props}>
      {children}
    </button>
  )
}
