import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { collabSkillLabel } from '@/lib/collab/constants'
import {
  acceptCollabResponse,
  confirmCollabComplete,
  fetchCollabResponses,
  respondToCollabPost,
} from '@/lib/collab/service'
import type { CollabBoardPost, CollabResponse } from '@/lib/collab/types'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { RankBadge } from '@/components/ui/RankBadge'
import { IOSImage } from '@/components/ui/IOSImage'
import type { CommunityRank } from '@/types'

interface CollabPostCardProps {
  post: CollabBoardPost
  expanded?: boolean
  onChange?: () => void
}

export function CollabPostCard({ post, expanded: expandedProp, onChange }: CollabPostCardProps) {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const [expanded, setExpanded] = useState(Boolean(expandedProp))
  const [responses, setResponses] = useState<CollabResponse[]>([])
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isOwner = user?.id === post.userId
  const isPartner = user?.id === post.acceptedResponderId
  const canRespond = Boolean(user && !isOwner && post.status === 'open')
  const handle = post.handle.startsWith('@') ? post.handle : `@${post.handle}`

  const loadResponses = useCallback(async () => {
    if (!user || (!isOwner && !isPartner)) return
    setLoadingResponses(true)
    try {
      setResponses(await fetchCollabResponses(post.id))
    } finally {
      setLoadingResponses(false)
    }
  }, [user, isOwner, isPartner, post.id])

  useEffect(() => {
    if (expanded) void loadResponses()
  }, [expanded, loadResponses])

  useEffect(() => {
    if (expandedProp) setExpanded(true)
  }, [expandedProp])

  const handleRespond = async () => {
    if (!user || !message.trim()) return
    setBusy(true)
    setError('')
    try {
      await respondToCollabPost(
        post.id,
        message.trim(),
        stats
          ? {
              id: user.id,
              displayName: stats.name,
              handle: memberHandleFromUser(user),
              avatarUrl: stats.avatarUrl,
              rank: stats.rank,
            }
          : {
              id: user.id,
              displayName: user.name,
              handle: memberHandleFromUser(user),
              rank: 'listener',
            },
        post.userId
      )
      setMessage('')
      onChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not respond')
    } finally {
      setBusy(false)
    }
  }

  const handleAccept = async (responseId: string) => {
    setBusy(true)
    setError('')
    try {
      await acceptCollabResponse(responseId)
      await loadResponses()
      onChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept')
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = async () => {
    setBusy(true)
    setError('')
    try {
      await confirmCollabComplete(post.id)
      onChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className={clsx('collab-post-card ios-card', expanded && 'collab-post-card-expanded')}>
      <div className="collab-post-head">
        <span className={clsx('collab-post-kind', `collab-post-kind-${post.kind}`)}>
          {post.kind === 'need' ? 'Need' : 'Offer'}
        </span>
        {post.responseCount > 0 && (
          <span className="collab-post-responses-pill">{post.responseCount} responses</span>
        )}
      </div>

      <h3 className="font-display text-xl font-bold mt-2">{post.title}</h3>
      <p className="text-sm text-signal/90 mt-2 whitespace-pre-wrap">{post.body}</p>

      <div className="collab-post-meta">
        {post.sceneCity && <span>{post.sceneCity}</span>}
        {post.sceneGenreSlug && <span>{post.sceneGenreSlug.replace(/-/g, ' ')}</span>}
        {post.skillSlugs.map((s) => (
          <span key={s} className="collab-post-skill">
            {collabSkillLabel(s)}
          </span>
        ))}
      </div>

      <Link to={networkProfilePath(handle)} className="collab-post-author">
        {post.avatarUrl ? (
          <IOSImage src={post.avatarUrl} alt="" width={40} className="collab-post-avatar" />
        ) : (
          <span className="collab-post-avatar-fallback">{post.displayName.charAt(0)}</span>
        )}
        <span>
          <strong>{post.displayName}</strong>
          <span className="block text-xs text-muted">{handle}</span>
        </span>
        <RankBadge rank={post.communityRank as CommunityRank} size="sm" />
      </Link>

      {canRespond && (
        <div className="collab-respond mt-4">
          <textarea
            className="collab-input collab-textarea"
            placeholder="Your pitch — gear, links, availability (max 400 chars)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={400}
            rows={3}
          />
          <button
            type="button"
            className="ios-btn ios-btn-primary !text-xs mt-2"
            disabled={busy || message.trim().length < 5}
            onClick={() => void handleRespond()}
          >
            Respond on board
          </button>
        </div>
      )}

      {(isOwner || isPartner) && post.status === 'filled' && (
        <div className="collab-complete mt-4">
          <p className="text-xs text-muted">
            Mark complete when the collab is done — both sides confirm for Collab Verified badge.
          </p>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className={post.ownerConfirmedAt ? 'text-mh-red' : 'text-muted'}>
              Owner {post.ownerConfirmedAt ? '✓' : '…'}
            </span>
            <span className={post.partnerConfirmedAt ? 'text-mh-red' : 'text-muted'}>
              Partner {post.partnerConfirmedAt ? '✓' : '…'}
            </span>
          </div>
          <button
            type="button"
            className="ios-btn ios-btn-ghost !text-xs mt-2"
            disabled={busy}
            onClick={() => void handleConfirm()}
          >
            I confirm this collab is complete
          </button>
        </div>
      )}

      {isOwner && post.status === 'open' && (
        <button
          type="button"
          className="text-sm text-mh-red mt-4 uppercase tracking-widest"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Hide responses' : `View responses (${post.responseCount})`}
        </button>
      )}

      {expanded && isOwner && (
        <div className="collab-responses-list mt-4">
          {loadingResponses && <p className="text-sm text-muted">Loading…</p>}
          {!loadingResponses && responses.length === 0 && (
            <p className="text-sm text-muted">No responses yet.</p>
          )}
          {responses.map((r) => (
            <div key={r.id} className="collab-response-row">
              <Link to={networkProfilePath(r.handle)} className="collab-response-author">
                <strong>{r.displayName}</strong>
                <span className="text-xs text-muted">@{r.handle.replace(/^@/, '')}</span>
              </Link>
              <p className="text-sm mt-2">{r.message}</p>
              {r.status === 'pending' && post.status === 'open' && (
                <button
                  type="button"
                  className="ios-btn ios-btn-secondary !text-xs mt-2"
                  disabled={busy}
                  onClick={() => void handleAccept(r.id)}
                >
                  Accept collab
                </button>
              )}
              {r.status === 'accepted' && (
                <p className="text-xs text-mh-red mt-2 uppercase tracking-widest">Accepted</p>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-crimson mt-2">{error}</p>}
    </article>
  )
}
