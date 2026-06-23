import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Disc3, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { getArtistProfile, listArtistTracks, updateArtistTrack } from '@/modules/music/api/music.api'
import { invalidateTrackLyricsQueries } from '@/modules/music/lib/invalidate-track-lyrics'
import { ReleaseTrackDetailsList } from '@/modules/music/components/release-track-details-list'
import { TrackLyricsPanel } from '@/modules/music/components/track-lyrics-panel'
import { formatArtistTrackTitle } from '@/modules/music/lib/track-title-format'
import { normalizeMediaUrl } from '@/modules/editor/lib/normalize-media-url'
import type { QueuedUpload } from '@/modules/music/types/release-builder.types'
import type { SyncedLyricLineDto } from '@/modules/music/types/lyrics-sync.types'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

interface ReleaseDetailsStepProps {
  queue: QueuedUpload[]
  releaseTitle: string
  onReleaseTitleChange: (value: string) => void
  genre: string
  onGenreChange: (value: string) => void
  secondaryGenre: string
  onSecondaryGenreChange: (value: string) => void
  language: string
  onLanguageChange: (value: string) => void
  coverImageSrc: string
  onCoverUrlChange: (value: string) => void
  onCoverPreviewChange: (value: string) => void
  releaseType: 'single' | 'ep' | 'album'
  onReleaseTypeChange: (value: 'single' | 'ep' | 'album') => void
  onTrackTitleChange: (id: string, title: string) => void
  onTrackLyricsChange: (id: string, lyrics: string) => void
  onTrackSyncedLyricsChange: (
    id: string,
    payload: { lyrics: string; syncedLyrics: SyncedLyricLineDto[] },
  ) => void
  onTrackReorder: (activeId: string, overId: string) => void
}

