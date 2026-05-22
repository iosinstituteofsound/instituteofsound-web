import type { Artist } from '@/types'
import type { ArtistProfile } from './types'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1511379938549-c8f694227bb0?w=800&q=80&auto=format&fit=crop'

export function profileToDiscoverArtist(profile: ArtistProfile): Artist {
  const genre =
    profile.genres.length > 0
      ? profile.genres.slice(0, 2).join(' / ')
      : 'Artist'
  const description =
    profile.tagline?.trim() ||
    (profile.bio?.trim()
      ? profile.bio.trim().slice(0, 160) + (profile.bio.length > 160 ? '…' : '')
      : '')

  return {
    id: profile.id,
    slug: profile.slug,
    name: profile.displayName,
    genre,
    description: description || 'Artist profile on Institute of Sound.',
    image: profile.avatarUrl?.trim() || profile.bannerUrl?.trim() || FALLBACK_IMAGE,
    featured: false,
  }
}

export function mergeDiscoverArtists(
  liveProfiles: ArtistProfile[],
  legacy: Artist[]
): Artist[] {
  const live = liveProfiles.map(profileToDiscoverArtist)
  const liveSlugs = new Set(live.map((a) => a.slug))
  const archived = legacy.filter((a) => !liveSlugs.has(a.slug))
  return [...live, ...archived]
}
