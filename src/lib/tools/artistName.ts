const PREFIXES = [
  'Void',
  'Ash',
  'Iron',
  'Grave',
  'Hollow',
  'Static',
  'Crimson',
  'Obsidian',
  'Pale',
  'Ritual',
  'Terminal',
  'Sub',
  'Neon',
  'Cold',
  'Black',
  'Dust',
  'Rust',
  'Glass',
  'Stone',
  'Wire',
]

const CORES = [
  'Cathedral',
  'Signal',
  'Prophet',
  'Cult',
  'Mass',
  'Drone',
  'Relic',
  'Sector',
  'Pulse',
  'Shrine',
  'Wound',
  'Altar',
  'Static',
  'Hymn',
  'Fever',
  'Crown',
  'Veil',
  'Chasm',
  'Oracle',
  'Fracture',
]

const SUFFIXES = [
  '',
  ' IX',
  ' 13',
  ' MMXXI',
  ' Collective',
  ' Doctrine',
  ' Theory',
  ' Archive',
  ' Ritual',
  ' Division',
  ' Circuit',
]

const SINGLE_NAMES = [
  'Nox Arcanum',
  'Pale Meridian',
  'Iron Psalm',
  'Ash Meridian',
  'Hollow Crown',
  'Static Reliquary',
  'Crimson Index',
  'Obsidian Liturgy',
  'Terminal Hymn',
  'Grave Frequency',
  'Cold Transmission',
  'Rust Cathedral',
  'Glass Prophet',
  'Stone Veil',
  'Wire Saint',
  'Subterranean Choir',
  'Black Meridian',
  'Dust Oracle',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function combineName(): string {
  const style = Math.random()
  if (style < 0.35) return pick(SINGLE_NAMES)
  if (style < 0.7) {
    return `${pick(PREFIXES)} ${pick(CORES)}${pick(SUFFIXES)}`.replace(/\s+/g, ' ').trim()
  }
  return `${pick(PREFIXES)}${pick(SUFFIXES) ? ' ' + pick(CORES) : ''}`.trim()
}

export function generateArtistNames(count = 12): string[] {
  const set = new Set<string>()
  let guard = 0
  while (set.size < count && guard < count * 20) {
    set.add(combineName())
    guard++
  }
  return [...set]
}
