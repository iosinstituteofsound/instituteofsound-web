import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildArtistProfileDbRow,
  mapArtistProfileRow,
  type ArtistProfileOwner,
  type ArtistProfileRow,
} from './profileRow'
import { ensureUniqueSlug, slugifyArtistName } from './slug'
import type { ArtistProfile, UpsertArtistProfileInput } from './types'

export async function repoGetArtistProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<ArtistProfile | null> {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapArtistProfileRow(data as ArtistProfileRow) : null
}

export async function repoListArtistProfileSlugs(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.from('artist_profiles').select('slug')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r: { slug: string }) => r.slug)
}

export async function repoUpsertArtistProfile(
  supabase: SupabaseClient,
  user: ArtistProfileOwner,
  input: UpsertArtistProfileInput,
): Promise<ArtistProfile> {
  const existing = await repoGetArtistProfileByUserId(supabase, user.id)
  const slugs = (await repoListArtistProfileSlugs(supabase)).filter((s) => s !== existing?.slug)
  const slug =
    input.slug?.trim() ||
    existing?.slug ||
    ensureUniqueSlug(input.displayName || user.name, slugs)

  const row = {
    ...buildArtistProfileDbRow(input, user),
    slug: slugifyArtistName(slug),
    user_id: user.id,
  }

  if (existing) {
    const { data, error } = await supabase
      .from('artist_profiles')
      .update(row)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return mapArtistProfileRow(data as ArtistProfileRow)
  }

  const { data, error } = await supabase.from('artist_profiles').insert(row).select().single()
  if (error) throw new Error(error.message)
  return mapArtistProfileRow(data as ArtistProfileRow)
}
