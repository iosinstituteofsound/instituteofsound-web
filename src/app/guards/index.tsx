import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/stores/auth-store'
import { useLayoutStore } from '@/app/stores/layout-store'
import { usePermissionStore } from '@/app/stores/permission-store'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { PageLoader } from '@/shared/components/feedback/loader'
import { usePermission } from '@/shared/hooks/use-permission'
import { useSidebar } from '@/modules/sidebar/hooks/use-sidebar'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { getLayoutHomeRoute, getLayoutHomeRouteFromLayout } from '@/shared/lib/layout-home-route'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const clearSession = useAuthStore((s) => s.clearSession)
  const hydrated = usePermissionStore((s) => s.hydrated)
  const hasSession = tokenStorage.hasSession()

  const { isLoading, isFetching, isError, isFetched } = useMe(hasSession)

  useEffect(() => {
    if (isError && isFetched && !isFetching && !isLoading) {
      clearSession()
    }
  }, [isError, isFetched, isFetching, isLoading, clearSession])

  if (!isAuthenticated && !hasSession) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (hasSession && !hydrated && (isLoading || isFetching || !isFetched)) {
    return <PageLoader />
  }

  if (hasSession && isFetched && (isError || !hydrated)) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

interface GuestGuardProps {
  children: ReactNode
}

export function GuestGuard({ children }: GuestGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasSession = tokenStorage.hasSession()
  const activeLayout = useLayoutStore((s) => s.activeLayout)
  const { data, isLoading } = useMe(hasSession && !activeLayout)

  if (isAuthenticated || hasSession) {
    if (hasSession && !activeLayout && isLoading) return <PageLoader />
    const home = activeLayout
      ? getLayoutHomeRouteFromLayout(activeLayout)
      : getLayoutHomeRoute(data?.authorization)
    return <Navigate to={home} replace />
  }

  return <>{children}</>
}

interface ResourceGuardProps {
  children: ReactNode
  name: string
  type?: 'PAGE' | 'COMPONENT'
}

export function ResourceGuard({ children, name, type = 'PAGE' }: ResourceGuardProps) {
  const location = useLocation()
  const { hasResource, canAccessPath, hydrated, sidebarSynced } = usePermission()
  const { isLoading: sidebarLoading } = useSidebar()

  if (!hydrated || sidebarLoading || !sidebarSynced) return <PageLoader />

  const allowed =
    hasResource(name, type) ||
    canAccessPath(location.pathname)

  if (!allowed) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}

interface PermissionGuardProps {
  children: ReactNode
  resource: string
  action: 'read' | 'create' | 'update' | 'delete' | 'manage'
}

export function PermissionGuard({ children, resource, action }: PermissionGuardProps) {
  const { can, hydrated, sidebarSynced } = usePermission()
  const { isLoading: sidebarLoading } = useSidebar()

  if (!hydrated || sidebarLoading || !sidebarSynced) return <PageLoader />

  if (!can(resource, action)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
