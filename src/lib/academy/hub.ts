import {
  ACADEMY_TRACKS,
  ALL_ACADEMY_LESSONS,
  getLessonsForTrack,
  getTrackBySlug,
} from '@/lib/academy/registry'
import type { AcademyLesson } from '@/lib/academy/types'

export function getOrderedLessons(): AcademyLesson[] {
  return ACADEMY_TRACKS.flatMap((track) => getLessonsForTrack(track.slug))
}

/** First incomplete lesson in curriculum order, or null if all lessons are marked complete. */
export function getContinueLesson(completedLessonIds: string[]): AcademyLesson | null {
  const done = new Set(completedLessonIds)
  for (const lesson of getOrderedLessons()) {
    if (!done.has(lesson.id)) return lesson
  }
  return null
}

export interface AcademySearchHit {
  lesson: AcademyLesson
  trackTitle: string
  trackSlug: string
}

export function searchAcademyLessons(query: string): AcademySearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const hits: AcademySearchHit[] = []
  for (const track of ACADEMY_TRACKS) {
    for (const lesson of getLessonsForTrack(track.slug)) {
      const haystack = [
        lesson.id,
        lesson.title,
        lesson.summary,
        track.title,
        track.slug,
        track.phase,
      ]
        .join(' ')
        .toLowerCase()
      if (haystack.includes(q)) {
        hits.push({ lesson, trackTitle: track.title, trackSlug: track.slug })
      }
    }
  }
  return hits
}

export function getLessonProgressSummary(completedLessonIds: string[]) {
  const total = ALL_ACADEMY_LESSONS.length
  const done = completedLessonIds.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return { total, done, pct }
}

export function trackTitleForLesson(lesson: AcademyLesson): string {
  return getTrackBySlug(lesson.trackSlug)?.title ?? lesson.trackSlug
}
