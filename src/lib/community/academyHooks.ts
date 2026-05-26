import { awardDb } from '@/lib/community/awardDb'
import { DB_REWARDS, earLabDbAmount } from '@/lib/community/dbRewards'
import type { EarLabMode } from '@/lib/academy/earLab'

let communityUserId: string | null = null

export function setCommunityUserId(userId: string | null): void {
  communityUserId = userId
}

export function getCommunityUserId(): string | null {
  return communityUserId
}

export async function awardLessonCompleteDb(lessonId: string): Promise<void> {
  if (!communityUserId) return
  await awardDb({
    userId: communityUserId,
    source: 'lesson_complete',
    sourceId: lessonId,
    amount: DB_REWARDS.lesson_complete,
  })
}

export async function awardQuizPassDb(quizId: string): Promise<void> {
  if (!communityUserId) return
  await awardDb({
    userId: communityUserId,
    source: 'quiz_pass',
    sourceId: quizId,
    amount: DB_REWARDS.quiz_pass,
  })
}

export async function awardEarLabPassDb(mode: EarLabMode, scaledScore: number): Promise<void> {
  if (!communityUserId) return
  const amount = earLabDbAmount(scaledScore)
  if (amount <= 0) return
  await awardDb({
    userId: communityUserId,
    source: 'ear_lab_pass',
    sourceId: mode,
    amount,
  })
}
