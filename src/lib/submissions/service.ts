import { isSupabaseConfigured } from '@/lib/supabase/client'
import {
  getDrafts,
  getSubmissions,
  getUserById,
  saveDrafts,
  saveSubmissions,
} from '@/lib/auth/storage'
import type {
  EditorialDraft,
  SubmissionStatus,
  TrackSubmission,
  User,
} from '@/lib/auth/types'
import * as sb from './supabaseSubmissions'

export interface CreateSubmissionInput {
  projectName: string
  genre: string
  trackTitle: string
  description: string
  streamUrl: string
}

export interface ReviewSubmissionInput {
  status: SubmissionStatus
  editorNotes?: string
}

export interface CreateDraftInput {
  type: EditorialDraft['type']
  title: string
  subject: string
  body: string
}

function now() {
  return new Date().toISOString()
}

export async function createSubmission(
  artist: User,
  input: CreateSubmissionInput
): Promise<TrackSubmission> {
  if (isSupabaseConfigured()) {
    return sb.supabaseCreateSubmission(artist, input)
  }

  const submissions = getSubmissions()
  const submission: TrackSubmission = {
    id: crypto.randomUUID(),
    artistId: artist.id,
    artistName: artist.name,
    artistEmail: artist.email,
    projectName: input.projectName,
    genre: input.genre,
    trackTitle: input.trackTitle,
    description: input.description,
    streamUrl: input.streamUrl,
    status: 'pending',
    createdAt: now(),
    updatedAt: now(),
  }
  submissions.unshift(submission)
  saveSubmissions(submissions)
  return submission
}

export async function getSubmissionsForArtist(
  artistId: string
): Promise<TrackSubmission[]> {
  if (isSupabaseConfigured()) {
    return sb.supabaseGetSubmissionsForArtist(artistId)
  }
  return getSubmissions().filter((s) => s.artistId === artistId)
}

export async function getSubmissionsForEditor(): Promise<TrackSubmission[]> {
  if (isSupabaseConfigured()) {
    return sb.supabaseGetSubmissionsForEditor()
  }
  return getSubmissions()
}

export async function reviewSubmission(
  submissionId: string,
  editor: User,
  input: ReviewSubmissionInput
): Promise<TrackSubmission> {
  if (isSupabaseConfigured()) {
    return sb.supabaseReviewSubmission(submissionId, editor, input)
  }

  const submissions = getSubmissions()
  const index = submissions.findIndex((s) => s.id === submissionId)
  if (index === -1) throw new Error('Submission not found')

  submissions[index] = {
    ...submissions[index],
    status: input.status,
    editorNotes: input.editorNotes?.trim() || submissions[index].editorNotes,
    reviewedById: editor.id,
    reviewedByName: editor.name,
    reviewedAt: now(),
    updatedAt: now(),
  }
  saveSubmissions(submissions)
  return submissions[index]
}

export async function markInReview(
  submissionId: string,
  editor: User
): Promise<TrackSubmission> {
  return reviewSubmission(submissionId, editor, { status: 'in_review' })
}

export async function createEditorialDraft(
  editor: User,
  input: CreateDraftInput
): Promise<EditorialDraft> {
  if (isSupabaseConfigured()) {
    return sb.supabaseCreateDraft(editor, input)
  }

  const drafts = getDrafts()
  const draft: EditorialDraft = {
    id: crypto.randomUUID(),
    editorId: editor.id,
    editorName: editor.name,
    type: input.type,
    title: input.title,
    subject: input.subject,
    body: input.body,
    status: 'draft',
    createdAt: now(),
    updatedAt: now(),
  }
  drafts.unshift(draft)
  saveDrafts(drafts)
  return draft
}

export async function getDraftsForEditor(
  editorId: string
): Promise<EditorialDraft[]> {
  if (isSupabaseConfigured()) {
    return sb.supabaseGetDraftsForEditor(editorId)
  }
  return getDrafts().filter((d) => d.editorId === editorId)
}

export async function getSubmissionById(id: string) {
  if (isSupabaseConfigured()) {
    return sb.supabaseGetSubmissionById(id)
  }
  return getSubmissions().find((s) => s.id === id) ?? null
}

export function resolveSessionUser(userId: string) {
  return getUserById(userId)
}
