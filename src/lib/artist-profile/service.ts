import { isSupabaseConfigured } from '@/lib/supabase/client'
import { getDrafts } from '@/lib/auth/storage'
import type { User } from '@/lib/auth/types'
import type {
  ArtistEditorialFeature,
  ArtistProfile,
  ArtistProfilePageData,
  UpsertAlbumInput,
  UpsertArtistProfileInput,
  UpsertTrackInput,
  UpsertVideoInput,
} from './types'
import * as local from './storage'
import * as sb from './supabaseProfile'

function mapEditorial(
  rows: {
    id: string
    type: string
    title: string
    subject: string
    body: string
    cover_image_url?: string | null
    editor_name: string
    updated_at: string
  }[]
): ArtistEditorialFeature[] {
  return rows.map((r) => ({
    id: r.id,
    type: r.type as ArtistEditorialFeature['type'],
    title: r.title,
    subject: r.subject,
    excerpt: r.body.slice(0, 180) + (r.body.length > 180 ? '…' : ''),
    coverImageUrl: r.cover_image_url ?? undefined,
    editorName: r.editor_name,
    publishedAt: r.updated_at,
  }))
}

function localEditorialForProfile(profileId: string): ArtistEditorialFeature[] {
  const links = local.localGetEditorialLinks()[profileId] ?? []
  return getDrafts()
    .filter(
      (d) =>
        d.status === 'published' &&
        (d.artistProfileId === profileId || links.includes(d.id))
    )
    .map((d) => ({
      id: d.id,
      type: d.type,
      title: d.title,
      subject: d.subject,
      excerpt: d.body.slice(0, 180) + (d.body.length > 180 ? '…' : ''),
      coverImageUrl: d.coverImageUrl,
      editorName: d.editorName,
      publishedAt: d.updatedAt,
    }))
}

export async function getProfileForUser(userId: string): Promise<ArtistProfile | null> {
  if (isSupabaseConfigured()) return sb.supabaseGetProfileByUserId(userId)
  return local.localGetProfileByUserId(userId)
}

export async function upsertArtistProfile(
  user: User,
  input: UpsertArtistProfileInput
): Promise<ArtistProfile> {
  if (isSupabaseConfigured()) return sb.supabaseUpsertProfile(user, input)
  return local.localUpsertProfile(user, input)
}

export async function getArtistProfilePage(slug: string): Promise<ArtistProfilePageData | null> {
  if (isSupabaseConfigured()) {
    const profile = await sb.supabaseGetProfileBySlug(slug)
    if (!profile) return null
    const [tracks, albums, videos, editorialRows] = await Promise.all([
      sb.supabaseGetTracks(profile.id),
      sb.supabaseGetAlbums(profile.id),
      sb.supabaseGetVideos(profile.id),
      sb.supabaseGetEditorialForProfile(profile.id),
    ])
    const albumList = albums.filter((a) => a.releaseType === 'album')
    const singles = albums.filter((a) => a.releaseType === 'single' || a.releaseType === 'ep')
    const pickTrack = profile.artistPickTrackId
      ? tracks.find((t) => t.id === profile.artistPickTrackId)
      : tracks[0]
    return {
      profile,
      tracks,
      albums: albumList,
      singles,
      videos,
      editorial: mapEditorial(editorialRows),
      pickTrack,
    }
  }

  const profile = local.localGetProfileBySlug(slug)
  if (!profile) return null
  return local.localGetPageData(slug, localEditorialForProfile(profile.id))
}

export async function getArtistProfilePageForViewer(
  slug: string,
  viewerId?: string
): Promise<ArtistProfilePageData | null> {
  const data = await getArtistProfilePage(slug)
  if (!data) return null
  if (data.profile.published) return data
  if (viewerId && data.profile.userId === viewerId) return data
  return null
}

export async function addArtistAlbum(profileId: string, input: UpsertAlbumInput) {
  if (isSupabaseConfigured()) return sb.supabaseAddAlbum(profileId, input)
  return local.localAddAlbum(profileId, input)
}

export async function addArtistTrack(profileId: string, input: UpsertTrackInput) {
  if (isSupabaseConfigured()) return sb.supabaseAddTrack(profileId, input)
  return local.localAddTrack(profileId, input)
}

export async function addArtistVideo(profileId: string, input: UpsertVideoInput) {
  if (isSupabaseConfigured()) return sb.supabaseAddVideo(profileId, input)
  return local.localAddVideo(profileId, input)
}

export async function deleteArtistAlbum(id: string) {
  if (isSupabaseConfigured()) return sb.supabaseDeleteAlbum(id)
  local.localDeleteAlbum(id)
}

export async function deleteArtistTrack(id: string) {
  if (isSupabaseConfigured()) return sb.supabaseDeleteTrack(id)
  local.localDeleteTrack(id)
}

export async function deleteArtistVideo(id: string) {
  if (isSupabaseConfigured()) return sb.supabaseDeleteVideo(id)
  local.localDeleteVideo(id)
}

export async function listArtistProfilesForEditor(): Promise<ArtistProfile[]> {
  if (isSupabaseConfigured()) return sb.supabaseListProfilesForEditor()
  return local.localGetProfiles()
}
