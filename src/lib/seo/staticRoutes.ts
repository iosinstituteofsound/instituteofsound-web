import { ALL_TOOLS } from '@/lib/tools/registry'
import {
  ACADEMY_QUIZZES,
  ACADEMY_TRACKS,
  ALL_ACADEMY_LESSONS,
} from '@/lib/academy/registry'
import {
  breadcrumbJsonLd,
  courseJsonLd,
  learningResourceJsonLd,
  webApplicationJsonLd,
} from '@/lib/seo/jsonLd'
import type { SeoConfig } from '@/lib/seo/types'
import { SITE_NAME } from '@/lib/seo/urls'

const NOINDEX: SeoConfig = {
  title: SITE_NAME,
  description: '',
  canonicalPath: '/',
  robots: 'noindex, nofollow',
}

function page(
  path: string,
  title: string,
  description: string,
  extra?: Partial<SeoConfig>
): SeoConfig {
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    canonicalPath: path,
    ...extra,
  }
}

const PUBLIC_PAGES: Record<string, SeoConfig> = {
  '/': page(
    '/',
    SITE_NAME,
    'Underground music magazine — reviews, features, artist discovery, playlists, and culture. Not a blog. A transmission.'
  ),
  '/discover': page(
    '/discover',
    'Discover Artists',
    'Emerging artists, underground bands, and experimental creators on Institute of Sound.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Discover', path: '/discover' },
      ]),
    }
  ),
  '/playlists': page(
    '/playlists',
    'Playlists',
    'Curated underground playlists — midnight frequencies, noise rituals, and archive transmissions.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Playlists', path: '/playlists' },
      ]),
    }
  ),
  '/signals': page(
    '/signals',
    'Signals',
    'Live signals from the underground — releases, scenes, and editorial pings.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Signals', path: '/signals' },
      ]),
    }
  ),
  '/features': page(
    '/features',
    'Editorial Features',
    'Long-form features on music identity, aesthetics, interviews, and underground movements.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features' },
      ]),
    }
  ),
  '/community': page(
    '/community',
    'Community',
    'Underground music community — scenes, creators, and collective transmission.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Community', path: '/community' },
      ]),
    }
  ),
  '/submissions': page(
    '/submissions',
    'Submit Your Work',
    'Submit music, art, and editorial pitches to Institute of Sound.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Submissions', path: '/submissions' },
      ]),
    }
  ),
  '/archive': page(
    '/archive',
    'Manifesto & Archive',
    'The Institute of Sound manifesto and underground archive.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Archive', path: '/archive' },
      ]),
    }
  ),
  '/about': page(
    '/about',
    'About',
    'Institute of Sound — underground music magazine, artist archive, free production academy, and studio toolkit.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ]),
    }
  ),
  '/contact': page(
    '/contact',
    'Contact',
    'Contact Institute of Sound — artists, editors, students, and partners.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' },
      ]),
    }
  ),
  '/privacy': page(
    '/privacy',
    'Privacy Policy',
    'How Institute of Sound collects and uses data for accounts, academy progress, and editorial workflows.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Privacy', path: '/privacy' },
      ]),
    }
  ),
  '/tools': page(
    '/tools',
    'Studio Toolkit',
    'Free browser-based music tools — BPM, tuning, loudness, chords, prompts, and export checklists.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Toolkit', path: '/tools' },
      ]),
    }
  ),
  '/academy': page(
    '/academy',
    'Music Production Academy',
    'Free infographic lessons on production, mixing, mastering, recording, genres, ear training, and release.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Academy', path: '/academy' },
      ]),
    }
  ),
  '/academy/quizzes': page(
    '/academy/quizzes',
    'Academy Quizzes',
    'Test your production knowledge — track quizzes for every Academy phase.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Academy', path: '/academy' },
        { name: 'Quizzes', path: '/academy/quizzes' },
      ]),
    }
  ),
  '/academy/ear-lab': page(
    '/academy/ear-lab',
    'Ear Lab',
    'Interactive ear training drills — frequency, loudness, and compression A/B.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Academy', path: '/academy' },
        { name: 'Ear Lab', path: '/academy/ear-lab' },
      ]),
    }
  ),
  '/academy/certificates': page(
    '/academy/certificates',
    'Academy Certificates',
    'Earn and print certificates for Academy tracks, quizzes, and Ear Lab.',
    {
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Academy', path: '/academy' },
        { name: 'Certificates', path: '/academy/certificates' },
      ]),
    }
  ),
  '/editor/join': page(
    '/editor/join',
    'Join as Editor',
    'Apply to write features and reviews for Institute of Sound.',
    { robots: 'noindex, nofollow' }
  ),
}

const PRIVATE_PATHS = new Set([
  '/login',
  '/register',
  '/auth/callback',
  '/dashboard',
  '/artist/dashboard',
  '/editor/dashboard',
  '/desk',
  '/editor/login',
  '/editor/apply',
])

for (const tool of ALL_TOOLS) {
  PUBLIC_PAGES[tool.path] = page(tool.path, tool.title, tool.tagline, {
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Toolkit', path: '/tools' },
        { name: tool.title, path: tool.path },
      ]),
      webApplicationJsonLd({
        name: tool.title,
        description: tool.tagline,
        path: tool.path,
      }),
    ],
  })
}

for (const track of ACADEMY_TRACKS) {
  const path = `/academy/${track.slug}`
  PUBLIC_PAGES[path] = page(path, track.title, track.description, {
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Academy', path: '/academy' },
        { name: track.title, path },
      ]),
      courseJsonLd({
        name: track.title,
        description: track.description,
        path,
        lessonCount: track.moduleCount,
      }),
    ],
  })
}

for (const lesson of ALL_ACADEMY_LESSONS) {
  const path = `/academy/${lesson.trackSlug}/${lesson.slug}`
  PUBLIC_PAGES[path] = page(path, lesson.title, lesson.summary, {
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Academy', path: '/academy' },
        {
          name: ACADEMY_TRACKS.find((t) => t.slug === lesson.trackSlug)?.title ?? lesson.trackSlug,
          path: `/academy/${lesson.trackSlug}`,
        },
        { name: lesson.title, path },
      ]),
      learningResourceJsonLd({
        name: lesson.title,
        description: lesson.summary,
        path,
      }),
    ],
  })
}

for (const quiz of ACADEMY_QUIZZES) {
  const path = `/academy/quiz/${quiz.slug}`
  PUBLIC_PAGES[path] = page(path, quiz.title, quiz.description, {
    jsonLd: breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Academy', path: '/academy' },
      { name: quiz.title, path },
    ]),
  })
}

const DYNAMIC_PREFIXES = [
  /^\/artist\/[^/]+$/,
  /^\/feature\/[^/]+$/,
  /^\/playlist\/[^/]+$/,
]

/** Static + generated route SEO (exact pathname match). */
export function getStaticRouteSeo(pathname: string): SeoConfig | null {
  if (PRIVATE_PATHS.has(pathname)) {
    return { ...NOINDEX, canonicalPath: pathname }
  }
  if (/^\/academy\/certificate\//.test(pathname)) {
    return { ...NOINDEX, canonicalPath: pathname }
  }
  if (DYNAMIC_PREFIXES.some((re) => re.test(pathname))) return null
  return PUBLIC_PAGES[pathname] ?? null
}
