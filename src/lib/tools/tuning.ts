export interface TuningDefinition {
  id: string
  name: string
  description: string
  guitar: string[]
  bass?: string[]
}

export const TUNINGS: TuningDefinition[] = [
  {
    id: 'standard',
    name: 'Standard (E)',
    description: 'E A D G B E — reference for most rock and metal.',
    guitar: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    bass: ['E1', 'A1', 'D2', 'G2'],
  },
  {
    id: 'drop_d',
    name: 'Drop D',
    description: 'Heavy riffs with low D on string 6 — common in hard rock and metal.',
    guitar: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    bass: ['D1', 'A1', 'D2', 'G2'],
  },
  {
    id: 'drop_c',
    name: 'Drop C',
    description: 'Modern metal standard — thick low end, 7-string feel on 6-string.',
    guitar: ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'],
    bass: ['C1', 'G1', 'C2', 'F2'],
  },
  {
    id: 'drop_b',
    name: 'Drop B',
    description: 'Djent and progressive metal territory — tight palm mutes.',
    guitar: ['B1', 'F#2', 'B2', 'E3', 'G#3', 'C#4'],
    bass: ['B0', 'F#1', 'B1', 'E2'],
  },
  {
    id: 'drop_a',
    name: 'Drop A',
    description: 'Extended-range heaviness — check string tension and intonation.',
    guitar: ['A1', 'E2', 'A2', 'D3', 'F#3', 'B3'],
  },
  {
    id: 'dadgad',
    name: 'DADGAD',
    description: 'Modal drones and atmospheric folk-metal textures.',
    guitar: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'],
  },
  {
    id: 'open_d_minor',
    name: 'Open D minor',
    description: 'Doom and dark folk — barre one finger for movement.',
    guitar: ['D2', 'A2', 'D3', 'F3', 'A3', 'D4'],
  },
  {
    id: 'standard_7',
    name: '7-string standard (B)',
    description: 'B E A D G B E — extended low for modern metal.',
    guitar: ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  },
]

/** Concert pitch A4 = 440 Hz — string frequencies for reference */
export const NOTE_FREQ: Record<string, number> = {
  E1: 41.2,
  F1: 43.65,
  'F#1': 46.25,
  G1: 49.0,
  'G#1': 51.91,
  A1: 55.0,
  'A#1': 58.27,
  B1: 61.74,
  C2: 65.41,
  'C#2': 69.3,
  D2: 73.42,
  'D#2': 77.78,
  E2: 82.41,
  F2: 87.31,
  'F#2': 92.5,
  G2: 98.0,
  'G#2': 103.83,
  A2: 110.0,
  'A#2': 116.54,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  D4: 293.66,
  E4: 329.63,
}

export function formatTuningReference(tuning: TuningDefinition): string {
  const lines = [
    `${tuning.name}`,
    tuning.description,
    '',
    'Guitar (low → high):',
    ...tuning.guitar.map((n, i) => `  String ${tuning.guitar.length - i}: ${n} (~${NOTE_FREQ[n]?.toFixed(1) ?? '?'} Hz)`),
  ]
  if (tuning.bass) {
    lines.push('', 'Bass (low → high):', ...tuning.bass.map((n, i) => `  String ${tuning.bass!.length - i}: ${n}`))
  }
  lines.push('', 'Reference pitch: A4 = 440 Hz. Always tune up to pitch.')
  return lines.join('\n')
}
