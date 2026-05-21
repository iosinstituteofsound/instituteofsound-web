import type { User } from '@/lib/auth/types'
import type {
  ArtistAlbum,
  ArtistEditorialFeature,
  ArtistProfile,
  ArtistProfilePageData,
  ArtistTrack,
  ArtistVideo,
  UpsertAlbumInput,
  UpsertArtistProfileInput,
  UpsertTrackInput,
  UpsertVideoInput,
} from './types'
import { ensureUniqueSlug, slugifyArtistName } from './slug'

const PROFILES_KEY = 'ios_artist_profiles'
const ALBUMS_KEY = 'ios_artist_albums'
const TRACKS_KEY = 'ios_artist_tracks'
const VIDEOS_KEY = 'ios_artist_videos'
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
  return read<ArtistProfile[]>(PROFILES_KEY, [])
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
    country: input.country,
    social: input.social ?? existing?.social ?? {},
    monthlyListenersDisplay:
      input.monthlyListenersDisplay ?? existing?.monthlyListenersDisplay ?? '—',
    artistPickTrackId:
      input.artistPickTrackId !== undefined
        ? input.artistPickTrackId ?? undefined
        : existing?.artistPickTrackId,
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
  const pickTrack = profile.artistPickTrackId
    ? tracks.find((t) => t.id === profile.artistPickTrackId)
    : tracks[0]

  return {
    profile,
    tracks,
    albums,
    singles,
    videos,
    editorial,
    pickTrack,
  }
}
