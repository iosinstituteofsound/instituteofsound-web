import type { AcademyLesson } from '@/lib/academy/types'

export const RECORDING_LESSONS: AcademyLesson[] = [
  {
    id: 'R2-01',
    slug: 'r2-01',
    trackSlug: 'recording',
    title: 'Microphones, gain, and placement',
    duration: '20 min read',
    level: 'Beginner',
    summary:
      'Choose the right mic, set safe gain, and place sources so you capture tone — not just volume.',
    outcome:
      'You will record vocals, amps, and drums with intentional mic choice and placement before you open EQ.',
    infographic: 'mic-placement',
    infographicTitle: 'Placement map (distance changes tone)',
    sections: [
      {
        heading: 'Dynamic vs condenser (student decision tree)',
        body: 'Dynamic mics reject room noise and handle loud sources (snare, guitar cab, live vocals). Large-diaphragm condensers capture detail and air (studio vocals, acoustic guitar, room). Small-diaphragm condensers excel on hi-hat, strings, and stereo pairs.',
        bullets: [
          'Dynamic: SM57-style workhorse on cab and snare',
          'LDC condenser: lead vocals in treated rooms',
          'Ribbon (if available): smooth top on guitar — watch phantom power rules',
        ],
      },
      {
        heading: 'Gain staging at the interface',
        body: 'Set preamp gain so loudest phrases peak around −12 to −6 dBFS. Too quiet adds noise when you boost later; too hot clips before the DAW can help you.',
        bullets: [
          'Use input pad on loud sources (kick, scream vocals)',
          '48V phantom only on condensers that need it',
          'Record dry — commit effects only when you understand the chain',
        ],
      },
      {
        heading: 'Distance = EQ you cannot undo',
        body: 'Moving a mic 5 cm changes brightness more than a random high shelf. Close placement increases bass (proximity effect on directional mics) and reduces room.',
        bullets: [
          'Vocals: start 15–20 cm off-axis from mouth pop axis',
          'Guitar cab: center cone = bright; edge = darker, more body',
          'Drums: one mic can work — position for balance, not perfection',
        ],
      },
      {
        heading: 'Phase and multi-mic basics',
        body: 'When two mics hear the same source, timing differences cause comb filtering (hollow, swishy tone). Flip polarity and nudge position before mixing.',
        bullets: [
          'Overheads + close mics: check polarity on snare',
          'Double mics on cab: blend carefully or pick one',
          'DI + mic bass: align in DAW if both used',
        ],
      },
    ],
    dos: [
      'Listen in headphones while moving the mic',
      'Use pop filter and stable stand for vocals',
      'Label tracks: mic model + position in session notes',
    ],
    donts: [
      'Don’t chase “fix it in the mix” clipping on input',
      'Don’t record next to laptop fan or untreated reflection point',
      'Don’t use condenser on screaming vocals without pad/limit plan',
    ],
    practice: [
      {
        task: 'Record the same vocal line at 10 cm vs 25 cm — compare brightness.',
      },
      {
        task: 'Check peak level with Clipping Risk tool after recording.',
        toolHref: '/tools/clipping',
        toolLabel: 'Clipping Risk',
      },
      {
        task: 'Draw a mic diagram for your setup and save it in session notes.',
      },
    ],
    takeaways: [
      'Mic choice + position are your first EQ moves',
      '−12 to −6 dBFS peaks are a safe recording target',
      'Polarity and distance fix problems cheaper than plugins',
    ],
  },
  {
    id: 'R2-02',
    slug: 'r2-02',
    trackSlug: 'recording',
    title: 'Room acoustics & monitoring',
    duration: '18 min read',
    level: 'Beginner',
    summary: 'Treat reflections, set listening position, and hear truthfully while tracking and editing.',
    outcome:
      'You will set up a student-friendly listening zone and reduce room problems that confuse EQ decisions.',
    infographic: 'room-treatment',
    infographicTitle: 'Room zones (where problems hide)',
    sections: [
      {
        heading: 'Reflections vs absorption',
        body: 'Your room adds echo and frequency buildup. First reflections (side walls, desk, ceiling) smear stereo imaging. Bass builds in corners. Treatment does not mean foam everywhere — it means targeting problem zones.',
        bullets: [
          'Reflections: early echoes that blur vocals and guitars',
          'Standing waves: bass booms or disappears by position',
          'Diffusion: scatters energy without killing life (optional student upgrade)',
        ],
      },
      {
        heading: 'Minimum viable student setup',
        body: 'You do not need a $20k room. Start with speaker/headphone choice, speaker height at ear level, and symmetry where possible.',
        bullets: [
          'Headphones for detail; speakers for low-end truth (use both)',
          'Turn down room volume — fatigue makes you mix bright',
          'Rug + bookshelf + blanket on reflection point = real wins',
        ],
      },
      {
        heading: 'Monitoring levels (OSHA for your ears)',
        body: 'Mix at conversation level most of the time. Loud monitoring hides balance problems and damages hearing — especially in metal sessions with dense HF energy.',
        bullets: [
          '85 dB SPL short checks only — not full session volume',
          'Take 10-minute breaks every hour',
          'Same monitoring volume when comparing takes',
        ],
      },
      {
        heading: 'Reference listening habit',
        body: 'Import two references in your genre. Level-match them to your mix before judging tone. Your room + headphones become calibrated over weeks, not one night.',
        bullets: [
          'Match loudness before A/B (use loudness tool)',
          'One reference “tone winner”, one “balance winner”',
          'Note what references do in your room vs headphones',
        ],
      },
    ],
    dos: [
      'Treat first reflection points you can reach',
      'Keep monitors away from walls when possible',
      'Use references every session',
    ],
    donts: [
      'Don’t cover entire room with thin foam (muddy mids)',
      'Don’t mix only on laptop speakers',
      'Don’t crank monitors to “feel” the kick',
    ],
    practice: [
      {
        task: 'Clap test in your room — find the flutter echo corner.',
      },
      {
        task: 'Level-match a reference track to your mix using the Loudness tool.',
        toolHref: '/tools/loudness',
        toolLabel: 'Loudness Meter',
      },
      {
        task: 'Write a monitoring note: headphones vs speakers differences.',
      },
    ],
    takeaways: [
      'Room sound is part of your recording chain',
      'Low-level monitoring improves decisions',
      'References train your ears faster than random EQ',
    ],
  },
  {
    id: 'R2-03',
    slug: 'r2-03',
    trackSlug: 'recording',
    title: 'Doubles, layers, and reamping',
    duration: '21 min read',
    level: 'Intermediate',
    summary: 'Build width and weight with intentional doubles, layers, and reamp workflows.',
    outcome:
      'You will stack guitars and vocals without phase mush and use reamping to reshape tone after the fact.',
    infographic: 'double-tracking',
    infographicTitle: 'Double-track width (L / R / center)',
    sections: [
      {
        heading: 'Why doubles work in heavy music',
        body: 'Dense genres need width and aggression. Doubled guitars and stacked vocals create size. The trick is variation: different performance, slightly different tone, or different register — not copy-paste.',
        bullets: [
          'Hard-pan doubles for width (L100 / R100)',
          'Center keep low end or main vocal focus',
          'Detune cents or delay subtly if tracks sound too identical',
        ],
      },
      {
        heading: 'Vocal doubles that sit in the mix',
        body: 'Main vocal center; doubles wide and quieter. Octave doubles add power; whisper doubles add texture. Edit breaths and consonants so stacks sound tight.',
        bullets: [
          'Align phrases manually or with light editing',
          'High-pass doubles more aggressively than lead',
          'Automate double level up in choruses only',
        ],
      },
      {
        heading: 'Guitar layering without mud',
        body: 'Rhythm doubles ≠ four identical chains. Try: tighter tone on one side, more midrange on the other, or different pickup. Use bus compression after balance, not before.',
        bullets: [
          'Track high and low string parts separately when possible',
          'Cut 200–400 Hz on one layer if bass fights',
          'Check mono compatibility — phase kills power',
        ],
      },
      {
        heading: 'Reamping workflow',
        body: 'Record DI guitar (clean) + optional mic take. Later, send DI out to amp/sim and re-record. This saves time when tone was wrong but performance was right.',
        bullets: [
          'DI must be clean — no clipping, no amp sim printed',
          'Match reamp level going back into interface',
          'Print new amp track; keep DI for recall',
        ],
      },
    ],
    dos: [
      'Change something on every double (tone, timing, mic)',
      'Check mono after panning guitars wide',
      'Keep DI tracks for recall',
    ],
    donts: [
      'Don’t duplicate one take and pan — sounds fake',
      'Don’t stack 8 guitars without arrangement plan',
      'Don’t ignore phase when blending mic + reamp',
    ],
    practice: [
      {
        task: 'Record rhythm guitar twice; pan L/R; compare to single track in mix.',
      },
      {
        task: 'Plan vocal doubles on Lyric Helper sections before tracking.',
        toolHref: '/tools/lyrics',
        toolLabel: 'Lyric Helper',
      },
      {
        task: 'If you have DI, reamp one section and A/B tone.',
      },
    ],
    takeaways: [
      'Doubles need variation to sound huge',
      'Panning + EQ separation prevents mud',
      'DI + reamp = flexible heavy guitar production',
    ],
  },
]
