import type { AcademyLesson } from '@/lib/academy/types'

export const MIXING_LESSONS: AcademyLesson[] = [
  {
    id: 'M1-01',
    slug: 'm1-01',
    trackSlug: 'mixing',
    title: 'Static mix first',
    duration: '15 min read',
    level: 'Beginner',
    summary: 'Balance faders, pan, and mute before opening an EQ or compressor.',
    outcome: 'You will build a musical balance that needs less corrective processing later.',
    infographic: 'static-mix',
    infographicTitle: 'Static mix balance map',
    sections: [
      {
        heading: 'What is a static mix?',
        body: 'A static mix uses only volume and pan (plus basic mute/solo decisions). No EQ, compression, or reverb yet. If it doesn’t feel close to finished now, plugins will only polish problems.',
      },
      {
        heading: 'Level hierarchy for heavy music',
        body: 'Decide what the listener must hear first. Usually: vocal or lead instrument, then kick/snare relationship, then guitars, then cymbals/ambience.',
        bullets: [
          'Lead vocal or riff should be clear at low volume',
          'Kick and bass felt in chest, not just heard on phones',
          'Cymbals support, not dominate',
        ],
      },
      {
        heading: 'Panning with purpose',
        body: 'Panning creates width and separation. Double-tracked guitars at L/R, hi-hat slightly off-center, bass and kick often center for mono compatibility.',
        bullets: [
          'Keep low end centered below ~120 Hz',
          'Hard-pan doubles, not main bass/kick',
          'Check mix in mono — collapse should still work',
        ],
      },
      {
        heading: 'Reference at conversation volume',
        body: 'Turn monitors quiet. If the chorus still pops and verse feels smaller, your balance is working. Loud playback hides balance mistakes.',
      },
    ],
    dos: [
      'Set a 2–3 minute time limit for static mix only',
      'Use one reference track in same genre',
      'Balance drums as a single instrument first',
    ],
    donts: [
      'Don’t open plugins until faders feel 80% right',
      'Don’t solo every track — context is truth',
      'Don’t pan randomly for “width” without mono check',
    ],
    practice: [
      { task: 'Mix one song using only faders and pan for 20 minutes.' },
      { task: 'Export static mix WAV and check peaks.', toolHref: '/tools/clipping', toolLabel: 'Clip Detector' },
      { task: 'Compare static mix vs rough master on phone speakers.' },
    ],
    takeaways: [
      'Faders first — plugins second',
      'Hierarchy: lead → drums → guitars → air',
      'Mono check saves club and phone playback',
    ],
  },
  {
    id: 'M1-02',
    slug: 'm1-02',
    trackSlug: 'mixing',
    title: 'EQ decision tree',
    duration: '22 min read',
    level: 'Beginner',
    summary: 'Subtractive EQ, frequency zones, and fixing masking between instruments.',
    outcome: 'You will cut problem frequencies before boosting and know where to listen.',
    infographic: 'eq-zones',
    infographicTitle: 'Mix frequency zones',
    sections: [
      {
        heading: 'Cut before boost',
        body: 'Removing energy in the wrong place creates space. Boosting adds energy where you might already have clutter. Student rule: find the problem frequency, cut narrow, then boost character if needed.',
      },
      {
        heading: 'Zone guide (starting points)',
        body: 'These are guides, not laws — always use ears.',
        bullets: [
          'Sub (20–60 Hz): kick sub weight, bass fundamentals — too much = muddy PA',
          'Low-mid (200–500 Hz): boxiness in guitars/vocals — common cut zone',
          'Mid (1–3 kHz): presence, snare crack, vocal intelligibility',
          'High-mid (3–6 kHz): aggression, pick attack, harshness risk',
          'Air (10k+): cymbals, breath, “brightness”',
        ],
      },
      {
        heading: 'Masking: kick vs bass',
        body: 'Kick and bass compete below 100 Hz. Choose roles: bass holds note, kick punches higher click. Sidechain or EQ carve so both are audible.',
      },
      {
        heading: 'Guitar mud in metal mixes',
        body: 'Multiple distorted guitars stack energy at 200–400 Hz. High-pass one layer, cut others differently, or spread roles (rhythm vs lead).',
      },
    ],
    dos: [
      'Sweep with narrow boost to find problem, then cut',
      'High-pass non-bass elements thoughtfully',
      'EQ in context — bypass often',
    ],
    donts: [
      'Don’t boost +6 dB on “presence” on every track',
      'Don’t use same EQ curve on all guitars',
      'Don’t ignore phase when layering similar tones',
    ],
    practice: [
      { task: 'High-pass all guitars above 80–100 Hz and compare in full mix.' },
      { task: 'Analyze a mix stem on spectrum tool.', toolHref: '/tools/spectrum', toolLabel: 'Frequency Analyzer' },
      { task: 'Write 3 cuts you made and why in session notes.' },
    ],
    takeaways: [
      'Subtractive EQ creates space',
      'Kick/bass need negotiated low end',
      '200–500 Hz is where mixes often get muddy',
    ],
  },
  {
    id: 'M1-03',
    slug: 'm1-03',
    trackSlug: 'mixing',
    title: 'Compression control',
    duration: '24 min read',
    level: 'Intermediate',
    summary: 'Threshold, ratio, attack, release — controlling dynamics without killing punch.',
    outcome: 'You will use compression for control and tone, not just to make things louder.',
    infographic: 'compressor',
    infographicTitle: 'Compressor parameters',
    sections: [
      {
        heading: 'What compression does',
        body: 'A compressor reduces the gap between loud and quiet. It makes performances more consistent and can add punch, sustain, or aggression depending on settings.',
      },
      {
        heading: 'Core controls',
        body: 'Learn these four first — everything else is variation.',
        bullets: [
          'Threshold: level where compression starts',
          'Ratio: how much gain reduction (4:1 = moderate, 10:1+ = limiting behavior)',
          'Attack: how fast compression grabs — slow = more transient punch',
          'Release: how fast it lets go — affects pumping vs natural decay',
        ],
      },
      {
        heading: 'Sources & starting ideas',
        body: 'Every source needs different treatment.',
        bullets: [
          'Vocals: medium ratio, auto release, 3–6 dB GR',
          'Drum bus: slow attack for transient, fast release for energy',
          'Bass: steady control, avoid pumping with kick',
          'Parallel crush: aggressive comp blended under dry signal',
        ],
      },
      {
        heading: 'Gain reduction meter',
        body: 'Watch GR (gain reduction), not just output gain. 2–6 dB on most elements is often enough. Constant 10 dB GR usually means you’re fighting a bad recording.',
      },
    ],
    dos: [
      'Match output level when bypassing (loudness bias)',
      'Use parallel compression on drums for weight',
      'Compress buses after individual tracks make sense',
    ],
    donts: [
      'Don’t compress already crushed samples harder',
      'Don’t max ratio on master while mixing',
      'Don’t ignore attack — it defines punch',
    ],
    practice: [
      { task: 'Compress snare with slow vs fast attack — note transient difference.' },
      { task: 'Build parallel drum crush bus at 20% blend.' },
      { task: 'Check vocal chain order ideas.', toolHref: '/tools/vocal-chain', toolLabel: 'Vocal Chain Builder' },
    ],
    takeaways: [
      'Attack shapes punch; release shapes feel',
      'Small GR often beats heavy squashing',
      'Parallel compression = power without losing transients',
    ],
  },
]
