import type { User } from '@supabase/supabase-js'
import { mapMemberProfile } from './memberProfile.js'

const PROFILE_COLUMNS =
  'id, email, name, role, dashboard_persona, avatar_url, username, bio, created_at'
import type { ApiRequest } from './http.js'
import { createSupabaseUserClient, getSupabaseAdmin, isSupabaseServerConfigured } from './supabaseServer.js'

export type AuthContext = {
  authUser: User
  accessToken: string
}

function bearerToken(req: ApiRequest): string | null {
  const raw = req.headers?.authorization ?? req.headers?.Authorization
  const header = Array.isArray(raw) ? raw[0] : raw
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice(7).trim()
  return token || null
}

export async function requireAuth(req: ApiRequest): Promise<AuthContext | { status: number; error: string }> {
  if (!isSupabaseServerConfigured()) {
    return { status: 503, error: 'API not configured (missing Supabase server env)' }
  }

  const accessToken = bearerToken(req)
  if (!accessToken) {
    return { status: 401, error: 'Missing Authorization: Bearer <access_token>' }
  }

  const admin = getSupabaseAdmin()
  const { data, error } = await admin.auth.getUser(accessToken)
  if (error || !data.user) {
    return { status: 401, error: 'Invalid or expired session' }
  }

  return { authUser: data.user, accessToken }
}

export async function fetchMemberProfile(auth: AuthContext) {
  const supabase = createSupabaseUserClient(auth.accessToken)
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', auth.authUser.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Profile row missing')
  return mapMemberProfile(data)
}
