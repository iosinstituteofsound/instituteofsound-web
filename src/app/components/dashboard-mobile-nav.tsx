import { Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { useSidebarStore } from '@/app/stores/sidebar-store'
import { SidebarNavIcon } from '@/modules/sidebar/components/sidebar-nav-icon'
import { usePermission } from '@/shared/hooks/use-permission'
import { isRegisteredResource } from '@/shared/lib/resource-registry'
import {
  HEADER_NAV_TABS,
  isHeaderNavTabActive,
  type HeaderNavTab,
} from '@/shared/lib/header-nav'
import type { PermissionAction } from '@/shared/services/permission/permission.service'
import { cn } from '@/shared/lib/cn'
import '@/styles/dashboard-mobile-nav.css'

const EXPLORE_TAB = {
  label: 'Explore',
  path: '/explore',
  icon: 'Compass',
  resourceName: 'ExplorePage',
} as const

function canSeeTab(
  tab: HeaderNavTab | typeof EXPLORE_TAB,
  hasResource: (name: string) => boolean,
  can: (resource: string, action: PermissionAction) => boolean,
) {
  if (!isRegisteredResource(tab.resourceName, 'PAGE')) return false
  if (!hasResource(tab.resourceName)) return false
  if ('permission' in tab && tab.permission && !can(tab.permission.resource, tab.permission.action)) {
    return false
  }
  return true
}

export function DashboardMobileNav() {
  const location = useLocation()
  const { mobileOpen, setMobileOpen } = useSidebarStore()
  const { hasResource, can } = usePermission()

  const tabs = useMemo(() => {
    const items: Array<HeaderNavTab | typeof EXPLORE_TAB> = []

    const feedTab = HEADER_NAV_TABS.find((tab) => tab.path === '/home')
    if (feedTab && canSeeTab(feedTab, hasResource, can)) {
      items.push(feedTab)
    }

    if (canSeeTab(EXPLORE_TAB, hasResource, can)) {
      items.push(EXPLORE_TAB)
    }

    const dashboardTab = HEADER_NAV_TABS.find((tab) => tab.path === '/dashboard')
    if (dashboardTab && canSeeTab(dashboardTab, hasResource, can)) {
      items.push(dashboardTab)
    }

    return items
  }, [hasResource, can])

  useEffect(() => {
    document.body.dataset.mobileNav = 'true'
    return () => {
      delete document.body.dataset.mobileNav
    }
  }, [])

  if (tabs.length === 0) return null

  return (
    <nav className="dashboard-mobile-nav" aria-label="Primary navigation">
      {tabs.map((tab) => {
        const active = isHeaderNavTabActive(location.pathname, tab.path)
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn('dashboard-mobile-nav__tab', active && 'dashboard-mobile-nav__tab--active')}
            onClick={() => setMobileOpen(false)}
          >
            <SidebarNavIcon icon={tab.icon} size="md" />
            <span className="dashboard-mobile-nav__label">{tab.label}</span>
          </Link>
        )
      })}

      <button
        type="button"
        className={cn(
          'dashboard-mobile-nav__tab',
          mobileOpen && 'dashboard-mobile-nav__tab--active',
        )}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
      >
        <SidebarNavIcon icon="Menu" size="md" />
        <span className="dashboard-mobile-nav__label">Menu</span>
      </button>
    </nav>
  )
}
