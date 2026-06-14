import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import type { CommunityFeedPost, FeedReactionKind } from '@/lib/community/feedTypes'
import { togglePostReaction } from '@/lib/community/feedService'

const REACTIONS: {
  kind: FeedReactionKind
  label: string
  icon: string
  activeClass: string
}[] = [
  { kind: 'fire', label: 'Fire', icon: '🔥', activeClass: 'community-feed-react-fire' },
  { kind: 'headphones', label: 'Listen', icon: '🎧', activeClass: 'community-feed-react-headphones' },
  { kind: 'bolt', label: 'Bolt', icon: '⚡', activeClass: 'community-feed-react-bolt' },
]

function reactionMeta(kind: FeedReactionKind) {
  return REACTIONS.find((r) => r.kind === kind) ?? REACTIONS[0]!
}

interface CommunityFeedEngagementProps {
  post: CommunityFeedPost
  isDetail?: boolean
  onReactionChange?: () => void
  shareLabel: string
  onShare: () => void
}

export function CommunityFeedEngagement({
  post,
  isDetail = false,
  onReactionChange,
  shareLabel,
  onShare,
}: CommunityFeedEngagementProps) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const reactRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const longPressOpened = useRef(false)

  const counts = post.reactions
  const totalReactions = counts.fire + counts.headphones + counts.bolt
  const commentCount = post.commentCount ?? 0
  const activeKinds = REACTIONS.filter((r) => counts[r.kind] > 0).sort(
    (a, b) => counts[b.kind] - counts[a.kind]
  )
  const myReaction = post.myReaction ? reactionMeta(post.myReaction) : null

  const clearCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const openPicker = () => {
    clearCloseTimer()
    setPickerOpen(true)
  }

  const scheduleClosePicker = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setPickerOpen(false), 220)
  }

  useEffect(() => {
    if (!pickerOpen) return
    const onDoc = (e: MouseEvent) => {
      if (reactRef.current && !reactRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [pickerOpen])

  const react = async (kind: FeedReactionKind) => {
    if (!user || busy) return
    setBusy(true)
    try {
      await togglePostReaction(post.id, user.id, kind)
      onReactionChange?.()
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
    }
  }

  const onQuickReact = () => {
    if (longPressOpened.current) {
      longPressOpened.current = false
      return
    }
    if (!user) return
    if (post.myReaction) {
      void react(post.myReaction)
    } else {
      void react('fire')
    }
  }

  const onPickReaction = (kind: FeedReactionKind) => {
    setPickerOpen(false)
    void react(kind)
  }

  const showStats = totalReactions > 0 || commentCount > 0

  return (
    <div className="community-feed-engagement">
      {showStats && (
        <div className="community-feed-stats">
          {totalReactions > 0 && (
            <span className="community-feed-stats-reactions" aria-label={`${totalReactions} reactions`}>
              <span className="community-feed-stats-emojis" aria-hidden>
                {activeKinds.map((r) => (
                  <span key={r.kind} className="community-feed-stats-emoji">
                    {r.icon}
                  </span>
                ))}
              </span>
              <span className="community-feed-stats-count">{totalReactions}</span>
            </span>
          )}
          {commentCount > 0 && !isDetail && (
            <Link to={`/feed/${post.id}`} className="community-feed-stats-comments">
              {commentCount} comment{commentCount === 1 ? '' : 's'}
            </Link>
          )}
          {commentCount > 0 && isDetail && (
            <span className="community-feed-stats-comments">{commentCount} comments</span>
          )}
        </div>
      )}

      <div className="community-feed-actionbar">
        {user ? (
          <div
            ref={reactRef}
            className="community-feed-react-wrap"
            onMouseEnter={openPicker}
            onMouseLeave={scheduleClosePicker}
          >
            {pickerOpen && (
              <div
                className="community-feed-react-picker"
                role="menu"
                aria-label="Choose reaction"
                onMouseEnter={openPicker}
                onMouseLeave={scheduleClosePicker}
              >
                {REACTIONS.map((r) => (
                  <button
                    key={r.kind}
                    type="button"
                    role="menuitem"
                    className={clsx(
                      'community-feed-react-picker-btn',
                      post.myReaction === r.kind && 'community-feed-react-picker-btn-active'
                    )}
                    disabled={busy}
                    title={r.label}
                    onClick={() => onPickReaction(r.kind)}
                  >
                    <span aria-hidden>{r.icon}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              className={clsx(
                'community-feed-actionbar-btn community-feed-actionbar-react',
                myReaction?.activeClass
              )}
              disabled={busy}
              onClick={onQuickReact}
              onPointerDown={() => {
                longPressOpened.current = false
                longPressTimer.current = setTimeout(() => {
                  longPressOpened.current = true
                  openPicker()
                }, 450)
              }}
              onPointerUp={() => {
                if (longPressTimer.current) clearTimeout(longPressTimer.current)
              }}
              onPointerCancel={() => {
                if (longPressTimer.current) clearTimeout(longPressTimer.current)
              }}
            >
              {myReaction ? (
                <span className="community-feed-actionbar-react-emoji" aria-hidden>
                  {myReaction.icon}
                </span>
              ) : (
                <ReactIcon className="community-feed-actionbar-icon" />
              )}
              <span>{myReaction ? myReaction.label : 'React'}</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="community-feed-actionbar-btn community-feed-actionbar-react">
            <ReactIcon className="community-feed-actionbar-icon" />
            <span>React</span>
          </Link>
        )}

        {!isDetail ? (
          <Link to={`/feed/${post.id}`} className="community-feed-actionbar-btn">
            <CommentIcon className="community-feed-actionbar-icon" />
            <span>Comment</span>
          </Link>
        ) : (
          <button
            type="button"
            className="community-feed-actionbar-btn"
            onClick={() => {
              document.getElementById('feed-post-comments')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <CommentIcon className="community-feed-actionbar-icon" />
            <span>Comment</span>
          </button>
        )}

        <button
          type="button"
          className="community-feed-actionbar-btn"
          onClick={() => void onShare()}
        >
          <ShareIcon className="community-feed-actionbar-icon" />
          <span>{shareLabel}</span>
        </button>
      </div>
    </div>
  )
}

function ReactIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M7.5 21h9a1.5 1.5 0 001.35-.85l2.7-5.4a1 1 0 00-.9-1.45H14V7a2 2 0 00-4 0v7H5.5a1 1 0 00-.98 1.2l1.5 7A1.5 1.5 0 007.5 21z"
      />
    </svg>
  )
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
      />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14"
      />
    </svg>
  )
}
