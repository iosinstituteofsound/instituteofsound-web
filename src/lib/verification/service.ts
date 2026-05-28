import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
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

function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, '').toLowerCase()
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

  const payload = {
    user_id: userId,
    role_type: input.roleType,
    proof_links: cleanLinks(input.proofLinks),
    artist_confirmation_link: input.artistConfirmationLink?.trim() || null,
    website_domain: input.websiteDomain?.trim() || null,
    official_email: input.officialEmail?.trim() || null,
    venue_partner_reference: input.venuePartnerReference?.trim() || null,
    status: 'pending',
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { error } = await supabase.from('role_verification_requests').insert(payload)
    if (error) throw new Error(error.message)
    return
  }

  const list = read<RoleVerificationRequest[]>(LOCAL_REQUESTS_KEY, [])
  list.unshift({
    id: crypto.randomUUID(),
    userId,
    roleType: input.roleType,
    proofLinks: payload.proof_links,
    artistConfirmationLink: input.artistConfirmationLink,
    websiteDomain: input.websiteDomain,
    officialEmail: input.officialEmail,
    venuePartnerReference: input.venuePartnerReference,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  write(LOCAL_REQUESTS_KEY, list)
}

export async function getMyRoleVerificationRequests(userId: string): Promise<RoleVerificationRequest[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('role_verification_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      roleType: row.role_type,
      proofLinks: row.proof_links ?? [],
      artistConfirmationLink: row.artist_confirmation_link ?? undefined,
      websiteDomain: row.website_domain ?? undefined,
      officialEmail: row.official_email ?? undefined,
      venuePartnerReference: row.venue_partner_reference ?? undefined,
      status: row.status,
      reviewNotes: row.review_notes ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  return read<RoleVerificationRequest[]>(LOCAL_REQUESTS_KEY, []).filter((r) => r.userId === userId)
}

async function findUserByHandle(handle: string): Promise<{ id: string; name: string } | null> {
  const h = normalizeHandle(handle)
  if (!h) return null
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  const { data, error } = await supabase.from('profiles').select('id, name').eq('username', h).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? { id: data.id, name: data.name } : null
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
  const target = await findUserByHandle(input.targetHandle)
  if (!target) throw new Error('Target handle not found. Ask user to set a public @username first.')
  if (target.id === input.claimantUserId) throw new Error('Cannot claim yourself.')

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { error } = await supabase.from('relationship_claims').insert({
      claim_type: input.claimType,
      claimant_user_id: input.claimantUserId,
      target_user_id: target.id,
      evidence_links: links,
      note: input.note?.trim() || null,
      status: 'pending',
    })
    if (error) throw new Error(error.message)
    return
  }

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

function mapClaimRow(row: any): RelationshipClaim {
  return {
    id: row.id,
    claimType: row.claim_type,
    claimantUserId: row.claimant_user_id,
    claimantName: row.claimant?.name ?? 'Unknown',
    claimantHandle: row.claimant?.username ?? undefined,
    targetUserId: row.target_user_id,
    targetName: row.target?.name ?? 'Unknown',
    targetHandle: row.target?.username ?? undefined,
    evidenceLinks: row.evidence_links ?? [],
    note: row.note ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listIncomingClaims(userId: string): Promise<RelationshipClaim[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('relationship_claims')
      .select(
        'id, claim_type, claimant_user_id, target_user_id, evidence_links, note, status, created_at, updated_at, claimant:profiles!relationship_claims_claimant_user_id_fkey(name, username), target:profiles!relationship_claims_target_user_id_fkey(name, username)'
      )
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(mapClaimRow)
  }
  return read<RelationshipClaim[]>(LOCAL_CLAIMS_KEY, []).filter((c) => c.targetUserId === userId)
}

export async function listOutgoingClaims(userId: string): Promise<RelationshipClaim[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('relationship_claims')
      .select(
        'id, claim_type, claimant_user_id, target_user_id, evidence_links, note, status, created_at, updated_at, claimant:profiles!relationship_claims_claimant_user_id_fkey(name, username), target:profiles!relationship_claims_target_user_id_fkey(name, username)'
      )
      .eq('claimant_user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(mapClaimRow)
  }
  return read<RelationshipClaim[]>(LOCAL_CLAIMS_KEY, []).filter((c) => c.claimantUserId === userId)
}

export async function respondToClaim(claimId: string, decision: 'approved' | 'rejected') {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('relationship_claims')
      .update({ status: decision, updated_at: new Date().toISOString() })
      .eq('id', claimId)
      .eq('status', 'pending')
    if (error) throw new Error(error.message)
    return
  }
  const list = read<RelationshipClaim[]>(LOCAL_CLAIMS_KEY, [])
  const idx = list.findIndex((c) => c.id === claimId)
  if (idx >= 0) {
    list[idx] = { ...list[idx], status: decision, updatedAt: new Date().toISOString() }
    write(LOCAL_CLAIMS_KEY, list)
  }
}

