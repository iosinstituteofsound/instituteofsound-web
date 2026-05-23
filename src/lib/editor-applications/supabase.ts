import { getSupabase } from '@/lib/supabase/client'
import type {
  EditorApplication,
  EditorApplicationWithProfile,
  SubmitEditorApplicationInput,
} from './types'

type ApplicationRow = {
  id: string
  user_id: string
  portfolio_links: string
  motivation: string
  terms_version: string
  terms_accepted_at: string
  status: EditorApplication['status']
  reviewer_id: string | null
  reviewer_notes: string | null
  reviewed_at: string | null
  congrats_pending: boolean
  created_at: string
  updated_at: string
}

function mapRow(row: ApplicationRow): EditorApplication {
  return {
    id: row.id,
    userId: row.user_id,
    portfolioLinks: row.portfolio_links,
    motivation: row.motivation,
    termsVersion: row.terms_version,
    termsAcceptedAt: row.terms_accepted_at,
    status: row.status,
    reviewerId: row.reviewer_id ?? undefined,
    reviewerNotes: row.reviewer_notes ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    congratsPending: row.congrats_pending,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function supabaseGetMyEditorApplication(
  userId: string
): Promise<EditorApplication | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('editor_applications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapRow(data as ApplicationRow) : null
}

export async function supabaseSubmitEditorApplication(
  userId: string,
  input: SubmitEditorApplicationInput
): Promise<EditorApplication> {
  const supabase = getSupabase()
  const existing = await supabaseGetMyEditorApplication(userId)

  const payload = {
    portfolio_links: input.portfolioLinks.trim(),
    motivation: input.motivation.trim(),
    terms_version: input.termsVersion,
    terms_accepted_at: new Date().toISOString(),
    status: 'pending' as const,
    congrats_pending: false,
    updated_at: new Date().toISOString(),
  }

  if (existing?.status === 'rejected') {
    const { data, error } = await supabase
      .from('editor_applications')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return mapRow(data as ApplicationRow)
  }

  if (existing) {
    throw new Error(
      existing.status === 'pending'
        ? 'Your application is already under review.'
        : 'You are already an approved editor.'
    )
  }

  const { data, error } = await supabase
    .from('editor_applications')
    .insert({
      user_id: userId,
      ...payload,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapRow(data as ApplicationRow)
}

export async function supabaseListEditorApplications(): Promise<
  EditorApplicationWithProfile[]
> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('editor_applications')
    .select(
      `
      *,
      profiles!editor_applications_user_id_fkey ( name, email, username )
    `
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const app = mapRow(row as ApplicationRow)
    const profile = row.profiles as {
      name: string
      email: string
      username: string | null
    } | null
    return {
      ...app,
      applicantName: profile?.name ?? 'Unknown',
      applicantEmail: profile?.email ?? '',
      applicantUsername: profile?.username ?? undefined,
    }
  })
}

export async function supabaseApproveEditorApplication(
  applicationId: string,
  reviewerId: string
): Promise<void> {
  const supabase = getSupabase()
  const { data: app, error: fetchErr } = await supabase
    .from('editor_applications')
    .select('user_id')
    .eq('id', applicationId)
    .single()

  if (fetchErr) throw new Error(fetchErr.message)

  const now = new Date().toISOString()

  const { error: appErr } = await supabase
    .from('editor_applications')
    .update({
      status: 'approved',
      reviewer_id: reviewerId,
      reviewed_at: now,
      congrats_pending: true,
      updated_at: now,
    })
    .eq('id', applicationId)

  if (appErr) throw new Error(appErr.message)

  const { error: roleErr } = await supabase
    .from('profiles')
    .update({ role: 'editor' })
    .eq('id', app.user_id)

  if (roleErr) throw new Error(roleErr.message)
}

export async function supabaseRejectEditorApplication(
  applicationId: string,
  reviewerId: string,
  notes?: string
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('editor_applications')
    .update({
      status: 'rejected',
      reviewer_id: reviewerId,
      reviewer_notes: notes?.trim() || null,
      reviewed_at: new Date().toISOString(),
      congrats_pending: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  if (error) throw new Error(error.message)
}

export async function supabaseAcknowledgeEditorCongrats(userId: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('editor_applications')
    .update({ congrats_pending: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'approved')

  if (error) throw new Error(error.message)
}
