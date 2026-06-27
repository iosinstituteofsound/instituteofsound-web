import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface SurfaceSectionProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md'
}

const paddingMap = {
  sm: 'p-3',
  md: 'p-4',
}

export function SurfaceSection({ children, className, padding = 'md' }: SurfaceSectionProps) {
  return (
    <section
      className={cn(
        'space-y-4 rounded-xl border border-border bg-card/60',
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </section>
  )
}
