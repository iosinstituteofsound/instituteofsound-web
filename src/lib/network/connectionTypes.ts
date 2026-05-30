export type ViewerConnectionStatus =
  | 'none'
  | 'pending_out'
  | 'pending_in'
  | 'connected'

export interface NetworkPersonCard {
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  role: string
  totalDb: number
  connectionStatus: ViewerConnectionStatus
}

export interface NetworkPendingRequest {
  requestId: string
  fromUserId: string
  fromName: string
  fromHandle: string
  fromAvatarUrl?: string
  createdAt: string
}
