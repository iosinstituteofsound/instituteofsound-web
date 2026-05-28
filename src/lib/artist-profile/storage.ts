import type { User } from '@/lib/auth/types'
import type {
  ArtistAlbum,
  ArtistEditorialFeature,
  ArtistProfile,
  ArtistProfilePageData,
  ArtistBioTimelineEntry,
  ArtistLineupEntry,
  ArtistMerchItem,
  ArtistTrack,
  ArtistVideo,
  UpsertAlbumInput,
  UpsertArtistProfileInput,
  UpsertBioTimelineInput,
  UpsertLineupInput,
  UpsertMerchInput,
  UpsertTrackInput,
  UpsertVideoInput,
} from './types'
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_THEME_PRESET,
  resolveAccentColor,
  resolveThemePreset,
} from './branding'
import { resolveHeroLayout } from './heroLayout'
import { normalizeInfluenceTags } from './influences'
import { resolveLineupEntryType } from './lineup'
import { normalizeSocialLinkOrder } from './socialOrder'
import { ensureUniqueSlug, slugifyArtistName } from './slug'

function normalizeManagerHandle(raw?: string): string | undefined {
  const cleaned = (raw ?? '').trim().replace(/^@/, '').toLowerCase()
  return cleaned || undefined
}

const PROFILES_KEY = 'ios_artist_profiles'
const ALBUMS_KEY = 'ios_artist_albums'
const TRACKS_KEY = 'ios_artist_tracks'
const VIDEOS_KEY = 'ios_artist_videos'
const MERCH_KEY = 'ios_artist_merch'
const LINEUP_KEY = 'ios_artist_lineup'
const BIO_TIMELINE_KEY = 'ios_artist_bio_timeline'
const EDITORIAL_LINK_KEY = 'ios_artist_editorial'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function now() {
  return new Date().toISOString()
}

export function localGetProfiles(): ArtistProfile[] {
  return read<Partial<ArtistProfile>[]>(PROFILES_KEY, []).map((p) => ({
    ...(p as ArtistProfile),
    influenceTags: normalizeInfluenceTags((p as ArtistProfile).influenceTags ?? []),
    accentColor: resolveAccentColor((p as ArtistProfile).accentColor),
    themePreset: resolveThemePreset((p as ArtistProfile).themePreset),
    socialLinkOrder: normalizeSocialLinkOrder((p as ArtistProfile).socialLinkOrder),
    heroLayout: resolveHeroLayout((p as ArtistProfile).heroLayout),
  }))
}

export function localListPublishedProfiles(): ArtistProfile[] {
  return localGetProfiles()
    .filter((p) => p.published)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
}

function saveProfiles(profiles: ArtistProfile[]) {
  write(PROFILES_KEY, profiles)
}

export function localGetAlbums(profileId?: string): ArtistAlbum[] {
  const all = read<ArtistAlbum[]>(ALBUMS_KEY, [])
  return profileId ? all.filter((a) => a.profileId === profileId) : all
}

export function localGetTracks(profileId?: string): ArtistTrack[] {
  const all = read<ArtistTrack[]>(TRACKS_KEY, [])
  return profileId ? all.filter((t) => t.profileId === profileId) : all
}

export function localGetVideos(profileId?: string): ArtistVideo[] {
  const all = read<ArtistVideo[]>(VIDEOS_KEY, [])
  return profileId ? all.filter((v) => v.profileId === profileId) : all
}

export function localGetMerch(profileId?: string): ArtistMerchItem[] {
  const all = read<ArtistMerchItem[]>(MERCH_KEY, [])
  return profileId ? all.filter((m) => m.profileId === profileId) : all
}

export function localGetBioTimeline(profileId?: string): ArtistBioTimelineEntry[] {
  const all = read<ArtistBioTimelineEntry[]>(BIO_TIMELINE_KEY, [])
  const list = profileId ? all.filter((e) => e.profileId === profileId) : all
  return list.sort((a, b) => a.year - b.year || a.sortOrder - b.sortOrder)
}

