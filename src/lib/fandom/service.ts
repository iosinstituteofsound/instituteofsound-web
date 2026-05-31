import { isV1ApiEnabled } from '@/api/v1Client'
import { v1FetchMyFandom, v1FetchArtistFandom, v1FetchFandomDiscover } from '@/api/v1FandomClient'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  repoFetchArtistContentChampions,
  repoFetchArtistDiscoveryDrivers,
  repoFetchArtistRecentSupport,
  repoFetchArtistSupporters,
  repoFetchDiscoverFromMyFandom,
  repoFetchDiscoverRisingArtists,
  repoFetchMyFandom,
  repoFetchPublicSupporterBadge,
  repoFetchPublicSupporterBadgesForUser,
  repoSearchArtistsForTags,
} from './fandomRepository'
import type {
  FandomDiscoverArtistRow,
  FandomWindow,
  PublicSupporterBadge,
  PublicSupporterBadgeOnArtist,
} from './types'

export async function fetchMyFandom(window: FandomWindow = '90d') {
  if (isV1ApiEnabled()) {
    return v1FetchMyFandom(window)
  }
  if (!isSupabaseConfigured()) return []
  return repoFetchMyFandom(getSupabase(), window)
}

function emptyArtistFandom() {
  return { supporters: [], recent: [], champions: [], drivers: [] }
}

export async function fetchArtistFandom(fandomWindow: FandomWindow = '90d') {
  if (isV1ApiEnabled()) {
    const data = await v1FetchArtistFandom(fandomWindow)
    return {
      supporters: data.supporters ?? [],
      recent: data.recent ?? [],
      champions: data.champions ?? [],
      drivers: data.drivers ?? [],
    }
  }
  if (!isSupabaseConfigured()) {
    return emptyArtistFandom()
  }
  const supabase = getSupabase()
  const [supportersResult, recentResult, championsResult, driversResult] =
    await Promise.allSettled([
      repoFetchArtistSupporters(supabase, fandomWindow),
      repoFetchArtistRecentSupport(supabase),
      repoFetchArtistContentChampions(supabase, fandomWindow),
      repoFetchArtistDiscoveryDrivers(supabase, fandomWindow),
    ])

  if (supportersResult.status === 'rejected' && recentResult.status === 'rejected') {
    throw supportersResult.reason
  }

  return {
    supporters: supportersResult.status === 'fulfilled' ? supportersResult.value : [],
    recent: recentResult.status === 'fulfilled' ? recentResult.value : [],
    champions: championsResult.status === 'fulfilled' ? championsResult.value : [],
    drivers: driversResult.status === 'fulfilled' ? driversResult.value : [],
  }
}

export async function fetchFandomDiscover(): Promise<{
  rising: FandomDiscoverArtistRow[]
  forYou: FandomDiscoverArtistRow[]
}> {
  if (isV1ApiEnabled()) {
    return v1FetchFandomDiscover()
  }
  if (!isSupabaseConfigured()) {
    return { rising: [], forYou: [] }
  }
  const supabase = getSupabase()
  const rising = await repoFetchDiscoverRisingArtists(supabase)
  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
      return { rising, forYou: [] }
    }
    const forYou = await repoFetchDiscoverFromMyFandom(supabase)
    return { rising, forYou }
  } catch {
    return { rising, forYou: [] }
  }
}

export async function searchArtistsForSupportTags(query: string) {
  if (!isSupabaseConfigured()) return []
  return repoSearchArtistsForTags(getSupabase(), query)
}

export async function fetchPublicSupporterBadge(
  artistProfileId: string,
  supporterUserId?: string,
): Promise<PublicSupporterBadge | null> {
  if (!isSupabaseConfigured()) return null
  const badge = await repoFetchPublicSupporterBadge(
    getSupabase(),
    artistProfileId,
    supporterUserId,
  )
  if (!badge?.badgeLabel) return null
  return badge
}

export async function fetchPublicSupporterBadgesForUser(
  supporterUserId: string,
  limit = 8,
): Promise<PublicSupporterBadgeOnArtist[]> {
  if (!isSupabaseConfigured()) return []
  return repoFetchPublicSupporterBadgesForUser(getSupabase(), supporterUserId, limit)
}
