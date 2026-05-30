import { slugifyArtistName } from '../artist-profile/slug'
import { INDIA_SCENE_CITIES, SCENE_GENRE_SLUGS } from '../releases/constants'

export interface SceneCity {
  slug: string
  label: string
}

export interface SceneGenre {
  slug: string
  label: string
}

export const SCENE_CITIES: SceneCity[] = INDIA_SCENE_CITIES.map((label) => ({
  label,
  slug: slugifyArtistName(label),
}))

export const SCENE_GENRES: SceneGenre[] = [...SCENE_GENRE_SLUGS]

/** Every India-first hub we surface in nav, sitemap, and /scenes index */
export function sceneHubPaths(): string[] {
  const paths: string[] = []
  for (const c of SCENE_CITIES) {
    for (const g of SCENE_GENRES) {
      paths.push(`/scenes/${c.slug}/${g.slug}`)
    }
  }
  return paths
}

export function findCityBySlug(citySlug: string): SceneCity | undefined {
  return SCENE_CITIES.find((c) => c.slug === citySlug)
}

export function findGenreBySlug(genreSlug: string): SceneGenre | undefined {
  return SCENE_GENRES.find((g) => g.slug === genreSlug)
}

export function isValidSceneHub(citySlug: string, genreSlug: string): boolean {
  return Boolean(findCityBySlug(citySlug) && findGenreBySlug(genreSlug))
}
