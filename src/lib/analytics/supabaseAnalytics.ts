import { getSupabase } from '@/lib/supabase/client'
import { mapDraft, type DraftRow } from '@/lib/supabase/mappers'

async function supabaseCountProfilesByRole(role: 'member' | 'artist' | 'editor' | 'super_editor'): Promise<number> {
  const supabase = getSupabase()
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', role)

  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function supabaseCountArtists(): Promise<number> {
  const supabase = getSupabase()
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'artist')

  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function supabaseGetRoleCounts(): Promise<{
  listeners: number
  artists: number
  editors: number
  superEditors: number
  total: number
}> {
  const [listeners, artists, editors, superEditors] = await Promise.all([
    supabaseCountProfilesByRole('member'),
    supabaseCountProfilesByRole('artist'),
    supabaseCountProfilesByRole('editor'),
    supabaseCountProfilesByRole('super_editor'),
  ])

  return {
    listeners,
    artists,
    editors,
    superEditors,
    total: listeners + artists + editors + superEditors,
  }
}

export async function supabaseListArtistAccounts(): Promise<
  { id: string; email: string; name: string; createdAt: string }[]
> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, created_at')
    .eq('role', 'artist')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    createdAt: r.created_at,
  }))
}

export async function supabaseListRoleUsers(): Promise<
  { id: string; email: string; name: string; role: 'member' | 'artist' | 'editor' | 'super_editor'; createdAt: string }[]
> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, role, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    createdAt: r.created_at,
  }))
}

export async function supabaseListArtistProfiles(): Promise<
  {
    id: string
    userId: string
    slug: string
    displayName: string
    published: boolean
    createdAt: string
  }[]
> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('id, user_id, slug, display_name, published, created_at')
    .order('display_name')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    slug: r.slug,
    displayName: r.display_name,
    published: r.published,
    createdAt: r.created_at,
  }))
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
