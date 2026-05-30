import { touchArtistPageActivityByProfileId } from '@/lib/artist-profile/pageEnforcement'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { slugifyArtistName, ensureUniqueSlug } from '@/lib/artist-profile/slug'
import { validateReleaseEmbedInput } from '@/lib/community/musicLinks'
import type {
  ArtistRelease,
  ReleaseMilestone,
  UpsertReleaseInput,
} from '@/lib/releases/types'
import * as local from '@/lib/releases/localReleases'

function mapRelease(row: Record<string, unknown>): ArtistRelease {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: row.subtitle ? String(row.subtitle) : undefined,
    story: row.story ? String(row.story) : undefined,
    coverUrl: row.cover_url ? String(row.cover_url) : undefined,
    releaseType: row.release_type as ArtistRelease['releaseType'],
    liveAt: String(row.live_at),
    status: row.status as ArtistRelease['status'],
    spotifyUrl: row.spotify_url ? String(row.spotify_url) : undefined,
    youtubeUrl: row.youtube_url ? String(row.youtube_url) : undefined,
    soundcloudUrl: row.soundcloud_url ? String(row.soundcloud_url) : undefined,
    sceneCity: row.scene_city ? String(row.scene_city) : undefined,
    sceneGenreSlug: row.scene_genre_slug ? String(row.scene_genre_slug) : undefined,
    tracks: Array.isArray(row.tracks) ? (row.tracks as ArtistRelease['tracks']) : [],
    linkedCommunityPostId: row.linked_community_post_id
      ? String(row.linked_community_post_id)
      : undefined,
    spinPromoted: Boolean(row.spin_promoted),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

function mapMilestone(row: Record<string, unknown>): ReleaseMilestone {
  return {
    id: String(row.id),
    kind: row.kind as ReleaseMilestone['kind'],
    title: String(row.title),
    body: row.body ? String(row.body) : undefined,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at),
  }
}

export async function listReleasesForProfile(profileId: string): Promise<ArtistRelease[]> {
  if (!isSupabaseConfigured()) return local.localListReleasesForProfile(profileId)

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_releases')
    .select('*')
    .eq('profile_id', profileId)
    .order('live_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRelease)
}

async function ensureUniqueReleaseSlug(base: string, excludeId?: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    return ensureUniqueSlug(base, local.localAllReleaseSlugs())
  }

  const supabase = getSupabase()
  const { data } = await supabase.from('artist_releases').select('id, slug')
  const slugs = (data ?? [])
    .filter((r) => r.id !== excludeId)
    .map((r) => r.slug as string)
  return ensureUniqueSlug(base, slugs)
}

export async function upsertRelease(
  profileId: string,
  input: UpsertReleaseInput,
  releaseId?: string
): Promise<ArtistRelease> {
  const embed = validateReleaseEmbedInput(
    input.spotifyUrl ?? '',
    input.youtubeUrl ?? '',
    input.soundcloudUrl ?? ''
  )
  if (embed.error) throw new Error(embed.error)

  const liveAt = new Date(input.liveAt)
  if (Number.isNaN(liveAt.getTime())) throw new Error('Invalid premiere time.')
  if (!releaseId && liveAt.getTime() < Date.now() - 60_000) {
    throw new Error('Premiere must be scheduled in the future (strict live_at).')
  }

  const status = input.status === 'draft' ? 'draft' : 'scheduled'

  let release: ArtistRelease
  if (!isSupabaseConfigured()) {
    release = local.localUpsertRelease(profileId, { ...input, status }, releaseId)
  } else {
  const supabase = getSupabase()
  let slug = releaseId
    ? undefined
    : await ensureUniqueReleaseSlug(slugifyArtistName(input.slug?.trim() || input.title))

  if (releaseId) {
    const { data: existing } = await supabase
      .from('artist_releases')
      .select('slug')
      .eq('id', releaseId)
      .single()
    slug = existing?.slug
  }

  const payload: Record<string, unknown> = {
    profile_id: profileId,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || null,
    story: input.story?.trim() || null,
    cover_url: input.coverUrl || null,
    release_type: input.releaseType,
    live_at: liveAt.toISOString(),
    status,
    spotify_url: embed.spotify?.url ?? null,
    youtube_url: embed.youtube?.url ?? null,
    soundcloud_url: embed.soundcloud?.url ?? null,
    scene_city: input.sceneCity || null,
    scene_genre_slug: input.sceneGenreSlug || null,
    tracks: input.tracks ?? [],
    updated_at: new Date().toISOString(),
  }

  if (slug) payload.slug = slug

  if (releaseId) {
    const { data, error } = await supabase
      .from('artist_releases')
      .update(payload)
      .eq('id', releaseId)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    release = mapRelease(data)
  } else {
  const { data, error } = await supabase
    .from('artist_releases')
    .insert({ ...payload, spin_promoted: false })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  release = mapRelease(data)
  }
  }

  await touchArtistPageActivityByProfileId(profileId)
  return release
}

export async function addReleaseMilestone(
  releaseId: string,
  input: { kind: ReleaseMilestone['kind']; title: string; body?: string }
): Promise<ReleaseMilestone> {
  if (!isSupabaseConfigured()) {
    return local.localAddMilestone(releaseId, input)
  }

  const supabase = getSupabase()
  const { count } = await supabase
    .from('artist_release_milestones')
    .select('id', { count: 'exact', head: true })
    .eq('release_id', releaseId)

  const { data, error } = await supabase
    .from('artist_release_milestones')
    .insert({
      release_id: releaseId,
      kind: input.kind,
      title: input.title.trim(),
      body: input.body?.trim() || null,
      sort_order: count ?? 0,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapMilestone(data)
}

export async function listReleaseMilestones(releaseId: string): Promise<ReleaseMilestone[]> {
  if (!isSupabaseConfigured()) return local.localListMilestones(releaseId)

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_release_milestones')
    .select('*')
    .eq('release_id', releaseId)
    .order('sort_order')

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapMilestone)
}

export async function markReleaseSpinPromoted(releaseId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    local.localMarkSpinPromoted(releaseId)
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase
    .from('artist_releases')
    .update({ spin_promoted: true })
    .eq('id', releaseId)

  if (error) throw new Error(error.message)
}
