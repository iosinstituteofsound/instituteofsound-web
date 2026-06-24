import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Disc3 } from 'lucide-react'
import { toast } from 'sonner'
import { invalidateArtistSurfaceQueries } from '@/modules/explore/lib/invalidate-artist-surface'
import { invalidateTrackLyricsQueries } from '@/modules/music/lib/invalidate-track-lyrics'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { normalizeMediaUrl } from '@/modules/editor/lib/normalize-media-url'
import { getArtistProfile, listArtistReleases, listArtistTracks, updateArtistTrack, updateRelease } from '@/modules/music/api/music.api'
import { ReleaseScheduleStep } from '@/modules/music/components/release-schedule-step'
import { TrackLyricsPanel } from '@/modules/music/components/track-lyrics-panel'
import { artistReleaseBreadcrumbs } from '@/modules/music/lib/artist-breadcrumb'
import { stripArtistTrackPrefix } from '@/modules/music/lib/track-title-format'
import { buildReleaseDateIso, getDefaultReleaseTimezone } from '@/modules/music/lib/release-schedule'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Loader } from '@/shared/components/feedback/loader'
import { Page, PageSection } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import '@/modules/music/styles/release-builder.css'
import '@/modules/music/styles/artist-dashboard-home.css'
import '@/modules/music/styles/lyrics-sync-modal.css'
import type { SyncedLyricLineDto, SyncedLyricsStatus } from '@/modules/music/types/lyrics-sync.types'

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
  const { data: profile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: getArtistProfile,
  })

  const release = useMemo(
    () => (releases ?? []).find((item) => item.id === releaseId),
    [releases, releaseId],
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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
  const [trackLyrics, setTrackLyrics] = useState<Record<string, string>>({})
  const [trackSyncedLyrics, setTrackSyncedLyrics] = useState<Record<string, SyncedLyricLineDto[]>>({})
  const [trackSyncedLyricsStatus, setTrackSyncedLyricsStatus] = useState<Record<string, SyncedLyricsStatus>>({})
  const [activeLyricsTrackId, setActiveLyricsTrackId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const lyricsHydratedRef = useRef(false)

  useEffect(() => {
    if (!release || initialized) return
    const parsedTime = parseReleaseTime(release.releaseDate)
    setTitle(release.title)
    setDescription(release.description ?? '')
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
    setActiveLyricsTrackId(release.tracks[0]?.id ?? null)
    setInitialized(true)
  }, [release, initialized])

  useEffect(() => {
    if (!release?.tracks.length || !tracks || lyricsHydratedRef.current) return
    lyricsHydratedRef.current = true
    const lyricsMap: Record<string, string> = {}
    const syncedMap: Record<string, SyncedLyricLineDto[]> = {}
    const syncedStatusMap: Record<string, SyncedLyricsStatus> = {}
    for (const track of release.tracks) {
      const full = tracks.find((entry) => entry.id === track.id)
      lyricsMap[track.id] = full?.lyrics ?? track.lyrics ?? ''
      if (full?.syncedLyrics?.length) syncedMap[track.id] = full.syncedLyrics
      if (full?.syncedLyricsStatus) syncedStatusMap[track.id] = full.syncedLyricsStatus
    }
    setTrackLyrics(lyricsMap)
    setTrackSyncedLyrics(syncedMap)
    setTrackSyncedLyricsStatus(syncedStatusMap)
  }, [release, tracks])

  useEffect(
    () => () => {
      if (coverPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(coverPreviewUrl)
    },
    [coverPreviewUrl],
  )

  const lyricsTracks = useMemo(() => {
    const artistName = profile?.displayName ?? 'Artist'
    return selectedTrackIds
      .map((id) => {
        const track = tracks?.find((entry) => entry.id === id) ?? release?.tracks.find((entry) => entry.id === id)
        const fullTrack = tracks?.find((entry) => entry.id === id)
        if (!track) return null
        return {
          id: track.id,
          title: stripArtistTrackPrefix(artistName, track.title),
          lyrics: trackLyrics[track.id] ?? '',
          syncedLyrics: trackSyncedLyrics[track.id],
          syncedLyricsStatus: trackSyncedLyricsStatus[track.id],
          audioUrl: fullTrack?.audioUrl,
          durationSec: fullTrack?.durationSec,
          apiTrackId: track.id,
        }
      })
      .filter((track): track is NonNullable<typeof track> => Boolean(track))
  }, [selectedTrackIds, tracks, release?.tracks, profile?.displayName, trackLyrics, trackSyncedLyrics, trackSyncedLyricsStatus])

  const activeLyricsTrackIdResolved = activeLyricsTrackId ?? lyricsTracks[0]?.id ?? null

  const coverImageSrc = coverUrl || coverPreviewUrl

  useEffect(() => {
    if (!activeLyricsTrackIdResolved) return
    if (lyricsTracks.some((track) => track.id === activeLyricsTrackIdResolved)) return
    setActiveLyricsTrackId(lyricsTracks[0]?.id ?? null)
  }, [activeLyricsTrackIdResolved, lyricsTracks])

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
      const artistName = profile?.displayName ?? 'Artist'

      for (const trackId of selectedTrackIds) {
        const track = tracks?.find((entry) => entry.id === trackId)
        if (!track) continue
        const songName = stripArtistTrackPrefix(artistName, track.title)
        await updateArtistTrack(trackId, {
          title: songName,
          lyrics: trackLyrics[trackId]?.trim() || undefined,
          syncedLyrics: trackSyncedLyrics[trackId]?.length ? trackSyncedLyrics[trackId] : undefined,
          syncedLyricsStatus: trackSyncedLyrics[trackId]?.length ? 'pending_review' : undefined,
        })
      }

      return updateRelease(releaseId, {
        title: title.trim(),
        type,
        genre: genre.trim() || undefined,
        description: description.trim() || undefined,
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
      void queryClient.invalidateQueries({ queryKey: ['artist-tracks'] })
      invalidateArtistSurfaceQueries(queryClient)
      navigate('/artist/releases')
    },
    onError: () => toast.error('Could not update release'),
  })

  const toggleTrack = (id: string) => {
    setSelectedTrackIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((trackId) => trackId !== id)
      }
      const track = tracks?.find((entry) => entry.id === id)
      if (track && trackLyrics[id] === undefined) {
        setTrackLyrics((current) => ({
          ...current,
          [id]: track.lyrics ?? '',
        }))
        if (track.syncedLyrics?.length) {
          setTrackSyncedLyrics((current) => ({ ...current, [id]: track.syncedLyrics! }))
        }
        if (track.syncedLyricsStatus) {
          setTrackSyncedLyricsStatus((current) => ({ ...current, [id]: track.syncedLyricsStatus! }))
        }
      }
      return [...prev, id]
    })
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
      <PageSection className="rbl-scene mx-0 max-w-none space-y-6 border-0 bg-transparent p-0">
        <AppBreadcrumb
          surface
          className="app-breadcrumb--dashboard"
          items={artistReleaseBreadcrumbs.editRelease(release.title)}
          description="Update release details, schedule, and track list."
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
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

            <div className="rbl-field">
              <label htmlFor="edit-release-description">Description</label>
              <Textarea
                id="edit-release-description"
                placeholder="Tell listeners about this release — credits, story, or context."
                value={description}
                maxLength={1000}
                rows={4}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="rbl-field__hint">Optional · shown on your release page below Like, Comment, and Share.</p>
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
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <TrackLyricsPanel
              tracks={lyricsTracks}
              activeTrackId={activeLyricsTrackIdResolved}
              onActiveTrackChange={setActiveLyricsTrackId}
              lyrics={activeLyricsTrackIdResolved ? trackLyrics[activeLyricsTrackIdResolved] ?? '' : ''}
              onLyricsChange={(value) => {
                if (!activeLyricsTrackIdResolved) return
                setTrackLyrics((current) => ({ ...current, [activeLyricsTrackIdResolved]: value }))
              }}
              artistName={profile?.displayName ?? 'Artist'}
              genre={genre.trim() || undefined}
              coverUrl={coverImageSrc || undefined}
              onSyncedLyricsSave={async (trackId, payload) => {
                setTrackLyrics((current) => ({ ...current, [trackId]: payload.lyrics }))
                setTrackSyncedLyrics((current) => ({ ...current, [trackId]: payload.syncedLyrics }))
                setTrackSyncedLyricsStatus((current) => ({ ...current, [trackId]: 'pending_review' }))
                const apiTrackId = lyricsTracks.find((track) => track.id === trackId)?.apiTrackId
                if (!apiTrackId) return
                const songName = stripArtistTrackPrefix(profile?.displayName ?? 'Artist', tracks?.find((t) => t.id === apiTrackId)?.title ?? '')
                await updateArtistTrack(apiTrackId, {
                  title: songName,
                  lyrics: payload.lyrics,
                  syncedLyrics: payload.syncedLyrics,
                  syncedLyricsStatus: 'pending_review',
                })
                invalidateTrackLyricsQueries(queryClient, {
                  trackId: apiTrackId,
                  releaseId: releaseId ?? undefined,
                })
              }}
            />
          </aside>
        </div>
      </PageSection>
    </Page>
  )
}
