import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { homeDashboardPath } from '@/lib/auth/roles'
import { useShell } from '@/context/ShellContext'
import { NetworkNotificationsPanel } from '@/components/community/NetworkNotificationsPanel'

export function TopBar() {
  const { meta, openCommand } = useShell()
  const { user } = useAuth()
  const profileTo = user ? homeDashboardPath(user.role) : '/login'
  const profileLabel =
    user?.name && user.name.length <= 24 ? user.name : user ? 'Your desk' : 'Guest'
  const profileSub = user ? 'Dashboard →' : 'Sign in →'
  const avatarSrc = user?.avatarUrl

  return (
    <header className="v2-topbar relative sticky top-0 z-20 flex h-[var(--v2-topbar-h)] shrink-0 items-center gap-3 px-4 lg:gap-4 lg:px-5">
      <p className="hidden max-w-[8.5rem] shrink-0 truncate font-display text-[10px] font-bold uppercase tracking-[0.16em] text-mh-red 2xl:block">
        {meta.kicker}
      </p>

      <button
        type="button"
        onClick={openCommand}
        className="v2-search flex h-9 min-w-0 flex-1 max-w-xl cursor-pointer items-center gap-2 px-3 text-left lg:max-w-2xl"
      >
        <SearchIcon />
        <span className="min-w-0 flex-1 truncate text-[13px] text-muted">
          Search people, artists, music, news...
        </span>
        <kbd className="hidden shrink-0 rounded border border-edge/80 bg-void px-1.5 py-0.5 font-sans text-[10px] text-muted sm:inline">
          ⌘K
        </kbd>
      </button>

      <h1 className="hidden min-w-0 max-w-[11rem] truncate font-display text-xs font-extrabold uppercase tracking-wide text-signal lg:block xl:max-w-[14rem]">
        {meta.sectionTitle}
      </h1>

      <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
        <Link
          to="/signals"
          className="hidden items-center gap-1.5 rounded px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted transition-colors hover:bg-elevated hover:text-mh-red sm:flex"
        >
          <BoltIcon />
          Signals
        </Link>
        <NetworkNotificationsPanel />
        <Link
          to={profileTo}
          className="ml-0.5 flex max-w-[10.5rem] items-center gap-2 border border-border bg-surface py-1 pl-1 pr-2.5 transition-colors hover:border-mh-red/40 sm:max-w-[12rem] sm:pr-3"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
          }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-border bg-elevated font-display text-[10px] font-bold text-mh-red">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              profileLabel.charAt(0).toUpperCase()
            )}
          </div>
          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate font-display text-[10px] font-bold uppercase tracking-[0.12em] text-signal">
              {profileLabel}
            </p>
            <p className="truncate text-[10px] text-muted">{profileSub}</p>
          </div>
        </Link>
      </div>
    </header>
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

