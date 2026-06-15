import type { FeedReactionKind } from '@/modules/feed/types/feed.types'

export const FEED_REACTION_OPTIONS: {
  kind: FeedReactionKind
  label: string
  emoji: string
  activeClass: string
  bubbleClass: string
}[] = [
  { kind: 'like', label: 'Like', emoji: '👍', activeClass: 'text-blue-600', bubbleClass: 'bg-blue-500' },
  { kind: 'love', label: 'Love', emoji: '❤️', activeClass: 'text-red-500', bubbleClass: 'bg-red-500' },
  { kind: 'haha', label: 'Haha', emoji: '😂', activeClass: 'text-yellow-600', bubbleClass: 'bg-yellow-400' },
  { kind: 'wow', label: 'Wow', emoji: '😮', activeClass: 'text-yellow-600', bubbleClass: 'bg-yellow-400' },
  { kind: 'sad', label: 'Sad', emoji: '😢', activeClass: 'text-yellow-600', bubbleClass: 'bg-yellow-400' },
  { kind: 'angry', label: 'Angry', emoji: '😡', activeClass: 'text-orange-500', bubbleClass: 'bg-orange-500' },
]

export function feedReactionMeta(kind: FeedReactionKind) {
  return FEED_REACTION_OPTIONS.find((r) => r.kind === kind) ?? FEED_REACTION_OPTIONS[0]!
}
