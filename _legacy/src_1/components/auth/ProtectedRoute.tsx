import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { homeDashboardPath } from '@/lib/auth/roles'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Required permission slug */
  permission?: string
  /** Any of these permissions grants access */
  anyPermission?: string[]
  /** Must be signed in only (no permission check) */
  requireAuth?: boolean
}

export function ProtectedRoute({
  children,
  permission,
  anyPermission,
  requireAuth = !permission && !anyPermission,
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, hasAnyPermission } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <LoadingTransmission variant="hell" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to={homeDashboardPath(user.authorization)} replace />
  }

  if (anyPermission && !hasAnyPermission(anyPermission)) {
    return <Navigate to={homeDashboardPath(user.authorization)} replace />
  }

  if (!requireAuth && !permission && !anyPermission) {
    return <>{children}</>
  }

  return <>{children}</>
}
