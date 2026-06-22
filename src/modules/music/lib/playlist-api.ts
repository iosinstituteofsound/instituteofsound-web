import {
  addTrackToMyPlaylist,
  createMyPlaylist,
  deleteMyPlaylist,
  getMyPlaylist,
  listMyPlaylists,
  removeTrackFromMyPlaylist,
  updateMyPlaylist,
} from '@/modules/music/api/music.api'
import type { PlaylistDetailDto } from '@/modules/music/types/music.types'

export const PLAYLIST_BASE_PATH = '/library/playlists'

export type PlaylistCreateInput = {
  title: string
  description?: string
  coverUrl?: string
  visibility?: 'public' | 'private'
  trackIds?: string[]
}

export type PlaylistUpdateInput = {
  title?: string
  description?: string
  coverUrl?: string
  visibility?: 'public' | 'private'
  trackIds?: string[]
}

export function playlistListQueryKey() {
  return ['my-playlists'] as const
}

export function playlistDetailQueryKey(slug: string) {
  return ['my-playlist', slug] as const
}

export const playlistApi = {
  list(): Promise<PlaylistDetailDto[]> {
    return listMyPlaylists()
  },

  get(idOrSlug: string): Promise<PlaylistDetailDto> {
    return getMyPlaylist(idOrSlug)
  },

  create(input: PlaylistCreateInput): Promise<PlaylistDetailDto> {
    return createMyPlaylist(input)
  },

  update(id: string, input: PlaylistUpdateInput): Promise<PlaylistDetailDto> {
    return updateMyPlaylist(id, input)
  },

  delete(id: string) {
    return deleteMyPlaylist(id)
  },

  addTrack(playlistId: string, trackId: string) {
    return addTrackToMyPlaylist(playlistId, trackId)
  },

  removeTrack(playlistId: string, trackId: string) {
    return removeTrackFromMyPlaylist(playlistId, trackId)
  },

  reorderTracks(id: string, trackIds: string[]) {
    return updateMyPlaylist(id, { trackIds })
  },
}
