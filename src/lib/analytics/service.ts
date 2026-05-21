import { getDrafts, getSubmissions, getUsers } from '@/lib/auth/storage'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { getDraftsForEditor, getSubmissionsForEditor } from '@/lib/submissions/service'
import { computeSuperAdminAnalytics } from './compute'
import type { SuperAdminAnalytics } from './types'
import * as sb from './supabaseAnalytics'

export async function getSuperAdminAnalytics(editorId: string): Promise<SuperAdminAnalytics> {
  if (isSupabaseConfigured()) {
    const [submissions, drafts, artistsRegistered] = await Promise.all([
      getSubmissionsForEditor(),
      sb.supabaseGetAllDraftsForSuperEditor(),
      sb.supabaseCountArtists(),
    ])
    return computeSuperAdminAnalytics({ submissions, drafts, artistsRegistered })
  }

  const submissions = getSubmissions()
  const drafts = getDrafts()
  const artistsRegistered = getUsers().filter((u) => u.role === 'artist').length

  return computeSuperAdminAnalytics({
    submissions,
    drafts: drafts.length ? drafts : await getDraftsForEditor(editorId),
    artistsRegistered,
  })
}
