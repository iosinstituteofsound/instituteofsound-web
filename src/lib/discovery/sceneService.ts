import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { fetchGenreWeeklyLeaderboard } from '@/lib/community/service'
import { fetchCrewWarsV2 } from '@/lib/community/wireEvents'
import { fetchTribeRecentSpins } from '@/lib/community/wireHighlights'
import { localListReleasesForScene } from '@/lib/releases/localReleases'
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

export async function fetchSceneHub(
  citySlug: string,
  genreSlug: string
): Promise<SceneHubData | null> {
  const city = findCityBySlug(citySlug)
  const genre = findGenreBySlug(genreSlug)
  if (!city || !genre) return null

  const [releases, editorialPick, tribeLeaderboard, recentSpins, crews] = await Promise.all([
    fetchSceneReleases(citySlug, genreSlug, city.label),
    fetchSceneEditorialPick(citySlug, genreSlug),
    fetchGenreWeeklyLeaderboard(genreSlug, 10),
    fetchTribeRecentSpins(genreSlug, 4),
    fetchCrewWarsV2(8),
  ])

  const crewsInScene = crews.filter(
    (c) => !c.genreSlug || c.genreSlug === genreSlug
  )

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
    rankingNote:
      'Ranked by weekly dB in this taste tribe — not a black-box algorithm. Spins and premieres from people in the scene.',
  }
}
