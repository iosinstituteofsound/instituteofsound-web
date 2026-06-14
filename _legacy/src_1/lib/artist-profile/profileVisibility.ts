import {
  evaluateProfileCompleteness,
  type ProfileCompletenessInput,
} from '@/lib/artist-profile/completeness'
import {
  activityTimestamp,
  ARTIST_PAGE_ACTIVITY_MS,
  isLivePageInactive,
} from '@/lib/artist-profile/pageLifecycle'
import type {
  ArtistPageStatus,
  ArtistProfile,
  ArtistProfilePageData,
} from '@/lib/artist-profile/types'

export type ArtistPublicationState = {
  pageStatus: ArtistPageStatus
  published: boolean
  mediaPublic: boolean
  inactive: boolean
  complete: boolean
  missing: string[]
}

export function computeArtistPublication(
  input: ProfileCompletenessInput,
  profile: Pick<ArtistProfile, 'lastActivityAt' | 'pageRefreshedAt' | 'updatedAt' | 'createdAt'>,
): ArtistPublicationState {
  const { complete, missing } = evaluateProfileCompleteness(input)
  const inactive = complete && isLivePageInactive(profile as ArtistProfile, input)

  if (!complete) {
    return {
      pageStatus: 'pending',
      published: false,
      mediaPublic: false,
      inactive: false,
      complete: false,
      missing,
    }
  }

  if (inactive) {
    return {
      pageStatus: 'pending',
      published: false,
      mediaPublic: false,
      inactive: true,
      complete: true,
      missing: [],
    }
  }

  return {
    pageStatus: 'live',
    published: true,
    mediaPublic: true,
    inactive: false,
    complete: true,
    missing: [],
  }
}

export function publicationInputFromProfile(
  profile: ArtistProfile,
  media: { trackCount: number; videoCount: number },
): ProfileCompletenessInput {
  return {
    displayName: profile.displayName,
    slug: profile.slug,
    bio: profile.bio ?? '',
    genres: profile.genres ?? [],
    avatarUrl: profile.avatarUrl ?? '',
    trackCount: media.trackCount,
    videoCount: media.videoCount,
  }
}

export function getArtistPublicationState(
  profile: ArtistProfile,
  media: { trackCount: number; videoCount: number },
): ArtistPublicationState {
  return computeArtistPublication(publicationInputFromProfile(profile, media), profile)
}

export function applyPublicationToProfile(
  profile: ArtistProfile,
  media: { trackCount: number; videoCount: number },
): ArtistProfile {
  const pub = getArtistPublicationState(profile, media)
  return {
    ...profile,
    pageStatus: pub.pageStatus,
    published: pub.published,
  }
}

export function artistPageStatusLabel(status: ArtistPageStatus, inactive: boolean): string {
  if (status === 'live') return 'Live'
  if (inactive) return 'Pending — activity required'
  return 'Draft'
}

export function artistPublicationHint(pub: ArtistPublicationState): string {
  if (!pub.complete) {
    return `Complete your checklist to go live: ${pub.missing.join(', ')}. Incomplete drafts are removed after 7 days.`
  }
  if (pub.inactive) {
    const days = Math.round(ARTIST_PAGE_ACTIVITY_MS / (24 * 60 * 60 * 1000))
    return `No page activity in over ${days} days — add music, post a spin/drop, or use Page update soon or your artist page will be deleted.`
  }
  return 'Your page is live. Keep it active with new music, Page update, bio edits, releases, or network spins/drops at least every 60 days.'
}

/** Discover, /releases, and manager rosters — complete, live, and recently active. */
export function isArtistDiscoverVisible(profile: ArtistProfile): boolean {
  if (!profile.published || profile.pageStatus !== 'live') return false
  return msSinceActivity(profile) <= ARTIST_PAGE_ACTIVITY_MS
}

function msSinceActivity(profile: ArtistProfile): number {
  const t = new Date(activityTimestamp(profile)).getTime()
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY
  return Date.now() - t
}

export function filterDiscoverProfiles(profiles: ArtistProfile[]): ArtistProfile[] {
  return profiles.filter(isArtistDiscoverVisible)
}

export function resolveArtistPageForViewer(
  data: ArtistProfilePageData,
  viewerId?: string,
): ArtistProfilePageData | null {
  const media = { trackCount: data.tracks.length, videoCount: data.videos.length }
  const pub = getArtistPublicationState(data.profile, media)
  const profile = applyPublicationToProfile(data.profile, media)
  const isOwner = Boolean(viewerId && data.profile.userId === viewerId)

  if (isOwner) {
    return {
      ...data,
      profile: { ...data.profile, pageStatus: pub.pageStatus, published: pub.published },
    }
  }

  if (!pub.complete || !pub.mediaPublic) return null

  return { ...data, profile }
}
