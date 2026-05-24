import type { AcademyLesson } from '@/lib/academy/types'

export const MASTERING_LESSONS: AcademyLesson[] = [
  {
    id: 'MB1-01',
    slug: 'mb1-01',
    trackSlug: 'mastering',
    title: 'Mastering chain basics',
    duration: '17 min read',
    level: 'Beginner',
    summary: 'Order of operations: corrective EQ, gentle compression, limiting last.',
    outcome: 'You will assemble a simple mastering chain that polishes without destroying the mix.',
    infographic: 'master-chain',
    infographicTitle: 'Mastering chain order',
    sections: [
      {
        heading: 'Mix vs master',
        body: 'Mixing fixes individual elements and balance. Mastering optimizes the stereo file for distribution — translation, loudness, and format. Don’t fix a bad mix with mastering.',
      },
      {
        heading: 'Typical chain order',
        body: 'Start minimal. Each step should have a clear job.',
        bullets: [
          '1. Gain trim — hit sweet spot into chain',
          '2. Corrective EQ — wide, gentle cuts only',
          '3. Bus compression — glue, 1–2 dB GR',
          '4. Limiting — ceiling and loudness target',
          '5. Dither — only when reducing bit depth',
        ],
      },
      {
        heading: 'What mastering should not do',
        body: 'If you need huge EQ boosts or 15 dB of limiting to make the mix work, return to the mix session.',
      },
      {
        heading: 'Heavy music specifics',
        body: 'Preserve transient impact. Over-limiting removes punch from kick and snare. Aim for competitive loudness but keep crest factor (dynamic range) alive.',
      },
    ],
    dos: [
      'Master from a mix bounce with headroom (−6 dBFS peak or more)',
      'A/B with reference at matched loudness',
      'Take breaks — ear fatigue is real',
    ],
    donts: [
      'Don’t master with limiter on mix bus still active',
      'Don’t chase loudness over tone',
      'Don’t skip true peak safety',
    ],
    practice: [
      { task: 'Build a 4-plugin master chain template and document each setting.' },
      { task: 'Master one mix twice — gentle vs aggressive — compare on earbuds.' },
    ],
    takeaways: [
      'Mastering polishes; mixing solves balance',
      'Limiter is last — not first',
      'Heavy music needs transients to survive limiting',
    ],
  },
  {
    id: 'MB1-02',
    slug: 'mb1-02',
    trackSlug: 'mastering',
    title: 'Loudness & crest factor',
    duration: '19 min read',
    level: 'Intermediate',
    summary: 'RMS, perceived loudness, and why squashed masters fatigue listeners.',
    outcome: 'You will set loudness targets with meters and understand streaming normalization.',
    infographic: 'loudness',
    infographicTitle: 'Loudness vs dynamics',
    sections: [
      {
        heading: 'Peak vs RMS vs LUFS',
        body: 'Peak is the tallest spike. RMS is average energy over time. LUFS (used by streaming) measures perceived loudness over a window. Students should know all three mean different things.',
      },
      {
        heading: 'Crest factor',
        body: 'Crest factor is peak minus RMS — how “punchy” vs “flat” a signal is. High crest = dynamic. Low crest = brickwalled. Metal can be loud but still needs transient crest on drums.',
      },
      {
        heading: 'Streaming normalization',
        body: 'Spotify/Apple turn loud masters down; quiet masters up. Extreme loudness no longer wins — tone and clarity do. Master for translation, not maximum meter.',
      },
      {
        heading: 'Practical targets (guides)',
        body: 'Genre and artist vary — use references.',
        bullets: [
          'Leave 0.5–1 dB true peak headroom for codec safety',
          'Compare RMS/LUFS to 2–3 released references in genre',
          'If cymbals sound flat, you limited too hard',
        ],
      },
    ],
    dos: [
      'Measure loudness before and after limiting',
      'Keep reference tracks at same loudness for A/B',
      'Check master on phone, laptop, and one good speaker',
    ],
    donts: [
      'Don’t trust only your DAW peak meter',
      'Don’t ignore true peak on export',
      'Don’t master tired ears at 2 AM without refresh',
    ],
    practice: [
      { task: 'Run loudness meter on mix and master.', toolHref: '/tools/loudness', toolLabel: 'Loudness Meter' },
      { task: 'Note crest factor change after limiter — write numbers down.' },
      { task: 'Compare your master LUFS to one commercial reference.' },
    ],
    takeaways: [
      'Loudness ≠ better — translation wins',
      'Crest factor = life in drums and guitars',
      'Streaming normalizes — mix for tone',
    ],
  },
  {
    id: 'MB1-03',
    slug: 'mb1-03',
    trackSlug: 'mastering',
    title: 'Export & delivery QC',
    duration: '18 min read',
    level: 'Beginner',
    summary: 'File formats, true peak, metadata, and pre-release checklist.',
    outcome: 'You will deliver masters that distributors and editors accept without technical rejection.',
    infographic: 'export-qc',
    infographicTitle: 'Delivery checklist flow',
    sections: [
      {
        heading: 'Bounce settings',
        body: 'Export WAV or FLAC for archival and distribution upload. MP3/AAC are often created by the distributor from your lossless file.',
        bullets: [
          'Stereo interleaved',
          '44.1 kHz or 48 kHz as required',
          '24-bit WAV common; 16-bit only if specified',
        ],
      },
      {
        heading: 'True peak & clipping',
        body: 'Inter-sample peaks can clip on conversion to MP3. Leave headroom and use true peak limiting. Scan final file before upload.',
      },
      {
        heading: 'Metadata basics',
        body: 'Title, artist, album, year, ISRC (for singles), credits. Cover art 3000×3000 JPG. Match spelling across platforms.',
      },
      {
        heading: 'Final QC ritual',
        body: 'Listen start-to-finish without touching mouse. Note clicks, fades, wrong track order, silence at start. One tired listen catches what meters miss.',
      },
    ],
    dos: [
      'Keep mix project + master project archived',
      'Run clip detector on final WAV',
      'Use export checklist every release',
    ],
    donts: [
      'Don’t re-encode MP3 → MP3',
      'Don’t ship with long silence at track start',
      'Don’t skip mono compatibility check',
    ],
    practice: [
      { task: 'Verify sample rate and bit depth on master WAV.', toolHref: '/tools/audio-format', toolLabel: 'Format Checker' },
      { task: 'Complete export checklist for a test bounce.', toolHref: '/tools/export-checklist', toolLabel: 'Export Checklist' },
      { task: 'Scan master for clipped samples.', toolHref: '/tools/clipping', toolLabel: 'Clip Detector' },
    ],
    takeaways: [
      'Lossless master is your source of truth',
      'True peak safety prevents codec clipping',
      'Checklist beats memory on release day',
    ],
  },
]
