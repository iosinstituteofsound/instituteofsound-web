export type ShellMode = 'home' | 'read' | 'learn' | 'make' | 'network' | 'you'

export type RouteMeta = {
  shellMode: ShellMode
  sectionTitle: string
  kicker: string
  description: string
  /** Sidebar highlight — defaults to pathname */
  navHref?: string
  pipelinePhase: 0 | 2 | 3 | 4 | 5 | 6 | 7
  indexable: boolean
}

const READ: Omit<RouteMeta, 'sectionTitle' | 'kicker' | 'description' | 'navHref'> = {
  shellMode: 'read',
  pipelinePhase: 2,
  indexable: true,
}

const LEARN: Omit<RouteMeta, 'sectionTitle' | 'kicker' | 'description' | 'navHref'> = {
  shellMode: 'learn',
  pipelinePhase: 3,
  indexable: true,
}

const MAKE: Omit<RouteMeta, 'sectionTitle' | 'kicker' | 'description' | 'navHref'> = {
  shellMode: 'make',
  pipelinePhase: 3,
  indexable: true,
}

const NETWORK: Omit<RouteMeta, 'sectionTitle' | 'kicker' | 'description' | 'navHref'> = {
  shellMode: 'network',
  pipelinePhase: 6,
  indexable: true,
}

const YOU: Omit<RouteMeta, 'sectionTitle' | 'kicker' | 'description' | 'navHref'> = {
  shellMode: 'you',
  pipelinePhase: 4,
  indexable: false,
}

function meta(
  partial: Omit<RouteMeta, 'shellMode' | 'pipelinePhase' | 'indexable'> &
    Partial<Pick<RouteMeta, 'shellMode' | 'pipelinePhase' | 'indexable'>>,
): RouteMeta {
  const base =
    partial.shellMode === 'learn'
      ? LEARN
      : partial.shellMode === 'make'
        ? MAKE
        : partial.shellMode === 'network'
          ? NETWORK
          : partial.shellMode === 'you'
            ? YOU
            : partial.shellMode === 'home'
              ? { shellMode: 'home' as const, pipelinePhase: 0 as const, indexable: true }
              : READ
  return { ...base, ...partial }
}

/** Exact path → meta */
const EXACT: Record<string, RouteMeta> = {
  '/': meta({
    shellMode: 'home',
    sectionTitle: 'Home',
    kicker: 'Transmission',
    description: 'Underground music culture — magazine, academy, toolkit, and network.',
    pipelinePhase: 0,
  }),
  '/discover': meta({
    sectionTitle: 'Discover',
    kicker: 'Artists',
    description: 'Live artist profiles from the underground network.',
    navHref: '/discover',
  }),
  '/features': meta({
    sectionTitle: 'Features',
    kicker: 'Magazine',
    description: 'Long-form features, interviews, and scene reports.',
    navHref: '/features',
  }),
  '/signals': meta({
    sectionTitle: 'Signals',
    kicker: 'Wire',
    description: 'Short transmissions from the underground.',
    navHref: '/signals',
  }),
  '/playlists': meta({
    sectionTitle: 'Playlists',
    kicker: 'Curated',
    description: 'Editorial playlists and mood archives.',
    navHref: '/playlists',
  }),
  '/community': meta({ ...NETWORK, sectionTitle: 'Community', kicker: 'Network', description: 'Feed, tribes, crews, and leaderboards.', navHref: '/community' }),
  '/scenes': meta({ sectionTitle: 'Scenes', kicker: 'India', description: 'City × genre underground hubs.', navHref: '/scenes' }),
  '/events': meta({ sectionTitle: 'Events', kicker: 'Live', description: 'Gigs, RSVP, and scene calendars.', navHref: '/events' }),
  '/collab': meta({ sectionTitle: 'Collab Board', kicker: 'Network', description: 'Need/offer posts for collaborators.', navHref: '/collab' }),
  '/submissions': meta({ sectionTitle: 'Submit Music', kicker: 'Artists', description: 'How to submit tracks to the editorial desk.', navHref: '/submissions' }),
  '/archive': meta({ sectionTitle: 'Archive', kicker: 'Manifesto', description: 'Manifesto and archive links.', navHref: '/archive' }),
  '/about': meta({ sectionTitle: 'About', kicker: 'IOS', description: 'What Institute of Sound is.', navHref: '/about' }),
  '/contact': meta({ sectionTitle: 'Contact', kicker: 'Reach', description: 'Email and social channels.', navHref: '/contact' }),
  '/privacy': meta({ sectionTitle: 'Privacy', kicker: 'Legal', description: 'Privacy policy.', navHref: '/privacy' }),
  '/tools': meta({ ...MAKE, sectionTitle: 'Studio Toolkit', kicker: 'Make', description: 'Free browser-based production tools.', navHref: '/tools' }),
  '/academy': meta({ ...LEARN, sectionTitle: 'Academy', kicker: 'Learn', description: 'Free music production lessons — no paywall.', navHref: '/academy' }),
  '/academy/quizzes': meta({ ...LEARN, sectionTitle: 'Quizzes', kicker: 'Academy', description: 'Test your production knowledge.', navHref: '/academy/quizzes' }),
  '/academy/ear-lab': meta({ ...LEARN, sectionTitle: 'Ear Lab', kicker: 'Academy', description: 'Interactive ear training.', navHref: '/academy/ear-lab' }),
  '/academy/certificates': meta({ ...LEARN, sectionTitle: 'Certificates', kicker: 'Academy', description: 'Printable academy certificates.', navHref: '/academy/certificates' }),
  '/login': meta({ ...YOU, sectionTitle: 'Sign In', kicker: 'Access', description: 'Google sign-in for members and artists.' }),
  '/register': meta({ ...YOU, sectionTitle: 'Join', kicker: 'Access', description: 'Create your network profile.' }),
  '/dashboard': meta({ ...YOU, sectionTitle: 'Dashboard', kicker: 'You', description: 'Redirect to your workspace.', pipelinePhase: 4 }),
  '/member/dashboard': meta({ ...YOU, sectionTitle: 'My Network', kicker: 'Member', description: 'Listener and member workspace.', pipelinePhase: 5 }),
  '/member/upgrade': meta({ ...YOU, sectionTitle: 'Become an Artist', kicker: 'Upgrade', description: 'Upgrade to artist studio.', pipelinePhase: 4 }),
  '/artist/dashboard': meta({ ...YOU, sectionTitle: 'My Studio', kicker: 'Artist', description: 'Artist profile, releases, and submissions.', pipelinePhase: 5 }),
  '/editor/dashboard': meta({ ...YOU, sectionTitle: 'Editorial Desk', kicker: 'Editor', description: 'Review queue and publishing.', pipelinePhase: 5 }),
  '/editor/join': meta({ sectionTitle: 'Join as Editor', kicker: 'Desk', description: 'Editor programme info.', navHref: '/editor/join', indexable: true }),
  '/editor/apply': meta({ ...YOU, sectionTitle: 'Editor Application', kicker: 'Desk', description: 'Apply to write for IOS.' }),
  '/desk': meta({ ...YOU, sectionTitle: 'Editor Desk Login', kicker: 'Desk', description: 'Desk email sign-in.' }),
}

