export const RELEASE_TYPES = [
  { id: 'single', label: 'Single' },
  { id: 'ep', label: 'EP' },
  { id: 'album', label: 'Album' },
] as const

export type ReleaseType = (typeof RELEASE_TYPES)[number]['id']

export const INDIA_SCENE_CITIES = [
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Goa',
  'Jaipur',
  'Chandigarh',
] as const

export const SCENE_GENRE_SLUGS = [
  { slug: 'electronic', label: 'Electronic' },
  { slug: 'metal', label: 'Metal' },
  { slug: 'indie', label: 'Indie' },
  { slug: 'hip-hop', label: 'Hip-Hop' },
  { slug: 'rock', label: 'Rock' },
  { slug: 'experimental', label: 'Experimental' },
  { slug: 'jazz', label: 'Jazz' },
  { slug: 'folk', label: 'Folk' },
] as const

export const MILESTONE_KINDS = [
  { id: 'teaser', label: 'Teaser' },
  { id: 'bts', label: 'Behind the scenes' },
  { id: 'preview', label: 'Preview' },
  { id: 'note', label: 'Note' },
] as const
