import { isSupabaseConfigured } from '@/lib/supabase/client'
import {
  v1CreateEditorDraft,
  v1CreateSubmission,
  v1GetDeskSubmissions,
  v1GetEditorDrafts,
  v1GetMySubmissions,
  v1GetSubmissionById,
  v1PublishEditorDraft,
  v1ReviewSubmission,
} from '@/api/v1Phase4Client'
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
import { ensureEditorialSlug } from '@/lib/editorial/published'
import { slugifyArtistName } from '@/lib/artist-profile/slug'

export interface CreateSubmissionInput {
  projectName: string
  genre: string
  trackTitle: string
  description: string
  streamUrl: string
  coverImageUrl?: string
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
  coverImageUrl?: string
  spotifyUrl?: string
  youtubeUrl?: string
  galleryImageUrls?: string[]
  artistProfileId?: string
  linkedCommunityPostId?: string
  /** When true, article appears on homepage after publish (default: true for features) */
  featuredOnHomepage?: boolean
}

function now() {
  return new Date().toISOString()
}

export async function createSubmission(
  artist: User,
  input: CreateSubmissionInput
): Promise<TrackSubmission> {
  if (isSupabaseConfigured()) {
    const { submission } = await v1CreateSubmission(input)
    return submission
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
    coverImageUrl: input.coverImageUrl,
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
    const { submissions } = await v1GetMySubmissions()
    return submissions
  }
  return getSubmissions().filter((s) => s.artistId === artistId)
}

export async function getSubmissionsForEditor(): Promise<TrackSubmission[]> {
  if (isSupabaseConfigured()) {
    const { submissions } = await v1GetDeskSubmissions()
    return submissions
  }
  return getSubmissions()
}

export async function reviewSubmission(
  submissionId: string,
  editor: User,
  input: ReviewSubmissionInput
): Promise<TrackSubmission> {
  if (isSupabaseConfigured()) {
    const { submission } = await v1ReviewSubmission({ submissionId, review: input })
    return submission
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
    const { draft } = await v1CreateEditorDraft(input)
    return draft
  }

  const drafts = getDrafts()
  const featuredOnHomepage =
    input.featuredOnHomepage ?? input.type === 'feature'
  const draft: EditorialDraft = {
    id: crypto.randomUUID(),
    editorId: editor.id,
    editorName: editor.name,
    type: input.type,
    title: input.title,
    subject: input.subject,
    body: input.body,
    coverImageUrl: input.coverImageUrl,
    spotifyUrl: input.spotifyUrl?.trim() || undefined,
    youtubeUrl: input.youtubeUrl?.trim() || undefined,
    galleryImageUrls: input.galleryImageUrls?.filter(Boolean),
    artistProfileId: input.artistProfileId,
    linkedCommunityPostId: input.linkedCommunityPostId,
    slug: slugifyArtistName(input.title),
    featuredOnHomepage,
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
    const { drafts } = await v1GetEditorDrafts()
    return drafts
  }
  return getDrafts().filter((d) => d.editorId === editorId)
}

export async function getSubmissionById(id: string) {
  if (isSupabaseConfigured()) {
    const { submission } = await v1GetSubmissionById(id)
    return submission
  }
  return getSubmissions().find((s) => s.id === id) ?? null
}

export async function publishEditorialDraft(draftId: string): Promise<EditorialDraft> {
  if (isSupabaseConfigured()) {
    const { draft } = await v1PublishEditorDraft({ draftId })
    return draft
  }
  const drafts = getDrafts()
  const idx = drafts.findIndex((d) => d.id === draftId)
  if (idx === -1) throw new Error('Draft not found')
  const slug =
    drafts[idx].slug ??
    (await ensureEditorialSlug(drafts[idx].title, drafts[idx].id))
  drafts[idx] = {
    ...drafts[idx],
    slug,
    featuredOnHomepage:
      drafts[idx].featuredOnHomepage ?? drafts[idx].type === 'feature',
    status: 'published',
    publishedAt: now(),
    updatedAt: now(),
  }
  saveDrafts(drafts)
  if (drafts[idx].artistProfileId) {
    const { localLinkEditorial } = await import('@/lib/artist-profile/storage')
    localLinkEditorial(drafts[idx].artistProfileId!, draftId)
  }
  return drafts[idx]
}

export function resolveSessionUser(userId: string) {
  return getUserById(userId)
}
