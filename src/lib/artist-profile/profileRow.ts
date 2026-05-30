import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_THEME_PRESET,
  normalizeAccentColor,
  resolveThemePreset,
} from './branding'
import { DEFAULT_HERO_LAYOUT, resolveHeroLayout } from './heroLayout'
import { normalizeInfluenceTags } from './influences'
import { normalizeSocialLinkOrder } from './socialOrder'
import type { ArtistProfile, UpsertArtistProfileInput } from './types'

export type ArtistProfileRow = {
  id: string
  user_id: string
  slug: string
  display_name: string
  tagline: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  logo_url: string | null
  genres: string[] | null
  influence_tags: string[] | null
  country: string | null
  artist_manager_name: string | null
  artist_manager_handle: string | null
  website_url: string | null
  spotify_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  bandcamp_url: string | null
  monthly_listeners_display: string | null
  artist_pick_track_id: string | null
  accent_color: string | null
  theme_preset: string | null
  hero_video_url: string | null
  hero_layout: string | null
  social_link_order: string[] | null
  press_kit_url: string | null
  press_kit_label: string | null
  published: boolean
  page_status?: string | null
  page_refreshed_at?: string | null
  last_activity_at?: string | null
  created_at: string
  updated_at: string
}

export function normalizeManagerHandle(raw?: string | null): string | null {
  const cleaned = (raw ?? '').trim().replace(/^@/, '').toLowerCase()
  return cleaned || null
}

export function mapArtistProfileRow(row: ArtistProfileRow): ArtistProfile {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    displayName: row.display_name,
    tagline: row.tagline ?? undefined,
    bio: row.bio ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    bannerUrl: row.banner_url ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    genres: row.genres ?? [],
    influenceTags: normalizeInfluenceTags(row.influence_tags ?? []),
    country: row.country ?? undefined,
    artistManagerName: row.artist_manager_name ?? undefined,
    artistManagerHandle: row.artist_manager_handle ?? undefined,
    social: {
      website: row.website_url ?? undefined,
      spotify: row.spotify_url ?? undefined,
      youtube: row.youtube_url ?? undefined,
      instagram: row.instagram_url ?? undefined,
      facebook: row.facebook_url ?? undefined,
      bandcamp: row.bandcamp_url ?? undefined,
    },
    monthlyListenersDisplay: row.monthly_listeners_display ?? '—',
    artistPickTrackId: row.artist_pick_track_id ?? undefined,
    accentColor: row.accent_color ?? DEFAULT_ACCENT_COLOR,
    themePreset: resolveThemePreset(row.theme_preset),
    heroVideoUrl: row.hero_video_url ?? undefined,
    heroLayout: resolveHeroLayout(row.hero_layout),
    socialLinkOrder: normalizeSocialLinkOrder(row.social_link_order),
    pressKitUrl: row.press_kit_url ?? undefined,
    pressKitLabel: row.press_kit_label ?? undefined,
    published: row.published,
    pageStatus: row.page_status === 'live' ? 'live' : 'pending',
    pageRefreshedAt: row.page_refreshed_at ?? row.updated_at,
    lastActivityAt: row.last_activity_at ?? row.page_refreshed_at ?? row.updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export type ArtistProfileOwner = { id: string; name: string }

export function buildArtistProfileDbRow(
  input: UpsertArtistProfileInput,
  user: ArtistProfileOwner,
) {
  const social = input.social ?? {}
  return {
    display_name: input.displayName.trim() || user.name,
    tagline: input.tagline?.trim() || null,
    bio: input.bio?.trim() || null,
    avatar_url: input.avatarUrl?.trim() || null,
    banner_url: input.bannerUrl?.trim() || null,
    logo_url: input.logoUrl?.trim() || null,
    genres: input.genres ?? [],
    influence_tags: normalizeInfluenceTags(input.influenceTags ?? []),
    country: input.country?.trim() || null,
    artist_manager_name: input.artistManagerName?.trim() || null,
    artist_manager_handle: normalizeManagerHandle(input.artistManagerHandle),
    website_url: social.website?.trim() || null,
    spotify_url: social.spotify?.trim() || null,
    youtube_url: social.youtube?.trim() || null,
    instagram_url: social.instagram?.trim() || null,
    facebook_url: social.facebook?.trim() || null,
    bandcamp_url: social.bandcamp?.trim() || null,
    monthly_listeners_display: input.monthlyListenersDisplay?.trim() || '—',
    artist_pick_track_id: input.artistPickTrackId ?? null,
    accent_color: normalizeAccentColor(input.accentColor ?? '') ?? DEFAULT_ACCENT_COLOR,
    theme_preset: input.themePreset ?? DEFAULT_THEME_PRESET,
    hero_video_url: input.heroVideoUrl?.trim() || null,
    hero_layout: input.heroLayout ?? DEFAULT_HERO_LAYOUT,
    social_link_order: normalizeSocialLinkOrder(input.socialLinkOrder),
    press_kit_url: input.pressKitUrl?.trim() || null,
    press_kit_label: input.pressKitLabel?.trim() || null,
    published: input.published ?? false,
    page_status: input.pageStatus ?? (input.published ? 'live' : 'pending'),
    page_refreshed_at: input.pageRefreshedAt ?? input.lastActivityAt ?? new Date().toISOString(),
    last_activity_at: input.lastActivityAt ?? input.pageRefreshedAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}
