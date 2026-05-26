import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isEditorStaff } from '@/lib/auth/roles'
import { NavUserIdentity } from '@/components/layout/NavUserIdentity'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'

interface ArtistNavActionsProps {
  onNavigate?: () => void
  layout?: 'row' | 'stack'
}

/** Public artist sign-up / login — never links to staff /desk */
export function ArtistNavActions({ onNavigate, layout = 'row' }: ArtistNavActionsProps) {
  const { user, logout } = useAuth()

  const wrap = (node: React.ReactNode) =>
    layout === 'stack' ? (
      <li className="list-none">{node}</li>
    ) : (
      node
    )

  if (user) {
    const showEditorApply = user.role === 'artist' && !isEditorStaff(user.role)
    const handleLogout = () => {
      void logout()
      onNavigate?.()
    }

    return (
      <div
        className={clsx(
          'flex items-center gap-3',
          layout === 'stack' && 'flex-col w-full items-stretch gap-4'
        )}
      >
        {showEditorApply &&
          wrap(
            <Link
              to="/editor/apply"
              onClick={onNavigate}
              className={clsx(
                'ios-nav-cta-link ios-nav-cta-link-editor',
                layout === 'stack' && 'text-sm tracking-widest uppercase font-semibold text-center py-2'
              )}
            >
              Join as Editor
            </Link>
          )}
        {wrap(
          <NavUserIdentity layout={layout} onNavigate={onNavigate} onLogout={handleLogout} />
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
            'ios-nav-cta-link hidden xl:inline',
            layout === 'stack' && '!inline text-sm tracking-widest uppercase font-semibold py-2'
          )}
        >
          For Artists
        </Link>
      )}
      {wrap(
        <Link
          to="/editor/join"
          onClick={onNavigate}
          className={clsx(
            'ios-nav-cta-link ios-nav-cta-link-editor hidden xl:inline',
            layout === 'stack' && '!inline text-sm tracking-widest uppercase font-semibold py-2'
          )}
        >
          Join as Editor
        </Link>
      )}
      {wrap(
        layout === 'stack' ? (
          <Link
            to="/login"
            onClick={onNavigate}
            className="ios-btn ios-btn-primary w-full text-center"
          >
            Sign in with Google →
          </Link>
        ) : (
          <Button to="/login" variant="primary" className="!py-2 !px-4 !text-[10px]">
            Google Sign In
          </Button>
        )
      )}
    </div>
  )
}
