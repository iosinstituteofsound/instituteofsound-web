import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  PLAYLIST_BASE_PATH,
  playlistApi,
  playlistDetailQueryKey,
  playlistListQueryKey,
  type PlaylistUpdateInput,
} from '@/modules/music/lib/playlist-api'
import { playlistCapabilities } from '@/modules/music/lib/playlist-capabilities'
import { searchListenerPlaylistTracks } from '@/modules/music/lib/listener-playlist-search'
import { playPlaylistFromDetail } from '@/modules/music/lib/player-queue'
import type { PlaylistTrackSearchResultDto } from '@/modules/music/types/music.types'
import { usePlayerStore } from '@/modules/player/stores/player-store'

type UsePlaylistDetailPageOptions = {
  slug: string
  basePath?: string
}

export function usePlaylistDetailPage({
  slug,
  basePath = PLAYLIST_BASE_PATH,
}: UsePlaylistDetailPageOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const playTrack = usePlayerStore((s) => s.playTrack)
  const shuffleQueueAnimated = usePlayerStore((s) => s.shuffleQueueAnimated)
  const capabilities = playlistCapabilities()

  const { data: playlist, isLoading, isError } = useQuery({
    queryKey: playlistDetailQueryKey(slug),
    queryFn: () => playlistApi.get(slug),
    enabled: Boolean(slug),
  })

  const playlistTrackIds = useMemo(
    () => new Set((playlist?.tracks ?? []).map((track) => track.trackId)),
    [playlist?.tracks],
  )

  const searchTracks = async (q: string, limit = 10): Promise<PlaylistTrackSearchResultDto> =>
    searchListenerPlaylistTracks(q, limit)

  const invalidatePlaylist = async (nextSlug?: string) => {
    await queryClient.invalidateQueries({ queryKey: playlistListQueryKey() })
    await queryClient.invalidateQueries({ queryKey: playlistDetailQueryKey(slug) })
    if (nextSlug && nextSlug !== slug) {
      await queryClient.invalidateQueries({ queryKey: playlistDetailQueryKey(nextSlug) })
      navigate(`${basePath}/${nextSlug}`, { replace: true })
    }
  }

  const updateMutation = useMutation({
    mutationFn: (input: PlaylistUpdateInput) => {
      if (!playlist) throw new Error('Playlist not found')
      return playlistApi.update(playlist.id, input)
    },
    onSuccess: async (updated) => {
      toast.success('Playlist updated')
      await invalidatePlaylist(updated.slug)
    },
  })

  const addTrackMutation = useMutation({
    mutationFn: (trackId: string) => {
      if (!playlist) throw new Error('Playlist not found')
      return playlistApi.addTrack(playlist.id, trackId)
    },
    onSuccess: async () => {
      toast.success('Track added')
      await invalidatePlaylist()
    },
  })

  const removeTrackMutation = useMutation({
    mutationFn: (trackId: string) => {
      if (!playlist) throw new Error('Playlist not found')
      return playlistApi.removeTrack(playlist.id, trackId)
    },
    onSuccess: async () => {
      toast.success('Track removed')
      await invalidatePlaylist()
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (trackIds: string[]) => {
      if (!playlist) throw new Error('Playlist not found')
      return playlistApi.reorderTracks(playlist.id, trackIds)
    },
    onSuccess: async () => {
      await invalidatePlaylist()
    },
    onError: () => {
      toast.error('Could not save track order')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!playlist) throw new Error('Playlist not found')
      return playlistApi.delete(playlist.id)
    },
    onSuccess: async () => {
      toast.success('Playlist deleted')
      await queryClient.invalidateQueries({ queryKey: playlistListQueryKey() })
      navigate(basePath)
    },
  })

  const playAtIndex = (index: number) => {
    if (!playlist) return
    playPlaylistFromDetail(playlist, playTrack, { startIndex: index, isOwn: true })
  }

  const handlePlayAll = () => {
    if (!playlist) return
    playPlaylistFromDetail(playlist, playTrack, { isOwn: true })
  }

  const handleShufflePlay = async () => {
    if (!playlist) return
    playPlaylistFromDetail(playlist, playTrack, {
      shuffled: true,
      isOwn: true,
    })
    await shuffleQueueAnimated()
  }

  return {
    playlist,
    isLoading,
    isError,
    capabilities,
    playlistTrackIds,
    searchTracks,
    updateMutation,
    addTrackMutation,
    removeTrackMutation,
    reorderMutation,
    deleteMutation,
    playAtIndex,
    handlePlayAll,
    handleShufflePlay,
  }
}
