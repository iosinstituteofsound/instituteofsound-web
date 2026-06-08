import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { isLiveApiMode } from '@/lib/api/liveMode'

export function AcademySyncBanner() {
  const { user, loading, mode } = useAuth()

  if (loading || !isLiveApiMode()) return null

  if (user) {
    return (
      <p className="academy-sync-banner academy-sync-banner-on">
        Signed in as <strong>{user.name}</strong> — progress syncs to your account.
      </p>
    )
  }

  return (
    <div className="academy-sync-banner">
      <div>
        <p className="academy-sync-banner-k">Cloud progress</p>
        <p className="academy-sync-banner-t">
          Sign in to save lessons, quizzes, and Ear Lab scores across devices.
          {mode === 'local' && ' (API required for sync.)'}
        </p>
      </div>
      <div className="academy-sync-banner-actions">
        <GoogleSignInButton intent="member" label="Sign in with Google" />
        <Link to="/login" className="ios-btn ios-btn-ghost">
          Login
        </Link>
      </div>
    </div>
  )
}
