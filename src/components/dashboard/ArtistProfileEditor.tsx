import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '@/lib/auth/types'
import type { ArtistAlbum, ArtistProfile, ArtistTrack, ArtistVideo } from '@/lib/artist-profile/types'
import {
  addArtistAlbum,
  addArtistTrack,
  addArtistVideo,
  deleteArtistAlbum,
  deleteArtistTrack,
  deleteArtistVideo,
  getProfileForUser,
  upsertArtistProfile,
} from '@/lib/artist-profile/service'
import {
  localGetAlbums,
  localGetTracks,
  localGetVideos,
} from '@/lib/artist-profile/storage'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import * as sb from '@/lib/artist-profile/supabaseProfile'
import { slugifyArtistName } from '@/lib/artist-profile/slug'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { MetalBadge } from '@/components/ui/MetalBadge'

interface ArtistProfileEditorProps {
  user: User
}

export function ArtistProfileEditor({ user }: ArtistProfileEditorProps) {
  const [profile, setProfile] = useState<ArtistProfile | null>(null)
  const [tracks, setTracks] = useState<ArtistTrack[]>([])
  const [albums, setAlbums] = useState<ArtistAlbum[]>([])
  const [videos, setVideos] = useState<ArtistVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [displayName, setDisplayName] = useState(user.name)
  const [slug, setSlug] = useState('')
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [genresText, setGenresText] = useState('')
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

  const [trackTitle, setTrackTitle] = useState('')
  const [trackUrl, setTrackUrl] = useState('')
  const [trackCover, setTrackCover] = useState('')
  const [albumTitle, setAlbumTitle] = useState('')
  const [albumYear, setAlbumYear] = useState('')
  const [albumCover, setAlbumCover] = useState('')
  const [albumType, setAlbumType] = useState<'album' | 'single' | 'ep'>('album')
  const [videoTitle, setVideoTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  const loadChildData = useCallback(async (profileId: string) => {
    if (isSupabaseConfigured()) {
      const [t, a, v] = await Promise.all([
        sb.supabaseGetTracks(profileId),
        sb.supabaseGetAlbums(profileId),
        sb.supabaseGetVideos(profileId),
      ])
      setTracks(t)
      setAlbums(a)
      setVideos(v)
    } else {
      setTracks(localGetTracks(profileId))
      setAlbums(localGetAlbums(profileId))
      setVideos(localGetVideos(profileId))
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

  const saveProfile = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const genres = genresText
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
      const updated = await upsertArtistProfile(user, {
        displayName,
        slug: slug || slugifyArtistName(displayName),
        tagline,
        bio,
        genres,
        country,
        avatarUrl,
        bannerUrl,
        logoUrl,
        monthlyListenersDisplay: monthlyListeners,
        artistPickTrackId: pickTrackId || null,
        published,
        social: { spotify, youtube, instagram, facebook, bandcamp, website },
      })
      setProfile(updated)
      setMessage(published ? 'Profile published!' : 'Profile saved as draft.')
      await loadChildData(updated.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
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

  if (loading) return <LoadingTransmission variant="compact" />

  const profileSlug = profile?.slug ?? slugifyArtistName(displayName)

  return (
    <div className="space-y-10 max-w-3xl">
      <p className="text-sm text-muted border-l-2 border-mh-red pl-4 leading-relaxed">
        Build your band page like a streaming profile — header, tags, socials, tracks, albums,
        singles, and videos. When published, fans see it at{' '}
        <Link to={`/artist/${profileSlug}`} className="ios-link">
          /artist/{profileSlug}
        </Link>
        . Super admin reviews appear in Editorial Featured.
      </p>

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
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="accent-mh-red"
          />
          Publish profile publicly
        </label>
      </section>

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
      </section>

      <section className="ios-panel space-y-4">
        <p className="ios-kicker">Tracks (Popular top 5)</p>
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
              await loadChildData(p.id)
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
        <ul className="space-y-2">
          {tracks.map((t) => (
            <li key={t.id} className="flex justify-between items-center text-sm border border-border px-3 py-2">
              <span>{t.title}</span>
              <button
                type="button"
                className="text-mh-red text-xs uppercase"
                onClick={async () => {
                  await deleteArtistTrack(t.id)
                  if (profile) await loadChildData(profile.id)
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
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
        <ul className="space-y-2 text-sm">
          {albums.map((a) => (
            <li key={a.id} className="flex justify-between border border-border px-3 py-2">
              <span>
                {a.title} · {a.releaseType} {a.releaseYear ? `(${a.releaseYear})` : ''}
              </span>
              <button
                type="button"
                className="text-mh-red text-xs"
                onClick={async () => {
                  await deleteArtistAlbum(a.id)
                  if (profile) await loadChildData(profile.id)
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="ios-panel space-y-4">
        <p className="ios-kicker">Videos</p>
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
              await loadChildData(p.id)
            }}
          >
            Add video
          </Button>
        </div>
        <ul className="space-y-2 text-sm">
          {videos.map((v) => (
            <li key={v.id} className="flex justify-between border border-border px-3 py-2">
              <span>{v.title}</span>
              <button
                type="button"
                className="text-mh-red text-xs"
                onClick={async () => {
                  await deleteArtistVideo(v.id)
                  if (profile) await loadChildData(profile.id)
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      {error && <p className="text-mh-red text-sm">{error}</p>}
      {message && <p className="text-emerald-400 text-sm">{message}</p>}

      <Button type="button" variant="primary" disabled={saving} onClick={saveProfile}>
        {saving ? 'Saving...' : 'Save profile'}
      </Button>
    </div>
  )
}
