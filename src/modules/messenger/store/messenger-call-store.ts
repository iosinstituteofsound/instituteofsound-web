import { create } from 'zustand'
import type { CallMediaMode, CallPhase } from '@/modules/messenger/types/call.types'

export type MessengerCallSnapshot = {
  phase: CallPhase
  callId: string | null
  threadId: string | null
  remoteUserId: string | null
  remoteName: string | null
  remoteAvatarUrl: string | null
  mediaMode: CallMediaMode | null
  isMuted: boolean
  isCameraOff: boolean
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  error: string | null
}

const idleState: MessengerCallSnapshot = {
  phase: 'idle',
  callId: null,
  threadId: null,
  remoteUserId: null,
  remoteName: null,
  remoteAvatarUrl: null,
  mediaMode: null,
  isMuted: false,
  isCameraOff: false,
  localStream: null,
  remoteStream: null,
  error: null,
}

type MessengerCallStore = MessengerCallSnapshot & {
  patch: (partial: Partial<MessengerCallSnapshot>) => void
  reset: () => void
}

export const useMessengerCallStore = create<MessengerCallStore>((set) => ({
  ...idleState,
  patch: (partial) => set((state) => ({ ...state, ...partial })),
  reset: () => set(idleState),
}))

export function isCallActive(phase: CallPhase): boolean {
  return phase === 'outgoing' || phase === 'incoming' || phase === 'connecting' || phase === 'active'
}
