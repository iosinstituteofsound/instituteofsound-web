import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { formatAccountNumericId } from '@/lib/auth/accountId'
import { editorDashboardPath } from '@/lib/auth/roles'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { IOSImage } from '@/components/ui/IOSImage'

interface NavUserIdentityProps {
  onNavigate?: () => void
  layout?: 'row' | 'stack'
  onLogout: () => void
}

export function NavUserIdentity({ onNavigate, layout = 'row', onLogout }: NavUserIdentityProps) {
  const { user, isSuperEditor } = useAuth()
  if (!user) return null

  const handle = memberHandleFromUser(user)
  const profilePath = `/network/${handle}`
  const dashboardTo = editorDashboardPath(user.role)
  const dashboardLabel = isSuperEditor
    ? 'Editorial Desk'
    : user.role === 'artist'
      ? 'My Studio'
      : 'Dashboard'
  const accountId = formatAccountNumericId(user.id)
  const username = user.username?.trim() ? `@${user.username.replace(/^@/, '')}` : `@${handle}`

  const avatar = (
    <div className="ios-nav-user-avatar" aria-hidden>
      {user.avatarUrl ? (
        <IOSImage src={user.avatarUrl} alt="" width={40} className="w-full h-full object-cover" />
      ) : (
        <span className="ios-nav-user-avatar-fallback">{user.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )

  return (
    <div
      className={clsx(
        'ios-nav-user-identity',
        layout === 'stack' && 'ios-nav-user-identity--stack'
      )}
    >
      <div className="ios-nav-user-meta">
        <Link
          to={profilePath}
          onClick={onNavigate}
          className="ios-nav-user-meta-link"
          title="Your network profile"
        >
          <span className="ios-nav-user-name">{user.name}</span>
          <span className="ios-nav-user-handle">{username}</span>
          <span className="ios-nav-user-id">ID {accountId}</span>
        </Link>
        <div className="ios-nav-user-actions">
          <Link
            to={dashboardTo}
            onClick={onNavigate}
            className="ios-nav-user-desk"
          >
            {dashboardLabel}
          </Link>
          <button type="button" onClick={onLogout} className="ios-nav-user-logout">
            Logout
          </button>
        </div>
      </div>
      <Link
        to={profilePath}
        onClick={onNavigate}
        className="ios-nav-user-avatar-link"
        title="Your network profile"
      >
        {avatar}
      </Link>
    </div>
  )
}
