import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { isEditorStaff } from '@/lib/auth/roles'

export default function EditorJoinPage() {
  const { user } = useAuth()

  if (user && isEditorStaff(user.role)) {
    return <Navigate to="/editor/dashboard" replace />
  }

  if (user) {
    return <Navigate to="/editor/apply" replace />
  }

  return (
    <div className="section-padding pt-32 min-h-screen max-w-lg mx-auto">
      <p className="ios-kicker">Editorial desk</p>
      <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">Join as an editor</h1>
      <p className="text-muted text-sm mt-4 leading-relaxed">
        Sign in with Google to create your account. You start as a regular member — then apply with
        links to your published writing. A super editor reviews every application before desk
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
        Super editorial staff:{' '}
        <Link to="/desk" className="ios-link">
          Desk login
        </Link>
      </p>
    </div>
  )
}
