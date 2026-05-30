import type { SupabaseClient } from '@supabase/supabase-js'
import { slugifyArtistName, ensureUniqueSlug } from '../../../src/lib/artist-profile/slug.js'
import { validateReleaseEmbedInput } from '../../../src/lib/community/musicLinks.js'
import type { ArtistRelease, ReleaseMilestone, UpsertReleaseInput } from '../../../src/lib/releases/types.js'
import type { PublicRelease } from '../../../src/lib/releases/types.js'
import { mapDraft, mapSubmission, type DraftRow, type SubmissionRow } from '../../../src/lib/supabase/mappers.js'
import type { EditorialDraft, TrackSubmission, User } from '../../../src/lib/auth/types.js'
import type {
  CreateDraftInput,
  CreateSubmissionInput,
  ReviewSubmissionInput,
} from '../../../src/lib/submissions/service.js'

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

function mapPublic(row: Record<string, unknown>, milestones: ReleaseMilestone[]): PublicRelease {
  const isLive = Boolean(row.is_live)
  return {
    id: String(row.id),
    profileId: String(row.artist_profile_id ?? row.profile_id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: row.subtitle ? String(row.subtitle) : undefined,
    story: row.story ? String(row.story) : undefined,
    coverUrl: row.cover_url ? String(row.cover_url) : undefined,
    releaseType: row.release_type as PublicRelease['releaseType'],
    liveAt: String(row.live_at),
    status: row.status as PublicRelease['status'],
    spotifyUrl: row.spotify_url ? String(row.spotify_url) : undefined,
    youtubeUrl: row.youtube_url ? String(row.youtube_url) : undefined,
    soundcloudUrl: row.soundcloud_url ? String(row.soundcloud_url) : undefined,
    sceneCity: row.scene_city ? String(row.scene_city) : undefined,
    sceneGenreSlug: row.scene_genre_slug ? String(row.scene_genre_slug) : undefined,
    tracks: Array.isArray(row.tracks) ? (row.tracks as PublicRelease['tracks']) : [],
    linkedCommunityPostId: row.linked_community_post_id
      ? String(row.linked_community_post_id)
      : undefined,
    spinPromoted: Boolean(row.spin_promoted),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
    isLive,
    embedLocked: Boolean(row.embed_locked),
    secondsUntilLive: Number(row.seconds_until_live ?? 0),
    artistSlug: String(row.artist_slug),
    artistName: String(row.artist_name),
    artistAvatarUrl: row.artist_avatar_url ? String(row.artist_avatar_url) : undefined,
    editorialSlug: row.editorial_slug ? String(row.editorial_slug) : undefined,
    editorialTitle: row.editorial_title ? String(row.editorial_title) : undefined,
    milestones,
  }
}

async function ensureUniqueReleaseSlug(
  supabase: SupabaseClient,
  base: string,
  excludeId?: string,
): Promise<string> {
  const { data } = await supabase.from('artist_releases').select('id, slug')
  const slugs = (data ?? [])
    .filter((r) => r.id !== excludeId)
    .map((r) => r.slug as string)
  return ensureUniqueSlug(base, slugs)
}

export async function repoListReleasesForProfile(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ArtistRelease[]> {
  const { data, error } = await supabase
    .from('artist_releases')
    .select('*')
    .eq('profile_id', profileId)
    .order('live_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRelease)
}

export async function repoFetchPublicRelease(
  supabase: SupabaseClient,
  slug: string,
): Promise<PublicRelease | null> {
  const { data, error } = await supabase.rpc('release_public', { p_slug: slug })
  if (error) throw new Error(error.message)
  const row = (data ?? [])[0] as Record<string, unknown> | undefined
  if (!row) return null
  const milestones = await repoListReleaseMilestones(supabase, String(row.id))
  return mapPublic(row, milestones)
}

export async function repoListReleaseMilestones(
  supabase: SupabaseClient,
  releaseId: string,
): Promise<ReleaseMilestone[]> {
  const { data, error } = await supabase
    .from('artist_release_milestones')
    .select('*')
    .eq('release_id', releaseId)
    .order('sort_order')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapMilestone)
}

export async function repoUpsertRelease(
  supabase: SupabaseClient,
  profileId: string,
  input: UpsertReleaseInput,
  releaseId?: string,
): Promise<ArtistRelease> {
  const embed = validateReleaseEmbedInput(
    input.spotifyUrl ?? '',
    input.youtubeUrl ?? '',
    input.soundcloudUrl ?? '',
  )
  if (embed.error) throw new Error(embed.error)

  const liveAt = new Date(input.liveAt)
  if (Number.isNaN(liveAt.getTime())) throw new Error('Invalid premiere time.')
  if (!releaseId && liveAt.getTime() < Date.now() - 60_000) {
    throw new Error('Premiere must be scheduled in the future (strict live_at).')
  }

  const status = input.status === 'draft' ? 'draft' : 'scheduled'
  let slug = releaseId
    ? undefined
    : await ensureUniqueReleaseSlug(supabase, slugifyArtistName(input.slug?.trim() || input.title))

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
    return mapRelease(data)
  }

  const { data, error } = await supabase
    .from('artist_releases')
    .insert({ ...payload, spin_promoted: false })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapRelease(data)
}

export async function repoAddReleaseMilestone(
  supabase: SupabaseClient,
  releaseId: string,
  input: { kind: ReleaseMilestone['kind']; title: string; body?: string },
): Promise<ReleaseMilestone> {
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

export async function repoMarkReleaseSpinPromoted(
  supabase: SupabaseClient,
  releaseId: string,
): Promise<void> {
  const { error } = await supabase
    .from('artist_releases')
    .update({ spin_promoted: true })
    .eq('id', releaseId)
  if (error) throw new Error(error.message)
}

// —— Submissions & editorial drafts ——

export async function repoCreateSubmission(
  supabase: SupabaseClient,
  artist: User,
  input: CreateSubmissionInput,
): Promise<TrackSubmission> {
  const { data, error } = await supabase
    .from('track_submissions')
    .insert({
      artist_id: artist.id,
      artist_name: artist.name,
      artist_email: artist.email,
      project_name: input.projectName,
      genre: input.genre,
      track_title: input.trackTitle,
      description: input.description,
      stream_url: input.streamUrl,
      cover_image_url: input.coverImageUrl?.trim() || null,
      status: 'pending',
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapSubmission(data as SubmissionRow)
}

export async function repoGetSubmissionsForArtist(
  supabase: SupabaseClient,
  artistId: string,
): Promise<TrackSubmission[]> {
  const { data, error } = await supabase
    .from('track_submissions')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as SubmissionRow[]).map(mapSubmission)
}

export async function repoGetSubmissionsForEditor(
  supabase: SupabaseClient,
): Promise<TrackSubmission[]> {
  const { data, error } = await supabase
    .from('track_submissions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as SubmissionRow[]).map(mapSubmission)
}

export async function repoReviewSubmission(
  supabase: SupabaseClient,
  submissionId: string,
  editor: User,
  input: ReviewSubmissionInput,
): Promise<TrackSubmission> {
  const { data, error } = await supabase
    .from('track_submissions')
    .update({
      status: input.status,
      editor_notes: input.editorNotes?.trim() || null,
      reviewed_by_id: editor.id,
      reviewed_by_name: editor.name,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapSubmission(data as SubmissionRow)
}

export async function repoGetSubmissionById(
  supabase: SupabaseClient,
  id: string,
): Promise<TrackSubmission | null> {
  const { data, error } = await supabase
    .from('track_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapSubmission(data as SubmissionRow) : null
}

export async function repoCreateDraft(
  supabase: SupabaseClient,
  editor: User,
  input: CreateDraftInput,
  slug: string,
): Promise<EditorialDraft> {
  const featuredOnHomepage = input.featuredOnHomepage ?? input.type === 'feature'
  const { data, error } = await supabase
    .from('editorial_drafts')
    .insert({
      editor_id: editor.id,
      editor_name: editor.name,
      type: input.type,
      title: input.title,
      subject: input.subject,
      body: input.body,
      cover_image_url: input.coverImageUrl?.trim() || null,
      spotify_url: input.spotifyUrl?.trim() || null,
      youtube_url: input.youtubeUrl?.trim() || null,
      gallery_image_urls: input.galleryImageUrls?.filter(Boolean) ?? [],
      artist_profile_id: input.artistProfileId ?? null,
      linked_community_post_id: input.linkedCommunityPostId ?? null,
      slug,
      featured_on_homepage: featuredOnHomepage,
      status: 'draft',
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapDraft(data as DraftRow)
}

export async function repoGetDraftsForEditor(
  supabase: SupabaseClient,
  editorId: string,
): Promise<EditorialDraft[]> {
  const { data, error } = await supabase
    .from('editorial_drafts')
    .select('*')
    .eq('editor_id', editorId)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as DraftRow[]).map(mapDraft)
}

export async function repoPublishDraft(
  supabase: SupabaseClient,
  draftId: string,
  slug: string,
): Promise<EditorialDraft> {
  const { data: existing, error: fetchErr } = await supabase
    .from('editorial_drafts')
    .select('*')
    .eq('id', draftId)
    .single()
  if (fetchErr) throw new Error(fetchErr.message)

  const row = existing as DraftRow
  const finalSlug = slug.trim() || row.slug?.trim() || row.title
  const featuredOnHomepage = row.featured_on_homepage ?? row.type === 'feature'
  const publishedAt = new Date().toISOString()

  const { data, error } = await supabase
    .from('editorial_drafts')
    .update({
      status: 'published',
      slug: finalSlug,
      featured_on_homepage: featuredOnHomepage,
      published_at: publishedAt,
      updated_at: publishedAt,
    })
    .eq('id', draftId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapDraft(data as DraftRow)
}
