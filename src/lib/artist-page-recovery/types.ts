import type { ArtistProfile } from '../artist-profile/types'
import type {
  ArtistAlbum,
  ArtistBioTimelineEntry,
  ArtistLineupEntry,
  ArtistMerchItem,
  ArtistTrack,
  ArtistVideo,
} from '../artist-profile/types'
import type { ArtistRelease } from '../releases/types'

export type ArtistDeletionReason = 'incomplete_draft_expired' | 'inactive_live_page' | 'manual'

export type ArtistProfileSnapshotV1 = {
  version: 1
  profile: ArtistProfile
  tracks: ArtistTrack[]
  albums: ArtistAlbum[]
  videos: ArtistVideo[]
  merch: ArtistMerchItem[]
  lineup: ArtistLineupEntry[]
  bioTimeline: ArtistBioTimelineEntry[]
  releases: ArtistRelease[]
}

export type ArtistProfileArchive = {
  id: string
  userId: string
  profileId: string
  slug: string
  displayName: string
  deletionReason: ArtistDeletionReason
  deletedAt: string
  snapshot: ArtistProfileSnapshotV1
  restoredAt?: string
  restoredBy?: string
}

export type ArtistPageRecoveryStatus = 'pending' | 'approved' | 'rejected'

export type ArtistPageRecoveryRequest = {
  id: string
  archiveId: string
  userId: string
  govIdDocumentUrl: string
  applicantNote?: string
  status: ArtistPageRecoveryStatus
  reviewNotes?: string
  reviewedBy?: string
  createdAt: string
  updatedAt: string
}

export type DeletedArtistPageRow = ArtistProfileArchive & {
  recoveryRequest?: ArtistPageRecoveryRequest
}
