import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isSuperEditor } from '@/lib/auth/roles'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { IosBrandLockup } from '@/components/layout/IosBrandLockup'

/** Staff — Google only. Bookmark /desk */
export default function DeskLoginPage() {
  const { user, mode } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/editor/dashboard'

  if (user) {
    if (isSuperEditor(user.role)) {
      return <Navigate to={from} replace />
    }
    return <Navigate to="/artist/dashboard" replace />
  }

  return (
    <div className="auth-full-page section-padding">
      <div className="max-w-md mx-auto ios-panel ios-panel-accent">
        <IosBrandLockup to="/" size="sm" className="mb-6" />
        <p className="ios-kicker">Staff</p>
        <h1 className="font-serif text-3xl font-bold mt-3">IOS Support</h1>
        <p className="text-sm text-muted mt-3">
          Sign in with the Google account that has IOS Support desk access.
        </p>

        {mode === 'local' && (
          <p className="mt-4 text-xs text-muted">Requires Supabase + Google provider.</p>
        )}

        <div className="mt-8">
          <GoogleSignInButton intent="desk" label="Continue with Google" />
        </div>
      </div>
    </div>
  )
}
