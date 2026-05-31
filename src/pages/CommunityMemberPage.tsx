import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  fetchMemberConnections,
  fetchMemberActivity,
  fetchMemberPosts,
  fetchPublicMemberProfile,
  memberHandleFromUser,
  normalizeHandle,
  type MemberConnectionProfile,
  type MemberActivityItem,
  type PublicMemberProfile,
} from '@/lib/community/memberProfileService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { useCommunityBadges } from '@/hooks/useCommunityBadges'
import { NetworkProfileCoverHeader } from '@/components/network/profile/NetworkProfileCoverHeader'
import { NetworkConnectionsPanel } from '@/components/network/NetworkConnectionsPanel'
import { NetworkTransmissionFeed } from '@/components/network/NetworkTransmissionFeed'
import {
  MemberProfileTabs,
  type MemberProfileTab,
} from '@/components/community/member/MemberProfileTabs'
import { MemberProfileSignalLog } from '@/components/community/member/MemberProfileSignalLog'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { useSeo } from '@/hooks/useSeo'
import { fetchPublishedArtistMetaForUserId } from '@/lib/artist-profile/networkLink'
import { NetworkProfileOverview } from '@/components/network/profile/NetworkProfileOverview'
import { NetworkProfileAbout } from '@/components/network/profile/NetworkProfileAbout'
import { NetworkProfileReleases } from '@/components/network/profile/NetworkProfileReleases'
import { NetworkProfileCrews } from '@/components/network/profile/NetworkProfileCrews'
import { listManagedArtistsByHandle } from '@/lib/artist-profile/service'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { COMMUNITY_FOLLOW_EVENT } from '@/lib/community/followService'
import {
  fetchConnectionsList,
  fetchIncomingRequestIdFromUser,
  fetchMutualConnections,
  fetchSuggestedPeople,
  NETWORK_CONNECTION_EVENT,
} from '@/lib/network/connectionService'
import type { NetworkPersonCard } from '@/lib/network/connectionTypes'
import { IOSImage } from '@/components/ui/IOSImage'
import { Input, FieldLabel } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { updateUserProfile } from '@/lib/auth/profile'
import {
  fetchPublicRecognitionsForUser,
  fetchPublicSupporterBadgesForUser,
} from '@/lib/fandom/service'
import type {
  FandomPublicRecognitionRow,
  PublicSupporterBadgeOnArtist,
} from '@/lib/fandom/types'

