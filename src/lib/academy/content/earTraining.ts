import type { AcademyLesson } from '@/lib/academy/types'

export const EAR_TRAINING_LESSONS: AcademyLesson[] = [
  {
    id: 'E3-01',
    slug: 'e3-01',
    trackSlug: 'ear-training',
    title: 'Hearing frequency bands',
    duration: '19 min read',
    level: 'Beginner',
    summary: 'Train your ears to separate low, mid, and high energy — the foundation of mixing decisions.',
    outcome:
      'You will identify muddy lows, harsh mids, and brittle highs without opening an analyzer first.',
    videos: [
      { title: 'Video 1 · Frequency bands overview', youtubeId: 'xF2iKVS88kU' },
      { title: 'Video 2 · EQ hearing fundamentals', youtubeId: 'SAWp7LXrbZ8' },
      { title: 'Video 3 · Low-mid & mud', youtubeId: 'lrx7w93hH6U' },
      { title: 'Video 4 · Midrange & presence', youtubeId: '0fckQLQWhe0' },
      { title: 'Video 5 · Highs & air', youtubeId: 'NUQUpiEF8j0' },
    ],
    infographic: 'frequency-bands',
    infographicTitle: 'Three zones every mix engineer uses',
    sections: [
      {
        heading: 'Why bands matter more than “more EQ”',
        body: 'Students often boost treble when the real problem is 300 Hz buildup. Frequency bands are a language: sub/bass (20–120 Hz), body/low-mids (120–500 Hz), presence (500 Hz–4 kHz), air (4 kHz+).',
        bullets: [
          'Low: kick foundation, bass weight, rumble',
          'Mid: vocals, guitars, snare body, mud zone',
          'High: cymbals, sibilance, brightness, hiss',
        ],
      },
      {
        heading: 'Listening drill method',
        body: 'Use the Ear Lab to play pure tones. Close your eyes, guess the band, then check. Ten minutes daily beats one long session monthly.',
        bullets: [
          'Start quiet — fatigue makes everything sound bright',
          'Use headphones first, then verify on speakers',
          'Log mistakes — your ears have patterns',
        ],
      },
      {
        heading: 'Connecting bands to tools',
        body: 'Spectrum analyzers confirm what you hear. Your goal is to hear a problem before the screen proves it.',
        bullets: [
          'Mud → scan 200–500 Hz on guitars and keys',
          'Harshness → 2–6 kHz on vocals and cymbals',
          'Sub clutter → high-pass non-bass elements',
        ],
      },
      {
        heading: 'Genre context (IOS focus)',
        body: 'Metal needs clear kick/bass separation. Industrial tolerates harsh mids by design. Cinematic mixes need depth in highs without sibilance pain.',
        bullets: [
          'Metal: protect kick click (3–5 kHz) and bass root',
          'Industrial: controlled harshness is intentional',
          'Ambient: roll off lows on pads, keep air clean',
        ],
      },
    ],
    dos: [
      'Practice band ID daily in Ear Lab',
      'EQ in context, not solo-only',
      'Match references at same loudness',
    ],
    donts: [
      'Don’t rely on analyzer alone',
      'Don’t boost highs on every track',
      'Don’t mix at painful volume',
    ],
    practice: [
      { task: 'Complete 10 rounds in Ear Lab — aim for 7/10 or higher.' },
      {
        task: 'Open Spectrum Analyzer on a mix and call out the busiest band before looking.',
        toolHref: '/tools/spectrum',
        toolLabel: 'Spectrum Analyzer',
      },
      { task: 'Write which band caused your last “harsh mix” mistake.' },
    ],
    takeaways: [
      'Low / mid / high is your first diagnostic language',
      'Daily short drills beat occasional marathons',
      'Hearing and meters work together',
    ],
  },
  {
    id: 'E3-02',
    slug: 'e3-02',
    trackSlug: 'ear-training',
    title: 'Dynamics & compression by ear',
    duration: '18 min read',
    level: 'Intermediate',
    summary: 'Hear punch, squash, and release — know when compression helps or kills transients.',
    outcome:
      'You will recognize over-compression and set attack/release with your ears guiding the meters.',
    videos: [
      { title: 'Video 1 · Dynamics & compression by ear', youtubeId: 'ksJRgK3viMc' },
      { title: 'Video 2 · Compression basics', youtubeId: 'K0XGXz6SHco' },
      { title: 'Video 3 · Attack, release & punch', youtubeId: 'yi0J9JsRdI4' },
      { title: 'Video 4 · Hearing squash vs control', youtubeId: '7oOmX3JHwtE' },
      { title: 'Video 5 · Crest factor in practice', youtubeId: 'yURGJ8ifchQ' },
    ],
    infographic: 'dynamics-crest',
    infographicTitle: 'Punch vs squash (crest factor)',
    sections: [
      {
        heading: 'What your ears notice first',
        body: 'Compression reduces the gap between loud and quiet. Too much = flat, tired, no drum crack. Too little = uneven, hard to listen on phones.',
        bullets: [
          'Punch: transients survive — kick/snare attack',
          'Squash: sustained loudness — wall of sound',
          'Pumping: audible gain reduction breathing',
        ],
      },
      {
        heading: 'Attack & release by sound',
        body: 'Fast attack catches the hit — can dull drums. Slow attack lets transient through — more punch, less control. Release affects how quickly gain recovers.',
        bullets: [
          'Fast attack + slow release: control, risk dullness',
          'Slow attack: transient-friendly on drums',
          'Auto release: start here as a student',
        ],
      },
      {
        heading: 'A/B discipline',
        body: 'Toggle bypass at matched loudness. Louder always wins — level-match before judging. Small gain reduction (1–3 dB) often enough.',
        bullets: [
          'Match output gain when comparing',
          'Listen to drum bus and vocal bus separately',
          'If you can’t hear change, you might not need it',
        ],
      },
      {
        heading: 'Heavy music specifics',
        body: 'Metal and industrial use compression aggressively — but intentional. Parallel compression keeps transients while adding density.',
        bullets: [
          'Parallel drum crush under dry drums',
          'Vocal: serial light compression > one heavy plugin',
          'Master bus: tiny moves only',
        ],
      },
    ],
    dos: [
      'Bypass compare at matched level',
      'Watch gain reduction meters while listening',
      'Use parallel compression for weight',
    ],
    donts: [
      'Don’t compress because “pros do it”',
      'Don’t ignore pumping artifacts',
      'Don’t slam mix bus early',
    ],
    practice: [
      {
        task: 'Compress drums — find the point where kick loses click, then back off one step.',
      },
      {
        task: 'Check crest / loudness relationship on a master.',
        toolHref: '/tools/loudness',
        toolLabel: 'Loudness Meter',
      },
      { task: 'Describe “punch vs squash” in your own words in session notes.' },
    ],
    takeaways: [
      'Compression is audible — train bypass reflex',
      'Small GR often beats heavy squash',
      'Parallel paths preserve transients',
    ],
  },
  {
    id: 'E3-03',
    slug: 'e3-03',
    trackSlug: 'ear-training',
    title: 'Reference listening & A/B workflow',
    duration: '17 min read',
    level: 'Intermediate',
    summary: 'Use references without copying — level-matched A/B that improves translation.',
    outcome:
      'You will run a repeatable reference session that tells you what to fix next in your mix.',
    videos: [
      { title: 'Video 1 · Reference listening workflow', youtubeId: 'lEWr5UJMqUA' },
      { title: 'Video 2 · Level-matched A/B', youtubeId: 'EuWwq8Vidbk' },
      { title: 'Video 3 · Translation & mix decisions', youtubeId: 'lIMVB75WafY' },
    ],
    infographic: 'reference-ab',
    infographicTitle: 'A/B workflow (your mix ↔ reference)',
    sections: [
      {
        heading: 'Why references are not cheating',
        body: 'References calibrate your room, headphones, and taste. You are not copying arrangement — you are comparing balance, tone, and energy.',
        bullets: [
          'Pick 2 references max per project',
          'Same genre / similar instrumentation',
          'Import into DAW or use level-matched stream',
        ],
      },
      {
        heading: 'Level matching rule',
        body: 'Louder sounds better. Always match perceived loudness before EQ or compression decisions. Use loudness meter or gain trim.',
        bullets: [
          'Within ±1 LU is a good student target',
          'Note reference LUFS for genre context',
          'Your mix can be quieter while learning',
        ],
      },
      {
        heading: 'What to listen for (checklist)',
        body: 'On each A/B toggle, ask one question only — otherwise you overwhelm your ears.',
        bullets: [
          'Low end: kick/bass relationship',
          'Vocal: forward vs buried',
          'Cymbals: sizzle vs smooth',
          'Stereo: width vs mono power',
          'Dynamics: punch vs flat',
        ],
      },
      {
        heading: 'When to stop referencing',
        body: 'References guide early and mid mix. Final 10% is your artistic call — too much A/B creates insecurity.',
        bullets: [
          'Set reference aside for final automation pass',
          'Sleep test — next day ears win',
          'Export demo and listen on phone',
        ],
      },
    ],
    dos: [
      'Write one fix per reference session',
      'Use spectrum to confirm what you heard',
      'Check mono compatibility',
    ],
    donts: [
      'Don’t copy master loudness on day one',
      'Don’t switch references every hour',
      'Don’t A/B at mismatched levels',
    ],
    practice: [
      {
        task: 'Level-match reference and mix; list 3 differences you hear.',
        toolHref: '/tools/loudness',
        toolLabel: 'Loudness Meter',
      },
      { task: 'Fix only the #1 issue — re-A/B.' },
      { task: 'Bounce 30s mix and listen on phone speaker.' },
    ],
    takeaways: [
      'References are calibration, not cloning',
      'Level-matched A/B is non-negotiable',
      'One fix at a time builds skill',
    ],
  },
]
