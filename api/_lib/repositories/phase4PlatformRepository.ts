import type { SupabaseClient } from '@supabase/supabase-js'
import { PROFILE_COLUMNS } from '../../../src/lib/auth/profile.js'
import { mapProfile, type ProfileRow } from '../../../src/lib/supabase/mappers.js'
import { normalizeUsername, validateUsername } from '../../../src/lib/auth/username.js'
import type { User } from '../../../src/lib/auth/types.js'
import type { UpdateProfileInput } from '../../../src/lib/auth/profile.js'
import type { MyCrew } from '../../../src/lib/community/crewTypes.js'
import type { AcademyProgressSnapshot } from '../../../src/lib/academy/typesProgress.js'
import type { EarLabMode } from '../../../src/lib/academy/earLab.js'
import type { SceneEvent, PendingSceneEvent, SubmitEventInput } from '../../../src/lib/events/types.js'
import type { DiscoverPremiereCard } from '../../../src/lib/discovery/premieres.js'
import type { CollabBoardPost, CreateCollabPostInput } from '../../../src/lib/collab/types.js'
import type { DmMessage, DmThreadHeader, DmThreadStatus, DmThreadSummary } from '../../../src/lib/dm/types.js'

function mapMyCrew(row: {
  crew_id: string
  crew_name: string
  crew_slug: string
  invite_code: string
  tagline: string | null
  genre_slug: string | null
  founder_id: string
  my_role: string
  member_count: number
  weekly_db: number | string
  max_members: number
}): MyCrew {
  return {
    crewId: row.crew_id,
    name: row.crew_name,
    slug: row.crew_slug,
    inviteCode: row.invite_code,
    tagline: row.tagline ?? undefined,
    genreSlug: row.genre_slug ?? undefined,
    founderId: row.founder_id,
    myRole: row.my_role as MyCrew['myRole'],
    memberCount: row.member_count,
    weeklyDb: Number(row.weekly_db),
    maxMembers: row.max_members,
  }
}

function mapEventRow(row: Record<string, unknown>): SceneEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    eventKind: String(row.event_kind),
    sceneCity: String(row.scene_city),
    sceneGenreSlug: row.scene_genre_slug ? String(row.scene_genre_slug) : undefined,
    venueName: String(row.venue_name),
    startsAt: String(row.starts_at),
    externalUrl: String(row.external_url),
    rsvpCount: Number(row.rsvp_count ?? 0),
    viewerRsvped: Boolean(row.viewer_rsvped),
  }
}

function mapPendingRow(row: Record<string, unknown>): PendingSceneEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    eventKind: String(row.event_kind),
    sceneCity: String(row.scene_city),
    sceneGenreSlug: row.scene_genre_slug ? String(row.scene_genre_slug) : undefined,
    venueName: String(row.venue_name),
    startsAt: String(row.starts_at),
    externalUrl: String(row.external_url),
    submittedAt: String(row.submitted_at),
    submitterName: String(row.submitter_name),
    submitterHandle: String(row.submitter_handle),
  }
}

function mapBoardRow(row: Record<string, unknown>): CollabBoardPost {
  return {
    id: String(row.id),
    kind: row.kind as CollabBoardPost['kind'],
    title: String(row.title),
    body: String(row.body),
    sceneCity: row.scene_city ? String(row.scene_city) : undefined,
    sceneGenreSlug: row.scene_genre_slug ? String(row.scene_genre_slug) : undefined,
    skillSlugs: Array.isArray(row.skill_slugs) ? row.skill_slugs.map(String) : [],
    status: row.status as CollabBoardPost['status'],
    responseCount: Number(row.response_count ?? 0),
    createdAt: String(row.created_at),
    userId: String(row.user_id),
    displayName: String(row.display_name),
    handle: String(row.handle),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    communityRank: String(row.community_rank),
    ownerConfirmedAt: row.owner_confirmed_at ? String(row.owner_confirmed_at) : undefined,
    partnerConfirmedAt: row.partner_confirmed_at ? String(row.partner_confirmed_at) : undefined,
    acceptedResponderId: row.accepted_responder_id
      ? String(row.accepted_responder_id)
      : undefined,
  }
}