export function localGetLineup(profileId?: string): ArtistLineupEntry[] {
  const all = read<ArtistLineupEntry[]>(LINEUP_KEY, [])
  const list = profileId ? all.filter((e) => e.profileId === profileId) : all
  return list
    .map((e) => ({ ...e, entryType: resolveLineupEntryType(e.entryType) }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function localGetEditorialLinks(): Record<string, string[]> {
  return read<Record<string, string[]>>(EDITORIAL_LINK_KEY, {})
}

export function localGetProfileByUserId(userId: string): ArtistProfile | null {
  return localGetProfiles().find((p) => p.userId === userId) ?? null
}

export function localGetProfileBySlug(slug: string): ArtistProfile | null {
  return localGetProfiles().find((p) => p.slug === slug) ?? null
}

export function localUpsertProfile(
  user: User,
  input: UpsertArtistProfileInput
): ArtistProfile {
  const profiles = localGetProfiles()
  const existing = profiles.find((p) => p.userId === user.id)
  const slugs = profiles.filter((p) => p.userId !== user.id).map((p) => p.slug)
  const rawSlug =
    input.slug?.trim() ||
    existing?.slug ||
    ensureUniqueSlug(input.displayName || user.name, slugs)
  const finalSlug = slugifyArtistName(rawSlug)

  const profile: ArtistProfile = {
    id: existing?.id ?? crypto.randomUUID(),
    userId: user.id,
    slug: finalSlug,
    displayName: input.displayName.trim() || user.name,
    tagline: input.tagline,
    bio: input.bio,
    avatarUrl: input.avatarUrl,
    bannerUrl: input.bannerUrl,
    logoUrl: input.logoUrl,
    genres: input.genres ?? existing?.genres ?? [],
    influenceTags:
      input.influenceTags !== undefined
        ? normalizeInfluenceTags(input.influenceTags)
        : normalizeInfluenceTags(existing?.influenceTags ?? []),
    country: input.country,
    artistManagerName:
      input.artistManagerName !== undefined
        ? input.artistManagerName?.trim() || undefined
        : existing?.artistManagerName,
    artistManagerHandle:
      input.artistManagerHandle !== undefined
        ? normalizeManagerHandle(input.artistManagerHandle)
        : existing?.artistManagerHandle,
    social: input.social ?? existing?.social ?? {},
    monthlyListenersDisplay:
      input.monthlyListenersDisplay ?? existing?.monthlyListenersDisplay ?? '—',
    artistPickTrackId:
      input.artistPickTrackId !== undefined
        ? input.artistPickTrackId ?? undefined
        : existing?.artistPickTrackId,
    accentColor:
      input.accentColor !== undefined
        ? resolveAccentColor(input.accentColor)
        : resolveAccentColor(existing?.accentColor ?? DEFAULT_ACCENT_COLOR),
    themePreset:
      input.themePreset !== undefined
        ? resolveThemePreset(input.themePreset)
        : resolveThemePreset(existing?.themePreset ?? DEFAULT_THEME_PRESET),
    heroVideoUrl:
      input.heroVideoUrl !== undefined
        ? input.heroVideoUrl?.trim() || undefined
        : existing?.heroVideoUrl,
    heroLayout:
      input.heroLayout !== undefined
        ? resolveHeroLayout(input.heroLayout)
        : resolveHeroLayout(existing?.heroLayout),
    socialLinkOrder:
      input.socialLinkOrder !== undefined
        ? normalizeSocialLinkOrder(input.socialLinkOrder)
        : normalizeSocialLinkOrder(existing?.socialLinkOrder),
    pressKitUrl:
      input.pressKitUrl !== undefined
        ? input.pressKitUrl?.trim() || undefined
        : existing?.pressKitUrl,
    pressKitLabel:
      input.pressKitLabel !== undefined
        ? input.pressKitLabel?.trim() || undefined
        : existing?.pressKitLabel,
    published: input.published ?? existing?.published ?? false,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  }

  if (existing) {
    const idx = profiles.findIndex((p) => p.id === existing.id)
    profiles[idx] = profile
  } else {
    profiles.push(profile)
  }
  saveProfiles(profiles)
  return profile
}

export function localListManagedArtistsByHandle(
  handle: string
): {
  profileId: string
  slug: string
  displayName: string
  tagline?: string
  avatarUrl?: string
}[] {
  const managerHandle = normalizeManagerHandle(handle)
  if (!managerHandle) return []
  return localGetProfiles()
    .filter((p) => p.published && p.artistManagerHandle === managerHandle)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((p) => ({
      profileId: p.id,
      slug: p.slug,
      displayName: p.displayName,
      tagline: p.tagline,
      avatarUrl: p.avatarUrl,
    }))
}

export function localAddAlbum(profileId: string, input: UpsertAlbumInput): ArtistAlbum {
  const albums = localGetAlbums()
  const album: ArtistAlbum = {
    id: crypto.randomUUID(),
    profileId,
    title: input.title,
    coverUrl: input.coverUrl,
    releaseYear: input.releaseYear,
    releaseType: input.releaseType,
    sortOrder: albums.filter((a) => a.profileId === profileId).length,
    createdAt: now(),
  }
  albums.push(album)
  write(ALBUMS_KEY, albums)
  return album
}

export function localAddTrack(profileId: string, input: UpsertTrackInput): ArtistTrack {
  const tracks = localGetTracks()
  const track: ArtistTrack = {
    id: crypto.randomUUID(),
    profileId,
    albumId: input.albumId,
    title: input.title,
    streamUrl: input.streamUrl,
    coverUrl: input.coverUrl,
    playCount: input.playCount ?? Math.floor(Math.random() * 50000) + 1000,
    sortOrder: tracks.filter((t) => t.profileId === profileId).length,
    createdAt: now(),
  }
  tracks.push(track)
  write(TRACKS_KEY, tracks)
  return track
}

export function localAddMerch(profileId: string, input: UpsertMerchInput): ArtistMerchItem {
  const items = localGetMerch()
  const item: ArtistMerchItem = {
    id: crypto.randomUUID(),
    profileId,
    title: input.title.trim(),
    productUrl: input.productUrl.trim(),
    imageUrl: input.imageUrl?.trim() || undefined,
    priceDisplay: input.priceDisplay?.trim() || undefined,
    showPrice: input.showPrice ?? true,
    sortOrder: items.filter((m) => m.profileId === profileId).length,
    createdAt: now(),
  }
  items.push(item)
  write(MERCH_KEY, items)
  return item
}

export function localUpdateMerch(merchId: string, input: UpsertMerchInput): ArtistMerchItem {
  const items = localGetMerch()
  const idx = items.findIndex((m) => m.id === merchId)
  if (idx < 0) throw new Error('Merch item not found')
  const existing = items[idx]
  const updated: ArtistMerchItem = {
    ...existing,
    title: input.title.trim() || existing.title,
    productUrl: input.productUrl.trim() || existing.productUrl,
    imageUrl: input.imageUrl !== undefined ? input.imageUrl?.trim() || undefined : existing.imageUrl,
    priceDisplay:
      input.priceDisplay !== undefined
        ? input.priceDisplay?.trim() || undefined
        : existing.priceDisplay,
    showPrice: input.showPrice ?? existing.showPrice,
  }
  items[idx] = updated
  write(MERCH_KEY, items)
  return updated
}

export function localDeleteMerch(id: string) {
  write(
    MERCH_KEY,
    localGetMerch().filter((m) => m.id !== id)
  )
}

export function localAddLineup(profileId: string, input: UpsertLineupInput): ArtistLineupEntry {
  const entries = localGetLineup()
  const entry: ArtistLineupEntry = {
    id: crypto.randomUUID(),
    profileId,
    name: input.name.trim(),
    role: input.role.trim(),
    entryType: resolveLineupEntryType(input.entryType),
    sortOrder: entries.filter((e) => e.profileId === profileId).length,
    createdAt: now(),
  }
  const all = read<ArtistLineupEntry[]>(LINEUP_KEY, [])
  all.push(entry)
  write(LINEUP_KEY, all)
  return entry
}

export function localUpdateLineup(entryId: string, input: UpsertLineupInput): ArtistLineupEntry {
  const all = read<ArtistLineupEntry[]>(LINEUP_KEY, [])
  const idx = all.findIndex((e) => e.id === entryId)
  if (idx < 0) throw new Error('Lineup entry not found')
  const existing = all[idx]
  const updated: ArtistLineupEntry = {
    ...existing,
    name: input.name.trim() || existing.name,
    role: input.role.trim() || existing.role,
    entryType: input.entryType !== undefined ? resolveLineupEntryType(input.entryType) : existing.entryType,
  }
  all[idx] = updated
  write(LINEUP_KEY, all)
  return updated
}

export function localDeleteLineup(id: string) {
  write(
    LINEUP_KEY,
    read<ArtistLineupEntry[]>(LINEUP_KEY, []).filter((e) => e.id !== id)
  )
}

export function localAddBioTimeline(
  profileId: string,
  input: UpsertBioTimelineInput
): ArtistBioTimelineEntry {
  const all = read<ArtistBioTimelineEntry[]>(BIO_TIMELINE_KEY, [])
  const entry: ArtistBioTimelineEntry = {
    id: crypto.randomUUID(),
    profileId,
    year: input.year,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    sortOrder: all.filter((e) => e.profileId === profileId).length,
    createdAt: now(),
  }
  all.push(entry)
  write(BIO_TIMELINE_KEY, all)
  return entry
}

export function localUpdateBioTimeline(
  entryId: string,
  input: UpsertBioTimelineInput
): ArtistBioTimelineEntry {
  const all = read<ArtistBioTimelineEntry[]>(BIO_TIMELINE_KEY, [])
  const idx = all.findIndex((e) => e.id === entryId)
  if (idx < 0) throw new Error('Timeline entry not found')
  const existing = all[idx]
  const updated: ArtistBioTimelineEntry = {
    ...existing,
    year: input.year,
    title: input.title.trim() || existing.title,
    description:
      input.description !== undefined
        ? input.description?.trim() || undefined
        : existing.description,
  }
  all[idx] = updated
  write(BIO_TIMELINE_KEY, all)
  return updated
}

export function localDeleteBioTimeline(id: string) {
  write(
    BIO_TIMELINE_KEY,
    read<ArtistBioTimelineEntry[]>(BIO_TIMELINE_KEY, []).filter((e) => e.id !== id)
  )
}

export function localAddVideo(profileId: string, input: UpsertVideoInput): ArtistVideo {
  const videos = localGetVideos()
  const video: ArtistVideo = {
    id: crypto.randomUUID(),
    profileId,
    title: input.title,
    videoUrl: input.videoUrl,
    thumbnailUrl: input.thumbnailUrl,
    sortOrder: videos.filter((v) => v.profileId === profileId).length,
    createdAt: now(),
  }
  videos.push(video)
  write(VIDEOS_KEY, videos)
  return video
}

export function localUpdateTrack(trackId: string, input: UpsertTrackInput): ArtistTrack {
  const tracks = localGetTracks()
  const idx = tracks.findIndex((t) => t.id === trackId)
  if (idx < 0) throw new Error('Track not found')
  const existing = tracks[idx]
  const updated: ArtistTrack = {
    ...existing,
    title: input.title.trim() || existing.title,
    streamUrl: input.streamUrl.trim() || existing.streamUrl,
    coverUrl: input.coverUrl,
    playCount: input.playCount ?? existing.playCount,
    albumId: input.albumId,
  }
  tracks[idx] = updated
  write(TRACKS_KEY, tracks)
  return updated
}

export function localUpdateAlbum(albumId: string, input: UpsertAlbumInput): ArtistAlbum {
  const albums = localGetAlbums()
  const idx = albums.findIndex((a) => a.id === albumId)
  if (idx < 0) throw new Error('Album not found')
  const existing = albums[idx]
  const updated: ArtistAlbum = {
    ...existing,
    title: input.title.trim() || existing.title,
    coverUrl: input.coverUrl,
    releaseYear: input.releaseYear,
    releaseType: input.releaseType,
  }
  albums[idx] = updated
  write(ALBUMS_KEY, albums)
  return updated
}

export function localUpdateVideo(videoId: string, input: UpsertVideoInput): ArtistVideo {
  const videos = localGetVideos()
  const idx = videos.findIndex((v) => v.id === videoId)
  if (idx < 0) throw new Error('Video not found')
  const existing = videos[idx]
  const updated: ArtistVideo = {
    ...existing,
    title: input.title.trim() || existing.title,
    videoUrl: input.videoUrl.trim() || existing.videoUrl,
    thumbnailUrl: input.thumbnailUrl,
  }
  videos[idx] = updated
  write(VIDEOS_KEY, videos)
  return updated
}

export function localDeleteAlbum(id: string) {
  write(
    ALBUMS_KEY,
    localGetAlbums().filter((a) => a.id !== id)
  )
}

export function localDeleteTrack(id: string) {
  write(
    TRACKS_KEY,
    localGetTracks().filter((t) => t.id !== id)
  )
}

export function localDeleteVideo(id: string) {
  write(
    VIDEOS_KEY,
    localGetVideos().filter((v) => v.id !== id)
  )
}

export function localLinkEditorial(profileId: string, draftId: string) {
  const links = localGetEditorialLinks()
  const list = links[profileId] ?? []
  if (!list.includes(draftId)) list.push(draftId)
  links[profileId] = list
  write(EDITORIAL_LINK_KEY, links)
}

export function localGetPageData(
  slug: string,
  editorial: ArtistEditorialFeature[] = []
): ArtistProfilePageData | null {
  const profile = localGetProfileBySlug(slug)
  if (!profile) return null

  const tracks = localGetTracks(profile.id).sort((a, b) => b.playCount - a.playCount)
  const albums = localGetAlbums(profile.id).filter((a) => a.releaseType === 'album')
  const singles = localGetAlbums(profile.id).filter(
    (a) => a.releaseType === 'single' || a.releaseType === 'ep'
  )
  const videos = localGetVideos(profile.id)
  const merch = localGetMerch(profile.id)
  const lineup = localGetLineup(profile.id)
  const bioTimeline = localGetBioTimeline(profile.id)
  const pickTrack = profile.artistPickTrackId
    ? tracks.find((t) => t.id === profile.artistPickTrackId)
    : tracks[0]

  return {
    profile,
    tracks,
    albums,
    singles,
    videos,
    merch,
    lineup,
    bioTimeline,
    editorial,
    pickTrack,
  }
}
