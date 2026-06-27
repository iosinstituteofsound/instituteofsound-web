export const REACTION_KINDS = ['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const

export type ReactionKind = (typeof REACTION_KINDS)[number]

export type ReactionOption = {
  kind: ReactionKind
  label: string
  emoji: string
  notoSlug: string
  activeClass: string
  bubbleClass: string
}

export const REACTION_OPTIONS: ReactionOption[] = [
  { kind: 'like', label: 'Like', emoji: '👍', notoSlug: '1f44d', activeClass: 'text-blue-600', bubbleClass: 'bg-blue-500' },
  { kind: 'love', label: 'Love', emoji: '❤️', notoSlug: '2764_fe0f', activeClass: 'text-red-500', bubbleClass: 'bg-red-500' },
  { kind: 'haha', label: 'Haha', emoji: '😂', notoSlug: '1f602', activeClass: 'text-yellow-600', bubbleClass: 'bg-yellow-400' },
  { kind: 'wow', label: 'Wow', emoji: '😮', notoSlug: '1f62e', activeClass: 'text-yellow-600', bubbleClass: 'bg-yellow-400' },
  { kind: 'sad', label: 'Sad', emoji: '😢', notoSlug: '1f622', activeClass: 'text-yellow-600', bubbleClass: 'bg-yellow-400' },
  { kind: 'angry', label: 'Angry', emoji: '😡', notoSlug: '1f621', activeClass: 'text-orange-500', bubbleClass: 'bg-orange-500' },
]

export const REACTION_EMOJI_VALUES = REACTION_OPTIONS.map((option) => option.emoji)

export function reactionMeta(kind: ReactionKind) {
  return REACTION_OPTIONS.find((option) => option.kind === kind) ?? REACTION_OPTIONS[0]!
}

export function reactionEmojiForKind(kind: ReactionKind) {
  return reactionMeta(kind).emoji
}

export function reactionKindForEmoji(emoji: string): ReactionKind | null {
  const normalized = emoji.trim()
  const match = REACTION_OPTIONS.find((option) => option.emoji === normalized)
  return match?.kind ?? null
}
