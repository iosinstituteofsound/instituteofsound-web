import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/app/stores/auth-store'
import { useLayoutStore } from '@/app/stores/layout-store'
import { usePermissionStore } from '@/app/stores/permission-store'
import * as authApi from '@/modules/auth/api/auth.api'
import * as userApi from '@/modules/users/api/user.api'
import { tokenStorage } from '@/shared/services/api/token-storage'

export const meQueryKey = ['me'] as const

export function useMe(enabled = true) {
  const hydrate = usePermissionStore((s) => s.hydrate)
  const hydrateLayout = useLayoutStore((s) => s.hydrateActiveLayout)
  const setSession = useAuthStore((s) => s.setSession)

  return useQuery({
    queryKey: meQueryKey,
    queryFn: async () => {
      const result = await userApi.getMe()
      hydrate(result.authorization)
      hydrateLayout(result.authorization.activeLayout)
      setSession(result.user.id, result.user.email)
      return result
    },
    enabled: enabled && tokenStorage.hasSession(),
    staleTime: 5 * 60_000,
    retry: (failureCount, error) => {
      const status = error && typeof error === 'object' && 'status' in error ? Number((error as { status: number }).status) : 0
      if (status === 401 || status === 403) return false
      return failureCount < 1
    },
  })
}

export function useGoogleLogin() {
  return {
    login: () => authApi.redirectToGoogleAuth(),
  }
}

export function useDevLogin() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)
  const hydrate = usePermissionStore((s) => s.hydrate)
  const hydrateLayout = useLayoutStore((s) => s.hydrateActiveLayout)

  return useMutation({
    mutationFn: authApi.devLogin,
    onSuccess: async (data) => {
      tokenStorage.setTokens(data.access_token, data.refresh_token)
      setSession(data.userId, data.email)
      const me = await userApi.getMe()
      hydrate(me.authorization)
      hydrateLayout(me.authorization.activeLayout)
      await queryClient.invalidateQueries({ queryKey: meQueryKey })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((s) => s.clearSession)
  const resetPermissions = usePermissionStore((s) => s.reset)
  const hydrateLayout = useLayoutStore((s) => s.hydrateActiveLayout)

  return useMutation({
    mutationFn: async () => {
      const refresh = tokenStorage.getRefreshToken()
      await authApi.logout(refresh ?? undefined)
    },
    onSettled: () => {
      clearSession()
      resetPermissions()
      hydrateLayout(null)
      queryClient.clear()
      window.location.href = '/'
    },
  })
}

export function useAuthSession() {
  const { data, isLoading, isError } = useMe()
  return {
    user: data?.user,
    authorization: data?.authorization,
    isLoading,
    isError,
    isAuthenticated: Boolean(data?.user),
  }
}
