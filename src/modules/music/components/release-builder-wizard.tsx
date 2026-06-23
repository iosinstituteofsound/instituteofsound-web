import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { invalidateArtistSurfaceQueries } from '@/modules/explore/lib/invalidate-artist-surface'
import { createRelease, updateArtistTrack } from '@/modules/music/api/music.api'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { normalizeMediaUrl } from '@/modules/editor/lib/normalize-media-url'
import { ReleaseBuilderScene } from '@/modules/music/components/release-builder-scene'
import { ReleaseBuilderStepper } from '@/modules/music/components/release-builder-stepper'
import { ReleaseDetailsStep } from '@/modules/music/components/release-details-step'
import { ReleaseReviewStep } from '@/modules/music/components/release-review-step'
import { ReleaseScheduleStep } from '@/modules/music/components/release-schedule-step'
import { ReleaseUploadStep } from '@/modules/music/components/release-upload-step'
import { useAudioUploadQueue } from '@/modules/music/hooks/use-audio-upload-queue'
import { artistReleaseBreadcrumbs } from '@/modules/music/lib/artist-breadcrumb'
import { buildReleaseDateIso, getDefaultReleaseTimezone } from '@/modules/music/lib/release-schedule'
import type { ReleaseBuilderStep } from '@/modules/music/types/release-builder.types'
import {
  RELEASE_BUILDER_STEPS,
  inferReleaseType,
  titleFromFilename,
} from '@/modules/music/types/release-builder.types'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'

