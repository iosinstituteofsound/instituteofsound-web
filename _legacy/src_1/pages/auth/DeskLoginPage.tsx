import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { homeDashboardPath, isSuperAdmin } from '@/lib/auth/roles'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { IosBrandLockup } from '@/components/layout/IosBrandLockup'

/** Super Admin — Google only. Bookmark /desk */
export default function DeskLoginPage() {
  const { user, mode } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/editor/dashboard'

  if (user) {
    if (isSuperAdmin(user.authorization)) {
      return <Navigate to={from} replace />
    }
    return <Navigate to={homeDashboardPath(user.authorization)} replace />
  }

  return (
    <div className="auth-full-page section-padding">
      <div className="max-w-md mx-auto ios-panel ios-panel-accent">
        <IosBrandLockup to="/" size="sm" className="mb-6" />
        <p className="ios-kicker">Staff</p>
        <h1 className="font-serif text-3xl font-bold mt-3">Super Admin</h1>
        <p className="text-sm text-muted mt-3">
          Sign in with the Google account that has Super Admin access.
        </p>

        {mode === 'local' && (
          <p className="text-sm text-amber-400/90 mt-4">
            Live API mode required for Google sign-in.
          </p>
        )}

        <div className="mt-8">
          <GoogleSignInButton intent="desk" />
        </div>
      </div>
    </div>
  )
}
