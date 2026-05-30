import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  RelationshipClaim,
  RoleVerificationRequest,
  SubmitRoleVerificationInput,
} from '../../../src/lib/verification/types.js'
import { requireAuth } from '../auth.js'
import { requireSuperEditor } from '../requireDesk.js'
import { methodNotAllowed, parseJsonBody, type ApiRequest, type ApiResponse } from '../http.js'
import { createSupabaseUserClient } from '../supabaseServer.js'

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

function mapRequestRow(row: Record<string, unknown>): RoleVerificationRequest {
  const profile = row.profile as { name?: string; username?: string } | null | undefined
  return {
    id: String(row.id),
    userId: String(row.user_id),
    userName: profile?.name ?? undefined,
    userHandle: profile?.username ?? undefined,
    roleType: row.role_type as RoleVerificationRequest['roleType'],
    proofLinks: (row.proof_links as string[]) ?? [],
    artistConfirmationLink: row.artist_confirmation_link
      ? String(row.artist_confirmation_link)
      : undefined,
    websiteDomain: row.website_domain ? String(row.website_domain) : undefined,
    officialEmail: row.official_email ? String(row.official_email) : undefined,
    venuePartnerReference: row.venue_partner_reference
      ? String(row.venue_partner_reference)
      : undefined,
    status: row.status as RoleVerificationRequest['status'],
    reviewNotes: row.review_notes ? String(row.review_notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

function mapClaimRow(row: Record<string, unknown>): RelationshipClaim {
  const claimant = row.claimant as { name?: string; username?: string } | null | undefined
  const target = row.target as { name?: string; username?: string } | null | undefined
  return {
    id: String(row.id),
    claimType: row.claim_type as RelationshipClaim['claimType'],
    claimantUserId: String(row.claimant_user_id),
    claimantName: claimant?.name ?? 'Unknown',
    claimantHandle: claimant?.username ?? undefined,
    targetUserId: String(row.target_user_id),
    targetName: target?.name ?? 'Unknown',
    targetHandle: target?.username ?? undefined,
    evidenceLinks: (row.evidence_links as string[]) ?? [],
    note: row.note ? String(row.note) : undefined,
    status: row.status as RelationshipClaim['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

async function listMyRequests(
  supabase: SupabaseClient,
  userId: string,
): Promise<RoleVerificationRequest[]> {
  const { data, error } = await supabase
    .from('role_verification_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapRequestRow(row as Record<string, unknown>))
}

async function submitRequest(
  supabase: SupabaseClient,
  userId: string,
  input: SubmitRoleVerificationInput,
): Promise<void> {
  const proofErr = roleProofError(input)
  if (proofErr) throw new Error(proofErr)

  const existing = await listMyRequests(supabase, userId)
  const latestForRole = existing
    .filter((r) => r.roleType === input.roleType)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
  if (latestForRole?.status === 'approved') throw new Error('This role is already verified.')
  if (latestForRole?.status === 'pending') {
    throw new Error('Your verification is already under review.')
  }

  const { error } = await supabase.from('role_verification_requests').insert({
    user_id: userId,
    role_type: input.roleType,
    proof_links: cleanLinks(input.proofLinks),
    artist_confirmation_link: input.artistConfirmationLink?.trim() || null,
    website_domain: input.websiteDomain?.trim() || null,
    official_email: input.officialEmail?.trim() || null,
    venue_partner_reference: input.venuePartnerReference?.trim() || null,
    status: 'pending',
  })
  if (error) throw new Error(error.message)
}

async function findUserByHandle(
  supabase: SupabaseClient,
  handle: string,
): Promise<{ id: string; name: string } | null> {
  const h = normalizeHandle(handle)
  if (!h) return null
  const { data, error } = await supabase.from('profiles').select('id, name').eq('username', h).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? { id: data.id, name: data.name } : null
}

export async function handleV1Verification(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith('/api/v1/verification')) return false

  if (pathname === '/api/v1/verification/desk/requests') {
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

  if (pathname === '/api/v1/verification/requests') {
    if (req.method === 'GET') {
      await handleMyRequests(req, res)
      return true
    }
    if (req.method === 'POST') {
      await handleSubmit(req, res)
      return true
    }
    methodNotAllowed(res, ['GET', 'POST'])
    return true
  }

  if (pathname === '/api/v1/verification/claims/incoming' && req.method === 'GET') {
    await handleClaimsIncoming(req, res)
    return true
  }
  if (pathname === '/api/v1/verification/claims/outgoing' && req.method === 'GET') {
    await handleClaimsOutgoing(req, res)
    return true
  }
  if (pathname === '/api/v1/verification/claims' && req.method === 'POST') {
    await handleCreateClaim(req, res)
    return true
  }
  if (pathname === '/api/v1/verification/claims' && req.method === 'PATCH') {
    await handleRespondClaim(req, res)
    return true
  }

  res.status(404).json({ error: 'Not found' })
  return true
}

async function handleMyRequests(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const requests = await listMyRequests(supabase, auth.authUser.id)
    return res.status(200).json({ requests })
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to load requests' })
  }
}

async function handleSubmit(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const body = parseJsonBody<SubmitRoleVerificationInput>(req.body)
  if (!body?.roleType) return res.status(400).json({ error: 'roleType required' })
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    await submitRequest(supabase, auth.authUser.id, body)
    return res.status(201).json({ ok: true })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Submit failed' })
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
      .from('role_verification_requests')
      .select('*, profile:profiles!role_verification_requests_user_id_fkey(name, username)')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    const requests = (data ?? []).map((row) => mapRequestRow(row as Record<string, unknown>))
    return res.status(200).json({ requests })
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to load desk queue' })
  }
}

async function handleDeskReview(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const desk = await requireSuperEditor(auth)
  if ('error' in desk) return res.status(desk.status).json({ error: desk.error })
  const body = parseJsonBody<{ requestId?: string; decision?: 'approved' | 'rejected'; notes?: string }>(
    req.body,
  )
  if (!body?.requestId || !body.decision) {
    return res.status(400).json({ error: 'requestId and decision required' })
  }
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const { data: row, error: fetchErr } = await supabase
      .from('role_verification_requests')
      .select('user_id, role_type, status')
      .eq('id', body.requestId)
      .maybeSingle()
    if (fetchErr) throw new Error(fetchErr.message)
    if (!row || row.status !== 'pending') throw new Error('Request is no longer pending.')

    const { error } = await supabase
      .from('role_verification_requests')
      .update({
        status: body.decision,
        review_notes: body.notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.requestId)
      .eq('status', 'pending')
    if (error) throw new Error(error.message)

    if (body.decision === 'approved') {
      await supabase
        .from('profiles')
        .update({ dashboard_persona: row.role_type })
        .eq('id', row.user_id)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Review failed' })
  }
}

async function handleCreateClaim(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const body = parseJsonBody<{
    claimType?: RelationshipClaim['claimType']
    targetHandle?: string
    evidenceLinks?: string[]
    note?: string
  }>(req.body)
  if (!body?.claimType || !body.targetHandle) {
    return res.status(400).json({ error: 'claimType and targetHandle required' })
  }
  const links = cleanLinks(body.evidenceLinks ?? [])
  if (links.length < 1) return res.status(400).json({ error: 'At least one evidence link required.' })

  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const target = await findUserByHandle(supabase, body.targetHandle)
    if (!target) {
      return res.status(400).json({
        error: 'Target handle not found. Ask user to set a public @username first.',
      })
    }
    if (target.id === auth.authUser.id) {
      return res.status(400).json({ error: 'Cannot claim yourself.' })
    }
    const { error } = await supabase.from('relationship_claims').insert({
      claim_type: body.claimType,
      claimant_user_id: auth.authUser.id,
      target_user_id: target.id,
      evidence_links: links,
      note: body.note?.trim() || null,
      status: 'pending',
    })
    if (error) throw new Error(error.message)
    return res.status(201).json({ ok: true })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Claim failed' })
  }
}

async function handleClaimsIncoming(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const { data, error } = await supabase
      .from('relationship_claims')
      .select(
        'id, claim_type, claimant_user_id, target_user_id, evidence_links, note, status, created_at, updated_at, claimant:profiles!relationship_claims_claimant_user_id_fkey(name, username), target:profiles!relationship_claims_target_user_id_fkey(name, username)',
      )
      .eq('target_user_id', auth.authUser.id)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    const claims = (data ?? []).map((row) => mapClaimRow(row as Record<string, unknown>))
    return res.status(200).json({ claims })
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to load claims' })
  }
}

async function handleClaimsOutgoing(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const { data, error } = await supabase
      .from('relationship_claims')
      .select(
        'id, claim_type, claimant_user_id, target_user_id, evidence_links, note, status, created_at, updated_at, claimant:profiles!relationship_claims_claimant_user_id_fkey(name, username), target:profiles!relationship_claims_target_user_id_fkey(name, username)',
      )
      .eq('claimant_user_id', auth.authUser.id)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    const claims = (data ?? []).map((row) => mapClaimRow(row as Record<string, unknown>))
    return res.status(200).json({ claims })
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to load claims' })
  }
}

async function handleRespondClaim(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const body = parseJsonBody<{ claimId?: string; decision?: 'approved' | 'rejected' }>(req.body)
  if (!body?.claimId || !body.decision) {
    return res.status(400).json({ error: 'claimId and decision required' })
  }
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const { error } = await supabase
      .from('relationship_claims')
      .update({ status: body.decision, updated_at: new Date().toISOString() })
      .eq('id', body.claimId)
      .eq('target_user_id', auth.authUser.id)
      .eq('status', 'pending')
    if (error) throw new Error(error.message)
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Update failed' })
  }
}
