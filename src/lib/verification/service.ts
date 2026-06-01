import {
  v1CreateRelationshipClaim,
  v1GetMyVerificationRequests,
  v1ListIncomingClaims,
  v1ListOutgoingClaims,
  v1ListVerificationDeskRequests,
  v1RespondToClaim,
  v1ReviewVerificationRequest,
  v1SubmitRoleVerification,
} from '@/api/v1Client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import {
  notifyDeskStaffOfVerificationRequest,
  notifyMemberVerificationDecision,
} from '@/lib/verification/notifyEditors'
import type { DashboardPersona } from '@/lib/auth/types'
import type {
  RelationshipClaim,
  RelationshipClaimType,
  RoleVerificationRequest,
  SubmitRoleVerificationInput,
} from './types'

const LOCAL_REQUESTS_KEY = 'ios_role_verification_requests'
const LOCAL_CLAIMS_KEY = 'ios_relationship_claims'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function cleanLinks(links: string[]): string[] {
  return links.map((l) => l.trim()).filter(Boolean)
}

function roleProofError(input: SubmitRoleVerificationInput): string | null {
  const links = cleanLinks(input.proofLinks)
  if (input.roleType === 'artist_manager') {
    if (!input.artistConfirmationLink?.trim()) return 'Artist confirmation link required.'
    if (links.length < 1) return 'At least one public profile/proof link required.'
  }
  if (input.roleType === 'label') {
    if (!input.websiteDomain?.trim()) return 'Website/domain required for label verification.'
    if (links.length < 2) return 'At least two roster links required.'
  }
  if (input.roleType === 'event_promoter') {
    if (!input.venuePartnerReference?.trim()) return 'Venue/partner reference required.'
    if (links.length < 2) return 'At least two event/ticket/poster links required.'
  }
  if (input.roleType === 'brand') {
    if (!input.officialEmail?.trim()) return 'Official domain email required.'
    if (links.length < 1) return 'At least one campaign link required.'
  }
  return null
}

