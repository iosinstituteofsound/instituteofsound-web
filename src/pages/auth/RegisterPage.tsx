import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import { ArtistAuthPanel } from '@/components/auth/ArtistAuthPanel'

/** Same as login — Google only (no email/password form) */
export default function RegisterPage() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to={editorDashboardPath(user.role)} replace />
  }

  return (
    <ArtistAuthPanel
      title="Join with Google"
      subtitle="Create your free artist account in one tap. Build your band profile and submit tracks — no password or email confirmation."
    />
  )
}
