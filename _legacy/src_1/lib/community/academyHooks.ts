import { awardDb } from '@/lib/community/awardDb'
import { DB_REWARDS, earLabDbAmount } from '@/lib/community/dbRewards'
import { getCommunityGenreId } from '@/lib/community/genreContext'
import { evaluateWeeklyChallenges } from '@/lib/community/challengeService'
import { tryGrantBadge } from '@/lib/community/grantBadge'
import type { EarLabMode } from '@/lib/academy/earLab'

function tribeGenreId(): string | null {
  return getCommunityGenreId()
}

let communityUserId: string | null = null

export function setCommunityUserId(userId: string | null): void {
  communityUserId = userId
}

export function getCommunityUserId(): string | null {
  return communityUserId
}

export async function awardLessonCompleteDb(lessonId: string): Promise<void> {
  if (!communityUserId) return
  const awarded = await awardDb({
    userId: communityUserId,
    source: 'lesson_complete',
    sourceId: lessonId,
    amount: DB_REWARDS.lesson_complete,
    genreId: tribeGenreId(),
  })
  if (awarded) {
    void tryGrantBadge('first_signal')
    void evaluateWeeklyChallenges()
  }
}

export async function awardQuizPassDb(quizId: string): Promise<void> {
  if (!communityUserId) return
  const awarded = await awardDb({
    userId: communityUserId,
    source: 'quiz_pass',
    sourceId: quizId,
    amount: DB_REWARDS.quiz_pass,
    genreId: tribeGenreId(),
  })
  if (awarded) {
    void tryGrantBadge('quiz_locked')
    void evaluateWeeklyChallenges()
  }
}

export async function awardEarLabPassDb(mode: EarLabMode, scaledScore: number): Promise<void> {
  if (!communityUserId) return
  const amount = earLabDbAmount(scaledScore)
  if (amount <= 0) return
  const awarded = await awardDb({
    userId: communityUserId,
    source: 'ear_lab_pass',
    sourceId: mode,
    amount,
    genreId: tribeGenreId(),
  })
  if (awarded) {
    void tryGrantBadge('golden_ear')
    void evaluateWeeklyChallenges()
  }
}
