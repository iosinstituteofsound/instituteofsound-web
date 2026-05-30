import type { ReactNode } from 'react'
import clsx from 'clsx'

interface DashboardSectionProps {
  id: string
  step?: string
  title: string
  hint?: string
  children: ReactNode
  className?: string
}

export function DashboardSection({
  id,
  step,
  title,
  hint,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section id={id} className={clsx('artist-dash-section scroll-mt-40', className)}>
      <header className="artist-dash-section-head">
        {step && <span className="artist-dash-section-step">{step}</span>}
        <h2 className="artist-dash-section-title">{title}</h2>
        {hint && <p className="artist-dash-section-hint">{hint}</p>}
      </header>
      <div className="artist-dash-section-body">{children}</div>
    </section>
  )
}
