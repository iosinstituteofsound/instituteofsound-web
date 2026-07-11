import { useMemo } from 'react'
import {
  useMessengerLiveStore,
  type TypingPeerPhase,
  type TypingPeerState,
} from '@/modules/messenger/store/messenger-live-store'

const EMPTY_PEERS: TypingPeerState[] = []

function resolvePhase(peers: TypingPeerState[]): TypingPeerPhase | null {
  if (peers.some((peer) => peer.phase === 'replying')) return 'replying'
  if (peers.some((peer) => peer.phase === 'typing')) return 'typing'
  if (peers.some((peer) => peer.phase === 'thinking')) return 'thinking'
  if (peers.some((peer) => peer.phase === 'confused')) return 'confused'
  return null
}

export function useThreadTypingUsers(threadId: string | undefined, viewerId?: string | null) {
  const peers = useMessengerLiveStore((s) =>
    threadId ? (s.typingByThread[threadId] ?? EMPTY_PEERS) : EMPTY_PEERS,
  )

  return useMemo(() => {
    const visible = viewerId ? peers.filter((peer) => peer.userId !== viewerId) : peers
    return {
      peers: visible,
      isPeerTyping: visible.length > 0,
      phase: resolvePhase(visible),
      typingUsers: visible.map((peer) => peer.userId),
    }
  }, [peers, viewerId])
}
