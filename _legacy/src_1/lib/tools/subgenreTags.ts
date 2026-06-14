export interface TagCategory {
  id: string
  label: string
  tags: string[]
}

export const SUBGENRE_CATEGORIES: TagCategory[] = [
  {
    id: 'metal',
    label: 'Metal core',
    tags: [
      'black metal',
      'death metal',
      'doom metal',
      'sludge',
      'grindcore',
      'metalcore',
      'djent',
      'progressive metal',
      'symphonic metal',
      'folk metal',
      'avant-garde metal',
      'atmospheric black metal',
    ],
  },
  {
    id: 'underground',
    label: 'Underground / extreme',
    tags: [
      'raw black metal',
      'war metal',
      'DSBM',
      'funeral doom',
      'brutal death',
      'technical death',
      'goregrind',
      'powerviolence',
      'crust',
      'd-beat',
      'noise',
      'harsh noise wall',
    ],
  },
  {
    id: 'dark',
    label: 'Dark & cinematic',
    tags: [
      'dark ambient',
      'dungeon synth',
      'witch house',
      'darkwave',
      'post-punk',
      'coldwave',
      'gothic rock',
      'industrial',
      'EBM',
      'ritual ambient',
      'occult rock',
    ],
  },
  {
    id: 'heavy',
    label: 'Heavy alternative',
    tags: [
      'shoegaze',
      'post-metal',
      'stoner rock',
      'stoner doom',
      'hardcore',
      'beatdown',
      'nu-metal revival',
      'alt-metal',
      'prog rock',
      'math rock',
    ],
  },
  {
    id: 'production',
    label: 'Production vibe',
    tags: [
      'lo-fi',
      'raw production',
      'studio polish',
      'live feel',
      'reverb-drenched',
      'analog warmth',
      'digital harsh',
      'wall of sound',
      'sparse mix',
      'double-tracked vocals',
    ],
  },
  {
    id: 'scene',
    label: 'Scene / era',
    tags: [
      '90s underground',
      '00s metalcore',
      'modern heavy',
      'European scene',
      'Nordic black metal',
      'UK doom',
      'US hardcore',
      'Latin heavy',
      'Asian extreme',
      'DIY cassette culture',
    ],
  },
]

export function buildTagCopy(selected: string[], context: 'bio' | 'prompt' | 'submission'): string {
  const list = selected.join(', ')
  if (!list) return ''

  switch (context) {
    case 'bio':
      return `Underground act blending ${list}. For fans of heavy, uncompromising sound.`
    case 'prompt':
      return `Genre tags: ${list}. Production: raw, heavy, cinematic where appropriate. Underground metal aesthetic.`
    case 'submission':
      return `Subgenres: ${list}\nPlatform: Institute of Sound — underground / metal editorial.`
    default:
      return list
  }
}

export function formatHashtags(selected: string[]): string {
  return selected
    .slice(0, 12)
    .map((t) => '#' + t.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
    .join(' ')
}
