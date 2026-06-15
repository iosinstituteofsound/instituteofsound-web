import angryImg from '@/modules/feed/assets/reactions/angry.png'
import hahaImg from '@/modules/feed/assets/reactions/haha.png'
import likeImg from '@/modules/feed/assets/reactions/like.png'
import loveImg from '@/modules/feed/assets/reactions/love.png'
import sadImg from '@/modules/feed/assets/reactions/sad.png'
import wowImg from '@/modules/feed/assets/reactions/wow.png'
import { animatedEmojiUrl } from '@/modules/feed/lib/animated-emoji'
import { feedReactionMeta } from '@/modules/feed/lib/feed-reactions'
import type { FeedReactionKind } from '@/modules/feed/types/feed.types'

export const FEED_REACTION_ASSETS: Record<FeedReactionKind, string> = {
  like: likeImg,
  love: loveImg,
  haha: hahaImg,
  wow: wowImg,
  sad: sadImg,
  angry: angryImg,
}

export function prefetchReactionAssets(kinds: FeedReactionKind[]) {
  for (const kind of kinds) {
    const staticImg = new Image()
    staticImg.src = FEED_REACTION_ASSETS[kind]

    const animatedImg = new Image()
    animatedImg.src = animatedEmojiUrl(feedReactionMeta(kind).notoSlug)
  }
}
