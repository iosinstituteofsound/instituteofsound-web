import type { SupabaseClient } from '@supabase/supabase-js'
import { mapFeedRow } from '../../../src/lib/community/feedRow.js'
import type { CommunityFeedPost } from '../../../src/lib/community/feedTypes.js'
import type { CrewWarsEntry } from '../../../src/lib/community/wireEvents.js'
import type { LeaderboardEntry } from '../../../src/lib/community/service.js'
import type { SceneEvent } from '../../../src/lib/events/types.js'
import {
  findCityBySlug,
  findGenreBySlug,
} from '../../../src/lib/discovery/sceneRegistry.js'
import type {
  SceneEditorialPick,
  SceneHubData,
  SceneReleaseCard,
} from '../../../src/lib/discovery/sceneService.js'

function mapReleaseRow(row: Record<string, unknown>): SceneReleaseCard {
  return {
    slug: String(row.slug),
    title: String(row.title),
    subtitle: row.subtitle ? String(row.subtitle) : undefined,
    releaseType: String(row.release_type),
    liveAt: String(row.live_at),
    status: String(row.status),
    coverUrl: row.cover_url ? String(row.cover_url) : undefined,
    artistSlug: String(row.artist_slug),
    artistName: String(row.artist_name),
    sceneCity: row.scene_city ? String(row.scene_city) : undefined,
  }
}

function mapLeaderboardRow(row: Record<string, unknown>): LeaderboardEntry {
  const handle = String(row.handle)
  return {
    userId: String(row.user_id),
    name: String(row.display_name),
    handle: handle.startsWith('@') ? handle : `@${handle}`,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    weeklyDb: Number(row.weekly_db),
    totalDb: Number(row.total_db),
    rank: String(row.community_rank) as LeaderboardEntry['rank'],
  }
}

function mapEventRow(row: Record<string, unknown>): SceneEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    eventKind: String(row.event_kind),
    sceneCity: String(row.scene_city),
    sceneGenreSlug: row.scene_genre_slug ? String(row.scene_genre_slug) : undefined,
    venueName: String(row.venue_name),
    startsAt: String(row.starts_at),
    externalUrl: String(row.external_url),
    rsvpCount: Number(row.rsvp_count ?? 0),
    viewerRsvped: Boolean(row.viewer_rsvped),
  }
}

function mapCrewWarsRow(row: Record<string, unknown>): CrewWarsEntry {
  return {
    crewId: String(row.crew_id),
    name: String(row.crew_name),
    slug: String(row.crew_slug),
    tagline: row.tagline ? String(row.tagline) : undefined,
    genreSlug: row.genre_slug ? String(row.genre_slug) : undefined,
    inviteCode: String(row.invite_code),
    memberCount: Number(row.member_count ?? 0),
    weeklyDb: Number(row.weekly_db ?? 0),
    prevWeeklyDb: Number(row.prev_weekly_db ?? 0),
    dbDelta: Number(row.db_delta ?? 0),
    seasonLabel: String(row.season_label ?? ''),
  }
}

async function fetchSceneReleases(
  supabase: SupabaseClient,
  citySlug: string,
  genreSlug: string,
): Promise<SceneReleaseCard[]> {
  const { data, error } = await supabase.rpc('releases_by_scene', {
    p_city_slug: citySlug,
    p_genre_slug: genreSlug,
    lim: 12,
  })
  if (error) return []
  return (data ?? []).map((row: Record<string, unknown>) => mapReleaseRow(row))
}

async function fetchSceneEditorialPick(
  supabase: SupabaseClient,
  citySlug: string,
  genreSlug: string,
): Promise<SceneEditorialPick | null> {
  const { data, error } = await supabase.rpc('scene_editorial_pick', {
    p_city_slug: citySlug,
    p_genre_slug: genreSlug,
  })
  if (error) return null
  const row = (data ?? [])[0] as Record<string, unknown> | undefined
  if (!row?.slug) return null
  return {
    slug: String(row.slug),
    title: String(row.title),
    coverImageUrl: row.cover_image_url ? String(row.cover_image_url) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
  }
}

async function fetchGenreWeeklyLeaderboard(
  supabase: SupabaseClient,
  genreSlug: string,
  limit: number,
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('community_genre_weekly_leaderboard', {
    p_genre_slug: genreSlug,
    lim: limit,
  })
  if (error) return []
  return (data ?? []).map((row: Record<string, unknown>) => mapLeaderboardRow(row))
}

async function fetchTribeRecentSpins(
  supabase: SupabaseClient,
  genreSlug: string,
  limit: number,
): Promise<CommunityFeedPost[]> {
  const { data, error } = await supabase.rpc('community_tribe_recent_spins', {
    p_genre_slug: genreSlug,
    lim: limit,
  })
  if (error) return []
  return (data ?? []).map((row: Record<string, unknown>) => mapFeedRow(row as never))
}

async function fetchCrewWarsV2(
  supabase: SupabaseClient,
  limit: number,
): Promise<CrewWarsEntry[]> {
  const { data, error } = await supabase.rpc('community_crew_wars_v2', { lim: limit })
  if (error) return []
  return (data ?? []).map((row: Record<string, unknown>) => mapCrewWarsRow(row))
}

async function fetchEventsByScene(
  supabase: SupabaseClient,
  citySlug: string,
  genreSlug: string,
  limit: number,
): Promise<SceneEvent[]> {
  const { data, error } = await supabase.rpc('events_by_scene', {
    p_city_slug: citySlug,
    p_genre_slug: genreSlug,
    lim: limit,
  })
  if (error) return []
  return (data ?? []).map((row: Record<string, unknown>) => mapEventRow(row))
}

export async function repoFetchSceneHub(
  supabase: SupabaseClient,
  citySlug: string,
  genreSlug: string,
): Promise<SceneHubData | null> {
  const city = findCityBySlug(citySlug)
  const genre = findGenreBySlug(genreSlug)
  if (!city || !genre) return null

  const [releases, editorialPick, tribeLeaderboard, recentSpins, crews, events] =
    await Promise.all([
      fetchSceneReleases(supabase, citySlug, genreSlug),
      fetchSceneEditorialPick(supabase, citySlug, genreSlug),
      fetchGenreWeeklyLeaderboard(supabase, genreSlug, 10),
      fetchTribeRecentSpins(supabase, genreSlug, 4),
      fetchCrewWarsV2(supabase, 8),
      fetchEventsByScene(supabase, citySlug, genreSlug, 8),
    ])

  const crewsInScene = crews.filter((c) => !c.genreSlug || c.genreSlug === genreSlug)

  return {
    citySlug,
    cityLabel: city.label,
    genreSlug,
    genreLabel: genre.label,
    releases,
    editorialPick,
    tribeLeaderboard,
    recentSpins,
    crews: crewsInScene,
    events,
    rankingNote:
      'Ranked by weekly dB in this taste tribe — not a black-box algorithm. Spins and premieres from people in the scene.',
  }
}
