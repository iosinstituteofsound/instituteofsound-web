import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Disc3, ListMusic, Music2, Search, X } from 'lucide-react'
import { useGlobalSearch } from '@/modules/search/hooks/use-global-search'
import type {
  DiscoverableRoleDto,
  MusicSearchPlaylistDto,
  MusicSearchReleaseDto,
  MusicSearchTrackDto,
  SearchProfileDto,
} from '@/modules/search/api/search.api'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import {
  ROLE_DISCOVER_CATEGORIES,
  getRoleDiscoverCategoryLabel,
  type SearchCategoryFilter,
} from '@/shared/data/role-discover-categories'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import { cn } from '@/shared/lib/cn'
import '@/styles/global-search-modal.css'

interface GlobalSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function pickTopResult(
  profiles: SearchProfileDto[],
  roles: DiscoverableRoleDto[],
  queryText: string,
): { kind: 'profile'; item: SearchProfileDto } | { kind: 'role'; item: DiscoverableRoleDto } | null {
  const needle = queryText.trim().toLowerCase()
  if (!needle) return null

  const exactProfile = profiles.find(
    (profile) =>
      profile.email?.toLowerCase() === needle ||
      profile.name.toLowerCase() === needle ||
      profile.username?.toLowerCase() === needle,
  )
  if (exactProfile) return { kind: 'profile', item: exactProfile }

  const partialProfile = profiles.find(
    (profile) =>
      profile.email?.toLowerCase().includes(needle) ||
      profile.name.toLowerCase().includes(needle) ||
      profile.username?.toLowerCase().includes(needle),
  )
  if (partialProfile) return { kind: 'profile', item: partialProfile }

  if (profiles[0]) return { kind: 'profile', item: profiles[0] }
  if (roles[0]) return { kind: 'role', item: roles[0] }
  return null
}

function profileSubtitle(profile: SearchProfileDto) {
  if (profile.username) return `@${profile.username}`
  if (profile.email) return profile.email
  if (profile.roles.length > 0) return profile.roles.join(', ')
  return 'Profile'
}

function profileHref(profile: SearchProfileDto) {
  return profile.clickPath ?? null
}

function RoleRow({ role }: { role: DiscoverableRoleDto }) {
  return (
    <button type="button" className="global-search-role-row w-full text-left">
      <span className="global-search-role-thumb">{initials(role.name)}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{role.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {getRoleDiscoverCategoryLabel(role.discoverCategory)}
          {role.description ? ` · ${role.description}` : ''}
        </span>
      </span>
    </button>
  )
}

function ProfileRow({ profile, onNavigate }: { profile: SearchProfileDto; onNavigate: () => void }) {
  const href = profileHref(profile)
  const content = (
    <>
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt=""
          className="global-search-role-thumb h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <span className="global-search-role-thumb rounded-full">{initials(profile.name)}</span>
      )}
      <span className="min-w-0">
        <VerifiedUserName
          name={profile.name}
          isVerified={profile.isVerified}
          className="text-sm font-medium"
          nameClassName="truncate font-medium"
        />
        <span className="block truncate text-xs text-muted-foreground">{profileSubtitle(profile)}</span>
      </span>
    </>
  )

  if (!href) {
    return <div className="global-search-role-row w-full text-left opacity-70">{content}</div>
  }

  return (
    <Link to={href} onClick={onNavigate} className="global-search-role-row w-full text-left">
      {content}
    </Link>
  )
}

function CategoryCard({ role }: { role: DiscoverableRoleDto }) {
  return (
    <button type="button" className="global-search-category-card">
      <span className="global-search-category-avatar">{initials(role.name)}</span>
      <span className="block w-full truncate text-sm font-semibold">{role.name}</span>
      <span className="block text-xs text-muted-foreground">
        {getRoleDiscoverCategoryLabel(role.discoverCategory)}
      </span>
    </button>
  )
}

function ProfileCard({ profile, onNavigate }: { profile: SearchProfileDto; onNavigate: () => void }) {
  const href = profileHref(profile)
  const content = (
    <>
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt=""
          className="global-search-category-avatar h-28 w-28 rounded-full object-cover"
        />
      ) : (
        <span className="global-search-category-avatar">{initials(profile.name)}</span>
      )}
      <VerifiedUserName
        name={profile.name}
        isVerified={profile.isVerified}
        className="w-full text-sm font-semibold"
        nameClassName="truncate font-semibold"
      />
      <span className="block text-xs text-muted-foreground">Profile</span>
    </>
  )

  if (!href) {
    return <div className="global-search-category-card opacity-70">{content}</div>
  }

  return (
    <Link to={href} onClick={onNavigate} className="global-search-category-card">
      {content}
    </Link>
  )
}

