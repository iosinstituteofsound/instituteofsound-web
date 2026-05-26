import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
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

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_weekly_challenges')

  if (error) {
    console.warn('[community] challenges', error.message)
    return defaultChallenges()
  }

  return (data ?? []).map(
    (row: {
      slug: string
      title: string
      description: string
      target: number
      progress: number
      reward_db: number
      completed: boolean
    }) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      target: row.target,
      progress: row.progress,
      rewardDb: row.reward_db,
      completed: row.completed,
    })
  )
}

export async function evaluateWeeklyChallenges(): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_evaluate_weekly_challenges')

  if (error) {
    console.warn('[community] evaluate challenges', error.message)
    return 0
  }

  const granted = typeof data === 'number' ? data : 0
  if (granted > 0) notifyChallenges()
  return granted
}
