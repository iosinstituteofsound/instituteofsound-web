import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useShell } from '@/context/ShellContext'
import { NetworkNotificationsPanel } from '@/components/community/NetworkNotificationsPanel'
import { TopBarAccountMenu } from '@/components/layout/TopBarAccountMenu'
import { useDmUnread } from '@/hooks/useDmUnread'

export function TopBar() {
  const { meta, openCommand } = useShell()
  const { user } = useAuth()
  const dmUnread = useDmUnread()

  return (
    <header className="v2-topbar relative sticky top-0 z-20 flex h-[var(--v2-topbar-h)] shrink-0 items-center gap-3 px-4 lg:gap-5 lg:px-6">
      <p className="v2-topbar-kicker hidden max-w-[9.5rem] shrink-0 truncate font-display font-bold uppercase text-mh-red 2xl:block">
        {meta.kicker}
      </p>

      <button
        type="button"
        onClick={openCommand}
        className="v2-search flex h-10 min-w-0 flex-1 max-w-xl cursor-pointer items-center gap-2.5 px-3.5 text-left lg:max-w-2xl xl:max-w-3xl"
      >
        <SearchIcon />
        <span className="min-w-0 flex-1 truncate text-[13px] text-muted">
          Search people, artists, music, news...
        </span>
        <kbd className="hidden shrink-0 rounded border border-edge/80 bg-void px-1.5 py-0.5 font-sans text-[10px] text-muted sm:inline">
          ⌘K
        </kbd>
      </button>

      <h1 className="v2-topbar-section hidden min-w-0 max-w-[12rem] truncate font-display font-extrabold uppercase text-signal lg:block xl:max-w-[16rem]">
        {meta.sectionTitle}
      </h1>

      <div className="v2-topbar-actions ml-auto flex shrink-0 items-center">
        <Link to="/signals" className="v2-topbar-signals">
          <BoltIcon />
          Signals
        </Link>
        {user && (
          <Link
            to="/messages"
            className="v2-topbar-action relative"
            aria-label="Messages"
          >
            <MessageIcon />
            {dmUnread > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mh-red px-1 text-[9px] font-bold text-white">
                {dmUnread > 9 ? '9+' : dmUnread}
              </span>
            )}
          </Link>
        )}
        <NetworkNotificationsPanel className="v2-topbar-action" />
        <TopBarAccountMenu />
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

function MessageIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.6A7.6 7.6 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}
