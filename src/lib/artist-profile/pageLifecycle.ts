import {
  evaluateProfileCompleteness,
  type ProfileCompletenessInput,
} from '@/lib/artist-profile/completeness'
import type { ArtistProfile } from '@/lib/artist-profile/types'

/** Incomplete draft — unpublished; deleted after this if still incomplete. */
export const ARTIST_INCOMPLETE_DRAFT_MS = 7 * 24 * 60 * 60 * 1000

/** Live page — must log qualifying activity within this window or page is removed. */
export const ARTIST_PAGE_ACTIVITY_MS = 60 * 24 * 60 * 60 * 1000

export const ARTIST_PAGE_RULES = {
  onCreate: [
    'Your artist page starts as an unpublished draft.',
    'Finish the basic checklist (name, bio, avatar, at least one track or video) within 7 days — or the draft is deleted automatically.',
    'After your page is complete and live, keep it active: add music or videos, update your bio, post spins/drops on the network, or schedule releases — at least once every 60 days.',
    'No qualifying activity for 60 days removes your public artist page. You may request recovery through IOS Support with government ID verification.',
  ],
  activityExamples:
    'New track or video, Page update, bio edit, release drop, network spin, or drop post.',
} as const

export type ArtistLifecycleVerdict =
  | { action: 'keep' }
  | { action: 'delete'; reason: 'incomplete_draft_expired' | 'inactive_live_page' }

export function activityTimestamp(profile: ArtistProfile): string {
  return profile.lastActivityAt ?? profile.pageRefreshedAt ?? profile.updatedAt ?? profile.createdAt
}

export function msSince(iso: string): number {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY
  return Date.now() - t
}

export function isIncompleteDraftExpired(
  profile: ArtistProfile,
  input: ProfileCompletenessInput,
): boolean {
  const { complete } = evaluateProfileCompleteness(input)
  if (complete) return false
  return msSince(profile.createdAt) > ARTIST_INCOMPLETE_DRAFT_MS
}

export function isLivePageInactive(profile: ArtistProfile, input: ProfileCompletenessInput): boolean {
  const { complete } = evaluateProfileCompleteness(input)
  if (!complete) return false
  return msSince(activityTimestamp(profile)) > ARTIST_PAGE_ACTIVITY_MS
}

export function evaluateArtistLifecycle(
  profile: ArtistProfile,
  media: { trackCount: number; videoCount: number },
): ArtistLifecycleVerdict {
  const input: ProfileCompletenessInput = {
    displayName: profile.displayName,
    slug: profile.slug,
    bio: profile.bio ?? '',
    genres: profile.genres ?? [],
    avatarUrl: profile.avatarUrl ?? '',
    trackCount: media.trackCount,
    videoCount: media.videoCount,
  }

  if (isIncompleteDraftExpired(profile, input)) {
    return { action: 'delete', reason: 'incomplete_draft_expired' }
  }
  if (isLivePageInactive(profile, input)) {
    return { action: 'delete', reason: 'inactive_live_page' }
  }
  return { action: 'keep' }
}

export function draftDaysRemaining(profile: ArtistProfile): number {
  const left = ARTIST_INCOMPLETE_DRAFT_MS - msSince(profile.createdAt)
  return Math.max(0, Math.ceil(left / (24 * 60 * 60 * 1000)))
}

export function activityDaysRemaining(profile: ArtistProfile): number {
  const left = ARTIST_PAGE_ACTIVITY_MS - msSince(activityTimestamp(profile))
  return Math.max(0, Math.ceil(left / (24 * 60 * 60 * 1000)))
}
