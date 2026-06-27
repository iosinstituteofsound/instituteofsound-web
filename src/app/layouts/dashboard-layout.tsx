import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DashboardHeader } from '@/app/components/dashboard-header'
import { DashboardMobileNav } from '@/app/components/dashboard-mobile-nav'
import { DashboardSidebar } from '@/app/components/dashboard-sidebar'
import { useLayoutStore } from '@/app/stores/layout-store'
import { useSidebarStore } from '@/app/stores/sidebar-store'
import { ScrollToTopButton } from '@/shared/components/navigation/scroll-to-top-button'
import { useBodyScrollLock } from '@/shared/hooks/use-body-scroll-lock'
import { useIsMobile } from '@/shared/hooks/use-is-mobile'
import { cn } from '@/shared/lib/cn'
import { MAIN_MAX_WIDTH_CLASS, MAIN_PADDING_CLASS } from '@/shared/lib/layout-config'
import '@/styles/dashboard-sidebar.css'

export function DashboardLayout() {
  const dashboardConfig = useLayoutStore((state) => state.dashboardConfig)
  const { collapsed, mobileOpen, setMobileOpen } = useSidebarStore()
  const isMobile = useIsMobile()
  const location = useLocation()
  const mainScrollRef = useRef<HTMLElement>(null)

  const showSidebar = dashboardConfig.sidebar.visible
  const showHeader = dashboardConfig.header.visible
  const showMobileNav = showSidebar && isMobile
  const isMessengerRoute = location.pathname.startsWith('/messenger')
  const isReelsRoute = location.pathname.startsWith('/reels')
  const isFullBleedRoute = isMessengerRoute || isReelsRoute

  useBodyScrollLock(showSidebar && mobileOpen && isMobile)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, setMobileOpen])

  useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile, setMobileOpen])

  useEffect(() => {
    if (!mobileOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, setMobileOpen])

  return (
    <div
      className={cn(
        'dashboard-shell',
        collapsed && !isMobile && 'dashboard-shell--collapsed',
        isMobile && 'dashboard-shell--mobile',
        isMobile && mobileOpen && 'dashboard-shell--mobile-menu-open',
      )}
      data-sidebar={showSidebar ? 'visible' : 'hidden'}
    >
      {showSidebar && mobileOpen && isMobile ? (
        <button
          type="button"
          className="dashboard-shell__backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {showSidebar ? (
        <DashboardSidebar
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          forceExpanded={isMobile}
        />
      ) : null}

      <div className="dashboard-shell__main">
        {showHeader ? <DashboardHeader onOpenMenu={() => setMobileOpen(true)} /> : null}

        <main
          ref={mainScrollRef}
          className={cn(
            'ios-dashboard-main min-h-0 flex-1 overflow-x-hidden',
            isFullBleedRoute ? 'flex flex-col overflow-hidden' : 'overflow-y-auto',
            isReelsRoute && 'ios-dashboard-main--reels',
          )}
        >
          <div
            className={cn(
              !isFullBleedRoute && MAIN_PADDING_CLASS[dashboardConfig.main.padding],
              !isFullBleedRoute && MAIN_MAX_WIDTH_CLASS[dashboardConfig.main.maxWidth],
              isFullBleedRoute && 'flex min-h-0 flex-1 flex-col',
            )}
          >
            <Outlet />
          </div>
        </main>
        <ScrollToTopButton containerRef={mainScrollRef} />
      </div>

      {showMobileNav ? <DashboardMobileNav /> : null}
    </div>
  )
}
