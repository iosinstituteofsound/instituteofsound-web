import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { homeDashboardPath } from '@/lib/auth/roles'
import { useShell } from '@/context/ShellContext'
import { NetworkNotificationsPanel } from '@/components/community/NetworkNotificationsPanel'

export function TopBar() {
  const { meta, openCommand } = useShell()
  const { user } = useAuth()
  const profileTo = user ? homeDashboardPath(user.role) : '/login'
  const profileLabel = user?.name ?? 'Guest'
  const profileSub = user ? 'Dashboard →' : 'Sign in →'

  return (
    <header className="v2-topbar relative sticky top-0 z-20 flex h-[3.25rem] shrink-0 items-center gap-4 px-4 lg:px-6">
      <p className="hidden w-36 shrink-0 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-mh-red xl:block">
        {meta.kicker}
      </p>

      <button
        type="button"
        onClick={openCommand}
        className="v2-search flex h-10 min-w-0 flex-1 max-w-2xl cursor-pointer items-center gap-2 px-3 text-left"
      >
        <SearchIcon />
        <span className="min-w-0 flex-1 truncate text-[13px] text-muted">
          Search artists, tracks, news...
        </span>
        <kbd className="hidden shrink-0 rounded border border-edge/80 bg-void px-1.5 py-0.5 font-sans text-[10px] text-muted sm:inline">
          ⌘K
        </kbd>
      </button>

      <h1 className="hidden min-w-0 max-w-[200px] truncate font-display text-sm font-extrabold uppercase tracking-wide text-signal lg:block xl:max-w-xs">
        {meta.sectionTitle}
      </h1>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Link
          to="/signals"
          className="hidden items-center gap-1.5 rounded px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted transition-colors hover:bg-elevated hover:text-mh-red sm:flex"
        >
          <BoltIcon />
          Signals
        </Link>
        <NetworkNotificationsPanel />
        <IconButton badge={2} label="Messages">
          <MailIcon />
        </IconButton>
        <Link
          to={profileTo}
          className="ml-1 flex items-center gap-2.5 border border-border bg-surface py-1 pl-1 pr-3 transition-colors hover:border-mh-red/40"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
          }}
        >
          <div className="h-8 w-8 overflow-hidden border border-border">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="hidden text-left sm:block">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-signal">
              {profileLabel}
            </p>
            <p className="text-[10px] text-muted">{profileSub}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}

function IconButton({
  children,
  badge,
  label,
}: {
  children: React.ReactNode
  badge?: number
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-signal"
    >
      {children}
      {badge != null && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-mh-red px-1 font-display text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function BoltIcon() {
  return <svg className="h-3.5 w-3.5 text-mh-red" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" /></svg>
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}
