import { useState } from 'react'
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

function ShellInner() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  useCommandPalette()

  return (
    <>
      <RouteSeo />
      <AcademyProgressSync />
      <CommandPalette />

      <div className="ios-page-bg relative flex h-full min-h-dvh flex-col lg:flex-row">
        <GrainOverlay />

        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        <MobileNav
          drawerOpen={drawerOpen}
          onToggleDrawer={() => setDrawerOpen((o) => !o)}
          onCloseDrawer={() => setDrawerOpen(false)}
          drawer={<Sidebar onNavigate={() => setDrawerOpen(false)} className="h-full w-full" />}
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col pb-[4.5rem] lg:pb-0">
          <div className="hidden lg:block">
            <TopBar />
          </div>
          <main className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}

export function AppShell() {
  return (
    <ShellProvider>
      <ShellInner />
    </ShellProvider>
  )
}
