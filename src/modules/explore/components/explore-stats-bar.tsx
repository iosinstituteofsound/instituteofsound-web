import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export type ExploreStatsBarItem = {
  icon: ReactNode
  value: string | number
  label: string
  accent?: boolean
}

type ExploreStatsBarProps = {
  items: ExploreStatsBarItem[]
  className?: string
  'aria-label'?: string
}

export function ExploreStatsBar({ items, className, 'aria-label': ariaLabel }: ExploreStatsBarProps) {
  return (
    <footer className={cn('explore-stats-bar', className)} aria-label={ariaLabel}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'explore-stats-bar__item',
            item.accent && 'explore-stats-bar__item--accent',
          )}
        >
          {item.icon}
          <div>
            <p className="explore-stats-bar__val">{item.value}</p>
            <p className="explore-stats-bar__label">{item.label}</p>
          </div>
        </div>
      ))}
    </footer>
  )
}
