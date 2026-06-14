export type PlaylistCuratorApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface PlaylistCuratorApplication {
  id: string
  userId: string
  userName?: string
  userHandle?: string
  playlistLinks: string[]
  note?: string
  status: PlaylistCuratorApplicationStatus
  reviewNotes?: string
  reviewedBy?: string
  createdAt: string
  updatedAt: string
}

export interface SubmitPlaylistCuratorInput {
  playlistLinks: string[]
  note?: string
}
