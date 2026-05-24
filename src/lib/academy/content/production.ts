import type { AcademyLesson } from '@/lib/academy/types'

export const PRODUCTION_LESSONS: AcademyLesson[] = [
  {
    id: 'P1-01',
    slug: 'p1-01',
    trackSlug: 'production',
    title: 'Sound, dB, and digital audio',
    duration: '18 min read',
    level: 'Beginner',
    summary: 'Understand how sound becomes data — frequency, amplitude, sample rate, and bit depth.',
    outcome: 'You will read meters confidently and choose correct export settings before mixing.',
    infographic: 'waveform-db',
    infographicTitle: 'Waveform → numbers engineers use',
    sections: [
      {
        heading: 'What sound actually is',
        body: 'Sound is pressure moving through air. Your microphone converts that movement into an electrical signal; your DAW converts it into numbers. Everything you do in production is shaping those numbers without clipping them.',
        bullets: [
          'Higher frequency (Hz) = higher pitch',
          'Higher amplitude = louder',
          'Phase relationships affect how layers add together',
        ],
      },
      {
        heading: 'dB and dBFS (why meters matter)',
        body: 'Decibels are relative units — we compare levels to a reference. In digital audio, dBFS means “decibels relative to full scale.” 0 dBFS is the maximum your file can hold before distortion.',
        bullets: [
          '−24 to −18 dBFS: healthy recording level for many sources',
          '−12 to −6 dBFS: loud peaks, still safe if brief',
          '0 dBFS: digital ceiling — clipping begins',
        ],
      },
      {
        heading: 'Sample rate & bit depth',
        body: 'Sample rate is how many snapshots per second (44.1 kHz = CD era standard, 48 kHz = video/film). Bit depth is how finely each snapshot is measured (16-bit delivery, 24-bit recording/mixing).',
        bullets: [
          'Record and mix at 24-bit / 48 kHz for modern workflows',
          'Export masters at 44.1 or 48 kHz depending on platform',
          'Higher sample rate ≠ automatically better song',
        ],
      },
      {
        heading: 'Headroom habit (student rule)',
        body: 'Leave space at the top of your meter. If every track kisses 0 dBFS while recording, you have nowhere to go when you add EQ, compression, and saturation.',
        bullets: [
          'Aim for peaks around −12 to −6 dBFS on individual tracks',
          'Use gain staging before heavy processing',
          'If meters turn red, lower input gain — don’t “fix in mastering”',
        ],
      },
    ],
    dos: [
      'Check input gain on every track before recording',
      'Use 24-bit recording when your interface supports it',
      'Learn one meter type (peak + RMS) and stick with it',
    ],
    donts: [
      'Don’t record hot just because “louder feels better”',
      'Don’t confuse Spotify loudness with recording level',
      'Don’t ignore clipping on individual tracks',
    ],
    practice: [
      { task: 'Import any WAV and read peak + duration in the format checker.', toolHref: '/tools/audio-format', toolLabel: 'Sample Rate Checker' },
      { task: 'Record 30 seconds of guitar or vocals and keep peaks below −6 dBFS.' },
      { task: 'Write down your project sample rate and bit depth in your session notes.' },
    ],
    takeaways: [
      'dBFS is your digital ceiling — respect it early',
      '48 kHz / 24-bit is a safe student default',
      'Headroom at recording = easier mix later',
    ],
  },
  {
    id: 'P1-02',
    slug: 'p1-02',
    trackSlug: 'production',
    title: 'DAW signal flow map',
    duration: '16 min read',
    level: 'Beginner',
    summary: 'Tracks, buses, sends, returns, and the master — how audio actually moves in your session.',
    outcome: 'You will route drums, vocals, and FX without creating feedback loops or muddy summing.',
    infographic: 'signal-flow',
    infographicTitle: 'Session signal flow (top → bottom)',
    sections: [
      {
        heading: 'The basic path',
        body: 'Audio flows from source → channel strip (plugins) → mix bus → master → output. Think of it like plumbing: one wrong connection and everything downstream gets messy.',
        bullets: [
          'Channel = one instrument or layer',
          'Bus = group of channels summed together',
          'Master = final stereo output of the mix',
        ],
      },
      {
        heading: 'Sends vs inserts',
        body: 'An insert is on the channel itself (EQ directly on vocal). A send taps a copy of the signal to another path (reverb on aux). Sends let multiple tracks share one effect.',
        bullets: [
          'Insert: 100% of signal through the plugin chain',
          'Send: blend dry channel + wet return',
          'Pre-fader send: level unaffected by channel fader',
        ],
      },
      {
        heading: 'Bus grouping for metal & heavy music',
        body: 'Group related elements so you can process them together. Typical groups: drums bus, guitars bus, bass bus, vocals bus, FX returns.',
        bullets: [
          'Drum bus glue compression can unify kick/snare',
          'Double-tracked guitars often benefit from bus EQ',
          'Keep bass and kick relationship on one reference bus if needed',
        ],
      },
      {
        heading: 'Gain staging between stages',
        body: 'After every plugin or bus, check level. A common student mistake is stacking plugins that each add +3 dB until the master clips.',
        bullets: [
          'Use trim/gain plugins between stages',
          'Aim for consistent peak around −12 dBFS at bus outputs',
          'Solo less — listen in context of full mix',
        ],
      },
    ],
    dos: [
      'Name tracks and color-code buses',
      'Template: drums / bass / guitars / vocals / FX',
      'Check master meter after every major routing change',
    ],
    donts: [
      'Don’t send everything to one reverb at 100% wet',
      'Don’t duplicate channels without a reason (CPU + phase issues)',
      'Don’t master limiter on while mixing (save for mastering stage)',
    ],
    practice: [
      { task: 'Draw your current session routing on paper — match it in the DAW.' },
      { task: 'Create a drum bus and guitar bus; balance with only bus faders.' },
      { task: 'Use spectrum tool on drum bus vs full mix to see energy shift.', toolHref: '/tools/spectrum', toolLabel: 'Frequency Analyzer' },
    ],
    takeaways: [
      'Inserts shape the source; sends share space',
      'Buses = control + glue for groups',
      'Gain staging is a habit, not a one-time fix',
    ],
  },
  {
    id: 'P1-03',
    slug: 'p1-03',
    trackSlug: 'production',
    title: 'Arrangement blueprint',
    duration: '20 min read',
    level: 'Beginner',
    summary: 'Structure songs with tension, release, and energy — before you chase mix tricks.',
    outcome: 'You will plan intros, verses, choruses, and bridges so mixes have natural dynamics.',
    infographic: 'arrangement',
    infographicTitle: 'Section energy map',
    sections: [
      {
        heading: 'Arrangement vs production',
        body: 'Production is sound design and capture; arrangement is when elements enter, exit, and how dense the track feels. A weak arrangement forces the mix engineer to “save” a flat song with EQ and compression.',
      },
      {
        heading: 'Section roles',
        body: 'Each section should have a job. Intro sets world, verse tells story, chorus delivers payoff, bridge adds contrast, outro releases tension.',
        bullets: [
          'Verse: fewer elements, leave space for vocals',
          'Chorus: full stack — doubles, harmonies, wide guitars',
          'Bridge: change chord color or rhythm, not random FX',
        ],
      },
      {
        heading: 'Density & frequency slots',
        body: 'Only one element should own each slot at a time. If synth pad, rhythm guitar, and vocals fight at 2–4 kHz, no mix trick fully fixes it.',
        bullets: [
          'Kick + bass = low slot (coordinate notes and sidechain)',
          'Guitars = mid aggression',
          'Cymbals / air = top slot',
        ],
      },
      {
        heading: 'Transitions students forget',
        body: 'Risers, drum fills, reverse swells, and half-bar drops tell the listener “something changed.” In heavy music, silence is also a transition.',
        bullets: [
          'Filter sweep into chorus',
          'Double-time hats before drop',
          'Mute guitars for one beat before breakdown',
        ],
      },
    ],
    dos: [
      'Map sections on timeline with markers',
      'Mute layers to test if chorus still hits',
      'Reference a song you love — count layers per section',
    ],
    donts: [
      'Don’t add tracks until chorus feels “big enough” without plan',
      'Don’t stack 8 guitar tracks without panning/role plan',
      'Don’t mix before arrangement is 80% locked',
    ],
    practice: [
      { task: 'Mark verse/chorus/bridge in your DAW and list active instruments per section.' },
      { task: 'Remove one layer from chorus — notice if energy drops or improves.' },
      { task: 'Build a chord progression for verse vs chorus.', toolHref: '/tools/chords', toolLabel: 'Chord Generator' },
    ],
    takeaways: [
      'Arrangement creates contrast — mixing enhances it',
      'Each section needs fewer, clearer roles',
      'Plan transitions as deliberately as riffs',
    ],
  },
]
