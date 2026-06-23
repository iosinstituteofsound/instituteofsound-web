import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronFirst,
  ChevronLast,
  CircleHelp,
  Disc3,
  Eye,
  Info,
  Lock,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLyricsSyncPlayer } from '@/modules/music/hooks/use-lyrics-sync-player'
import {
  dtoToSyncedLines,
  formatDurationLabel,
  formatSyncTime,
  linesToPlainLyrics,
  linesToSyncedDto,
  mergeLyricsWithSynced,
} from '@/modules/music/lib/lyrics-sync-utils'
import type { SyncedLyricLine, SyncedLyricLineDto } from '@/modules/music/types/lyrics-sync.types'
import {
  Dialog,
  DialogContent,
} from '@/shared/components/ui/dialog'
import { randomUUID } from '@/shared/lib/random-uuid'
import '@/modules/music/styles/lyrics-sync-modal.css'

interface LyricsSyncModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trackTitle: string
  artistName: string
  genre?: string
  coverUrl?: string
  durationSec?: number
  audioUrl?: string
  waveformPeaks?: number[]
  lyrics: string
  syncedLyrics?: SyncedLyricLineDto[]
  onSave: (result: { lyrics: string; syncedLyrics: SyncedLyricLineDto[] }) => void | Promise<void>
}

function buildWaveBars(peaks?: number[], count = 48): number[] {
  if (peaks?.length) {
    const step = Math.max(1, Math.floor(peaks.length / count))
    return Array.from({ length: count }, (_, i) => {
      const value = peaks[Math.min(i * step, peaks.length - 1)] ?? 0
      return Math.max(12, Math.min(100, Math.round(value * 100)))
    })
  }
  return Array.from({ length: count }, (_, i) => 20 + Math.abs(Math.sin(i * 0.45)) * 50)
}

const SyncWaveform = memo(function SyncWaveform({
  bars,
  progressPct,
}: {
  bars: number[]
  progressPct: number
}) {
  const waveStyle = { '--wave-progress': `${progressPct}%` } as CSSProperties
  const playedThrough = Math.floor((progressPct / 100) * bars.length)

  return (
    <div className="rbl-lyrics-sync__waveform" style={waveStyle} aria-hidden>
      {bars.map((height, index) => {
        const barStyle = { '--bar-height': `${height}%` } as CSSProperties
        const played = index <= playedThrough
        return (
          <span
            key={index}
            className={`rbl-lyrics-sync__wave-bar${played ? ' rbl-lyrics-sync__wave-bar--played' : ' rbl-lyrics-sync__wave-bar--upcoming'}`}
            style={barStyle}
          />
        )
      })}
    </div>
  )
})

const LyricSyncRow = memo(function LyricSyncRow({
  line,
  index,
  isActive,
  isEditing,
  editText,
  onSelect,
  onEditTextChange,
  onCommitEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
  onPlayFrom,
}: {
  line: SyncedLyricLine
  index: number
  isActive: boolean
  isEditing: boolean
  editText: string
  onSelect: (index: number) => void
  onEditTextChange: (value: string) => void
  onCommitEdit: () => void
  onCancelEdit: () => void
  onStartEdit: (line: SyncedLyricLine) => void
  onDelete: (id: string) => void
  onPlayFrom: (timeMs: number) => void
}) {
  return (
    <div
      className={`rbl-lyrics-sync__row${isActive ? ' rbl-lyrics-sync__row--active' : ''}`}
      onClick={() => onSelect(index)}
      data-active={isActive || undefined}
    >
      <div className="rbl-lyrics-sync__row-text">
        {isActive ? <Play className="size-3" /> : null}
        {isEditing ? (
          <input
            className="rbl-lyrics-sync__edit-input"
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onBlur={onCommitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitEdit()
              if (e.key === 'Escape') onCancelEdit()
            }}
            aria-label="Edit lyric line"
            placeholder="Lyric line"
            autoFocus
          />
        ) : (
          <span>{line.text || 'Empty line'}</span>
        )}
      </div>
      <span className={`rbl-lyrics-sync__row-time${line.timeMs === null ? ' rbl-lyrics-sync__row-time--empty' : ''}`}>
        {line.timeMs !== null ? formatSyncTime(line.timeMs) : '—'}
      </span>
      <div className="rbl-lyrics-sync__row-actions">
        <button
          type="button"
          className="rbl-lyrics-sync__icon-btn"
          onClick={(e) => {
            e.stopPropagation()
            if (line.timeMs !== null) onPlayFrom(line.timeMs)
          }}
          aria-label="Play from line"
          disabled={line.timeMs === null}
        >
          <Play className="size-3.5" />
        </button>
        <button
          type="button"
          className="rbl-lyrics-sync__icon-btn"
          onClick={(e) => {
            e.stopPropagation()
            onStartEdit(line)
          }}
          aria-label="Edit line"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          className="rbl-lyrics-sync__icon-btn rbl-lyrics-sync__icon-btn--danger"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(line.id)
          }}
          aria-label="Delete line"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
})

