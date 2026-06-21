import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as musicAdminApi from '@/modules/music-admin/api/music-admin.api'

export function useAdminTracks(params?: {
  q?: string
  status?: 'processing' | 'ready' | 'failed'
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['admin', 'music', 'tracks', params],
    queryFn: () => musicAdminApi.listAdminTracks(params),
  })
}

export function useUpdateAdminTrack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      musicAdminApi.updateAdminTrack(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'music', 'tracks'] })
    },
  })
}

export function useDeleteAdminTrack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: musicAdminApi.deleteAdminTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'music', 'tracks'] })
    },
  })
}

export function useBulkDeleteAdminTracks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: musicAdminApi.bulkDeleteAdminTracks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'music', 'tracks'] })
    },
  })
}
