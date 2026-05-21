import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath, isEditorStaff } from '@/lib/auth/roles'
import type { UserRole } from '@/lib/auth/types'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Single role or list of allowed roles */
  role?: UserRole | UserRole[]
}

function roleAllowed(userRole: UserRole, allowed?: UserRole | UserRole[]): boolean {
  if (!allowed) return true
  const list = Array.isArray(allowed) ? allowed : [allowed]
  if (list.includes('editor') && isEditorStaff(userRole)) {
    return userRole === 'editor' || userRole === 'super_editor'
  }
  return list.includes(userRole)
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <LoadingTransmission />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (role && !roleAllowed(user.role, role)) {
    return <Navigate to={editorDashboardPath(user.role)} replace />
  }

  return <>{children}</>
}
