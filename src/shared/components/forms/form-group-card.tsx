import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface FormGroupCardProps {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}

export function FormGroupCard({ title, description, children, className }: FormGroupCardProps) {
  return (
    <div className={cn('space-y-3 rounded-xl border border-border/60 bg-card/40 p-4', className)}>
      {title || description ? (
        <div className="space-y-1">
          {title ? <h3 className="text-sm font-semibold">{title}</h3> : null}
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}
