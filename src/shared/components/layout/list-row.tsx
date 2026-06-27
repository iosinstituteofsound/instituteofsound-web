import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface ListRowProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function ListRow({ children, className, onClick }: ListRowProps) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      className={cn(
        'flex w-full items-center justify-between rounded-lg border p-4 text-left',
        onClick && 'transition-colors hover:bg-accent/50',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </Comp>
  )
}
