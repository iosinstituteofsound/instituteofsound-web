import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { formatAccountNumericId } from '@/lib/auth/accountId'
import { editorDashboardPath } from '@/lib/auth/roles'
import {
  fetchMemberActivity,
  fetchMemberPosts,
  fetchPublicMemberProfile,
  memberHandleFromUser,
  normalizeHandle,
  type MemberActivityItem,
  type PublicMemberProfile,
} from '@/lib/community/memberProfileService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { useCommunityBadges } from '@/hooks/useCommunityBadges'
import { MemberProfileHeader } from '@/components/community/member/MemberProfileHeader'
import {
  MemberProfileTabs,
  type MemberProfileTab,
} from '@/components/community/member/MemberProfileTabs'
import { MemberProfileFeed } from '@/components/community/member/MemberProfileFeed'
import { MemberProfileSignalLog } from '@/components/community/member/MemberProfileSignalLog'
import { MemberProfileMedals } from '@/components/community/member/MemberProfileMedals'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { useSeo } from '@/hooks/useSeo'
import { fetchArtistSlugForUserId } from '@/lib/artist-profile/networkLink'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { networkProfilePath } from '@/lib/community/networkPaths'

function tabFromSearch(params: URLSearchParams): MemberProfileTab {
  const t = params.get('tab')
  if (t === 'signal' || t === 'medals') return t
  return 'feed'
}

export default function CommunityMemberPage() {
  const { handle: handleParam } = useParams<{ handle: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const handle = normalizeHandle(handleParam ?? '')

  const [profile, setProfile] = useState<PublicMemberProfile | null>(null)
  const [posts, setPosts] = useState<CommunityFeedPost[]>([])
  const [activity, setActivity] = useState<MemberActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState<MemberProfileTab>(() => tabFromSearch(searchParams))
  const [artistSlug, setArtistSlug] = useState<string | null>(null)

  const { badges, loading: badgesLoading } = useCommunityBadges(profile?.userId)

  const profilePath = profile ? networkProfilePath(profile.handle) : `/network/${handle}`

  const seo = useMemo(() => {
    if (!profile) return null
    const displayHandle = profile.handle.replace(/^@/, '')
    return {
      title: `${profile.displayName} (@${displayHandle})`,
      description: `${profile.displayName} on the Institute of Sound network — spins, drops, dB rank ${profile.rank}, ${profile.postCount} transmissions.`,
      canonicalPath: profilePath,
      ogType: 'profile' as const,
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Community', path: '/community' },
        { name: profile.displayName, path: profilePath },
      ]),
    }
  }, [profile, profilePath])

  useSeo(seo)

  const isYou = Boolean(
    user &&
      (normalizeHandle(user.username ?? '') === handle ||
        memberHandleFromUser(user) === handle ||
        profile?.userId === user.id)
  )

  const loadProfile = useCallback(async () => {
    if (!handle) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setNotFound(false)

    const [p, postList, act] = await Promise.all([
      fetchPublicMemberProfile(handle),
      fetchMemberPosts(handle, 50),
      fetchMemberActivity(handle, 40),
    ])

    if (!p) {
      setNotFound(true)
      setProfile(null)
      setPosts([])
      setActivity([])
      setArtistSlug(null)
    } else {
      setProfile(p)
      setPosts(postList)
      setActivity(act)
      const slug = await fetchArtistSlugForUserId(p.userId)
      setArtistSlug(slug)
    }
    setLoading(false)
  }, [handle])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (!loading && profile && tab === 'feed') {
      requestAnimationFrame(() => {
        document.getElementById('member-profile-feed')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
    }
  }, [loading, profile, tab])

  useEffect(() => {
    setTab(tabFromSearch(searchParams))
  }, [searchParams])

  const setActiveTab = (next: MemberProfileTab) => {
    setTab(next)
    setSearchParams(next === 'feed' ? {} : { tab: next }, { replace: true })
    if (next === 'feed') {
      requestAnimationFrame(() => {
        document.getElementById('member-profile-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  if (loading) {
    return (
      <div className="member-profile-page member-profile-page--loading">
        <LoadingTransmission variant="compact" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="member-profile-page">
        <div className="member-profile-shell">
          <div className="member-profile-not-found ios-card">
            <p className="member-profile-kicker">Signal lost</p>
            <h1 className="member-profile-name">Operator not found</h1>
            <p className="member-profile-bio">
              No profile for <span className="text-mh-red">@{handle}</span> on the network.
            </p>
            <Link to="/community" className="member-profile-btn member-profile-btn-primary mt-8">
              Enter community →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const accountId = formatAccountNumericId(profile.userId)
  const dashboardHref = user ? editorDashboardPath(user.role) : undefined

  return (
    <div className="member-profile-page">
      <div className="member-profile-page-bg" aria-hidden />
      <div className="member-profile-shell">
        <nav className="member-profile-topnav">
          <Link to="/community" className="member-profile-back">
            ← Network
          </Link>
        </nav>

        <MemberProfileHeader
          profile={profile}
          accountId={accountId}
          isYou={isYou}
          dashboardHref={isYou ? dashboardHref : undefined}
          badges={badges}
          artistSlug={artistSlug}
        />

        <MemberProfileTabs
          active={tab}
          onChange={setActiveTab}
          postCount={profile.postCount}
          badgeCount={badges.length}
        />

        <div className="member-profile-panels">
          <section
            id="member-profile-feed"
            role="tabpanel"
            aria-labelledby="member-tab-feed"
            hidden={tab !== 'feed'}
            className="member-profile-panel"
          >
            <MemberProfileFeed
              posts={posts}
              isYou={isYou}
              handle={profile.handle.replace(/^@/, '')}
              onRefresh={() => void loadProfile()}
            />
          </section>

          <section
            id="member-panel-signal"
            role="tabpanel"
            aria-labelledby="member-tab-signal"
            hidden={tab !== 'signal'}
            className="member-profile-panel"
          >
            <MemberProfileSignalLog activity={activity} />
          </section>

          <section
            id="member-panel-medals"
            role="tabpanel"
            aria-labelledby="member-tab-medals"
            hidden={tab !== 'medals'}
            className="member-profile-panel"
          >
            <MemberProfileMedals badges={badges} loading={badgesLoading} />
          </section>
        </div>
      </div>

      <aside className="member-profile-deco member-profile-deco-left" aria-hidden />
      <aside className="member-profile-deco member-profile-deco-right" aria-hidden />
    </div>
  )
}
