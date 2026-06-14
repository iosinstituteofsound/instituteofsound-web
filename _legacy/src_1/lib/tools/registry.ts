export type ToolId =
  | 'music-prompt'
  | 'chords'
  | 'artist-name'
  | 'vocal-chain'
  | 'tuning'
  | 'bpm'
  | 'tap-tempo'
  | 'spectrum'
  | 'clipping'
  | 'loudness'
  | 'key-scale'
  | 'lyrics'
  | 'setlist'
  | 'audio-format'
  | 'subgenre-tags'
  | 'export-checklist'

export interface ToolDefinition {
  id: ToolId
  path: string
  title: string
  tagline: string
  phase: 1 | 2 | 3
  code: string
  stat: { label: string; value: string }
  features: [string, string, string]
  accent: 'red' | 'crimson' | 'signal' | 'amber'
}

export const PHASE_1_TOOLS: ToolDefinition[] = [
  {
    id: 'music-prompt',
    path: '/tools/music-prompt',
    title: 'Music Prompt Builder',
    tagline: 'Suno / Udio ready prompts — 70+ genres, instant copy.',
    phase: 1,
    code: 'TLS-01',
    stat: { label: 'Genres', value: '70+' },
    features: ['11 categories', 'Live preview', 'Zero API'],
    accent: 'red',
  },
  {
    id: 'chords',
    path: '/tools/chords',
    title: 'Chord Progression Generator',
    tagline: 'Theory engine for dark, epic, and tense progressions.',
    phase: 1,
    code: 'TLS-02',
    stat: { label: 'Scales', value: '5' },
    features: ['Roman numerals', 'Randomize', 'Copy export'],
    accent: 'crimson',
  },
  {
    id: 'artist-name',
    path: '/tools/artist-name',
    title: 'Artist Name Generator',
    tagline: 'Underground word banks — unlimited refreshes.',
    phase: 1,
    code: 'TLS-03',
    stat: { label: 'Per roll', value: '12' },
    features: ['Instant', 'No login', 'Copy all'],
    accent: 'signal',
  },
  {
    id: 'vocal-chain',
    path: '/tools/vocal-chain',
    title: 'Vocal Chain Builder',
    tagline: 'Signal-flow map for scream, clean, rap, and more.',
    phase: 1,
    code: 'TLS-04',
    stat: { label: 'Styles', value: '5' },
    features: ['Step pipeline', 'Settings', 'Studio tips'],
    accent: 'amber',
  },
  {
    id: 'tuning',
    path: '/tools/tuning',
    title: 'Tuning Reference',
    tagline: 'Drop tunings, note maps, and Hz reference.',
    phase: 1,
    code: 'TLS-05',
    stat: { label: 'Presets', value: '8' },
    features: ['Guitar + bass', 'Frequency', 'Copy sheet'],
    accent: 'red',
  },
]

export const PHASE_2_TOOLS: ToolDefinition[] = [
  {
    id: 'bpm',
    path: '/tools/bpm',
    title: 'BPM Finder',
    tagline: 'Upload a track — detect tempo from drum pulse locally.',
    phase: 2,
    code: 'TLS-06',
    stat: { label: 'Engine', value: 'Web Audio' },
    features: ['File upload', 'Confidence', 'Approx BPM'],
    accent: 'red',
  },
  {
    id: 'tap-tempo',
    path: '/tools/tap-tempo',
    title: 'Tap Tempo & Metronome',
    tagline: 'Tap the beat, lock BPM, practice with a click.',
    phase: 2,
    code: 'TLS-07',
    stat: { label: 'Input', value: 'Tap' },
    features: ['8-tap average', 'Metronome', '30–300 BPM'],
    accent: 'crimson',
  },
  {
    id: 'spectrum',
    path: '/tools/spectrum',
    title: 'Frequency Analyzer',
    tagline: 'Live mic spectrum or file breakdown by band.',
    phase: 2,
    code: 'TLS-08',
    stat: { label: 'Bands', value: '6' },
    features: ['Live mic', 'File upload', 'Sub → air'],
    accent: 'amber',
  },
  {
    id: 'clipping',
    path: '/tools/clipping',
    title: 'Clip Detector',
    tagline: 'Find digital clipping and peak overload in your mix.',
    phase: 2,
    code: 'TLS-09',
    stat: { label: 'Check', value: '0 dBFS' },
    features: ['Clip count', 'Peak meter', 'Headroom'],
    accent: 'signal',
  },
  {
    id: 'loudness',
    path: '/tools/loudness',
    title: 'Loudness Meter',
    tagline: 'RMS level, crest factor, and mix loudness readout.',
    phase: 2,
    code: 'TLS-10',
    stat: { label: 'Meter', value: 'RMS' },
    features: ['dBFS readout', 'Crest factor', 'Verdict'],
    accent: 'red',
  },
]

