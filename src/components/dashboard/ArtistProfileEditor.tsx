import { useCallback, useEffect, useState } from 'react'
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
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { MetalBadge } from '@/components/ui/MetalBadge'
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
  const [bulkTrackUrls, setBulkTrackUrls] = useState('')
  const [bulkAdding, setBulkAdding] = useState(false)

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
    } else {
      setTracks(localGetTracks(profileId))
      setAlbums(localGetAlbums(profileId))
      setVideos(localGetVideos(profileId))
      setMerch(localGetMerch(profileId))
      setLineup(localGetLineup(profileId))
      setBioTimeline(localGetBioTimeline(profileId))
    }
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
        setAvatarUrl(p.avatarUrl ?? '')
        setBannerUrl(p.bannerUrl ?? '')
        setLogoUrl(p.logoUrl ?? '')
        setMonthlyListeners(p.monthlyListenersDisplay)
        setPublished(p.published)
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
        await loadChildData(p.id)
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

  const persistProfile = async (mediaCounts?: {
    trackCount?: number
    videoCount?: number
  }) => {
    const genres = genresText
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
    const influenceTags = normalizeInfluenceTags(influencesText)
    const completeness = evaluateProfileCompleteness(
      buildCompletenessInput(mediaCounts?.trackCount, mediaCounts?.videoCount)
    )
    const updated = await upsertArtistProfile(user, {
      displayName,
      slug: slug || slugifyArtistName(displayName),
      tagline,
      bio,
      genres,
      influenceTags,
      country,
      avatarUrl,
      bannerUrl,
      logoUrl,
      monthlyListenersDisplay: monthlyListeners,
      artistPickTrackId: pickTrackId || null,
      published: completeness.complete,
      accentColor,
      themePreset,
      heroVideoUrl: heroVideoUrl || undefined,
      heroLayout,
      socialLinkOrder,
      pressKitUrl: pressKitUrl.trim() || undefined,
      pressKitLabel: pressKitLabel.trim() || undefined,
      social: { spotify, youtube, instagram, facebook, bandcamp, website },
    })
    setProfile(updated)
    setPublished(completeness.complete)
    return { updated, completeness }
  }

  const saveProfile = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const { updated, completeness } = await persistProfile()
      if (completeness.complete) {
        setMessage('Profile complete — ab Discover section mein live ho!')
      } else {
        setMessage(
          `Saved as draft. Discover ke liye baaki: ${completeness.missing.join(', ')}`
        )
      }
      await loadChildData(updated.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
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
        setMessage('Profile complete — ab Discover section mein live ho!')
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
      setError('Har line pe ek stream URL paste karo (https://...)')
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

  if (loading) return <LoadingTransmission variant="compact" />

  const profileSlug = profile?.slug ?? slugifyArtistName(displayName)

  return (
    <div className="space-y-10 max-w-3xl">
      <p className="text-sm text-muted border-l-2 border-mh-red pl-4 leading-relaxed">
        Apni artist page ki har cheez yahan edit karo — naam, images, tracks, albums, videos.
        Jab checklist complete ho jayegi, profile <strong className="text-foreground">Discover</strong> par
        automatically live ho jayegi. Page:{' '}
        <Link to={`/artist/${profileSlug}`} className="ios-link">
          /artist/{profileSlug}
        </Link>
        . Super admin reviews appear in Editorial Featured.
      </p>

      {profile && (
        <ArtistProfileAnalyticsPanel
          profileId={profile.id}
          profileSlug={profileSlug}
          published={published}
          tracks={tracks}
        />
      )}

      {profile && (
        <div className="flex flex-wrap gap-3 items-center">
          <MetalBadge variant={published ? 'live' : 'crimson'}>
            {published ? 'Live' : 'Draft'}
          </MetalBadge>
          <Link to={`/artist/${profile.slug}`} className="ios-btn ios-btn-ghost !text-xs">
            Preview page →
          </Link>
        </div>
      )}

      <section className="ios-panel space-y-5">
        <p className="ios-kicker">Identity</p>
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
        <div>
          <FieldLabel>Monthly listeners (display)</FieldLabel>
          <Input value={monthlyListeners} onChange={(e) => setMonthlyListeners(e.target.value)} />
        </div>
        <ImageUpload label="Avatar" folder="ios/artists" value={avatarUrl} onChange={setAvatarUrl} />
        <ImageUpload label="Banner" folder="ios/artists" value={bannerUrl} onChange={setBannerUrl} />
        <ImageUpload label="Logo" folder="ios/artists" value={logoUrl} onChange={setLogoUrl} />
        <div className="border border-border/60 p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted">
            Discover listing checklist
          </p>
          <ul className="space-y-1.5 text-sm">
            {PROFILE_COMPLETION_ITEMS.map((item) => {
              const done = completionStatus[item.key]
              return (
                <li
                  key={item.key}
                  className={done ? 'text-emerald-400' : 'text-muted-foreground'}
                >
                  {done ? '✓' : '○'} {item.label}
                </li>
              )
            })}
          </ul>
          {published ? (
            <p className="text-xs text-emerald-400">
              Live on Discover — profile public hai.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Incomplete profile draft rehti hai; complete karte hi Discover par dikhegi.
            </p>
          )}
        </div>
      </section>

      {profile && (
        <ArtistBioTimelineEditor
          profileId={profile.id}
          entries={bioTimeline}
          onChanged={async () => {
            if (profile) await loadChildData(profile.id)
            setMessage('Timeline updated.')
          }}
        />
      )}

      <ArtistBrandingPanel
        accentColor={accentColor}
        themePreset={themePreset}
        displayName={displayName}
        bannerUrl={bannerUrl}
        heroVideoUrl={heroVideoUrl}
        heroLayout={heroLayout}
        onAccentChange={setAccentColor}
        onThemeChange={setThemePreset}
        onHeroVideoChange={setHeroVideoUrl}
        onHeroLayoutChange={setHeroLayout}
      />

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

      <section className="ios-panel space-y-4">
        <p className="ios-kicker">Social & Links</p>
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
      </section>

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
          setMessage('Catalog imported — review fields below, then Save profile.')
        }}
        onImportMessage={(msg) => setMessage(msg)}
      />

      <section className="ios-panel space-y-4">
        <p className="ios-kicker">Tracks (Popular top 5)</p>
        <p className="text-xs text-muted-foreground">
          Stream URL se cover auto-fetch hota hai (Spotify, YouTube, SoundCloud, etc.). Manual upload optional.
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
            Quick add (Spotify API block ho to ye use karo)
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Spotify app se har track ka <strong className="text-foreground">Share → Copy link</strong> karo.
            Neeche ek URL per line paste karo — title + cover auto aayega.
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
      </section>

      <section className="ios-panel space-y-4">
        <p className="ios-kicker">Albums & Singles</p>
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
      </section>

      {profile && (
        <ArtistMerchEditor
          profileId={profile.id}
          items={merch}
          onChanged={async () => {
            if (profile) await loadChildData(profile.id)
            setMessage('Merch updated.')
          }}
        />
      )}

      {profile && (
        <ArtistLineupEditor
          profileId={profile.id}
          entries={lineup}
          onChanged={async () => {
            if (profile) await loadChildData(profile.id)
            setMessage('Lineup updated.')
          }}
        />
      )}

      <section className="ios-panel space-y-4">
        <p className="ios-kicker">Videos</p>
        <p className="text-xs text-muted-foreground">
          Video URL daalo — thumbnail automatically set hoga.
        </p>
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
      </section>

      {error && <p className="text-mh-red text-sm">{error}</p>}
      {message && <p className="text-emerald-400 text-sm">{message}</p>}

      <Button type="button" variant="primary" disabled={saving} onClick={saveProfile}>
        {saving ? 'Saving...' : 'Save profile'}
      </Button>
    </div>
  )
}
