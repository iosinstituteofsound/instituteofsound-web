export type VocalStyle = 'clean' | 'scream' | 'fry' | 'rap' | 'whisper'
export type VocalEnvironment = 'bedroom' | 'home_studio' | 'pro_interface'
export type VocalGenre = 'metal' | 'hardcore' | 'shoegaze' | 'industrial' | 'pop_punk'

export interface VocalChainInput {
  style: VocalStyle
  environment: VocalEnvironment
  genre: VocalGenre
}

export interface ChainStep {
  order: number
  name: string
  purpose: string
  settings: string
  tips: string
}

const CHAINS: Record<VocalStyle, Record<VocalGenre, ChainStep[]>> = {
  scream: {
    metal: [
      {
        order: 1,
        name: 'High-pass filter',
        purpose: 'Remove rumble',
        settings: '80–100 Hz, 12 dB/oct',
        tips: 'Do not high-pass too aggressively — body lives around 120–250 Hz.',
      },
      {
        order: 2,
        name: 'De-esser (light)',
        purpose: 'Tame harsh sibilance after compression',
        settings: '4–8 kHz band, gentle reduction',
        tips: 'Optional on screams; more important on mixed productions.',
      },
      {
        order: 3,
        name: 'Compressor',
        purpose: 'Control scream dynamics',
        settings: '4:1–8:1, attack 5–15 ms, release 40–80 ms, 4–8 dB GR',
        tips: 'Fast attack catches peaks; don’t squash transient punch completely.',
      },
      {
        order: 4,
        name: 'EQ',
        purpose: 'Presence and cut mud',
        settings: 'Cut 300–400 Hz if muddy; boost 2–4 kHz for cut; shelf 8 kHz +2 dB',
        tips: 'Screams often need mid presence, not more low end.',
      },
      {
        order: 5,
        name: 'Saturation / clip',
        purpose: 'Aggressive density',
        settings: 'Light tape or soft clip, 1–3 dB',
        tips: 'Parallel distortion bus is common in metal — blend 20–40%.',
      },
      {
        order: 6,
        name: 'Reverb send',
        purpose: 'Space without washing screams',
        settings: 'Short plate or room, pre-delay 20–40 ms, low wet',
        tips: 'Keep dry scream upfront; long verbs belong on guitars.',
      },
    ],
    hardcore: [],
    shoegaze: [],
    industrial: [],
    pop_punk: [],
  },
  clean: {
    metal: [
      {
        order: 1,
        name: 'High-pass filter',
        purpose: 'Clean low-end control',
        settings: '70–90 Hz',
        tips: 'Let bass guitar own sub; vocals sit above.',
      },
      {
        order: 2,
        name: 'Compressor',
        purpose: 'Even phrases',
        settings: '3:1–4:1, attack 15–25 ms, release 80–120 ms',
        tips: 'Slower attack keeps vocal air; automate rides for choruses.',
      },
      {
        order: 3,
        name: 'EQ',
        purpose: 'Clarity',
        settings: 'Cut 200–300 Hz, boost 3–5 kHz, high shelf 10 kHz',
        tips: 'Contrast with harsh screams by staying brighter and smoother.',
      },
      {
        order: 4,
        name: 'De-esser',
        purpose: 'Sibilance control',
        settings: 'Target 5–8 kHz',
        tips: 'After compression so esses are consistent.',
      },
      {
        order: 5,
        name: 'Reverb + delay',
        purpose: 'Depth',
        settings: 'Plate verb; 1/8 dotted delay low in mix',
        tips: 'Sidechain verb to kick lightly if mix pumps.',
      },
    ],
    hardcore: [],
    shoegaze: [],
    industrial: [],
    pop_punk: [],
  },
  fry: { metal: [], hardcore: [], shoegaze: [], industrial: [], pop_punk: [] },
  rap: { metal: [], hardcore: [], shoegaze: [], industrial: [], pop_punk: [] },
  whisper: { metal: [], hardcore: [], shoegaze: [], industrial: [], pop_punk: [] },
}

