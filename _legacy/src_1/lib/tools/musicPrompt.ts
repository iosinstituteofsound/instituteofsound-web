export type PromptMood =
  | 'apocalyptic'
  | 'melancholic'
  | 'aggressive'
  | 'hypnotic'
  | 'cinematic'
  | 'ritualistic'
  | 'cold'
  | 'chaotic'
  | 'uplifting'
  | 'romantic'
  | 'party'
  | 'dreamy'

export type PromptVocal =
  | 'instrumental'
  | 'harsh_screams'
  | 'mixed'
  | 'ethereal'
  | 'spoken'
  | 'clean'
  | 'rap'
  | 'harmonies'

export type PromptGenre = string

export interface GenreOption {
  id: string
  label: string
  instruments: string
  mixHint: string
  bpmHint?: [number, number]
}

export interface GenreCategory {
  id: string
  label: string
  genres: GenreOption[]
}

export interface MusicPromptInput {
  genre: PromptGenre
  mood: PromptMood
  bpm: number
  key: string
  vocal: PromptVocal
  era: '90s' | '00s' | 'modern' | 'vintage'
  extra: string
}

export const PROMPT_GENRE_CATEGORIES: GenreCategory[] = [
  {
    id: 'metal_heavy',
    label: 'Metal & Heavy',
    genres: [
      {
        id: 'black_metal',
        label: 'Black metal',
        instruments: 'tremolo guitars, blast beats, raw bass, hall reverb',
        mixHint: 'raw underground mix, room drums, icy highs',
        bpmHint: [130, 200],
      },
      {
        id: 'death_metal',
        label: 'Death metal',
        instruments: 'down-tuned guitars, double kick, palm-muted chugs, guttural vocals',
        mixHint: 'dense low-mid guitars, punchy kick, surgical bass',
        bpmHint: [120, 220],
      },
      {
        id: 'doom_metal',
        label: 'Doom metal',
        instruments: 'slow heavy riffs, floor tom grooves, fuzzy bass, minimal cymbals',
        mixHint: 'wide slow mix, saturated guitars, sub weight',
        bpmHint: [60, 90],
      },
      {
        id: 'thrash_metal',
        label: 'Thrash metal',
        instruments: 'picking riffs, aggressive drums, shouted vocals, tight rhythm',
        mixHint: 'mid-forward guitars, dry punchy drums',
        bpmHint: [140, 200],
      },
      {
        id: 'power_metal',
        label: 'Power metal',
        instruments: 'double kick, harmonized leads, soaring vocals, orchestral layers optional',
        mixHint: 'bright guitars, epic reverb, clear vocals',
        bpmHint: [120, 180],
      },
      {
        id: 'folk_metal',
        label: 'Folk metal',
        instruments: 'acoustic interludes, folk melodies, heavy drums, fiddle or flute touches',
        mixHint: 'balance folk clarity with metal weight',
        bpmHint: [100, 160],
      },
      {
        id: 'djent',
        label: 'Djent / progressive metal',
        instruments: 'extended-range guitars, syncopated grooves, tight bass, production clicks',
        mixHint: 'hyper-tight low end, modern wide stereo',
        bpmHint: [90, 140],
      },
      {
        id: 'metalcore',
        label: 'Metalcore / hardcore',
        instruments: 'breakdown riffs, punchy kick, scream/clean contrast, gang shouts',
        mixHint: 'drop-tuned punch, vocal contrast up front',
        bpmHint: [100, 160],
      },
      {
        id: 'sludge',
        label: 'Sludge / stoner',
        instruments: 'fuzz guitars, slow grooves, psychedelic feedback, thick bass',
        mixHint: 'saturated analog feel, loose but heavy',
        bpmHint: [70, 110],
      },
    ],
  },
  {
    id: 'rock_alt',
    label: 'Rock & Alternative',
    genres: [
      {
        id: 'classic_rock',
        label: 'Classic rock',
        instruments: 'overdriven guitars, live drums, bass groove, organ optional',
        mixHint: 'vintage amp tone, room drums, warm tape',
        bpmHint: [90, 130],
      },
      {
        id: 'alt_rock',
        label: 'Alternative rock',
        instruments: 'layered guitars, dynamic drums, melodic bass, verse-chorus lift',
        mixHint: 'radio-ready but textured, vocal forward',
        bpmHint: [90, 140],
      },
      {
        id: 'indie_rock',
        label: 'Indie rock',
        instruments: 'jangly or fuzzy guitars, loose drums, intimate vocals',
        mixHint: 'slightly lo-fi warmth, natural room',
        bpmHint: [100, 140],
      },
      {
        id: 'punk',
        label: 'Punk rock',
        instruments: 'power chords, fast drums, shouted vocals, short songs',
        mixHint: 'raw energy, minimal polish',
        bpmHint: [140, 200],
      },
      {
        id: 'post_punk',
        label: 'Post-punk / darkwave',
        instruments: 'chorused bass, motorik drums, angular guitars, cold synths',
        mixHint: 'dry drums, bass forward, 80s cold space',
        bpmHint: [110, 140],
      },
      {
        id: 'grunge',
        label: 'Grunge',
        instruments: 'detuned guitars, heavy drums, dynamic quiet-loud shifts',
        mixHint: '90s room sound, gritty vocals',
        bpmHint: [90, 130],
      },
      {
        id: 'shoegaze',
        label: 'Shoegaze / dream rock',
        instruments: 'washed guitars, shimmer verbs, soft drums, wall of sound',
        mixHint: 'everything through reverb, vocals buried then soaring',
        bpmHint: [80, 120],
      },
      {
        id: 'emo',
        label: 'Emo / post-hardcore',
        instruments: 'confessional vocals, dynamic builds, melodic hooks, tight drums',
        mixHint: 'emotional vocal clarity, guitar layers',
        bpmHint: [100, 160],
      },
      {
        id: 'garage_rock',
        label: 'Garage / psych rock',
        instruments: 'fuzz, tremolo, organ, loose live drums',
        mixHint: 'mono-ish vintage grit, tape saturation',
        bpmHint: [100, 140],
      },
    ],
  },
  {
    id: 'hip_hop_rap',
    label: 'Hip-Hop & Rap',
    genres: [
      {
        id: 'boom_bap',
        label: 'Boom bap',
        instruments: 'sampled drums, dusty loops, jazz chops, bass line',
        mixHint: 'head-nod groove, vinyl texture, vocal up front',
        bpmHint: [85, 100],
      },
      {
        id: 'trap',
        label: 'Trap',
        instruments: '808 sub, hi-hat rolls, snare clap, dark synths',
        mixHint: 'hard 808, wide hats, vocal ad-libs',
        bpmHint: [130, 160],
      },
      {
        id: 'drill',
        label: 'Drill',
        instruments: 'sliding 808s, sparse piano, dark pads, triplet hats',
        mixHint: 'menacing space, sub dominant',
        bpmHint: [140, 150],
      },
      {
        id: 'conscious_rap',
        label: 'Conscious / lyrical rap',
        instruments: 'soulful samples, live drums feel, warm bass',
        mixHint: 'clear vocal intelligibility, minimal clutter',
        bpmHint: [80, 100],
      },
      {
        id: 'lofi_hip_hop',
        label: 'Lo-fi hip-hop',
        instruments: 'dusty drums, rhodes, tape hiss, mellow chords',
        mixHint: 'soft transients, cozy stereo, low dynamics',
        bpmHint: [70, 90],
      },
      {
        id: 'phonk',
        label: 'Phonk / drift phonk',
        instruments: 'cowbell, distorted 808, Memphis samples, dark atmosphere',
        mixHint: 'aggressive saturation, club sub',
        bpmHint: [130, 160],
      },
      {
        id: 'cloud_rap',
        label: 'Cloud rap / emo rap',
        instruments: 'reverb-heavy keys, trap drums, autotune vocals, airy pads',
        mixHint: 'dreamy wide mix, vocal effects',
        bpmHint: [130, 150],
      },
    ],
  },
  {
    id: 'electronic',
    label: 'Electronic & Dance',
    genres: [
      {
        id: 'house',
        label: 'House',
        instruments: 'four-on-the-floor kick, offbeat hats, bass groove, stabs',
        mixHint: 'club punch, sidechain pump optional',
        bpmHint: [120, 128],
      },
      {
        id: 'techno',
        label: 'Techno',
        instruments: 'hypnotic kick, industrial percussion, modular synth lines',
        mixHint: 'relentless groove, mono-compatible low end',
        bpmHint: [125, 140],
      },
      {
        id: 'trance',
        label: 'Trance',
        instruments: 'supersaw leads, rolling bass, arpeggios, breakdown pads',
        mixHint: 'wide stereo, euphoric build-ups',
        bpmHint: [130, 145],
      },
      {
        id: 'dnb',
        label: 'Drum & bass',
        instruments: 'breakbeats, reese bass, amen variations, rapid hats',
        mixHint: 'tight transient drums, sub control',
        bpmHint: [170, 180],
      },
      {
        id: 'dubstep',
        label: 'Dubstep / bass music',
        instruments: 'wobble bass, half-time drums, sound design drops',
        mixHint: 'sub-heavy, dramatic dynamics',
        bpmHint: [138, 150],
      },
      {
        id: 'ambient_electronic',
        label: 'Ambient electronic',
        instruments: 'pads, granular textures, slow evolution, minimal percussion',
        mixHint: 'spacious, no loudness war',
        bpmHint: [60, 90],
      },
      {
        id: 'synthwave',
        label: 'Synthwave / retrowave',
        instruments: 'analog synths, gated reverb drums, arpeggiators, neon leads',
        mixHint: '80s nostalgia, polished sheen',
        bpmHint: [100, 120],
      },
      {
        id: 'idm',
        label: 'IDM / glitch',
        instruments: 'complex rhythms, glitch edits, experimental synths',
        mixHint: 'detailed micro-edits, hi-fi clarity',
        bpmHint: [90, 140],
      },
      {
        id: 'edm_pop',
        label: 'EDM / festival',
        instruments: 'big room kicks, supersaws, risers, festival drops',
        mixHint: 'maximum impact, bright masters',
        bpmHint: [125, 130],
      },
    ],
  },
  {
    id: 'pop',
    label: 'Pop',
    genres: [
      {
        id: 'pop',
        label: 'Mainstream pop',
        instruments: 'catchy hooks, programmed drums, synth bass, polished vocals',
        mixHint: 'bright vocal-forward radio mix',
        bpmHint: [100, 130],
      },
      {
        id: 'synth_pop',
        label: 'Synth-pop',
        instruments: 'analog synths, drum machines, catchy toplines',
        mixHint: '80s-modern hybrid, glossy',
        bpmHint: [110, 128],
      },
      {
        id: 'indie_pop',
        label: 'Indie pop',
        instruments: 'guitars or synths, quirky drums, intimate then anthemic',
        mixHint: 'tasteful polish, personality over loudness',
        bpmHint: [100, 130],
      },
      {
        id: 'dance_pop',
        label: 'Dance pop',
        instruments: 'four-on-the-floor, pop vocals, hook-heavy chorus',
        mixHint: 'club + radio crossover',
        bpmHint: [115, 128],
      },
      {
        id: 'hyperpop',
        label: 'Hyperpop',
        instruments: 'pitched vocals, metallic synths, chaotic drums',
        mixHint: 'extreme brightness, experimental pop',
        bpmHint: [140, 180],
      },
    ],
  },
  {
    id: 'rnb_soul_funk',
    label: 'R&B, Soul & Funk',
    genres: [
      {
        id: 'rnb',
        label: 'R&B',
        instruments: 'smooth keys, 808 or live drums, layered vocals, bass groove',
        mixHint: 'silky vocals, warm low end',
        bpmHint: [70, 100],
      },
      {
        id: 'neo_soul',
        label: 'Neo-soul',
        instruments: 'live drums, rhodes, jazz chords, organic bass',
        mixHint: 'natural dynamics, human feel',
        bpmHint: [80, 110],
      },
      {
        id: 'funk',
        label: 'Funk',
        instruments: 'slap bass, tight drums, horn stabs, wah guitar',
        mixHint: 'groove-first, punchy mids',
        bpmHint: [100, 120],
      },
      {
        id: 'motown',
        label: 'Motown / classic soul',
        instruments: 'live band, strings, tambourine, call-response vocals',
        mixHint: 'vintage warmth, vocal group harmonies',
        bpmHint: [90, 130],
      },
    ],
  },
  {
    id: 'jazz_blues',
    label: 'Jazz & Blues',
    genres: [
      {
        id: 'jazz',
        label: 'Jazz',
        instruments: 'upright bass, ride cymbal, piano comping, horn solos',
        mixHint: 'natural room, dynamic range preserved',
        bpmHint: [80, 200],
      },
      {
        id: 'jazz_fusion',
        label: 'Jazz fusion',
        instruments: 'electric piano, complex harmony, funk drums, solo sections',
        mixHint: '70s fusion warmth, instrumental focus',
        bpmHint: [100, 140],
      },
      {
        id: 'blues',
        label: 'Blues',
        instruments: 'shuffle drums, guitar bends, harmonica, walking bass',
        mixHint: 'amp grit, live band feel',
        bpmHint: [70, 120],
      },
      {
        id: 'blues_rock',
        label: 'Blues rock',
        instruments: 'overdrive guitar, heavy shuffle, organ swells',
        mixHint: 'power trio energy, mid-heavy',
        bpmHint: [90, 130],
      },
    ],
  },
  {
    id: 'folk_country',
    label: 'Folk, Country & Acoustic',
    genres: [
      {
        id: 'folk',
        label: 'Folk',
        instruments: 'acoustic guitar, fingerpicking, harmonica, light percussion',
        mixHint: 'intimate dry vocal, natural space',
        bpmHint: [80, 120],
      },
      {
        id: 'singer_songwriter',
        label: 'Singer-songwriter',
        instruments: 'voice + guitar or piano, minimal arrangement',
        mixHint: 'close-mic intimacy, emotional delivery',
        bpmHint: [70, 110],
      },
      {
        id: 'country',
        label: 'Country',
        instruments: 'twang guitar, fiddle, pedal steel, steady drums',
        mixHint: 'clear storytelling vocal, Nashville polish optional',
        bpmHint: [90, 130],
      },
      {
        id: 'americana',
        label: 'Americana / alt-country',
        instruments: 'acoustic and electric blend, roots percussion, harmonized vocals',
        mixHint: 'organic, slightly weathered tone',
        bpmHint: [90, 120],
      },
      {
        id: 'bluegrass',
        label: 'Bluegrass',
        instruments: 'banjo, mandolin, upright bass, fast picking',
        mixHint: 'bright acoustic clarity, ensemble live feel',
        bpmHint: [120, 180],
      },
    ],
  },
  {
    id: 'world_regional',
    label: 'World & Regional',
    genres: [
      {
        id: 'reggae',
        label: 'Reggae',
        instruments: 'one-drop drums, offbeat skank guitar, deep bass, organ bubbles',
        mixHint: 'heavy bass, relaxed groove',
        bpmHint: [70, 90],
      },
      {
        id: 'dub',
        label: 'Dub',
        instruments: 'heavy reverb delays, bass emphasis, stripped drums, echo drops',
        mixHint: 'spatial effects as instrumentation',
        bpmHint: [70, 90],
      },
      {
        id: 'afrobeats',
        label: 'Afrobeats',
        instruments: 'percussion layers, log drums, bright guitars, dance groove',
        mixHint: 'rhythm-forward, warm and punchy',
        bpmHint: [95, 115],
      },
      {
        id: 'latin',
        label: 'Latin pop / reggaeton',
        instruments: 'dembow rhythm, brass stabs, syncopated bass, Spanish vocals',
        mixHint: 'tropical brightness, club energy',
        bpmHint: [90, 100],
      },
      {
        id: 'bollywood',
        label: 'Bollywood / filmi',
        instruments: 'orchestral strings, tabla, melodic hooks, dramatic builds',
        mixHint: 'cinematic scale, vocal ornamentation',
        bpmHint: [80, 140],
      },
      {
        id: 'indian_fusion',
        label: 'Indian fusion / cinematic',
        instruments: 'sitar or sarod textures, tabla, modern drums, raga-inspired melody',
        mixHint: 'east-west blend, wide cinematic space',
        bpmHint: [80, 120],
      },
      {
        id: 'middle_eastern',
        label: 'Middle Eastern / maqam',
        instruments: 'oud, darbuka, quarter-tone melody, ornamental phrasing',
        mixHint: 'authentic scales, reverberant space',
        bpmHint: [80, 120],
      },
    ],
  },
  {
    id: 'classical_cinematic',
    label: 'Classical & Cinematic',
    genres: [
      {
        id: 'orchestral',
        label: 'Orchestral',
        instruments: 'strings, brass, woodwinds, timpani, dynamic swells',
        mixHint: 'concert hall reverb, natural dynamics',
        bpmHint: [60, 120],
      },
      {
        id: 'neo_classical',
        label: 'Neo-classical / piano',
        instruments: 'solo piano or strings, minimal accompaniment, emotional arc',
        mixHint: 'delicate, high dynamic range',
        bpmHint: [60, 100],
      },
      {
        id: 'film_score',
        label: 'Film score / soundtrack',
        instruments: 'hybrid orchestra, pulses, textures, thematic motifs',
        mixHint: 'cinematic depth, narrative pacing',
        bpmHint: [70, 140],
      },
      {
        id: 'trailer_music',
        label: 'Trailer / epic hybrid',
        instruments: 'braams, hits, choir, ostinato strings, impacts',
        mixHint: 'massive loudness, tension and release',
        bpmHint: [100, 140],
      },
    ],
  },
  {
    id: 'experimental',
    label: 'Experimental & Atmospheric',
    genres: [
      {
        id: 'dark_ambient',
        label: 'Dark ambient',
        instruments: 'drone pads, field recordings, sub rumble, no drums',
        mixHint: 'vast negative space, slow evolution',
        bpmHint: [0, 80],
      },
      {
        id: 'noise',
        label: 'Noise / harsh experimental',
        instruments: 'feedback, distortion layers, non-metric rhythm',
        mixHint: 'confrontational dynamics, no conventional structure',
        bpmHint: [0, 120],
      },
      {
        id: 'avant_garde',
        label: 'Avant-garde',
        instruments: 'unusual timbres, free rhythm, collage structure',
        mixHint: 'rule-breaking arrangement, art-first',
        bpmHint: [0, 140],
      },
      {
        id: 'new_age',
        label: 'New age / healing ambient',
        instruments: 'soft pads, nature sounds, gentle piano, slow tempo',
        mixHint: 'calming, no harsh transients',
        bpmHint: [60, 80],
      },
      {
        id: 'industrial',
        label: 'Industrial',
        instruments: 'machine percussion, distorted synths, metallic hits',
        mixHint: 'mechanical aggression, cold stereo',
        bpmHint: [100, 140],
      },
    ],
  },
]

