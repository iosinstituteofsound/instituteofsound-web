import type { EditorialDraft, TrackSubmission, User, UserRole } from '@/lib/auth/types'

export interface ProfileRow {
  id: string
  email: string
  name: string
  role: UserRole
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
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