function tabFromSearch(params: URLSearchParams): MemberProfileTab {
  const t = params.get('tab')
  if (t === 'overview') return 'overview'
  if (t === 'posts' || t === 'feed') return 'posts'
  if (t === 'activity' || t === 'signal') return 'activity'
  if (t === 'releases') return 'releases'
  if (t === 'crews') return 'crews'
  if (t === 'about' || t === 'medals' || t === 'academy') return 'about'
  return 'overview'
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
  const [artistProfileId, setArtistProfileId] = useState<string | null>(null)
  const [managedArtists, setManagedArtists] = useState<
    { profileId: string; slug: string; displayName: string; tagline?: string; avatarUrl?: string }[]
  >([])
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editName, setEditName] = useState('')
  const [editHandle, setEditHandle] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [connectionsOpen, setConnectionsOpen] = useState<
    'followers' | 'following' | 'connections' | null
  >(null)
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
  const [mutuals, setMutuals] = useState<NetworkPersonCard[]>([])
  const [suggested, setSuggested] = useState<NetworkPersonCard[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const [connectionsError, setConnectionsError] = useState('')
  const [connections, setConnections] = useState<MemberConnectionProfile[]>([])
  const [fandomBadges, setFandomBadges] = useState<PublicSupporterBadgeOnArtist[]>([])
  const [fandomRecognitions, setFandomRecognitions] = useState<FandomPublicRecognitionRow[]>([])
  const navigate = useNavigate()

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
        profile?.userId === user.id),
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
      setArtistProfileId(null)
      setManagedArtists([])
      setFandomBadges([])
      setFandomRecognitions([])
    } else {
      setProfile(p)
      setPosts(postList)
      setActivity(act)
      const [artistMeta, supporterBadges, recognitions, managed] = await Promise.all([
        fetchPublishedArtistMetaForUserId(p.userId),
        fetchPublicSupporterBadgesForUser(p.userId),
        fetchPublicRecognitionsForUser(p.userId),
        listManagedArtistsByHandle(p.handle),
      ])
      setArtistSlug(artistMeta?.slug ?? null)
      setArtistProfileId(artistMeta?.id ?? null)
      setFandomBadges(supporterBadges)
      setFandomRecognitions(recognitions)
      setManagedArtists(managed)
    }
    setLoading(false)

    const isOwnProfile = Boolean(
      user &&
        p &&
        (normalizeHandle(user.username ?? '') === handle ||
          memberHandleFromUser(user) === handle ||
          p.userId === user.id),
    )

    if (p) {
      const mapRailPerson = (
        m: Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>,
      ): NetworkPersonCard => ({
        userId: m.userId,
        displayName: m.displayName,
        handle: m.handle.replace(/^@/, ''),
        avatarUrl: m.avatarUrl,
        role: '',
        totalDb: 0,
        connectionStatus: 'connected',
      })

      if (isOwnProfile) {
        const [connectionsList, suggestedList] = await Promise.all([
          fetchConnectionsList(p.userId),
          fetchSuggestedPeople(6),
        ])
        setPendingRequestId(null)
        setMutuals(connectionsList.map(mapRailPerson))
        setSuggested(suggestedList)
      } else {
        const [reqId, mutualList, suggestedList] = await Promise.all([
          p.viewerConnectionStatus === 'pending_in'
            ? fetchIncomingRequestIdFromUser(p.userId)
            : Promise.resolve(null),
          fetchMutualConnections(p.userId),
          fetchSuggestedPeople(6),
        ])
        setPendingRequestId(reqId)
        setMutuals(mutualList.map(mapRailPerson))
        setSuggested(suggestedList)
      }
    } else {
      setPendingRequestId(null)
      setMutuals([])
      setSuggested([])
    }
  }, [handle, user])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  useEffect(() => {
    const onFollow = () => void loadProfile()
    window.addEventListener(COMMUNITY_FOLLOW_EVENT, onFollow)
    return () => window.removeEventListener(COMMUNITY_FOLLOW_EVENT, onFollow)
  }, [loadProfile])

  useEffect(() => {
    const onConn = () => void loadProfile()
    window.addEventListener(NETWORK_CONNECTION_EVENT, onConn)
    return () => window.removeEventListener(NETWORK_CONNECTION_EVENT, onConn)
  }, [loadProfile])

  useEffect(() => {
    setTab(tabFromSearch(searchParams))
  }, [searchParams])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      const lock = tab === 'overview' && mq.matches
      document.documentElement.classList.toggle('np-profile-overview-lock', lock)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => {
      mq.removeEventListener('change', sync)
      document.documentElement.classList.remove('np-profile-overview-lock')
    }
  }, [tab])

  const setActiveTab = (next: MemberProfileTab) => {
    setTab(next)
    const params = new URLSearchParams(searchParams)
    if (next === 'overview') params.delete('tab')
    else params.set('tab', next)
    setSearchParams(params, { replace: true })
  }

  useEffect(() => {
    if (profile && isYou) {
      setEditName(profile.displayName)
      setEditHandle(profile.handle.replace(/^@/, ''))
      setEditBio(profile.bio ?? '')
      setEditAvatarUrl(profile.avatarUrl ?? '')
    }
  }, [profile, isYou])

  const saveProfileFromNetwork = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return
    setSavingProfile(true)
    setEditError('')
    setEditSuccess('')
    try {
      await updateUserProfile(user.id, {
        name: editName.trim(),
        username: editHandle.trim().replace(/^@/, ''),
        bio: editBio.trim() || undefined,
        avatarUrl: editAvatarUrl.trim() || undefined,
      })
      setEditSuccess('Profile updated.')
      setShowEditProfile(false)
      const nextHandle = normalizeHandle(editHandle)
      if (nextHandle !== handle) {
        navigate(networkProfilePath(nextHandle))
      } else {
        await loadProfile()
      }
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not save profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const openConnections = async (mode: 'followers' | 'following' | 'connections') => {
    if (!profile) return
    setConnectionsOpen(mode)
    setConnectionsLoading(true)
    setConnectionsError('')
    try {
      let list: MemberConnectionProfile[]
      if (mode === 'connections') {
        list = (await fetchConnectionsList(profile.userId)).map((c) => ({
          userId: c.userId,
          displayName: c.displayName,
          handle: c.handle,
          avatarUrl: c.avatarUrl,
          followedAt: new Date().toISOString(),
        }))
      } else if (mode === 'followers' || mode === 'following') {
        list = await fetchMemberConnections(handle, mode)
      } else {
        list = []
      }
      setConnections(list)
    } catch (err) {
      setConnectionsError(err instanceof Error ? err.message : 'Could not load this list.')
      setConnections([])
    } finally {
      setConnectionsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="np-page flex min-h-[50vh] items-center justify-center">
        <LoadingTransmission />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="np-page py-16 text-center">
        <p className="font-display text-xl font-bold uppercase">Operator not found</p>
        <Link to="/network" className="np-back mt-6 inline-flex">
          ← Network home
        </Link>
      </div>
    )
  }

  return (
    <div
      className={`np-page network-profile-page${tab === 'overview' ? ' network-profile-page--split' : ''}`}
    >
      <div className="np-page__hero">
        <Link to="/network" className="np-back">
          ← Network home
        </Link>

        <NetworkProfileCoverHeader
          profile={profile}
          isYou={isYou}
          artistSlug={artistSlug}
          fandomBadges={fandomBadges}
          pendingRequestId={pendingRequestId}
          onEditProfile={() => setShowEditProfile((prev) => !prev)}
          onOpenFollowers={() => void openConnections('followers')}
          onOpenFollowing={() => void openConnections('following')}
          onOpenConnections={() => void openConnections('connections')}
          onConnectionChange={() => void loadProfile()}
        />

        {connectionsOpen && (
          <NetworkConnectionsPanel
            mode={connectionsOpen}
            loading={connectionsLoading}
            error={connectionsError}
            connections={connections}
            onClose={() => setConnectionsOpen(null)}
          />
        )}

        {isYou && showEditProfile && (
          <section className="np-card mb-4">
          <h2 className="np-card__title">Edit profile</h2>
          <form className="space-y-4 mt-4" onSubmit={saveProfileFromNetwork}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="network-edit-name">Display name</FieldLabel>
                <Input
                  id="network-edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div>
                <FieldLabel htmlFor="network-edit-handle">Handle</FieldLabel>
                <Input
                  id="network-edit-handle"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  placeholder="yourhandle"
                  required
                />
              </div>
            </div>
            <ImageUpload
              label="Avatar"
              folder="ios/artists"
              value={editAvatarUrl}
              onChange={setEditAvatarUrl}
              hint="Visible on your network profile and posts."
            />
            <div>
              <FieldLabel htmlFor="network-edit-bio">Bio</FieldLabel>
              <textarea
                id="network-edit-bio"
                className="ios-input min-h-[100px]"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={280}
                placeholder="Tell the network what you do."
              />
              <p className="text-xs text-muted mt-1 text-right">{editBio.length}/280</p>
            </div>
            {editError && <p className="text-sm text-mh-red">{editError}</p>}
            {editSuccess && <p className="text-sm text-green-400">{editSuccess}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="np-btn np-btn--primary" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save profile'}
              </button>
              <button
                type="button"
                className="np-btn np-btn--outline"
                onClick={() => setShowEditProfile(false)}
                disabled={savingProfile}
              >
                Close
              </button>
            </div>
          </form>
        </section>
        )}
      </div>

      <div className="np-page__body">
        <MemberProfileTabs
          active={tab}
          onChange={setActiveTab}
          postCount={profile.postCount}
          showReleases={Boolean(artistProfileId)}
        />

        <div className="member-profile-panels">
        <section
          id="member-panel-overview"
          role="tabpanel"
          hidden={tab !== 'overview'}
          className="member-profile-panel"
        >
          <NetworkProfileOverview
            profile={profile}
            posts={posts}
            badges={badges}
            mutuals={mutuals}
            suggested={suggested}
            fandomRecognitions={fandomRecognitions}
            isYou={isYou}
            onRefresh={() => void loadProfile()}
            onViewAllPosts={() => setActiveTab('posts')}
            onViewAllBadges={() => setActiveTab('about')}
            onViewCrews={() => setActiveTab('crews')}
            onViewMutuals={() => void openConnections('connections')}
            onConnectionChange={() => void loadProfile()}
          />
        </section>

        <section
          id="member-profile-posts"
          role="tabpanel"
          hidden={tab !== 'posts'}
          className="member-profile-panel"
        >
          <div className="np-single">
            {managedArtists.length > 0 && (
              <section className="np-card mb-4">
                <h2 className="np-card__title">Managed artists</h2>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {managedArtists.map((artist) => (
                    <Link
                      key={artist.profileId}
                      to={`/artist/${artist.slug}`}
                      className="flex gap-3 items-center p-3 border border-border rounded-lg hover:border-mh-red/40"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface shrink-0">
                        {artist.avatarUrl ? (
                          <IOSImage
                            src={artist.avatarUrl}
                            alt={artist.displayName}
                            width={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-xs text-muted">
                            {artist.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-sm truncate">{artist.displayName}</p>
                        {artist.tagline && (
                          <p className="text-xs text-muted truncate">{artist.tagline}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            <NetworkTransmissionFeed
              posts={posts}
              isYou={isYou}
              handle={profile.handle.replace(/^@/, '')}
              onRefresh={() => void loadProfile()}
            />
          </div>
        </section>

        <section
          id="member-panel-activity"
          role="tabpanel"
          hidden={tab !== 'activity'}
          className="member-profile-panel"
        >
          <div className="np-single">
            <MemberProfileSignalLog activity={activity} />
          </div>
        </section>

        {artistProfileId && artistSlug && (
          <section
            id="member-panel-releases"
            role="tabpanel"
            hidden={tab !== 'releases'}
            className="member-profile-panel"
          >
            <div className="np-single">
              <NetworkProfileReleases artistProfileId={artistProfileId} artistSlug={artistSlug} />
            </div>
          </section>
        )}

        <section
          id="member-panel-crews"
          role="tabpanel"
          hidden={tab !== 'crews'}
          className="member-profile-panel"
        >
          <div className="np-single">
            <NetworkProfileCrews userId={profile.userId} isYou={isYou} />
          </div>
        </section>

        <section
          id="member-panel-about"
          role="tabpanel"
          hidden={tab !== 'about'}
          className="member-profile-panel"
        >
          <div className="np-single">
            <NetworkProfileAbout
              profile={profile}
              badges={badges}
              badgesLoading={badgesLoading}
              isYou={isYou}
            />
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}