export function ReleaseDetailsStep({
  queue,
  releaseTitle,
  onReleaseTitleChange,
  genre,
  onGenreChange,
  secondaryGenre,
  onSecondaryGenreChange,
  language,
  onLanguageChange,
  coverImageSrc,
  onCoverUrlChange,
  onCoverPreviewChange,
  releaseType,
  onReleaseTypeChange,
  onTrackTitleChange,
  onTrackLyricsChange,
  onTrackSyncedLyricsChange,
  onTrackReorder,
}: ReleaseDetailsStepProps) {
  const queryClient = useQueryClient()
  const [coverFileName, setCoverFileName] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [activeLyricsTrackId, setActiveLyricsTrackId] = useState<string | null>(null)

  const { data: profile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: getArtistProfile,
  })

  const { data: artistTracks } = useQuery({
    queryKey: ['artist-tracks'],
    queryFn: listArtistTracks,
  })

  const readyTracks = queue.filter((item) => item.status === 'ready')
  const isMultiTrack = readyTracks.length > 1

  const lyricsTrackId = activeLyricsTrackId ?? readyTracks[0]?.id ?? null
  const activeLyricsTrack = readyTracks.find((item) => item.id === lyricsTrackId)

  const trackDurations = useMemo(() => {
    const map: Record<string, number | undefined> = {}
    for (const item of readyTracks) {
      if (!item.trackId) continue
      const track = artistTracks?.find((entry) => entry.id === item.trackId)
      if (track?.durationSec) map[item.id] = track.durationSec
    }
    return map
  }, [artistTracks, readyTracks])

  const trackAudioUrls = useMemo(() => {
    const map: Record<string, string> = {}
    for (const item of readyTracks) {
      if (item.trackId) {
        const track = artistTracks?.find((entry) => entry.id === item.trackId)
        if (track?.audioUrl) map[item.id] = track.audioUrl
      } else {
        map[item.id] = URL.createObjectURL(item.file)
      }
    }
    return map
  }, [artistTracks, readyTracks])

  useEffect(
    () => () => {
      for (const item of readyTracks) {
        if (!item.trackId && trackAudioUrls[item.id]?.startsWith('blob:')) {
          URL.revokeObjectURL(trackAudioUrls[item.id]!)
        }
      }
    },
    [readyTracks, trackAudioUrls],
  )

  const handleCoverUpload = async (file: File) => {
    setCoverFileName(file.name)
    onCoverPreviewChange(URL.createObjectURL(file))
    setCoverUploading(true)
    try {
      const result = await uploadMediaFile(file, file.name)
      const uploadedUrl = normalizeMediaUrl(result.absoluteUrl ?? result.url)
      if (!uploadedUrl) throw new Error('Upload returned no URL')
      onCoverUrlChange(uploadedUrl)
    } catch {
      toast.error('Cover upload failed — try again before publishing')
      onCoverUrlChange('')
    } finally {
      setCoverUploading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        <header className="rbl-section-head">
          <p className="rbl-section-head__kicker ios-mh-kicker">Details</p>
          <h2 className="rbl-section-head__title">Release &amp; track details</h2>
          <p className="rbl-section-head__desc">
            Fill in your {isMultiTrack ? 'album or EP' : 'release'} information first, then enter each song name
            individually. Tracks publish as Artist Name - Song Name across the site.
          </p>
        </header>

        <section className="rbl-panel">
          <div className="rbl-panel__header">
            <h3 className="rbl-panel__title">{isMultiTrack ? 'Album / release details' : 'Release details'}</h3>
            <p className="rbl-panel__meta">Cover, genre, and release identity</p>
          </div>
          <div className="rbl-panel__body space-y-5">
            <div className="rbl-field">
              <label htmlFor="release-title">{isMultiTrack ? 'Album / release title' : 'Release title'}</label>
              <Input
                id="release-title"
                placeholder={isMultiTrack ? 'Enter album or EP title' : 'Enter release title'}
                value={releaseTitle}
                onChange={(e) => onReleaseTitleChange(e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rbl-field">
                <label htmlFor="primary-genre">Primary genre</label>
                <Input
                  id="primary-genre"
                  placeholder="e.g. Electronic"
                  value={genre}
                  onChange={(e) => onGenreChange(e.target.value)}
                />
              </div>
              <div className="rbl-field">
                <label htmlFor="secondary-genre">Secondary genre</label>
                <Input
                  id="secondary-genre"
                  placeholder="Optional"
                  value={secondaryGenre}
                  onChange={(e) => onSecondaryGenreChange(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rbl-field">
                <span className="rbl-field__label">Language</span>
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Instrumental">Instrumental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rbl-field">
                <span className="rbl-field__label">Release type</span>
                {isMultiTrack ? (
                  <Select value={releaseType} onValueChange={(v) => onReleaseTypeChange(v as 'ep' | 'album')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ep">EP</SelectItem>
                      <SelectItem value="album">Album</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="rbl-readout">Single</div>
                )}
              </div>
            </div>

            <div className="rbl-field">
              <span className="rbl-field__label">Cover artwork</span>
              <label
                htmlFor="cover-art"
                className={`rbl-cover-drop${coverImageSrc ? ' rbl-cover-drop--filled' : ''}${coverUploading ? ' rbl-cover-drop--busy' : ''}`}
              >
                {coverImageSrc ? (
                  <img src={coverImageSrc} alt={releaseTitle || 'Cover preview'} className="rbl-cover-drop__preview" />
                ) : (
                  <div className="rbl-cover-drop__empty">
                    <Disc3 className="size-8" />
                    <p className="rbl-cover-drop__title">Drop cover art here</p>
                    <p className="rbl-cover-drop__hint">PNG or JPG · square recommended</p>
                  </div>
                )}
                <span className="rbl-cover-drop__action">
                  {coverUploading ? 'Uploading…' : coverImageSrc ? 'Replace artwork' : 'Choose file'}
                </span>
              </label>
              <Input
                id="cover-art"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleCoverUpload(file)
                  e.target.value = ''
                }}
              />
              {coverFileName ? (
                <p className="rbl-field__hint">
                  {coverUploading ? `Uploading ${coverFileName}…` : `${coverFileName} synced`}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rbl-panel">
          <div className="rbl-panel__header">
            <h3 className="rbl-panel__title">Track details</h3>
            <p className="rbl-panel__meta">
              {readyTracks.length} track{readyTracks.length === 1 ? '' : 's'} · song names only · publishes as{' '}
              {profile?.displayName ?? 'Artist'} - Song Name
              {readyTracks.length > 1 ? ' · drag to reorder' : ''}
            </p>
          </div>
          <div className="rbl-panel__body">
            {readyTracks.length === 0 ? (
              <p className="rbl-field__hint">Upload and sync at least one track before editing track details.</p>
            ) : (
              <ReleaseTrackDetailsList
                tracks={readyTracks}
                trackDurations={trackDurations}
                artistName={profile?.displayName ?? 'Artist'}
                onTrackTitleChange={onTrackTitleChange}
                onReorder={onTrackReorder}
              />
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <TrackLyricsPanel
          tracks={readyTracks.map((track) => ({
            id: track.id,
            title: track.title,
            lyrics: track.lyrics,
            syncedLyrics: track.syncedLyrics,
            syncedLyricsStatus: track.syncedLyricsStatus,
            audioUrl: trackAudioUrls[track.id],
            durationSec: trackDurations[track.id],
            apiTrackId: track.trackId,
          }))}
          activeTrackId={lyricsTrackId}
          onActiveTrackChange={setActiveLyricsTrackId}
          lyrics={activeLyricsTrack?.lyrics ?? ''}
          onLyricsChange={(value) => {
            if (!lyricsTrackId) return
            onTrackLyricsChange(lyricsTrackId, value)
          }}
          artistName={profile?.displayName ?? 'Artist'}
          genre={genre.trim() || undefined}
          coverUrl={coverImageSrc || undefined}
          onSyncedLyricsSave={async (trackId, payload) => {
            onTrackSyncedLyricsChange(trackId, payload)
            const queueItem = readyTracks.find((track) => track.id === trackId)
            if (!queueItem?.trackId) return
            await updateArtistTrack(queueItem.trackId, {
              title: queueItem.title.trim(),
              lyrics: payload.lyrics,
              syncedLyrics: payload.syncedLyrics,
              syncedLyricsStatus: 'pending_review',
            })
            invalidateTrackLyricsQueries(queryClient, { trackId: queueItem.trackId })
          }}
        />

        <div className="rbl-holo">
          <p className="rbl-holo__kicker">
            <Sparkles className="mr-1 inline size-3" />
            Holographic preview
          </p>
          <div className="rbl-holo__frame">
            {coverImageSrc ? (
              <img src={coverImageSrc} alt={releaseTitle || 'Release cover preview'} />
            ) : (
              <div className="rbl-holo__placeholder">
                <Disc3 className="size-14" />
              </div>
            )}
          </div>
          <p className="rbl-holo__title">{releaseTitle || 'Untitled Transmission'}</p>
          <p className="rbl-holo__artist">{profile?.displayName ?? 'Unknown artist'}</p>
          <span className="rbl-holo__type">{releaseType}</span>
          {readyTracks.length > 0 ? (
            <ol className="rbl-holo__tracklist">
              {readyTracks.map((track, index) => (
                <li key={track.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>
                    {track.title.trim()
                      ? formatArtistTrackTitle(profile?.displayName ?? 'Artist', track.title)
                      : 'Untitled track'}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
