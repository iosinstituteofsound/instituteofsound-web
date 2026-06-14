import { getSubmissions, getUsers } from '@/lib/auth/storage'
import { localGetProfiles } from '@/lib/artist-profile/storage'
import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GetSuperAdminAnalytics } from '@/api/v1Phase5Client'
import { getDraftsForEditor } from '@/lib/submissions/service'
import { computeSuperAdminAnalytics } from './compute'
import type { SuperAdminAnalytics } from './types'

export async function getSuperAdminAnalytics(editorId: string): Promise<SuperAdminAnalytics> {
  if (isSupabaseConfigured()) {
    const { analytics } = await v1GetSuperAdminAnalytics()
    return analytics
  }

  const submissions = getSubmissions()
  const allUsers = getUsers()
  const roleUsers = allUsers.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    roleLabel: 'Demo',
    createdAt: u.createdAt,
  }))
  const roleCounts = {
    listeners: allUsers.length,
    artists: 0,
    editors: 0,
    superEditors: 0,
    total: allUsers.length,
  }
  const artistAccounts = allUsers.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
  }))
  const artistProfiles = localGetProfiles().map((p) => ({
    id: p.id,
    userId: p.userId,
    slug: p.slug,
    displayName: p.displayName,
    published: p.published,
    createdAt: p.createdAt,
  }))

  const drafts = await getDraftsForEditor(editorId)

  return computeSuperAdminAnalytics({
    submissions,
    drafts,
    artistsRegistered: artistProfiles.length,
    roleCounts,
    artistAccounts,
    artistProfiles,
    roleUsers,
  })
}