// Fill missing genre variants by cloning metal with tweaks
function fillChains() {
  const screamMetal = CHAINS.scream.metal
  CHAINS.scream.hardcore = screamMetal.map((s) => ({
    ...s,
    tips: s.tips + ' Hardcore: leave more room for kick and gang shouts.',
  }))
  CHAINS.scream.shoegaze = [
    ...screamMetal.slice(0, 4),
    {
      order: 5,
      name: 'Reverb (long)',
      purpose: 'Wash screams into guitar bed',
      settings: 'Hall or shimmer, 2.5s+, 25–40% wet',
      tips: 'Automate wet up on held screams; duck under drums.',
    },
  ]
  CHAINS.scream.industrial = screamMetal
  CHAINS.scream.pop_punk = screamMetal

  const cleanMetal = CHAINS.clean.metal
  for (const g of ['hardcore', 'shoegaze', 'industrial', 'pop_punk'] as VocalGenre[]) {
    if (!CHAINS.clean[g].length) CHAINS.clean[g] = [...cleanMetal]
  }

  const fryChain: ChainStep[] = [
    {
      order: 1,
      name: 'High-pass',
      purpose: 'Rumble control',
      settings: '90–120 Hz',
      tips: 'Fry is mid-focused; protect listener fatigue with breaks.',
    },
    {
      order: 2,
      name: 'Compressor',
      purpose: 'Sustain fry texture',
      settings: '6:1+, fast attack, medium release, 6–10 dB GR',
      tips: 'Parallel comp helps keep texture without overload.',
    },
    {
      order: 3,
      name: 'Multiband / dynamic EQ',
      purpose: 'Tame 2–4 kHz bark',
      settings: 'Gentle reduction on resonant bands',
      tips: 'Fry can spike harsh — automate if one line spikes.',
    },
    {
      order: 4,
      name: 'Saturation',
      purpose: 'Harmonic density',
      settings: 'Light drive on upper mids',
      tips: 'Do not confuse distortion with safe vocal technique — hydrate, rest.',
    },
    {
      order: 5,
      name: 'Short room reverb',
      purpose: 'Glue',
      settings: 'Small room, low wet',
      tips: 'Blend under guitars, not over.',
    },
  ]
  for (const g of Object.keys(CHAINS.fry) as VocalGenre[]) {
    CHAINS.fry[g] = fryChain
  }

  const rapChain: ChainStep[] = [
    {
      order: 1,
      name: 'High-pass',
      purpose: 'Clean low end',
      settings: '80 Hz',
      tips: 'Leave space for 808/sub in beat.',
    },
    {
      order: 2,
      name: 'Compressor',
      purpose: 'Consistent delivery',
      settings: '3:1, medium attack, auto release',
      tips: 'Stack two light comps instead of one heavy.',
    },
    {
      order: 3,
      name: 'EQ',
      purpose: 'Intelligibility',
      settings: 'Boost 2–5 kHz; cut 400 Hz if boxy',
      tips: 'Check on phone speakers — mids matter most.',
    },
    {
      order: 4,
      name: 'De-esser',
      purpose: 'Sibilance',
      settings: '6–9 kHz',
      tips: 'Essential on close-mic rap.',
    },
    {
      order: 5,
      name: 'Limiter (gentle)',
      purpose: 'Peak control',
      settings: '1–2 dB ceiling safety',
      tips: 'Save loudness for master bus.',
    },
  ]
  for (const g of Object.keys(CHAINS.rap) as VocalGenre[]) {
    CHAINS.rap[g] = rapChain
  }

  const whisperChain: ChainStep[] = [
    {
      order: 1,
      name: 'Noise gate (careful)',
      purpose: 'Room noise between phrases',
      settings: 'Threshold just below whisper, soft knee',
      tips: 'Avoid choking breaths — underground whispers need air.',
    },
    {
      order: 2,
      name: 'Compressor',
      purpose: 'Raise whisper level',
      settings: '4:1, slow attack, high gain reduction',
      tips: 'Expect noise floor to rise — treat room first.',
    },
    {
      order: 3,
      name: 'EQ',
      purpose: 'Presence',
      settings: 'Boost 4–8 kHz; cut lows',
      tips: 'Whispers sit behind guitars easily — automate up.',
    },
    {
      order: 4,
      name: 'Reverb',
      purpose: 'Mystery',
      settings: 'Dark hall, pre-delay 30 ms+',
      tips: 'High-pass reverb return at 200 Hz.',
    },
  ]
  for (const g of Object.keys(CHAINS.whisper) as VocalGenre[]) {
    CHAINS.whisper[g] = whisperChain
  }
}
fillChains()

const ENV_NOTES: Record<VocalEnvironment, string> = {
  bedroom: 'Bedroom: use reflection filter, heavy blankets, minimal room verbs. Noise floor is your enemy.',
  home_studio: 'Home studio: tune room with bass traps; use reference tracks at low volume.',
  pro_interface: 'Pro interface: gain-stage at 18–24 dBFS peak on input; leave headroom for processing.',
}

export function buildVocalChain(input: VocalChainInput): {
  steps: ChainStep[]
  environmentNote: string
} {
  const steps = CHAINS[input.style][input.genre] ?? CHAINS[input.style].metal
  return {
    steps,
    environmentNote: ENV_NOTES[input.environment],
  }
}

export const VOCAL_STYLES: { id: VocalStyle; label: string }[] = [
  { id: 'scream', label: 'Scream / harsh' },
  { id: 'fry', label: 'Fry / false chord' },
  { id: 'clean', label: 'Clean sung' },
  { id: 'rap', label: 'Rap / spoken rhythm' },
  { id: 'whisper', label: 'Whisper / spoken' },
]

export const VOCAL_GENRES: { id: VocalGenre; label: string }[] = [
  { id: 'metal', label: 'Metal' },
  { id: 'hardcore', label: 'Hardcore / metalcore' },
  { id: 'shoegaze', label: 'Shoegaze / blackgaze' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'pop_punk', label: 'Pop punk' },
]

export const VOCAL_ENVIRONMENTS: { id: VocalEnvironment; label: string }[] = [
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'home_studio', label: 'Home studio' },
  { id: 'pro_interface', label: 'Pro interface' },
]

export function formatVocalChainText(
  input: VocalChainInput,
  steps: ChainStep[],
  environmentNote: string
): string {
  const style = VOCAL_STYLES.find((s) => s.id === input.style)?.label ?? input.style
  const genre = VOCAL_GENRES.find((g) => g.id === input.genre)?.label ?? input.genre
  const lines = [
    `Vocal chain — ${style} (${genre})`,
    environmentNote,
    '',
    ...steps.map(
      (s) =>
        `${s.order}. ${s.name}\n   ${s.purpose}\n   Settings: ${s.settings}\n   Tip: ${s.tips}`
    ),
    '',
    'Educational guide only — not medical advice. Stop if you feel pain.',
  ]
  return lines.join('\n')
}
