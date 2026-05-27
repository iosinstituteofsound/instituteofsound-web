import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { homeDashboardPath } from '@/lib/auth/roles'
import { NetworkAuthPanel } from '@/components/auth/NetworkAuthPanel'

/** Same as login — Google only (no email/password form) */
export default function RegisterPage() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to={homeDashboardPath(user.role)} replace />
  }

  return (
    <NetworkAuthPanel
      title="Join with Google"
      subtitle="Free network account in one tap — feed, dB, scenes, collab, and events. Upgrade to an artist page when you're ready."
    />
  )
}
