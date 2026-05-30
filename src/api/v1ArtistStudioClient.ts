import { v1Fetch } from '@/api/v1Client'
import type {
  ArtistAlbum,
  ArtistBioTimelineEntry,
  ArtistLineupEntry,
  ArtistMerchItem,
  ArtistProfile,
  ArtistTrack,
  ArtistVideo,
  ManagedArtistSummary,
  UpsertAlbumInput,
  UpsertBioTimelineInput,
  UpsertLineupInput,
  UpsertMerchInput,
  UpsertTrackInput,
  UpsertVideoInput,
} from '@/lib/artist-profile/types'

export type ArtistPageApiPayload = {
  profile: ArtistProfile
  tracks: ArtistTrack[]
  albums: ArtistAlbum[]
  singles: ArtistAlbum[]
  videos: ArtistVideo[]
  merch: ArtistMerchItem[]
  lineup: ArtistLineupEntry[]
  bioTimeline: ArtistBioTimelineEntry[]
  editorialRows: {
    id: string
    slug: string | null
    type: string
    title: string
    subject: string
    body: string
    cover_image_url: string | null
    editor_id: string
    editor_name: string
    updated_at: string
  }[]
}

export async function v1GetArtistPage(slug: string): Promise<{ page: ArtistPageApiPayload | null }> {
  const params = new URLSearchParams({ slug })
  return v1Fetch(`/artist/page?${params}`, { auth: 'optional' })
}

export async function v1ListManagedArtists(handle: string): Promise<{ artists: ManagedArtistSummary[] }> {
  const params = new URLSearchParams({ handle })
  return v1Fetch(`/artist/managed?${params}`, { auth: 'optional' })
}

export async function v1AddArtistAlbum(input: {
  profileId: string
  input: UpsertAlbumInput
}): Promise<{ album: ArtistAlbum }> {
  return v1Fetch('/artist/albums', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1UpdateArtistAlbum(input: {
  albumId: string
  input: UpsertAlbumInput
}): Promise<{ album: ArtistAlbum }> {
  return v1Fetch('/artist/albums', { method: 'PATCH', body: JSON.stringify(input) })
}

export async function v1DeleteArtistAlbum(albumId: string): Promise<void> {
  await v1Fetch('/artist/albums', { method: 'DELETE', body: JSON.stringify({ albumId }) })
}

export async function v1AddArtistTrack(input: {
  profileId: string
  input: UpsertTrackInput
}): Promise<{ track: ArtistTrack }> {
  return v1Fetch('/artist/tracks', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1UpdateArtistTrack(input: {
  trackId: string
  input: UpsertTrackInput
}): Promise<{ track: ArtistTrack }> {
  return v1Fetch('/artist/tracks', { method: 'PATCH', body: JSON.stringify(input) })
}

export async function v1DeleteArtistTrack(trackId: string): Promise<void> {
  await v1Fetch('/artist/tracks', { method: 'DELETE', body: JSON.stringify({ trackId }) })
}

export async function v1AddArtistVideo(input: {
  profileId: string
  input: UpsertVideoInput
}): Promise<{ video: ArtistVideo }> {
  return v1Fetch('/artist/videos', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1UpdateArtistVideo(input: {
  videoId: string
  input: UpsertVideoInput
}): Promise<{ video: ArtistVideo }> {
  return v1Fetch('/artist/videos', { method: 'PATCH', body: JSON.stringify(input) })
}

export async function v1DeleteArtistVideo(videoId: string): Promise<void> {
  await v1Fetch('/artist/videos', { method: 'DELETE', body: JSON.stringify({ videoId }) })
}

export async function v1AddArtistMerch(input: {
  profileId: string
  input: UpsertMerchInput
}): Promise<{ merch: ArtistMerchItem }> {
  return v1Fetch('/artist/merch', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1UpdateArtistMerch(input: {
  merchId: string
  input: UpsertMerchInput
}): Promise<{ merch: ArtistMerchItem }> {
  return v1Fetch('/artist/merch', { method: 'PATCH', body: JSON.stringify(input) })
}

export async function v1DeleteArtistMerch(merchId: string): Promise<void> {
  await v1Fetch('/artist/merch', { method: 'DELETE', body: JSON.stringify({ merchId }) })
}

export async function v1AddArtistLineup(input: {
  profileId: string
  input: UpsertLineupInput
}): Promise<{ entry: ArtistLineupEntry }> {
  return v1Fetch('/artist/lineup', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1UpdateArtistLineup(input: {
  entryId: string
  input: UpsertLineupInput
}): Promise<{ entry: ArtistLineupEntry }> {
  return v1Fetch('/artist/lineup', { method: 'PATCH', body: JSON.stringify(input) })
}

export async function v1DeleteArtistLineup(entryId: string): Promise<void> {
  await v1Fetch('/artist/lineup', { method: 'DELETE', body: JSON.stringify({ entryId }) })
}

export async function v1AddArtistBioTimeline(input: {
  profileId: string
  input: UpsertBioTimelineInput
}): Promise<{ entry: ArtistBioTimelineEntry }> {
  return v1Fetch('/artist/bio-timeline', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1UpdateArtistBioTimeline(input: {
  entryId: string
  input: UpsertBioTimelineInput
}): Promise<{ entry: ArtistBioTimelineEntry }> {
  return v1Fetch('/artist/bio-timeline', { method: 'PATCH', body: JSON.stringify(input) })
}

export async function v1DeleteArtistBioTimeline(entryId: string): Promise<void> {
  await v1Fetch('/artist/bio-timeline', { method: 'DELETE', body: JSON.stringify({ entryId }) })
}
