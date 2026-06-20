import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invalidateArtistSurfaceQueries } from '@/modules/explore/lib/invalidate-artist-surface'
import { getProfileDiscography, setArtistPick } from '@/modules/explore/api/explore.api'

export function useProfileDiscography(userId: string) {
  return useQuery({
    queryKey: ['profile-discography', userId],
    queryFn: () => getProfileDiscography(userId),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useSetArtistPick(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setArtistPick,
    onSuccess: () => {
      invalidateArtistSurfaceQueries(queryClient, userId)
    },
  })
}
