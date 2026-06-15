import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { DashboardSidebar } from '@/app/components/dashboard-sidebar'
import { UserHeaderIdentity } from '@/app/components/user-header-identity'
import { UserProfileMenu } from '@/app/components/user-profile-menu'
import { useLayoutStore } from '@/app/stores/layout-store'
import { useSidebarStore } from '@/app/stores/sidebar-store'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { MAIN_MAX_WIDTH_CLASS, MAIN_PADDING_CLASS } from '@/shared/lib/layout-config'

export function DashboardLayout() {
  const dashboardConfig = useLayoutStore((state) => state.dashboardConfig)
  const { toggleCollapsed, mobileOpen, setMobileOpen, setCollapsed } = useSidebarStore()
  useEffect(() => {
    setCollapsed(dashboardConfig.sidebar.defaultCollapsed)
  }, [dashboardConfig.sidebar.defaultCollapsed, setCollapsed])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {dashboardConfig.sidebar.visible ? (
        <DashboardSidebar
          className={mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {dashboardConfig.header.visible ? (
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              {dashboardConfig.header.showMenuToggle ? (
                <>
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                    <Menu className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={toggleCollapsed}>
                    <Menu className="h-4 w-4" />
                  </Button>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {dashboardConfig.header.showIdentity ? <UserHeaderIdentity /> : null}
              {dashboardConfig.header.showProfileMenu ? <UserProfileMenu /> : null}
            </div>
          </header>
        ) : null}
        <main
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overflow-x-hidden',
            MAIN_PADDING_CLASS[dashboardConfig.main.padding],
            MAIN_MAX_WIDTH_CLASS[dashboardConfig.main.maxWidth],
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
