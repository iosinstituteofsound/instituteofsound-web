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

  const { error } = await supabase.from('community_db_events').insert({
    user_id: input.userId,
    amount: input.amount,
    source: input.source,
    source_id: input.sourceId,
    genre_id: input.genreId ?? null,
  })

  if (error) {
    if (error.code === '23505') return false
    throw new Error(error.message)
  }
  return true
}