const GENRE_MAP = new Map<string, GenreOption & { category: string }>()
for (const cat of PROMPT_GENRE_CATEGORIES) {
  for (const g of cat.genres) {
    GENRE_MAP.set(g.id, { ...g, category: cat.label })
  }
}

export const DEFAULT_PROMPT_GENRE = 'black_metal'

export function getGenreOption(id: string): GenreOption | undefined {
  return GENRE_MAP.get(id)
}

export function getGenreCategoryLabel(id: string): string {
  return GENRE_MAP.get(id)?.category ?? 'General'
}

const MOOD_LABELS: Record<PromptMood, string> = {
  apocalyptic: 'apocalyptic and vast',
  melancholic: 'melancholic and heavy-hearted',
  aggressive: 'aggressive and relentless',
  hypnotic: 'hypnotic and trance-like',
  cinematic: 'cinematic and widescreen',
  ritualistic: 'ritualistic and occult',
  cold: 'cold and detached',
  chaotic: 'chaotic and unstable',
  uplifting: 'uplifting and anthemic',
  romantic: 'romantic and intimate',
  party: 'high-energy party feel',
  dreamy: 'dreamy and hazy',
}

const VOCAL_LABELS: Record<PromptVocal, string> = {
  instrumental: 'instrumental only, no vocals',
  harsh_screams: 'harsh screams and gutturals',
  mixed: 'mixed clean and harsh vocals',
  ethereal: 'ethereal distant vocals, heavy reverb',
  spoken: 'spoken word or fragments',
  clean: 'clear sung vocals, forward in mix',
  rap: 'rap vocals, rhythmic delivery',
  harmonies: 'layered harmonies and backing vocals',
}

