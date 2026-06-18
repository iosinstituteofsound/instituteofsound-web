import { useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import { DashboardHeader } from '@/app/components/dashboard-header'
import { DashboardSidebar } from '@/app/components/dashboard-sidebar'
import { useLayoutStore } from '@/app/stores/layout-store'
import { useSidebarStore } from '@/app/stores/sidebar-store'
import { ScrollToTopButton } from '@/shared/components/navigation/scroll-to-top-button'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { MAIN_MAX_WIDTH_CLASS, MAIN_PADDING_CLASS } from '@/shared/lib/layout-config'
import '@/styles/dashboard-sidebar.css'

export function DashboardLayout() {
  const dashboardConfig = useLayoutStore((state) => state.dashboardConfig)
  const { collapsed, mobileOpen, setMobileOpen } = useSidebarStore()
  const mainScrollRef = useRef<HTMLElement>(null)

  const showSidebar = dashboardConfig.sidebar.visible
  const showHeader = dashboardConfig.header.visible

  return (
    <div
      className={cn('dashboard-shell', collapsed && 'dashboard-shell--collapsed')}
      data-sidebar={showSidebar ? 'visible' : 'hidden'}
    >
      {showSidebar && mobileOpen ? (
        <button
          type="button"
          className="dashboard-shell__backdrop md:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {showSidebar ? <DashboardSidebar mobileHidden={!mobileOpen} /> : null}

      <div className="dashboard-shell__main">
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

        <main
          ref={mainScrollRef}
          className="ios-dashboard-main min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        >
          <div
            className={cn(
              MAIN_PADDING_CLASS[dashboardConfig.main.padding],
              MAIN_MAX_WIDTH_CLASS[dashboardConfig.main.maxWidth],
            )}
          >
            <Outlet />
          </div>
        </main>
        <ScrollToTopButton containerRef={mainScrollRef} />
      </div>
    </div>
  )
}
