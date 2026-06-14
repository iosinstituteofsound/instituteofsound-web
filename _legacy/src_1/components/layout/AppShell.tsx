import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AcademyProgressSync } from '@/components/academy/AcademyProgressSync'
import { RouteSeo } from '@/components/seo/RouteSeo'
import { GrainOverlay } from '@/components/effects/GrainOverlay'
import { ShellProvider } from '@/context/ShellContext'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'
import { CommandPalette } from './CommandPalette'
import { LoginGateModal } from '@/components/auth/LoginGateModal'
import { MessengerDock } from '@/components/messenger/MessengerDock'
import { NetworkPresenceHeartbeat } from '@/components/network/NetworkPresenceHeartbeat'
import { MessengerPopupProvider } from '@/context/MessengerPopupContext'

function ShellInner() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  useCommandPalette()

  useEffect(() => {
    document.documentElement.classList.add('v2-app-shell')
    document.body.classList.add('v2-app-shell')
    return () => {
      document.documentElement.classList.remove('v2-app-shell')
      document.body.classList.remove('v2-app-shell')
    }
  }, [])

  return (
    <>
      <RouteSeo />
      <AcademyProgressSync />
      <CommandPalette />
      <LoginGateModal />
      <NetworkPresenceHeartbeat />

      <div className="v2-shell ios-page-bg relative flex h-dvh max-h-dvh overflow-hidden flex-col lg:flex-row">
        <div className="v2-sidebar-slot hidden shrink-0 lg:flex">
          <Sidebar />
        </div>

        <MobileNav
          drawerOpen={drawerOpen}
          onToggleDrawer={() => setDrawerOpen((o) => !o)}
          onCloseDrawer={() => setDrawerOpen(false)}
          drawer={<Sidebar onNavigate={() => setDrawerOpen(false)} className="h-full w-full" />}
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-[4.5rem] lg:pb-0">
          <div className="hidden shrink-0 lg:block">
            <TopBar />
          </div>
          <main className="v2-main relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
            <GrainOverlay />
            <div className="v2-main-inner relative z-[1] min-h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export function AppShell() {
  return (
    <ShellProvider>
      <MessengerPopupProvider>
        <ShellInner />
        <MessengerDock />
      </MessengerPopupProvider>
    </ShellProvider>
  )
}
