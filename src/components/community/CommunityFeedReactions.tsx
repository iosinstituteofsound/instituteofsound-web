import { useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import type { CommunityFeedPost, FeedReactionKind } from '@/lib/community/feedTypes'
import { togglePostReaction } from '@/lib/community/feedService'

const REACTIONS: { kind: FeedReactionKind; label: string; icon: string }[] = [
  { kind: 'fire', label: 'Fire', icon: '🔥' },
  { kind: 'headphones', label: 'Listen', icon: '🎧' },
  { kind: 'bolt', label: 'Bolt', icon: '⚡' },
]

interface CommunityFeedReactionsProps {
  post: CommunityFeedPost
  onChange?: () => void
}

export function CommunityFeedReactions({ post, onChange }: CommunityFeedReactionsProps) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)

  if (!user) return null

  const react = async (kind: FeedReactionKind) => {
    if (busy) return
    setBusy(true)
    try {
      await togglePostReaction(post.id, user.id, kind)
      onChange?.()
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="community-feed-reactions" aria-label="Reactions">
      {REACTIONS.map(({ kind, label, icon }) => {
        const count = post.reactions[kind]
        const active = post.myReaction === kind
        return (
          <button
            key={kind}
            type="button"
            className={clsx('community-feed-reaction-btn', active && 'community-feed-reaction-btn-active')}
            disabled={busy}
            aria-pressed={active}
            aria-label={`${label}${count > 0 ? `, ${count}` : ''}`}
            onClick={() => void react(kind)}
          >
            <span aria-hidden>{icon}</span>
            {count > 0 && <span className="community-feed-reaction-count">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
