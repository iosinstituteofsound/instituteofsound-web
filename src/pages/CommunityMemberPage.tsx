import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { formatAccountNumericId } from '@/lib/auth/accountId'
import { homeDashboardPath } from '@/lib/auth/roles'
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
import { MemberProfileAcademy } from '@/components/community/member/MemberProfileAcademy'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { useSeo } from '@/hooks/useSeo'
import { fetchArtistSlugForUserId } from '@/lib/artist-profile/networkLink'
import { listManagedArtistsByHandle } from '@/lib/artist-profile/service'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { COMMUNITY_FOLLOW_EVENT } from '@/lib/community/followService'
import { IOSImage } from '@/components/ui/IOSImage'
import { Input, FieldLabel } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { updateUserProfile } from '@/lib/auth/profile'

function tabFromSearch(params: URLSearchParams): MemberProfileTab {
  const t = params.get('tab')
  if (t === 'signal' || t === 'medals' || t === 'academy') return t
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
      setManagedArtists([])
    } else {
      setProfile(p)
      setPosts(postList)
      setActivity(act)
      const slug = await fetchArtistSlugForUserId(p.userId)
      setArtistSlug(slug)
      const managed = await listManagedArtistsByHandle(p.handle)
      setManagedArtists(managed)
    }
    setLoading(false)
  }, [handle])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  useEffect(() => {
    const onFollow = () => void loadProfile()
    window.addEventListener(COMMUNITY_FOLLOW_EVENT, onFollow)
    return () => window.removeEventListener(COMMUNITY_FOLLOW_EVENT, onFollow)
  }, [loadProfile])

  useEffect(() => {
    if (!loading && profile && tab === 'feed') {
      requestAnimationFrame(() => {
        document.getElementById('member-profile-feed')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
    }
  }, [loading, profile, tab])

  useEffect(() => {
    if (!profile) return
    setEditName(profile.displayName ?? '')
    setEditHandle(profile.handle.replace(/^@/, ''))
    setEditBio(profile.bio ?? '')
    setEditAvatarUrl(profile.avatarUrl ?? '')
  }, [profile])

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
  const dashboardHref = user ? homeDashboardPath(user.role) : undefined

  const saveProfileFromNetwork = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return
    setSavingProfile(true)
    setEditError('')
    setEditSuccess('')
    try {
      const updated = await updateUserProfile(user.id, {
        name: editName,
        username: editHandle,
        bio: editBio,
        avatarUrl: editAvatarUrl,
      })
      await loadProfile()
      setEditSuccess('Profile updated successfully.')

      const nextHandle = (updated.username ?? editHandle).replace(/^@/, '').toLowerCase()
      if (nextHandle && nextHandle !== handle) {
        void navigate(networkProfilePath(nextHandle), { replace: true })
      }
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

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
          onEditProfile={() => setShowEditProfile((prev) => !prev)}
        />

        {isYou && showEditProfile && (
          <section className="ios-card p-5 mb-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-mh-red font-bold">
                  Network profile editor
                </p>
                <h2 className="font-display text-xl font-bold uppercase mt-2">Edit your public profile</h2>
              </div>
            </div>
            <form className="space-y-4" onSubmit={saveProfileFromNetwork}>
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
                <button type="submit" className="ios-btn ios-btn-primary !text-xs" disabled={savingProfile}>
                  {savingProfile ? 'Saving…' : 'Save profile'}
                </button>
                <button
                  type="button"
                  className="ios-btn ios-btn-ghost !text-xs"
                  onClick={() => setShowEditProfile(false)}
                  disabled={savingProfile}
                >
                  Close editor
                </button>
              </div>
            </form>
          </section>
        )}

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
            {managedArtists.length > 0 && (
              <section className="ios-card p-5 mb-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-mh-red font-bold">
                  Managed artists
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  {managedArtists.map((artist) => (
                    <Link
                      key={artist.profileId}
                      to={`/artist/${artist.slug}`}
                      className="border border-border p-3 hover:border-mh-red/40 transition-colors flex gap-3 items-center"
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

          <section
            id="member-panel-academy"
            role="tabpanel"
            aria-labelledby="member-tab-academy"
            hidden={tab !== 'academy'}
            className="member-profile-panel"
          >
            <MemberProfileAcademy userId={profile.userId} isYou={isYou} />
          </section>
        </div>
      </div>

      <aside className="member-profile-deco member-profile-deco-left" aria-hidden />
      <aside className="member-profile-deco member-profile-deco-right" aria-hidden />
    </div>
  )
}
