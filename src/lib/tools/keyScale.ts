export const KEY_ROOTS = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

export type KeyRoot = (typeof KEY_ROOTS)[number]

export type ScaleMode =
  | 'major'
  | 'natural_minor'
  | 'harmonic_minor'
  | 'melodic_minor'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'locrian'

export const SCALE_MODE_LABELS: Record<ScaleMode, string> = {
  major: 'Major (Ionian)',
  natural_minor: 'Natural minor (Aeolian)',
  harmonic_minor: 'Harmonic minor',
  melodic_minor: 'Melodic minor',
  dorian: 'Dorian',
  phrygian: 'Phrygian',
  lydian: 'Lydian',
  mixolydian: 'Mixolydian',
  locrian: 'Locrian',
}

const SCALE_INTERVALS: Record<ScaleMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
}

const TRIAD_QUALITIES: Record<ScaleMode, ('maj' | 'min' | 'dim' | 'aug')[]> = {
  major: ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'],
  natural_minor: ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'],
  harmonic_minor: ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
  melodic_minor: ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
  dorian: ['min', 'min', 'maj', 'maj', 'min', 'dim', 'maj'],
  phrygian: ['min', 'maj', 'maj', 'min', 'dim', 'maj', 'min'],
  lydian: ['maj', 'maj', 'min', 'dim', 'maj', 'min', 'min'],
  mixolydian: ['maj', 'min', 'dim', 'maj', 'min', 'min', 'maj'],
  locrian: ['dim', 'maj', 'min', 'min', 'maj', 'maj', 'min'],
}

function rootIndex(root: KeyRoot): number {
  return KEY_ROOTS.indexOf(root)
}

function noteName(root: KeyRoot, semitone: number): string {
  const idx = (rootIndex(root) + semitone + 120) % 12
  return KEY_ROOTS[idx]
}

function chordSuffix(quality: 'maj' | 'min' | 'dim' | 'aug'): string {
  if (quality === 'min') return 'm'
  if (quality === 'dim') return 'dim'
  if (quality === 'aug') return 'aug'
  return ''
}

function relativePartner(root: KeyRoot, mode: ScaleMode): { root: KeyRoot; mode: ScaleMode; label: string } {
  if (mode === 'major') {
    const relRoot = noteName(root, 9) as KeyRoot
    return { root: relRoot, mode: 'natural_minor', label: `Relative minor: ${relRoot} natural minor` }
  }
  if (mode === 'natural_minor' || mode === 'harmonic_minor' || mode === 'melodic_minor') {
    const relRoot = noteName(root, 3) as KeyRoot
    return { root: relRoot, mode: 'major', label: `Relative major: ${relRoot} major` }
  }
  return { root, mode, label: 'No standard relative key for this mode — try parallel major/minor.' }
}

export interface KeyScaleResult {
  root: KeyRoot
  mode: ScaleMode
  scaleLabel: string
  notes: string[]
  degrees: string[]
  triads: string[]
  roman: string[]
  relative: string
  parallel: string
}

const DEGREE_NAMES = ['1', '2', '3', '4', '5', '6', '7']
const ROMAN_MAJOR = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
const ROMAN_MINOR = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii']

export function analyzeKeyScale(root: KeyRoot, mode: ScaleMode): KeyScaleResult {
  const intervals = SCALE_INTERVALS[mode]
  const qualities = TRIAD_QUALITIES[mode]
  const notes = intervals.map((st) => noteName(root, st))
  const triads = notes.map((n, i) => `${n}${chordSuffix(qualities[i])}`)
  const isMinorFamily =
    mode === 'natural_minor' ||
    mode === 'harmonic_minor' ||
    mode === 'melodic_minor' ||
    mode === 'dorian' ||
    mode === 'phrygian' ||
    mode === 'locrian'
  const roman = qualities.map((q, i) => {
    const base = isMinorFamily ? ROMAN_MINOR[i] : ROMAN_MAJOR[i]
    if (q === 'dim') return base.toLowerCase() + '°'
    if (q === 'aug') return base + '+'
    if (q === 'min') return base.toLowerCase()
    return base
  })

  const rel = relativePartner(root, mode)
  const parallelRoot = root
  const parallel =
    mode === 'major'
      ? `Parallel minor: ${parallelRoot} natural minor`
      : mode.includes('minor') || isMinorFamily
        ? `Parallel major: ${parallelRoot} major`
        : `Parallel major: ${parallelRoot} major · Parallel minor: ${parallelRoot} natural minor`

  return {
    root,
    mode,
    scaleLabel: `${root} ${SCALE_MODE_LABELS[mode]}`,
    notes,
    degrees: DEGREE_NAMES,
    triads,
    roman,
    relative: rel.label,
    parallel,
  }
}

export function formatKeyScaleExport(r: KeyScaleResult): string {
  return [
    r.scaleLabel,
    '',
    `Notes: ${r.notes.join(' · ')}`,
    `Triads: ${r.triads.join(' · ')}`,
    `Roman: ${r.roman.join(' – ')}`,
    '',
    r.relative,
    r.parallel,
  ].join('\n')
}
