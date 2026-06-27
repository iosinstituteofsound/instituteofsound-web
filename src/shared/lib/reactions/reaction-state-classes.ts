import type { ReactionKind } from '@/shared/lib/reactions/reaction-options'

export const ENGAGEMENT_REACTION_STATE_CLASS: Record<ReactionKind, string> = {
  like: 'is-active',
  love: 'is-loved',
  haha: 'is-haha',
  wow: 'is-wow',
  sad: 'is-sad',
  angry: 'is-angry',
}

export const COMMENT_REACTION_STATE_CLASS: Record<ReactionKind, string> = {
  like: 'text-primary',
  love: 'text-rose-500',
  haha: 'text-amber-500',
  wow: 'text-amber-400',
  sad: 'text-sky-400',
  angry: 'text-orange-500',
}

export const REEL_REACTION_STATE_CLASS: Record<ReactionKind, string> = {
  like: 'reel-actions__btn--liked',
  love: 'reel-actions__btn--loved',
  haha: 'reel-actions__btn--haha',
  wow: 'reel-actions__btn--wow',
  sad: 'reel-actions__btn--sad',
  angry: 'reel-actions__btn--angry',
}

export function reactionStateClass(
  kind: ReactionKind | null | undefined,
  map: Record<ReactionKind, string>,
): string | undefined {
  return kind ? map[kind] : undefined
}
