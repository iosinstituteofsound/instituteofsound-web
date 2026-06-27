import angryImg from '@/shared/assets/reactions/angry.png'
import hahaImg from '@/shared/assets/reactions/haha.png'
import likeImg from '@/shared/assets/reactions/like.png'
import loveImg from '@/shared/assets/reactions/love.png'
import sadImg from '@/shared/assets/reactions/sad.png'
import wowImg from '@/shared/assets/reactions/wow.png'
import { animatedEmojiUrl } from '@/shared/lib/emoji/animated-emoji'
import { reactionMeta } from '@/shared/lib/reactions/reaction-options'
import type { ReactionKind } from '@/shared/lib/reactions/reaction-options'

export const REACTION_ASSETS: Record<ReactionKind, string> = {
  like: likeImg,
  love: loveImg,
  haha: hahaImg,
  wow: wowImg,
  sad: sadImg,
  angry: angryImg,
}

export function prefetchReactionAssets(kinds: ReactionKind[]) {
  for (const kind of kinds) {
    const staticImg = new Image()
    staticImg.src = REACTION_ASSETS[kind]

    const animatedImg = new Image()
    animatedImg.src = animatedEmojiUrl(reactionMeta(kind).notoSlug)
  }
}
