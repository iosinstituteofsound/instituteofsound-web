import { create } from 'zustand'
import type { MessengerTypingMode } from '@/modules/messenger/types/messenger.types'

export type TypingPeerPhase = 'typing' | 'replying' | 'thinking' | 'confused'

export type TypingPeerState = {
  userId: string
  phase: TypingPeerPhase
}

type MessengerLiveState = {
  unreadCount: number
  ready: boolean
  typingByThread: Record<string, TypingPeerState[]>
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  setTyping: (
    threadId: string,
    userId: string,
    isTyping: boolean,
    mode?: MessengerTypingMode,
  ) => void
  clearTypingForUser: (threadId: string, userId: string) => void
  reset: () => void
}

const TYPING_TO_THINKING_MS = 1100
const CONFUSED_HOLD_MS = 3500
const RECENT_TYPING_WINDOW_MS = 90_000

const thinkingTimers = new Map<string, ReturnType<typeof setTimeout>>()
const confusedTimers = new Map<string, ReturnType<typeof setTimeout>>()
const lastTypingStartedAt = new Map<string, number>()

function peerKey(threadId: string, userId: string) {
  return `${threadId}:${userId}`
}

function clearThinkingTimer(threadId: string, userId: string) {
  const key = peerKey(threadId, userId)
  const timer = thinkingTimers.get(key)
  if (timer) clearTimeout(timer)
  thinkingTimers.delete(key)
}

function clearConfusedTimer(threadId: string, userId: string) {
  const key = peerKey(threadId, userId)
  const timer = confusedTimers.get(key)
  if (timer) clearTimeout(timer)
  confusedTimers.delete(key)
}

function clearPeerTimers(threadId: string, userId: string) {
  clearThinkingTimer(threadId, userId)
  clearConfusedTimer(threadId, userId)
}

function upsertTypingPeer(
  peers: TypingPeerState[],
  userId: string,
  phase: TypingPeerPhase,
): TypingPeerState[] {
  return [...peers.filter((peer) => peer.userId !== userId), { userId, phase }]
}

function removeTypingPeer(peers: TypingPeerState[], userId: string): TypingPeerState[] {
  return peers.filter((peer) => peer.userId !== userId)
}

function activeComposePhase(mode?: MessengerTypingMode): TypingPeerPhase {
  return mode === 'replying' ? 'replying' : 'typing'
}

function beginConfusedOutro(
  set: (
    partial: Partial<MessengerLiveState> | ((state: MessengerLiveState) => Partial<MessengerLiveState>),
  ) => void,
  threadId: string,
  userId: string,
) {
  clearConfusedTimer(threadId, userId)

  set((state) => ({
    typingByThread: {
      ...state.typingByThread,
      [threadId]: upsertTypingPeer(state.typingByThread[threadId] ?? [], userId, 'confused'),
    },
  }))

  confusedTimers.set(
    peerKey(threadId, userId),
    setTimeout(() => {
      confusedTimers.delete(peerKey(threadId, userId))
      lastTypingStartedAt.delete(peerKey(threadId, userId))
      set((state) => {
        const peers = state.typingByThread[threadId] ?? []
        const peer = peers.find((entry) => entry.userId === userId)
        if (!peer || peer.phase !== 'confused') return {}
        return {
          typingByThread: {
            ...state.typingByThread,
            [threadId]: removeTypingPeer(peers, userId),
          },
        }
      })
    }, CONFUSED_HOLD_MS),
  )
}

export const useMessengerLiveStore = create<MessengerLiveState>((set, get) => ({
  unreadCount: 0,
  ready: false,
  typingByThread: {},
  setUnreadCount: (count) => set({ unreadCount: count, ready: true }),
  incrementUnread: () =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
      ready: true,
    })),
  setTyping: (threadId, userId, isTyping, mode) => {
    if (!threadId || !userId) return

    if (!isTyping) {
      clearThinkingTimer(threadId, userId)

      const key = peerKey(threadId, userId)
      const current = get().typingByThread[threadId] ?? []
      const existing = current.find((peer) => peer.userId === userId)

      if (existing?.phase === 'confused') return

      const recentStart = lastTypingStartedAt.get(key)
      const hadRecentTyping =
        Boolean(existing) ||
        (typeof recentStart === 'number' && Date.now() - recentStart < RECENT_TYPING_WINDOW_MS)

      if (!hadRecentTyping) return

      beginConfusedOutro(set, threadId, userId)
      return
    }

    // New keystrokes always win over confused/thinking — show typing/replying immediately.
    clearPeerTimers(threadId, userId)
    lastTypingStartedAt.set(peerKey(threadId, userId), Date.now())

    const composePhase = activeComposePhase(mode)

    set((state) => ({
      typingByThread: {
        ...state.typingByThread,
        [threadId]: upsertTypingPeer(state.typingByThread[threadId] ?? [], userId, composePhase),
      },
    }))

    thinkingTimers.set(
      peerKey(threadId, userId),
      setTimeout(() => {
        thinkingTimers.delete(peerKey(threadId, userId))
        const peers = get().typingByThread[threadId] ?? []
        const peer = peers.find((entry) => entry.userId === userId)
        if (!peer || (peer.phase !== 'typing' && peer.phase !== 'replying')) return

        set((state) => {
          const current = state.typingByThread[threadId] ?? []
          if (
            !current.some(
              (entry) =>
                entry.userId === userId &&
                (entry.phase === 'typing' || entry.phase === 'replying'),
            )
          ) {
            return {}
          }
          return {
            typingByThread: {
              ...state.typingByThread,
              [threadId]: upsertTypingPeer(current, userId, 'thinking'),
            },
          }
        })
      }, TYPING_TO_THINKING_MS),
    )
  },
  clearTypingForUser: (threadId, userId) => {
    clearPeerTimers(threadId, userId)
    lastTypingStartedAt.delete(peerKey(threadId, userId))
    set((state) => {
      const current = state.typingByThread[threadId] ?? []
      if (!current.some((peer) => peer.userId === userId)) return {}
      return {
        typingByThread: {
          ...state.typingByThread,
          [threadId]: removeTypingPeer(current, userId),
        },
      }
    })
  },
  reset: () => {
    for (const timer of thinkingTimers.values()) clearTimeout(timer)
    for (const timer of confusedTimers.values()) clearTimeout(timer)
    thinkingTimers.clear()
    confusedTimers.clear()
    lastTypingStartedAt.clear()
    set({ unreadCount: 0, ready: false, typingByThread: {} })
  },
}))
