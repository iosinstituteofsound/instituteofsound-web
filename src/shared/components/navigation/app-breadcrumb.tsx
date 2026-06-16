import type { LucideIcon } from 'lucide-react'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import '@/styles/app-breadcrumb.css'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: LucideIcon
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  /** Editorial page header — trail + large title (Explore-style) */
  surface?: boolean
  /** Optional supporting line under the trail */
  description?: string
  /** Collapse middle crumbs on small screens when there are 4+ items */
  collapseMiddle?: boolean
  /** Slot for page-level actions aligned to the right on larger screens */
  actions?: ReactNode
}

function BreadcrumbSeparator() {
  return (
    <span className="app-breadcrumb__sep" aria-hidden>
      <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
    </span>
  )
}

function BreadcrumbLink({ item }: { item: BreadcrumbItem }) {
  const Icon = item.icon

  if (!item.href) {
    return (
      <span className="app-breadcrumb__ancestor">
        {Icon ? <Icon className="app-breadcrumb__icon" aria-hidden /> : null}
        <span className="truncate">{item.label}</span>
      </span>
    )
  }

  return (
    <Link to={item.href} className="app-breadcrumb__link">
      {Icon ? <Icon className="app-breadcrumb__icon" aria-hidden /> : null}
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

function BreadcrumbCrumb({
  item,
  isCurrent,
}: {
  item: BreadcrumbItem
  isCurrent: boolean
}) {
  const Icon = item.icon

  if (isCurrent || !item.href) {
    return (
      <span className="app-breadcrumb__current" aria-current="page">
        {Icon ? <Icon className="app-breadcrumb__icon" aria-hidden /> : null}
        <span className="truncate">{item.label}</span>
      </span>
    )
  }

  return (
    <Link to={item.href} className="app-breadcrumb__link">
      {Icon ? <Icon className="app-breadcrumb__icon" aria-hidden /> : null}
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)')
    const sync = () => setIsMobile(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return isMobile
}

function getVisibleItems(
  items: BreadcrumbItem[],
  collapseMiddle: boolean,
  isMobile: boolean,
) {
  if (!collapseMiddle || !isMobile || items.length < 4) {
    return items.map((item, index) => ({ kind: 'item' as const, item, index }))
  }

  return [
    { kind: 'item' as const, item: items[0]!, index: 0 },
    { kind: 'ellipsis' as const },
    { kind: 'item' as const, item: items[items.length - 1]!, index: items.length - 1 },
  ]
}

function SurfaceBreadcrumb({
  items,
  description,
  actions,
  className,
}: BreadcrumbProps) {
  const current = items[items.length - 1]
  const ancestors = items.slice(0, -1)
  const CurrentIcon = current?.icon

  if (!current) return null

  return (
    <header className={cn('app-breadcrumb app-breadcrumb--surface', className)}>
      <div className="app-breadcrumb__surface-row">
        <div className="app-breadcrumb__surface-main">
          <nav aria-label="Breadcrumb" className="app-breadcrumb__path">
            <span className="app-breadcrumb__kicker">Path</span>
            {ancestors.length > 0 ? (
              <ol className="app-breadcrumb__list app-breadcrumb__list--path">
                {ancestors.map((item, index) => (
                  <li key={`${item.label}-${index}`} className="app-breadcrumb__item">
                    {index > 0 ? <BreadcrumbSeparator /> : null}
                    <BreadcrumbLink item={item} />
                  </li>
                ))}
              </ol>
            ) : null}
          </nav>

          <div className="app-breadcrumb__hero">
            {CurrentIcon ? (
              <span className="app-breadcrumb__hero-icon" aria-hidden>
                <CurrentIcon strokeWidth={2} />
              </span>
            ) : null}
            <h1 className="app-breadcrumb__title">{current.label}</h1>
          </div>

          {description ? <p className="app-breadcrumb__desc">{description}</p> : null}
        </div>

        {actions ? <div className="app-breadcrumb__actions">{actions}</div> : null}
      </div>
    </header>
  )
}

export function AppBreadcrumb({
  items,
  className,
  surface = false,
  description,
  collapseMiddle = true,
  actions,
}: BreadcrumbProps) {
  const isMobile = useIsMobileViewport()
  const visibleItems = getVisibleItems(items, collapseMiddle, isMobile)

  if (items.length === 0) return null

  if (surface) {
    return (
      <SurfaceBreadcrumb
        items={items}
        description={description}
        actions={actions}
        className={className}
      />
    )
  }

  return (
    <header className={cn('app-breadcrumb', className)}>
      <div className="app-breadcrumb__row">
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="app-breadcrumb__list">
            {visibleItems.map((entry, visibleIndex) => {
              if (entry.kind === 'ellipsis') {
                return (
                  <li key="ellipsis" className="app-breadcrumb__item">
                    <BreadcrumbSeparator />
                    <span className="app-breadcrumb__ellipsis" aria-hidden>
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </span>
                  </li>
                )
              }

              const isCurrent = entry.index === items.length - 1

              return (
                <li key={`${entry.item.label}-${entry.index}`} className="app-breadcrumb__item">
                  {visibleIndex > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbCrumb item={entry.item} isCurrent={isCurrent} />
                </li>
              )
            })}
          </ol>
        </nav>

        {actions ? <div className="app-breadcrumb__actions">{actions}</div> : null}
      </div>

      {description ? <p className="app-breadcrumb__desc">{description}</p> : null}
    </header>
  )
}

/** @deprecated Use AppBreadcrumb — kept for existing imports */
export function Breadcrumb(props: BreadcrumbProps) {
  return <AppBreadcrumb {...props} />
}

export function buildBreadcrumbItems(
  ...entries: Array<BreadcrumbItem | string>
): BreadcrumbItem[] {
  return entries.map((entry) =>
    typeof entry === 'string' ? { label: entry } : entry,
  )
}
