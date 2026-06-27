import { toast } from '@/shared/components/ui/sonner'
import { env } from '@/shared/config/env'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import { WebRTCPeerSession } from '@/modules/messenger/lib/webrtc-peer-session'
import { isCallActive, useMessengerCallStore } from '@/modules/messenger/store/messenger-call-store'
import type {
  CallEndReason,
  CallMediaMode,
  CallPeerPayload,
  CallTarget,
} from '@/modules/messenger/types/call.types'

type ViewerContext = {
  userId: string
  displayName: string
  avatarUrl?: string
}

let peer: WebRTCPeerSession | null = null
let listenersRegistered = false

function patch(partial: Parameters<ReturnType<typeof useMessengerCallStore.getState>['patch']>[0]) {
  useMessengerCallStore.getState().patch(partial)
}

function cleanupPeer(): void {
  peer?.close()
  peer = null
}

function resetCall(): void {
  cleanupPeer()
  useMessengerCallStore.getState().reset()
}

function ensureWsEnabled(): boolean {
  if (env.wsEnabled) return true
  toast.error('Calls need realtime — enable WebSocket in settings.')
  return false
}

function createPeer(mediaMode: CallMediaMode, callId: string, threadId: string, toUserId: string) {
  cleanupPeer()
  peer = new WebRTCPeerSession(mediaMode, {
    onIceCandidate: (candidate) => {
      void realtimeSocketClient.emitCallIce({ callId, threadId, toUserId, candidate })
    },
    onRemoteStream: (stream) => {
      patch({ remoteStream: stream, phase: 'active' })
    },
    onConnectionStateChange: (state) => {
      if (state === 'failed') {
        messengerCallController.endCall('error')
      }
    },
  })
  return peer
}

function relayBase(callId: string, threadId: string, toUserId: string) {
  return { callId, threadId, toUserId }
}