const ACADEMY_TRACKS = [
  'production',
  'mixing',
  'mastering',
  'recording',
  'genres',
  'ear-training',
  'release',
] as const

const DEFAULT: RouteMeta = meta({
  sectionTitle: 'Institute of Sound',
  kicker: 'IOS',
  description: 'Underground music culture platform.',
})

export function getRouteMeta(pathname: string): RouteMeta {
  if (EXACT[pathname]) return EXACT[pathname]

  if (pathname.startsWith('/tools/')) {
    const slug = pathname.replace('/tools/', '')
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return meta({
      ...MAKE,
      sectionTitle: title,
      kicker: 'Toolkit',
      description: `Studio tool — ${title}. Free in the browser.`,
      navHref: '/tools',
    })
  }

  if (pathname.startsWith('/academy/quiz/')) {
    return meta({
      ...LEARN,
      sectionTitle: 'Quiz',
      kicker: 'Academy',
      description: 'Academy track quiz.',
      navHref: '/academy/quizzes',
    })
  }

  if (pathname.startsWith('/academy/certificate/')) {
    return meta({
      ...LEARN,
      sectionTitle: 'Certificate',
      kicker: 'Academy',
      description: 'Printable certificate.',
      navHref: '/academy/certificates',
      indexable: false,
    })
  }

  const academyParts = pathname.replace(/^\/academy\/?/, '').split('/').filter(Boolean)
  if (academyParts.length === 1 && ACADEMY_TRACKS.includes(academyParts[0] as (typeof ACADEMY_TRACKS)[number])) {
    const track = academyParts[0]
    return meta({
      ...LEARN,
      sectionTitle: track.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      kicker: 'Academy Track',
      description: `Lessons for ${track}.`,
      navHref: `/academy/${track}`,
    })
  }

  if (academyParts.length === 2) {
    return meta({
      ...LEARN,
      sectionTitle: 'Lesson',
      kicker: 'Academy',
      description: 'Production lesson.',
      navHref: '/academy',
    })
  }

  if (pathname.startsWith('/academy')) {
    return EXACT['/academy'] ?? { ...LEARN, sectionTitle: 'Academy', kicker: 'Learn', description: '' }
  }

  if (pathname.startsWith('/feature/')) {
    return meta({ sectionTitle: 'Feature', kicker: 'Magazine', description: 'Editorial feature article.', navHref: '/features' })
  }
  if (pathname.startsWith('/playlist/')) {
    return meta({ sectionTitle: 'Playlist', kicker: 'Curated', description: 'Curated playlist.', navHref: '/playlists' })
  }
  if (pathname.startsWith('/artist/')) {
    return meta({ sectionTitle: 'Artist', kicker: 'Discover', description: 'Public artist profile.', navHref: '/discover' })
  }
  if (pathname.startsWith('/network/')) {
    return meta({ ...NETWORK, sectionTitle: 'Profile', kicker: 'Network', description: 'Community member profile.', navHref: '/community' })
  }
  if (pathname.startsWith('/release/')) {
    return meta({ sectionTitle: 'Release', kicker: 'Music', description: 'Release detail.', navHref: '/#releases' })
  }
  if (/^\/scenes\/[^/]+\/[^/]+/.test(pathname)) {
    return meta({ sectionTitle: 'Scene Hub', kicker: 'Scenes', description: 'City and genre scene.', navHref: '/scenes' })
  }

  return DEFAULT
}

export function shellModeToMobileTab(mode: ShellMode): string {
  switch (mode) {
    case 'home':
      return '/'
    case 'learn':
      return '/academy'
    case 'make':
      return '/tools'
    case 'network':
      return '/community'
    case 'you':
      return '/login'
    case 'read':
      return '/'
    default:
      return '/'
  }
}

export function isNavActive(pathname: string, href: string, navHref?: string): boolean {
  const target = navHref ?? href
  if (target === '/') return pathname === '/'
  if (target.startsWith('/#')) return pathname === '/'
  return pathname === target || pathname.startsWith(`${target}/`)
}