export async function submitRoleVerificationRequest(
  userId: string,
  input: SubmitRoleVerificationInput
) {
  const proofErr = roleProofError(input)
  if (proofErr) throw new Error(proofErr)

  const existing = await getMyRoleVerificationRequests(userId)
  const latestForRole = existing
    .filter((r) => r.roleType === input.roleType)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
  if (latestForRole?.status === 'approved') {
    throw new Error('This role is already verified.')
  }
  if (latestForRole?.status === 'pending') {
    throw new Error('Your verification is already under review.')
  }

  if (isSupabaseConfigured()) {
    await v1SubmitRoleVerification(input)
    return
  }

  const requestId = crypto.randomUUID()
  const list = read<RoleVerificationRequest[]>(LOCAL_REQUESTS_KEY, [])
  list.unshift({
    id: requestId,
    userId,
    roleType: input.roleType,
    proofLinks: cleanLinks(input.proofLinks),
    artistConfirmationLink: input.artistConfirmationLink,
    websiteDomain: input.websiteDomain,
    officialEmail: input.officialEmail,
    venuePartnerReference: input.venuePartnerReference,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  write(LOCAL_REQUESTS_KEY, list)
  notifyDeskStaffOfVerificationRequest(userId, input.roleType, requestId)
}

export async function getMyRoleVerificationRequests(userId: string): Promise<RoleVerificationRequest[]> {
  if (isSupabaseConfigured()) {
    const { requests } = await v1GetMyVerificationRequests()
    return requests
  }

  return read<RoleVerificationRequest[]>(LOCAL_REQUESTS_KEY, []).filter((r) => r.userId === userId)
}

export async function listVerificationRequestsForReview(): Promise<RoleVerificationRequest[]> {
  if (isSupabaseConfigured()) {
    const { requests } = await v1ListVerificationDeskRequests()
    return requests
  }
  return read<RoleVerificationRequest[]>(LOCAL_REQUESTS_KEY, [])
}

export async function reviewRoleVerificationRequest(
  requestId: string,
  decision: 'approved' | 'rejected',
  notes?: string
) {
  if (isSupabaseConfigured()) {
    await v1ReviewVerificationRequest({ requestId, decision, notes })
    return
  }
  const list = read<RoleVerificationRequest[]>(LOCAL_REQUESTS_KEY, [])
  const idx = list.findIndex((r) => r.id === requestId)
  if (idx < 0) return
  const req = list[idx]
  list[idx] = {
    ...req,
    status: decision,
    reviewNotes: notes?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  }
  write(LOCAL_REQUESTS_KEY, list)

  if (decision === 'approved') {
    const { getUsers, saveUsers } = await import('@/lib/auth/storage')
    const users = getUsers()
    const userIdx = users.findIndex((u) => u.id === req.userId)
    if (userIdx >= 0) {
      users[userIdx] = { ...users[userIdx], dashboardPersona: req.roleType as DashboardPersona }
      saveUsers(users)
    }
  }

  notifyMemberVerificationDecision(
    req.userId,
    req.id,
    req.roleType,
    decision,
    notes,
  )
}

/** If profile persona missing but verification was approved, apply it (safety net). */
export async function syncApprovedVerificationPersona(userId: string): Promise<boolean> {
  const requests = await getMyRoleVerificationRequests(userId)
  const approved = [...requests]
    .filter((r) => r.status === 'approved')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
  if (!approved) return false

  if (!isSupabaseConfigured()) {
    const { getUsers, saveUsers, getUserById } = await import('@/lib/auth/storage')
    const user = getUserById(userId)
    if (user?.dashboardPersona === approved.roleType) return false
    const users = getUsers()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx >= 0) {
      users[idx] = { ...users[idx], dashboardPersona: approved.roleType as DashboardPersona }
      saveUsers(users)
    }
    return true
  }

  const { fetchUserProfile, updateUserProfile } = await import('@/lib/auth/profile')
  const profile = await fetchUserProfile(userId)
  if (profile.dashboardPersona === approved.roleType) return false
  await updateUserProfile(userId, { dashboardPersona: approved.roleType as DashboardPersona })
  return true
}

async function findUserByHandle(_handle: string): Promise<{ id: string; name: string } | null> {
  return null
}

export async function createRelationshipClaim(input: {
  claimType: RelationshipClaimType
  claimantUserId: string
  targetHandle: string
  evidenceLinks: string[]
  note?: string
}) {
  const links = cleanLinks(input.evidenceLinks)
  if (links.length < 1) throw new Error('At least one evidence link required.')

  if (isSupabaseConfigured()) {
    await v1CreateRelationshipClaim({
      claimType: input.claimType,
      targetHandle: input.targetHandle,
      evidenceLinks: input.evidenceLinks,
      note: input.note,
    })
    return
  }

  const target = await findUserByHandle(input.targetHandle)
  if (!target) throw new Error('Target handle not found. Ask user to set a public @username first.')
  if (target.id === input.claimantUserId) throw new Error('Cannot claim yourself.')

  const list = read<RelationshipClaim[]>(LOCAL_CLAIMS_KEY, [])
  list.unshift({
    id: crypto.randomUUID(),
    claimType: input.claimType,
    claimantUserId: input.claimantUserId,
    claimantName: 'You',
    targetUserId: target.id,
    targetName: target.name,
    evidenceLinks: links,
    note: input.note?.trim() || undefined,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  write(LOCAL_CLAIMS_KEY, list)
}

export async function listIncomingClaims(userId: string): Promise<RelationshipClaim[]> {
  if (isSupabaseConfigured()) {
    const { claims } = await v1ListIncomingClaims()
    return claims
  }
  return read<RelationshipClaim[]>(LOCAL_CLAIMS_KEY, []).filter((c) => c.targetUserId === userId)
}

export async function listOutgoingClaims(userId: string): Promise<RelationshipClaim[]> {
  if (isSupabaseConfigured()) {
    const { claims } = await v1ListOutgoingClaims()
    return claims
  }
  return read<RelationshipClaim[]>(LOCAL_CLAIMS_KEY, []).filter((c) => c.claimantUserId === userId)
}

export async function respondToClaim(claimId: string, decision: 'approved' | 'rejected') {
  if (isSupabaseConfigured()) {
    await v1RespondToClaim({ claimId, decision })
    return
  }
  const list = read<RelationshipClaim[]>(LOCAL_CLAIMS_KEY, [])
  const idx = list.findIndex((c) => c.id === claimId)
  if (idx >= 0) {
    list[idx] = { ...list[idx], status: decision, updatedAt: new Date().toISOString() }
    write(LOCAL_CLAIMS_KEY, list)
  }
}
