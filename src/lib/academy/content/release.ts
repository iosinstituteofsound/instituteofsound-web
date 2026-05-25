import type { AcademyLesson } from '@/lib/academy/types'

export const RELEASE_LESSONS: AcademyLesson[] = [
  {
    id: 'RL3-01',
    slug: 'rl3-01',
    trackSlug: 'release',
    title: 'Release timeline & deliverables',
    duration: '16 min read',
    level: 'Beginner',
    summary: 'From mix approval to upload — what files, dates, and checks a student release needs.',
    outcome:
      'You will plan a realistic release calendar and know every deliverable before distribution day.',
    videos: [
      { title: 'Video 1 · Release timeline overview', youtubeId: 'B9BsicY-WvE' },
      { title: 'Video 2 · Deliverables & milestones', youtubeId: 'qvYdSvRHVZ8' },
    ],
    infographic: 'release-timeline',
    infographicTitle: 'Student release timeline (weeks → day)',
    sections: [
      {
        heading: 'Phases of a release',
        body: 'A release is a project, not a single export. Think in phases: mix lock → master → assets → upload → promo.',
        bullets: [
          'T−4 weeks: mix revisions, reference checks',
          'T−2 weeks: mastering + QC listen',
          'T−1 week: artwork, metadata, pre-save',
          'Release day: upload verified, links live',
        ],
      },
      {
        heading: 'Deliverables checklist',
        body: 'Distributors want consistent files. Missing artwork or wrong ISRC causes delays.',
        bullets: [
          'WAV master (and optional instrumental)',
          'Cover art 3000×3000 JPG (no explicit URL text)',
          'Metadata: title, artist, genre, date, lyrics flag',
          'Credits / splits documented offline',
        ],
      },
      {
        heading: 'Version control habit',
        body: 'Name files clearly: `Artist_Song_MIX_v03.wav`, `Artist_Song_MASTER_v01.wav`. Never overwrite without backup.',
        bullets: [
          'Date or version in filename',
          'Keep mix project + master bounce',
          'Note limiter settings in text file',
        ],
      },
      {
        heading: 'Who listens before upload',
        body: 'Two trusted ears on headphones, car, and phone. You are too close to the project.',
        bullets: [
          'Fresh listen after 24h break',
          'Check start/end silence and fades',
          'Confirm explicit/clean version tags',
        ],
      },
    ],
    dos: [
      'Start timeline before mastering is done',
      'Keep a deliverables folder structure',
      'Schedule upload 48h before street date',
    ],
    donts: [
      'Don’t upload unmastered “just to test” publicly',
      'Don’t use random filenames on final bounces',
      'Don’t skip QC on phone speakers',
    ],
    practice: [
      {
        task: 'Run Export Checklist on your latest bounce.',
        toolHref: '/tools/export-checklist',
        toolLabel: 'Export Checklist',
      },
      { task: 'Write T−4 / T−2 / T−1 / day-of tasks for one real single.' },
      { task: 'Create folder: Masters, Art, Metadata, Project.' },
    ],
    takeaways: [
      'Releases are planned in reverse from street date',
      'Deliverables are fixed — prepare early',
      'QC on multiple devices is part of delivery',
    ],
  },
  {
    id: 'RL3-02',
    slug: 'rl3-02',
    trackSlug: 'release',
    title: 'Metadata, credits & identifiers',
    duration: '18 min read',
    level: 'Beginner',
    summary: 'Titles, artists, ISRC, splits, and credits — get metadata right before you upload.',
    outcome:
      'You will fill distributor forms confidently and avoid takedowns from metadata conflicts.',
    videos: [
      { title: 'Video 1 · Metadata basics', youtubeId: 'lZOqx1qnAyI' },
      { title: 'Video 2 · ISRC & identifiers', youtubeId: 'VstUOVGMBpg' },
      { title: 'Video 3 · Credits & splits', youtubeId: 'tbgCJSU5pJw' },
      { title: 'Video 4 · Distributor metadata QC', youtubeId: 'sXLJBFBg3Sg' },
    ],
    infographic: 'metadata-map',
    infographicTitle: 'Metadata fields map',
    sections: [
      {
        heading: 'Core metadata fields',
        body: 'Streaming platforms display what you submit. Typos in artist name or title propagate everywhere.',
        bullets: [
          'Release title vs track title (singles vs EP)',
          'Primary artist vs featured artists',
          'Genre / subgenre (use Subgenre Tags tool)',
          'Release date and timezone',
        ],
      },
      {
        heading: 'ISRC & why it matters',
        body: 'ISRC identifies a recording. Same recording should keep the same ISRC. New master of same song = new ISRC decision (label policy varies — students: ask if unsure).',
        bullets: [
          'One ISRC per released recording version',
          'Don’t invent random ISRCs — distributor may assign',
          'Keep a spreadsheet of ISRC ↔ song',
        ],
      },
      {
        heading: 'Credits & splits (offline first)',
        body: 'Document writers, producers, performers before upload. Split disputes are legal/business — not DAW problems.',
        bullets: [
          'Split sheet: percentages sum to 100%',
          'Producer credit vs featured artist rules differ by platform',
          'Lyrics explicit flag and language',
        ],
      },
      {
        heading: 'Common student mistakes',
        body: 'Wrong artist spelling, duplicate profiles, album art with small text, uploading instrumental as main track by accident.',
        bullets: [
          'Match spelling across Spotify/Apple/Distro',
          'Avoid “Various Artists” unless compilation',
          'Instrumental = separate track or separate release plan',
        ],
      },
    ],
    dos: [
      'Copy metadata from a single source doc',
      'Verify artist profile links before upload',
      'Save distributor confirmation PDFs/screenshots',
    ],
    donts: [
      'Don’t rush metadata at 2am on release day',
      'Don’t use copyrighted art without license',
      'Don’t list collaborators without agreement',
    ],
    practice: [
      {
        task: 'Build metadata doc for one track (all fields).',
        toolHref: '/tools/subgenre-tags',
        toolLabel: 'Subgenre Tags',
      },
      { task: 'Verify audio format and bit depth for upload file.' },
      {
        task: 'Cross-check Export Checklist metadata section.',
        toolHref: '/tools/export-checklist',
        toolLabel: 'Export Checklist',
      },
    ],
    takeaways: [
      'Metadata is as important as the master file',
      'ISRC and credits need a paper trail',
      'One source doc prevents typos',
    ],
  },
  {
    id: 'RL3-03',
    slug: 'rl3-03',
    trackSlug: 'release',
    title: 'Distribution prep & post-release',
    duration: '17 min read',
    level: 'Intermediate',
    summary: 'Upload, verify stores, pitch playlists, and archive the project for your portfolio.',
    outcome:
      'You will complete distribution QC and run a minimal promo loop after release day.',
    videos: [
      { title: 'Video 1 · Distribution prep & upload', youtubeId: 'RhUknxgtqgM' },
      { title: 'Video 2 · Post-release promo basics', youtubeId: 'P-aYtFm8K44' },
      {
        title: 'Guide · Post-release strategy (YouTube for Artists)',
        href: 'https://artists.youtube/resources/post-release-strategy/',
      },
      {
        title: 'Guide · Multi-format release strategy (YouTube for Artists)',
        href: 'https://artists.youtube/resources/multi-format-release-strategy/',
      },
    ],
    infographic: 'distributor-checklist',
    infographicTitle: 'Post-upload verification',
    sections: [
      {
        heading: 'Choosing a distributor (student view)',
        body: 'Aggregators (DistroKid, TuneCore, CD Baby, etc.) deliver to platforms. Compare annual vs per-release fees, splits, and extras (publishing admin is separate topic).',
        bullets: [
          'Read rejection reasons in dashboard',
          'Allow 1–7 days for store propagation',
          'Pre-save links need early upload',
        ],
      },
      {
        heading: 'Post-upload QC',
        body: 'Search your artist on Spotify/Apple/YouTube Music. Wrong profile = fix before promo push.',
        bullets: [
          'Artwork cropped correctly on mobile',
          'Explicit badge correct',
          'No accidental duplicate releases',
        ],
      },
      {
        heading: 'Minimal promo loop',
        body: 'You do not need a huge budget. Consistency beats one viral attempt.',
        bullets: [
          '30s hook clip for social',
          'Link-in-bio updated same day',
          'Submit to relevant playlists (realistic size)',
          'Share to community / IOS submissions if applicable',
        ],
      },
      {
        heading: 'Project archive for portfolio',
        body: 'Future you will forget session details. Archive stems policy, credits, masters, and lessons learned.',
        bullets: [
          'Freeze mix project as “release approved”',
          'Store instrumental + TV mix if applicable',
          'Note BPM, key, tuning for live set',
        ],
      },
    ],
    dos: [
      'Verify live links 24–48h after upload',
      'Screenshot store listings for portfolio',
      'Plan one post-release content week',
    ],
    donts: [
      'Don’t spam playlist curators',
      'Don’t delete project folder after upload',
      'Don’t ignore copyright on samples',
    ],
    practice: [
      {
        task: 'Build setlist entry with BPM/key for the released track.',
        toolHref: '/tools/setlist',
        toolLabel: 'Setlist Planner',
      },
      { task: 'Write 3-sentence release story for editorial pitch.' },
      { task: 'Archive folder: mark FINAL on master and project.' },
    ],
    takeaways: [
      'Distribution is verify → promote → archive',
      'Store QC prevents embarrassing link shares',
      'Archive habits separate amateurs from pros',
    ],
  },
]
