/** Map submission / review genre strings to community tribe slugs. */
const GENRE_TO_TRIBE: Record<string, string> = {
  industrial: 'industrial',
  techno: 'techno',
  dnb: 'dnb',
  'drum and bass': 'dnb',
  'drum & bass': 'dnb',
  ambient: 'ambient',
  experimental: 'experimental',
  rock: 'rock',
  metal: 'metal',
  'heavy metal': 'metal',
  punk: 'punk',
  'hip-hop': 'hip-hop',
  hiphop: 'hip-hop',
  rap: 'hip-hop',
  house: 'house',
  'bedroom pop': 'bedroom-pop',
  'bedroom-pop': 'bedroom-pop',
  indie: 'indie',
  'indie rock': 'indie',
  electronic: 'electronic',
  edm: 'electronic',
}

export function tribeSlugFromGenreLabel(genre: string | undefined | null): string | null {
  if (!genre?.trim()) return null
  const key = genre.trim().toLowerCase()
  if (GENRE_TO_TRIBE[key]) return GENRE_TO_TRIBE[key]
  for (const [label, slug] of Object.entries(GENRE_TO_TRIBE)) {
    if (key.includes(label)) return slug
  }
  return null
}

export function tribeBoardPath(_slug?: string): string {
  return `/community#genre-board`
}
