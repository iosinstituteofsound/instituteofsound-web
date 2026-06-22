export type PlaylistCapabilities = {
  canReorder: boolean
  canRemove: boolean
  canAddTracks: boolean
  canEditSettings: boolean
  canDelete: boolean
  hasRichMetadata: boolean
}

export function playlistCapabilities(): PlaylistCapabilities {
  return {
    canReorder: true,
    canRemove: true,
    canAddTracks: true,
    canEditSettings: true,
    canDelete: true,
    hasRichMetadata: false,
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
