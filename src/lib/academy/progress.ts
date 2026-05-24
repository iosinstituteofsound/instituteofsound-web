import { scheduleCloudSync } from '@/lib/academy/cloudProgress'
import type { EarLabMode } from '@/lib/academy/earLab'
import {
  clampEarScore,
  getStableSnapshot,
  patchLocalSnapshot,
  writeLocalSnapshot,
} from '@/lib/academy/progressStore'
import type { AcademyProgressSnapshot } from '@/lib/academy/typesProgress'

const PROGRESS_EVENT = 'ios-academy-progress-change'

let syncUserId: string | null = null

export function setAcademySyncUserId(userId: string | null): void {
  syncUserId = userId
}

export function notifyProgressChange(): void {
  window.dispatchEvent(new Event(PROGRESS_EVENT))
}

export function subscribeProgressChange(listener: () => void): () => void {
  window.addEventListener(PROGRESS_EVENT, listener)
  return () => window.removeEventListener(PROGRESS_EVENT, listener)
}

function afterMutation(snapshot: AcademyProgressSnapshot): void {
  notifyProgressChange()
  if (syncUserId) scheduleCloudSync(syncUserId, snapshot)
}

export function getProgressSnapshot(): AcademyProgressSnapshot {
  return getStableSnapshot()
}

export function getCompletedLessons(): string[] {
  return getStableSnapshot().completedLessons
}

export function isLessonComplete(lessonId: string): boolean {
  return getCompletedLessons().includes(lessonId)
}

export function toggleLessonComplete(lessonId: string): boolean {
  const snapshot = patchLocalSnapshot((prev) => {
    const set = new Set(prev.completedLessons)
    if (set.has(lessonId)) set.delete(lessonId)
    else set.add(lessonId)
    return { ...prev, completedLessons: [...set] }
  })
  afterMutation(snapshot)
  return snapshot.completedLessons.includes(lessonId)
}

export function trackProgressPercent(trackLessonIds: string[]): number {
  if (trackLessonIds.length === 0) return 0
  const done = getCompletedLessons().filter((id) => trackLessonIds.includes(id)).length
  return Math.round((done / trackLessonIds.length) * 100)
}

export function getQuizScores(): Record<string, number> {
  return getStableSnapshot().quizScores
}

export function getQuizBestScore(quizId: string): number | null {
  const score = getQuizScores()[quizId]
  return typeof score === 'number' ? score : null
}

export function saveQuizScore(quizId: string, percent: number): void {
  const snapshot = patchLocalSnapshot((prev) => {
    const quizScores = { ...prev.quizScores }
    const prevScore = quizScores[quizId]
    if (prevScore === undefined || percent > prevScore) quizScores[quizId] = percent
    return { ...prev, quizScores }
  })
  afterMutation(snapshot)
}

export function getEarLabScores(): Partial<Record<EarLabMode, number>> {
  return getStableSnapshot().earLab
}

export function getEarLabScore(mode: EarLabMode): number {
  return getStableSnapshot().earLab[mode] ?? 0
}

/** @deprecated use getEarLabScore('frequency') */
export function getEarLabBest(): number {
  return getEarLabScore('frequency')
}

export function saveEarLabScore(mode: EarLabMode, correct: number): void {
  const score = clampEarScore(correct)
  const snapshot = patchLocalSnapshot((prev) => {
    const earLab = { ...prev.earLab }
    const prevBest = earLab[mode] ?? 0
    if (score > prevBest) earLab[mode] = score
    return { ...prev, earLab }
  })
  afterMutation(snapshot)
}

/** @deprecated use saveEarLabScore('frequency', correct) */
export function saveEarLabBest(correct: number): void {
  saveEarLabScore('frequency', correct)
}

export function getCertificateName(): string {
  return getStableSnapshot().certificateName.trim()
}

export function setCertificateName(name: string): void {
  const snapshot = patchLocalSnapshot((prev) => ({
    ...prev,
    certificateName: name.trim(),
  }))
  afterMutation(snapshot)
}

export function applyProgressSnapshot(snapshot: AcademyProgressSnapshot): void {
  writeLocalSnapshot(snapshot)
  afterMutation(snapshot)
}
