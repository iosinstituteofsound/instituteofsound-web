import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type PageProps = {
  children: ReactNode
  className?: string
}

export function Page({ children, className }: PageProps) {
  return <div className={cn('ios-page', className)}>{children}</div>
}

export function PageHeader({ children, className }: PageProps) {
  return <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between', className)}>{children}</div>
}

export function PageHeaderMain({ children, className }: PageProps) {
  return <div className={cn('space-y-1.5', className)}>{children}</div>
}

export function PageTitle({ children, className }: PageProps) {
  return <h1 className={cn('text-3xl font-bold tracking-tight', className)}>{children}</h1>
}

export function PageDescription({ children, className }: PageProps) {
  return <p className={cn('max-w-2xl text-sm leading-relaxed text-muted-foreground', className)}>{children}</p>
}

export function PageSection({ children, className, label }: PageProps & { label?: string }) {
  return (
    <section className={cn('ios-page-section', className)}>
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      {children}
    </section>
  )
}

export function SectionLabel({ children, className }: PageProps) {
  return (
    <p className={cn('ios-section-label', className)}>{children}</p>
  )
}

export function PageGrid({
  children,
  className,
  cols = 'md:grid-cols-2 xl:grid-cols-3',
}: PageProps & { cols?: string }) {
  return <div className={cn('ios-page-grid', cols, className)}>{children}</div>
}
