import {
  ACADEMY_QUIZZES,
  ALL_ACADEMY_LESSONS,
  getLessonsForTrack,
  getTrackBySlug,
} from '@/lib/academy/registry'
import type { AcademyTrackSlug } from '@/lib/academy/types'
import { EAR_LAB_MODES, EAR_LAB_PASS_SCORE } from '@/lib/academy/earLab'
import { getCompletedLessons, getEarLabScores, getQuizBestScore } from '@/lib/academy/progress'

export interface AcademyCertificateDef {
  id: string
  slug: string
  title: string
  subtitle: string
  type: 'track' | 'graduate' | 'ear-lab'
  trackSlug?: AcademyTrackSlug
}

export const ACADEMY_CERTIFICATES: AcademyCertificateDef[] = [
  {
    id: 'CERT-GRAD',
    slug: 'graduate',
    title: 'Academy Graduate',
    subtitle: 'All lessons complete · All quizzes passed',
    type: 'graduate',
  },
  {
    id: 'CERT-EAR',
    slug: 'ear-lab',
    title: 'Ear Lab Specialist',
    subtitle: 'All three Ear Lab drills passed (7/10 each)',
    type: 'ear-lab',
  },
  ...(
    [
      'production',
      'mixing',
      'mastering',
      'recording',
      'genres',
      'ear-training',
      'release',
    ] as AcademyTrackSlug[]
  ).map((trackSlug) => {
    const quiz = ACADEMY_QUIZZES.find((q) => q.trackSlug === trackSlug)
    const track = getTrackBySlug(trackSlug)
    return {
      id: `CERT-${trackSlug.toUpperCase().replace(/-/g, '')}`,
      slug: trackSlug,
      title: `${track?.title ?? trackSlug} · Track Certificate`,
      subtitle: quiz
        ? 'All lessons in track · Track quiz passed (70%+)'
        : 'All lessons in track complete',
      type: 'track' as const,
      trackSlug,
    }
  }),
]

export interface CertificateStatus {
  cert: AcademyCertificateDef
  earned: boolean
  detail: string
}

function trackLessonsComplete(trackSlug: AcademyTrackSlug): boolean {
  const lessons = getLessonsForTrack(trackSlug)
  const done = new Set(getCompletedLessons())
  return lessons.length > 0 && lessons.every((l) => done.has(l.id))
}

function trackQuizPassed(trackSlug: AcademyTrackSlug): boolean {
  const quiz = ACADEMY_QUIZZES.find((q) => q.trackSlug === trackSlug)
  if (!quiz) return true
  const best = getQuizBestScore(quiz.id)
  return typeof best === 'number' && best >= quiz.passPercent
}

export function getCertificateStatus(cert: AcademyCertificateDef): CertificateStatus {
  if (cert.type === 'ear-lab') {
    const scores = getEarLabScores()
    const parts = EAR_LAB_MODES.map((m) => ({
      label: m.label,
      score: scores[m.id] ?? 0,
      pass: (scores[m.id] ?? 0) >= EAR_LAB_PASS_SCORE,
    }))
    const earned = parts.every((p) => p.pass)
    const detail = earned
      ? 'Frequency, level, and compression drills passed'
      : parts.map((p) => `${p.label}: ${p.score}/10`).join(' · ')
    return { cert, earned, detail }
  }

  if (cert.type === 'graduate') {
    const done = new Set(getCompletedLessons())
    const lessonsDone = ALL_ACADEMY_LESSONS.every((l) => done.has(l.id))
    const quizzesDone = ACADEMY_QUIZZES.every((q) => {
      const best = getQuizBestScore(q.id)
      return typeof best === 'number' && best >= q.passPercent
    })
    const earned = lessonsDone && quizzesDone
    const lessonCount = ALL_ACADEMY_LESSONS.filter((l) => done.has(l.id)).length
    const quizCount = ACADEMY_QUIZZES.filter((q) => {
      const best = getQuizBestScore(q.id)
      return typeof best === 'number' && best >= q.passPercent
    }).length
    return {
      cert,
      earned,
      detail: earned
        ? 'Full curriculum complete'
        : `${lessonCount}/${ALL_ACADEMY_LESSONS.length} lessons · ${quizCount}/${ACADEMY_QUIZZES.length} quizzes passed`,
    }
  }

  if (cert.type === 'track' && cert.trackSlug) {
    const lessonsOk = trackLessonsComplete(cert.trackSlug)
    const quizOk = trackQuizPassed(cert.trackSlug)
    const earned = lessonsOk && quizOk
    const lessons = getLessonsForTrack(cert.trackSlug)
    const doneCount = lessons.filter((l) => getCompletedLessons().includes(l.id)).length
    const quiz = ACADEMY_QUIZZES.find((q) => q.trackSlug === cert.trackSlug)
    const best = quiz ? getQuizBestScore(quiz.id) : null
    return {
      cert,
      earned,
      detail: earned
        ? 'Track requirements met'
        : `${doneCount}/${lessons.length} lessons${quiz ? ` · Quiz best: ${best ?? '—'}% (need ${quiz.passPercent}%)` : ''}`,
    }
  }

  return { cert, earned: false, detail: 'Requirements not met' }
}

export function getCertificateBySlug(slug: string): AcademyCertificateDef | undefined {
  return ACADEMY_CERTIFICATES.find((c) => c.slug === slug.toLowerCase())
}

export function getAllCertificateStatuses(): CertificateStatus[] {
  return ACADEMY_CERTIFICATES.map(getCertificateStatus)
}

export function getEarnedCertificateCount(): number {
  return getAllCertificateStatuses().filter((s) => s.earned).length
}
