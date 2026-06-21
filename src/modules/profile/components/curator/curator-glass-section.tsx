import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Info } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type CuratorGlassSectionProps = {
  title: string
  id: string
  viewAllHref?: string
  viewAllLabel?: string
  info?: string
  className?: string
  children: ReactNode
}

export function CuratorGlassSection({
  title,
  id,
  viewAllHref,
  viewAllLabel = 'View all',
  info,
  className,
  children,
}: CuratorGlassSectionProps) {
  return (
    <section className={cn('curator-glass', className)} aria-labelledby={id}>
      <header className="curator-glass__head">
        <div className="curator-glass__title-wrap">
          <h2 id={id} className="curator-glass__title">
            {title}
          </h2>
          {info ? (
            <span className="curator-glass__info" title={info}>
              <Info size={14} strokeWidth={2} aria-hidden />
            </span>
          ) : null}
        </div>
        {viewAllHref ? (
          <Link to={viewAllHref} className="curator-glass__action">
            {viewAllLabel}
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  )
}
