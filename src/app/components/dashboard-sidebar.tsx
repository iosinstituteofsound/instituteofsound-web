import { Link, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useMemo } from 'react'
import { useLayoutStore } from '@/app/stores/layout-store'
import { useSidebarStore } from '@/app/stores/sidebar-store'
import { useSidebar } from '@/modules/sidebar/hooks/use-sidebar'
import { SidebarNavIcon } from '@/modules/sidebar/components/sidebar-nav-icon'
import { PageLoader } from '@/shared/components/feedback/loader'
import { Button } from '@/shared/components/ui/button'
import { env } from '@/shared/config/env'
import { cn } from '@/shared/lib/cn'
import { SIDEBAR_WIDTH_CLASS } from '@/shared/lib/layout-config'
import { HEADER_NAV_PATHS } from '@/shared/lib/header-nav'
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
  const { collapsed, toggleCollapsed, setMobileOpen } = useSidebarStore()
  const { data: sidebarItems, isLoading: sidebarLoading } = useSidebar()
  const widthClass = SIDEBAR_WIDTH_CLASS[dashboardConfig.sidebar.width]
  const brandTitle = dashboardConfig.header.brandTitle?.trim() || env.appName

  const visibleItems = useMemo(
    () =>
      (sidebarItems ?? []).filter(
        (item) =>
          !HEADER_NAV_PATHS.has(item.path) &&
          (!item.resourceName ||
            isRegisteredResource(item.resourceName, item.resourceType ?? 'PAGE')),
      ),
    [sidebarItems],
  )

  const groups = useMemo(() => groupSidebarItems(visibleItems), [visibleItems])

  const handleToggle = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setMobileOpen(false)
      return
    }
    toggleCollapsed()
  }

  return (
    <aside
      className={cn(
        'dashboard-sidebar fixed inset-y-0 left-0 z-40 flex h-full max-h-dvh flex-col overflow-hidden border-r border-border/50 transition-all md:static md:z-auto md:shrink-0',
        collapsed ? widthClass.collapsed : 'w-[15.5rem]',
        className,
      )}
    >
      <div className="dashboard-sidebar-top shrink-0">
        {!collapsed ? (
          <Link to="/home" className="dashboard-sidebar-brand block" onClick={() => setMobileOpen(false)}>
            <span className="dashboard-sidebar-brand-ios">IOS</span>
            <span className="dashboard-sidebar-brand-subtitle">{brandTitle.toUpperCase()}</span>
          </Link>
        ) : (
          <Link
            to="/home"
            className="dashboard-sidebar-brand-collapsed font-display mx-auto mt-3 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-extrabold text-primary"
            title={brandTitle}
            onClick={() => setMobileOpen(false)}
          >
            IO
          </Link>
        )}

        {dashboardConfig.header.showMenuToggle ? (
          <div className={cn('flex px-2 pb-2', collapsed ? 'justify-center' : 'justify-end')}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="dashboard-sidebar-toggle h-8 w-8"
              onClick={handleToggle}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        ) : null}
      </div>

      <nav
        className="dashboard-sidebar-nav min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-5"
        aria-label="Dashboard navigation"
      >
        {sidebarLoading ? (
          <PageLoader />
        ) : (
          groups.map((group) => (
            <div key={group.title ?? 'default'} className="dashboard-sidebar-group">
              {!collapsed && group.title ? (
                <p className="dashboard-sidebar-group-title">{group.title}</p>
              ) : null}

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
                          'dashboard-sidebar-link flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium leading-tight',
                          collapsed && 'justify-center px-2',
                          active ? 'dashboard-sidebar-link-active' : 'text-foreground/75',
                        )}
                      >
                        <SidebarNavIcon
                          icon={item.icon}
                          size="nav"
                          className={cn('shrink-0', active ? 'text-primary' : 'text-foreground/60')}
                        />
                        {!collapsed ? (
                          <span className={cn('truncate', active && 'text-foreground')}>{item.label}</span>
                        ) : null}
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