export function LyricsSyncModal({
  open,
  onOpenChange,
  trackTitle,
  artistName,
  genre,
  coverUrl,
  durationSec,
  audioUrl,
  waveformPeaks,
  lyrics,
  syncedLyrics,
  onSave,
}: LyricsSyncModalProps) {
  const [lines, setLines] = useState<SyncedLyricLine[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const draftRef = useRef<SyncedLyricLine[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const tableBodyRef = useRef<HTMLDivElement>(null)

  const player = useLyricsSyncPlayer(open ? audioUrl : undefined)
  const waveBars = useMemo(() => buildWaveBars(waveformPeaks), [waveformPeaks])

  const totalDurationMs = player.durationMs || (durationSec ? durationSec * 1000 : 0)
  const progressPct = totalDurationMs > 0 ? (player.currentMs / totalDurationMs) * 100 : 0

  useEffect(() => {
    if (!open) return
    const merged = mergeLyricsWithSynced(lyrics, syncedLyrics?.length ? dtoToSyncedLines(syncedLyrics) : undefined)
    setLines(merged)
    draftRef.current = merged
    setActiveIndex(0)
    setEditingId(null)
    setShowPreview(false)
  }, [open, lyrics, syncedLyrics])

  const setTimestampForActive = useCallback(() => {
    setLines((current) => {
      if (!current.length || activeIndex < 0 || activeIndex >= current.length) return current
      const next = [...current]
      next[activeIndex] = { ...next[activeIndex]!, timeMs: Math.round(player.currentMs) }
      return next
    })
  }, [activeIndex, player.currentMs])

  const stampAndAdvance = useCallback(() => {
    setLines((current) => {
      if (!current.length || activeIndex < 0 || activeIndex >= current.length) return current
      const next = [...current]
      next[activeIndex] = { ...next[activeIndex]!, timeMs: Math.round(player.currentMs) }
      return next
    })
    setActiveIndex((index) => Math.min(index + 1, lines.length))
  }, [activeIndex, lines.length, player.currentMs])

  const goToPreviousLine = useCallback(() => {
    setActiveIndex((index) => Math.max(0, index - 1))
  }, [])

  const progressStyle = { '--progress-pct': `${progressPct}%` } as CSSProperties

  useEffect(() => {
    if (!open || showPreview) return
    const container = tableBodyRef.current
    if (!container) return
    const activeRow = container.querySelector<HTMLElement>('[data-active="true"]')
    activeRow?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIndex, open, showPreview])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return

      if (event.code === 'Space') {
        event.preventDefault()
        player.togglePlay()
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault()
        player.seekBy(-player.seekStepMs)
      } else if (event.code === 'ArrowRight') {
        event.preventDefault()
        player.seekBy(player.seekStepMs)
      } else if (event.key === 's' || event.key === 'S') {
        event.preventDefault()
        stampAndAdvance()
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        goToPreviousLine()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        stampAndAdvance()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goToPreviousLine, open, player, stampAndAdvance])

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !totalDurationMs) return
    const rect = progressRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    player.seekTo(ratio * totalDurationMs)
  }

  const addLine = () => {
    const line: SyncedLyricLine = { id: randomUUID(), text: '', timeMs: null }
    setLines((current) => [...current, line])
    setActiveIndex(lines.length)
    setEditingId(line.id)
    setEditText('')
  }

  const deleteLine = (id: string) => {
    setLines((current) => {
      const index = current.findIndex((line) => line.id === id)
      const next = current.filter((line) => line.id !== id)
      setActiveIndex((active) => {
        if (!next.length) return 0
        if (index < active) return active - 1
        if (index === active) return Math.min(active, next.length - 1)
        return active
      })
      return next
    })
    if (editingId === id) setEditingId(null)
  }

  const startEdit = (line: SyncedLyricLine) => {
    setEditingId(line.id)
    setEditText(line.text)
  }

  const commitEdit = () => {
    if (!editingId) return
    setLines((current) =>
      current.map((line) => (line.id === editingId ? { ...line, text: editText.trim() } : line)),
    )
    setEditingId(null)
    setEditText('')
  }

  const handleDiscard = () => {
    setLines(draftRef.current)
    onOpenChange(false)
  }

  const handleSave = async () => {
    const plain = linesToPlainLyrics(lines)
    const synced = linesToSyncedDto(lines)
    if (!plain.trim()) {
      toast.error('Add at least one lyric line before saving')
      return
    }
    if (!synced.length) {
      toast.error('Set timestamps for at least one line before submitting')
      return
    }

    setIsSaving(true)
    try {
      await onSave({ lyrics: plain, syncedLyrics: synced })
      draftRef.current = lines
      toast.success('Lyrics sync submitted for review')
      onOpenChange(false)
    } catch {
      toast.error('Could not save lyrics sync')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        elevated
        hideCloseButton
        overlayClassName="rbl-lyrics-sync__overlay"
        className="rbl-lyrics-sync max-w-none gap-0 sm:rounded-none"
      >
        <header className="rbl-lyrics-sync__header">
          <div className="rbl-lyrics-sync__brand">
            <div className="rbl-lyrics-sync__brand-icon" aria-hidden>
              ◈
            </div>
            <div className="rbl-lyrics-sync__brand-text">
              <p className="rbl-lyrics-sync__kicker">Lyrics Sync</p>
              <h2 className="rbl-lyrics-sync__title">DEX Lyrics Engine v2.1</h2>
            </div>
          </div>
          <div className="rbl-lyrics-sync__header-actions">
            <button type="button" className="rbl-lyrics-sync__footer-btn" title="Keyboard shortcuts">
              <CircleHelp className="size-3.5" />
              Help
            </button>
            <button type="button" className="rbl-lyrics-sync__icon-btn" onClick={() => onOpenChange(false)} aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="rbl-lyrics-sync__body">
          <aside className="rbl-lyrics-sync__player">
            <div className="rbl-lyrics-sync__track-meta">
              {coverUrl ? (
                <img src={coverUrl} alt="" className="rbl-lyrics-sync__art" />
              ) : (
                <div className="rbl-lyrics-sync__art rbl-lyrics-sync__art-placeholder">
                  <Disc3 className="size-6" />
                </div>
              )}
              <div>
                <p className="rbl-lyrics-sync__song-title">{trackTitle || 'Untitled track'}</p>
                <p className="rbl-lyrics-sync__song-artist">{artistName}</p>
                <div className="rbl-lyrics-sync__song-tags">
                  <span className="rbl-lyrics-sync__tag">{formatDurationLabel(durationSec)}</span>
                  {genre ? <span className="rbl-lyrics-sync__tag">{genre}</span> : null}
                </div>
              </div>
            </div>

            <SyncWaveform bars={waveBars} progressPct={progressPct} />

            <div className="rbl-lyrics-sync__progress">
              <div className="rbl-lyrics-sync__progress-times">
                <span>{formatSyncTime(player.currentMs)}</span>
                <span>{formatSyncTime(totalDurationMs || 0)}</span>
              </div>
              <div
                ref={progressRef}
                className="rbl-lyrics-sync__progress-bar"
                style={progressStyle}
                onClick={handleProgressClick}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={totalDurationMs || 0}
                aria-valuenow={Math.round(player.currentMs)}
                aria-label="Playback position"
              >
                <div className="rbl-lyrics-sync__progress-fill" />
              </div>
            </div>

            <div className="rbl-lyrics-sync__controls">
              <button type="button" className="rbl-lyrics-sync__control-btn" onClick={() => player.seekTo(0)} aria-label="Skip to start">
                <ChevronFirst className="size-4" />
              </button>
              <button
                type="button"
                className="rbl-lyrics-sync__control-btn"
                onClick={() => player.seekBy(-player.seekStepMs)}
                aria-label="Go back 5 seconds"
              >
                <SkipBack className="size-4" />
              </button>
              <button
                type="button"
                className="rbl-lyrics-sync__control-btn"
                onClick={() => player.seekBy(-player.seekStepMs)}
                aria-label="Rewind 5 seconds"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                className="rbl-lyrics-sync__control-btn rbl-lyrics-sync__control-btn--primary"
                onClick={player.togglePlay}
                aria-label={player.isPlaying ? 'Pause' : 'Play'}
              >
                {player.isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
              </button>
              <button
                type="button"
                className="rbl-lyrics-sync__control-btn"
                onClick={() => player.seekBy(player.seekStepMs)}
                aria-label="Go forward 5 seconds"
              >
                <SkipForward className="size-4" />
              </button>
              <button
                type="button"
                className="rbl-lyrics-sync__control-btn"
                onClick={() => player.seekTo(totalDurationMs)}
                aria-label="Skip to end"
              >
                <ChevronLast className="size-4" />
              </button>
            </div>

            <div className="rbl-lyrics-sync__shortcuts">
              <p className="rbl-lyrics-sync__shortcuts-title">Shortcuts</p>
              <ul className="rbl-lyrics-sync__shortcut-list">
                <li>
                  <span>Set time &amp; next line</span>
                  <span className="rbl-lyrics-sync__key">S / ↓</span>
                </li>
                <li>
                  <span>Previous line</span>
                  <span className="rbl-lyrics-sync__key">↑</span>
                </li>
                <li>
                  <span>Play / Pause</span>
                  <span className="rbl-lyrics-sync__key">Space</span>
                </li>
                <li>
                  <span>Seek ±5s</span>
                  <span className="rbl-lyrics-sync__key">← →</span>
                </li>
              </ul>
            </div>

            <p className="rbl-lyrics-sync__tip">
              <Info className="size-3.5 shrink-0" />
              Tip: Press &apos;S&apos; or ↓ to set timestamp for the current line and move to the next.
            </p>
          </aside>

          <section className="rbl-lyrics-sync__editor">
            {showPreview ? (
              <div className="rbl-lyrics-sync__table-body">
                <pre className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed">
                  {lines
                    .filter((line) => line.text.trim())
                    .map((line) =>
                      line.timeMs !== null ?
                        `[${formatSyncTime(line.timeMs)}] ${line.text}`
                      : line.text,
                    )
                    .join('\n')}
                </pre>
              </div>
            ) : (
              <>
                <div className="rbl-lyrics-sync__table-head">
                  <span>Lyrics</span>
                  <span>Time</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="rbl-lyrics-sync__table-body" ref={tableBodyRef}>
                  {lines.length === 0 ? (
                    <p className="rbl-lyrics-sync__empty">No lyric lines yet. Add lines from your lyrics text or use Add New Line.</p>
                  ) : (
                    lines.map((line, index) => (
                      <LyricSyncRow
                        key={line.id}
                        line={line}
                        index={index}
                        isActive={index === activeIndex}
                        isEditing={editingId === line.id}
                        editText={editText}
                        onSelect={setActiveIndex}
                        onEditTextChange={setEditText}
                        onCommitEdit={commitEdit}
                        onCancelEdit={() => setEditingId(null)}
                        onStartEdit={startEdit}
                        onDelete={deleteLine}
                        onPlayFrom={player.playFrom}
                      />
                    ))
                  )}
                </div>
              </>
            )}

            <div className="rbl-lyrics-sync__add-row">
              <button type="button" className="rbl-lyrics-sync__add-btn" onClick={addLine}>
                + Add new line
              </button>
              <button
                type="button"
                className="rbl-lyrics-sync__nav-btn"
                onClick={goToPreviousLine}
                disabled={activeIndex <= 0}
                aria-label="Previous line"
                title="Previous line (↑)"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                className="rbl-lyrics-sync__nav-btn"
                onClick={stampAndAdvance}
                disabled={!lines.length}
                aria-label="Set timestamp and next line"
                title="Set timestamp & next (S / ↓)"
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                className="rbl-lyrics-sync__nav-btn"
                onClick={setTimestampForActive}
                disabled={!lines.length}
                aria-label="Set timestamp for current line"
                title="Set timestamp only"
              >
                <span className="font-mono text-[0.625rem] font-bold">S</span>
              </button>
            </div>
          </section>
        </div>

        <footer className="rbl-lyrics-sync__footer">
          <p className="rbl-lyrics-sync__review-note">
            <Lock className="size-3" />
            Your sync will be reviewed before publishing.
          </p>
          <div className="rbl-lyrics-sync__footer-actions">
            <button type="button" className="rbl-lyrics-sync__footer-btn" onClick={handleDiscard} disabled={isSaving}>
              Discard
            </button>
            <button
              type="button"
              className="rbl-lyrics-sync__footer-btn"
              onClick={() => setShowPreview((value) => !value)}
            >
              <Eye className="size-3.5" />
              {showPreview ? 'Back to editor' : 'Preview full lyrics'}
            </button>
            <button
              type="button"
              className="rbl-lyrics-sync__footer-btn rbl-lyrics-sync__footer-btn--primary"
              onClick={() => void handleSave()}
              disabled={isSaving || !audioUrl}
            >
              <Upload className="size-3.5" />
              {isSaving ? 'Saving…' : 'Save & submit'}
            </button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
