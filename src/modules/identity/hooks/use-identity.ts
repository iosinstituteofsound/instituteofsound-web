import { useQuery } from '@tanstack/react-query'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { getDexProfile } from '@/modules/identity/api/dex.api'
import { getMyGamificationProgress, getMyTheme } from '@/modules/badges/api/gamification.api'
import { tokenStorage } from '@/shared/services/api/token-storage'

export const identityQueryKey = ['identity', 'dex-profile'] as const

export function useIdentity() {
  const me = useMe()
  const dex = useQuery({
    queryKey: identityQueryKey,
    queryFn: getDexProfile,
    enabled: tokenStorage.hasSession(),
    staleTime: 60_000,
  })
  const gamification = useQuery({
    queryKey: ['identity', 'gamification'],
    queryFn: getMyGamificationProgress,
    enabled: tokenStorage.hasSession(),
    staleTime: 120_000,
  })
  const theme = useQuery({
    queryKey: ['identity', 'theme'],
    queryFn: getMyTheme,
    enabled: tokenStorage.hasSession(),
    staleTime: 120_000,
  })

  const user = me.data?.user
  const dexProfile = dex.data?.profile
  const modules = dex.data?.modules ?? []
  const authorization = me.data?.authorization

  const isLoading = me.isLoading || dex.isLoading
  const isError = me.isError || dex.isError

  return {
    user,
    dexProfile,
    modules,
    authorization,
    gamification: gamification.data,
    theme: theme.data,
    isLoading,
    isError,
    refetch: () => {
      void me.refetch()
      void dex.refetch()
      void gamification.refetch()
      void theme.refetch()
    },
  }
}
