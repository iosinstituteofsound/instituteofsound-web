import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { IosBrandLockup } from '@/components/layout/IosBrandLockup'
import { hasEditorialAccess } from '@/lib/auth/roles'

export default function EditorJoinPage() {
  const { user } = useAuth()

  if (user && hasEditorialAccess(user.authorization)) {
    return <Navigate to="/editor/dashboard" replace />
  }

  if (user) {
    return <Navigate to="/editor/apply" replace />
  }

  return (
    <div className="auth-full-page section-padding">
      <div className="max-w-md mx-auto ios-panel ios-panel-accent">
        <IosBrandLockup to="/" size="sm" className="mb-6" />
        <p className="ios-kicker">Editorial desk</p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">Join as an editor</h1>
        <p className="text-muted text-sm mt-4 leading-relaxed">
          Sign in with Google to create your account. You start as a regular member — then apply with
          links to your published writing. IOS Support reviews every application before desk
          access is granted.
        </p>
        <div className="mt-8">
          <GoogleSignInButton intent="editor_apply" label="Continue with Google" />
        </div>
        <p className="text-xs text-muted mt-6">
          Already have an account?{' '}
          <Link to="/editor/login" className="ios-link">
            Editor sign in
          </Link>
        </p>
        <p className="text-xs text-muted mt-2">
          IOS Support editorial team:{' '}
          <Link to="/desk" className="ios-link">
            Desk login
          </Link>
        </p>
      </div>
    </div>
  )
}
