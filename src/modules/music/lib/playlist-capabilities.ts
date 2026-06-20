import type { PlaylistOwnerMode } from '@/modules/music/lib/playlist-api'

export type PlaylistCapabilities = {
  canReorder: boolean
  canRemove: boolean
  canAddTracks: boolean
  canEditSettings: boolean
  canDelete: boolean
  hasRichMetadata: boolean
}

export function playlistCapabilities(mode: PlaylistOwnerMode): PlaylistCapabilities {
  return {
    canReorder: true,
    canRemove: true,
    canAddTracks: true,
    canEditSettings: true,
    canDelete: true,
    hasRichMetadata: mode === 'artist',
  }
}

export function publicPlaylistCapabilities(): PlaylistCapabilities {
  return {
    canReorder: false,
    canRemove: false,
    canAddTracks: false,
    canEditSettings: false,
    canDelete: false,
    hasRichMetadata: false,
  }
}
