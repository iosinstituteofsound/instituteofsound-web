import type { FeedReactionKind } from '@/modules/feed/types/feed.types'
import {
  REACTION_OPTIONS,
  reactionMeta,
} from '@/shared/lib/reactions/reaction-options'

export const FEED_REACTION_OPTIONS: {
  kind: FeedReactionKind
  label: string
  emoji: string
  notoSlug: string
  activeClass: string
  bubbleClass: string
}[] = REACTION_OPTIONS as {
  kind: FeedReactionKind
  label: string
  emoji: string
  notoSlug: string
  activeClass: string
  bubbleClass: string
}[]

export function feedReactionMeta(kind: FeedReactionKind) {
  return reactionMeta(kind)
}
