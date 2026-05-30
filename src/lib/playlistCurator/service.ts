import {
  isV1ApiEnabled,
  v1GetMyPlaylistCuratorApplications,
  v1ListPlaylistCuratorDeskApplications,
  v1ReviewPlaylistCuratorApplication,
  v1SubmitPlaylistCuratorApplication,
} from '@/api/v1Client'
import { assertDirectSupabaseAllowed } from '@/lib/api/v1Security'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  notifyMemberPlaylistCuratorDecision,
  notifySuperEditorsOfPlaylistCuratorApplication,
} from '@/lib/playlistCurator/notify'
import { validatePlaylistCuratorInput } from './validate'
import type {
  PlaylistCuratorApplication,
  SubmitPlaylistCuratorInput,
} from '@/lib/playlistCurator/types'

const LOCAL_KEY = 'ios_playlist_curator_applications'

function readLocal(): PlaylistCuratorApplication[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as PlaylistCuratorApplication[]) : []
  } catch {
    return []
  }
}

function writeLocal(list: PlaylistCuratorApplication[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
}

function cleanLinks(links: string[]): string[] {
  return links.map((l) => l.trim()).filter(Boolean)
}

function mapRow(row: {
  id: string
  user_id: string
  playlist_links: string[] | null
  note: string | null
  status: PlaylistCuratorApplication['status']
  review_notes: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
  profile?: { name?: string | null; username?: string | null } | null
}): PlaylistCuratorApplication {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.profile?.name ?? undefined,
    userHandle: row.profile?.username ?? undefined,
    playlistLinks: row.playlist_links ?? [],
    note: row.note ?? undefined,
    status: row.status,
    reviewNotes: row.review_notes ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export { validatePlaylistCuratorInput } from './validate'

export async function submitPlaylistCuratorApplication(
  userId: string,
  input: SubmitPlaylistCuratorInput,
): Promise<void> {
  const err = validatePlaylistCuratorInput(input)
  if (err) throw new Error(err)

  const links = cleanLinks(input.playlistLinks)
  const note = input.note?.trim() || null

  const existing = await getMyPlaylistCuratorApplications(userId)
  const pending = existing.find((a) => a.status === 'pending')
  if (pending) {
    throw new Error('You already have a playlist curator application under review.')
  }
  const approved = existing.find((a) => a.status === 'approved')
  if (approved) {
    throw new Error('You are already an approved playlist curator.')
  }

  if (isSupabaseConfigured()) {
    if (isV1ApiEnabled()) {
      await v1SubmitPlaylistCuratorApplication(input)
      const { applications } = await v1GetMyPlaylistCuratorApplications()
      const pending = applications.find((a) => a.status === 'pending')
      if (pending) {
        notifySuperEditorsOfPlaylistCuratorApplication(userId, pending.id)
      }
      return
    }
    assertDirectSupabaseAllowed('Playlist curator')
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('playlist_curator_applications')
      .insert({
        user_id: userId,
        playlist_links: links,
        note,
        status: 'pending',
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    notifySuperEditorsOfPlaylistCuratorApplication(userId, data.id)
    return
  }

  const applicationId = crypto.randomUUID()
  const list = readLocal()
  list.unshift({
    id: applicationId,
    userId,
    playlistLinks: links,
    note: note ?? undefined,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  writeLocal(list)
  notifySuperEditorsOfPlaylistCuratorApplication(userId, applicationId)
}

export async function getMyPlaylistCuratorApplications(
  userId: string,
): Promise<PlaylistCuratorApplication[]> {
  if (isSupabaseConfigured()) {
    if (isV1ApiEnabled()) {
      const { applications } = await v1GetMyPlaylistCuratorApplications()
      return applications
    }
    assertDirectSupabaseAllowed('Playlist curator')
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('playlist_curator_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => mapRow(row))
  }
  return readLocal().filter((a) => a.userId === userId)
}

export async function listPlaylistCuratorApplicationsForReview(): Promise<
  PlaylistCuratorApplication[]
> {
  if (isSupabaseConfigured()) {
    if (isV1ApiEnabled()) {
      const { applications } = await v1ListPlaylistCuratorDeskApplications()
      return applications
    }
    assertDirectSupabaseAllowed('Playlist curator')
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('playlist_curator_applications')
      .select('*, profile:profiles!playlist_curator_applications_user_id_fkey(name, username)')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => mapRow(row))
  }
  return readLocal()
}

export async function reviewPlaylistCuratorApplication(
  applicationId: string,
  decision: 'approved' | 'rejected',
  notes: string | undefined,
  reviewerId: string,
): Promise<void> {
  if (isSupabaseConfigured()) {
    if (isV1ApiEnabled()) {
      const supabase = getSupabase()
      const { data: existing, error: fetchErr } = await supabase
        .from('playlist_curator_applications')
        .select('user_id, status')
        .eq('id', applicationId)
        .maybeSingle()
      if (fetchErr) throw new Error(fetchErr.message)
      if (!existing || existing.status !== 'pending') {
        throw new Error('Application is no longer pending.')
      }
      await v1ReviewPlaylistCuratorApplication({ applicationId, decision, notes })
      notifyMemberPlaylistCuratorDecision(existing.user_id, applicationId, decision, notes)
      return
    }
    assertDirectSupabaseAllowed('Playlist curator')
    const supabase = getSupabase()
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
        status: decision,
        review_notes: notes?.trim() || null,
        reviewed_by: reviewerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .eq('status', 'pending')
    if (error) throw new Error(error.message)

    notifyMemberPlaylistCuratorDecision(existing.user_id, applicationId, decision, notes)
    return
  }

  const list = readLocal()
  const idx = list.findIndex((a) => a.id === applicationId)
  if (idx < 0) throw new Error('Application not found.')
  const app = list[idx]
  if (app.status !== 'pending') throw new Error('Application is no longer pending.')

  list[idx] = {
    ...app,
    status: decision,
    reviewNotes: notes?.trim() || undefined,
    reviewedBy: reviewerId,
    updatedAt: new Date().toISOString(),
  }
  writeLocal(list)
  notifyMemberPlaylistCuratorDecision(app.userId, applicationId, decision, notes)
}
