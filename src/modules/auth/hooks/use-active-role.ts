import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePermissionStore } from '@/app/stores/permission-store'
import { useLayoutStore } from '@/app/stores/layout-store'
import { meQueryKey } from '@/modules/auth/hooks/use-auth'
import * as sidebarApi from '@/modules/sidebar/api/sidebar.api'
import * as userApi from '@/modules/users/api/user.api'

import { getLayoutHomeRoute } from '@/shared/lib/layout-home-route'

function canAccessPath(pathname: string, sidebarPaths: string[]) {
  return sidebarPaths.some(
    (itemPath) => pathname === itemPath || pathname.startsWith(`${itemPath}/`),
  )
}

export function useSetActiveRole() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const hydrate = usePermissionStore((s) => s.hydrate)
  const hydrateLayout = useLayoutStore((s) => s.hydrateActiveLayout)
  const syncFromSidebarItems = usePermissionStore((s) => s.syncFromSidebarItems)

  return useMutation({
    mutationFn: userApi.setActiveRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: meQueryKey })
      await queryClient.invalidateQueries({ queryKey: ['sidebar'] })

      const me = await userApi.getMe()
      hydrate(me.authorization)
      hydrateLayout(me.authorization.activeLayout)

      const sidebarItems = await sidebarApi.getSidebarItems()
      syncFromSidebarItems(sidebarItems)

      const sidebarPaths = sidebarItems.map((item) => item.path)
      if (!canAccessPath(location.pathname, sidebarPaths)) {
        navigate(getLayoutHomeRoute(me.authorization), { replace: true })
      }
    },
  })
}
