import { isSupabaseConfigured } from '@/lib/supabase/client'
import {
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
} from './connectionTypes'

export const NETWORK_CONNECTION_EVENT = 'ios-network-connection-change'

function notifyChange() {
  window.dispatchEvent(new Event(NETWORK_CONNECTION_EVENT))
}

export async function sendConnectionRequest(targetUserId: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Sign in on the live network to connect.')
  await v1SendConnectionRequest(targetUserId)
  notifyChange()
}

export async function respondConnectionRequest(
  requestId: string,
  accept: boolean,
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Sign in required.')
  await v1RespondConnectionRequest(requestId, accept)
  notifyChange()
}

export async function removeConnection(targetUserId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  await v1RemoveConnection(targetUserId)
  notifyChange()
}

export async function fetchIncomingRequestIdFromUser(
  fromUserId: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const { requestId } = await v1GetIncomingConnectionRequestId(fromUserId)
  return requestId
}

export async function fetchPendingConnectionRequests(): Promise<NetworkPendingRequest[]> {
  if (!isSupabaseConfigured()) return []
  const { requests } = await v1GetPendingConnectionRequests()
  return requests
}

export async function searchNetworkPeople(
  query: string,
  limit = 24,
): Promise<NetworkPersonCard[]> {
  if (!isSupabaseConfigured()) return []
  const { people } = await v1SearchNetworkPeople(query, limit)
  return people
}

export async function fetchSuggestedPeople(limit = 6): Promise<NetworkPersonCard[]> {
  if (!isSupabaseConfigured()) return []
  const { people } = await v1GetSuggestedPeople(limit)
  return people
}

export async function fetchConnectionsList(
  userId: string,
): Promise<Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>[]> {
  if (!isSupabaseConfigured()) return []
  const { connections } = await v1GetConnectionsList(userId)
  return connections
}

export async function fetchMutualConnections(
  targetUserId: string,
  limit = 12,
): Promise<Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>[]> {
  if (!isSupabaseConfigured()) return []
  const { mutuals } = await v1GetMutualConnections(targetUserId, limit)
  return mutuals
}
