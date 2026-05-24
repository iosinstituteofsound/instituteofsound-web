export interface SetlistSong {
  id: string
  title: string
  minutes: number
  seconds: number
}

export interface SetlistResult {
  songs: SetlistSong[]
  songCount: number
  totalSeconds: number
  encoreSeconds: number
  breakSeconds: number
  grandTotalSeconds: number
  formatted: {
    set: string
    encore: string
    breaks: string
    total: string
  }
}

export function createSongId(): string {
  return `song-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function songDurationSeconds(song: SetlistSong): number {
  return Math.max(0, song.minutes) * 60 + Math.min(59, Math.max(0, song.seconds))
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}

export function calculateSetlist(
  songs: SetlistSong[],
  encoreMinutes: number,
  breakMinutes: number
): SetlistResult {
  const active = songs.filter((s) => s.title.trim() || songDurationSeconds(s) > 0)
  const totalSeconds = active.reduce((sum, s) => sum + songDurationSeconds(s), 0)
  const encoreSeconds = Math.max(0, encoreMinutes) * 60
  const breakSeconds = Math.max(0, breakMinutes) * 60
  const grandTotalSeconds = totalSeconds + encoreSeconds + breakSeconds

  return {
    songs: active,
    songCount: active.length,
    totalSeconds,
    encoreSeconds,
    breakSeconds,
    grandTotalSeconds,
    formatted: {
      set: formatDuration(totalSeconds),
      encore: formatDuration(encoreSeconds),
      breaks: formatDuration(breakSeconds),
      total: formatDuration(grandTotalSeconds),
    },
  }
}

export function formatSetlistExport(r: SetlistResult): string {
  const lines = r.songs.map((s, i) => {
    const dur = formatDuration(songDurationSeconds(s))
    return `${i + 1}. ${s.title || 'Untitled'} — ${dur}`
  })
  return [
    'SETLIST',
    ...lines,
    '',
    `Songs: ${r.songCount}`,
    `Set time: ${r.formatted.set}`,
    `Encore buffer: ${r.formatted.encore}`,
    `Breaks / changeover: ${r.formatted.breaks}`,
    `Total (with buffers): ${r.formatted.total}`,
  ].join('\n')
}
