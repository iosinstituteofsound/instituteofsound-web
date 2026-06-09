import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { PublicSupporterBadgeOnArtist } from '@/lib/fandom/types'
import { getSiteHost, getSiteUrl } from '@/lib/auth/siteUrl'
import { formatNetworkCount } from '@/lib/network/noiseScore'
import { IOSImage } from '@/components/ui/IOSImage'
import { ConnectButton } from '@/components/network/ConnectButton'
import { FollowButton } from '@/components/community/FollowButton'
import { MessageButton } from '@/components/community/MessageButton'
import { IdentityCrossLinks } from '@/components/community/IdentityCrossLinks'
import { FandomSupporterBadgesList } from '@/components/fandom/FandomSupporterBadges'
import { ProfilePhotoPickerModal } from '@/components/network/profile/ProfilePhotoPickerModal'
import { updateUserProfile } from '@/lib/auth/profile'
import { useAuth } from '@/context/AuthContext'
import {
  addProfilePhotoHistory,
  buildProfilePhotoSuggestions,
  type ProfilePhotoKind,
} from '@/lib/network/profilePhotoHistory'

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=85'

function EditCameraIcon({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? 'np-header__edit-icon np-header__edit-icon--sm' : 'np-header__edit-icon'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"
      />
      <circle cx="12" cy="13" r="3.25" />
    </svg>
  )
}

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function personaLabel(persona: string) {
  return persona.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function rolePills(profile: PublicMemberProfile): string[] {
  const pills: string[] = []
  if (profile.profileRole === 'super_editor') pills.push('Founder')
  if (profile.profileRole === 'editor' || profile.profileRole === 'super_editor') pills.push('Editor')
  if (profile.profileRole === 'artist') pills.push('Artist')
  if (profile.dashboardPersona) pills.push(personaLabel(profile.dashboardPersona))
  if (profile.rank === 'Operator' || profile.rank === 'Curator') {
    pills.push(profile.rank)
  }
  if (profile.primaryGenreSlug) pills.push(formatGenre(profile.primaryGenreSlug))
  return [...new Set(pills)]
}

function subtitleLine(profile: PublicMemberProfile): string {
  const roles: string[] = []
  if (profile.rank === 'Operator' || profile.rank === 'Curator') roles.push(profile.rank)
  if (profile.profileRole === 'editor' || profile.profileRole === 'super_editor') roles.push('Editor')
  if (profile.profileRole === 'artist') roles.push('Artist')
  if (profile.dashboardPersona) roles.push(personaLabel(profile.dashboardPersona))
  if (roles.length) return roles.join(' · ')
  if (profile.bio) {
    const first = profile.bio.split('\n')[0]?.trim()
    if (first) return first
  }
  return 'On the Institute of Sound network'
}

interface NetworkProfileCoverHeaderProps {
  profile: PublicMemberProfile
  isYou: boolean
  artistSlug?: string | null
  fandomBadges?: PublicSupporterBadgeOnArtist[]
  pendingRequestId?: string | null
  postImageUrls?: string[]
  onEditProfile?: () => void
  onOpenFollowers?: () => void
  onOpenFollowing?: () => void
  onOpenConnections?: () => void
  onConnectionChange?: () => void
  onProfileUpdated?: () => void | Promise<void>
}

export function NetworkProfileCoverHeader({
  profile,
  isYou,
  artistSlug,
  fandomBadges = [],
  pendingRequestId,
  postImageUrls = [],
  onEditProfile,
  onOpenFollowers,
  onOpenFollowing,
  onOpenConnections,
  onConnectionChange,
  onProfileUpdated,
}: NetworkProfileCoverHeaderProps) {
  const { user, refreshUser } = useAuth()
  const [pickerKind, setPickerKind] = useState<ProfilePhotoKind | null>(null)
  const [saving, setSaving] = useState(false)

  const handle = profile.handle.replace(/^@/, '')
  const pills = rolePills(profile)
  const subtitle = subtitleLine(profile)
  const bioLead = profile.bio?.split('\n')[0]?.trim() ?? ''
  const showBioTagline = Boolean(bioLead && bioLead !== subtitle)
  const memberBadge =
    profile.profileRole === 'editor' || profile.profileRole === 'super_editor'
      ? 'IOS Editor'
      : profile.profileRole === 'artist'
        ? 'IOS Artist'
        : 'IOS Member'

  const coverUrl = profile.coverUrl ?? DEFAULT_COVER
  const coverStyle = { backgroundImage: `url(${coverUrl})` }

  const avatarSuggestions = useMemo(
    () =>
      buildProfilePhotoSuggestions({
        userId: profile.userId,
        kind: 'avatar',
        currentUrl: profile.avatarUrl,
        postImageUrls,
      }),
    [profile.userId, profile.avatarUrl, postImageUrls],
  )

  const coverSuggestions = useMemo(
    () =>
      buildProfilePhotoSuggestions({
        userId: profile.userId,
        kind: 'cover',
        currentUrl: profile.coverUrl,
        postImageUrls,
      }),
    [profile.userId, profile.coverUrl, postImageUrls],
  )

  const savePhoto = async (kind: ProfilePhotoKind, url: string) => {
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.id, kind === 'avatar' ? { avatarUrl: url } : { coverUrl: url })
      addProfilePhotoHistory(user.id, kind, url)
      await refreshUser()
      await onProfileUpdated?.()
      setPickerKind(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <header className="np-header">
      <div className={isYou ? 'np-header__cover np-header__cover--editable' : 'np-header__cover'} style={coverStyle}>
        <div className="np-header__cover-vignette" aria-hidden />
        {isYou && (
          <>
            <div className="np-header__media-shade np-header__media-shade--cover" aria-hidden />
            <button
              type="button"
              className="np-header__edit-btn np-header__edit-btn--cover"
              onClick={() => setPickerKind('cover')}
            >
              <EditCameraIcon />
              <span>Edit cover</span>
            </button>
          </>
        )}
      </div>

      <div className="np-header__body">
        <div className="np-header__identity">
          <div className={isYou ? 'np-header__avatar-wrap np-header__avatar-wrap--editable' : 'np-header__avatar-wrap'}>
            {profile.avatarUrl ? (
              <IOSImage
                src={profile.avatarUrl}
                alt=""
                width={128}
                className="np-header__avatar"
              />
            ) : (
              <span className="np-header__avatar-fallback" aria-hidden>
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            )}
            {!isYou && <span className="np-header__online" title="On the network" aria-hidden />}
            {isYou && (
              <>
                <div className="np-header__media-shade np-header__media-shade--avatar" aria-hidden />
                <button
                  type="button"
                  className="np-header__edit-btn np-header__edit-btn--avatar"
                  onClick={() => setPickerKind('avatar')}
                  aria-label="Edit profile photo"
                  title="Edit profile photo"
                >
                  <EditCameraIcon compact />
                </button>
              </>
            )}
          </div>

          <div className="np-header__meta">
            <div className="np-header__name-row">
              <h1 className="np-header__name">{profile.displayName}</h1>
            </div>
            <p className="np-header__handle-row">
              <span className="np-header__handle">@{handle}</span>
              <span className="np-header__member-badge">{memberBadge}</span>
            </p>
            <p className="np-header__subtitle">{subtitle}</p>
            {showBioTagline && <p className="np-header__tagline">{bioLead}</p>}
            <p className="np-header__loc">
              <span>Institute of Sound</span>
              <span className="np-header__loc-dot">·</span>
              <a href={getSiteUrl()} target="_blank" rel="noopener noreferrer">
                {getSiteHost()}
              </a>
            </p>

            <IdentityCrossLinks
              artistSlug={artistSlug}
              networkHandle={profile.handle}
              className="np-header__crosslinks"
              compact
            />
          </div>
        </div>

        <div className="np-header__actions-col">
          <div className="np-header__actions">
            {isYou ? (
              <>
                <Link to="/feed" className="np-btn np-btn--primary">
                  Broadcast
                </Link>
                <button type="button" className="np-btn np-btn--outline" onClick={() => onEditProfile?.()}>
                  Edit profile
                </button>
              </>
            ) : (
              <>
                {onConnectionChange && (
                  <ConnectButton
                    targetUserId={profile.userId}
                    status={profile.viewerConnectionStatus}
                    pendingRequestId={pendingRequestId ?? undefined}
                    onStatusChange={onConnectionChange}
                    className="np-btn np-btn--primary network-connect-btn"
                  />
                )}
                <MessageButton
                  targetUserId={profile.userId}
                  className="np-btn np-btn--outline"
                />
                <FollowButton
                  targetUserId={profile.userId}
                  initialFollowing={profile.viewerIsFollowing}
                  className="np-btn np-btn--outline"
                />
              </>
            )}
            <button
              type="button"
              className="np-btn np-btn--icon"
              aria-label="More actions"
              onClick={() => void navigator.clipboard?.writeText(window.location.href)}
              title="Copy profile URL"
            >
              ⋯
            </button>
          </div>

          <ul className="np-header__stats">
            <li className="np-header__stat-item">
              <button type="button" className="np-header__stat" onClick={onOpenConnections}>
                <strong>{formatNetworkCount(profile.connectionCount)}</strong>
                <span>Connections</span>
              </button>
            </li>
            <li className="np-header__stat-item">
              <button type="button" className="np-header__stat" onClick={onOpenFollowers}>
                <strong>{formatNetworkCount(profile.followerCount)}</strong>
                <span>Followers</span>
              </button>
            </li>
            <li className="np-header__stat-item">
              <button type="button" className="np-header__stat" onClick={onOpenFollowing}>
                <strong>{formatNetworkCount(profile.followingCount)}</strong>
                <span>Following</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {pills.length > 0 && (
        <ul className="np-header__pills">
          {pills.map((label) => (
            <li key={label} className="np-header__pill">
              {label}
            </li>
          ))}
        </ul>
      )}

      {fandomBadges.length > 0 && (
        <FandomSupporterBadgesList badges={fandomBadges} className="np-header__fandom" />
      )}

      {pickerKind === 'avatar' && (
        <ProfilePhotoPickerModal
          open
          kind="avatar"
          title="Profile photo"
          currentUrl={profile.avatarUrl}
          suggestions={avatarSuggestions}
          saving={saving}
          onClose={() => setPickerKind(null)}
          onSelect={(url) => savePhoto('avatar', url)}
        />
      )}

      {pickerKind === 'cover' && (
        <ProfilePhotoPickerModal
          open
          kind="cover"
          title="Cover photo"
          currentUrl={profile.coverUrl}
          suggestions={coverSuggestions}
          saving={saving}
          onClose={() => setPickerKind(null)}
          onSelect={(url) => savePhoto('cover', url)}
        />
      )}
    </header>
  )
}
