import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import type { User } from '@/lib/auth/types'
import type {
  ArtistAlbum,
  ArtistBioTimelineEntry,
  ArtistLineupEntry,
  ArtistMerchItem,
  ArtistProfile,
  ArtistTrack,
  ArtistVideo,
} from '@/lib/artist-profile/types'
import {
  addArtistAlbum,
  addArtistTrack,
  addArtistVideo,
  getProfileForUser,
  upsertArtistProfile,
} from '@/lib/artist-profile/service'
import {
  localGetAlbums,
  localGetBioTimeline,
  localGetLineup,
  localGetMerch,
  localGetTracks,
  localGetVideos,
} from '@/lib/artist-profile/storage'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import * as sb from '@/lib/artist-profile/supabaseProfile'
import { normalizeInfluenceTags } from '@/lib/artist-profile/influences'
import { slugifyArtistName } from '@/lib/artist-profile/slug'
import {
  evaluateProfileCompleteness,
  getProfileCompletionStatus,
  PROFILE_COMPLETION_ITEMS,
  type ProfileCompletenessInput,
} from '@/lib/artist-profile/completeness'
import {
  activityDaysRemaining,
  draftDaysRemaining,
} from '@/lib/artist-profile/pageLifecycle'
import {
  artistPageStatusLabel,
  artistPublicationHint,
  computeArtistPublication,
  getArtistPublicationState,
} from '@/lib/artist-profile/profileVisibility'
import { ArtistPageRulesCallout } from '@/components/dashboard/ArtistPageRulesCallout'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { DismissibleBanner } from '@/components/ui/DismissibleBanner'
import {
  ArtistCatalogImport,
  type CatalogProfileSuggestions,
} from '@/components/dashboard/ArtistCatalogImport'
import {
  EditableAlbumRow,
  EditableTrackRow,
  EditableVideoRow,
} from '@/components/dashboard/ArtistMediaEditors'
import { ArtistBrandingPanel } from '@/components/dashboard/ArtistBrandingPanel'
import { ArtistProfileAnalyticsPanel } from '@/components/dashboard/ArtistProfileAnalytics'
import { ArtistBioTimelineEditor } from '@/components/dashboard/ArtistBioTimelineEditor'
import { ArtistLineupEditor } from '@/components/dashboard/ArtistLineupEditor'
import { ArtistMerchEditor } from '@/components/dashboard/ArtistMerchEditor'
import { ArtistPressKitEditor } from '@/components/dashboard/ArtistPressKitEditor'
import { ArtistProfileQrCard } from '@/components/dashboard/ArtistProfileQrCard'
import {
  ARTIST_THEME_PRESETS,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_THEME_PRESET,
  type ArtistThemePreset,
} from '@/lib/artist-profile/branding'
import {
  DEFAULT_HERO_LAYOUT,
  type HeroLayout,
} from '@/lib/artist-profile/heroLayout'
import {
  DEFAULT_SOCIAL_LINK_ORDER,
  type SocialLinkKey,
} from '@/lib/artist-profile/socialOrder'
import { ArtistSocialOrderEditor } from '@/components/dashboard/ArtistSocialOrderEditor'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { parseYouTubeUrl } from '@/lib/community/musicLinks'
import { fetchLatestVideosFromChannelUrl } from '@/lib/artist-profile/youtubeChannelImport'
import {
  ArtistProfileSectionNav,
  type ProfileSectionLink,
} from '@/components/dashboard/ArtistProfileSectionNav'

const PROFILE_SECTIONS: ProfileSectionLink[] = [
  { id: 'overview', label: 'Overview', hint: 'Stats & checklist' },
  { id: 'identity', label: 'Identity', hint: 'Name & bio' },
  { id: 'photos', label: 'Photos', hint: 'Avatar & banner' },
  { id: 'story', label: 'Story', hint: 'Timeline' },
  { id: 'branding', label: 'Look', hint: 'Colors & hero' },
  { id: 'share', label: 'Share', hint: 'QR & press' },
  { id: 'links', label: 'Social', hint: 'Spotify, IG…' },
  { id: 'music', label: 'Music', hint: 'Tracks & import' },
  { id: 'releases', label: 'Releases', hint: 'Albums & EPs' },
  { id: 'videos', label: 'Videos', hint: 'YouTube' },
  { id: 'merch', label: 'Merch', hint: 'Store links' },
  { id: 'lineup', label: 'Lineup', hint: 'Credits' },
]

interface ArtistProfileEditorProps {
  user: User
}

