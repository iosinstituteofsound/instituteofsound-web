import { SCENE_CITIES, SCENE_GENRES } from '@/lib/discovery/sceneRegistry'

export type DiscoverSceneCardVariant = 'hero' | 'side' | 'tile'

export interface DiscoverSceneHubMeta {
  slug: string
  label: string
  variant: DiscoverSceneCardVariant
  description?: string
  imageUrl: string
  /** Genre slugs shown on card; defaults to all */
  genreSlugs?: string[]
}

/** Verified Unsplash IDs (404 IDs removed) — same query style as playlists.json */
const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=520&q=85`

const HUB_IMAGES: Record<string, { imageUrl: string; description?: string }> = {
  bangalore: {
    imageUrl: IMG('photo-1614613535308-eb5fbd3d2c17'),
    description: 'Underground electronic culture and nightlife.',
  },
  delhi: {
    imageUrl: IMG('photo-1514525253161-7a46d19cd819'),
    description: 'Capital circuits — club, metal, and experimental density.',
  },
  kolkata: { imageUrl: IMG('photo-1558618666-fcd25c85cd64') },
  mumbai: { imageUrl: IMG('photo-1493225457124-a3eb161ffa5f') },
  chandigarh: { imageUrl: IMG('photo-1511379938547-c1f69419868d') },
  chennai: { imageUrl: IMG('photo-1470225620780-dba8ba36b745') },
  jaipur: { imageUrl: IMG('photo-1529156069898-49953e39b3ac') },
  goa: { imageUrl: IMG('photo-1512343879784-a960bf40e7f2') },
  hyderabad: { imageUrl: IMG('photo-1506905925346-21bda4d32df4') },
  pune: { imageUrl: IMG('photo-1511671782779-c97d3d27a1d4') },
}

/** Discover mosaic order — matches Scene Hubs mock */
export const DISCOVER_SCENE_ROWS: DiscoverSceneHubMeta[][] = [
  [
    { slug: 'bangalore', label: 'Bangalore', variant: 'hero', ...HUB_IMAGES.bangalore },
    { slug: 'delhi', label: 'Delhi', variant: 'side', ...HUB_IMAGES.delhi },
  ],
  [
    { slug: 'kolkata', label: 'Kolkata', variant: 'tile', ...HUB_IMAGES.kolkata },
    { slug: 'mumbai', label: 'Mumbai', variant: 'tile', ...HUB_IMAGES.mumbai },
    { slug: 'chandigarh', label: 'Chandigarh', variant: 'tile', ...HUB_IMAGES.chandigarh },
    { slug: 'chennai', label: 'Chennai', variant: 'tile', ...HUB_IMAGES.chennai },
  ],
  [
    { slug: 'jaipur', label: 'Jaipur', variant: 'tile', ...HUB_IMAGES.jaipur },
    { slug: 'goa', label: 'Goa', variant: 'tile', ...HUB_IMAGES.goa },
    { slug: 'hyderabad', label: 'Hyderabad', variant: 'tile', ...HUB_IMAGES.hyderabad },
    { slug: 'pune', label: 'Pune', variant: 'tile', ...HUB_IMAGES.pune },
  ],
]

export function discoverSceneGenres(hub: DiscoverSceneHubMeta) {
  const slugs = hub.genreSlugs ?? SCENE_GENRES.map((g) => g.slug)
  return SCENE_GENRES.filter((g) => slugs.includes(g.slug))
}

export function discoverSceneHubPath(citySlug: string, genreSlug = 'electronic') {
  return `/scenes/${citySlug}/${genreSlug}`
}

export function sceneNetworkStats() {
  return {
    hubs: String(SCENE_CITIES.length),
    artists: '2.1K+',
    releases: '6.8K+',
    events: '420+',
  }
}
