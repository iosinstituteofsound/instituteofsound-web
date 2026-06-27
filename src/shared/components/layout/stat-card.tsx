import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface StatCardProps {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  className?: string
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card/40 p-4',
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

interface DashboardPanelProps {
  children: ReactNode
  className?: string
  title?: ReactNode
}

export function DashboardPanel({ children, className, title }: DashboardPanelProps) {
  return (
    <section className={cn('ios-artist-dashboard__panel rounded-xl border border-border/60 bg-card/40 p-5', className)}>
      {title ? <h3 className="mb-4 text-sm font-semibold">{title}</h3> : null}
      {children}
    </section>
  )
}
