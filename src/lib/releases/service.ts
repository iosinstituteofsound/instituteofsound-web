import { touchArtistPageActivityByProfileId } from '@/lib/artist-profile/pageEnforcement'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import {
  v1AddReleaseMilestone,
  v1ListReleaseMilestones,
  v1ListReleasesForProfile,
  v1MarkReleaseSpinPromoted,
  v1UpsertRelease,
} from '@/api/v1Phase4Client'
import { validateReleaseEmbedInput } from '@/lib/community/musicLinks'
import type {
  ArtistRelease,
  ReleaseMilestone,
  UpsertReleaseInput,
} from '@/lib/releases/types'
import * as local from '@/lib/releases/localReleases'

export async function listReleasesForProfile(profileId: string): Promise<ArtistRelease[]> {
  if (!isSupabaseConfigured()) return local.localListReleasesForProfile(profileId)

  const { releases } = await v1ListReleasesForProfile(profileId)
  return releases
}

export async function upsertRelease(
  profileId: string,
  input: UpsertReleaseInput,
  releaseId?: string
): Promise<ArtistRelease> {
  const embed = validateReleaseEmbedInput(
    input.spotifyUrl ?? '',
    input.youtubeUrl ?? '',
    input.soundcloudUrl ?? ''
  )
  if (embed.error) throw new Error(embed.error)

  const liveAt = new Date(input.liveAt)
  if (Number.isNaN(liveAt.getTime())) throw new Error('Invalid premiere time.')
  if (!releaseId && liveAt.getTime() < Date.now() - 60_000) {
    throw new Error('Premiere must be scheduled in the future (strict live_at).')
  }

  const status = input.status === 'draft' ? 'draft' : 'scheduled'

  const release = !isSupabaseConfigured()
    ? local.localUpsertRelease(profileId, { ...input, status }, releaseId)
    : (await v1UpsertRelease({ profileId, release: input, releaseId })).release

  await touchArtistPageActivityByProfileId(profileId)
  return release
}

export async function addReleaseMilestone(
  releaseId: string,
  input: { kind: ReleaseMilestone['kind']; title: string; body?: string }
): Promise<ReleaseMilestone> {
  if (!isSupabaseConfigured()) {
    return local.localAddMilestone(releaseId, input)
  }

  const { milestone } = await v1AddReleaseMilestone({
    releaseId,
    kind: input.kind,
    title: input.title,
    body: input.body,
  })
  return milestone
}

export async function listReleaseMilestones(releaseId: string): Promise<ReleaseMilestone[]> {
  if (!isSupabaseConfigured()) return local.localListMilestones(releaseId)

  const { milestones } = await v1ListReleaseMilestones(releaseId)
  return milestones
}

export async function markReleaseSpinPromoted(releaseId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    local.localMarkSpinPromoted(releaseId)
    return
  }

  await v1MarkReleaseSpinPromoted(releaseId)
}
