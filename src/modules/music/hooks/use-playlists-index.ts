import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  PLAYLIST_BASE_PATH,
  playlistApi,
  playlistListQueryKey,
  type PlaylistCreateInput,
} from '@/modules/music/lib/playlist-api'

type UsePlaylistsIndexOptions = {
  /** When false, skip navigation after create (e.g. profile strip with modal) */
  navigateOnCreate?: boolean
}

export function usePlaylistsIndex({ navigateOnCreate = true }: UsePlaylistsIndexOptions = {}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: playlists, isLoading } = useQuery({
    queryKey: playlistListQueryKey(),
    queryFn: () => playlistApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: (input: PlaylistCreateInput) => playlistApi.create(input),
    onSuccess: (playlist) => {
      toast.success('Playlist created')
      void queryClient.invalidateQueries({ queryKey: playlistListQueryKey() })
      if (navigateOnCreate) {
        navigate(`${PLAYLIST_BASE_PATH}/${playlist.slug}`)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => playlistApi.delete(id),
    onSuccess: () => {
      toast.success('Playlist deleted')
      void queryClient.invalidateQueries({ queryKey: playlistListQueryKey() })
    },
  })

  return {
    playlists: playlists ?? [],
    isLoading,
    basePath: PLAYLIST_BASE_PATH,
    createMutation,
    deleteMutation,
  }
}
