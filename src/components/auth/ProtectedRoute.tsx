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

function signInPathFor(allowed?: UserRole | UserRole[]): string {
  if (!allowed) return '/login'
  const list = Array.isArray(allowed) ? allowed : [allowed]
  if (list.includes('super_editor') && list.length === 1) return '/desk'
  if (list.includes('editor') || list.includes('super_editor')) return '/editor/login'
  return '/login'
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
        <LoadingTransmission variant="hell" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate to={signInPathFor(role)} state={{ from: location.pathname }} replace />
    )
  }

  if (role && !roleAllowed(user.role, role)) {
    return <Navigate to={editorDashboardPath(user.role)} replace />
  }

  return <>{children}</>
}
