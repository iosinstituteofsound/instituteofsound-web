import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  playlistApi,
  playlistBasePath,
  playlistListQueryKey,
  type PlaylistCreateInput,
  type PlaylistOwnerMode,
} from '@/modules/music/lib/playlist-api'

type UsePlaylistsIndexOptions = {
  mode: PlaylistOwnerMode
  /** When false, skip navigation after create (e.g. profile strip with modal) */
  navigateOnCreate?: boolean
}

export function usePlaylistsIndex({
  mode,
  navigateOnCreate = true,
}: UsePlaylistsIndexOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const basePath = playlistBasePath(mode)

  const { data: playlists, isLoading } = useQuery({
    queryKey: playlistListQueryKey(mode),
    queryFn: () => playlistApi.list(mode),
  })

  const createMutation = useMutation({
    mutationFn: (input: PlaylistCreateInput) => playlistApi.create(mode, input),
    onSuccess: (playlist) => {
      toast.success('Playlist created')
      void queryClient.invalidateQueries({ queryKey: playlistListQueryKey(mode) })
      if (navigateOnCreate) {
        navigate(`${basePath}/${playlist.slug}`)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => playlistApi.delete(mode, id),
    onSuccess: () => {
      toast.success('Playlist deleted')
      void queryClient.invalidateQueries({ queryKey: playlistListQueryKey(mode) })
    },
  })

  return {
    playlists: playlists ?? [],
    isLoading,
    basePath,
    createMutation,
    deleteMutation,
  }
}
