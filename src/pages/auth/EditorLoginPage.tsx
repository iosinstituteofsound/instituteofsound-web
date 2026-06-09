import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { isEditorStaff } from '@/lib/auth/roles'

export default function EditorLoginPage() {
  const { user } = useAuth()

  if (user && isEditorStaff(user.role)) {
    return <Navigate to="/editor/dashboard" replace />
  }

  if (user) {
    return <Navigate to="/editor/apply" replace />
  }

  return (
    <div className="auth-full-page section-padding">
      <div className="max-w-md mx-auto ios-panel ios-panel-accent">
        <p className="ios-kicker">Editorial desk</p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">Editor sign in</h1>
        <p className="text-muted text-sm mt-4 leading-relaxed">
          Sign in with the Google account you used to apply. If you are approved, you will reach the
          editorial desk. If your application is still pending, you will see its status.
        </p>
        <div className="mt-8">
          <GoogleSignInButton intent="editor_apply" label="Sign in with Google" />
        </div>
        <p className="text-xs text-muted mt-6">
          New here?{' '}
          <Link to="/editor/join" className="ios-link">
            Apply to become an editor
          </Link>
        </p>
      </div>
    </div>
  )
}
