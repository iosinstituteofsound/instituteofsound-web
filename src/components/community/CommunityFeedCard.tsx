import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { formatRelativeTime } from '@/lib/community/relativeTime'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { getEmbedForPost, hideCommunityPost } from '@/lib/community/feedService'
import { parseSpotifyUrl, parseYouTubeUrl } from '@/lib/community/musicLinks'
import { sharePost } from '@/lib/community/sharePost'
import { isBodyOnlyLink } from '@/lib/community/extractLink'
import { RankBadge } from '@/components/ui/RankBadge'
import { IOSImage } from '@/components/ui/IOSImage'
import { CommunityFeedEngagement } from '@/components/community/CommunityFeedEngagement'
import { CommunityLinkPreviewCard } from '@/components/community/CommunityLinkPreviewCard'
import { FollowButton } from '@/components/community/FollowButton'

interface CommunityFeedCardProps {
  post: CommunityFeedPost
  isYou?: boolean
  linkProfile?: boolean
  variant?: 'default' | 'profile' | 'detail'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareLabel, setShareLabel] = useState('Share')
  const menuRef = useRef<HTMLDivElement>(null)
  const spotify = post.spotifyUrl ? parseSpotifyUrl(post.spotifyUrl) : null
  const youtube = post.youtubeUrl ? parseYouTubeUrl(post.youtubeUrl) : null
  const primaryEmbed = getEmbedForPost(post)

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const remove = async () => {
    if (!confirm('Remove this post from the feed?')) return
    setMenuOpen(false)
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
  const postPath = `/feed/${post.id}`
  const kindLabel =
    post.kind === 'spin' ? 'Spin' : post.linkUrl ? 'Link' : 'Drop'
  const kindClass =
    post.kind === 'spin'
      ? 'community-feed-kind-spin'
      : post.linkUrl
        ? 'community-feed-kind-link'
        : 'community-feed-kind-drop'

  const onShare = async () => {
    try {
      const result = await sharePost(post.id)
      setShareLabel(result === 'copied' ? 'Copied' : 'Shared')
      window.setTimeout(() => setShareLabel('Share'), 2000)
    } catch {
      /* user cancelled share sheet */
    }
  }

  const avatar = (
    <div className="community-feed-card-avatar">
      {post.avatarUrl ? (
        <IOSImage src={post.avatarUrl} alt="" width={48} className="w-full h-full object-cover" />
      ) : (
        <span aria-hidden>{post.displayName.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )

  const metaLine = (
    <p className="community-feed-card-submeta">
      {!isProfileFeed && (
        <>
          <Link to={postPath} className="community-feed-card-time-link">
            <time dateTime={post.createdAt}>{when}</time>
          </Link>
          <span className="community-feed-card-dot" aria-hidden>
            ·
          </span>
        </>
      )}
      <span>{post.handle}</span>
      {post.primaryGenreSlug && (
        <>
          <span className="community-feed-card-dot" aria-hidden>
            ·
          </span>
          <span className="community-feed-card-tribe">{formatGenre(post.primaryGenreSlug)}</span>
        </>
      )}
    </p>
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
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={profilePath} className="community-feed-card-profile-link block min-w-0">
                      <p className="community-feed-card-name">
                        {post.displayName}
                        {isYou && <span className="community-feed-card-you-pill">You</span>}
                      </p>
                      {metaLine}
                    </Link>
                  </div>
                  <div className="flex shrink-0 items-start gap-1">
                    {!isYou && user && (
                      <FollowButton
                        targetUserId={post.userId}
                        className="!px-3 !py-1.5 !text-[10px]"
                      />
                    )}
                    {isYou && (
                      <div className="community-feed-card-menu" ref={menuRef}>
                        <button
                          type="button"
                          className="community-feed-card-menu-btn"
                          aria-expanded={menuOpen}
                          aria-label="Post options"
                          onClick={() => setMenuOpen((v) => !v)}
                        >
                          ···
                        </button>
                        {menuOpen && (
                          <div className="community-feed-card-menu-panel" role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              className="community-feed-card-menu-item community-feed-card-menu-item-danger"
                              disabled={hiding}
                              onClick={() => void remove()}
                            >
                              {hiding ? 'Removing…' : 'Remove post'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <p className="community-feed-card-name">
                    {post.displayName}
                    {isYou && <span className="community-feed-card-you-pill">You</span>}
                  </p>
                  {metaLine}
                </>
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
          <span className={clsx('community-feed-kind', kindClass)}>{kindLabel}</span>
          {!isProfileFeed && <RankBadge rank={post.rank} />}
          {isProfileFeed && (
            <time className="community-feed-time-profile" dateTime={post.createdAt}>
              {when}
            </time>
          )}
        </div>
      </header>

      {post.kind === 'drop' &&
        post.body &&
        !(post.linkUrl && isBodyOnlyLink(post.body, post.linkUrl)) && (
          <p className="community-feed-drop-body">{post.body}</p>
        )}

      {post.imageUrl && (
        <div className="community-feed-photo">
          <IOSImage
            src={post.imageUrl}
            alt={post.trackTitle || post.body || 'Post photo'}
            width={760}
            crop="limit"
            className="community-feed-photo-img"
          />
        </div>
      )}

      {post.linkUrl && (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="community-feed-link-preview-wrap"
        >
          <CommunityLinkPreviewCard
            preview={{
              url: post.linkUrl,
              title: post.linkTitle,
              description: post.linkDescription,
              imageUrl: post.linkImageUrl,
            }}
          />
        </a>
      )}

      {post.kind === 'spin' && (
        <>
          {post.trackTitle && <p className="community-feed-spin-title">{post.trackTitle}</p>}
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

      <CommunityFeedEngagement
        post={post}
        isDetail={variant === 'detail'}
        onReactionChange={onReactionChange}
        shareLabel={shareLabel}
        onShare={onShare}
      />
    </article>
  )
}
