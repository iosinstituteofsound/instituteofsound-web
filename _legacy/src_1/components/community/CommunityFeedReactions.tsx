import { useState } from 'react'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { sharePost } from '@/lib/community/sharePost'
import { CommunityFeedEngagement } from '@/components/community/CommunityFeedEngagement'

interface CommunityFeedReactionsProps {
  post: CommunityFeedPost
  onChange?: () => void
}

/** Embedded posts (wire hero, editorial) — same engagement bar as the main feed. */
export function CommunityFeedReactions({ post, onChange }: CommunityFeedReactionsProps) {
  const [shareLabel, setShareLabel] = useState('Share')

  return (
    <CommunityFeedEngagement
      post={post}
      onReactionChange={onChange}
      shareLabel={shareLabel}
      onShare={async () => {
        try {
          const result = await sharePost(post.id)
          setShareLabel(result === 'copied' ? 'Copied' : 'Shared')
          window.setTimeout(() => setShareLabel('Share'), 2000)
        } catch {
          /* cancelled */
        }
      }}
    />
  )
}
