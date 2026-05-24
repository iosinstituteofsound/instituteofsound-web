import { EAR_TRAINING_LESSONS } from '@/lib/academy/content/earTraining'
import { GENRE_LESSONS } from '@/lib/academy/content/genres'
import { MASTERING_LESSONS } from '@/lib/academy/content/mastering'
import { MIXING_LESSONS } from '@/lib/academy/content/mixing'
import { PRODUCTION_LESSONS } from '@/lib/academy/content/production'
import { RECORDING_LESSONS } from '@/lib/academy/content/recording'
import { RELEASE_LESSONS } from '@/lib/academy/content/release'
import { ACADEMY_QUIZZES } from '@/lib/academy/content/quizzes'
import type { AcademyLesson, AcademyTrack, AcademyTrackSlug } from '@/lib/academy/types'

export const ACADEMY_PHASE_1_TRACKS: AcademyTrack[] = [
  {
    slug: 'production',
    title: 'Production Fundamentals',
    phase: 'Phase 1',
    description: 'Sound, routing, and arrangement — the foundation before mixing.',
    moduleCount: PRODUCTION_LESSONS.length,
    readTime: '~54 min',
  },
  {
    slug: 'mixing',
    title: 'Mixing Essentials',
    phase: 'Phase 1',
    description: 'Balance, EQ, and compression for heavy mixes that translate.',
    moduleCount: MIXING_LESSONS.length,
    readTime: '~61 min',
  },
  {
    slug: 'mastering',
    title: 'Mastering Basics',
    phase: 'Phase 1',
    description: 'Loudness, limiting, and release-ready exports.',
    moduleCount: MASTERING_LESSONS.length,
    readTime: '~54 min',
  },
]

export const ACADEMY_PHASE_2_TRACKS: AcademyTrack[] = [
  {
    slug: 'recording',
    title: 'Recording Studio',
    phase: 'Phase 2',
    description: 'Microphones, room sound, doubles, and reamping — capture it right.',
    moduleCount: RECORDING_LESSONS.length,
    readTime: '~59 min',
  },
  {
    slug: 'genres',
    title: 'Genre Labs',
    phase: 'Phase 2',
    description: 'Metal, industrial, and cinematic workflows for underground releases.',
    moduleCount: GENRE_LESSONS.length,
    readTime: '~61 min',
  },
]

export const ACADEMY_PHASE_3_TRACKS: AcademyTrack[] = [
  {
    slug: 'ear-training',
    title: 'Ear Training',
    phase: 'Phase 3',
    description: 'Frequency, dynamics, and reference listening — train judgment you can trust.',
    moduleCount: EAR_TRAINING_LESSONS.length,
    readTime: '~54 min',
  },
  {
    slug: 'release',
    title: 'Release & Delivery',
    phase: 'Phase 3',
    description: 'Timeline, metadata, distribution QC, and post-release archive habits.',
    moduleCount: RELEASE_LESSONS.length,
    readTime: '~51 min',
  },
]

export const ACADEMY_TRACKS: AcademyTrack[] = [
  ...ACADEMY_PHASE_1_TRACKS,
  ...ACADEMY_PHASE_2_TRACKS,
  ...ACADEMY_PHASE_3_TRACKS,
]

export const ALL_ACADEMY_LESSONS: AcademyLesson[] = [
  ...PRODUCTION_LESSONS,
  ...MIXING_LESSONS,
  ...MASTERING_LESSONS,
  ...RECORDING_LESSONS,
  ...GENRE_LESSONS,
  ...EAR_TRAINING_LESSONS,
  ...RELEASE_LESSONS,
]

export const ACADEMY_HUB_STATS = [
  { label: 'Lessons', value: String(ALL_ACADEMY_LESSONS.length) },
  { label: 'Tracks', value: String(ACADEMY_TRACKS.length) },
  { label: 'Quizzes', value: String(ACADEMY_QUIZZES.length) },
  { label: 'Cost', value: '$0' },
] as const

export function getTrackBySlug(slug: string): AcademyTrack | undefined {
  return ACADEMY_TRACKS.find((t) => t.slug === slug)
}

export function getLessonsForTrack(trackSlug: AcademyTrackSlug): AcademyLesson[] {
  return ALL_ACADEMY_LESSONS.filter((l) => l.trackSlug === trackSlug)
}

export function getLesson(trackSlug: string, lessonSlug: string): AcademyLesson | undefined {
  return ALL_ACADEMY_LESSONS.find(
    (l) => l.trackSlug === trackSlug && l.slug === lessonSlug.toLowerCase()
  )
}

export function getAdjacentLessons(lesson: AcademyLesson): {
  prev: AcademyLesson | null
  next: AcademyLesson | null
} {
  const trackLessons = getLessonsForTrack(lesson.trackSlug)
  const idx = trackLessons.findIndex((l) => l.id === lesson.id)
  return {
    prev: idx > 0 ? trackLessons[idx - 1] : null,
    next: idx < trackLessons.length - 1 ? trackLessons[idx + 1] : null,
  }
}

export function getQuizBySlug(slug: string) {
  return ACADEMY_QUIZZES.find((q) => q.slug === slug.toLowerCase())
}

export function getQuizForTrack(trackSlug: AcademyTrackSlug) {
  return ACADEMY_QUIZZES.find((q) => q.trackSlug === trackSlug)
}

export { ACADEMY_QUIZZES } from '@/lib/academy/content/quizzes'
