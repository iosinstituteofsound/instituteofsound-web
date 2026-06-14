import type { ArtistDeletionReason, ArtistProfileSnapshotV1 } from '@/lib/artist-page-recovery/types'
import type { ArtistProfile } from '@/lib/artist-profile/types'
import * as local from '@/lib/artist-profile/storage'

/** Local demo only — live archive/restore runs on instituteofsound-api. */
export async function buildArtistProfileSnapshot(
  profile: ArtistProfile,
): Promise<ArtistProfileSnapshotV1> {
  return {
    version: 1,
    profile,
    tracks: local.localGetTracks(profile.id),
    albums: local.localGetAlbums(profile.id),
    videos: local.localGetVideos(profile.id),
    merch: local.localGetMerch(profile.id),
    lineup: local.localGetLineup(profile.id),
    bioTimeline: local.localGetBioTimeline(profile.id),
    releases: (await import('@/lib/releases/localReleases')).localListReleasesForProfile(
      profile.id,
    ),
  }
}

export async function insertArtistProfileArchive(
  profile: ArtistProfile,
  reason: ArtistDeletionReason,
  snapshot: ArtistProfileSnapshotV1,
): Promise<string> {
  return local.localInsertArchive(profile, reason, snapshot)
}

export async function archiveAndDeleteArtistProfile(
  profile: ArtistProfile,
  reason: ArtistDeletionReason,
): Promise<void> {
  const snapshot = await buildArtistProfileSnapshot(profile)
  await insertArtistProfileArchive(profile, reason, snapshot)
  local.localDeleteProfileForUser(profile.userId)
}

export async function restoreArtistProfileArchive(
  archiveId: string,
  restoredByUserId: string,
): Promise<ArtistProfile> {
  return local.localRestoreArchive(archiveId, restoredByUserId)
}
