import { AlertTriangle, Disc3, Lock, Music2, Rocket } from 'lucide-react'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getArtistProfile, listArtistTracks } from '@/modules/music/api/music.api'
import { formatArtistTrackTitle } from '@/modules/music/lib/track-title-format'
import { DuplicateTrackAlert } from '@/modules/music/components/duplicate-track-alert'
import type { QueuedUpload } from '@/modules/music/types/release-builder.types'
import { formatReleaseGoLivePreview } from '@/modules/music/lib/release-schedule'
import { formatDuration } from '@/modules/music/types/release-builder.types'

interface ReleaseReviewStepProps {
  queue: QueuedUpload[]
  releaseTitle: string
  genre: string
  secondaryGenre: string
  language: string
  coverImageSrc: string
  releaseType: 'single' | 'ep' | 'album'
  releaseDate: string
  releaseTimeEnabled: boolean
  releaseHour: string
  releaseMinute: string
  releasePeriod: 'AM' | 'PM'
  releaseTimezone: string
  validationErrors: string[]
  isPublishing: boolean
  onPublish: () => void
}

function formatReleaseDateTime(
  date: string,
  timeEnabled: boolean,
  hour: string,
  minute: string,
  period: 'AM' | 'PM',
  timeZone: string,
): string {
  if (!date) return 'Not set'
  return formatReleaseGoLivePreview(date, timeEnabled, hour, minute, period, timeZone)
}

export function ReleaseReviewStep({
  queue,
  releaseTitle,
  genre,
  secondaryGenre,
  language,
  coverImageSrc,
  releaseType,
  releaseDate,
  releaseTimeEnabled,
  releaseHour,
  releaseMinute,
  releasePeriod,
  releaseTimezone,
  validationErrors,
  isPublishing,
  onPublish,
}: ReleaseReviewStepProps) {
  const { data: profile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: getArtistProfile,
  })

  const { data: artistTracks } = useQuery({
    queryKey: ['artist-tracks'],
    queryFn: listArtistTracks,
  })

  const readyTracks = queue.filter((item) => item.status === 'ready')
  const rejectedDuplicates = queue.filter(
    (item) => item.status === 'failed' && item.duplicateCheck?.status === 'flagged',
  )
  const canPublish = validationErrors.length === 0 && readyTracks.length > 0
  const combinedGenre = [genre.trim(), secondaryGenre.trim()].filter(Boolean).join(' / ')
  const artistName = profile?.displayName ?? 'Artist'

  const trackDurations = useMemo(() => {
    const map: Record<string, number | undefined> = {}
    for (const item of readyTracks) {
      if (!item.trackId) continue
      const track = artistTracks?.find((entry) => entry.id === item.trackId)
      if (track?.durationSec) map[item.id] = track.durationSec
    }
    return map
  }, [artistTracks, readyTracks])

  const rows: { label: string; value: string; error?: boolean }[] = [
    { label: 'Release Type', value: releaseType, error: !releaseType },
    { label: 'Genre', value: combinedGenre || '—', error: !genre.trim() },
    { label: 'Language', value: language || '—' },
    {
      label: 'Release Date',
      value: formatReleaseDateTime(releaseDate, releaseTimeEnabled, releaseHour, releaseMinute, releasePeriod, releaseTimezone),
      error: !releaseDate,
    },
    { label: 'Artist', value: profile?.displayName ?? '—' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <header className="rbl-section-head">
          <p className="rbl-section-head__kicker ios-mh-kicker">Review</p>
          <h2 className="rbl-section-head__title">Review your release</h2>
          <p className="rbl-section-head__desc">
            Check everything looks right before you publish or schedule.
          </p>
        </header>
        <button
          type="button"
          className="rbl-btn rbl-btn--primary rbl-btn--launch"
          disabled={!canPublish || isPublishing}
          onClick={onPublish}
        >
          {!canPublish ? <Lock className="size-4" /> : <Rocket className="size-4" />}
          {isPublishing ? 'Creating…' : 'Create release'}
        </button>
      </div>

      {validationErrors.length > 0 ? (
        <div className="rbl-alert">
          <AlertTriangle className="rbl-text-warn mt-0.5 size-5 shrink-0" />
          <div>
            <p className="rbl-alert__title">Fix these items before creating your release</p>
            <ul className="rbl-alert__list">
              {validationErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {rejectedDuplicates.length > 0 ? (
        <div className="space-y-3">
          <div className="rbl-alert">
            <AlertTriangle className="rbl-text-warn mt-0.5 size-5 shrink-0" />
            <div>
              <p className="rbl-alert__title">
                {rejectedDuplicates.length} duplicate upload{rejectedDuplicates.length > 1 ? 's' : ''}{' '}
                blocked
              </p>
              <p className="text-sm text-muted-foreground">
                These files were not saved to the platform. Remove them or upload different audio to
                continue.
              </p>
            </div>
          </div>
          {rejectedDuplicates.map((track) => (
            <DuplicateTrackAlert key={track.id} duplicateCheck={track.duplicateCheck} variant="banner" />
          ))}
        </div>
      ) : null}

      <div className="rbl-review-card">
        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
          <div className="rbl-holo__frame">
            {coverImageSrc ? (
              <img src={coverImageSrc} alt="" className="size-full object-cover" />
            ) : (
              <div className="rbl-holo__placeholder">
                <Disc3 className="size-16" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold uppercase tracking-wide">
              {releaseTitle || 'Untitled Transmission'}
            </h3>
            <p className="rbl-text-muted">{profile?.displayName ?? 'Artist'}</p>
            <dl className="rbl-meta-grid mt-6">
              {rows.map((row) => (
                <div key={row.label} className="flex items-start gap-2">
                  {row.error ? <AlertTriangle className="rbl-text-warn mt-0.5 size-4 shrink-0" /> : null}
                  <div>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <section className="rbl-panel">
        <div className="rbl-panel__header">
          <h3 className="rbl-panel__title">Track manifest</h3>
          <p className="rbl-panel__meta">{readyTracks.length} synced</p>
        </div>
        <div className="rbl-panel__body">
          {readyTracks.length === 0 ? (
            <div className="rbl-alert">
              <AlertTriangle className="rbl-text-warn size-5" />
              <p className="rbl-alert__title">No uploaded tracks yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {readyTracks.map((track, index) => (
                <div key={track.id} className="rbl-track-row rbl-track-row--review">
                  <span className="rbl-track-row__num">{String(index + 1).padStart(2, '0')}</span>
                  <Music2 className="rbl-text-accent size-4" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {track.title.trim()
                        ? formatArtistTrackTitle(artistName, track.title)
                        : 'Untitled track'}
                    </p>
                    <p className="rbl-track-card__meta">
                      Song: {track.title.trim() || '—'} · {track.file.name}
                    </p>
                  </div>
                  {trackDurations[track.id] ? (
                    <span className="rbl-track-card__duration">{formatDuration(trackDurations[track.id]!)}</span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          className="rbl-btn rbl-btn--primary rbl-btn--launch"
          disabled={!canPublish || isPublishing}
          onClick={onPublish}
        >
          {!canPublish ? <Lock className="size-4" /> : <Rocket className="size-4" />}
          {isPublishing ? 'Creating…' : 'Create release'}
        </button>
      </div>
    </div>
  )
}
