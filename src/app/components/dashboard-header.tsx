import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, PanelLeft, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NotificationBell } from '@/modules/notifications/components/notification-bell'
import { MessengerHeaderButton } from '@/modules/messenger/components/messenger-header-button'
import { UserProfileMenu } from '@/app/components/user-profile-menu'
import { useLayoutStore } from '@/app/stores/layout-store'
import { GlobalSearchModal } from '@/modules/search/components/global-search-modal'
import { SidebarNavIcon } from '@/modules/sidebar/components/sidebar-nav-icon'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { usePermission } from '@/shared/hooks/use-permission'
import { isRegisteredResource } from '@/shared/lib/resource-registry'
import {
  HEADER_NAV_TABS,
  isHeaderNavTabActive,
  type HeaderNavTab,
} from '@/shared/lib/header-nav'
import { resolveMobilePageTitle } from '@/shared/lib/mobile-page-title'
import type { PermissionAction } from '@/shared/services/permission/permission.service'
import { cn } from '@/shared/lib/cn'
import '@/styles/dashboard-header.css'

const HEADER_SEARCH_PLACEHOLDER_DESKTOP = 'Search artists, tribes, curators, editors and more'

function canSeeHeaderTab(
  tab: HeaderNavTab,
  hasResource: (name: string) => boolean,
  can: (resource: string, action: PermissionAction) => boolean,
) {
  if (!isRegisteredResource(tab.resourceName, 'PAGE')) return false
  if (!hasResource(tab.resourceName)) return false
  if (tab.permission && !can(tab.permission.resource, tab.permission.action)) return false
  return true
}

interface DashboardHeaderProps {
  onOpenMenu?: () => void
}

export function DashboardHeader({ onOpenMenu }: DashboardHeaderProps) {
  const location = useLocation()
  const dashboardConfig = useLayoutStore((state) => state.dashboardConfig)
  const { hasResource, can } = usePermission()
  const [searchOpen, setSearchOpen] = useState(false)
  const pageTitle = resolveMobilePageTitle(location.pathname)

  const visibleTabs = useMemo(
    () => HEADER_NAV_TABS.filter((tab) => canSeeHeaderTab(tab, hasResource, can)),
    [hasResource, can],
  )

  return (
    <header className="dashboard-header relative z-20 w-full shrink-0">
      <div className="dashboard-header-inner">
        <div className="dashboard-header-mobile">
          {onOpenMenu ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="dashboard-header-mobile__menu h-9 w-9 shrink-0"
              onClick={onOpenMenu}
              aria-label="Open navigation menu"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          ) : null}

          <p className="dashboard-header-mobile__title">{pageTitle}</p>

          <div className="dashboard-header-mobile__actions">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <MessengerHeaderButton />
            <NotificationBell />

            {dashboardConfig.header.showProfileMenu ? <UserProfileMenu /> : null}
          </div>
        </div>

        <div className="dashboard-header-left">
          <div
            className="dashboard-header-search-wrap cursor-pointer"
            onClick={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setSearchOpen(true)
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Open search"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-3.5" />
            <Input
              type="search"
              readOnly
              placeholder={HEADER_SEARCH_PLACEHOLDER_DESKTOP}
              className="dashboard-header-search pointer-events-none h-9 w-full cursor-pointer pl-9 text-sm sm:h-10 sm:pl-10 sm:text-[0.9375rem]"
              aria-label={HEADER_SEARCH_PLACEHOLDER_DESKTOP}
            />
          </div>
        </div>

        {visibleTabs.length > 0 ? (
          <nav className="dashboard-header-tabs" aria-label="Primary navigation">
            {visibleTabs.map((tab) => {
              const active = isHeaderNavTabActive(location.pathname, tab.path)
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  title={tab.label}
                  className={cn('dashboard-header-tab', active && 'dashboard-header-tab-active')}
                >
                  <SidebarNavIcon icon={tab.icon} size="nav" />
                  <span className="sr-only">{tab.label}</span>
                </Link>
              )
            })}
          </nav>
        ) : (
          <div aria-hidden />
        )}

        <div className="dashboard-header-right">
          <button type="button" className="dashboard-header-utility hidden sm:inline-flex" aria-label="Apps">
            <LayoutGrid className="h-5 w-5" />
          </button>
          <MessengerHeaderButton />
          <NotificationBell />

          {dashboardConfig.header.showProfileMenu ? <UserProfileMenu /> : null}
        </div>
      </div>
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
