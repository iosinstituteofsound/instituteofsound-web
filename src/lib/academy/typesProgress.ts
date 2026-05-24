import type { EarLabMode } from '@/lib/academy/earLab'

export interface AcademyProgressSnapshot {
  completedLessons: string[]
  quizScores: Record<string, number>
  earLab: Partial<Record<EarLabMode, number>>
  certificateName: string
}

export const EMPTY_ACADEMY_PROGRESS: AcademyProgressSnapshot = {
  completedLessons: [],
  quizScores: {},
  earLab: {},
  certificateName: '',
}
