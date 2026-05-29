import { Link } from 'react-router-dom'
import { useNavGate } from '@/hooks/useNavGate'
import clsx from 'clsx'
import { useShell } from '@/context/ShellContext'
import { shellModeToMobileTab } from '@/lib/nav/routeModes'
import { MOBILE_TABS } from '@/lib/nav/sidebar'

type Props = {
  drawerOpen: boolean
  onToggleDrawer: () => void
  onCloseDrawer: () => void
  drawer: React.ReactNode
}

export function MobileNav({ drawerOpen, onToggleDrawer, onCloseDrawer, drawer }: Props) {
  const { meta, openCommand } = useShell()
  const { guardNavClick } = useNavGate()
  const activeTabHref = shellModeToMobileTab(meta.shellMode)

  return (
    <>
      <div className="v2-topbar relative sticky top-0 z-30 flex h-12 items-center gap-3 px-3 lg:hidden">
        <button
          type="button"
          onClick={onToggleDrawer}
          className="flex h-9 w-9 items-center justify-center border border-border text-signal"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[10px] font-extrabold tracking-[0.2em] text-signal">
            {meta.sectionTitle}
          </p>
          <p className="text-[9px] uppercase tracking-wider text-mh-red">{meta.kicker}</p>
        </div>
        <button
          type="button"
          onClick={openCommand}
          className="flex h-9 w-9 items-center justify-center text-muted"
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </div>

      {drawerOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={onCloseDrawer}
        />
      )}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-[min(17.25rem,92vw)] shadow-2xl transition-transform duration-300 lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {drawer}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-void/95 backdrop-blur-md lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mh-red/50 to-transparent"
          aria-hidden
        />
        {MOBILE_TABS.map((tab) => {
          const active = tab.href === activeTabHref
          return (
            <Link
              key={tab.href}
              to={tab.href}
              onClick={(e) => guardNavClick(e, tab.href)}
              className={clsx(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 font-display text-[9px] font-bold uppercase tracking-[0.08em]',
                active ? 'text-mh-red' : 'text-muted',
              )}
            >
              <TabIcon name={tab.icon} active={active} />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const c = active ? 'text-mh-red' : 'text-muted'
  if (name === 'home')
    return (
      <svg className={clsx('h-5 w-5', c)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  if (name === 'learn')
    return (
      <svg className={clsx('h-5 w-5', c)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  if (name === 'make')
    return (
      <svg className={clsx('h-5 w-5', c)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    )
  if (name === 'network')
    return (
      <svg className={clsx('h-5 w-5', c)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  return (
    <svg className={clsx('h-5 w-5', c)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}
