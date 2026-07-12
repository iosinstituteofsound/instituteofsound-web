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
  PipCorner,
  PrimaryVideoFeed,
} from '@/modules/messenger/types/call.types'

type ViewerContext = {
  userId: string
  displayName: string
  avatarUrl?: string
}

let peer: WebRTCPeerSession | null = null
let listenersRegistered = false
let disconnectTimer: ReturnType<typeof setTimeout> | null = null
let iceRestartAttempted = false

function patch(partial: Parameters<ReturnType<typeof useMessengerCallStore.getState>['patch']>[0]) {
  useMessengerCallStore.getState().patch(partial)
}

function clearDisconnectTimer(): void {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer)
    disconnectTimer = null
  }
}

function cleanupPeer(): void {
  clearDisconnectTimer()
  iceRestartAttempted = false
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

async function attemptIceRestart(callId: string, threadId: string, toUserId: string): Promise<void> {
  if (!peer || iceRestartAttempted) return
  iceRestartAttempted = true
  try {
    const offer = await peer.createRenegotiationOffer({ iceRestart: true })
    await realtimeSocketClient.emitCallOffer({
      ...relayBase(callId, threadId, toUserId),
      sdp: offer,
    })
  } catch {
    messengerCallController.endCall('error')
  }
}

function handleConnectionStateChange(
  state: RTCPeerConnectionState,
  callId: string,
  threadId: string,
  toUserId: string,
): void {
  if (state === 'connected') {
    clearDisconnectTimer()
    iceRestartAttempted = false
    return
  }

  if (state === 'disconnected') {
    clearDisconnectTimer()
    disconnectTimer = setTimeout(() => {
      const currentPeer = peer
      if (!currentPeer || currentPeer.getConnectionState() !== 'disconnected') return
      void attemptIceRestart(callId, threadId, toUserId)
    }, 8000)
    return
  }

  if (state === 'failed') {
    clearDisconnectTimer()
    if (!iceRestartAttempted) {
      void attemptIceRestart(callId, threadId, toUserId)
      return
    }
    messengerCallController.endCall('error')
  }
}

function createPeer(mediaMode: CallMediaMode, callId: string, threadId: string, toUserId: string) {
  cleanupPeer()
  peer = new WebRTCPeerSession(mediaMode, {
    onIceCandidate: (candidate) => {
      void realtimeSocketClient.emitCallIce({ callId, threadId, toUserId, candidate })
    },
    onRemoteStream: (stream) => {
      patch({ remoteStream: stream, phase: 'active', startedAt: Date.now() })
    },
    onConnectionStateChange: (connectionState) => {
      handleConnectionStateChange(connectionState, callId, threadId, toUserId)
    },
  })
  return peer
}

function relayBase(callId: string, threadId: string, toUserId: string) {
  return { callId, threadId, toUserId }
}

export function getActiveCallPeer(): WebRTCPeerSession | null {
  return peer
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
      initiatorUserId: viewer.userId,
      isMuted: false,
      isCameraOff: mediaMode === 'voice',
      isSpeakerOn: false,
      error: null,
      localStream: null,
      remoteStream: null,
      startedAt: null,
      primaryVideoFeed: 'remote',
      isPipHidden: false,
      pipCorner: 'topRight',
      cameraFacing: 'user',
      connectionQuality: null,
      answerWithMuted: false,
      answerWithCameraOff: false,
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

    const answerMuted = state.answerWithMuted
    const answerCameraOff = state.answerWithCameraOff

    patch({ phase: 'connecting', error: null })

    try {
      const session = createPeer(state.mediaMode, state.callId, state.threadId, state.remoteUserId)
      const localStream = await session.acquireLocalMedia()
      const isCameraOff =
        state.mediaMode === 'voice' || (state.mediaMode === 'video' && answerCameraOff)
      patch({ localStream, isCameraOff, isMuted: answerMuted })

      if (answerMuted) {
        session.setMicEnabled(false)
      }
      if (isCameraOff) {
        session.setCameraEnabled(false)
      }

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
    realtimeSocketClient
      .emitCallReject({
        ...relayBase(state.callId, state.threadId, state.remoteUserId),
        reason: 'rejected',
        initiatorId: state.initiatorUserId ?? state.remoteUserId,
        mediaMode: state.mediaMode ?? undefined,
      })
      .catch(() => undefined)
    resetCall()
  },

  endCall(reason: CallEndReason = 'hangup'): void {
    const state = useMessengerCallStore.getState()
    if (!isCallActive(state.phase)) {
      resetCall()
      return
    }
    if (state.callId && state.threadId && state.remoteUserId) {
      const durationSec =
        state.startedAt != null
          ? Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000))
          : undefined
      realtimeSocketClient
        .emitCallEnd({
          ...relayBase(state.callId, state.threadId, state.remoteUserId),
          reason,
          durationSec,
          initiatorId: state.initiatorUserId ?? undefined,
          mediaMode: state.mediaMode ?? undefined,
        })
        .catch(() => undefined)
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

  toggleSpeaker(): void {
    const state = useMessengerCallStore.getState()
    patch({ isSpeakerOn: !state.isSpeakerOn })
  },

  swapVideoFeed(): void {
    const state = useMessengerCallStore.getState()
    const next: PrimaryVideoFeed = state.primaryVideoFeed === 'remote' ? 'local' : 'remote'
    patch({ primaryVideoFeed: next, isPipHidden: false })
  },

  setPipHidden(hidden: boolean): void {
    patch({ isPipHidden: hidden })
  },

  setPipCorner(corner: PipCorner): void {
    patch({ pipCorner: corner, isPipHidden: false })
  },

  setAnswerWithMuted(muted: boolean): void {
    patch({ answerWithMuted: muted })
  },

  setAnswerWithCameraOff(off: boolean): void {
    patch({ answerWithCameraOff: off })
  },

  async flipCamera(): Promise<void> {
    if (!peer) return
    try {
      const facing = await peer.switchCamera()
      patch({ cameraFacing: facing })
    } catch {
      toast.error('Could not switch camera')
    }
  },

  async upgradeToVideo(): Promise<void> {
    const state = useMessengerCallStore.getState()
    if (!peer || state.mediaMode === 'video' || !state.callId || !state.threadId || !state.remoteUserId) {
      return
    }

    try {
      const localStream = await peer.addVideoTrack(state.cameraFacing)
      const offer = await peer.createRenegotiationOffer()
      const sent = await realtimeSocketClient.emitCallOffer({
        ...relayBase(state.callId, state.threadId, state.remoteUserId),
        mediaMode: 'video',
        sdp: offer,
      })
      if (!sent) {
        throw new Error('Realtime socket not connected')
      }
      patch({
        mediaMode: 'video',
        localStream,
        isCameraOff: false,
        primaryVideoFeed: 'remote',
      })
    } catch {
      toast.error('Could not switch to video call')
    }
  },

  async pollConnectionQuality(): Promise<void> {
    if (!peer) return
    const quality = await peer.getConnectionQuality()
    patch({ connectionQuality: quality })
  },
}

const pendingOffers = new Map<string, RTCSessionDescriptionInit>()

async function handleInvite(payload: CallPeerPayload): Promise<void> {
  if (!payload.fromUserId) return
  const state = useMessengerCallStore.getState()
  if (isCallActive(state.phase)) {
    realtimeSocketClient
      .emitCallReject({
        callId: payload.callId,
        threadId: payload.threadId,
        toUserId: payload.fromUserId,
        reason: 'busy',
        initiatorId: payload.fromUserId,
        mediaMode: payload.mediaMode,
      })
      .catch(() => undefined)
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
    initiatorUserId: payload.fromUserId,
    isCameraOff: payload.mediaMode !== 'video',
    error: null,
    localStream: null,
    remoteStream: null,
    startedAt: null,
    primaryVideoFeed: 'remote',
    isPipHidden: false,
    pipCorner: 'topRight',
    cameraFacing: 'user',
    connectionQuality: null,
    answerWithMuted: false,
    answerWithCameraOff: false,
  })
}

