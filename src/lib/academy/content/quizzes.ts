import type { AcademyQuiz } from '@/lib/academy/types'

export const ACADEMY_QUIZZES: AcademyQuiz[] = [
  {
    id: 'Q-PROD',
    slug: 'production',
    trackSlug: 'production',
    title: 'Production Fundamentals Quiz',
    description: 'Check dB, signal flow, and arrangement basics from Phase 1.',
    passPercent: 70,
    questions: [
      {
        id: 'q-p1',
        prompt: 'What does 0 dBFS mean in digital audio?',
        options: [
          { id: 'a', text: 'The quietest possible signal' },
          { id: 'b', text: 'The maximum level before digital clipping' },
          { id: 'c', text: 'The same as LUFS on Spotify' },
          { id: 'd', text: 'Analog tape saturation point' },
        ],
        correctId: 'b',
        explanation:
          '0 dBFS is full scale in the digital domain — the ceiling. Peaks at 0 dBFS clip. Recording with headroom below that keeps your mix flexible.',
      },
      {
        id: 'q-p2',
        prompt: 'A send on a vocal channel is best described as…',
        options: [
          { id: 'a', text: '100% of the signal through one plugin chain on the channel' },
          { id: 'b', text: 'A copy of the signal routed to another path (e.g. reverb aux)' },
          { id: 'c', text: 'The master fader' },
          { id: 'd', text: 'A MIDI-only connection' },
        ],
        correctId: 'b',
        explanation:
          'Sends tap audio to aux/return paths so multiple tracks share one effect. Inserts process the whole channel inline.',
      },
      {
        id: 'q-p3',
        prompt: 'A healthy default for recording bit depth in modern workflows is…',
        options: [
          { id: 'a', text: '8-bit' },
          { id: 'b', text: '16-bit only, never higher' },
          { id: 'c', text: '24-bit' },
          { id: 'd', text: '32-bit float delivery file for streaming' },
        ],
        correctId: 'c',
        explanation:
          '24-bit recording gives low noise floor and headroom. Final delivery is often 16- or 24-bit depending on platform — not the same as session bit depth.',
      },
      {
        id: 'q-p4',
        prompt: 'Why leave headroom when recording individual tracks?',
        options: [
          { id: 'a', text: 'So you can add EQ, compression, and bus processing without clipping' },
          { id: 'b', text: 'Because streaming requires silent intros' },
          { id: 'c', text: 'To make the file smaller' },
          { id: 'd', text: 'Headroom only matters on the master, never on tracks' },
        ],
        correctId: 'a',
        explanation:
          'Stacked processing adds level. If every track is already near 0 dBFS, the mix bus clips before you finish balancing.',
      },
      {
        id: 'q-p5',
        prompt: 'In arrangement, the chorus is usually…',
        options: [
          { id: 'a', text: 'The lowest-energy section' },
          { id: 'b', text: 'The main payoff section with higher energy than verses' },
          { id: 'c', text: 'Always the first 8 bars' },
          { id: 'd', text: 'Where you remove drums entirely' },
        ],
        correctId: 'b',
        explanation:
          'Choruses carry hook and energy. Verses and bridges create contrast so the chorus hits harder — a core production arrangement idea.',
      },
    ],
  },
  {
    id: 'Q-MIX',
    slug: 'mixing',
    trackSlug: 'mixing',
    title: 'Mixing Essentials Quiz',
    description: 'Balance, EQ zones, and compression from Phase 1.',
    passPercent: 70,
    questions: [
      {
        id: 'q-m1',
        prompt: 'Static mix means…',
        options: [
          { id: 'a', text: 'Balance with faders and pan before heavy processing' },
          { id: 'b', text: 'Export without mastering' },
          { id: 'c', text: 'Only mono playback' },
          { id: 'd', text: 'Mixing with all plugins bypassed forever' },
        ],
        correctId: 'a',
        explanation:
          'Get level and pan relationships right first. Plugins polish a balance — they rarely fix a broken static mix.',
      },
      {
        id: 'q-m2',
        prompt: 'Cutting 300–500 Hz on guitars often helps because…',
        options: [
          { id: 'a', text: 'It adds sub bass' },
          { id: 'b', text: 'It reduces boxiness and leaves room for bass and kick' },
          { id: 'c', text: 'It increases loudness on streaming' },
          { id: 'd', text: 'It removes all need for compression' },
        ],
        correctId: 'b',
        explanation:
          'Low-mid buildup makes mixes muddy. Surgical cuts in the guitar bus open space for kick, bass, and vocals.',
      },
      {
        id: 'q-m3',
        prompt: 'Compressor threshold sets…',
        options: [
          { id: 'a', text: 'When compression begins to react to the signal' },
          { id: 'b', text: 'The song BPM' },
          { id: 'c', text: 'Pan position' },
          { id: 'd', text: 'Reverb predelay only' },
        ],
        correctId: 'a',
        explanation:
          'When level crosses threshold, gain reduction applies (based on ratio, attack, release). Threshold is where the compressor “wakes up.”',
      },
      {
        id: 'q-m4',
        prompt: 'Fast attack on a drum bus often…',
        options: [
          { id: 'a', text: 'Preserves transients by ignoring peaks' },
          { id: 'b', text: 'Reduces punch by clamping transients quickly' },
          { id: 'c', text: 'Removes need for kick mic' },
          { id: 'd', text: 'Only works on vocals' },
        ],
        correctId: 'b',
        explanation:
          'Fast attack catches peaks — can reduce punch. Slower attack lets transients through before compression grips the tail.',
      },
      {
        id: 'q-m5',
        prompt: 'Before adding EQ, you should ideally…',
        options: [
          { id: 'a', text: 'Solo one track for the entire session' },
          { id: 'b', text: 'Have a rough fader/pan balance in context of the full mix' },
          { id: 'c', text: 'Put a limiter on the master at 0 dB' },
          { id: 'd', text: 'Delete all sends' },
        ],
        correctId: 'b',
        explanation:
          'EQ decisions in context prevent “solo hero” tracks that disappear in the full mix. Static balance first.',
      },
    ],
  },
  {
    id: 'Q-MAST',
    slug: 'mastering',
    trackSlug: 'mastering',
    title: 'Mastering Basics Quiz',
    description: 'Chain order, loudness, and export QC.',
    passPercent: 70,
    questions: [
      {
        id: 'q-b1',
        prompt: 'The limiter in a mastering chain usually comes…',
        options: [
          { id: 'a', text: 'First, before EQ' },
          { id: 'b', text: 'Last, after corrective EQ and gentle bus compression' },
          { id: 'c', text: 'Only on individual tracks' },
          { id: 'd', text: 'Before the mix is bounced' },
        ],
        correctId: 'b',
        explanation:
          'Limiting sets ceiling and loudness last. Corrective moves and glue compression come before the limiter.',
      },
      {
        id: 'q-b2',
        prompt: 'LUFS roughly measures…',
        options: [
          { id: 'a', text: 'Perceived loudness over time' },
          { id: 'b', text: 'Only the highest peak' },
          { id: 'c', text: 'Microphone polar pattern' },
          { id: 'd', text: 'MIDI note velocity' },
        ],
        correctId: 'a',
        explanation:
          'LUFS is used by streaming for loudness normalization. Peak and RMS tell other parts of the story.',
      },
      {
        id: 'q-b3',
        prompt: 'If your mix needs 15 dB of limiting to sound loud enough, you should…',
        options: [
          { id: 'a', text: 'Add more limiting on the master' },
          { id: 'b', text: 'Return to the mix session and fix balance' },
          { id: 'c', text: 'Delete the drums' },
          { id: 'd', text: 'Export at 8-bit' },
        ],
        correctId: 'b',
        explanation:
          'Mastering polishes; it does not fix broken balances. Excessive limiting destroys transients — especially in heavy music.',
      },
      {
        id: 'q-b4',
        prompt: 'Crest factor describes…',
        options: [
          { id: 'a', text: 'Difference between peak and average level (punch vs squash)' },
          { id: 'b', text: 'Sample rate' },
          { id: 'c', text: 'Number of tracks' },
          { id: 'd', text: 'Album artwork DPI' },
        ],
        correctId: 'a',
        explanation:
          'High crest = more dynamic punch. Heavy limiting lowers crest — loud but flat. Metal still needs some crest on drums.',
      },
      {
        id: 'q-b5',
        prompt: 'True peak limiting helps prevent…',
        options: [
          { id: 'a', text: 'Inter-sample peaks that clip on some playback systems' },
          { id: 'b', text: 'Vocal tuning issues' },
          { id: 'c', text: 'Wrong key signature' },
          { id: 'd', text: 'Copyright claims' },
        ],
        correctId: 'a',
        explanation:
          'Digital peaks between samples can clip after conversion. True peak aware limiting is part of safe export QC.',
      },
    ],
  },
  {
    id: 'Q-REC',
    slug: 'recording',
    trackSlug: 'recording',
    title: 'Recording Studio Quiz',
    description: 'Mics, rooms, and doubles from Phase 2.',
    passPercent: 70,
    questions: [
      {
        id: 'q-r1',
        prompt: 'A dynamic mic is often chosen for…',
        options: [
          { id: 'a', text: 'Quiet room vocals needing air' },
          { id: 'b', text: 'Loud guitar cabs and snare — handles level and rejects room' },
          { id: 'c', text: 'Only MIDI instruments' },
          { id: 'd', text: 'Mastering limiter' },
        ],
        correctId: 'b',
        explanation:
          'Dynamics handle SPL and are forgiving in imperfect rooms. Condensers shine on detail when gain and room are managed.',
      },
      {
        id: 'q-r2',
        prompt: 'Moving a directional mic closer to the source generally…',
        options: [
          { id: 'a', text: 'Increases bass proximity effect and reduces room sound' },
          { id: 'b', text: 'Removes all need for tuning' },
          { id: 'c', text: 'Lowers risk of clipping automatically' },
          { id: 'd', text: 'Makes the track mono-only' },
        ],
        correctId: 'a',
        explanation:
          'Distance is EQ. Close = more low end and less room; far = more room and often more air.',
      },
      {
        id: 'q-r3',
        prompt: 'First reflection points in a room are…',
        options: [
          { id: 'a', text: 'Early reflections that smear imaging' },
          { id: 'b', text: 'The master bus' },
          { id: 'c', text: 'Only subwoofer locations' },
          { id: 'd', text: 'MIDI clock dividers' },
        ],
        correctId: 'a',
        explanation:
          'Sound bouncing off desk, side walls, and ceiling reaches your ears quickly and confuses stereo image — treat or absorb where practical.',
      },
      {
        id: 'q-r4',
        prompt: 'Copy-paste one guitar take to both L and R…',
        options: [
          { id: 'a', text: 'Sounds wider than real doubles' },
          { id: 'b', text: 'Collapses to mono and sounds thin — not true double tracking' },
          { id: 'c', text: 'Is the professional standard' },
          { id: 'd', text: 'Fixes phase automatically' },
        ],
        correctId: 'b',
        explanation:
          'Real doubles need different performances or tones. Duplicate clips pan hard = phase issues and no width.',
      },
      {
        id: 'q-r5',
        prompt: 'Recording a clean DI lets you…',
        options: [
          { id: 'a', text: 'Reamp later through amp/sim with the same performance' },
          { id: 'b', text: 'Skip tuning entirely' },
          { id: 'c', text: 'Avoid setting input gain' },
          { id: 'd', text: 'Export only MP3' },
        ],
        correctId: 'a',
        explanation:
          'DI is your safety net for tone changes. Keep it clean and unclipped; reamp level carefully back into the interface.',
      },
    ],
  },
  {
    id: 'Q-GEN',
    slug: 'genres',
    trackSlug: 'genres',
    title: 'Genre Labs Quiz',
    description: 'Metal, industrial, and cinematic concepts from Phase 2.',
    passPercent: 70,
    questions: [
      {
        id: 'q-g1',
        prompt: 'In metal mixing, a common low-end strategy is…',
        options: [
          { id: 'a', text: 'Boost kick and bass in the same sub band without planning' },
          { id: 'b', text: 'Decide whether kick or bass “owns” sub and carve the other' },
          { id: 'c', text: 'Remove all drums' },
          { id: 'd', text: 'Pan bass hard left' },
        ],
        correctId: 'b',
        explanation:
          'Kick and bass fighting in sub is the #1 student metal problem. Choose an owner and carve space.',
      },
      {
        id: 'q-g2',
        prompt: 'Industrial production still needs…',
        options: [
          { id: 'a', text: 'Rhythmic pulse and arrangement contrast' },
          { id: 'b', text: 'No drums ever' },
          { id: 'c', text: 'Constant full-spectrum white noise at 0 dB' },
          { id: 'd', text: 'Only acoustic instruments' },
        ],
        correctId: 'a',
        explanation:
          'Noise and distortion are tools — groove and dynamics keep listeners engaged. Chaos without pulse loses the room.',
      },
      {
        id: 'q-g3',
        prompt: 'To push a sound “far back” in a cinematic mix, you often…',
        options: [
          { id: 'a', text: 'Add more reverb, soften transients, and reduce presence' },
          { id: 'b', text: 'Remove all reverb and boost 5 kHz' },
          { id: 'c', text: 'Pan hard left only' },
          { id: 'd', text: 'Clip the master' },
        ],
        correctId: 'a',
        explanation:
          'Depth = level + tone + space. Distant sounds are wetter, darker, and softer in attack.',
      },
      {
        id: 'q-g4',
        prompt: 'High-passing reverb returns helps…',
        options: [
          { id: 'a', text: 'Keep low-end clear and reduce mud' },
          { id: 'b', text: 'Increase sub rumble' },
          { id: 'c', text: 'Remove vocals' },
          { id: 'd', text: 'Raise LUFS automatically' },
        ],
        correctId: 'a',
        explanation:
          'Reverb mud lives in lows. Filter returns so space sits above kick/bass foundation.',
      },
      {
        id: 'q-g5',
        prompt: 'Before mastering a cinematic track, you should…',
        options: [
          { id: 'a', text: 'Leave some master headroom after automation and spatial design' },
          { id: 'b', text: 'Brickwall at 0 dB on the mix bus' },
          { id: 'c', text: 'Delete all reverbs' },
          { id: 'd', text: 'Convert to mono only' },
        ],
        correctId: 'a',
        explanation:
          'Dynamic arcs need room. Squashing on the mix bus before mastering limits expression and punch.',
      },
    ],
  },
  {
    id: 'Q-EAR',
    slug: 'ear-training',
    trackSlug: 'ear-training',
    title: 'Ear Training Quiz',
    description: 'Frequency, dynamics, and reference listening from Phase 3.',
    passPercent: 70,
    questions: [
      {
        id: 'q-e1',
        prompt: 'Mud in a dense mix often builds in which range first?',
        options: [
          { id: 'a', text: '200–500 Hz (low-mids)' },
          { id: 'b', text: '10–20 Hz only' },
          { id: 'c', text: '12 kHz air band' },
          { id: 'd', text: 'MIDI velocity layer' },
        ],
        correctId: 'a',
        explanation:
          'Guitars, keys, and room tone stack in low-mids. That is the classic student “mud zone” before you touch highs.',
      },
      {
        id: 'q-e2',
        prompt: 'Fast compressor attack on drums often…',
        options: [
          { id: 'a', text: 'Reduces transient punch' },
          { id: 'b', text: 'Adds sub bass automatically' },
          { id: 'c', text: 'Fixes wrong BPM' },
          { id: 'd', text: 'Replaces panning' },
        ],
        correctId: 'a',
        explanation:
          'Fast attack clamps peaks quickly — can dull kick/snare hit. Slower attack lets transients through.',
      },
      {
        id: 'q-e3',
        prompt: 'Reference A/B must be…',
        options: [
          { id: 'a', text: 'Level-matched before judging tone' },
          { id: 'b', text: 'Louder than your mix to win' },
          { id: 'c', text: 'Done only on phone speaker' },
          { id: 'd', text: 'Skipped in metal genres' },
        ],
        correctId: 'a',
        explanation:
          'Louder sounds better. Match perceived loudness, then compare balance and tone.',
      },
      {
        id: 'q-e4',
        prompt: 'The Ear Lab frequency drill trains…',
        options: [
          { id: 'a', text: 'Identifying low, mid, and high tones by ear' },
          { id: 'b', text: 'Mastering for vinyl only' },
          { id: 'c', text: 'Copyright registration' },
          { id: 'd', text: 'MIDI clock sync' },
        ],
        correctId: 'a',
        explanation:
          'Pure tones at different Hz build band recognition — the same zones you cut and boost in EQ.',
      },
      {
        id: 'q-e5',
        prompt: 'Parallel compression helps because…',
        options: [
          { id: 'a', text: 'It blends crushed signal under dry transients' },
          { id: 'b', text: 'It removes need for drums' },
          { id: 'c', text: 'It converts stereo to mono' },
          { id: 'd', text: 'It raises sample rate' },
        ],
        correctId: 'a',
        explanation:
          'Heavy crush on a send + dry drums = density without losing all attack.',
      },
    ],
  },
  {
    id: 'Q-REL',
    slug: 'release',
    trackSlug: 'release',
    title: 'Release & Delivery Quiz',
    description: 'Timeline, metadata, and distribution from Phase 3.',
    passPercent: 70,
    questions: [
      {
        id: 'q-l1',
        prompt: 'A release master should typically be delivered as…',
        options: [
          { id: 'a', text: 'High-quality WAV (44.1/48 kHz, 16/24-bit per distributor rules)' },
          { id: 'b', text: '128 kbps MP3 only' },
          { id: 'c', text: 'MIDI file' },
          { id: 'd', text: 'Ableton project only' },
        ],
        correctId: 'a',
        explanation:
          'Distributors want lossless masters. MP3 may be derived by the store — check your aggregator specs.',
      },
      {
        id: 'q-l2',
        prompt: 'ISRC identifies…',
        options: [
          { id: 'a', text: 'A specific recording version' },
          { id: 'b', text: 'Album artwork DPI' },
          { id: 'c', text: 'Microphone polar pattern' },
          { id: 'd', text: 'DAW undo history' },
        ],
        correctId: 'a',
        explanation:
          'International Standard Recording Code tracks recordings across platforms. Keep records in a spreadsheet.',
      },
      {
        id: 'q-l3',
        prompt: 'Uploading 48 hours before street date helps…',
        options: [
          { id: 'a', text: 'Store propagation and QC time' },
          { id: 'b', text: 'Avoid mastering entirely' },
          { id: 'c', text: 'Remove metadata requirements' },
          { id: 'd', text: 'Skip artwork' },
        ],
        correctId: 'a',
        explanation:
          'Stores need processing time. Early upload lets you fix rejections before fans see broken links.',
      },
      {
        id: 'q-l4',
        prompt: 'Filename best practice for masters is…',
        options: [
          { id: 'a', text: 'Artist_Song_MASTER_v01.wav with version numbers' },
          { id: 'b', text: 'final_FINAL2.wav with no artist name' },
          { id: 'c', text: 'untitled.wav' },
          { id: 'd', text: 'Random strings only' },
        ],
        correctId: 'a',
        explanation:
          'Clear naming prevents overwriting the wrong bounce and helps collaborators.',
      },
      {
        id: 'q-l5',
        prompt: 'Post-release you should…',
        options: [
          { id: 'a', text: 'Verify live store links and archive project files' },
          { id: 'b', text: 'Delete all project files immediately' },
          { id: 'c', text: 'Never check Spotify profile' },
          { id: 'd', text: 'Change ISRC weekly' },
        ],
        correctId: 'a',
        explanation:
          'QC live listings and archive masters/projects for portfolio and future remixes.',
      },
    ],
  },
]
