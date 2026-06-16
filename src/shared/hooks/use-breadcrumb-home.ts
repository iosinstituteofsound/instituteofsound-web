import { useAuthStore } from '@/app/stores/auth-store'
import { useLayoutStore } from '@/app/stores/layout-store'
import { getLayoutHomeRouteFromLayout } from '@/shared/lib/layout-home-route'
import { tokenStorage } from '@/shared/services/api/token-storage'

export function useBreadcrumbHomeHref(): string {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasSession = tokenStorage.hasSession()
  const activeLayout = useLayoutStore((s) => s.activeLayout)

  if (isAuthenticated || hasSession) {
    return getLayoutHomeRouteFromLayout(activeLayout)
  }

  return '/'
}
