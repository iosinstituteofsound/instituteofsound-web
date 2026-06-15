import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import { DashboardHeader } from '@/app/components/dashboard-header'
import { DashboardSidebar } from '@/app/components/dashboard-sidebar'
import { useLayoutStore } from '@/app/stores/layout-store'
import { useSidebarStore } from '@/app/stores/sidebar-store'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { MAIN_MAX_WIDTH_CLASS, MAIN_PADDING_CLASS } from '@/shared/lib/layout-config'

export function DashboardLayout() {
  const dashboardConfig = useLayoutStore((state) => state.dashboardConfig)
  const { mobileOpen, setMobileOpen, setCollapsed } = useSidebarStore()

  useEffect(() => {
    setCollapsed(dashboardConfig.sidebar.defaultCollapsed)
  }, [dashboardConfig.sidebar.defaultCollapsed, setCollapsed])

  const showSidebar = dashboardConfig.sidebar.visible
  const showHeader = dashboardConfig.header.visible

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {showSidebar && mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {showSidebar ? (
        <DashboardSidebar
          className={mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        />
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {showHeader ? <DashboardHeader /> : null}

        {showSidebar && !mobileOpen ? (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="fixed left-3 top-3 z-20 h-9 w-9 rounded-full shadow-md md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        ) : null}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div
            className={cn(
              MAIN_PADDING_CLASS[dashboardConfig.main.padding],
              MAIN_MAX_WIDTH_CLASS[dashboardConfig.main.maxWidth],
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
