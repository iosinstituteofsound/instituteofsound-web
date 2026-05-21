import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import { ArtistAuthPanel } from '@/components/auth/ArtistAuthPanel'

export default function LoginPage() {
  const { user } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from

  if (user) {
    return <Navigate to={from ?? editorDashboardPath(user.role)} replace />
  }

  return <ArtistAuthPanel />
}
