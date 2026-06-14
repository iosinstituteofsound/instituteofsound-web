import { isSupabaseConfigured } from '@/lib/api/liveMode'
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

async function fetchSceneReleases(
  _citySlug: string,
  genreSlug: string,
  cityLabel: string
): Promise<SceneReleaseCard[]> {
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

async function buildSceneHubDirect(
  citySlug: string,
  genreSlug: string,
  city: NonNullable<ReturnType<typeof findCityBySlug>>,
  genre: NonNullable<ReturnType<typeof findGenreBySlug>>,
): Promise<SceneHubData> {
  const [releases, tribeLeaderboard, recentSpins, crews, events] = await Promise.all([
    fetchSceneReleases(citySlug, genreSlug, city.label),
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
    editorialPick: null,
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

  const { hub } = await v1GetSceneHub(citySlug, genreSlug)
  return hub
}
