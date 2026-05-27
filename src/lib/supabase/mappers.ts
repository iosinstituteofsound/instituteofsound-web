import type { EditorialDraft, TrackSubmission, User, UserRole } from '@/lib/auth/types'

export interface ProfileRow {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string | null
  username?: string | null
  bio?: string | null
  created_at: string
}

export interface SubmissionRow {
  id: string
  artist_id: string
  artist_name: string
  artist_email: string
  project_name: string
  genre: string
  track_title: string
  description: string
  stream_url: string
  cover_image_url: string | null
  status: TrackSubmission['status']
  editor_notes: string | null
  reviewed_by_id: string | null
  reviewed_by_name: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface DraftRow {
  id: string
  editor_id: string
  editor_name: string
  type: EditorialDraft['type']
  title: string
  subject: string
  body: string
  cover_image_url: string | null
  spotify_url: string | null
  youtube_url: string | null
  gallery_image_urls: string[] | null
  artist_profile_id: string | null
  linked_community_post_id: string | null
  slug: string | null
  featured_on_homepage: boolean | null
  published_at: string | null
  status: EditorialDraft['status']
  created_at: string
  updated_at: string
}

export function mapProfile(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    avatarUrl: row.avatar_url?.trim() || undefined,
    username: row.username?.trim() || undefined,
    bio: row.bio?.trim() || undefined,
    createdAt: row.created_at,
  }
}

export function mapSubmission(row: SubmissionRow): TrackSubmission {
  return {
    id: row.id,
    artistId: row.artist_id,
    artistName: row.artist_name,
    artistEmail: row.artist_email,
    projectName: row.project_name,
    genre: row.genre,
    trackTitle: row.track_title,
    description: row.description,
    streamUrl: row.stream_url,
    coverImageUrl: row.cover_image_url ?? undefined,
    status: row.status,
    editorNotes: row.editor_notes ?? undefined,
    reviewedById: row.reviewed_by_id ?? undefined,
    reviewedByName: row.reviewed_by_name ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapDraft(row: DraftRow): EditorialDraft {
  return {
    id: row.id,
    editorId: row.editor_id,
    editorName: row.editor_name,
    type: row.type,
    title: row.title,
    subject: row.subject,
    body: row.body,
    coverImageUrl: row.cover_image_url ?? undefined,
    spotifyUrl: row.spotify_url?.trim() || undefined,
    youtubeUrl: row.youtube_url?.trim() || undefined,
    galleryImageUrls:
      row.gallery_image_urls?.filter((u) => u?.trim()).map((u) => u.trim()) ?? undefined,
    artistProfileId: row.artist_profile_id ?? undefined,
    linkedCommunityPostId: row.linked_community_post_id ?? undefined,
    slug: row.slug ?? undefined,
    featuredOnHomepage: row.featured_on_homepage ?? undefined,
    publishedAt: row.published_at ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
