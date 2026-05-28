import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { formatRelativeTime } from '@/lib/community/relativeTime'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { getEmbedForPost, hideCommunityPost } from '@/lib/community/feedService'
import { parseSpotifyUrl, parseYouTubeUrl } from '@/lib/community/musicLinks'
import { RankBadge } from '@/components/ui/RankBadge'
import { IOSImage } from '@/components/ui/IOSImage'
import { CommunityFeedReactions } from '@/components/community/CommunityFeedReactions'
import { FollowButton } from '@/components/community/FollowButton'

interface CommunityFeedCardProps {
  post: CommunityFeedPost
  isYou?: boolean
  linkProfile?: boolean
  variant?: 'default' | 'profile'
  className?: string
  onHidden?: () => void
  onReactionChange?: () => void
}

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function CommunityFeedCard({
  post,
  isYou,
  linkProfile = true,
  variant = 'default',
  className,
  onHidden,
  onReactionChange,
}: CommunityFeedCardProps) {
  const { user } = useAuth()
  const isProfileFeed = variant === 'profile'
  const [hiding, setHiding] = useState(false)
  const spotify = post.spotifyUrl ? parseSpotifyUrl(post.spotifyUrl) : null
  const youtube = post.youtubeUrl ? parseYouTubeUrl(post.youtubeUrl) : null
  const primaryEmbed = getEmbedForPost(post)

  const remove = async () => {
    if (!confirm('Remove this post from the feed?')) return
    setHiding(true)
    try {
      await hideCommunityPost(post.id, post.userId)
      onHidden?.()
    } catch {
      /* ignore */
    } finally {
      setHiding(false)
    }
  }

  const when = formatRelativeTime(post.createdAt)
  const profilePath = networkProfilePath(post.handle)

  const avatar = (
    <div className="community-feed-card-avatar">
      {post.avatarUrl ? (
        <IOSImage src={post.avatarUrl} alt="" width={48} className="w-full h-full object-cover" />
      ) : (
        <span aria-hidden>{post.displayName.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )

  const nameBlock = (
    <>
      <p className="community-feed-card-name">
        {post.displayName}
        {isYou && <span className="community-feed-card-you-pill">You</span>}
      </p>
      <p className="community-feed-card-handle">
        {post.handle}
        {post.primaryGenreSlug && (
          <span className="community-feed-card-tribe"> · {formatGenre(post.primaryGenreSlug)}</span>
        )}
      </p>
    </>
  )

  return (
    <article
      className={clsx(
        'community-feed-card ios-card',
        isYou && 'community-feed-card-you',
        isProfileFeed && 'community-feed-card-profile',
        className
      )}
    >
      <header
        className={clsx(
          'community-feed-card-head',
          isProfileFeed && 'community-feed-card-head-profile'
        )}
      >
        {!isProfileFeed && (
          <>
            {linkProfile ? (
              <Link
                to={profilePath}
                className="community-feed-card-profile-link"
                aria-label={`${post.displayName} profile`}
              >
                {avatar}
              </Link>
            ) : (
              avatar
            )}
            <div className="community-feed-card-meta">
              {linkProfile ? (
                <div className="flex items-start justify-between gap-3">
                  <Link to={profilePath} className="community-feed-card-profile-link block min-w-0">
                    {nameBlock}
                  </Link>
                  {!isYou && user && (
                    <FollowButton targetUserId={post.userId} className="!px-3 !py-1.5 !text-[10px] shrink-0" />
                  )}
                </div>
              ) : (
                nameBlock
              )}
            </div>
          </>
        )}
        <div
          className={clsx(
            'community-feed-card-badges',
            isProfileFeed && 'community-feed-card-badges-profile'
          )}
        >
          <span
            className={clsx(
              'community-feed-kind',
              post.kind === 'spin' ? 'community-feed-kind-spin' : 'community-feed-kind-drop'
            )}
          >
            {post.kind === 'spin' ? 'Spin' : 'Drop'}
          </span>
          {!isProfileFeed && <RankBadge rank={post.rank} />}
          {isProfileFeed && (
            <time className="community-feed-time-profile" dateTime={post.createdAt}>
              {when}
            </time>
          )}
        </div>
      </header>

      {post.kind === 'drop' && post.body && (
        <p className="community-feed-drop-body">{post.body}</p>
      )}

      {post.kind === 'spin' && (
        <>
          {post.trackTitle && (
            <p className="community-feed-spin-title">{post.trackTitle}</p>
          )}
          {post.body && <p className="community-feed-spin-caption">{post.body}</p>}
          <div className="community-feed-embeds">
            {spotify && (
              <iframe
                title="Spotify embed"
                src={spotify.embedUrl}
                className="community-feed-embed community-feed-embed-spotify"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            )}
            {youtube && (
              <iframe
                title="YouTube embed"
                src={youtube.embedUrl}
                className="community-feed-embed community-feed-embed-youtube"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            )}
            {!spotify && !youtube && primaryEmbed && (
              <a
                href={primaryEmbed.url}
                target="_blank"
                rel="noreferrer noopener"
                className="community-feed-link-fallback"
              >
                Open {primaryEmbed.label} →
              </a>
            )}
          </div>
        </>
      )}

      <CommunityFeedReactions post={post} onChange={onReactionChange} />

      <footer className="community-feed-card-foot">
        {!isProfileFeed && (
          <time className="community-feed-time" dateTime={post.createdAt}>
            {when}
          </time>
        )}
        {isYou && (
          <button
            type="button"
            className="community-feed-hide"
            onClick={() => void remove()}
            disabled={hiding}
          >
            {hiding ? 'Removing…' : 'Remove'}
          </button>
        )}
      </footer>
    </article>
  )
}
