import { Link, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useLayoutStore } from '@/app/stores/layout-store'
import { useSidebarStore } from '@/app/stores/sidebar-store'
import { useSidebar } from '@/modules/sidebar/hooks/use-sidebar'
import { PageLoader } from '@/shared/components/feedback/loader'
import { cn } from '@/shared/lib/cn'
import { env } from '@/shared/config/env'
import { SIDEBAR_WIDTH_CLASS } from '@/shared/lib/layout-config'
import { isRegisteredResource } from '@/shared/lib/resource-registry'
import type { SidebarMenuItemDto } from '@/shared/types/sidebar.types'
import '@/styles/dashboard-sidebar.css'

function groupSidebarItems(items: SidebarMenuItemDto[]) {
  const groups: { title?: string; items: SidebarMenuItemDto[] }[] = []
  const indexByTitle = new Map<string, number>()

  for (const item of items) {
    const title = item.groupTitle?.trim() || ''
    const existingIndex = indexByTitle.get(title)

    if (existingIndex === undefined) {
      indexByTitle.set(title, groups.length)
      groups.push({ title: title || undefined, items: [item] })
    } else {
      groups[existingIndex]?.items.push(item)
    }
  }

  return groups
}

function isSidebarItemActive(pathname: string, itemPath: string) {
  if (pathname === itemPath) return true
  if (itemPath !== '/' && pathname.startsWith(`${itemPath}/`)) return true
  return false
}

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const location = useLocation()
  const dashboardConfig = useLayoutStore((state) => state.dashboardConfig)
  const { collapsed, setMobileOpen } = useSidebarStore()
  const { data: sidebarItems, isLoading: sidebarLoading } = useSidebar()
  const widthClass = SIDEBAR_WIDTH_CLASS[dashboardConfig.sidebar.width]
  const brandTitle = dashboardConfig.header.brandTitle?.trim() || env.appName

  const visibleItems = useMemo(
    () =>
      (sidebarItems ?? []).filter(
        (item) =>
          !item.resourceName ||
          isRegisteredResource(item.resourceName, item.resourceType ?? 'PAGE'),
      ),
    [sidebarItems],
  )

  const groups = useMemo(() => groupSidebarItems(visibleItems), [visibleItems])

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-full max-h-dvh flex-col overflow-hidden border-r border-border/80 bg-background transition-all md:static md:z-auto',
        collapsed ? widthClass.collapsed : widthClass.expanded,
        className,
      )}
    >
      <div className="flex h-14 shrink-0 items-center border-b border-border/80 px-4 font-semibold tracking-tight text-foreground">
        {!collapsed && brandTitle}
      </div>

      <nav
        className="dashboard-sidebar-nav min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 pb-5"
        aria-label="Dashboard navigation"
      >
        {sidebarLoading ? (
          <PageLoader />
        ) : (
          groups.map((group) => (
            <div key={group.title ?? 'default'} className="dashboard-sidebar-group">
              {!collapsed && group.title && (
                <p className="mb-2.5 px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-primary">
                  {group.title}
                </p>
              )}

              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isSidebarItemActive(location.pathname, item.path)

                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          'dashboard-sidebar-link flex items-center px-3 py-2.5 text-[0.9375rem] font-medium leading-snug tracking-tight',
                          collapsed && 'justify-center px-2',
                          active
                            ? 'dashboard-sidebar-link-active'
                            : 'text-foreground/80',
                        )}
                      >
                        {!collapsed ? item.label : item.label.charAt(0)}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </nav>
    </aside>
  )
}
