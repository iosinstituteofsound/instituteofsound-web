import type { SupabaseClient } from '@supabase/supabase-js'

export interface AwardDbInput {
  userId: string
  source: string
  sourceId: string
  amount: number
  genreId?: string | null
}

export async function repoAwardDb(
  supabase: SupabaseClient,
  input: AwardDbInput,
): Promise<boolean> {
  if (input.amount <= 0) return false

  const { data, error } = await supabase.rpc('community_award_db', {
    p_user_id: input.userId,
    p_amount: input.amount,
    p_source: input.source,
    p_source_id: input.sourceId,
    p_genre_id: input.genreId ?? null,
  })

  if (error) {
    if (error.code === '23505') return false
    throw new Error(error.message)
  }
  return data === true
}
