import { useEffect, useMemo, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { resolveActiveSyncedLineIndex } from '@/modules/music/lib/lyrics-sync-utils'
import type { SyncedLyricLineDto } from '@/modules/music/types/lyrics-sync.types'
import { useTrackLyrics } from '@/modules/player/hooks/use-track-lyrics'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { cn } from '@/shared/lib/cn'
import '@/modules/player/styles/player-lyrics-panel.css'

function SyncedLyricsView({
  lines,
  currentTimeMs,
  onSeek,
}: {
  lines: SyncedLyricLineDto[]
  currentTimeMs: number
  onSeek: (timeSec: number) => void
}) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const activeIndex = useMemo(
    () => resolveActiveSyncedLineIndex(lines, currentTimeMs),
    [currentTimeMs, lines],
  )

  useEffect(() => {
    const container = listRef.current
    if (!container || activeIndex < 0) return
    const activeRow = container.querySelector<HTMLElement>(`[data-line-index="${activeIndex}"]`)
    activeRow?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [activeIndex])

  return (
    <div ref={listRef} className="player-lyrics-panel__synced">
      {lines.map((line, index) => {
        if (!line.text.trim()) return null
        const isActive = index === activeIndex
        const isPast = activeIndex >= 0 && index < activeIndex
        const canSeek = Number.isFinite(line.timeMs)

        return (
          <button
            key={`${line.timeMs}-${line.text}-${index}`}
            type="button"
            data-line-index={index}
            className={cn(
              'player-lyrics-panel__line',
              isActive && 'player-lyrics-panel__line--active',
              isPast && 'player-lyrics-panel__line--past',
            )}
            disabled={!canSeek}
            onClick={() => {
              if (canSeek) onSeek(line.timeMs / 1000)
            }}
          >
            {line.text}
          </button>
        )
      })}
    </div>
  )
}

function StaticLyricsView({ lyrics }: { lyrics: string }) {
  return <pre className="player-lyrics-panel__static">{lyrics.trim()}</pre>
}

export function PlayerLyricsContent({ className }: { className?: string }) {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const seek = usePlayerStore((s) => s.seek)
  const { lyrics, syncedLyrics, hasLyrics, hasSyncedPlayback, isLoading } = useTrackLyrics(currentTrack)

  if (!currentTrack) return null

  if (isLoading) {
    return (
      <div className={cn('player-lyrics-panel__state', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
        <p>Loading lyrics…</p>
      </div>
    )
  }

  if (!hasLyrics) {
    return (
      <div className={cn('player-lyrics-panel__state', className)}>
        <p className="player-lyrics-panel__empty-title">No lyrics yet</p>
        <p className="player-lyrics-panel__empty-copy">
          Lyrics for &ldquo;{currentTrack.title}&rdquo; aren&apos;t available.
        </p>
      </div>
    )
  }

  if (hasSyncedPlayback && syncedLyrics?.length) {
    return (
      <div className={cn('player-lyrics-panel__body', className)}>
        <SyncedLyricsView
          lines={syncedLyrics}
          currentTimeMs={currentTime * 1000}
          onSeek={seek}
        />
      </div>
    )
  }

  if (lyrics?.trim()) {
    return (
      <div className={cn('player-lyrics-panel__body', className)}>
        <StaticLyricsView lyrics={lyrics} />
      </div>
    )
  }

  if (syncedLyrics?.length) {
    return (
      <div className={cn('player-lyrics-panel__body', className)}>
        <StaticLyricsView lyrics={syncedLyrics.map((line) => line.text).join('\n')} />
      </div>
    )
  }

  return null
}
