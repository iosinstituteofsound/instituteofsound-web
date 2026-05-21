import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

export default function DashboardRedirectPage() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingTransmission variant="hell" />

  if (!user) return <Navigate to="/login" replace />

  return (
    <Navigate
      to={editorDashboardPath(user.role)}
      replace
    />
  )
}
