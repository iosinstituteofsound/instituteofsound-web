import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { localAwardDb } from '@/lib/community/localDb'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'

export interface AwardDbInput {
  userId: string
  source: string
  sourceId: string
  amount: number
  genreId?: string | null
}

export async function awardDb(input: AwardDbInput): Promise<boolean> {
  if (input.amount <= 0) return false

  if (!isSupabaseConfigured()) {
    const { awarded } = localAwardDb(input.source, input.sourceId, input.amount)
    if (awarded) window.dispatchEvent(new Event(COMMUNITY_DB_EVENT))
    return awarded
  }

  const supabase = getSupabase()
  const { error } = await supabase.from('community_db_events').insert({
    user_id: input.userId,
    amount: input.amount,
    source: input.source,
    source_id: input.sourceId,
    genre_id: input.genreId ?? null,
  })

  if (error) {
    if (error.code === '23505') return false
    console.warn('[community] awardDb failed', error.message)
    return false
  }

  window.dispatchEvent(new Event(COMMUNITY_DB_EVENT))
  return true
}
