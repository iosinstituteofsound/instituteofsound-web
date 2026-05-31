import type {
  PlaylistCuratorApplication,
  SubmitPlaylistCuratorInput,
} from '../../../src/lib/playlistCurator/types.js'
import { validatePlaylistCuratorInput } from '../../../src/lib/playlistCurator/validate.js'
import { requireAuth } from '../auth.js'
import { requireSuperEditor } from '../requireDesk.js'
import { methodNotAllowed, queryParam, type ApiRequest, type ApiResponse } from '../http.js'
import { requireValidatedBody } from '../validate.js'
import { playlistCuratorDeskReviewBody, playlistCuratorSubmitBody } from '../schemas/v1Bodies.js'
import { createSupabaseUserClient } from '../supabaseServer.js'

function mapRow(row: Record<string, unknown>): PlaylistCuratorApplication {
  const profile = row.profile as { name?: string; username?: string } | null | undefined
  return {
    id: String(row.id),
    userId: String(row.user_id),
    userName: profile?.name ?? undefined,
    userHandle: profile?.username ?? undefined,
    playlistLinks: (row.playlist_links as string[]) ?? [],
    note: row.note ? String(row.note) : undefined,
    status: row.status as PlaylistCuratorApplication['status'],
    reviewNotes: row.review_notes ? String(row.review_notes) : undefined,
    reviewedBy: row.reviewed_by ? String(row.reviewed_by) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export async function handleV1PlaylistCurator(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith('/api/v1/playlist-curator')) return false

  if (pathname === '/api/v1/playlist-curator/desk/applications') {
    if (req.method === 'GET') {
      await handleDeskList(req, res)
      return true
    }
    if (req.method === 'PATCH') {
      await handleDeskReview(req, res)
      return true
    }
    methodNotAllowed(res, ['GET', 'PATCH'])
    return true
  }

  if (pathname === '/api/v1/playlist-curator/applications') {
    if (req.method === 'GET') {
      await handleMyApplications(req, res)
      return true
    }
    if (req.method === 'POST') {
      await handleSubmit(req, res)
      return true
    }
    methodNotAllowed(res, ['GET', 'POST'])
    return true
  }

  res.status(404).json({ error: 'Not found' })
  return true
}

async function handleMyApplications(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const { data, error } = await supabase
      .from('playlist_curator_applications')
      .select('*')
      .eq('user_id', auth.authUser.id)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    const applications = (data ?? []).map((row) => mapRow(row as Record<string, unknown>))
    return res.status(200).json({ applications })
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to load applications',
    })
  }
}

async function handleSubmit(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const body = requireValidatedBody(res, playlistCuratorSubmitBody, req.body)
  if (!body) return
  const err = validatePlaylistCuratorInput(body as unknown as SubmitPlaylistCuratorInput)
  if (err) return res.status(400).json({ error: err })

  const links = body.playlistLinks.map((l) => l.trim()).filter(Boolean)
  const note = body.note?.trim() || null
  const supabase = createSupabaseUserClient(auth.accessToken)

  try {
    const { data: existing, error: listErr } = await supabase
      .from('playlist_curator_applications')
      .select('status')
      .eq('user_id', auth.authUser.id)
    if (listErr) throw new Error(listErr.message)
    if ((existing ?? []).some((r) => r.status === 'pending')) {
      throw new Error('You already have a playlist curator application under review.')
    }
    if ((existing ?? []).some((r) => r.status === 'approved')) {
      throw new Error('You are already an approved playlist curator.')
    }

    const { error } = await supabase.from('playlist_curator_applications').insert({
      user_id: auth.authUser.id,
      playlist_links: links,
      note,
      status: 'pending',
    })
    if (error) throw new Error(error.message)
    return res.status(201).json({ ok: true })
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Submit failed' })
  }
}

async function handleDeskList(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const desk = await requireSuperEditor(auth)
  if ('error' in desk) return res.status(desk.status).json({ error: desk.error })
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const { data, error } = await supabase
      .from('playlist_curator_applications')
      .select('*, profile:profiles!playlist_curator_applications_user_id_fkey(name, username)')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    const applications = (data ?? []).map((row) => mapRow(row as Record<string, unknown>))
    return res.status(200).json({ applications })
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to load applications',
    })
  }
}

async function handleDeskReview(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const desk = await requireSuperEditor(auth)
  if ('error' in desk) return res.status(desk.status).json({ error: desk.error })
  const parsed = requireValidatedBody(res, playlistCuratorDeskReviewBody, req.body)
  if (!parsed) return
  const applicationId = parsed.applicationId ?? queryParam(req, 'applicationId')
  if (!applicationId) {
    return res.status(400).json({ error: 'applicationId required' })
  }
  const body = parsed

  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('playlist_curator_applications')
      .select('user_id, status')
      .eq('id', applicationId)
      .maybeSingle()
    if (fetchErr) throw new Error(fetchErr.message)
    if (!existing || existing.status !== 'pending') {
      throw new Error('Application is no longer pending.')
    }

    const { error } = await supabase
      .from('playlist_curator_applications')
      .update({
        status: body.decision,
        review_notes: body.notes?.trim() || null,
        reviewed_by: auth.authUser.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .eq('status', 'pending')
    if (error) throw new Error(error.message)
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Review failed' })
  }
}
