import type { Playlist } from '@/types'

/** Display copy tweaks for Discover playlist list (API data unchanged). */
const LIST_BLURBS: Record<string, string> = {
  'noise-ritual': 'Industrial, noise and harsh frequencies.',
  'underground-protocol': 'Classified transmissions from unmapped scenes.',
  'dark-signal': 'Darkwave, coldwave, and post-punk archives.',
  'neon-afterlife': 'Synthwave drive — cities that never sleep.',
  'future-collapse': 'Metal mayhem and collapse-era heaviness.',
}

export function playlistListBlurb(playlist: Playlist): string {
  return LIST_BLURBS[playlist.slug] ?? playlist.description
}

export function playlistFollowers(slug: string): string {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 31) % 100000
  const n = 400 + (h % 4800)
  const label =
    n >= 1000 ? `${(n / 1000).toFixed(1)}K followers` : `${n} followers`
  return label.toUpperCase()
}

export function formatTrackCount(n: number): string {
  return `${n} tracks`.toUpperCase()
}

/** Featured card — split stat + social line */
export function playlistFollowerDisplay(slug: string): { count: string; following: string } {
  if (slug === 'midnight-frequencies') {
    return { count: '2.3K', following: '+2.3K following' }
  }
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 31) % 100000
  const n = 400 + (h % 4800)
  const count = n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
  return { count, following: `+${count} following` }
}
