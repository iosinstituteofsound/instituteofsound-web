import {
  ALL_ACADEMY_LESSONS,
  ACADEMY_QUIZZES,
  getLessonsForTrack,
} from '@/lib/academy/registry'
import type { AcademyProgressSnapshot } from '@/lib/academy/typesProgress'
import type { AcademyTrackSlug } from '@/lib/academy/types'
import { rankFromDb, nextRankAfter, dbToNextRank } from '@/lib/community/ranks'
import { getCompletedLessons, getQuizScores } from '@/lib/academy/progress'

const PENDING_DROP_KEY = 'ios_pending_drop'

export interface PendingToolDrop {
  body: string
  createdAt: number
}

export function getLessonOfTheWeek(): { lessonId: string; trackSlug: AcademyTrackSlug; title: string; path: string } {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  const lesson = ALL_ACADEMY_LESSONS[week % ALL_ACADEMY_LESSONS.length]
  return {
    lessonId: lesson.id,
    trackSlug: lesson.trackSlug,
    title: lesson.title,
    path: `/academy/${lesson.trackSlug}/${lesson.slug}`,
  }
}

export function getOverallAcademyProgress(): {
  lessonPercent: number
  lessonsDone: number
  lessonsTotal: number
  quizzesPassed: number
  quizzesTotal: number
} {
  const done = new Set(getCompletedLessons())
  const lessonsTotal = ALL_ACADEMY_LESSONS.length
  const lessonsDone = ALL_ACADEMY_LESSONS.filter((l) => done.has(l.id)).length
  const quizScores = getQuizScores()
  const quizzesPassed = ACADEMY_QUIZZES.filter((q) => {
    const best = quizScores[q.id]
    return typeof best === 'number' && best >= q.passPercent
  }).length
  return {
    lessonPercent: lessonsTotal ? Math.round((lessonsDone / lessonsTotal) * 100) : 0,
    lessonsDone,
    lessonsTotal,
    quizzesPassed,
    quizzesTotal: ACADEMY_QUIZZES.length,
  }
}

export function suggestTribeSlugForTrack(trackSlug: AcademyTrackSlug): string | null {
  const map: Partial<Record<AcademyTrackSlug, string>> = {
    production: 'electronic',
    mixing: 'electronic',
    mastering: 'electronic',
    recording: 'rock',
    genres: 'metal',
    'ear-training': 'experimental',
    release: 'indie',
  }
  return map[trackSlug] ?? null
}

export function suggestTribeSlugForQuizTrack(trackSlug: AcademyTrackSlug): string | null {
  return suggestTribeSlugForTrack(trackSlug)
}

export function queueToolDropDraft(body: string): void {
  const draft: PendingToolDrop = { body: body.trim(), createdAt: Date.now() }
  try {
    sessionStorage.setItem(PENDING_DROP_KEY, JSON.stringify(draft))
  } catch {
    /* ignore */
  }
}

export function consumePendingToolDrop(): PendingToolDrop | null {
  try {
    const raw = sessionStorage.getItem(PENDING_DROP_KEY)
    if (!raw) return null
    sessionStorage.removeItem(PENDING_DROP_KEY)
    const parsed = JSON.parse(raw) as PendingToolDrop
    if (!parsed.body || Date.now() - parsed.createdAt > 60 * 60 * 1000) return null
    return parsed
  } catch {
    return null
  }
}

export function buildToolDropBody(toolName: string, detail: string): string {
  return `[${toolName}] ${detail}\n\n— shared from IOS Toolkit`
}

export function getDbMilestones(totalDb: number): {
  rank: ReturnType<typeof rankFromDb>
  nextRank: ReturnType<typeof nextRankAfter>
  dbToNext: number
  lessonDbPerWeekHint: string
} {
  const rank = rankFromDb(totalDb)
  const nextRank = nextRankAfter(rank)
  return {
    rank,
    nextRank,
    dbToNext: dbToNextRank(totalDb),
    lessonDbPerWeekHint: 'One Academy lesson ≈ 25 dB · quiz pass ≈ 20 dB · Ear Lab pass up to 50 dB',
  }
}

export function trackProgressFromSnapshot(
  snapshot: AcademyProgressSnapshot,
  trackSlug: AcademyTrackSlug
): number {
  const lessons = getLessonsForTrack(trackSlug)
  if (lessons.length === 0) return 0
  const done = new Set(snapshot.completedLessons)
  const count = lessons.filter((l) => done.has(l.id)).length
  return Math.round((count / lessons.length) * 100)
}
