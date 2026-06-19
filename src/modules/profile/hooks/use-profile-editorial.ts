import { useQuery } from '@tanstack/react-query'
import { getProfileEditorialDesk } from '@/modules/explore/api/explore.api'

export function useProfileEditorial(userId: string) {
  return useQuery({
    queryKey: ['profile-editorial-desk', userId],
    queryFn: () => getProfileEditorialDesk(userId),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}
