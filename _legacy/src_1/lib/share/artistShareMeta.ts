import type { ArtistProfile } from '@/lib/artist-profile/types'
import { resolveAccentColor } from '@/lib/artist-profile/branding'

export interface ArtistShareMeta {
  title: string
  description: string
  canonicalUrl: string
  ogImageUrl: string
  twitterCard: 'summary_large_image'
}

export function buildArtistShareMeta(
  siteUrl: string,
  slug: string,
  profile: Pick<
    ArtistProfile,
    'displayName' | 'tagline' | 'bio' | 'genres' | 'bannerUrl' | 'avatarUrl' | 'accentColor'
  >
): ArtistShareMeta {
  const base = siteUrl.replace(/\/$/, '')
  const canonicalUrl = `${base}/artist/${slug}`
  const genreLine = profile.genres.slice(0, 2).join(' · ')
  const description =
    profile.tagline?.trim() ||
    (profile.bio?.trim()
      ? profile.bio.trim().slice(0, 155) + (profile.bio.length > 155 ? '…' : '')
      : '') ||
    (genreLine ? `${genreLine} — on Institute of Sound` : 'Artist profile on Institute of Sound')

  return {
    title: `${profile.displayName} | Institute of Sound`,
    description,
    canonicalUrl,
    ogImageUrl: `${base}/api/og/artist?slug=${encodeURIComponent(slug)}`,
    twitterCard: 'summary_large_image',
  }
}

export function accentForOg(accent?: string) {
  return resolveAccentColor(accent)
}
