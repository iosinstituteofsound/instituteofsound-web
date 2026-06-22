import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Disc3 } from 'lucide-react'
import { toast } from 'sonner'
import { invalidateArtistSurfaceQueries } from '@/modules/explore/lib/invalidate-artist-surface'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { normalizeMediaUrl } from '@/modules/editor/lib/normalize-media-url'
import { listArtistReleases, listArtistTracks, updateRelease } from '@/modules/music/api/music.api'
import { ReleaseScheduleStep } from '@/modules/music/components/release-schedule-step'
import { artistReleaseBreadcrumbs } from '@/modules/music/lib/artist-breadcrumb'
import { buildReleaseDateIso, getDefaultReleaseTimezone } from '@/modules/music/lib/release-schedule'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Loader } from '@/shared/components/feedback/loader'
import { Page, PageSection } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import '@/modules/music/styles/release-builder.css'
import '@/modules/music/styles/artist-dashboard-home.css'

async function resolveCoverUrl(coverUrl: string, coverPreviewUrl: string): Promise<string | undefined> {
  const normalizedExisting = normalizeMediaUrl(coverUrl)
  if (normalizedExisting) return normalizedExisting

  if (!coverPreviewUrl.startsWith('blob:')) {
    return normalizeMediaUrl(coverPreviewUrl)
  }

  const response = await fetch(coverPreviewUrl)
  const blob = await response.blob()
  const extension = blob.type.split('/')[1] || 'jpg'
  const result = await uploadMediaFile(blob, `cover-${Date.now()}.${extension}`)
  return normalizeMediaUrl(result.absoluteUrl ?? result.url)
}

function parseReleaseTime(releaseDate?: string) {
  if (!releaseDate) {
    return {
      date: new Date().toISOString().slice(0, 10),
      timeEnabled: false,
      hour: '12',
      minute: '00',
      period: 'AM' as const,
    }
  }

  const parsed = new Date(releaseDate)
  if (Number.isNaN(parsed.getTime())) {
    return {
      date: new Date().toISOString().slice(0, 10),
      timeEnabled: false,
      hour: '12',
      minute: '00',
      period: 'AM' as const,
    }
  }

  const hours = parsed.getHours()
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  const minute = String(parsed.getMinutes()).padStart(2, '0')

  return {
    date: parsed.toISOString().slice(0, 10),
    timeEnabled: parsed.getMinutes() !== 0 || hours !== 12,
    hour: String(hour12),
    minute,
    period: period as 'AM' | 'PM',
  }
}

