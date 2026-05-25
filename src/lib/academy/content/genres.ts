import type { AcademyLesson } from '@/lib/academy/types'

export const GENRE_LESSONS: AcademyLesson[] = [
  {
    id: 'G2-01',
    slug: 'g2-01',
    trackSlug: 'genres',
    title: 'Heavy metal mix blueprint',
    duration: '22 min read',
    level: 'Intermediate',
    summary: 'Kick–bass marriage, guitar density, vocal cut, and drum punch for modern heavy mixes.',
    outcome:
      'You will balance a metal session with a repeatable template and know which fights to solve first.',
    videos: [
      { title: 'Video 1 · Heavy metal mix overview', youtubeId: '-iFE8M0W_So' },
      { title: 'Video 2 · Kick, bass & guitar density', youtubeId: '4B8VFalcim4' },
      { title: 'Video 3 · Vocal cut & drum punch', youtubeId: 'a98bnsXmFRk' },
    ],
    infographic: 'metal-template',
    infographicTitle: 'Metal balance priorities (bottom → top)',
    sections: [
      {
        heading: 'The four fights in metal mixing',
        body: 'Most student metal mixes fail in the same places: kick vs bass, guitars vs vocals, cymbals vs snare, and master bus too loud too early. Solve in that order.',
        bullets: [
          'Low end: one “owner” of sub (kick or bass, not both)',
          'Guitars: carve 2–4 kHz for vocal presence',
          'Drums: snare crack + kick click before cymbal wash',
          'Master: last — not where you fix balance',
        ],
      },
      {
        heading: 'Drum bus approach',
        body: 'Parallel compression on drums adds punch without destroying transients. Blend heavily compressed send under dry drums. Overheads glue the kit — don’t solo them forever.',
        bullets: [
          'Kick: boost click (3–5 kHz) if buried',
          'Snare: body 200 Hz, crack 4–6 kHz',
          'Room mic: blend for size, high-pass aggressively',
        ],
      },
      {
        heading: 'Guitar wall without masking',
        body: 'Double tracks panned wide; bass and kick centered. High-pass guitars around 80–120 Hz unless down-tuned needs more. Use midrange cuts on one guitar side for vocal pocket.',
        bullets: [
          'Distortion ≠ more highs — often needs cuts',
          'Bus saturation after individual balance',
          'Check mono — guitars should not vanish',
        ],
      },
      {
        heading: 'Vocal aggression that stays clear',
        body: 'Screams and cleans need different chains sometimes. De-ess harsh bands; compress in stages (level → tone → character). Ride fader automation before more plugins.',
        bullets: [
          'Parallel distortion send for scream texture',
          'Delay throws on phrase ends, not constant wash',
          'Sidechain guitars slightly under lead vocal if needed',
        ],
      },
    ],
    dos: [
      'Mix drums and bass first with master bypassed',
      'Use reference at matched loudness',
      'Automate vocal rides early',
    ],
    donts: [
      'Don’t solo guitars for 20 minutes',
      'Don’t boost 8 kHz on everything “for air”',
      'Don’t limit while balancing',
    ],
    practice: [
      {
        task: 'Build a metal fader template and save as DAW template.',
      },
      {
        task: 'Tag your subgenre on a test mix for arrangement notes.',
        toolHref: '/tools/subgenre-tags',
        toolLabel: 'Subgenre Tags',
      },
      {
        task: 'Write “low-end owner” decision (kick or bass) on session.',
      },
    ],
    takeaways: [
      'Metal mixing is priority order, not plugin count',
      'Guitars and vocals share 2–4 kHz — plan cuts',
      'Punch comes from transients + balance, not only limiting',
    ],
  },
  {
    id: 'G2-02',
    slug: 'g2-02',
    trackSlug: 'genres',
    title: 'Industrial & dark electronic texture',
    duration: '19 min read',
    level: 'Intermediate',
    summary: 'Layer noise, synthesis, and drums for harsh, cinematic underground electronic hybrids.',
    outcome:
      'You will design industrial textures that support a song without turning the mix into noise soup.',
    videos: [
      { title: 'Video 1 · Industrial & dark electronic texture', youtubeId: '6S8kZG46qt8' },
      { title: 'Video 2 · Layering noise and synthesis', youtubeId: 'lOhkJw1jlwg' },
      { title: 'Video 3 · Harsh drums & mix balance', youtubeId: '848fp-O3QkM' },
    ],
    infographic: 'genre-spectrum',
    infographicTitle: 'Frequency roles in dark electronic',
    sections: [
      {
        heading: 'What “industrial” means in production',
        body: 'Industrial mixes combine acoustic aggression with synthetic damage: distorted drums, metallic percussion, modulated bass, and found-sound layers. The groove still matters — chaos needs pulse.',
        bullets: [
          'Rhythmic grid: BPM locked or intentionally broken',
          'Harmonic center: often minor or atonal beds',
          'Contrast: quiet tension vs violent chorus',
        ],
      },
      {
        heading: 'Sound design vs mix responsibilities',
        body: 'Design sounds in short loops or one-shots with headroom. Distort in stages (plugin → amp sim → bus). If it hurts solo, it might still work in context — but not always.',
        bullets: [
          'Layer sub sine under distorted mid bass',
          'Bitcrush and sample-rate reduction as seasoning',
          'Filter sweeps on buses for movement',
        ],
      },
      {
        heading: 'Drums that hit on laptops and clubs',
        body: 'Transient shapers and parallel distortion on drum buses. Keep click and body separate (EQ branches). Sidechain pads to kick for pump when genre demands.',
        bullets: [
          'Mono low below 120 Hz on kick/bass elements',
          'Stereo width on noise and FX above 300 Hz',
          'Check on earbuds — harshness shows fast',
        ],
      },
      {
        heading: 'Arrangement for tension',
        body: 'Drop elements for 4–8 bars before impact. Automate filter cutoff and reverb size. Industrial lives on anticipation — silence and noise are instruments.',
        bullets: [
          'Mute guitar-like mids before drop',
          'Automate send levels to delay/reverb',
          'Use reverse swells into downbeats',
        ],
      },
    ],
    dos: [
      'Commit to a BPM early (use Tap Tempo tool)',
      'Layer one “character” sound per section',
      'High-pass noise beds unless sub intent',
    ],
    donts: [
      'Don’t stack 12 distortion plugins on one kick',
      'Don’t leave full-spectrum white noise uncontrolled',
      'Don’t forget dynamics — loud-only fatigues',
    ],
    practice: [
      {
        task: 'Set project BPM and note in Setlist Planner for live later.',
        toolHref: '/tools/setlist',
        toolLabel: 'Setlist Planner',
      },
      {
        task: 'Create 3-layer drum: transient + body + trash bus.',
      },
      {
        task: 'Mute all FX for one verse — confirm song still works.',
      },
    ],
    takeaways: [
      'Industrial needs pulse under the noise',
      'Distortion in stages beats one mega plugin',
      'Arrangement automation is part of sound design',
    ],
  },
  {
    id: 'G2-03',
    slug: 'g2-03',
    trackSlug: 'genres',
    title: 'Cinematic & ambient space design',
    duration: '20 min read',
    level: 'Beginner',
    summary: 'Depth, reverb tails, and slow movement for atmospheric and cinematic beds.',
    outcome:
      'You will place elements in front-to-back space and build ambient worlds that support vocals or post-rock peaks.',
    videos: [
      { title: 'Video 1 · Cinematic & ambient space design', youtubeId: 'mx40aXhaxt8' },
      { title: 'Video 2 · Depth and reverb placement', youtubeId: 'KVNb19dHA9Q' },
      { title: 'Video 3 · Slow movement & atmosphere', youtubeId: 'YAn1eUBkWHI' },
      { title: 'Video 4 · Front-to-back mixing', youtubeId: 'CASDW1Y915M' },
      { title: 'Video 5 · Ambient beds & pads', youtubeId: 'M6GUNTwCJaA' },
      { title: 'Video 6 · Reverb tails & space', youtubeId: '7L0m76ePozg' },
      { title: 'Video 7 · Cinematic layering', youtubeId: 'xtk1C9K2P2s' },
      { title: 'Video 8 · Post-rock peaks & release', youtubeId: 'elJiUz7Gfr0' },
    ],
    infographic: 'cinematic-depth',
    infographicTitle: 'Depth map (dry → far)',
    sections: [
      {
        heading: 'Front-to-back mixing',
        body: 'Depth is brightness + level + reverb + dynamics. Close sounds are drier, brighter transients, louder. Far sounds are darker, wetter, softer attacks.',
        bullets: [
          'Close: less reverb, more presence (3–5 kHz)',
          'Far: more pre-delay + longer tail',
          'Movement: automate send levels over time',
        ],
      },
      {
        heading: 'Reverb types and jobs',
        body: 'Plate/room for vocals and drums. Hall for strings and pads. Convolution for realism. Don’t use one long reverb on everything — build a reverb palette.',
        bullets: [
          'Pre-delay separates source from wash',
          'High-pass reverb return at 200–400 Hz',
          'Short ambience vs long tail = layered depth',
        ],
      },
      {
        heading: 'Pads and drones without mud',
        body: 'Subtractive synthesis: filter wide pads. Layer octaves sparingly. Sidechain pad to kick/bass if low-end pump needed. Pan slow LFO for width.',
        bullets: [
          'High-pass pads unless sub drone intent',
          'Use chorus/widener subtly on highs only',
          'One “hero” pad per section maximum',
        ],
      },
      {
        heading: 'Cinematic dynamics (not wall of loud)',
        body: 'Film and post-rock use crest — quiet intro, swells, climax. Mix with automation curves, not only compression. Leave 3–6 dB master headroom for mastering.',
        bullets: [
          'Automate reverb size into climaxes',
          'Drop drums for half bar before impact',
          'Reference film cues for arrangement arcs',
        ],
      },
    ],
    dos: [
      'Build a send palette: room / plate / long hall',
      'Automate at least one depth move per minute',
      'Check mono — wide pads can cancel',
    ],
    donts: [
      'Don’t drown lead vocal in reverb for “cinematic”',
      'Don’t use same predelay on every send',
      'Don’t master squash before you design space',
    ],
    practice: [
      {
        task: 'Mix one vocal dry vs cinematic send — level-match.',
      },
      {
        task: 'Pick key/scale for pad with Key & Scale tool.',
        toolHref: '/tools/key-scale',
        toolLabel: 'Key & Scale',
      },
      {
        task: 'Draw arrangement arc on paper: quiet → swell → peak.',
      },
    ],
    takeaways: [
      'Depth = level + tone + reverb + automation',
      'Multiple reverbs beat one mega hall',
      'Dynamics and space define cinematic mixes',
    ],
  },
]
