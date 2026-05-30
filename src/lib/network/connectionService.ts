import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import {
  isV1ApiEnabled,
  v1GetConnectionsList,
  v1GetIncomingConnectionRequestId,
  v1GetMutualConnections,
  v1GetPendingConnectionRequests,
  v1GetSuggestedPeople,
  v1RemoveConnection,
  v1RespondConnectionRequest,
  v1SearchNetworkPeople,
  v1SendConnectionRequest,
} from '@/api/v1Client'
import type {
  NetworkPendingRequest,
  NetworkPersonCard,
  ViewerConnectionStatus,
} from './connectionTypes'

export const NETWORK_CONNECTION_EVENT = 'ios-network-connection-change'

function notifyChange() {
  window.dispatchEvent(new Event(NETWORK_CONNECTION_EVENT))
}

function mapPerson(row: Record<string, unknown>): NetworkPersonCard {
  return {
    userId: String(row.user_id),
    displayName: String(row.display_name),
    handle: String(row.handle).replace(/^@/, ''),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    role: String(row.role ?? 'member'),
    totalDb: Number(row.total_db ?? 0),
    connectionStatus: (row.connection_status as ViewerConnectionStatus) ?? 'none',
  }
}

async function directSendConnectionRequest(targetUserId: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Sign in on the live network to connect.')
  const supabase = getSupabase()
  const { error } = await supabase.rpc('network_send_connection_request', {
    p_target: targetUserId,
  })
  if (error) throw new Error(error.message)
}

export async function sendConnectionRequest(targetUserId: string): Promise<void> {
  await viaV1Api(
    () => v1SendConnectionRequest(targetUserId),
    () => directSendConnectionRequest(targetUserId),
  )
  notifyChange()
}

async function directRespondConnectionRequest(requestId: string, accept: boolean): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Sign in required.')
  const supabase = getSupabase()
  const { error } = await supabase.rpc('network_respond_connection_request', {
    p_request_id: requestId,
    p_accept: accept,
  })
  if (error) throw new Error(error.message)
}

export async function respondConnectionRequest(
  requestId: string,
  accept: boolean,
): Promise<void> {
  await viaV1Api(
    () => v1RespondConnectionRequest(requestId, accept),
    () => directRespondConnectionRequest(requestId, accept),
  )
  notifyChange()
}

async function directRemoveConnection(targetUserId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  const { error } = await supabase.rpc('network_remove_connection', {
    p_target: targetUserId,
  })
  if (error) throw new Error(error.message)
}

export async function removeConnection(targetUserId: string): Promise<void> {
  await viaV1Api(
    () => v1RemoveConnection(targetUserId),
    () => directRemoveConnection(targetUserId),
  )
  notifyChange()
}

async function directFetchIncomingRequestIdFromUser(fromUserId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  const { data: session } = await supabase.auth.getSession()
  const me = session.session?.user?.id
  if (!me) return null
  const { data, error } = await supabase
    .from('network_connection_requests')
    .select('id')
    .eq('from_user_id', fromUserId)
    .eq('to_user_id', me)
    .eq('status', 'pending')
    .maybeSingle()
  if (error || !data) return null
  return String(data.id)
}

export async function fetchIncomingRequestIdFromUser(
  fromUserId: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  if (isV1ApiEnabled()) {
    return viaV1Api(
      async () => {
        const { requestId } = await v1GetIncomingConnectionRequestId(fromUserId)
        return requestId
      },
      () => directFetchIncomingRequestIdFromUser(fromUserId),
    )
  }
  return directFetchIncomingRequestIdFromUser(fromUserId)
}

async function directFetchPendingConnectionRequests(): Promise<NetworkPendingRequest[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('network_pending_requests')
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
    requestId: String(row.request_id),
    fromUserId: String(row.from_user_id),
    fromName: String(row.from_name),
    fromHandle: String(row.from_handle).replace(/^@/, ''),
    fromAvatarUrl: row.from_avatar_url ? String(row.from_avatar_url) : undefined,
    createdAt: String(row.created_at),
  }))
}

export async function fetchPendingConnectionRequests(): Promise<NetworkPendingRequest[]> {
  if (!isSupabaseConfigured()) return []
  return viaV1Api(
    async () => {
      const { requests } = await v1GetPendingConnectionRequests()
      return requests
    },
    () => directFetchPendingConnectionRequests(),
  )
}

async function directSearchNetworkPeople(query: string, limit: number): Promise<NetworkPersonCard[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('network_search_people', {
    p_query: query.trim(),
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => mapPerson(row))
}

export async function searchNetworkPeople(
  query: string,
  limit = 24,
): Promise<NetworkPersonCard[]> {
  if (!isSupabaseConfigured()) return []
  return viaV1Api(
    async () => {
      const { people } = await v1SearchNetworkPeople(query, limit)
      return people
    },
    () => directSearchNetworkPeople(query, limit),
  )
}

async function directFetchSuggestedPeople(limit: number): Promise<NetworkPersonCard[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('network_suggested_people', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => mapPerson(row))
}

export async function fetchSuggestedPeople(limit = 6): Promise<NetworkPersonCard[]> {
  if (!isSupabaseConfigured()) return []
  return viaV1Api(
    async () => {
      const { people } = await v1GetSuggestedPeople(limit)
      return people
    },
    () => directFetchSuggestedPeople(limit),
  )
}

async function directFetchConnectionsList(
  userId: string,
): Promise<Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('network_connections')
    .select('user_a, user_b, created_at')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error || !data?.length) return []

  const otherIds = data.map((row) =>
    row.user_a === userId ? row.user_b : row.user_a,
  )

  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url')
    .in('id', otherIds)

  if (profErr || !profiles) return []

  return profiles.map((p) => ({
    userId: p.id,
    displayName: p.name,
    handle: (p.username ?? 'member').replace(/^@/, ''),
    avatarUrl: p.avatar_url ?? undefined,
  }))
}

export async function fetchConnectionsList(
  userId: string,
): Promise<Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>[]> {
  if (!isSupabaseConfigured()) return []
  return viaV1Api(
    async () => {
      const { connections } = await v1GetConnectionsList(userId)
      return connections
    },
    () => directFetchConnectionsList(userId),
  )
}

async function directFetchMutualConnections(
  targetUserId: string,
  limit: number,
): Promise<Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('network_mutual_connections', {
    p_target: targetUserId,
    lim: limit,
  })
  if (error) return []
  return (data ?? []).map((row: Record<string, unknown>) => ({
    userId: String(row.user_id),
    displayName: String(row.display_name),
    handle: String(row.handle).replace(/^@/, ''),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
  }))
}

export async function fetchMutualConnections(
  targetUserId: string,
  limit = 12,
): Promise<Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>[]> {
  if (!isSupabaseConfigured()) return []
  return viaV1Api(
    async () => {
      const { mutuals } = await v1GetMutualConnections(targetUserId, limit)
      return mutuals
    },
    () => directFetchMutualConnections(targetUserId, limit),
  )
}
