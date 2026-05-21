import { getSupabase } from '@/lib/supabase/client'
import { mapDraft, type DraftRow } from '@/lib/supabase/mappers'

export async function supabaseCountArtists(): Promise<number> {
  const supabase = getSupabase()
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'artist')

  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function supabaseGetAllDraftsForSuperEditor(): Promise<ReturnType<typeof mapDraft>[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('editorial_drafts')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as DraftRow[]).map(mapDraft)
}
