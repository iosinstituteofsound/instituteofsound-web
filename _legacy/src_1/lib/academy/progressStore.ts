import type { AcademyProgressSnapshot } from '@/lib/academy/typesProgress'
import type { EarLabMode } from '@/lib/academy/earLab'
import { EAR_LAB_TOTAL_ROUNDS } from '@/lib/academy/earLab'

const SNAPSHOT_KEY = 'ios-academy-snapshot-v1'
const LEGACY_LESSONS = 'ios-academy-progress'
const LEGACY_QUIZ = 'ios-academy-quiz-scores'
const LEGACY_EAR = 'ios-academy-ear-lab-best'

/** Stable reference for useSyncExternalStore — must not change identity unless data changes. */
let cachedSnapshot: AcademyProgressSnapshot | null = null

function migrateLegacy(): AcademyProgressSnapshot {
  const base: AcademyProgressSnapshot = {
    completedLessons: [],
    quizScores: {},
    earLab: {},
    certificateName: '',
  }

  try {
    const lessonsRaw = localStorage.getItem(LEGACY_LESSONS)
    if (lessonsRaw) {
      const parsed = JSON.parse(lessonsRaw) as string[]
      if (Array.isArray(parsed)) base.completedLessons = parsed
    }
  } catch {
    /* ignore */
  }

  try {
    const quizRaw = localStorage.getItem(LEGACY_QUIZ)
    if (quizRaw) {
      const parsed = JSON.parse(quizRaw) as Record<string, number>
      if (parsed && typeof parsed === 'object') base.quizScores = parsed
    }
  } catch {
    /* ignore */
  }

  try {
    const earRaw = localStorage.getItem(LEGACY_EAR)
    if (earRaw) {
      const n = Number(JSON.parse(earRaw))
      if (Number.isFinite(n) && n > 0) base.earLab.frequency = Math.min(EAR_LAB_TOTAL_ROUNDS, Math.round(n))
    }
  } catch {
    /* ignore */
  }

  return base
}

function loadSnapshotFromStorage(): AcademyProgressSnapshot {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return migrateLegacy()
    const parsed = JSON.parse(raw) as AcademyProgressSnapshot
    if (!parsed || typeof parsed !== 'object') return migrateLegacy()
    return {
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
      earLab: parsed.earLab && typeof parsed.earLab === 'object' ? parsed.earLab : {},
      certificateName: typeof parsed.certificateName === 'string' ? parsed.certificateName : '',
    }
  } catch {
    return migrateLegacy()
  }
}

/** Fresh read from localStorage (e.g. cloud merge). */
export function readLocalSnapshot(): AcademyProgressSnapshot {
  return loadSnapshotFromStorage()
}

/** Cached snapshot for React external store — same reference until write/patch. */
export function getStableSnapshot(): AcademyProgressSnapshot {
  if (!cachedSnapshot) {
    cachedSnapshot = loadSnapshotFromStorage()
  }
  return cachedSnapshot
}

export function writeLocalSnapshot(snapshot: AcademyProgressSnapshot): void {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot))
  cachedSnapshot = snapshot
}

export function patchLocalSnapshot(
  patch: (prev: AcademyProgressSnapshot) => AcademyProgressSnapshot
): AcademyProgressSnapshot {
  const next = patch(getStableSnapshot())
  writeLocalSnapshot(next)
  return next
}

export function clampEarScore(n: number): number {
  return Math.max(0, Math.min(EAR_LAB_TOTAL_ROUNDS, Math.round(n)))
}

export function readEarLabFromSnapshot(snapshot: AcademyProgressSnapshot): Partial<Record<EarLabMode, number>> {
  return snapshot.earLab ?? {}
}
