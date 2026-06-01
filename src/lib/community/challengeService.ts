import { isSupabaseConfigured } from '@/lib/supabase/client'
import { v1EvaluateWeeklyChallenges, v1GetWeeklyChallenges } from '@/api/v1Phase5Client'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import { COMMUNITY_BADGE_EVENT } from '@/lib/community/grantBadge'

export const COMMUNITY_CHALLENGE_EVENT = 'ios-community-challenge-change'

export interface WeeklyChallenge {
  slug: string
  title: string
  description: string
  target: number
  progress: number
  rewardDb: number
  completed: boolean
}

function notifyChallenges() {
  window.dispatchEvent(new Event(COMMUNITY_CHALLENGE_EVENT))
  window.dispatchEvent(new Event(COMMUNITY_DB_EVENT))
  window.dispatchEvent(new Event(COMMUNITY_BADGE_EVENT))
}

const LOCAL_CHALLENGES_KEY = 'ios_community_challenges'

function defaultChallenges(): WeeklyChallenge[] {
  return [
    {
      slug: 'weekly_db_75',
      title: 'Signal surge',
      description: 'Earn 75 dB this week.',
      target: 75,
      progress: 0,
      rewardDb: 20,
      completed: false,
    },
    {
      slug: 'weekly_spin',
      title: 'Spin the wire',
      description: 'Post a Spin this week.',
      target: 1,
      progress: 0,
      rewardDb: 15,
      completed: false,
    },
    {
      slug: 'weekly_lesson',
      title: 'Academy lesson',
      description: 'Complete any Academy lesson this week.',
      target: 1,
      progress: 0,
      rewardDb: 15,
      completed: false,
    },
    {
      slug: 'weekly_study_wire',
      title: 'Study & transmit',
      description: 'Finish a lesson and post a Drop this week.',
      target: 1,
      progress: 0,
      rewardDb: 25,
      completed: false,
    },
    {
      slug: 'weekly_crew',
      title: 'Squad online',
      description: 'Be in a crew this week.',
      target: 1,
      progress: 0,
      rewardDb: 10,
      completed: false,
    },
  ]
}

export async function fetchWeeklyChallenges(): Promise<WeeklyChallenge[]> {
  if (!isSupabaseConfigured()) {
    try {
      const raw = localStorage.getItem(LOCAL_CHALLENGES_KEY)
      if (raw) return JSON.parse(raw) as WeeklyChallenge[]
    } catch {
      /* ignore */
    }
    return defaultChallenges()
  }

  try {
    const { challenges } = await v1GetWeeklyChallenges()
    return challenges
  } catch (err) {
    console.warn('[community] challenges', err instanceof Error ? err.message : err)
    return defaultChallenges()
  }
}

export async function evaluateWeeklyChallenges(): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  try {
    const { granted: n } = await v1EvaluateWeeklyChallenges()
    if (n > 0) notifyChallenges()
    return n
  } catch (err) {
    console.warn('[community] evaluate challenges', err instanceof Error ? err.message : err)
    return 0
  }
}
