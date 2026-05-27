import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { homeDashboardPath } from '@/lib/auth/roles'
import { NetworkAuthPanel } from '@/components/auth/NetworkAuthPanel'

export default function LoginPage() {
  const { user } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from

  if (user) {
    return <Navigate to={from ?? homeDashboardPath(user.role)} replace />
  }

  return <NetworkAuthPanel title="Sign in" />
}
