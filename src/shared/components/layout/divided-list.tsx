import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface DividedListProps {
  children: ReactNode
  className?: string
}

export function DividedList({ children, className }: DividedListProps) {
  return (
    <div className={cn('divide-y rounded-lg border px-4', className)}>
      {children}
    </div>
  )
}