export const PHASE_3_TOOLS: ToolDefinition[] = [
  {
    id: 'key-scale',
    path: '/tools/key-scale',
    title: 'Key & Scale Helper',
    tagline: 'Notes, triads, Roman numerals, and relative keys.',
    phase: 3,
    code: 'TLS-11',
    stat: { label: 'Modes', value: '9' },
    features: ['Diatonic triads', 'Relative key', 'Copy sheet'],
    accent: 'crimson',
  },
  {
    id: 'lyrics',
    path: '/tools/lyrics',
    title: 'Lyric Rhyme & Syllable Counter',
    tagline: 'Syllables per line, rhyme groups, and structure hints.',
    phase: 3,
    code: 'TLS-12',
    stat: { label: 'Engine', value: 'Rules' },
    features: ['Syllable count', 'Rhyme map', 'No AI'],
    accent: 'signal',
  },
  {
    id: 'setlist',
    path: '/tools/setlist',
    title: 'Setlist Calculator',
    tagline: 'Song lengths, encore buffer, and total stage time.',
    phase: 3,
    code: 'TLS-13',
    stat: { label: 'Planning', value: 'Live' },
    features: ['Add songs', 'Encore buffer', 'Copy setlist'],
    accent: 'amber',
  },
  {
    id: 'audio-format',
    path: '/tools/audio-format',
    title: 'Sample Rate & Bit Depth Checker',
    tagline: 'Hz, channels, duration, and WAV bit depth from upload.',
    phase: 3,
    code: 'TLS-14',
    stat: { label: 'Rates', value: '44.1/48' },
    features: ['File upload', 'WAV header', 'Verdict'],
    accent: 'red',
  },
  {
    id: 'subgenre-tags',
    path: '/tools/subgenre-tags',
    title: 'Subgenre Tag Picker',
    tagline: 'Metal & underground tags for bios, prompts, and submissions.',
    phase: 3,
    code: 'TLS-15',
    stat: { label: 'Tags', value: '60+' },
    features: ['Bio blurbs', 'Prompt block', 'Hashtags'],
    accent: 'crimson',
  },
  {
    id: 'export-checklist',
    path: '/tools/export-checklist',
    title: 'Mix / Export Checklist',
    tagline: 'Pre-release QC for levels, format, metadata, and listening.',
    phase: 3,
    code: 'TLS-16',
    stat: { label: 'Items', value: '16' },
    features: ['Categories', 'Progress %', 'Copy report'],
    accent: 'signal',
  },
]

export const ALL_TOOLS: ToolDefinition[] = [
  ...PHASE_1_TOOLS,
  ...PHASE_2_TOOLS,
  ...PHASE_3_TOOLS,
]

export const TOOL_MAP = Object.fromEntries(ALL_TOOLS.map((t) => [t.id, t])) as Record<
  ToolId,
  ToolDefinition
>

export const TOOL_HUB_STATS = [
  { label: 'Tools live', value: '16' },
  { label: 'Cost', value: '$0' },
  { label: 'Login', value: 'None' },
  { label: 'Phases', value: '1–3' },
] as const
