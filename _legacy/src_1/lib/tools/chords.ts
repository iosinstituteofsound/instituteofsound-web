export type ScaleType = 'natural_minor' | 'harmonic_minor' | 'phrygian' | 'dorian' | 'locrian'

export type ProgressionVibe = 'dark' | 'epic' | 'melancholic' | 'tense' | 'triumphant'

export interface ChordProgressionInput {
  root: string
  scale: ScaleType
  vibe: ProgressionVibe
  bars: 4 | 8
}

const ROOTS = [
  'A',
  'A#',
  'B',
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
] as const

const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
}

const SCALE_LABELS: Record<ScaleType, string> = {
  natural_minor: 'Natural minor',
  harmonic_minor: 'Harmonic minor',
  phrygian: 'Phrygian',
  dorian: 'Dorian',
  locrian: 'Locrian',
}

/** Progressions as scale degrees (1-indexed) */
const VIBE_PROGRESSIONS: Record<ProgressionVibe, number[][]> = {
  dark: [
    [1, 6, 3, 7],
    [1, 4, 6, 5],
    [1, 2, 6, 5],
  ],
  epic: [
    [1, 5, 6, 4],
    [1, 6, 4, 5],
    [1, 4, 1, 5],
  ],
  melancholic: [
    [1, 6, 4, 5],
    [1, 3, 4, 1],
    [6, 4, 1, 5],
  ],
  tense: [
    [1, 2, 1, 7],
    [1, 4, 7, 1],
    [2, 5, 1, 6],
  ],
  triumphant: [
    [1, 5, 6, 3],
    [1, 4, 5, 1],
    [6, 5, 4, 1],
  ],
}

const DEGREE_ROMAN_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
const DEGREE_ROMAN_HARMONIC = ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°']

function noteAtRoot(root: string, semitones: number): string {
  const idx = ROOTS.indexOf(root as (typeof ROOTS)[number])
  if (idx < 0) return root
  return ROOTS[(idx + semitones + 12) % 12]!
}

function triad(root: string, scale: ScaleType, degree: number): string {
  const intervals = SCALE_INTERVALS[scale]
  const d = degree - 1
  const r = noteAtRoot(root, intervals[d]!)
  const third = noteAtRoot(root, intervals[(d + 2) % 7]!)
  const fifth = noteAtRoot(root, intervals[(d + 4) % 7]!)
  return `${r} (${third}, ${fifth})`
}

function romanForDegree(scale: ScaleType, degree: number): string {
  const table = scale === 'harmonic_minor' ? DEGREE_ROMAN_HARMONIC : DEGREE_ROMAN_MINOR
  return table[degree - 1] ?? String(degree)
}

export function generateChordProgression(input: ChordProgressionInput): {
  chords: string[]
  roman: string
  scaleLabel: string
} {
  const pool = VIBE_PROGRESSIONS[input.vibe]
  const degrees = pool[Math.floor(Math.random() * pool.length)]!
  const extended = input.bars === 8 ? [...degrees, ...degrees] : degrees

  const chords = extended.map((deg) => triad(input.root, input.scale, deg))
  const roman = extended.map((deg) => romanForDegree(input.scale, deg)).join(' – ')

  return {
    chords,
    roman,
    scaleLabel: `${input.root} ${SCALE_LABELS[input.scale]}`,
  }
}

export { ROOTS, SCALE_LABELS }
export const CHORD_VIBES = Object.keys(VIBE_PROGRESSIONS) as ProgressionVibe[]