async function handleAccept(payload: CallPeerPayload): Promise<void> {
  const state = useMessengerCallStore.getState()
  if (state.callId !== payload.callId || state.phase !== 'outgoing') return

  patch({ phase: 'connecting' })

  if (payload.sdp && peer) {
    await peer.applyAnswer(payload.sdp)
    patch({ phase: 'active', startedAt: Date.now() })
  }
}

async function handleOffer(payload: CallPeerPayload): Promise<void> {
  const state = useMessengerCallStore.getState()
  if (state.callId !== payload.callId || !payload.sdp) return

  if (state.phase === 'active' && peer && state.threadId && state.remoteUserId) {
    try {
      if (payload.mediaMode === 'video') {
        patch({ mediaMode: 'video', isCameraOff: false })
      }
      const answer = await peer.acceptRenegotiationOffer(payload.sdp)
      await realtimeSocketClient.emitCallAnswer({
        ...relayBase(state.callId, state.threadId, state.remoteUserId),
        sdp: answer,
      })
    } catch {
      messengerCallController.endCall('error')
    }
    return
  }

  if (peer) {
    pendingOffers.set(payload.callId, payload.sdp)
  }
}

async function handleAnswer(payload: CallPeerPayload): Promise<void> {
  const state = useMessengerCallStore.getState()
  if (state.callId !== payload.callId || !peer || !payload.sdp) return

  if (state.phase === 'active' || state.phase === 'connecting') {
    await peer.applyRenegotiationAnswer(payload.sdp)
    if (state.phase === 'connecting') {
      patch({ phase: 'active', startedAt: Date.now() })
    }
    iceRestartAttempted = false
    return
  }

  await peer.applyAnswer(payload.sdp)
  patch({ phase: 'active', startedAt: Date.now() })
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