function MusicArt({ coverUrl, fallback }: { coverUrl?: string; fallback: React.ReactNode }) {
  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt=""
        className="global-search-role-thumb h-10 w-10 rounded-md object-cover"
      />
    )
  }
  return <span className="global-search-role-thumb rounded-md">{fallback}</span>
}

function ReleaseRow({ item, onNavigate }: { item: MusicSearchReleaseDto; onNavigate: () => void }) {
  return (
    <Link to={item.href} onClick={onNavigate} className="global-search-role-row w-full text-left">
      <MusicArt coverUrl={item.coverUrl} fallback={<Disc3 size={16} aria-hidden />} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{item.title}</span>
        <span className="block truncate text-xs text-muted-foreground">
          Release{item.artistName ? ` · ${item.artistName}` : ''}
          {item.type ? ` · ${item.type}` : ''}
        </span>
      </span>
    </Link>
  )
}

function TrackRow({ item, onNavigate }: { item: MusicSearchTrackDto; onNavigate: () => void }) {
  return (
    <Link to={item.href} onClick={onNavigate} className="global-search-role-row w-full text-left">
      <MusicArt coverUrl={item.coverUrl} fallback={<Music2 size={16} aria-hidden />} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{item.title}</span>
        <span className="block truncate text-xs text-muted-foreground">
          Track{item.artistName ? ` · ${item.artistName}` : ''}
          {item.releaseTitle ? ` · ${item.releaseTitle}` : ''}
        </span>
      </span>
    </Link>
  )
}

function PlaylistRow({ item, onNavigate }: { item: MusicSearchPlaylistDto; onNavigate: () => void }) {
  return (
    <Link to={item.href} onClick={onNavigate} className="global-search-role-row w-full text-left">
      <MusicArt coverUrl={item.coverUrl} fallback={<ListMusic size={16} aria-hidden />} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{item.title}</span>
        <span className="block truncate text-xs text-muted-foreground">Playlist</span>
      </span>
    </Link>
  )
}