export function ArtistProfileEditor({ user }: ArtistProfileEditorProps) {
  const [profile, setProfile] = useState<ArtistProfile | null>(null)
  const [tracks, setTracks] = useState<ArtistTrack[]>([])
  const [albums, setAlbums] = useState<ArtistAlbum[]>([])
  const [videos, setVideos] = useState<ArtistVideo[]>([])
  const [merch, setMerch] = useState<ArtistMerchItem[]>([])
  const [lineup, setLineup] = useState<ArtistLineupEntry[]>([])
  const [bioTimeline, setBioTimeline] = useState<ArtistBioTimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [displayName, setDisplayName] = useState(user.name)
  const [slug, setSlug] = useState('')
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [genresText, setGenresText] = useState('')
  const [influencesText, setInfluencesText] = useState('')
  const [country, setCountry] = useState('')
  const [artistManagerName, setArtistManagerName] = useState('')
  const [artistManagerHandle, setArtistManagerHandle] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [monthlyListeners, setMonthlyListeners] = useState('—')
  const [published, setPublished] = useState(false)
  const [pickTrackId, setPickTrackId] = useState('')
  const [spotify, setSpotify] = useState('')
  const [youtube, setYoutube] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [bandcamp, setBandcamp] = useState('')
  const [website, setWebsite] = useState('')
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR)
  const [themePreset, setThemePreset] = useState<ArtistThemePreset>(DEFAULT_THEME_PRESET)
  const [heroVideoUrl, setHeroVideoUrl] = useState('')
  const [heroLayout, setHeroLayout] = useState<HeroLayout>(DEFAULT_HERO_LAYOUT)
  const [pressKitUrl, setPressKitUrl] = useState('')
  const [pressKitLabel, setPressKitLabel] = useState('')
  const [socialLinkOrder, setSocialLinkOrder] = useState<SocialLinkKey[]>(
    [...DEFAULT_SOCIAL_LINK_ORDER]
  )

  const [trackTitle, setTrackTitle] = useState('')
  const [trackUrl, setTrackUrl] = useState('')
  const [trackCover, setTrackCover] = useState('')
  const [albumTitle, setAlbumTitle] = useState('')
  const [albumYear, setAlbumYear] = useState('')
  const [albumCover, setAlbumCover] = useState('')
  const [albumType, setAlbumType] = useState<'album' | 'single' | 'ep'>('album')
  const [videoTitle, setVideoTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [channelImportUrl, setChannelImportUrl] = useState('')
  const [importingChannelVideos, setImportingChannelVideos] = useState(false)
  const [channelImportProgress, setChannelImportProgress] = useState(0)
  const [channelImportStatus, setChannelImportStatus] = useState('')
  const [channelImportError, setChannelImportError] = useState('')
  const [bulkTrackUrls, setBulkTrackUrls] = useState('')
  const [bulkAdding, setBulkAdding] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [brandingSaving, setBrandingSaving] = useState(false)

  const loadChildData = useCallback(async (profileId: string) => {
    if (isSupabaseConfigured()) {
      const [t, a, v, m, l, bt] = await Promise.all([
        sb.supabaseGetTracks(profileId),
        sb.supabaseGetAlbums(profileId),
        sb.supabaseGetVideos(profileId),
        sb.supabaseGetMerch(profileId),
        sb.supabaseGetLineup(profileId),
        sb.supabaseGetBioTimeline(profileId),
      ])
      setTracks(t)
      setAlbums(a)
      setVideos(v)
      setMerch(m)
      setLineup(l)
      setBioTimeline(bt)
      return { trackCount: t.length, videoCount: v.length }
    }
    const t = localGetTracks(profileId)
    const v = localGetVideos(profileId)
    setTracks(t)
    setAlbums(localGetAlbums(profileId))
    setVideos(v)
    setMerch(localGetMerch(profileId))
    setLineup(localGetLineup(profileId))
    setBioTimeline(localGetBioTimeline(profileId))
    return { trackCount: t.length, videoCount: v.length }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const p = await getProfileForUser(user.id)
      setProfile(p)
      if (p) {
        setDisplayName(p.displayName)
        setSlug(p.slug)
        setTagline(p.tagline ?? '')
        setBio(p.bio ?? '')
        setGenresText(p.genres.join(', '))
        setInfluencesText(p.influenceTags.join(', '))
        setCountry(p.country ?? '')
        setArtistManagerName(p.artistManagerName ?? '')
        setArtistManagerHandle(p.artistManagerHandle ?? '')
        setAvatarUrl(p.avatarUrl ?? '')
        setBannerUrl(p.bannerUrl ?? '')
        setLogoUrl(p.logoUrl ?? '')
        setMonthlyListeners(p.monthlyListenersDisplay)
        setPickTrackId(p.artistPickTrackId ?? '')
        setSpotify(p.social.spotify ?? '')
        setYoutube(p.social.youtube ?? '')
        setInstagram(p.social.instagram ?? '')
        setFacebook(p.social.facebook ?? '')
        setBandcamp(p.social.bandcamp ?? '')
        setWebsite(p.social.website ?? '')
        setAccentColor(p.accentColor)
        setThemePreset(p.themePreset)
        setHeroVideoUrl(p.heroVideoUrl ?? '')
        setHeroLayout(p.heroLayout)
        setSocialLinkOrder(p.socialLinkOrder)
        setPressKitUrl(p.pressKitUrl ?? '')
        setPressKitLabel(p.pressKitLabel ?? '')
        const counts = await loadChildData(p.id)
        setPublished(getArtistPublicationState(p, counts).published)
      } else {
        setSlug(slugifyArtistName(user.name))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user.id, user.name, loadChildData])

  useEffect(() => {
    refresh()
  }, [refresh])

  const buildCompletenessInput = (
    trackCount = tracks.length,
    videoCount = videos.length
  ): ProfileCompletenessInput => ({
    displayName,
    slug: slug || slugifyArtistName(displayName),
    bio,
    genres: genresText
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean),
    avatarUrl,
    trackCount,
    videoCount,
  })

  const completionStatus = getProfileCompletionStatus(buildCompletenessInput())
  const publication = profile
    ? getArtistPublicationState(profile, { trackCount: tracks.length, videoCount: videos.length })
    : computeArtistPublication(buildCompletenessInput(), {
        lastActivityAt: new Date().toISOString(),
        pageRefreshedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })

  type BrandingPatch = {
    accentColor?: string
    themePreset?: ArtistThemePreset
    heroVideoUrl?: string
    heroLayout?: HeroLayout
  }

  const persistProfile = async (
    mediaCounts?: { trackCount?: number; videoCount?: number },
    brandingPatch?: BrandingPatch
  ) => {
    const genres = genresText
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
    const influenceTags = normalizeInfluenceTags(influencesText)
    const completeness = evaluateProfileCompleteness(
      buildCompletenessInput(mediaCounts?.trackCount, mediaCounts?.videoCount),
    )
    const pub = computeArtistPublication(
      buildCompletenessInput(mediaCounts?.trackCount, mediaCounts?.videoCount),
      profile ?? {
        lastActivityAt: new Date().toISOString(),
        pageRefreshedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    )
    const nextAccent = brandingPatch?.accentColor ?? accentColor
    const nextTheme = brandingPatch?.themePreset ?? themePreset
    const nextHeroVideo =
      brandingPatch?.heroVideoUrl !== undefined
        ? brandingPatch.heroVideoUrl
        : heroVideoUrl
    const nextHeroLayout = brandingPatch?.heroLayout ?? heroLayout

    const updated = await upsertArtistProfile(user, {
      displayName,
      slug: slug || slugifyArtistName(displayName),
      tagline,
      bio,
      genres,
      influenceTags,
      country,
      artistManagerName,
      artistManagerHandle,
      avatarUrl,
      bannerUrl,
      logoUrl,
      monthlyListenersDisplay: monthlyListeners,
      artistPickTrackId: pickTrackId || null,
      published: pub.published,
      pageStatus: pub.pageStatus,
      pageRefreshedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      accentColor: nextAccent,
      themePreset: nextTheme,
      heroVideoUrl: nextHeroVideo || undefined,
      heroLayout: nextHeroLayout,
      socialLinkOrder,
      pressKitUrl: pressKitUrl.trim() || undefined,
      pressKitLabel: pressKitLabel.trim() || undefined,
      social: { spotify, youtube, instagram, facebook, bandcamp, website },
    })
    setProfile(updated)
    setPublished(pub.published)
    return { updated, completeness, publication: pub }
  }

  const brandingMigrationHint = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err)
    if (/hero_layout|theme_preset|schema cache/i.test(msg)) {
      return `${msg} — Run Supabase migrations 010-artist-branding.sql and 012-artist-hero-layout.sql in the SQL Editor, then try again.`
    }
    return msg
  }

  const saveBranding = async (patch: BrandingPatch) => {
    if (patch.themePreset !== undefined) setThemePreset(patch.themePreset)
    if (patch.heroLayout !== undefined) setHeroLayout(patch.heroLayout)
    if (patch.accentColor !== undefined) setAccentColor(patch.accentColor)
    if (patch.heroVideoUrl !== undefined) setHeroVideoUrl(patch.heroVideoUrl)

    setBrandingSaving(true)
    setError('')
    try {
      await persistProfile(undefined, patch)
      setMessage('Look & hero saved — open Preview to see it on your page.')
    } catch (err) {
      setError(brandingMigrationHint(err))
    } finally {
      setBrandingSaving(false)
    }
  }

  const handleThemeChange = (preset: ArtistThemePreset) => {
    const suggested =
      ARTIST_THEME_PRESETS.find((p) => p.id === preset)?.suggestedAccent ?? accentColor
    void saveBranding({ themePreset: preset, accentColor: suggested })
  }

  const handleHeroLayoutChange = (layout: HeroLayout) => {
    void saveBranding({ heroLayout: layout })
  }

  const saveProfile = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const { updated, completeness } = await persistProfile()
      if (completeness.complete) {
        setMessage('Profile complete — you are now live on Discover.')
      } else {
        setMessage(
          `Saved as draft. To go live on Discover, still needed: ${completeness.missing.join(', ')}`
        )
      }
      await loadChildData(updated.id)
    } catch (err) {
      setError(brandingMigrationHint(err))
    } finally {
      setSaving(false)
    }
  }

  const reloadMediaAndTryDiscover = async (profileId: string) => {
    let trackCount = tracks.length
    let videoCount = videos.length
    if (isSupabaseConfigured()) {
      const [t, a, v] = await Promise.all([
        sb.supabaseGetTracks(profileId),
        sb.supabaseGetAlbums(profileId),
        sb.supabaseGetVideos(profileId),
      ])
      setTracks(t)
      setAlbums(a)
      setVideos(v)
      trackCount = t.length
      videoCount = v.length
    } else {
      setTracks(localGetTracks(profileId))
      setAlbums(localGetAlbums(profileId))
      setVideos(localGetVideos(profileId))
      trackCount = localGetTracks(profileId).length
      videoCount = localGetVideos(profileId).length
    }
    setSaving(true)
    setError('')
    try {
      const { completeness } = await persistProfile({ trackCount, videoCount })
      if (completeness.complete) {
        setMessage('Profile complete — you are now live on Discover.')
      }
      return completeness
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auto-publish failed')
      return evaluateProfileCompleteness(buildCompletenessInput(trackCount, videoCount))
    } finally {
      setSaving(false)
    }
  }

  const ensureProfile = async () => {
    if (profile) return profile
    const created = await upsertArtistProfile(user, {
      displayName,
      slug: slug || slugifyArtistName(displayName),
      genres: genresText.split(',').map((g) => g.trim()).filter(Boolean),
    })
    setProfile(created)
    return created
  }

  const titleFromStreamUrl = async (url: string): Promise<string> => {
    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
      if (!res.ok) return 'Track'
      const data = (await res.json()) as { title?: string }
      return data.title?.split('·')[0]?.split(' - ')[0]?.trim() || 'Track'
    } catch {
      return 'Track'
    }
  }

  const addBulkTracks = async () => {
    const urls = bulkTrackUrls
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('http'))
    if (urls.length === 0) {
      setError('Add one stream URL per line (https://…)')
      return
    }
    setBulkAdding(true)
    setError('')
    try {
      const p = await ensureProfile()
      const existing = new Set(tracks.map((t) => t.streamUrl.trim().toLowerCase()))
      let added = 0
      let skipped = 0
      for (const streamUrl of urls) {
        if (existing.has(streamUrl.toLowerCase())) {
          skipped++
          continue
        }
        const title = await titleFromStreamUrl(streamUrl)
        await addArtistTrack(p.id, { title, streamUrl })
        existing.add(streamUrl.toLowerCase())
        added++
      }
      setBulkTrackUrls('')
      const completeness = await reloadMediaAndTryDiscover(p.id)
      if (!completeness?.complete) {
        const extra =
          added > 0
            ? `${added} track${added === 1 ? '' : 's'} added` +
              (skipped ? ` · ${skipped} duplicate skip` : '')
            : skipped
              ? `${skipped} duplicate skip`
              : ''
        if (extra) setMessage(extra)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk add failed')
    } finally {
      setBulkAdding(false)
    }
  }

  useEffect(() => {
    if (loading) return

    const sectionIds = PROFILE_SECTIONS.map((s) => s.id)
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]?.target.id
        if (top) setActiveSection(top)
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: [0.08, 0.2, 0.45] },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [loading])

  if (loading) return <LoadingTransmission variant="compact" />

  const profileSlug = profile?.slug ?? slugifyArtistName(displayName)
  const checklistDone = PROFILE_COMPLETION_ITEMS.filter(
    (item) => completionStatus[item.key as keyof typeof completionStatus],
  ).length
  const checklistTotal = PROFILE_COMPLETION_ITEMS.length
  const checklistPct = Math.round((checklistDone / checklistTotal) * 100)

  return (
    <div className="artist-dash-studio">
      <div className="artist-dash-main">
        <div className="artist-dash-toolbar">
          <div className="artist-dash-toolbar-meta">
            <MetalBadge variant={publication.pageStatus === 'live' ? 'live' : 'crimson'}>
              {artistPageStatusLabel(publication.pageStatus, publication.inactive)}
            </MetalBadge>
            <span className="artist-dash-toolbar-url">/artist/{profileSlug}</span>
            <div
              className="artist-dash-toolbar-progress"
              role="progressbar"
              aria-valuenow={checklistPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Profile ${checklistPct} percent complete`}
            >
              <span className="artist-dash-toolbar-progress-track">
                <span
                  className="artist-dash-toolbar-progress-fill"
                  style={{ width: `${checklistPct}%` }}
                />
              </span>
              <span className="artist-dash-toolbar-progress-label">
                {checklistDone}/{checklistTotal}
              </span>
            </div>
          </div>
          <div className="artist-dash-toolbar-actions">
            {profile && (
              <>
                <Link
                  to={`/artist/${profile.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ios-btn ios-btn-ghost !text-xs !py-2"
                >
                  Preview ↗
                </Link>
                <Link
                  to={`/artist/${profile.slug}/epk`}
                  target="_blank"
                  rel="noreferrer"
                  className="ios-btn ios-btn-ghost !text-xs !py-2"
                >
                  EPK ↗
                </Link>
              </>
            )}
            <Button
              type="button"
              variant="primary"
              disabled={saving}
              onClick={saveProfile}
              className="!text-xs !py-2"
            >
              {saving ? 'Updating…' : 'Page update'}
            </Button>
          </div>
        </div>

        <ArtistProfileSectionNav
          sections={PROFILE_SECTIONS}
          activeId={activeSection}
          onSelect={setActiveSection}
        />

        <ArtistPageRulesCallout variant="studio" />

        {error && (
          <DismissibleBanner variant="error" onDismiss={() => setError('')}>
            {error}
          </DismissibleBanner>
        )}
        {message && !error && (
          <DismissibleBanner variant="success" onDismiss={() => setMessage('')}>
            {message}
          </DismissibleBanner>
        )}

        <DashboardSection
          id="overview"
          step="01"
          title="Overview"
          hint="Profile views, top track clicks, and your Discover checklist — start here to see what is missing."
        >
          {profile && (
            <ArtistProfileAnalyticsPanel
              profileId={profile.id}
              profileSlug={profileSlug}
              published={published}
              tracks={tracks}
            />
          )}
          <div className="artist-dash-checklist">
            <div className="artist-dash-checklist-head">
              <p className="artist-dash-checklist-title">Discover checklist</p>
              <span className="artist-dash-checklist-pct">{checklistPct}%</span>
            </div>
            <ul className="artist-dash-checklist-grid">
              {PROFILE_COMPLETION_ITEMS.map((item) => {
                const done = completionStatus[item.key as keyof typeof completionStatus]
                return (
                  <li
                    key={item.key}
                    className={clsx('artist-dash-checklist-item', done && 'artist-dash-checklist-item-done')}
                  >
                    <span className="artist-dash-checklist-mark" aria-hidden>
                      {done ? '✓' : '○'}
                    </span>
                    {item.label}
                  </li>
                )
              })}
            </ul>
            <p className="text-xs mt-4 text-muted-foreground">{artistPublicationHint(publication)}</p>
            {profile && !publication.complete && (
              <p className="text-xs mt-2 text-amber-400/90">
                Draft expires in {draftDaysRemaining(profile)} day
                {draftDaysRemaining(profile) === 1 ? '' : 's'} if the checklist stays incomplete.
              </p>
            )}
            {profile && publication.complete && (
              <p className="text-xs mt-2 text-muted-foreground">
                Activity due in {activityDaysRemaining(profile)} day
                {activityDaysRemaining(profile) === 1 ? '' : 's'} (track, video, Page update, release, spin, or drop).
              </p>
            )}
          </div>
        </DashboardSection>

        <DashboardSection
          id="identity"
          step="02"
          title="Identity & story text"
          hint="Name, tagline, bio, genres, and influences shown on your public page."
        >
        <div className="artist-dash-grid-2">
          <div>
            <FieldLabel>Band / Artist Name</FieldLabel>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <FieldLabel>URL Slug</FieldLabel>
            <Input
              value={slug}
              onChange={(e) => setSlug(slugifyArtistName(e.target.value))}
              placeholder="the-lost-symbols"
            />
          </div>
        </div>
        <div>
          <FieldLabel>Tagline</FieldLabel>
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Bio (About tab)</FieldLabel>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            aria-label="Artist bio"
            className="ios-input min-h-[100px]"
          />
        </div>
        <div>
          <FieldLabel>Genres (comma separated)</FieldLabel>
          <Input
            value={genresText}
            onChange={(e) => setGenresText(e.target.value)}
            placeholder="Black Metal, Doom, Atmospheric"
          />
        </div>
        <div>
          <FieldLabel>Influences (comma separated)</FieldLabel>
          <Input
            value={influencesText}
            onChange={(e) => setInfluencesText(e.target.value)}
            placeholder="Mayhem, Burzum, Swans, dark ambient…"
          />
          {normalizeInfluenceTags(influencesText).length > 0 && (
            <ul className="flex flex-wrap gap-1.5 mt-2">
              {normalizeInfluenceTags(influencesText).map((tag) => (
                <li
                  key={tag}
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <FieldLabel>Country</FieldLabel>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div className="artist-dash-grid-2">
          <div>
            <FieldLabel>Artist manager name (optional)</FieldLabel>
            <Input
              value={artistManagerName}
              onChange={(e) => setArtistManagerName(e.target.value)}
              placeholder="e.g. Rohan Mehta"
            />
          </div>
          <div>
            <FieldLabel>Artist manager network handle (optional)</FieldLabel>
            <Input
              value={artistManagerHandle}
              onChange={(e) => setArtistManagerHandle(e.target.value.replace(/^@/, ''))}
              placeholder="e.g. rohanmgmt"
            />
            <p className="text-xs text-muted mt-1">
              If set, this manager will be listed on your profile and their network page.
            </p>
          </div>
        </div>
        <div>
          <FieldLabel>Monthly listeners (display)</FieldLabel>
          <Input value={monthlyListeners} onChange={(e) => setMonthlyListeners(e.target.value)} />
        </div>
        </DashboardSection>

        <DashboardSection
          id="photos"
          step="03"
          title="Photos"
          hint="Avatar, banner, and logo — shown on your public page hero."
        >
          <div className="artist-dash-grid-3">
            <ImageUpload label="Avatar" folder="ios/artists" value={avatarUrl} onChange={setAvatarUrl} />
            <ImageUpload label="Banner" folder="ios/artists" value={bannerUrl} onChange={setBannerUrl} />
            <ImageUpload label="Logo" folder="ios/artists" value={logoUrl} onChange={setLogoUrl} />
          </div>
        </DashboardSection>

        {profile && (
          <DashboardSection
            id="story"
            step="04"
            title="Bio timeline"
            hint="Year-by-year milestones — formed, releases, tours."
          >
            <ArtistBioTimelineEditor
              profileId={profile.id}
              entries={bioTimeline}
              onChanged={async () => {
                if (profile) await loadChildData(profile.id)
                setMessage('Timeline updated.')
              }}
            />
          </DashboardSection>
        )}

        <DashboardSection
          id="branding"
          step="05"
          title="Look & hero"
          hint="Accent color, theme, hero video, layout style."
        >
      <ArtistBrandingPanel
        accentColor={accentColor}
        themePreset={themePreset}
        displayName={displayName}
        bannerUrl={bannerUrl}
        avatarUrl={avatarUrl}
        logoUrl={logoUrl}
        heroVideoUrl={heroVideoUrl}
        heroLayout={heroLayout}
        saving={brandingSaving}
        onAccentChange={(hex) => void saveBranding({ accentColor: hex })}
        onThemeChange={handleThemeChange}
        onHeroVideoChange={setHeroVideoUrl}
        onHeroVideoCommit={() => void saveBranding({ heroVideoUrl })}
        onHeroLayoutChange={handleHeroLayoutChange}
      />
        </DashboardSection>

        <DashboardSection
          id="share"
          step="06"
          title="Share & press"
          hint="QR codes for print and your EPK PDF for press and promoters."
          className="artist-dash-section-share"
        >
          <div className="artist-dash-share-stack">
            <ArtistProfileQrCard
              slug={profileSlug}
              displayName={displayName}
              accentColor={accentColor}
              published={published}
            />
            <ArtistPressKitEditor
              pressKitUrl={pressKitUrl}
              pressKitLabel={pressKitLabel}
              onUrlChange={setPressKitUrl}
              onLabelChange={setPressKitLabel}
            />
          </div>
        </DashboardSection>

        <DashboardSection
          id="links"
          step="07"
          title="Social links"
          hint="Spotify, YouTube, Instagram — drag to set the order they appear on your page."
        >
        <div>
          <FieldLabel>Website</FieldLabel>
          <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Spotify</FieldLabel>
          <Input type="url" value={spotify} onChange={(e) => setSpotify(e.target.value)} />
        </div>
        <div>
          <FieldLabel>YouTube</FieldLabel>
          <Input type="url" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Instagram</FieldLabel>
          <Input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Facebook</FieldLabel>
          <Input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Bandcamp</FieldLabel>
          <Input type="url" value={bandcamp} onChange={(e) => setBandcamp(e.target.value)} />
        </div>
        <ArtistSocialOrderEditor
          social={{
            website,
            spotify,
            youtube,
            instagram,
            facebook,
            bandcamp,
          }}
          order={socialLinkOrder}
          onOrderChange={setSocialLinkOrder}
        />
        </DashboardSection>

        <DashboardSection
          id="music"
          step="08"
          title="Music"
          hint="Import from Spotify or add tracks manually — plays are counted when fans hit ▶ on your page."
        >
      <ArtistCatalogImport
        initialUrl={spotify || youtube}
        tracks={tracks}
        albums={albums}
        videos={videos}
        ensureProfile={ensureProfile}
        onReload={async (profileId) => {
          await reloadMediaAndTryDiscover(profileId)
        }}
        onApplySuggestions={(s: CatalogProfileSuggestions) => {
          if (s.displayName) setDisplayName(s.displayName)
          if (s.tagline) setTagline(s.tagline)
          if (s.avatarUrl) setAvatarUrl(s.avatarUrl)
          if (s.bannerUrl) setBannerUrl(s.bannerUrl)
          if (s.genresText) setGenresText(s.genresText)
          if (s.spotify) setSpotify(s.spotify)
          if (s.youtube) setYoutube(s.youtube)
          setMessage('Catalog imported — review fields below, then Page update.')
        }}
        onImportMessage={(msg) => setMessage(msg)}
      />

        <p className="text-xs text-muted-foreground -mt-2">
          Stream URL se cover auto-fetch (Spotify, YouTube, SoundCloud).
        </p>
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Track title"
            value={trackTitle}
            onChange={(e) => setTrackTitle(e.target.value)}
            className="flex-1 min-w-[140px]"
          />
          <Input
            type="url"
            placeholder="Stream URL"
            value={trackUrl}
            onChange={(e) => setTrackUrl(e.target.value)}
            className="flex-1 min-w-[180px]"
          />
          <Button
            type="button"
            variant="metal"
            onClick={async () => {
              const p = await ensureProfile()
              await addArtistTrack(p.id, {
                title: trackTitle,
                streamUrl: trackUrl,
                coverUrl: trackCover || undefined,
              })
              setTrackTitle('')
              setTrackUrl('')
              setTrackCover('')
              await reloadMediaAndTryDiscover(p.id)
            }}
          >
            Add track
          </Button>
        </div>
        <ImageUpload
          label="Track cover"
          folder="ios/tracks"
          value={trackCover}
          onChange={setTrackCover}
        />
        <div className="border border-dashed border-mh-red/40 p-4 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-mh-red">
            Quick add (use if Spotify API is blocked)
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In the Spotify app, use <strong className="text-foreground">Share → Copy link</strong> for each track.
            Paste one URL per line below — title and cover art are fetched automatically.
          </p>
          <textarea
            rows={5}
            value={bulkTrackUrls}
            onChange={(e) => setBulkTrackUrls(e.target.value)}
            placeholder={'https://open.spotify.com/track/...\nhttps://open.spotify.com/track/...'}
            className="ios-input min-h-[100px] font-mono text-xs"
          />
          <Button type="button" variant="metal" disabled={bulkAdding} onClick={addBulkTracks}>
            {bulkAdding ? 'Adding…' : 'Add all URLs'}
          </Button>
        </div>
        {tracks.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tracks yet — add manually or import catalog.</p>
        ) : (
          <ul className="space-y-2">
            {tracks.map((t) => (
              <EditableTrackRow
                key={t.id}
                track={t}
                onSaved={async () => {
                  if (profile) await loadChildData(profile.id)
                  setMessage('Track updated.')
                }}
                onDeleted={async () => {
                  if (profile) await loadChildData(profile.id)
                  setMessage('Track removed.')
                }}
              />
            ))}
          </ul>
        )}
        {tracks.length > 0 && (
          <div>
            <FieldLabel>Artist pick track</FieldLabel>
            <select
              value={pickTrackId}
              onChange={(e) => setPickTrackId(e.target.value)}
              aria-label="Artist pick track"
              className="ios-input w-full"
            >
              <option value="">— Select —</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}
        </DashboardSection>

        <DashboardSection
          id="releases"
          step="09"
          title="Albums & singles"
          hint="Discography carousel on your public page."
        >
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Release title"
            value={albumTitle}
            onChange={(e) => setAlbumTitle(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Year"
            value={albumYear}
            onChange={(e) => setAlbumYear(e.target.value)}
            className="w-24"
          />
          <select
            value={albumType}
            onChange={(e) => setAlbumType(e.target.value as 'album' | 'single' | 'ep')}
            aria-label="Release type"
            className="ios-input"
          >
            <option value="album">Album</option>
            <option value="single">Single</option>
            <option value="ep">EP</option>
          </select>
          <Button
            type="button"
            variant="metal"
            onClick={async () => {
              const p = await ensureProfile()
              await addArtistAlbum(p.id, {
                title: albumTitle,
                releaseYear: albumYear ? parseInt(albumYear, 10) : undefined,
                releaseType: albumType,
                coverUrl: albumCover || undefined,
              })
              setAlbumTitle('')
              setAlbumYear('')
              setAlbumCover('')
              await loadChildData(p.id)
            }}
          >
            Add
          </Button>
        </div>
        <ImageUpload
          label="Cover art"
          folder="ios/albums"
          value={albumCover}
          onChange={setAlbumCover}
        />
        {albums.length === 0 ? (
          <p className="text-xs text-muted-foreground">No albums/singles yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {albums.map((a) => (
              <EditableAlbumRow
                key={a.id}
                album={a}
                onSaved={async () => {
                  if (profile) await loadChildData(profile.id)
                  setMessage('Release updated.')
                }}
                onDeleted={async () => {
                  if (profile) await loadChildData(profile.id)
                  setMessage('Release removed.')
                }}
              />
            ))}
          </ul>
        )}
        </DashboardSection>

        <DashboardSection
          id="videos"
          step="10"
          title="Videos"
          hint="YouTube links — thumbnail auto. You can also fetch latest videos from a channel URL."
        >
        <div className="ios-card p-4 mb-4 space-y-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-mh-red font-bold">
            Channel import
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              type="url"
              placeholder="https://www.youtube.com/@artistname"
              value={channelImportUrl}
              onChange={(e) => setChannelImportUrl(e.target.value)}
              className="flex-1 min-w-[260px]"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={importingChannelVideos}
              onClick={async () => {
                setChannelImportError('')
                setChannelImportStatus('Validating channel URL…')
                setChannelImportProgress(8)
                const p = await ensureProfile()
                setImportingChannelVideos(true)
                setError('')
                try {
                  setChannelImportStatus('Connecting to YouTube…')
                  setChannelImportProgress(28)
                  const fetched = await fetchLatestVideosFromChannelUrl(channelImportUrl, 8)
                  setChannelImportStatus(`Found ${fetched.length} latest videos. Importing…`)
                  setChannelImportProgress(52)
                  const existingUrls = new Set(
                    videos
                      .map((v) => parseYouTubeUrl(v.videoUrl)?.url)
                      .filter((url): url is string => Boolean(url))
                  )

                  let added = 0
                  for (let i = 0; i < fetched.length; i += 1) {
                    const v = fetched[i]
                    const parsed = parseYouTubeUrl(v.videoUrl)
                    if (!parsed || existingUrls.has(parsed.url)) continue
                    await addArtistVideo(p.id, {
                      title: v.title,
                      videoUrl: parsed.url,
                      thumbnailUrl: v.thumbnailUrl,
                    })
                    existingUrls.add(parsed.url)
                    added += 1
                    const ratio = Math.round(((i + 1) / Math.max(fetched.length, 1)) * 38)
                    setChannelImportProgress(52 + ratio)
                  }

                  await reloadMediaAndTryDiscover(p.id)
                  setChannelImportProgress(100)
                  setChannelImportStatus(
                    added > 0
                      ? `Done: imported ${added} video${added > 1 ? 's' : ''}.`
                      : 'Done: no new videos to import.'
                  )
                  setMessage(
                    added > 0
                      ? `Imported ${added} video${added > 1 ? 's' : ''} from YouTube channel.`
                      : 'No new channel videos were found to import.'
                  )
                } catch (err) {
                  setChannelImportProgress(0)
                  setChannelImportStatus('')
                  setChannelImportError(
                    err instanceof Error ? err.message : 'Could not import channel videos.'
                  )
                  setError(err instanceof Error ? err.message : 'Could not import channel videos.')
                } finally {
                  setImportingChannelVideos(false)
                }
              }}
            >
              {importingChannelVideos ? 'Fetching…' : 'Fetch from channel'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports <code>/@handle</code>, <code>/channel/UC...</code>, <code>/user/...</code>,
            <code>/c/...</code>, and custom channel URLs.
          </p>
          {(importingChannelVideos || channelImportProgress > 0) && (
            <div className="space-y-1">
              <div className="h-2 w-full bg-surface border border-border overflow-hidden">
                <div
                  className="h-full bg-mh-red transition-all duration-300"
                  style={{ width: `${Math.min(channelImportProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{channelImportStatus}</p>
            </div>
          )}
          {channelImportError && <p className="text-xs text-mh-red">{channelImportError}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Video title"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="flex-1"
          />
          <Input
            type="url"
            placeholder="YouTube URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="metal"
            onClick={async () => {
              const p = await ensureProfile()
              await addArtistVideo(p.id, { title: videoTitle, videoUrl })
              setVideoTitle('')
              setVideoUrl('')
              await reloadMediaAndTryDiscover(p.id)
            }}
          >
            Add video
          </Button>
        </div>
        {videos.length === 0 ? (
          <p className="text-xs text-muted-foreground">No videos yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {videos.map((v) => (
              <EditableVideoRow
                key={v.id}
                video={v}
                onSaved={async () => {
                  if (profile) await loadChildData(profile.id)
                  setMessage('Video updated.')
                }}
                onDeleted={async () => {
                  if (profile) await loadChildData(profile.id)
                  setMessage('Video removed.')
                }}
              />
            ))}
          </ul>
        )}
        </DashboardSection>

        {profile && (
          <DashboardSection
            id="merch"
            step="11"
            title="Merch & store"
            hint="External shop links — Shopify, Bandcamp, etc."
          >
            <ArtistMerchEditor
              profileId={profile.id}
              items={merch}
              onChanged={async () => {
                if (profile) await loadChildData(profile.id)
                setMessage('Merch updated.')
              }}
            />
          </DashboardSection>
        )}

        {profile && (
          <DashboardSection
            id="lineup"
            step="12"
            title="Lineup & credits"
            hint="Band members, guests, production."
          >
            <ArtistLineupEditor
              profileId={profile.id}
              entries={lineup}
              onChanged={async () => {
                if (profile) await loadChildData(profile.id)
                setMessage('Lineup updated.')
              }}
            />
          </DashboardSection>
        )}

        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
          <Button type="button" variant="primary" disabled={saving} onClick={saveProfile}>
            {saving ? 'Updating…' : 'Page update'}
          </Button>
          {profile && (
            <Link
              to={`/artist/${profile.slug}`}
              target="_blank"
              rel="noreferrer"
              className="ios-btn ios-btn-ghost !text-xs"
            >
              Preview public page ↗
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
