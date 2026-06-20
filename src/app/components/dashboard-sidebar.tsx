import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { useLayoutStore } from '@/app/stores/layout-store'
import { useSidebarStore } from '@/app/stores/sidebar-store'
import { useSidebar } from '@/modules/sidebar/hooks/use-sidebar'
import { SidebarNavIcon } from '@/modules/sidebar/components/sidebar-nav-icon'
import { PageLoader } from '@/shared/components/feedback/loader'
import { env } from '@/shared/config/env'
import { cn } from '@/shared/lib/cn'
import { HEADER_NAV_PATHS } from '@/shared/lib/header-nav'
import { isRegisteredResource } from '@/shared/lib/resource-registry'
import { useIsMobile } from '@/shared/hooks/use-is-mobile'
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
  isMobile?: boolean
  mobileOpen?: boolean
  forceExpanded?: boolean
}

export function DashboardSidebar({
  isMobile: isMobileProp,
  mobileOpen = false,
  forceExpanded = false,
}: DashboardSidebarProps) {
  const isMobileHook = useIsMobile()
  const isMobile = isMobileProp ?? isMobileHook
  const location = useLocation()
  const dashboardConfig = useLayoutStore((state) => state.dashboardConfig)
  const { collapsed: storeCollapsed, toggleCollapsed, setMobileOpen } = useSidebarStore()
  const collapsed = forceExpanded ? false : storeCollapsed
  const { data: sidebarItems, isLoading: sidebarLoading } = useSidebar()
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
  const sidebarWidth = collapsed ? '4.5rem' : '15.5rem'
  const desktopLayoutStyle = isMobile
    ? undefined
    : {
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        flex: `0 0 ${sidebarWidth}`,
      }

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
        'dashboard-sidebar flex h-full max-h-dvh shrink-0 flex-col overflow-hidden border-r border-border/50',
        collapsed && !isMobile && 'dashboard-sidebar--collapsed',
        isMobile && 'dashboard-sidebar--mobile',
        isMobile && mobileOpen && 'dashboard-sidebar--mobile-open',
        isMobile && !mobileOpen && 'dashboard-sidebar--mobile-closed',
      )}
      style={desktopLayoutStyle}
      aria-hidden={isMobile && !mobileOpen ? true : undefined}
      inert={isMobile && !mobileOpen ? true : undefined}
    >
      <div className={cn('dashboard-sidebar-top shrink-0', collapsed && 'dashboard-sidebar-top--collapsed')}>
        {!collapsed ? (
          <div className="dashboard-sidebar-brand-row">
            <Link
              to="/home"
              className="dashboard-sidebar-brand"
              onClick={() => setMobileOpen(false)}
            >
              <span className="dashboard-sidebar-brand-ios">IOS</span>
              <span className="dashboard-sidebar-brand-subtitle">{brandTitle.toUpperCase()}</span>
            </Link>

            {dashboardConfig.header.showMenuToggle ? (
              <button
                type="button"
                className="dashboard-sidebar-toggle"
                onClick={handleToggle}
                aria-label="Close sidebar"
              >
                <ChevronLeft className="dashboard-sidebar-toggle__icon" strokeWidth={2.25} aria-hidden />
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <Link
              to="/home"
              className="dashboard-sidebar-brand-collapsed"
              title={brandTitle}
              onClick={() => setMobileOpen(false)}
            >
              <span className="dashboard-sidebar-brand-collapsed__mark">IO</span>
            </Link>

            {dashboardConfig.header.showMenuToggle ? (
              <button
                type="button"
                className="dashboard-sidebar-toggle dashboard-sidebar-toggle--collapsed"
                onClick={handleToggle}
                aria-label="Expand sidebar"
              >
                <ChevronRight className="dashboard-sidebar-toggle__icon" strokeWidth={2.25} aria-hidden />
              </button>
            ) : null}
          </>
        )}
      </div>

      <nav
        className={cn(
          'dashboard-sidebar-nav min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-5',
          collapsed ? 'px-2 pt-2' : 'px-3 pt-0',
        )}
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

              <ul className={cn('flex flex-col', collapsed ? 'gap-1.5' : 'gap-0.5')}>
                {group.items.map((item) => {
                  const active = isSidebarItemActive(location.pathname, item.path)

                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          'dashboard-sidebar-link flex items-center gap-3 rounded-xl text-sm font-medium leading-tight',
                          collapsed
                            ? 'dashboard-sidebar-link--rail mx-auto h-10 w-10 justify-center p-0'
                            : 'px-3 py-2',
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
