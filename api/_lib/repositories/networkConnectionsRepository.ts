import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  NetworkPendingRequest,
  NetworkPersonCard,
  ViewerConnectionStatus,
} from '../../../src/lib/network/connectionTypes.js'

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

export async function repoSendConnectionRequest(
  supabase: SupabaseClient,
  targetUserId: string,
): Promise<void> {
  const { error } = await supabase.rpc('network_send_connection_request', {
    p_target: targetUserId,
  })
  if (error) throw new Error(error.message)
}

export async function repoRespondConnectionRequest(
  supabase: SupabaseClient,
  requestId: string,
  accept: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('network_respond_connection_request', {
    p_request_id: requestId,
    p_accept: accept,
  })
  if (error) throw new Error(error.message)
}

export async function repoRemoveConnection(
  supabase: SupabaseClient,
  targetUserId: string,
): Promise<void> {
  const { error } = await supabase.rpc('network_remove_connection', {
    p_target: targetUserId,
  })
  if (error) throw new Error(error.message)
}

export async function repoFetchIncomingRequestIdFromUser(
  supabase: SupabaseClient,
  me: string,
  fromUserId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('network_connection_requests')
    .select('id')
    .eq('from_user_id', fromUserId)
    .eq('to_user_id', me)
    .eq('status', 'pending')
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data?.id ? String(data.id) : null
}

export async function repoFetchPendingConnectionRequests(
  supabase: SupabaseClient,
): Promise<NetworkPendingRequest[]> {
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

export async function repoSearchNetworkPeople(
  supabase: SupabaseClient,
  query: string,
  limit: number,
): Promise<NetworkPersonCard[]> {
  const { data, error } = await supabase.rpc('network_search_people', {
    p_query: query.trim(),
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => mapPerson(row))
}

export async function repoFetchSuggestedPeople(
  supabase: SupabaseClient,
  limit: number,
): Promise<NetworkPersonCard[]> {
  const { data, error } = await supabase.rpc('network_suggested_people', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => mapPerson(row))
}

export async function repoFetchConnectionsList(
  supabase: SupabaseClient,
  userId: string,
): Promise<Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>[]> {
  const { data, error } = await supabase
    .from('network_connections')
    .select('user_a, user_b, created_at')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw new Error(error.message)
  if (!data?.length) return []

  const otherIds = data.map((row) => (row.user_a === userId ? row.user_b : row.user_a))

  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url')
    .in('id', otherIds)

  if (profErr) throw new Error(profErr.message)
  if (!profiles) return []

  return profiles.map((p) => ({
    userId: p.id,
    displayName: p.name,
    handle: (p.username ?? 'member').replace(/^@/, ''),
    avatarUrl: p.avatar_url ?? undefined,
  }))
}

export async function repoFetchMutualConnections(
  supabase: SupabaseClient,
  targetUserId: string,
  limit: number,
): Promise<Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>[]> {
  const { data, error } = await supabase.rpc('network_mutual_connections', {
    p_target: targetUserId,
    lim: limit,
  })
  if (error) throw new Error(error.message)

  return (data ?? []).map((row: Record<string, unknown>) => ({
    userId: String(row.user_id),
    displayName: String(row.display_name),
    handle: String(row.handle).replace(/^@/, ''),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
  }))
}
