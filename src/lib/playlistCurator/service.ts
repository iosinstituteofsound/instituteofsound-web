import {
  v1GetMyPlaylistCuratorApplications,
  v1ListPlaylistCuratorDeskApplications,
  v1ReviewPlaylistCuratorApplication,
  v1SubmitPlaylistCuratorApplication,
} from '@/api/v1Client'
import { isSupabaseConfigured } from '@/lib/api/liveMode'
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
    await v1SubmitPlaylistCuratorApplication(input)
    const { applications } = await v1GetMyPlaylistCuratorApplications()
    const pendingApp = applications.find((a) => a.status === 'pending')
    if (pendingApp) {
      notifySuperEditorsOfPlaylistCuratorApplication(userId, pendingApp.id)
    }
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
    const { applications } = await v1GetMyPlaylistCuratorApplications()
    return applications
  }
  return readLocal().filter((a) => a.userId === userId)
}

export async function listPlaylistCuratorApplicationsForReview(): Promise<
  PlaylistCuratorApplication[]
> {
  if (isSupabaseConfigured()) {
    const { applications } = await v1ListPlaylistCuratorDeskApplications()
    return applications
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
    const { applications } = await v1ListPlaylistCuratorDeskApplications()
    const existing = applications.find((a) => a.id === applicationId)
    if (!existing || existing.status !== 'pending') {
      throw new Error('Application is no longer pending.')
    }
    await v1ReviewPlaylistCuratorApplication({ applicationId, decision, notes })
    notifyMemberPlaylistCuratorDecision(existing.userId, applicationId, decision, notes)
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
