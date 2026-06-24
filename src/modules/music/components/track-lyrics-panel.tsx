import { useMemo, useState } from 'react'
import { AlignLeft, AudioLines, Sparkles } from 'lucide-react'
import { LyricsSyncModal } from '@/modules/music/components/lyrics-sync-modal'
import { useLyricsGeneration } from '@/modules/music/hooks/use-lyrics-generation'
import { Textarea } from '@/shared/components/ui/textarea'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { SyncedLyricLineDto, SyncedLyricsStatus } from '@/modules/music/types/lyrics-sync.types'

const MAX_LYRICS_LENGTH = 20000

export interface TrackLyricsOption {
  id: string
  title: string
  lyrics?: string
  syncedLyrics?: SyncedLyricLineDto[]
  syncedLyricsStatus?: SyncedLyricsStatus
  audioUrl?: string
  durationSec?: number
  waveformPeaks?: number[]
  apiTrackId?: string
}

interface TrackLyricsPanelProps {
  tracks: TrackLyricsOption[]
  activeTrackId: string | null
  onActiveTrackChange: (id: string) => void
  lyrics: string
  onLyricsChange: (value: string) => void
  artistName?: string
  genre?: string
  coverUrl?: string
  onSyncedLyricsSave?: (
    trackId: string,
    payload: { lyrics: string; syncedLyrics: SyncedLyricLineDto[] },
  ) => void | Promise<void>
  className?: string
}

export function TrackLyricsPanel({
  tracks,
  activeTrackId,
  onActiveTrackChange,
  lyrics,
  onLyricsChange,
  artistName = 'Artist',
  genre,
  coverUrl,
  onSyncedLyricsSave,
  className,
}: TrackLyricsPanelProps) {
  const [syncOpen, setSyncOpen] = useState(false)
  const activeTrack = tracks.find((track) => track.id === activeTrackId) ?? tracks[0]
  const showSelector = tracks.length > 1

  const { isGenerating, generate, error: generationError, progress, statusLabel } = useLyricsGeneration({
    trackId: activeTrack?.apiTrackId,
    onLyricsChange,
    onSyncedLyricsSave: activeTrack
      ? async (payload) => {
          await onSyncedLyricsSave?.(activeTrack.id, payload)
        }
      : undefined,
  })

  const syncedCount = activeTrack?.syncedLyrics?.length ?? 0
  const canSync = Boolean(lyrics.trim() && activeTrack?.audioUrl)
  const canGenerate = Boolean(activeTrack?.audioUrl && activeTrack?.apiTrackId && !isGenerating)

  const syncStatusLabel = useMemo(() => {
    if (!syncedCount) return null
    if (activeTrack?.syncedLyricsStatus === 'pending_review') return `${syncedCount} lines · pending review`
    if (activeTrack?.syncedLyricsStatus === 'approved') return `${syncedCount} lines · approved`
    return `${syncedCount} lines synced`
  }, [activeTrack?.syncedLyricsStatus, syncedCount])

  if (tracks.length === 0) {
    return (
      <div className={cn('rbl-lyrics', className)}>
        <p className="rbl-lyrics__kicker">
          <AlignLeft className="mr-1 inline size-3" />
          Lyrics
        </p>
        <p className="rbl-lyrics__empty">Upload or select a track to add lyrics.</p>
      </div>
    )
  }

  return (
    <div className={cn('rbl-lyrics', className)}>
      <p className="rbl-lyrics__kicker">
        <AlignLeft className="mr-1 inline size-3" />
        Lyrics
      </p>

      {showSelector ? (
        <div className="rbl-lyrics__selector">
          <label htmlFor="lyrics-track-select" className="sr-only">
            Select track for lyrics
          </label>
          <select
            id="lyrics-track-select"
            className="rbl-readout w-full"
            value={activeTrack?.id ?? ''}
            onChange={(e) => onActiveTrackChange(e.target.value)}
          >
            {tracks.map((track, index) => (
              <option key={track.id} value={track.id}>
                {String(index + 1).padStart(2, '0')} · {track.title.trim() || 'Untitled track'}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="rbl-lyrics__track-name">{activeTrack?.title.trim() || 'Untitled track'}</p>
      )}

      <Textarea
        id={`lyrics-${activeTrack?.id ?? 'track'}`}
        className="rbl-lyrics__input"
        placeholder="Paste or type lyrics here…"
        value={lyrics}
        maxLength={MAX_LYRICS_LENGTH}
        rows={14}
        onChange={(e) => onLyricsChange(e.target.value)}
      />
      <p className="rbl-lyrics__hint">
        {lyrics.length > 0
          ? `${lyrics.length.toLocaleString()} characters · saved with your release`
          : 'Optional — fans can read lyrics on track pages and in DEX'}
      </p>

      <div className="rbl-lyrics__actions">
        <Button
          type="button"
          variant="outline"
          className="rbl-lyrics__sync-btn"
          disabled={!canGenerate}
          onClick={() => void generate()}
        >
          <Sparkles className="mr-2 size-4" />
          {isGenerating ? `Generating… ${progress > 0 ? `${progress}%` : ''}`.trim() : 'Generate with AI'}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="rbl-lyrics__sync-btn"
          disabled={!canSync || isGenerating}
          onClick={() => setSyncOpen(true)}
        >
          <AudioLines className="mr-2 size-4" />
          Sync lyrics
        </Button>
      </div>
      {!activeTrack?.audioUrl ? (
        <p className="rbl-lyrics__sync-status">AI generation unlocks once track audio is ready.</p>
      ) : !activeTrack?.apiTrackId ? (
        <p className="rbl-lyrics__sync-status">Finish uploading the track before generating lyrics.</p>
      ) : isGenerating ? (
        <div className="rbl-lyrics__progress-wrap" aria-live="polite">
          <div className="rbl-lyrics__progress-track">
            <div
              className="rbl-lyrics__progress-fill"
              style={{ width: `${Math.max(8, Math.min(100, progress || 8))}%` }}
            />
          </div>
          <p className="rbl-lyrics__sync-status">{statusLabel}</p>
          <p className="rbl-lyrics__sync-status rbl-lyrics__sync-status--muted">
            {progress > 0 ? `${progress}%` : 'Please wait…'}
          </p>
        </div>
      ) : generationError ? (
        <p className="rbl-lyrics__sync-status">{generationError}</p>
      ) : !lyrics.trim() ? (
        <p className="rbl-lyrics__sync-status">Generate with AI or add lyrics manually before syncing timestamps.</p>
      ) : syncStatusLabel ? (
        <p className="rbl-lyrics__sync-status rbl-lyrics__sync-status--synced">{syncStatusLabel}</p>
      ) : null}

      {activeTrack ? (
        <LyricsSyncModal
          open={syncOpen}
          onOpenChange={setSyncOpen}
          trackTitle={activeTrack.title}
          artistName={artistName}
          genre={genre}
          coverUrl={coverUrl}
          durationSec={activeTrack.durationSec}
          audioUrl={activeTrack.audioUrl}
          waveformPeaks={activeTrack.waveformPeaks}
          lyrics={lyrics}
          syncedLyrics={activeTrack.syncedLyrics}
          onSave={async (result) => {
            onLyricsChange(result.lyrics)
            await onSyncedLyricsSave?.(activeTrack.id, result)
          }}
        />
      ) : null}
    </div>
  )
}