function MusicCard({
  title,
  subtitle,
  coverUrl,
  href,
  onNavigate,
  fallback,
}: {
  title: string
  subtitle: string
  coverUrl?: string
  href: string
  onNavigate: () => void
  fallback: React.ReactNode
}) {
  return (
    <Link to={href} onClick={onNavigate} className="global-search-category-card">
      {coverUrl ? (
        <img src={coverUrl} alt="" className="global-search-category-avatar h-28 w-28 rounded-md object-cover" />
      ) : (
        <span className="global-search-category-avatar rounded-md">{fallback}</span>
      )}
      <span className="block w-full truncate text-sm font-semibold">{title}</span>
      <span className="block text-xs text-muted-foreground">{subtitle}</span>
    </Link>
  )
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SearchCategoryFilter>('all')

  const { roles: roleData, users: userData, music: musicData, isLoading, isFetching } = useGlobalSearch(
    { q: query, category, limit: 32 },
    open,
  )

  useEffect(() => {
    if (!open) {
      setQuery('')
      setCategory('all')
      return
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [open])

  const roles = roleData?.roles ?? []
  const profiles = userData?.users ?? []
  const releases = musicData?.releases ?? []
  const tracks = musicData?.tracks ?? []
  const playlists = musicData?.playlists ?? []
  const hasQuery = Boolean(query.trim())
  const topResult = useMemo(
    () => pickTopResult(profiles, roles, query),
    [profiles, roles, query],
  )
  const topProfile = topResult?.kind === 'profile' ? topResult.item : null
  const topRole = topResult?.kind === 'role' ? topResult.item : null
  const topResultIsProfile = topResult?.kind === 'profile'
  const listProfiles = topResultIsProfile
    ? profiles.filter((profile) => profile.id !== topProfile?.id).slice(0, 5)
    : profiles.slice(0, 5)
  const listRoles = topResult?.kind === 'role'
    ? roles.filter((role) => role.id !== topRole?.id).slice(0, 5)
    : roles.slice(0, 5)

  const chips = useMemo(() => {
    const roleCounts = new Map((roleData?.categories ?? []).map((item) => [item.id, item.count]))
    const visibleRoleCategories = ROLE_DISCOVER_CATEGORIES.filter(
      (item) => (roleCounts.get(item.id) ?? 0) > 0,
    )

    const items: Array<{ id: SearchCategoryFilter; label: string }> = [{ id: 'all', label: 'All' }]

    if (profiles.length > 0 || (hasQuery && category === 'profiles')) {
      items.push({ id: 'profiles', label: 'Profiles' })
    }

    if (releases.length > 0 || tracks.length > 0 || (hasQuery && category === 'releases')) {
      items.push({ id: 'releases', label: 'Releases & tracks' })
    }

    if (playlists.length > 0 || (hasQuery && category === 'playlists')) {
      items.push({ id: 'playlists', label: 'Playlists' })
    }

    for (const item of visibleRoleCategories) {
      items.push({ id: item.id, label: item.label })
    }

    return items
  }, [roleData?.categories, profiles.length, releases.length, tracks.length, playlists.length, hasQuery, category])

  const groupedByCategory = useMemo(() => {
    if (category !== 'all') return []
    const map = new Map<string, DiscoverableRoleDto[]>()
    for (const role of roles) {
      const bucket = map.get(role.discoverCategory) ?? []
      bucket.push(role)
      map.set(role.discoverCategory, bucket)
    }
    return ROLE_DISCOVER_CATEGORIES.filter((item) => (map.get(item.id)?.length ?? 0) > 0).map(
      (item) => ({
        id: item.id,
        label: item.label,
        roles: map.get(item.id) ?? [],
      }),
    )
  }, [category, roles])

  const showTopGrid = hasQuery && category === 'all' && topResult !== null
  const busy = isLoading || isFetching
  const hasMusic = releases.length > 0 || tracks.length > 0 || playlists.length > 0
  const hasResults = roles.length > 0 || profiles.length > 0 || hasMusic
  const closeModal = () => onOpenChange(false)

  const musicSections = (
    <>
      {(category === 'all' || category === 'releases') && (releases.length > 0 || tracks.length > 0) ? (
        <section className="global-search-section">
          <h3 className="global-search-section-title">Releases & tracks</h3>
          <div className="global-search-role-list">
            {releases.map((item) => (
              <ReleaseRow key={`release-${item.id}`} item={item} onNavigate={closeModal} />
            ))}
            {tracks.map((item) => (
              <TrackRow key={`track-${item.id}`} item={item} onNavigate={closeModal} />
            ))}
          </div>
        </section>
      ) : null}

      {(category === 'all' || category === 'playlists') && playlists.length > 0 ? (
        <section className="global-search-section">
          <h3 className="global-search-section-title">Playlists</h3>
          <div className="global-search-role-list">
            {playlists.map((item) => (
              <PlaylistRow key={item.id} item={item} onNavigate={closeModal} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="global-search-modal border-0 p-0 shadow-2xl sm:max-w-none"
      >
        <div className="global-search-modal-toolbar">
          <div className="global-search-modal-input-wrap">
            <Search className="global-search-modal-input-icon" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search releases, tracks, playlists, people, and more"
              className="global-search-modal-input"
              aria-label="Search"
            />
            {query ? (
              <button
                type="button"
                className="global-search-modal-clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {chips.length > 1 ? (
            <div className="global-search-modal-chips">
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={cn('global-search-chip', category === chip.id && 'global-search-chip-active')}
                  onClick={() => setCategory(chip.id)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="global-search-modal-body">
          {!hasQuery ? (
            <p className="global-search-empty text-sm">Type to search releases, playlists, people, and more.</p>
          ) : busy && !hasResults ? (
            <p className="global-search-empty text-sm">Searching…</p>
          ) : !hasResults ? (
            <p className="global-search-empty text-sm">No results for &ldquo;{query.trim()}&rdquo;.</p>
          ) : category === 'profiles' ? (
            <section>
              <h3 className="global-search-section-title">Profiles</h3>
              <div className="global-search-category-row">
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} onNavigate={closeModal} />
                ))}
              </div>
            </section>
          ) : category === 'releases' ? (
            <>
              {releases.length > 0 || tracks.length > 0 ? (
                <section>
                  <h3 className="global-search-section-title">Releases & tracks</h3>
                  <div className="global-search-category-row">
                    {releases.map((item) => (
                      <MusicCard
                        key={`release-${item.id}`}
                        title={item.title}
                        subtitle={`Release${item.artistName ? ` · ${item.artistName}` : ''}`}
                        coverUrl={item.coverUrl}
                        href={item.href}
                        onNavigate={closeModal}
                        fallback={<Disc3 size={28} aria-hidden />}
                      />
                    ))}
                    {tracks.map((item) => (
                      <MusicCard
                        key={`track-${item.id}`}
                        title={item.title}
                        subtitle={`Track${item.artistName ? ` · ${item.artistName}` : ''}${item.releaseTitle ? ` · ${item.releaseTitle}` : ''}`}
                        coverUrl={item.coverUrl}
                        href={item.href}
                        onNavigate={closeModal}
                        fallback={<Music2 size={28} aria-hidden />}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <p className="global-search-empty text-sm">No releases or tracks found.</p>
              )}
            </>
          ) : category === 'playlists' ? (
            <>
              {playlists.length > 0 ? (
                <section>
                  <h3 className="global-search-section-title">Playlists</h3>
                  <div className="global-search-category-row">
                    {playlists.map((item) => (
                      <MusicCard
                        key={item.id}
                        title={item.title}
                        subtitle="Playlist"
                        coverUrl={item.coverUrl}
                        href={item.href}
                        onNavigate={closeModal}
                        fallback={<ListMusic size={28} aria-hidden />}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <p className="global-search-empty text-sm">No playlists found.</p>
              )}
            </>
          ) : showTopGrid ? (
            <div className="global-search-grid-top">
              <section>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Top result</h3>
                {topResultIsProfile && topProfile ? (
                  profileHref(topProfile) ? (
                    <Link
                      to={profileHref(topProfile)!}
                      onClick={closeModal}
                      className="global-search-top-result flex w-full items-center gap-4 text-left"
                    >
                      {topProfile.avatarUrl ? (
                        <img
                          src={topProfile.avatarUrl}
                          alt=""
                          className="global-search-top-result-art h-[5.5rem] w-[5.5rem] rounded-md object-cover"
                        />
                      ) : (
                        <span className="global-search-top-result-art rounded-full">
                          {initials(topProfile.name)}
                        </span>
                      )}
                      <span className="min-w-0">
                        <VerifiedUserName
                          name={topProfile.name}
                          isVerified={topProfile.isVerified}
                          className="text-2xl font-bold"
                          nameClassName="truncate font-bold"
                        />
                        <span className="mt-1 block truncate text-sm text-muted-foreground">
                          Profile · {profileSubtitle(topProfile)}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <div className="global-search-top-result flex w-full items-center gap-4 text-left opacity-70">
                      <span className="global-search-top-result-art rounded-full">
                        {initials(topProfile.name)}
                      </span>
                      <span className="min-w-0">
                        <VerifiedUserName
                          name={topProfile.name}
                          isVerified={topProfile.isVerified}
                          className="text-2xl font-bold"
                          nameClassName="truncate font-bold"
                        />
                        <span className="mt-1 block truncate text-sm text-muted-foreground">
                          Profile · {profileSubtitle(topProfile)}
                        </span>
                      </span>
                    </div>
                  )
                ) : topRole ? (
                  <button type="button" className="global-search-top-result flex w-full items-center gap-4 text-left">
                    <span className="global-search-top-result-art">{initials(topRole.name)}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-2xl font-bold">{topRole.name}</span>
                      <span className="mt-1 block truncate text-sm text-muted-foreground">
                        {getRoleDiscoverCategoryLabel(topRole.discoverCategory)}
                        {topRole.description ? ` · ${topRole.description}` : ''}
                      </span>
                    </span>
                  </button>
                ) : null}
              </section>

              <section className="space-y-4">
                {listProfiles.length > 0 ? (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Profiles</h3>
                    <div className="global-search-role-list">
                      {listProfiles.map((profile) => (
                        <ProfileRow key={profile.id} profile={profile} onNavigate={closeModal} />
                      ))}
                    </div>
                  </div>
                ) : null}

                {listRoles.length > 0 ? (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Roles</h3>
                    <div className="global-search-role-list">
                      {listRoles.map((role) => (
                        <RoleRow key={role.id} role={role} />
                      ))}
                    </div>
                  </div>
                ) : null}

                {releases.length > 0 || tracks.length > 0 ? (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Releases & tracks</h3>
                    <div className="global-search-role-list">
                      {releases.slice(0, 5).map((item) => (
                        <ReleaseRow key={`release-${item.id}`} item={item} onNavigate={closeModal} />
                      ))}
                      {tracks.slice(0, 5).map((item) => (
                        <TrackRow key={`track-${item.id}`} item={item} onNavigate={closeModal} />
                      ))}
                    </div>
                  </div>
                ) : null}

                {playlists.length > 0 ? (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Playlists</h3>
                    <div className="global-search-role-list">
                      {playlists.slice(0, 5).map((item) => (
                        <PlaylistRow key={item.id} item={item} onNavigate={closeModal} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            </div>
          ) : category !== 'all' ? (
            <section>
              <h3 className="global-search-section-title">
                {getRoleDiscoverCategoryLabel(category)}
              </h3>
              <div className="global-search-category-row">
                {roles.map((role) => (
                  <CategoryCard key={role.id} role={role} />
                ))}
              </div>
            </section>
          ) : (
            <>
              {profiles.length > 0 ? (
                <section className="global-search-section">
                  <h3 className="global-search-section-title">Profiles</h3>
                  <div className="global-search-category-row">
                    {profiles.map((profile) => (
                      <ProfileCard key={profile.id} profile={profile} onNavigate={closeModal} />
                    ))}
                  </div>
                </section>
              ) : null}

              {groupedByCategory.map((section) => (
                <section key={section.id} className="global-search-section">
                  <h3 className="global-search-section-title">{section.label}</h3>
                  <div className="global-search-category-row">
                    {section.roles.map((role) => (
                      <CategoryCard key={role.id} role={role} />
                    ))}
                  </div>
                </section>
              ))}

              {musicSections}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
