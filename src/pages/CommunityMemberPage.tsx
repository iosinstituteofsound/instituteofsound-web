import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  fetchMemberActivity,
  fetchMemberPosts,
  fetchPublicMemberProfile,
  memberHandleFromUser,
  normalizeHandle,
  type MemberActivityItem,
  type PublicMemberProfile,
} from '@/lib/community/memberProfileService'
import { useCommunityBadges } from '@/hooks/useCommunityBadges'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'
import { RankBadge } from '@/components/ui/RankBadge'
import { IOSImage } from '@/components/ui/IOSImage'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { formatRelativeTime } from '@/lib/community/relativeTime'

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function activityLabel(item: MemberActivityItem): string {
  if (item.kind === 'post') {
    const kind = item.label === 'spin' ? 'Spin' : 'Drop'
    return `Posted a ${kind}`
  }
  const src = item.label.replace(/_/g, ' ')
  if (item.amount && item.amount > 0) return `Earned +${item.amount} dB · ${src}`
  if (item.amount && item.amount < 0) return `${item.amount} dB · ${src}`
  return src
}

export default function CommunityMemberPage() {
  const { handle: handleParam } = useParams<{ handle: string }>()
  const { user } = useAuth()
  const handle = normalizeHandle(handleParam ?? '')

  const [profile, setProfile] = useState<PublicMemberProfile | null>(null)
  const [posts, setPosts] = useState<Awaited<ReturnType<typeof fetchMemberPosts>>>([])
  const [activity, setActivity] = useState<MemberActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const { badges, loading: badgesLoading } = useCommunityBadges(profile?.userId)

  const isYou = Boolean(
    user &&
      (normalizeHandle(user.username ?? '') === handle ||
        memberHandleFromUser(user) === handle ||
        profile?.userId === user.id)
  )

  useEffect(() => {
    if (!handle) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setNotFound(false)

    void (async () => {
      const [p, postList, act] = await Promise.all([
        fetchPublicMemberProfile(handle),
        fetchMemberPosts(handle, 40),
        fetchMemberActivity(handle, 30),
      ])
      if (cancelled) return
      if (!p) {
        setNotFound(true)
        setProfile(null)
        setPosts([])
        setActivity([])
      } else {
        setProfile(p)
        setPosts(postList)
        setActivity(act)
      }
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [handle])

  if (loading) {
    return (
      <div className="section-padding pt-32 min-h-[50vh]">
        <LoadingTransmission variant="compact" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="section-padding pt-32">
        <div className="max-w-xl mx-auto text-center ios-card p-10">
          <h1 className="font-display text-2xl font-bold uppercase">Member not found</h1>
          <p className="text-sm text-muted mt-3">
            No profile for <span className="text-mh-red">@{handle}</span> on the network yet.
          </p>
          <Link to="/community" className="ios-btn ios-btn-primary mt-6 inline-block !text-xs">
            Back to community →
          </Link>
        </div>
      </div>
    )
  }

  const profileHandle = profile.handle.replace(/^@/, '')

  return (
    <div className="section-padding pt-32 community-member-page">
      <div className="max-w-3xl mx-auto">
        <Link to="/community" className="ios-link text-xs tracking-widest uppercase mb-8 inline-block">
          ← Community
        </Link>

        <header className="community-member-header ios-card p-6 md:p-8">
          <div className="community-member-header-top">
            <div className="community-member-avatar">
              {profile.avatarUrl ? (
                <IOSImage
                  src={profile.avatarUrl}
                  alt=""
                  width={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span aria-hidden>{profile.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-[0.25em] uppercase text-mh-red font-bold">
                Network member
                {isYou && <span className="text-muted font-normal ml-2">· you</span>}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold uppercase mt-1 truncate">
                {profile.displayName}
              </h1>
              <p className="text-mh-red font-mono text-sm mt-1">{profile.handle}</p>
              {profile.bio && <p className="text-sm text-muted mt-3">{profile.bio}</p>}
              <p className="text-xs text-muted-foreground mt-2">
                Member since {new Date(profile.memberSince).toLocaleDateString()}
                {profile.primaryGenreSlug && (
                  <> · {formatGenre(profile.primaryGenreSlug)} tribe</>
                )}
              </p>
            </div>
            <RankBadge rank={profile.rank} size="md" />
          </div>

          <div className="community-member-stats-row">
            <div>
              <p className="community-member-stat-value">{profile.totalDb.toLocaleString()}</p>
              <p className="community-member-stat-label">Total dB</p>
            </div>
            <div>
              <p className="community-member-stat-value">{profile.weeklyDb.toLocaleString()}</p>
              <p className="community-member-stat-label">This week</p>
            </div>
            <div>
              <p className="community-member-stat-value">{profile.postCount}</p>
              <p className="community-member-stat-label">Posts</p>
            </div>
          </div>

          {isYou && (
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
              <Link to="/community#feed" className="ios-btn ios-btn-primary !text-xs">
                Post Spin / Drop →
              </Link>
              <Link
                to={user?.role === 'artist' ? '/dashboard/artist' : '/dashboard/editor'}
                className="ios-btn ios-btn-ghost !text-xs"
              >
                Dashboard
              </Link>
            </div>
          )}
        </header>

        {(badges.length > 0 || badgesLoading) && (
          <section className="mt-8" aria-labelledby="member-badges-heading">
            <h2 id="member-badges-heading" className="font-display text-lg font-bold uppercase mb-4">
              Badges
            </h2>
            {badgesLoading && badges.length === 0 ? (
              <p className="text-sm text-muted">Loading badges…</p>
            ) : (
              <ul className="community-member-badges">
                {badges.map((b) => (
                  <li key={b.slug} className="community-member-badge" title={b.description}>
                    <span className="community-member-badge-name">{b.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="mt-12" aria-labelledby="member-activity-heading">
          <h2 id="member-activity-heading" className="font-display text-2xl font-bold uppercase">
            Recent activity
          </h2>
          <p className="text-sm text-muted mt-1 mb-6">dB earned and posts on the network</p>
          {activity.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center border border-dashed border-border">
              No activity yet.
            </p>
          ) : (
            <ol className="community-member-activity">
              {activity.map((item, i) => (
                <li key={`${item.createdAt}-${i}`} className="community-member-activity-item">
                  <span
                    className={
                      item.kind === 'post'
                        ? 'community-member-activity-dot community-member-activity-dot-post'
                        : 'community-member-activity-dot'
                    }
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-signal">{activityLabel(item)}</p>
                    {item.detail && (
                      <p className="text-xs text-muted mt-0.5 truncate">{item.detail}</p>
                    )}
                  </div>
                  <time className="text-xs text-muted shrink-0" dateTime={item.createdAt}>
                    {formatRelativeTime(item.createdAt)}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="mt-12" aria-labelledby="member-posts-heading">
          <h2 id="member-posts-heading" className="font-display text-2xl font-bold uppercase">
            @{profileHandle} on the feed
          </h2>
          <p className="text-sm text-muted mt-1 mb-6">Spins and drops from this member</p>
          <div className="community-feed-list mt-6">
            {posts.length === 0 ? (
              <p className="text-sm text-muted text-center py-12 border border-dashed border-border">
                No posts yet.
                {isYou && (
                  <>
                    {' '}
                    <Link to="/community#feed" className="text-mh-red hover:underline">
                      Share your first Spin →
                    </Link>
                  </>
                )}
              </p>
            ) : (
              posts.map((post) => (
                <CommunityFeedCard
                  key={post.id}
                  post={post}
                  isYou={isYou}
                  linkProfile={false}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
