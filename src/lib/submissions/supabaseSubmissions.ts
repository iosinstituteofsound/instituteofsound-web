import { getSupabase } from '@/lib/supabase/client'
import { mapDraft, mapSubmission, type DraftRow, type SubmissionRow } from '@/lib/supabase/mappers'
import type { EditorialDraft, TrackSubmission, User } from '@/lib/auth/types'
import type {
  CreateDraftInput,
  CreateSubmissionInput,
  ReviewSubmissionInput,
} from './service'

export async function supabaseCreateSubmission(
  artist: User,
  input: CreateSubmissionInput
): Promise<TrackSubmission> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('track_submissions')
    .insert({
      artist_id: artist.id,
      artist_name: artist.name,
      artist_email: artist.email,
      project_name: input.projectName,
      genre: input.genre,
      track_title: input.trackTitle,
      description: input.description,
      stream_url: input.streamUrl,
      cover_image_url: input.coverImageUrl?.trim() || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapSubmission(data as SubmissionRow)
}

export async function supabaseGetSubmissionsForArtist(
  artistId: string
): Promise<TrackSubmission[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('track_submissions')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as SubmissionRow[]).map(mapSubmission)
}

export async function supabaseGetSubmissionsForEditor(): Promise<TrackSubmission[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('track_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as SubmissionRow[]).map(mapSubmission)
}

export async function supabaseReviewSubmission(
  submissionId: string,
  editor: User,
  input: ReviewSubmissionInput
): Promise<TrackSubmission> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('track_submissions')
    .update({
      status: input.status,
      editor_notes: input.editorNotes?.trim() || null,
      reviewed_by_id: editor.id,
      reviewed_by_name: editor.name,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapSubmission(data as SubmissionRow)
}

export async function supabaseMarkInReview(
  submissionId: string,
  editor: User
): Promise<TrackSubmission> {
  return supabaseReviewSubmission(submissionId, editor, { status: 'in_review' })
}

export async function supabaseCreateDraft(
  editor: User,
  input: CreateDraftInput
): Promise<EditorialDraft> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('editorial_drafts')
    .insert({
      editor_id: editor.id,
      editor_name: editor.name,
      type: input.type,
      title: input.title,
      subject: input.subject,
      body: input.body,
      cover_image_url: input.coverImageUrl?.trim() || null,
      artist_profile_id: input.artistProfileId ?? null,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapDraft(data as DraftRow)
}

export async function supabaseGetDraftsForEditor(
  editorId: string
): Promise<EditorialDraft[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('editorial_drafts')
    .select('*')
    .eq('editor_id', editorId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as DraftRow[]).map(mapDraft)
}

export async function supabasePublishDraft(draftId: string): Promise<EditorialDraft> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('editorial_drafts')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', draftId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapDraft(data as DraftRow)
}

export async function supabaseGetSubmissionById(id: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('track_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapSubmission(data as SubmissionRow) : null
}