async function resolveCoverUrlForPublish(coverUrl: string, coverPreviewUrl: string): Promise<string | undefined> {
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

export function ReleaseBuilderWizard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const uploadQueue = useAudioUploadQueue()

  const [step, setStep] = useState<ReleaseBuilderStep>('upload')
  const [releaseTitle, setReleaseTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [secondaryGenre, setSecondaryGenre] = useState('')
  const [language, setLanguage] = useState('English')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')
  const [releaseType, setReleaseType] = useState<'single' | 'ep' | 'album'>('single')
  const [releaseDate, setReleaseDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [releaseTimeEnabled, setReleaseTimeEnabled] = useState(false)
  const [releaseHour, setReleaseHour] = useState('12')
  const [releaseMinute, setReleaseMinute] = useState('00')
  const [releasePeriod, setReleasePeriod] = useState<'AM' | 'PM'>('AM')
  const [releaseTimezone, setReleaseTimezone] = useState(getDefaultReleaseTimezone)

  const readyCount = uploadQueue.queue.filter((item) => item.status === 'ready').length

  useEffect(() => {
    setReleaseType(inferReleaseType(readyCount))
  }, [readyCount])

  useEffect(() => {
    if (releaseTitle.trim()) return
    const ready = uploadQueue.queue.filter((item) => item.status === 'ready')
    if (ready.length === 1) {
      setReleaseTitle(ready[0]!.title)
      return
    }
    const firstPending = uploadQueue.queue[0]
    if (firstPending && uploadQueue.queue.length === 1) {
      setReleaseTitle(firstPending.title || titleFromFilename(firstPending.file.name))
    }
  }, [uploadQueue.queue, releaseTitle])

  const handleCoverPreviewChange = useCallback((url: string) => {
    setCoverPreviewUrl((prev) => {
      if (prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return url
    })
  }, [])

  useEffect(
    () => () => {
      if (coverPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(coverPreviewUrl)
    },
    [coverPreviewUrl],
  )

  const coverImageSrc = coverUrl || coverPreviewUrl

  const readyTracks = useMemo(
    () => uploadQueue.queue.filter((item) => item.status === 'ready'),
    [uploadQueue.queue],
  )

  const validationErrors = useMemo(() => {
    const errors: string[] = []
    if (!uploadQueue.hasReadyTracks) errors.push('Upload at least one track')
    if (!releaseTitle.trim()) errors.push('Release title is required')
    if (!genre.trim()) errors.push('Primary genre is required')
    if (readyTracks.some((track) => !track.title.trim())) errors.push('Each track needs a song name')
    if (!releaseDate) errors.push('Release date is required')
    return errors
  }, [uploadQueue.hasReadyTracks, releaseTitle, genre, releaseDate, readyTracks])

  const errorSteps = useMemo(() => {
    const steps: ReleaseBuilderStep[] = []
    if (!uploadQueue.hasReadyTracks) steps.push('upload')
    if (!releaseTitle.trim() || !genre.trim() || readyTracks.some((track) => !track.title.trim())) {
      steps.push('details')
    }
    if (!releaseDate) steps.push('schedule')
    return steps
  }, [uploadQueue.hasReadyTracks, releaseTitle, genre, releaseDate, readyTracks])

  const completedSteps = useMemo(() => {
    const completed: ReleaseBuilderStep[] = []
    const stepIndex = RELEASE_BUILDER_STEPS.findIndex((s) => s.id === step)
    for (let i = 0; i < stepIndex; i++) {
      completed.push(RELEASE_BUILDER_STEPS[i].id)
    }
    return completed
  }, [step])

  const publishMutation = useMutation({
    mutationFn: async () => {
      const resolvedCoverUrl = await resolveCoverUrlForPublish(coverUrl, coverPreviewUrl)
      const combinedGenre = [genre.trim(), secondaryGenre.trim()].filter(Boolean).join(' / ')

      for (const item of readyTracks) {
        if (!item.trackId) continue
        const songName = item.title.trim() || titleFromFilename(item.file.name)
        await updateArtistTrack(item.trackId, {
          title: songName,
          lyrics: item.lyrics.trim() || undefined,
          syncedLyrics: item.syncedLyrics?.length ? item.syncedLyrics : undefined,
          syncedLyricsStatus: item.syncedLyrics?.length ? 'pending_review' : undefined,
        })
      }

      return createRelease({
        title: releaseTitle.trim(),
        type: releaseType,
        genre: combinedGenre || undefined,
        coverUrl: resolvedCoverUrl,
        trackIds: uploadQueue.readyTrackIds,
        releaseDate: buildReleaseDateIso(
          releaseDate,
          releaseTimeEnabled,
          releaseHour,
          releaseMinute,
          releasePeriod,
          releaseTimezone,
        ),
        releaseTimezone,
        status: 'published',
      })
    },
    onSuccess: () => {
      toast.success('Release created successfully')
      void queryClient.invalidateQueries({ queryKey: ['artist-releases'] })
      void queryClient.invalidateQueries({ queryKey: ['artist-tracks'] })
      invalidateArtistSurfaceQueries(queryClient)
      uploadQueue.resetQueue()
      navigate('/artist/releases')
    },
    onError: () => toast.error('Could not create release'),
  })

  const canGoNext = useCallback(() => {
    if (step === 'upload') {
      return uploadQueue.hasReadyTracks && !uploadQueue.isProcessing
    }
    if (step === 'details') {
      return Boolean(
        releaseTitle.trim() &&
          genre.trim() &&
          readyTracks.length > 0 &&
          readyTracks.every((track) => track.title.trim()),
      )
    }
    if (step === 'schedule') {
      return Boolean(releaseDate)
    }
    return false
  }, [step, uploadQueue.hasReadyTracks, uploadQueue.isProcessing, releaseTitle, genre, releaseDate, readyTracks])

  const goNext = () => {
    const index = RELEASE_BUILDER_STEPS.findIndex((s) => s.id === step)
    if (index < RELEASE_BUILDER_STEPS.length - 1) {
      setStep(RELEASE_BUILDER_STEPS[index + 1].id)
    }
  }

  const goBack = () => {
    const index = RELEASE_BUILDER_STEPS.findIndex((s) => s.id === step)
    if (index > 0) {
      setStep(RELEASE_BUILDER_STEPS[index - 1].id)
    }
  }

  return (
    <ReleaseBuilderScene>
      <div className="rbl-stack">
        <AppBreadcrumb
          surface
          className="app-breadcrumb--dashboard"
          items={artistReleaseBreadcrumbs.newRelease()}
          description="Upload tracks, add release details, and schedule your go-live."
        />

        <ReleaseBuilderStepper
          currentStep={step}
          completedSteps={completedSteps}
          errorSteps={step === 'review' ? errorSteps : []}
        />

        <section className="rbl-workspace">
          {step === 'upload' ? <ReleaseUploadStep queue={uploadQueue} /> : null}
          {step === 'details' ? (
            <ReleaseDetailsStep
              queue={uploadQueue.queue}
              releaseTitle={releaseTitle}
              onReleaseTitleChange={setReleaseTitle}
              genre={genre}
              onGenreChange={setGenre}
              secondaryGenre={secondaryGenre}
              onSecondaryGenreChange={setSecondaryGenre}
              language={language}
              onLanguageChange={setLanguage}
              coverImageSrc={coverImageSrc}
              onCoverUrlChange={setCoverUrl}
              onCoverPreviewChange={handleCoverPreviewChange}
              releaseType={releaseType}
              onReleaseTypeChange={setReleaseType}
              onTrackTitleChange={uploadQueue.updateTitle}
              onTrackLyricsChange={uploadQueue.updateLyrics}
              onTrackSyncedLyricsChange={uploadQueue.updateSyncedLyrics}
              onTrackReorder={uploadQueue.reorderReadyTracks}
            />
          ) : null}
          {step === 'schedule' ? (
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
          ) : null}
          {step === 'review' ? (
            <ReleaseReviewStep
              queue={uploadQueue.queue}
              releaseTitle={releaseTitle}
              genre={genre}
              secondaryGenre={secondaryGenre}
              language={language}
              coverImageSrc={coverImageSrc}
              releaseType={releaseType}
              releaseDate={releaseDate}
              releaseTimeEnabled={releaseTimeEnabled}
              releaseHour={releaseHour}
              releaseMinute={releaseMinute}
              releasePeriod={releasePeriod}
              releaseTimezone={releaseTimezone}
              validationErrors={validationErrors}
              isPublishing={publishMutation.isPending}
              onPublish={() => publishMutation.mutate()}
            />
          ) : null}
        </section>
      </div>

      <footer className="rbl-deck">
        <div className="rbl-deck__inner">
          <button type="button" className="rbl-btn" onClick={goBack} disabled={step === 'upload'}>
            <ChevronLeft className="size-4" />
            Back
          </button>
          {step !== 'review' ? (
            <button type="button" className="rbl-btn rbl-btn--primary" onClick={goNext} disabled={!canGoNext()}>
              Next
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <span className="rbl-deck__hint">Confirm from the review panel</span>
          )}
        </div>
      </footer>
    </ReleaseBuilderScene>
  )
}
