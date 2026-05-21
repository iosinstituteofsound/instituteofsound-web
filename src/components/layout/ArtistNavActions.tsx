import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'

interface ArtistNavActionsProps {
  onNavigate?: () => void
  layout?: 'row' | 'stack'
}

/** Public artist sign-up / login — never links to staff /desk */
export function ArtistNavActions({ onNavigate, layout = 'row' }: ArtistNavActionsProps) {
  const { user, logout, isSuperEditor } = useAuth()

  const wrap = (node: React.ReactNode) =>
    layout === 'stack' ? (
      <li className="list-none">{node}</li>
    ) : (
      node
    )

  if (user) {
    const dashboardTo = editorDashboardPath(user.role)
    const label = isSuperEditor ? 'Editorial Desk' : user.role === 'artist' ? 'My Studio' : 'Dashboard'
    return (
      <div
        className={clsx(
          'flex items-center gap-3',
          layout === 'stack' && 'flex-col w-full items-stretch gap-3'
        )}
      >
        {wrap(
          <Link
            to={dashboardTo}
            onClick={onNavigate}
            className={clsx(
              layout === 'stack' && 'ios-btn ios-btn-primary w-full text-center !text-xs'
            )}
          >
            {layout === 'stack' ? (
              label
            ) : (
              <span className="ios-nav-link !text-signal font-bold">{label}</span>
            )}
          </Link>
        )}
        {wrap(
          <button
            type="button"
            onClick={() => {
              logout()
              onNavigate?.()
            }}
            className={clsx(
              'text-xs tracking-widest uppercase text-muted hover:text-mh-red transition-colors',
              layout === 'stack' && 'text-center py-2'
            )}
          >
            Logout
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'flex items-center gap-2 md:gap-3',
        layout === 'stack' && 'flex-col w-full items-stretch gap-3'
      )}
    >
      {wrap(
        <Link
          to="/submissions"
          onClick={onNavigate}
          className={clsx(
            'ios-nav-link hidden xl:inline',
            layout === 'stack' && '!inline text-sm tracking-widest uppercase font-semibold'
          )}
        >
          For Artists
        </Link>
      )}
      {wrap(
        <Link
          to="/login"
          onClick={onNavigate}
          className={clsx(
            layout === 'stack'
              ? 'text-sm tracking-widest uppercase text-center text-muted hover:text-mh-red'
              : 'ios-nav-link'
          )}
        >
          Artist Login
        </Link>
      )}
      {wrap(
        layout === 'stack' ? (
          <Link
            to="/register"
            onClick={onNavigate}
            className="ios-btn ios-btn-primary w-full text-center"
          >
            Join as Artist →
          </Link>
        ) : (
          <Button to="/register" variant="primary" className="!py-2 !px-4 !text-[10px]">
            Join as Artist
          </Button>
        )
      )}
    </div>
  )
}
