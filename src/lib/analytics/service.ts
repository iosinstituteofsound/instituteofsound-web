import { getDrafts, getSubmissions, getUsers } from '@/lib/auth/storage'
import { localGetProfiles } from '@/lib/artist-profile/storage'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { getDraftsForEditor, getSubmissionsForEditor } from '@/lib/submissions/service'
import { computeSuperAdminAnalytics } from './compute'
import type { SuperAdminAnalytics } from './types'
import * as sb from './supabaseAnalytics'

export async function getSuperAdminAnalytics(editorId: string): Promise<SuperAdminAnalytics> {
  if (isSupabaseConfigured()) {
    const [submissions, drafts, artistsRegistered, roleCounts, artistAccounts, artistProfiles, roleUsers] =
      await Promise.all([
        getSubmissionsForEditor(),
        sb.supabaseGetAllDraftsForSuperEditor(),
        sb.supabaseCountArtists(),
        sb.supabaseGetRoleCounts(),
        sb.supabaseListArtistAccounts(),
        sb.supabaseListArtistProfiles(),
        sb.supabaseListRoleUsers(),
      ])
    return computeSuperAdminAnalytics({
      submissions,
      drafts,
      artistsRegistered,
      roleCounts,
      artistAccounts,
      artistProfiles,
      roleUsers,
    })
  }

  const submissions = getSubmissions()
  const drafts = getDrafts()
  const users = getUsers().filter((u) => u.role === 'artist')
  const allUsers = getUsers()
  const roleUsers = allUsers.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
  }))
  const roleCounts = {
    listeners: allUsers.filter((u) => u.role === 'member').length,
    artists: allUsers.filter((u) => u.role === 'artist').length,
    editors: allUsers.filter((u) => u.role === 'editor').length,
    superEditors: allUsers.filter((u) => u.role === 'super_editor').length,
    total: allUsers.length,
  }
  const artistAccounts = users.map((u) => ({
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

  return computeSuperAdminAnalytics({
    submissions,
    drafts: drafts.length ? drafts : await getDraftsForEditor(editorId),
    artistsRegistered: users.length,
    roleCounts,
    artistAccounts,
    artistProfiles,
    roleUsers,
  })
}
