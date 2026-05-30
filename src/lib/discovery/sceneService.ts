import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1GetSceneHub } from '@/api/v1Phase4Client'
import { fetchGenreWeeklyLeaderboard } from '@/lib/community/service'
import { fetchCrewWarsV2 } from '@/lib/community/wireEvents'
import { fetchTribeRecentSpins } from '@/lib/community/wireHighlights'
import { localListReleasesForScene } from '@/lib/releases/localReleases'
import { fetchEventsByScene } from '@/lib/events/service'
import type { SceneEvent } from '@/lib/events/types'
import type { LeaderboardEntry } from '@/lib/community/service'
import type { CrewWarsEntry } from '@/lib/community/wireEvents'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { findCityBySlug, findGenreBySlug } from '@/lib/discovery/sceneRegistry'

export interface SceneReleaseCard {
  slug: string
  title: string
  subtitle?: string
  releaseType: string
  liveAt: string
  status: string
  coverUrl?: string
  artistSlug: string
  artistName: string
  sceneCity?: string
}

export interface SceneEditorialPick {
  slug: string
  title: string
  coverImageUrl?: string
  publishedAt?: string
}

export interface SceneHubData {
  citySlug: string
  cityLabel: string
  genreSlug: string
  genreLabel: string
  releases: SceneReleaseCard[]
  editorialPick: SceneEditorialPick | null
  tribeLeaderboard: LeaderboardEntry[]
  recentSpins: CommunityFeedPost[]
  crews: CrewWarsEntry[]
  events: SceneEvent[]
  rankingNote: string
}

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

async function fetchSceneReleases(
  citySlug: string,
  genreSlug: string,
  cityLabel: string
): Promise<SceneReleaseCard[]> {
  if (!isSupabaseConfigured()) {
    return localListReleasesForScene(cityLabel, genreSlug).map((r) => ({
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle,
      releaseType: r.releaseType,
      liveAt: r.liveAt,
      status: r.status,
      coverUrl: r.coverUrl,
      artistSlug: 'demo',
      artistName: 'Demo Artist',
      sceneCity: r.sceneCity,
    }))
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('releases_by_scene', {
    p_city_slug: citySlug,
    p_genre_slug: genreSlug,
    lim: 12,
  })

  if (error) {
    console.warn('[scene] releases', error.message)
    return []
  }

  return (data ?? []).map(mapReleaseRow)
}

async function fetchSceneEditorialPick(
  citySlug: string,
  genreSlug: string
): Promise<SceneEditorialPick | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('scene_editorial_pick', {
    p_city_slug: citySlug,
    p_genre_slug: genreSlug,
  })

  if (error) {
    console.warn('[scene] editorial pick', error.message)
    return null
  }

  const row = (data ?? [])[0] as Record<string, unknown> | undefined
  if (!row?.slug) return null

  return {
    slug: String(row.slug),
    title: String(row.title),
    coverImageUrl: row.cover_image_url ? String(row.cover_image_url) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
  }
}

async function buildSceneHubDirect(
  citySlug: string,
  genreSlug: string,
  city: NonNullable<ReturnType<typeof findCityBySlug>>,
  genre: NonNullable<ReturnType<typeof findGenreBySlug>>,
): Promise<SceneHubData> {
  const [releases, editorialPick, tribeLeaderboard, recentSpins, crews, events] =
    await Promise.all([
      fetchSceneReleases(citySlug, genreSlug, city.label),
      fetchSceneEditorialPick(citySlug, genreSlug),
      fetchGenreWeeklyLeaderboard(genreSlug, 10),
      fetchTribeRecentSpins(genreSlug, 4),
      fetchCrewWarsV2(8),
      fetchEventsByScene(citySlug, genreSlug, 8),
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

export async function fetchSceneHub(
  citySlug: string,
  genreSlug: string
): Promise<SceneHubData | null> {
  const city = findCityBySlug(citySlug)
  const genre = findGenreBySlug(genreSlug)
  if (!city || !genre) return null

  if (!isSupabaseConfigured()) {
    return buildSceneHubDirect(citySlug, genreSlug, city, genre)
  }

  return viaV1Api(
    async () => {
      const { hub } = await v1GetSceneHub(citySlug, genreSlug)
      return hub
    },
    () => buildSceneHubDirect(citySlug, genreSlug, city, genre),
  )
}
