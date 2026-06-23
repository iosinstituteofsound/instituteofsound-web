import { useMemo, useState } from 'react'
import { AlignLeft, AudioLines } from 'lucide-react'
import { LyricsSyncModal } from '@/modules/music/components/lyrics-sync-modal'
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

  const syncedCount = activeTrack?.syncedLyrics?.length ?? 0
  const canSync = Boolean(lyrics.trim() && activeTrack?.audioUrl)

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

      <Button
        type="button"
        variant="outline"
        className="rbl-lyrics__sync-btn"
        disabled={!canSync}
        onClick={() => setSyncOpen(true)}
      >
        <AudioLines className="mr-2 size-4" />
        Sync lyrics
      </Button>
      {!activeTrack?.audioUrl ? (
        <p className="rbl-lyrics__sync-status">Sync unlocks once track audio is ready.</p>
      ) : !lyrics.trim() ? (
        <p className="rbl-lyrics__sync-status">Add lyrics above before syncing timestamps.</p>
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
