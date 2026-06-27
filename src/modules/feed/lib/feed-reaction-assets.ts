import type { FeedReactionKind } from '@/modules/feed/types/feed.types'
import { REACTION_ASSETS, prefetchReactionAssets } from '@/shared/lib/reactions/reaction-assets'

export const FEED_REACTION_ASSETS = REACTION_ASSETS as Record<FeedReactionKind, string>

export { prefetchReactionAssets }
