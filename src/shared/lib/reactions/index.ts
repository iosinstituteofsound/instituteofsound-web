export {
  REACTION_KINDS,
  REACTION_OPTIONS,
  REACTION_EMOJI_VALUES,
  reactionMeta,
  reactionEmojiForKind,
  reactionKindForEmoji,
  type ReactionKind,
  type ReactionOption,
} from '@/shared/lib/reactions/reaction-options'

export { REACTION_ASSETS, prefetchReactionAssets } from '@/shared/lib/reactions/reaction-assets'

export {
  isReactionSoundEnabled,
  setReactionSoundEnabled,
  unlockReactionSounds,
  playReactionSound,
  resetReactionSoundSession,
} from '@/shared/lib/reactions/reaction-sounds'

export { groupReactionsByEmoji } from '@/shared/lib/reactions/group-reactions'

export {
  ENGAGEMENT_REACTION_STATE_CLASS,
  COMMENT_REACTION_STATE_CLASS,
  REEL_REACTION_STATE_CLASS,
  reactionStateClass,
} from '@/shared/lib/reactions/reaction-state-classes'
