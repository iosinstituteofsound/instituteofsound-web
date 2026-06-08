import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1TouchArtistPageActivity } from '@/api/v1Client'
import { evaluateArtistLifecycle } from '@/lib/artist-profile/pageLifecycle'
import type { ArtistProfile } from '@/lib/artist-profile/types'
import * as local from '@/lib/artist-profile/storage'

/**
 * Public pages only: return null when lifecycle says the page should not be shown.
 * Does not delete — purge runs server-side via purge_expired_artist_profiles().
 */
export function hideIfExpiredPublicPage(
  profile: ArtistProfile,
  media: { trackCount: number; videoCount: number },
): ArtistProfile | null {
  const verdict = evaluateArtistLifecycle(profile, media)
  if (verdict.action === 'delete') return null
  return profile
}

export async function touchArtistPageActivity(userId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await v1TouchArtistPageActivity()
    } catch (err) {
      console.warn('[artist] touch activity', err instanceof Error ? err.message : err)
    }
    return
  }
  local.localTouchActivity(userId)
}

export async function touchArtistPageActivityByProfileId(profileId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await v1TouchArtistPageActivity(profileId)
    } catch (err) {
      console.warn('[artist] touch activity', err instanceof Error ? err.message : err)
    }
    return
  }
  const profile = local.localGetProfiles().find((p) => p.id === profileId)
  if (profile) local.localTouchActivity(profile.userId)
}

export function lifecycleDeletedMessage(reason: 'incomplete_draft_expired' | 'inactive_live_page'): string {
  if (reason === 'incomplete_draft_expired') {
    return 'Your draft artist page was removed — the basic checklist was not finished within 7 days. You can ask IOS Support to recover it if this was a mistake.'
  }
  return 'Your artist page was removed after 60 days without activity. You can request recovery through IOS Support if you need your catalog back.'
}
