import {
  addTrackToArtistPlaylist,
  addTrackToMyPlaylist,
  createArtistPlaylist,
  createMyPlaylist,
  deleteArtistPlaylist,
  deleteMyPlaylist,
  getArtistPlaylist,
  getMyPlaylist,
  listArtistPlaylists,
  listMyPlaylists,
  removeTrackFromArtistPlaylist,
  removeTrackFromMyPlaylist,
  updateArtistPlaylist,
  updateMyPlaylist,
} from '@/modules/music/api/music.api'
import type { PlaylistDetailDto } from '@/modules/music/types/music.types'

export type PlaylistOwnerMode = 'listener' | 'artist'

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

export function playlistListQueryKey(mode: PlaylistOwnerMode) {
  return mode === 'artist' ? ['artist-playlists'] : ['my-playlists']
}

export function playlistDetailQueryKey(mode: PlaylistOwnerMode, slug: string) {
  return mode === 'artist' ? ['artist-playlist', slug] : ['my-playlist', slug]
}

export const playlistApi = {
  list(mode: PlaylistOwnerMode): Promise<PlaylistDetailDto[]> {
    return mode === 'artist' ? listArtistPlaylists() : listMyPlaylists()
  },

  get(mode: PlaylistOwnerMode, idOrSlug: string): Promise<PlaylistDetailDto> {
    return mode === 'artist' ? getArtistPlaylist(idOrSlug) : getMyPlaylist(idOrSlug)
  },

  create(mode: PlaylistOwnerMode, input: PlaylistCreateInput): Promise<PlaylistDetailDto> {
    return mode === 'artist' ? createArtistPlaylist(input) : createMyPlaylist(input)
  },

  update(
    mode: PlaylistOwnerMode,
    id: string,
    input: PlaylistUpdateInput,
  ): Promise<PlaylistDetailDto> {
    return mode === 'artist' ? updateArtistPlaylist(id, input) : updateMyPlaylist(id, input)
  },

  delete(mode: PlaylistOwnerMode, id: string) {
    return mode === 'artist' ? deleteArtistPlaylist(id) : deleteMyPlaylist(id)
  },

  addTrack(mode: PlaylistOwnerMode, playlistId: string, trackId: string) {
    return mode === 'artist'
      ? addTrackToArtistPlaylist(playlistId, trackId)
      : addTrackToMyPlaylist(playlistId, trackId)
  },

  removeTrack(mode: PlaylistOwnerMode, playlistId: string, trackId: string) {
    return mode === 'artist'
      ? removeTrackFromArtistPlaylist(playlistId, trackId)
      : removeTrackFromMyPlaylist(playlistId, trackId)
  },

  reorderTracks(mode: PlaylistOwnerMode, id: string, trackIds: string[]) {
    return this.update(mode, id, { trackIds })
  },
}

export function playlistBasePath(mode: PlaylistOwnerMode): string {
  return mode === 'artist' ? '/artist/playlists' : '/library/playlists'
}