const ERA_TAGS: Record<MusicPromptInput['era'], string> = {
  '90s': '1990s production character, tape or early digital warmth',
  '00s': 'early 2000s production, tight and punchy',
  modern: 'contemporary production standards for the genre',
  vintage: 'vintage analog grit, tape saturation, classic feel',
}

function avoidLine(category: string): string {
  if (category.includes('Metal') || category.includes('Experimental')) {
    return 'Avoid: EDM festival drops unless genre calls for it, trap hi-hats in metal, polished pop vocal tuning.'
  }
  if (category.includes('Hip-Hop') || category.includes('Pop') || category.includes('Electronic')) {
    return 'Avoid: muddy low-end, clashing frequencies, generic stock loops without character.'
  }
  if (category.includes('Jazz') || category.includes('Classical')) {
    return 'Avoid: over-compression, quantizing human swing, synthetic replacements for acoustic instruments.'
  }
  return 'Avoid: clichés that fight the genre identity; stay authentic to the style.'
}

export function buildMusicPrompt(input: MusicPromptInput): string {
  const genreOpt = GENRE_MAP.get(input.genre)
  const genreLabel = genreOpt?.label ?? input.genre.replace(/_/g, ' ')
  const category = genreOpt?.category ?? 'General'
  const mood = MOOD_LABELS[input.mood]
  const vocals = VOCAL_LABELS[input.vocal]
  const instruments = genreOpt?.instruments ?? 'appropriate instruments for the genre'
  const mix = genreOpt?.mixHint ?? 'genre-appropriate mix balance'
  const era = ERA_TAGS[input.era]
  const extra = input.extra.trim()

  const lines = [
    `[${genreLabel.toUpperCase()}] ${mood}, ${input.key}, ${input.bpm} BPM`,
    '',
    `Category: ${category}.`,
    `Style: ${genreLabel}, ${mood}. ${era}.`,
    `Instrumentation: ${instruments}.`,
    `Vocals: ${vocals}.`,
    `Mix: ${mix}.`,
    extra ? `Notes: ${extra}` : '',
    '',
    'Structure: intro → main section → contrast (bridge/breakdown) → climax → outro.',
    avoidLine(category),
  ].filter(Boolean)

  return lines.join('\n')
}

export const PROMPT_MOODS = Object.entries(MOOD_LABELS) as [PromptMood, string][]

export const PROMPT_KEYS = [
  'C major',
  'G major',
  'D major',
  'A major',
  'E major',
  'F major',
  'Bb major',
  'C minor',
  'D minor',
  'E minor',
  'F minor',
  'G minor',
  'A minor',
  'B minor',
  'C# minor',
  'F# minor',
  'Eb minor',
  'Drop D',
  'Drop C',
  'Drop B',
  'Open D minor',
] as const

export function suggestedBpmForGenre(genreId: string): number {
  const opt = GENRE_MAP.get(genreId)
  if (!opt?.bpmHint) return 120
  const [lo, hi] = opt.bpmHint
  return Math.round((lo + hi) / 2)
}
