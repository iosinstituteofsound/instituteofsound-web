import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import type { User } from '@/lib/auth/types'
import { getProfileForUser } from '@/lib/artist-profile/service'
import {
  INDIA_SCENE_CITIES,
  RELEASE_TYPES,
  SCENE_GENRE_SLUGS,
  MILESTONE_KINDS,
} from '@/lib/releases/constants'
import {
  addReleaseMilestone,
  listReleasesForProfile,
  upsertRelease,
} from '@/lib/releases/service'
import type { ArtistRelease } from '@/lib/releases/types'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { FieldLabel, Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { slugifyArtistName } from '@/lib/artist-profile/slug'

function defaultLiveAtLocal(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setMinutes(0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`
}

interface ReleaseEditorProps {
  user: User
}

export function ReleaseEditor({ user }: ReleaseEditorProps) {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [profileSlug, setProfileSlug] = useState<string | null>(null)
  const [releases, setReleases] = useState<ArtistRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [story, setStory] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [releaseType, setReleaseType] = useState<'single' | 'ep' | 'album'>('single')
  const [liveAt, setLiveAt] = useState(defaultLiveAtLocal)
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [soundcloudUrl, setSoundcloudUrl] = useState('')
  const [sceneCity, setSceneCity] = useState('')
  const [sceneGenreSlug, setSceneGenreSlug] = useState('')

  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [milestoneBody, setMilestoneBody] = useState('')
  const [milestoneKind, setMilestoneKind] = useState<'teaser' | 'bts' | 'preview' | 'note'>('teaser')
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const profile = await getProfileForUser(user.id)
      if (!profile) {
        setProfileId(null)
        setReleases([])
        return
      }
      setProfileId(profile.id)
      setProfileSlug(profile.slug)
      setReleases(await listReleasesForProfile(profile.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load releases')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setSubtitle('')
    setStory('')
    setCoverUrl('')
    setReleaseType('single')
    setLiveAt(defaultLiveAtLocal())
    setSpotifyUrl('')
    setYoutubeUrl('')
    setSoundcloudUrl('')
    setSceneCity('')
    setSceneGenreSlug('')
    setSelectedReleaseId(null)
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileId) return
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      const release = await upsertRelease(profileId, {
        title,
        slug: slug.trim() || undefined,
        subtitle,
        story,
        coverUrl: coverUrl || undefined,
        releaseType,
        liveAt: new Date(liveAt).toISOString(),
        spotifyUrl,
        youtubeUrl,
        soundcloudUrl,
        sceneCity: sceneCity || undefined,
        sceneGenreSlug: sceneGenreSlug || undefined,
        status: 'scheduled',
      })
      setSuccess(`Premiere scheduled — /release/${release.slug}`)
      resetForm()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not schedule release')
    } finally {
      setBusy(false)
    }
  }

  const handleMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReleaseId) return
    setBusy(true)
    setError('')
    try {
      await addReleaseMilestone(selectedReleaseId, {
        kind: milestoneKind,
        title: milestoneTitle,
        body: milestoneBody,
      })
      setMilestoneTitle('')
      setMilestoneBody('')
      setSuccess('Timeline update added.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add milestone')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted py-8">Loading releases…</p>
  }

  if (!profileId) {
    return (
      <DashboardSection
        id="releases"
        step="Premiere"
        title="Schedule a release"
        hint="Publish your artist page first — then drops get their own premiere URL."
      >
        <p className="text-sm text-muted">
          Complete your public page in the <strong>Your page</strong> tab, then return here.
        </p>
      </DashboardSection>
    )
  }

  return (
    <div className="space-y-10">
      <DashboardSection
        id="releases-schedule"
        step="Premiere"
        title="Schedule a release"
        hint="Strict live_at — embeds unlock automatically at premiere time. Share /release/your-slug"
      >
        <form onSubmit={handleSchedule} className="artist-dash-submit-card space-y-5">
          <div className="artist-dash-grid-2">
            <div>
              <FieldLabel>Release title</FieldLabel>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <FieldLabel>URL slug (optional)</FieldLabel>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={title ? slugifyArtistName(title) : 'nightfall-ep'}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Subtitle / dek</FieldLabel>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>

          <div className="artist-dash-grid-2">
            <div>
              <FieldLabel>Type</FieldLabel>
              <select
                className="ios-input w-full"
                value={releaseType}
                onChange={(e) => setReleaseType(e.target.value as typeof releaseType)}
              >
                {RELEASE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Premiere time (UTC)</FieldLabel>
              <Input
                required
                type="datetime-local"
                value={liveAt}
                onChange={(e) => setLiveAt(e.target.value)}
              />
            </div>
          </div>

          <div className="artist-dash-grid-2">
            <div>
              <FieldLabel>Scene city (India)</FieldLabel>
              <select
                className="ios-input w-full"
                value={sceneCity}
                onChange={(e) => setSceneCity(e.target.value)}
              >
                <option value="">Select city</option>
                {INDIA_SCENE_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Scene genre</FieldLabel>
              <select
                className="ios-input w-full"
                value={sceneGenreSlug}
                onChange={(e) => setSceneGenreSlug(e.target.value)}
              >
                <option value="">Select genre</option>
                {SCENE_GENRE_SLUGS.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ImageUpload
            label="Cover art"
            folder="ios/artists"
            value={coverUrl}
            onChange={setCoverUrl}
          />

          <div>
            <FieldLabel>Story / lore</FieldLabel>
            <textarea
              className="ios-input min-h-[100px]"
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
          </div>

          <div className="artist-dash-grid-2">
            <div>
              <FieldLabel>Spotify embed</FieldLabel>
              <Input
                type="url"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/album/…"
              />
            </div>
            <div>
              <FieldLabel>YouTube embed</FieldLabel>
              <Input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
          </div>
          <div>
            <FieldLabel>SoundCloud embed</FieldLabel>
            <Input
              type="url"
              value={soundcloudUrl}
              onChange={(e) => setSoundcloudUrl(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-crimson">{error}</p>}
          {success && <p className="text-sm text-mh-red">{success}</p>}

          <button type="submit" className="ios-btn ios-btn-primary" disabled={busy}>
            {busy ? 'Scheduling…' : 'Schedule premiere →'}
          </button>
        </form>
      </DashboardSection>

      {releases.length > 0 && (
        <DashboardSection
          id="releases-list"
          step="Your drops"
          title="Scheduled & live releases"
          hint="Premiere pages are shareable before go-live."
        >
          <ul className="space-y-3">
            {releases.map((r) => (
              <li
                key={r.id}
                className={clsx(
                  'border border-border p-4 flex flex-wrap justify-between gap-3',
                  selectedReleaseId === r.id && 'border-mh-red/50'
                )}
              >
                <div>
                  <p className="font-display font-bold">{r.title}</p>
                  <p className="text-xs text-muted mt-1">
                    /release/{r.slug} · {r.status} ·{' '}
                    {new Date(r.liveAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/release/${r.slug}`} className="ios-btn ios-btn-ghost !text-xs">
                    View premiere
                  </Link>
                  <button
                    type="button"
                    className="ios-btn ios-btn-secondary !text-xs"
                    onClick={() => setSelectedReleaseId(r.id)}
                  >
                    Add timeline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </DashboardSection>
      )}

      {selectedReleaseId && (
        <DashboardSection
          id="release-milestone"
          step="Timeline"
          title="Add release timeline post"
          hint="Teasers, BTS, previews — builds hype before live_at"
        >
          <form onSubmit={handleMilestone} className="space-y-4">
            <div className="artist-dash-grid-2">
              <div>
                <FieldLabel>Kind</FieldLabel>
                <select
                  className="ios-input w-full"
                  value={milestoneKind}
                  onChange={(e) =>
                    setMilestoneKind(e.target.value as typeof milestoneKind)
                  }
                >
                  {MILESTONE_KINDS.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Title</FieldLabel>
                <Input required value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} />
              </div>
            </div>
            <div>
              <FieldLabel>Detail</FieldLabel>
              <textarea
                className="ios-input min-h-[80px]"
                value={milestoneBody}
                onChange={(e) => setMilestoneBody(e.target.value)}
              />
            </div>
            <button type="submit" className="ios-btn ios-btn-primary" disabled={busy}>
              Add to timeline
            </button>
          </form>
        </DashboardSection>
      )}

      {profileSlug && (
        <p className="text-xs text-muted">
          Artist page:{' '}
          <Link to={`/artist/${profileSlug}`} className="text-mh-red">
            /artist/{profileSlug}
          </Link>
        </p>
      )}
    </div>
  )
}
