export interface ChecklistItem {
  id: string
  category: string
  label: string
  tip: string
}

export const EXPORT_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'headroom',
    category: 'Levels',
    label: 'Peak below 0 dBFS (at least 0.5–1 dB headroom)',
    tip: 'Use the Clip Detector tool before mastering.',
  },
  {
    id: 'loudness',
    category: 'Levels',
    label: 'RMS / loudness checked against reference',
    tip: 'Aim for genre-appropriate LUFS — not maxed brickwall unless intentional.',
  },
  {
    id: 'mono',
    category: 'Levels',
    label: 'Low end mono-safe (bass / kick not wide)',
    tip: 'Check below ~120 Hz in your DAW.',
  },
  {
    id: 'format',
    category: 'Export',
    label: 'WAV or FLAC master at 44.1 or 48 kHz',
    tip: 'Use Sample Rate Checker on your bounce.',
  },
  {
    id: 'bitdepth',
    category: 'Export',
    label: '24-bit (or 16-bit) export intentional',
    tip: 'Keep 32-bit float inside the DAW; export fixed depth for delivery.',
  },
  {
    id: 'stereo',
    category: 'Export',
    label: 'Stereo interleaved file (not multi-mono stems)',
    tip: 'Distribution masters are almost always stereo.',
  },
  {
    id: 'metadata',
    category: 'Metadata',
    label: 'Title, artist, album, year embedded',
    tip: 'ID3 for MP3; Vorbis comments for FLAC/OGG.',
  },
  {
    id: 'isrc',
    category: 'Metadata',
    label: 'ISRC planned if releasing to DSPs',
    tip: 'Register via your distributor or national agency.',
  },
  {
    id: 'artwork',
    category: 'Metadata',
    label: 'Cover art 3000×3000 (or platform spec)',
    tip: 'No explicit content violations on storefront guidelines.',
  },
  {
    id: 'credits',
    category: 'Metadata',
    label: 'Writing / production credits documented',
    tip: 'Matches liner notes and PRO registrations.',
  },
  {
    id: 'fades',
    category: 'Edit',
    label: 'Start / end fades clean (no clicks)',
    tip: 'Zoom waveform ends — 5–15 ms fades often enough.',
  },
  {
    id: 'silence',
    category: 'Edit',
    label: 'No long dead air at start or end',
    tip: 'Spotify and others penalize excessive silence.',
  },
  {
    id: 'dither',
    category: 'Edit',
    label: 'Dither applied when reducing bit depth',
    tip: 'Only on final export, once per bounce.',
  },
  {
    id: 'reference',
    category: 'QC',
    label: 'A/B against reference on multiple speakers',
    tip: 'Phone, car, headphones — underground fans listen everywhere.',
  },
  {
    id: 'mp3',
    category: 'QC',
    label: 'Lossy preview checked if distributing MP3',
    tip: 'Encode from WAV — never re-encode an MP3 master.',
  },
  {
    id: 'backup',
    category: 'QC',
    label: 'Project + stems backed up',
    tip: 'Cloud + local copy before deleting session folders.',
  },
]

export function buildChecklistReport(
  checked: Set<string>,
  notes: string
): { percent: number; byCategory: Record<string, { done: number; total: number }>; lines: string[] } {
  const byCategory: Record<string, { done: number; total: number }> = {}
  const lines: string[] = []

  EXPORT_CHECKLIST_ITEMS.forEach((item) => {
    const cat = byCategory[item.category] ?? { done: 0, total: 0 }
    cat.total += 1
    const done = checked.has(item.id)
    if (done) cat.done += 1
    byCategory[item.category] = cat
    lines.push(`${done ? '✓' : '○'} [${item.category}] ${item.label}`)
  })

  const percent = Math.round((checked.size / EXPORT_CHECKLIST_ITEMS.length) * 100)
  if (notes.trim()) lines.push('', 'Notes:', notes.trim())

  return { percent, byCategory, lines }
}

export function formatChecklistExport(
  checked: Set<string>,
  notes: string
): string {
  const r = buildChecklistReport(checked, notes)
  const cats = Object.entries(r.byCategory)
    .map(([c, v]) => `${c}: ${v.done}/${v.total}`)
    .join(' · ')
  return [
    `Mix / export checklist — ${r.percent}% complete`,
    cats,
    '',
    ...r.lines,
  ].join('\n')
}
