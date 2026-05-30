import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { localAwardDb } from '@/lib/community/localDb'
import { evaluateWeeklyChallenges } from '@/lib/community/challengeService'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import { repoAwardDb, type AwardDbInput } from '@/lib/community/awardRepository'

export type { AwardDbInput }

export async function awardDb(input: AwardDbInput): Promise<boolean> {
  if (input.amount <= 0) return false

  if (!isSupabaseConfigured()) {
    const { awarded } = localAwardDb(input.source, input.sourceId, input.amount)
    if (awarded) window.dispatchEvent(new Event(COMMUNITY_DB_EVENT))
    return awarded
  }

  try {
    const awarded = await repoAwardDb(getSupabase(), input)
    if (awarded) {
      window.dispatchEvent(new Event(COMMUNITY_DB_EVENT))
      void evaluateWeeklyChallenges()
    }
    return awarded
  } catch (err) {
    console.warn('[community] awardDb failed', err instanceof Error ? err.message : err)
    return false
  }
}
