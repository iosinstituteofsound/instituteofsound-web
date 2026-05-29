/** Label roster on Discover — demo until verified label personas sync here. */

export interface DiscoverLabel {
  id: string
  slug: string
  name: string
  /** e.g. "Left-field electronic" */
  genre: string
  tagline: string
  city: string
  rosterCount: number
  releaseCount: number
  imageUrl?: string
  initials: string
  /** Set when a verified label account is linked (future). */
  profileUserId?: string
  demo?: boolean
}

export interface LabelNetworkStats {
  verifiedLabels: number
  artists: number
  releases: number
  cities: number
}

export const DEMO_DISCOVER_LABELS: DiscoverLabel[] = [
  {
    id: 'demo-1',
    slug: 'midnight-frequency',
    name: 'Midnight Frequency',
    genre: 'Left-field electronic',
    tagline: 'Left-field electronic · Mumbai',
    city: 'Mumbai',
    rosterCount: 12,
    releaseCount: 24,
    initials: 'MF',
    imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=480&fit=crop',
    demo: true,
  },
  {
    id: 'demo-2',
    slug: 'redline-collective',
    name: 'Redline Collective',
    genre: 'Heavy underground',
    tagline: 'Heavy underground · Delhi',
    city: 'Delhi',
    rosterCount: 9,
    releaseCount: 18,
    initials: 'RLC',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=480&fit=crop',
    demo: true,
  },
  {
    id: 'demo-3',
    slug: 'analog-rites',
    name: 'Analog Rites',
    genre: 'Experimental & noise',
    tagline: 'Experimental & noise · Bangalore',
    city: 'Bangalore',
    rosterCount: 6,
    releaseCount: 14,
    initials: 'AR',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=480&fit=crop',
    demo: true,
  },
  {
    id: 'demo-4',
    slug: 'kolkata-wire',
    name: 'Kolkata Wire',
    genre: 'Scene-first imprints',
    tagline: 'Scene-first imprints · Kolkata',
    city: 'Kolkata',
    rosterCount: 9,
    releaseCount: 21,
    initials: 'KW',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=480&fit=crop',
    demo: true,
  },
]

export function labelInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

/** Network-wide totals for the labels footer bar. */
export function labelNetworkStats(labels: DiscoverLabel[]): LabelNetworkStats {
  if (labels.length > 0 && labels.every((l) => l.demo)) {
    return { verifiedLabels: 28, artists: 86, releases: 174, cities: 12 }
  }

  return {
    verifiedLabels: labels.filter((l) => !l.demo).length,
    artists: labels.reduce((s, l) => s + l.rosterCount, 0),
    releases: labels.reduce((s, l) => s + l.releaseCount, 0),
    cities: new Set(labels.map((l) => l.city)).size,
  }
}

/** Merges demo labels with registered label profiles when available. */
export async function listDiscoverLabels(): Promise<DiscoverLabel[]> {
  // TODO: select verified label personas from profiles / verification desk
  return DEMO_DISCOVER_LABELS
}
