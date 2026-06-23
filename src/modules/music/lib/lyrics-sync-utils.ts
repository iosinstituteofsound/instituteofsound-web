import { randomUUID } from '@/shared/lib/random-uuid'
import type { SyncedLyricLine, SyncedLyricLineDto } from '@/modules/music/types/lyrics-sync.types'

export function formatSyncTime(ms: number): string {
  const totalSec = ms / 1000
  const minutes = Math.floor(totalSec / 60)
  const seconds = Math.floor(totalSec % 60)
  const millis = Math.floor(ms % 1000)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

export function formatDurationLabel(seconds?: number): string {
  if (!seconds || seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function parseLyricsToLines(lyrics: string): SyncedLyricLine[] {
  return lyrics
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ id: randomUUID(), text, timeMs: null }))
}

export function mergeLyricsWithSynced(
  lyrics: string,
  existing?: SyncedLyricLineDto[] | SyncedLyricLine[],
): SyncedLyricLine[] {
  if (existing?.length) {
    return existing.map((line) => ({
      id: randomUUID(),
      text: line.text,
      timeMs: 'timeMs' in line ? line.timeMs : null,
    }))
  }
  return parseLyricsToLines(lyrics)
}

export function linesToPlainLyrics(lines: SyncedLyricLine[]): string {
  return lines
    .map((line) => line.text.trim())
    .filter(Boolean)
    .join('\n')
}

export function linesToSyncedDto(lines: SyncedLyricLine[]): SyncedLyricLineDto[] {
  return lines
    .filter((line) => line.text.trim() && line.timeMs !== null)
    .map((line) => ({ text: line.text.trim(), timeMs: line.timeMs! }))
    .sort((a, b) => a.timeMs - b.timeMs)
}

export function dtoToSyncedLines(dto?: SyncedLyricLineDto[]): SyncedLyricLine[] {
  if (!dto?.length) return []
  return dto.map((line) => ({
    id: randomUUID(),
    text: line.text,
    timeMs: line.timeMs,
  }))
}