export function MusicReleaseEditPage() {
  const { releaseId } = useParams<{ releaseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: releases, isLoading: releasesLoading } = useQuery({
    queryKey: ['artist-releases'],
    queryFn: listArtistReleases,
  })
  const { data: tracks } = useQuery({
    queryKey: ['artist-tracks'],
    queryFn: listArtistTracks,
  })

  const release = useMemo(
    () => (releases ?? []).find((item) => item.id === releaseId),
    [releases, releaseId],
  )

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'single' | 'ep' | 'album'>('single')
  const [genre, setGenre] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [releaseTimeEnabled, setReleaseTimeEnabled] = useState(false)
  const [releaseHour, setReleaseHour] = useState('12')
  const [releaseMinute, setReleaseMinute] = useState('00')
  const [releasePeriod, setReleasePeriod] = useState<'AM' | 'PM'>('AM')
  const [releaseTimezone, setReleaseTimezone] = useState(getDefaultReleaseTimezone)
  const [coverUrl, setCoverUrl] = useState('')
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')
  const [coverFileName, setCoverFileName] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!release || initialized) return
    const parsedTime = parseReleaseTime(release.releaseDate)
    setTitle(release.title)
    setType(release.type)
    setGenre(release.genre ?? '')
    setReleaseDate(parsedTime.date)
    setReleaseTimeEnabled(parsedTime.timeEnabled)
    setReleaseHour(parsedTime.hour)
    setReleaseMinute(parsedTime.minute)
    setReleasePeriod(parsedTime.period)
    setReleaseTimezone(release.releaseTimezone ?? getDefaultReleaseTimezone())
    setCoverUrl(release.coverUrl ?? '')
    setSelectedTrackIds(release.tracks.map((track) => track.id))
    setInitialized(true)
  }, [release, initialized])

  useEffect(
    () => () => {
      if (coverPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(coverPreviewUrl)
    },
    [coverPreviewUrl],
  )

  const coverImageSrc = coverUrl || coverPreviewUrl

  const availableTracks = useMemo(() => {
    return (tracks ?? []).filter(
      (track) => track.status === 'ready' && (!track.releaseId || track.releaseId === releaseId),
    )
  }, [tracks, releaseId])

  const handleCoverUpload = async (file: File) => {
    setCoverFileName(file.name)
    if (coverPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(coverPreviewUrl)
    setCoverPreviewUrl(URL.createObjectURL(file))
    setCoverUploading(true)
    try {
      const result = await uploadMediaFile(file, file.name)
      const uploadedUrl = normalizeMediaUrl(result.absoluteUrl ?? result.url)
      if (!uploadedUrl) throw new Error('Upload returned no URL')
      setCoverUrl(uploadedUrl)
    } catch {
      toast.error('Cover upload failed — try again before saving')
      setCoverUrl('')
    } finally {
      setCoverUploading(false)
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!releaseId) throw new Error('Missing release id')
      const resolvedCoverUrl = await resolveCoverUrl(coverUrl, coverPreviewUrl)
      return updateRelease(releaseId, {
        title: title.trim(),
        type,
        genre: genre.trim() || undefined,
        coverUrl: resolvedCoverUrl,
        releaseDate: buildReleaseDateIso(
          releaseDate,
          releaseTimeEnabled,
          releaseHour,
          releaseMinute,
          releasePeriod,
          releaseTimezone,
        ),
        releaseTimezone,
        trackIds: selectedTrackIds,
      })
    },
    onSuccess: () => {
      toast.success('Release updated')
      void queryClient.invalidateQueries({ queryKey: ['artist-releases'] })
      invalidateArtistSurfaceQueries(queryClient)
      navigate('/artist/releases')
    },
    onError: () => toast.error('Could not update release'),
  })

  const toggleTrack = (id: string) => {
    setSelectedTrackIds((prev) => (prev.includes(id) ? prev.filter((trackId) => trackId !== id) : [...prev, id]))
  }

  if (releasesLoading) {
    return (
      <Page>
        <Loader />
      </Page>
    )
  }

  if (!release) {
    return (
      <Page>
        <PageSection className="space-y-4">
          <p className="text-muted-foreground">Release not found.</p>
          <Button variant="outline" asChild>
            <Link to="/artist/releases">Back to releases</Link>
          </Button>
        </PageSection>
      </Page>
    )
  }

  return (
    <Page>
      <PageSection className="rbl-scene mx-0 max-w-3xl space-y-6 border-0 bg-transparent p-0">
        <AppBreadcrumb
          surface
          className="app-breadcrumb--dashboard"
          items={artistReleaseBreadcrumbs.editRelease(release.title)}
          description="Update release details, schedule, and track list."
        />

        <div className="rbl-panel">
          <div className="rbl-panel__header">
            <h3 className="rbl-panel__title">Release details</h3>
          </div>
          <div className="rbl-panel__body space-y-5">
            <div className="rbl-field">
              <label htmlFor="edit-release-title">Release title</label>
              <Input
                id="edit-release-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rbl-field">
                <label htmlFor="edit-release-genre">Primary genre</label>
                <Input
                  id="edit-release-genre"
                  placeholder="e.g. Rock"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
              </div>
              <div className="rbl-field">
                <span className="rbl-field__label">Release type</span>
                <select
                  className="rbl-readout w-full capitalize"
                  value={type}
                  aria-label="Release type"
                  onChange={(e) => setType(e.target.value as 'single' | 'ep' | 'album')}
                >
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                  <option value="album">Album</option>
                </select>
              </div>
            </div>

            <div className="rbl-field">
              <span className="rbl-field__label">Cover artwork</span>
              <label
                htmlFor="edit-cover-art"
                className={`rbl-cover-drop${coverImageSrc ? ' rbl-cover-drop--filled' : ''}${coverUploading ? ' rbl-cover-drop--busy' : ''}`}
              >
                {coverImageSrc ? (
                  <img src={coverImageSrc} alt={title || 'Cover preview'} className="rbl-cover-drop__preview" />
                ) : (
                  <div className="rbl-cover-drop__empty">
                    <Disc3 className="size-8" />
                    <p className="rbl-cover-drop__title">Add cover art</p>
                    <p className="rbl-cover-drop__hint">PNG or JPG · square recommended</p>
                  </div>
                )}
                <span className="rbl-cover-drop__action">
                  {coverUploading ? 'Uploading…' : coverImageSrc ? 'Replace artwork' : 'Choose file'}
                </span>
              </label>
              <Input
                id="edit-cover-art"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleCoverUpload(file)
                  e.target.value = ''
                }}
              />
              {coverFileName ? <p className="rbl-field__hint">{coverFileName}</p> : null}
            </div>
          </div>
        </div>

        <ReleaseScheduleStep
          releaseDate={releaseDate}
          onReleaseDateChange={setReleaseDate}
          releaseTimeEnabled={releaseTimeEnabled}
          onReleaseTimeEnabledChange={setReleaseTimeEnabled}
          releaseHour={releaseHour}
          onReleaseHourChange={setReleaseHour}
          releaseMinute={releaseMinute}
          onReleaseMinuteChange={setReleaseMinute}
          releasePeriod={releasePeriod}
          onReleasePeriodChange={setReleasePeriod}
          releaseTimezone={releaseTimezone}
          onReleaseTimezoneChange={setReleaseTimezone}
        />

        <div className="rbl-panel">
          <div className="rbl-panel__header">
            <h3 className="rbl-panel__title">Tracks</h3>
            <p className="rbl-panel__meta">{selectedTrackIds.length} selected</p>
          </div>
          <div className="rbl-panel__body space-y-2">
            {availableTracks.length === 0 ? (
              <p className="rbl-text-muted text-sm">No ready tracks available.</p>
            ) : (
              availableTracks.map((track) => (
                <label key={track.id} className="rbl-track-row cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTrackIds.includes(track.id)}
                    onChange={() => toggleTrack(track.id)}
                    className="size-4 accent-[var(--primary)]"
                  />
                  <span className="font-medium">{track.title}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pb-8">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!title.trim() || !selectedTrackIds.length || saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/artist/releases">Cancel</Link>
          </Button>
        </div>
      </PageSection>
    </Page>
  )
}
