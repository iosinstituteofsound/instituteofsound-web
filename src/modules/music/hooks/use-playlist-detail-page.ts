import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  playlistApi,
  playlistDetailQueryKey,
  playlistListQueryKey,
  type PlaylistOwnerMode,
  type PlaylistUpdateInput,
} from '@/modules/music/lib/playlist-api'
import { playlistCapabilities } from '@/modules/music/lib/playlist-capabilities'
import { searchArtistPlaylistTracks } from '@/modules/music/api/music.api'
import { searchListenerPlaylistTracks } from '@/modules/music/lib/listener-playlist-search'
import { playPlaylistFromDetail } from '@/modules/music/lib/player-queue'
import type { PlaylistTrackSearchResultDto } from '@/modules/music/types/music.types'
import { usePlayerStore } from '@/modules/player/stores/player-store'

type UsePlaylistDetailPageOptions = {
  mode: PlaylistOwnerMode
  slug: string
  basePath: string
}

export function usePlaylistDetailPage({ mode, slug, basePath }: UsePlaylistDetailPageOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const playTrack = usePlayerStore((s) => s.playTrack)
  const shuffleQueueAnimated = usePlayerStore((s) => s.shuffleQueueAnimated)
  const capabilities = playlistCapabilities(mode)

  const { data: playlist, isLoading, isError } = useQuery({
    queryKey: playlistDetailQueryKey(mode, slug),
    queryFn: () => playlistApi.get(mode, slug),
    enabled: Boolean(slug),
  })

  const playlistTrackIds = useMemo(
    () => new Set((playlist?.tracks ?? []).map((track) => track.trackId)),
    [playlist?.tracks],
  )

  const searchTracks = async (q: string, limit = 10): Promise<PlaylistTrackSearchResultDto> =>
    mode === 'artist' ? searchArtistPlaylistTracks(q, limit) : searchListenerPlaylistTracks(q, limit)

  const invalidatePlaylist = async (nextSlug?: string) => {
    await queryClient.invalidateQueries({ queryKey: playlistListQueryKey(mode) })
    await queryClient.invalidateQueries({ queryKey: playlistDetailQueryKey(mode, slug) })
    if (nextSlug && nextSlug !== slug) {
      await queryClient.invalidateQueries({ queryKey: playlistDetailQueryKey(mode, nextSlug) })
      navigate(`${basePath}/${nextSlug}`, { replace: true })
    }
  }

  const updateMutation = useMutation({
    mutationFn: (input: PlaylistUpdateInput) => {
      if (!playlist) throw new Error('Playlist not found')
      return playlistApi.update(mode, playlist.id, input)
    },
    onSuccess: async (updated) => {
      toast.success('Playlist updated')
      await invalidatePlaylist(updated.slug)
    },
  })

  const addTrackMutation = useMutation({
    mutationFn: (trackId: string) => {
      if (!playlist) throw new Error('Playlist not found')
      return playlistApi.addTrack(mode, playlist.id, trackId)
    },
    onSuccess: async () => {
      toast.success('Track added')
      await invalidatePlaylist()
    },
  })

  const removeTrackMutation = useMutation({
    mutationFn: (trackId: string) => {
      if (!playlist) throw new Error('Playlist not found')
      return playlistApi.removeTrack(mode, playlist.id, trackId)
    },
    onSuccess: async () => {
      toast.success('Track removed')
      await invalidatePlaylist()
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (trackIds: string[]) => {
      if (!playlist) throw new Error('Playlist not found')
      return playlistApi.reorderTracks(mode, playlist.id, trackIds)
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
      return playlistApi.delete(mode, playlist.id)
    },
    onSuccess: async () => {
      toast.success('Playlist deleted')
      await queryClient.invalidateQueries({ queryKey: playlistListQueryKey(mode) })
      navigate(basePath)
    },
  })

  const playAtIndex = (index: number) => {
    if (!playlist) return
    playPlaylistFromDetail(playlist, playTrack, { startIndex: index, isOwn: mode === 'listener' })
  }

  const handlePlayAll = () => {
    if (!playlist) return
    playPlaylistFromDetail(playlist, playTrack, { isOwn: mode === 'listener' })
  }

  const handleShufflePlay = async () => {
    if (!playlist) return
    playPlaylistFromDetail(playlist, playTrack, {
      shuffled: true,
      isOwn: mode === 'listener',
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