export async function repoUpdateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateProfileInput,
  current: User,
): Promise<User> {
  const patch: Record<string, string | null> = {}

  if (input.name !== undefined) {
    const name = input.name.trim()
    if (name.length < 2) throw new Error('Display name must be at least 2 characters.')
    patch.name = name
  }

  if (input.username !== undefined) {
    const username = normalizeUsername(input.username)
    const err = validateUsername(username, { role: current.role })
    if (err) throw new Error(err)
    patch.username = username
  }

  if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl.trim() || null
  if (input.bio !== undefined) patch.bio = input.bio.trim().slice(0, 280) || null
  if (input.dashboardPersona !== undefined) patch.dashboard_persona = input.dashboardPersona

  if (Object.keys(patch).length === 0) return current

  if (patch.username) {
    const { data: conflict } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', patch.username)
      .neq('id', userId)
      .maybeSingle()
    if (conflict) throw new Error('This username is already taken. Try another.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  const updated = mapProfile(data as ProfileRow)

  if (patch.name) {
    await supabase
      .from('editorial_drafts')
      .update({ editor_name: patch.name })
      .eq('editor_id', userId)
  }

  return updated
}

export async function repoFetchMyCrew(supabase: SupabaseClient): Promise<MyCrew | null> {
  const { data, error } = await supabase.rpc('community_my_crew')
  if (error) throw new Error(error.message)
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null
  return mapMyCrew(row)
}

export async function repoCreateCrew(
  supabase: SupabaseClient,
  input: { name: string; tagline?: string; genreSlug?: string },
): Promise<void> {
  const { error } = await supabase.rpc('community_create_crew', {
    p_name: input.name.trim(),
    p_tagline: input.tagline?.trim() || null,
    p_genre_slug: input.genreSlug || null,
  })
  if (error) throw new Error(error.message)
}

export async function repoJoinCrew(supabase: SupabaseClient, inviteCode: string): Promise<void> {
  const { error } = await supabase.rpc('community_join_crew', { p_invite_code: inviteCode.trim() })
  if (error) throw new Error(error.message)
}

export async function repoLeaveCrew(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc('community_leave_crew')
  if (error) throw new Error(error.message)
}

export async function repoDisbandCrew(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc('community_disband_crew')
  if (error) throw new Error(error.message)
}

export async function repoFetchAcademyPublicSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<AcademyProgressSnapshot | null> {
  const { data, error } = await supabase.rpc('academy_public_summary', { p_user_id: userId })
  if (error) throw new Error(error.message)
  if (!data || typeof data !== 'object') return null
  const row = data as Record<string, unknown>
  return {
    completedLessons: Array.isArray(row.completed_lessons)
      ? (row.completed_lessons as string[])
      : [],
    quizScores:
      row.quiz_scores && typeof row.quiz_scores === 'object'
        ? (row.quiz_scores as Record<string, number>)
        : {},
    earLab:
      row.ear_lab && typeof row.ear_lab === 'object'
        ? (row.ear_lab as Partial<Record<EarLabMode, number>>)
        : {},
    certificateName: typeof row.certificate_name === 'string' ? row.certificate_name : '',
  }
}

export async function repoFetchUpcomingEvents(
  supabase: SupabaseClient,
  filters: { city?: string; genreSlug?: string },
  limit: number,
): Promise<SceneEvent[]> {
  const { data, error } = await supabase.rpc('events_upcoming', {
    p_city: filters.city ?? null,
    p_genre_slug: filters.genreSlug ?? null,
    p_days_ahead: 45,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapEventRow)
}

export async function repoSubmitSceneEvent(
  supabase: SupabaseClient,
  input: SubmitEventInput,
): Promise<string> {
  const { data, error } = await supabase.rpc('events_submit', {
    p_title: input.title,
    p_description: input.description ?? null,
    p_event_kind: input.eventKind,
    p_scene_city: input.sceneCity,
    p_scene_genre_slug: input.sceneGenreSlug ?? null,
    p_venue_name: input.venueName,
    p_starts_at: new Date(input.startsAt).toISOString(),
    p_external_url: input.externalUrl,
  })
  if (error) throw new Error(error.message)
  return String(data)
}

export async function repoToggleEventRsvp(
  supabase: SupabaseClient,
  eventId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('events_rsvp_toggle', { p_event_id: eventId })
  if (error) throw new Error(error.message)
  return Boolean(data)
}

export async function repoFetchPendingEvents(
  supabase: SupabaseClient,
  limit: number,
): Promise<PendingSceneEvent[]> {
  const { data, error } = await supabase.rpc('events_pending', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapPendingRow)
}

export async function repoModerateEvent(
  supabase: SupabaseClient,
  eventId: string,
  action: 'publish' | 'reject',
  rejectionNote?: string,
): Promise<void> {
  const { error } = await supabase.rpc('events_moderate', {
    p_event_id: eventId,
    p_action: action,
    p_rejection_note: rejectionNote ?? null,
  })
  if (error) throw new Error(error.message)
}

export async function repoFetchCollabBoard(
  supabase: SupabaseClient,
  filters: {
    kind?: string | null
    city?: string | null
    genreSlug?: string | null
    skill?: string | null
  },
  limit: number,
): Promise<CollabBoardPost[]> {
  const { data, error } = await supabase.rpc('collab_board', {
    p_kind: filters.kind || null,
    p_city: filters.city || null,
    p_genre_slug: filters.genreSlug || null,
    p_skill: filters.skill || null,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapBoardRow)
}

export async function repoCreateCollabPost(
  supabase: SupabaseClient,
  input: CreateCollabPostInput,
): Promise<string> {
  const { data, error } = await supabase.rpc('collab_create_post', {
    p_kind: input.kind,
    p_title: input.title.trim(),
    p_body: input.body.trim(),
    p_scene_city: input.sceneCity || null,
    p_scene_genre_slug: input.sceneGenreSlug || null,
    p_skill_slugs: input.skillSlugs ?? [],
  })
  if (error) throw new Error(error.message)
  return String(data)
}

export async function repoDmGetOrCreateThread(
  supabase: SupabaseClient,
  otherUserId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('dm_get_or_create_thread', { p_other: otherUserId })
  if (error) throw new Error(error.message)
  return String(data)
}

export async function repoDmSendMessage(
  supabase: SupabaseClient,
  threadId: string,
  body: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('dm_send_message', {
    p_thread_id: threadId,
    p_body: body,
  })
  if (error) throw new Error(error.message)
  return String(data)
}

export async function repoDmListThreads(supabase: SupabaseClient): Promise<DmThreadSummary[]> {
  const { data, error } = await supabase.rpc('dm_list_threads')
  if (error) throw new Error(error.message)
  if (!Array.isArray(data)) return []
  return data.map(
    (row: {
      thread_id: string
      status: DmThreadStatus
      is_requester: boolean
      other_user_id: string
      other_name: string | null
      other_handle: string | null
      other_avatar_url: string | null
      last_message_body: string | null
      last_message_at: string | null
      last_sender_id: string | null
      unread_count: number | string
    }) => ({
      threadId: row.thread_id,
      status: row.status,
      isRequester: row.is_requester,
      otherUserId: row.other_user_id,
      otherName: row.other_name ?? 'Member',
      otherHandle: row.other_handle ?? 'member',
      otherAvatarUrl: row.other_avatar_url ?? undefined,
      lastMessageBody: row.last_message_body ?? undefined,
      lastMessageAt: row.last_message_at ?? undefined,
      lastSenderId: row.last_sender_id ?? undefined,
      unreadCount: Number(row.unread_count) || 0,
    }),
  )
}

export async function repoDmListMessages(
  supabase: SupabaseClient,
  threadId: string,
  limit: number,
): Promise<DmMessage[]> {
  const { data, error } = await supabase.rpc('dm_list_messages', {
    p_thread_id: threadId,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  if (!Array.isArray(data)) return []
  return data.map(
    (row: { id: string; sender_id: string; body: string; created_at: string; read_at: string | null }) => ({
      id: row.id,
      senderId: row.sender_id,
      body: row.body,
      createdAt: row.created_at,
      readAt: row.read_at ?? undefined,
    }),
  )
}

export async function repoDmThreadHeader(
  supabase: SupabaseClient,
  threadId: string,
): Promise<DmThreadHeader | null> {
  const { data, error } = await supabase.rpc('dm_thread_header', { p_thread_id: threadId })
  if (error) throw new Error(error.message)
  if (!Array.isArray(data) || data.length === 0) return null
  const row = data[0] as {
    thread_id: string
    status: DmThreadStatus
    is_requester: boolean
    other_user_id: string
    other_name: string | null
    other_handle: string | null
    other_avatar_url: string | null
  }
  return {
    threadId: row.thread_id,
    status: row.status,
    isRequester: row.is_requester,
    otherUserId: row.other_user_id,
    otherName: row.other_name ?? 'Member',
    otherHandle: row.other_handle ?? 'member',
    otherAvatarUrl: row.other_avatar_url ?? undefined,
  }
}

export async function repoDmUnreadTotal(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.rpc('dm_unread_total')
  if (error) throw new Error(error.message)
  return Number(data) || 0
}

export async function repoDmSetThreadStatus(
  supabase: SupabaseClient,
  threadId: string,
  status: 'accepted' | 'declined',
): Promise<void> {
  const { error } = await supabase.rpc('dm_set_thread_status', {
    p_thread_id: threadId,
    p_status: status,
  })
  if (error) throw new Error(error.message)
}

function genreLabel(genres: string[] | null | undefined): string {
  const g = genres?.filter(Boolean) ?? []
  if (g.length === 0) return 'UNDERGROUND'
  return g.slice(0, 2).join(' / ').toUpperCase()
}

function mapPremiereRow(row: Record<string, unknown>): DiscoverPremiereCard {
  const releaseType =
    row.release_type === 'album' || row.release_type === 'ep' ? row.release_type : 'single'
  const badge =
    row.badge === 'wire_pick' || row.badge === 'hot' || row.badge === 'new'
      ? row.badge
      : null
  return {
    trackId: String(row.track_id),
    trackTitle: String(row.track_title),
    coverUrl: row.cover_url ? String(row.cover_url) : undefined,
    streamUrl: String(row.stream_url),
    playCount: Number(row.play_count ?? 0),
    trackCreatedAt: String(row.track_created_at),
    profileId: String(row.profile_id),
    artistSlug: String(row.artist_slug),
    artistName: String(row.artist_name),
    genreLabel: genreLabel(row.genres as string[] | null),
    releaseType,
    badge,
    isEditorPick: Boolean(row.is_editor_pick),
    hourBucket: String(row.hour_bucket),
  }
}

export async function repoDiscoverPremiereFeed(
  supabase: SupabaseClient,
  limit: number,
): Promise<DiscoverPremiereCard[]> {
  const { data, error } = await supabase.rpc('discover_premiere_feed', { p_limit: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => mapPremiereRow(row))
}

export type DiscoverPremierePickRowDto = {
  id: string
  trackId: string
  profileId: string
  trackTitle: string
  artistName: string
  artistSlug: string
  badge: 'wire_pick' | 'hot' | 'new'
  sortOrder: number
  createdAt: string
}

export async function repoListDiscoverPremierePicksForDesk(
  supabase: SupabaseClient,
): Promise<DiscoverPremierePickRowDto[]> {
  const { data, error } = await supabase
    .from('discover_premiere_picks')
    .select('id, track_id, profile_id, badge, sort_order, created_at')
    .eq('active', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const rows: DiscoverPremierePickRowDto[] = []
  for (const row of data ?? []) {
    const [{ data: prof }, { data: tr }] = await Promise.all([
      supabase
        .from('artist_profiles')
        .select('slug, display_name')
        .eq('id', row.profile_id)
        .maybeSingle(),
      supabase.from('artist_tracks').select('title').eq('id', row.track_id).maybeSingle(),
    ])
    if (!prof || !tr) continue
    rows.push({
      id: row.id,
      trackId: row.track_id,
      profileId: row.profile_id,
      trackTitle: tr.title,
      artistName: prof.display_name,
      artistSlug: prof.slug,
      badge: row.badge as DiscoverPremierePickRowDto['badge'],
      sortOrder: row.sort_order ?? 0,
      createdAt: row.created_at,
    })
  }
  return rows
}

export type PremierePickSearchHitDto = {
  profile: { id: string; slug: string; displayName: string }
  track: {
    id: string
    profileId: string
    albumId?: string
    title: string
    streamUrl: string
    coverUrl?: string
    playCount: number
    sortOrder: number
    createdAt: string
  }
}

export async function repoSearchArtistTracksForPremierePick(
  supabase: SupabaseClient,
  query: string,
): Promise<PremierePickSearchHitDto[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const { data: profiles, error } = await supabase
    .from('artist_profiles')
    .select('id, slug, display_name, genres, published')
    .eq('published', true)
    .or(`slug.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(8)

  if (error) throw new Error(error.message)
  const out: PremierePickSearchHitDto[] = []

  for (const row of profiles ?? []) {
    const { data: byTitle } = await supabase
      .from('artist_tracks')
      .select('*')
      .eq('profile_id', row.id)
      .ilike('title', `%${q}%`)
      .limit(8)
    const tracks =
      byTitle && byTitle.length > 0
        ? byTitle
        : ((await supabase.from('artist_tracks').select('*').eq('profile_id', row.id).limit(8))
            .data ?? [])

    for (const t of tracks) {
      out.push({
        profile: {
          id: row.id,
          slug: row.slug,
          displayName: row.display_name,
        },
        track: {
          id: t.id,
          profileId: t.profile_id,
          albumId: t.album_id ?? undefined,
          title: t.title,
          streamUrl: t.stream_url,
          coverUrl: t.cover_url ?? undefined,
          playCount: t.play_count ?? 0,
          sortOrder: t.sort_order ?? 0,
          createdAt: t.created_at,
        },
      })
    }
  }
  return out.slice(0, 12)
}

export async function repoAddDiscoverPremierePick(
  supabase: SupabaseClient,
  input: {
    trackId: string
    profileId: string
    pickedBy: string
    badge?: 'wire_pick' | 'hot' | 'new'
    sortOrder?: number
  },
): Promise<void> {
  const badge = input.badge ?? 'wire_pick'
  const { error } = await supabase.from('discover_premiere_picks').upsert(
    {
      track_id: input.trackId,
      profile_id: input.profileId,
      picked_by: input.pickedBy,
      badge,
      sort_order: input.sortOrder ?? 0,
      active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'track_id' },
  )
  if (error) throw new Error(error.message)
}

export async function repoRemoveDiscoverPremierePick(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('discover_premiere_picks')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function repoUpgradeToArtist(
  supabase: SupabaseClient,
  displayName: string,
  slug?: string | null,
): Promise<void> {
  const { error } = await supabase.rpc('upgrade_to_artist', {
    p_display_name: displayName,
    p_slug: slug?.trim() || null,
  })
  if (error) throw new Error(error.message)
}
