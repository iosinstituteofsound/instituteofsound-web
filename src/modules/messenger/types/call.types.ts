/** Mirror instituteofsound-api messaging call types — keep in sync. */

export type CallMediaMode = 'voice' | 'video'

export type CallEndReason = 'hangup' | 'rejected' | 'busy' | 'unavailable' | 'error'

export type PipCorner = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'

export type CameraFacing = 'user' | 'environment'

export type ConnectionQuality = 'good' | 'fair' | 'poor'

export type PrimaryVideoFeed = 'remote' | 'local'

export type CallPhase = 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'active' | 'ended'

export const CALL_INVITE_EVENT = 'messenger:call:invite'
export const CALL_ACCEPT_EVENT = 'messenger:call:accept'
export const CALL_REJECT_EVENT = 'messenger:call:reject'
export const CALL_OFFER_EVENT = 'messenger:call:offer'
export const CALL_ANSWER_EVENT = 'messenger:call:answer'
export const CALL_ICE_EVENT = 'messenger:call:ice'
export const CALL_END_EVENT = 'messenger:call:end'

export type CallPeerPayload = {
  callId: string
  threadId: string
  fromUserId?: string
  toUserId?: string
  mediaMode?: CallMediaMode
  fromUserName?: string
  fromAvatarUrl?: string
  sdp?: RTCSessionDescriptionInit
  candidate?: RTCIceCandidateInit
  reason?: CallEndReason
  durationSec?: number
  initiatorId?: string
}

export type CallTarget = {
  threadId: string
  remoteUserId: string
  remoteName: string
  remoteAvatarUrl?: string
}
