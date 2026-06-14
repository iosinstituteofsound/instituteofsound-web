import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { formatAccountNumericId } from '@/lib/auth/accountId'
import { homeDashboardPath, hasArtistAccess } from '@/lib/auth/roles'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { IOSImage } from '@/components/ui/IOSImage'

interface NavUserIdentityProps {
  onNavigate?: () => void
  layout?: 'row' | 'stack'
  onLogout: () => void
}

function displayNavName(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length <= 22) return trimmed
  return `${trimmed.slice(0, 20)}…`
}

export function NavUserIdentity({ onNavigate, layout = 'row', onLogout }: NavUserIdentityProps) {
  const { user, isSuperAdmin } = useAuth()
  if (!user) return null

  const handle = memberHandleFromUser(user)
  const profilePath = `/network/${handle}`
  const dashboardTo = homeDashboardPath(user.authorization)
  const dashboardLabel = isSuperAdmin
    ? 'Super Admin'
    : hasArtistAccess(user.authorization)
      ? 'My Studio'
      : 'My Network'
  const accountId = formatAccountNumericId(user.id)
  const username = user.username?.trim() ? `@${user.username.replace(/^@/, '')}` : `@${handle}`

  const avatarEl = (
    <Link
      to={profilePath}
      onClick={onNavigate}
      className="ios-nav-user-avatar-link"
      title="View public network profile"
    >
      <div className="ios-nav-user-avatar-ring">
        <div className="ios-nav-user-avatar">
          {user.avatarUrl ? (
            <IOSImage src={user.avatarUrl} alt="Profile photo" width={48} className="w-full h-full object-cover" />
          ) : (
            <span className="ios-nav-user-avatar-fallback">{user.name.charAt(0).toUpperCase()}</span>
          )}
          <span className="ios-nav-user-live" aria-hidden />
        </div>
      </div>
    </Link>
  )

  const infoBlock = (
    <div className="ios-nav-user-copy">
      <span className="ios-nav-user-name">{displayNavName(user.name)}</span>
      <span className="ios-nav-user-handle">{username}</span>
      <span className="ios-nav-user-id">ID {accountId}</span>
    </div>
  )

  const rail = (
    <div className="ios-nav-user-rail">
      <Link to="/community#feed" onClick={onNavigate} className="ios-nav-user-desk">
        Network Feed →
      </Link>
      <span className="ios-nav-user-sep" aria-hidden />
      <Link to={dashboardTo} onClick={onNavigate} className="ios-nav-user-desk">
        {dashboardLabel} →
      </Link>
      <span className="ios-nav-user-sep" aria-hidden />
      <button type="button" onClick={onLogout} className="ios-nav-user-logout">
        Logout
      </button>
    </div>
  )

  if (layout === 'stack') {
    return (
      <div className="ios-nav-user-chip ios-nav-user-chip--stack">
        <div className="ios-nav-user-main">
          {infoBlock}
          {avatarEl}
        </div>
        {rail}
      </div>
    )
  }

  return (
    <div className="ios-nav-user-chip">
      <div className="ios-nav-user-main">
        {infoBlock}
        {avatarEl}
      </div>
      {rail}
    </div>
  )
}
