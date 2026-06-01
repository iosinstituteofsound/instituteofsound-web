import {
  v1FetchMyFandom,
  v1FetchArtistFandom,
  v1FetchFandomDiscover,
  v1FetchArtistSentRecognitions,
  v1FetchPublicRecognitionsForUser,
  v1FetchSupporterMilestones,
  v1SendFandomRecognition,
} from '@/api/v1FandomClient'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import type {
  FandomDiscoverArtistRow,
  FandomMilestoneRow,
  FandomPublicRecognitionRow,
  FandomRecognitionKind,
  FandomSentRecognitionRow,
  FandomWindow,
  PublicSupporterBadge,
  PublicSupporterBadgeOnArtist,
} from './types'

export async function fetchMyFandom(window: FandomWindow = '90d') {
  if (!isSupabaseConfigured()) return []
  return v1FetchMyFandom(window)
}

function emptyArtistFandom() {
  return { supporters: [], recent: [], champions: [], drivers: [] }
}

export async function fetchArtistFandom(fandomWindow: FandomWindow = '90d') {
  if (!isSupabaseConfigured()) {
    return emptyArtistFandom()
  }
  const data = await v1FetchArtistFandom(fandomWindow)
  return {
    supporters: data.supporters ?? [],
    recent: data.recent ?? [],
    champions: data.champions ?? [],
    drivers: data.drivers ?? [],
  }
}

export async function fetchFandomDiscover(): Promise<{
  rising: FandomDiscoverArtistRow[]
  forYou: FandomDiscoverArtistRow[]
}> {
  if (!isSupabaseConfigured()) {
    return { rising: [], forYou: [] }
  }
  return v1FetchFandomDiscover()
}

export async function searchArtistsForSupportTags(_query: string) {
  if (!isSupabaseConfigured()) return []
  return []
}

export async function fetchPublicSupporterBadge(
  _artistProfileId: string,
  _supporterUserId?: string,
): Promise<PublicSupporterBadge | null> {
  if (!isSupabaseConfigured()) return null
  return null
}

export async function fetchPublicSupporterBadgesForUser(
  _supporterUserId: string,
  _limit = 8,
): Promise<PublicSupporterBadgeOnArtist[]> {
  if (!isSupabaseConfigured()) return []
  return []
}

export async function sendFandomRecognition(
  supporterUserId: string,
  message: string,
  kind: FandomRecognitionKind = 'thanks',
  isPublic = true,
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Sign in required')
  await v1SendFandomRecognition({ supporterUserId, message, kind, isPublic })
}

export async function fetchArtistSentRecognitions(limit = 20): Promise<FandomSentRecognitionRow[]> {
  if (!isSupabaseConfigured()) return []
  return v1FetchArtistSentRecognitions(limit)
}

export async function fetchPublicRecognitionsForUser(
  userId: string,
  limit = 12,
): Promise<FandomPublicRecognitionRow[]> {
  if (!isSupabaseConfigured()) return []
  return v1FetchPublicRecognitionsForUser(userId, limit)
}

export async function fetchSupporterMilestones(
  artistProfileId: string,
  supporterUserId?: string,
): Promise<FandomMilestoneRow[]> {
  if (!isSupabaseConfigured()) return []
  return v1FetchSupporterMilestones(artistProfileId, supporterUserId)
}
