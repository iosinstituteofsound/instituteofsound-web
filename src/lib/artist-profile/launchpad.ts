import { fetchMemberPosts, fetchPublicMemberProfile } from '@/lib/community/memberProfileService'
import { fetchUserBadges, type EarnedBadge } from '@/lib/community/service'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type {
  ArtistEditorialFeature,
  ArtistProfile,
  ArtistProfilePageData,
} from '@/lib/artist-profile/types'

export interface ArtistLaunchpadSnapshot {
  networkHandle: string | null
  memberStats: Awaited<ReturnType<typeof fetchPublicMemberProfile>>
  badges: EarnedBadge[]
  latestSpin: CommunityFeedPost | null
  latestEditorial: ArtistEditorialFeature | null
}

export async function fetchArtistLaunchpadSnapshot(
  profile: ArtistProfile,
  networkHandle: string | null,
  editorial: ArtistEditorialFeature[]
): Promise<ArtistLaunchpadSnapshot> {
  const handle = networkHandle?.replace(/^@/, '') ?? null
  const [memberStats, badges, posts] = await Promise.all([
    handle ? fetchPublicMemberProfile(handle) : Promise.resolve(null),
    fetchUserBadges(profile.userId).catch(() => [] as EarnedBadge[]),
    handle ? fetchMemberPosts(handle, 12) : Promise.resolve([]),
  ])

  const latestSpin = posts.find((p) => p.kind === 'spin' && p.status === 'visible') ?? null
  const latestEditorial = editorial[0] ?? null

  return {
    networkHandle: handle ? `@${handle.replace(/^@/, '')}` : null,
    memberStats,
    badges,
    latestSpin,
    latestEditorial,
  }
}

export function pickListenUrl(data: ArtistProfilePageData): {
  label: string
  href: string
  trackTitle?: string
} | null {
  const { profile, pickTrack, tracks, merch } = data
  if (pickTrack?.streamUrl) {
    return { label: `Play ${pickTrack.title}`, href: pickTrack.streamUrl, trackTitle: pickTrack.title }
  }
  if (tracks[0]?.streamUrl) {
    return { label: `Play ${tracks[0].title}`, href: tracks[0].streamUrl, trackTitle: tracks[0].title }
  }
  if (profile.social.spotify) {
    return { label: 'Listen on Spotify', href: profile.social.spotify }
  }
  if (profile.social.youtube) {
    return { label: 'Listen on YouTube', href: profile.social.youtube }
  }
  if (merch[0]?.productUrl) {
    return { label: `Shop · ${merch[0].title}`, href: merch[0].productUrl }
  }
  return null
}