export const messengerCallController = {
  async startCall(target: CallTarget, mediaMode: CallMediaMode, viewer: ViewerContext): Promise<void> {
    if (!ensureWsEnabled()) return
    const { phase } = useMessengerCallStore.getState()
    if (isCallActive(phase)) {
      toast.error('Already on a call')
      return
    }

    const callId = crypto.randomUUID()
    patch({
      phase: 'outgoing',
      callId,
      threadId: target.threadId,
      remoteUserId: target.remoteUserId,
      remoteName: target.remoteName,
      remoteAvatarUrl: target.remoteAvatarUrl ?? null,
      mediaMode,
      isMuted: false,
      isCameraOff: mediaMode === 'voice',
      error: null,
      localStream: null,
      remoteStream: null,
    })

    try {
      const session = createPeer(mediaMode, callId, target.threadId, target.remoteUserId)
      const localStream = await session.acquireLocalMedia()
      patch({ localStream })
      const offer = await session.createOffer()

      const sent = await realtimeSocketClient.emitCallInvite({
        ...relayBase(callId, target.threadId, target.remoteUserId),
        mediaMode,
        fromUserName: viewer.displayName,
        fromAvatarUrl: viewer.avatarUrl,
        sdp: offer,
      })
      if (!sent) {
        throw new Error('Realtime socket not connected')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start call'
      patch({ phase: 'ended', error: message })
      cleanupPeer()
      if (message.includes('socket')) {
        toast.error('Call server not connected — API running hai? Page refresh karo.')
      } else {
        toast.error('Microphone/camera permission needed for calls')
      }
      setTimeout(resetCall, 1200)
    }
  },

  async acceptIncoming(viewer: ViewerContext): Promise<void> {
    const state = useMessengerCallStore.getState()
    if (state.phase !== 'incoming' || !state.callId || !state.threadId || !state.remoteUserId || !state.mediaMode) {
      return
    }

    patch({ phase: 'connecting', error: null })

    try {
      const session = createPeer(state.mediaMode, state.callId, state.threadId, state.remoteUserId)
      const localStream = await session.acquireLocalMedia()
      patch({ localStream, isCameraOff: state.mediaMode === 'voice' })

      const pendingOffer = pendingOffers.get(state.callId)
      if (!pendingOffer) {
        await realtimeSocketClient.emitCallAccept({
          ...relayBase(state.callId, state.threadId, state.remoteUserId),
          fromUserName: viewer.displayName,
          fromAvatarUrl: viewer.avatarUrl,
        })
        return
      }

      const answer = await session.acceptOffer(pendingOffer)
      pendingOffers.delete(state.callId)
      const sent = await realtimeSocketClient.emitCallAccept({
        ...relayBase(state.callId, state.threadId, state.remoteUserId),
        fromUserName: viewer.displayName,
        fromAvatarUrl: viewer.avatarUrl,
        sdp: answer,
      })
      if (!sent) {
        throw new Error('Realtime socket not connected')
      }
    } catch {
      messengerCallController.rejectIncoming()
      toast.error('Could not join call — check mic/camera permissions')
    }
  },

  rejectIncoming(): void {
    const state = useMessengerCallStore.getState()
    if (state.phase !== 'incoming' || !state.callId || !state.threadId || !state.remoteUserId) {
      resetCall()
      return
    }
    realtimeSocketClient.emitCallReject({
      ...relayBase(state.callId, state.threadId, state.remoteUserId),
      reason: 'rejected',
    }).catch(() => undefined)
    resetCall()
  },

  endCall(reason: CallEndReason = 'hangup'): void {
    const state = useMessengerCallStore.getState()
    if (!isCallActive(state.phase)) {
      resetCall()
      return
    }
    if (state.callId && state.threadId && state.remoteUserId) {
      realtimeSocketClient.emitCallEnd({
        ...relayBase(state.callId, state.threadId, state.remoteUserId),
        reason,
      }).catch(() => undefined)
    }
    patch({ phase: 'ended' })
    cleanupPeer()
    setTimeout(resetCall, 600)
  },

  toggleMute(): void {
    const state = useMessengerCallStore.getState()
    const next = !state.isMuted
    peer?.setMicEnabled(!next)
    patch({ isMuted: next })
  },

  toggleCamera(): void {
    const state = useMessengerCallStore.getState()
    if (state.mediaMode !== 'video') return
    const next = !state.isCameraOff
    peer?.setCameraEnabled(!next)
    patch({ isCameraOff: next })
  },
}

const pendingOffers = new Map<string, RTCSessionDescriptionInit>()

async function handleInvite(payload: CallPeerPayload): Promise<void> {
  if (!payload.fromUserId) return
  const state = useMessengerCallStore.getState()
  if (isCallActive(state.phase)) {
    realtimeSocketClient.emitCallReject({
      callId: payload.callId,
      threadId: payload.threadId,
      toUserId: payload.fromUserId,
      reason: 'busy',
    }).catch(() => undefined)
    return
  }

  if (payload.sdp) {
    pendingOffers.set(payload.callId, payload.sdp)
  }

  patch({
    phase: 'incoming',
    callId: payload.callId,
    threadId: payload.threadId,
    remoteUserId: payload.fromUserId,
    remoteName: payload.fromUserName ?? 'Someone',
    remoteAvatarUrl: payload.fromAvatarUrl ?? null,
    mediaMode: payload.mediaMode ?? 'voice',
    isCameraOff: payload.mediaMode !== 'video',
    error: null,
    localStream: null,
    remoteStream: null,
  })
}

async function handleAccept(payload: CallPeerPayload): Promise<void> {
  const state = useMessengerCallStore.getState()
  if (state.callId !== payload.callId || state.phase !== 'outgoing') return

  patch({ phase: 'connecting' })

  if (payload.sdp && peer) {
    await peer.applyAnswer(payload.sdp)
    patch({ phase: 'active' })
  }
}

async function handleOffer(payload: CallPeerPayload): Promise<void> {
  const state = useMessengerCallStore.getState()
  if (state.callId !== payload.callId || !peer) return
  if (payload.sdp) {
    pendingOffers.set(payload.callId, payload.sdp)
  }
}

async function handleAnswer(payload: CallPeerPayload): Promise<void> {
  const state = useMessengerCallStore.getState()
  if (state.callId !== payload.callId || !peer || !payload.sdp) return
  await peer.applyAnswer(payload.sdp)
  patch({ phase: 'active' })
}

async function handleIce(payload: CallPeerPayload): Promise<void> {
  const state = useMessengerCallStore.getState()
  if (state.callId !== payload.callId || !peer || !payload.candidate) return
  await peer.addIceCandidate(payload.candidate)
}

function handleReject(payload: CallPeerPayload): void {
  const state = useMessengerCallStore.getState()
  if (state.callId !== payload.callId) return
  const message =
    payload.reason === 'busy' ? 'User is on another call' : 'Call declined'
  patch({ phase: 'ended', error: message })
  cleanupPeer()
  toast.message(message)
  setTimeout(resetCall, 1200)
}

function handleEnd(payload: CallPeerPayload): void {
  const state = useMessengerCallStore.getState()
  if (state.callId !== payload.callId) return
  patch({ phase: 'ended' })
  cleanupPeer()
  setTimeout(resetCall, 600)
}

export function registerMessengerCallHandlers(): void {
  if (listenersRegistered) return
  listenersRegistered = true

  realtimeSocketClient.onCallInvite((payload) => {
    void handleInvite(payload)
  })
  realtimeSocketClient.onCallAccept((payload) => {
    void handleAccept(payload)
  })
  realtimeSocketClient.onCallReject(handleReject)
  realtimeSocketClient.onCallOffer((payload) => {
    void handleOffer(payload)
  })
  realtimeSocketClient.onCallAnswer((payload) => {
    void handleAnswer(payload)
  })
  realtimeSocketClient.onCallIce((payload) => {
    void handleIce(payload)
  })
  realtimeSocketClient.onCallEnd(handleEnd)
}

export function resetMessengerCall(): void {
  resetCall()
}
