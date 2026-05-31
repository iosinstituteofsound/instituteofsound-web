import { isV1ApiEnabled } from '@/api/v1Client'
import { v1FetchMyFandom, v1FetchArtistFandom } from '@/api/v1FandomClient'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  repoFetchArtistContentChampions,
  repoFetchArtistRecentSupport,
  repoFetchArtistSupporters,
  repoFetchMyFandom,
  repoSearchArtistsForTags,
} from './fandomRepository'
import type { FandomWindow } from './types'

export async function fetchMyFandom(window: FandomWindow = '90d') {
  if (isV1ApiEnabled()) {
    return v1FetchMyFandom(window)
  }
  if (!isSupabaseConfigured()) return []
  return repoFetchMyFandom(getSupabase(), window)
}

export async function fetchArtistFandom(window: FandomWindow = '90d') {
  if (isV1ApiEnabled()) {
    return v1FetchArtistFandom(window)
  }
  if (!isSupabaseConfigured()) {
    return { supporters: [], recent: [], champions: [] }
  }
  const supabase = getSupabase()
  const [supporters, recent, champions] = await Promise.all([
    repoFetchArtistSupporters(supabase, window),
    repoFetchArtistRecentSupport(supabase),
    repoFetchArtistContentChampions(supabase, window),
  ])
  return { supporters, recent, champions }
}

export async function searchArtistsForSupportTags(query: string) {
  if (!isSupabaseConfigured()) return []
  return repoSearchArtistsForTags(getSupabase(), query)
}
