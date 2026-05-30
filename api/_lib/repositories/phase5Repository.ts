import type { SupabaseClient } from '@supabase/supabase-js'
import { mapProfile, type ProfileRow } from '../../../src/lib/supabase/mappers.js'
import type { User } from '../../../src/lib/auth/types.js'
import type { WeeklyChallenge } from '../../../src/lib/community/challengeService.js'

export const PROFILE_COLUMNS =
  'id, email, name, role, dashboard_persona, avatar_url, username, bio, created_at'

export async function repoFetchUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single()
  if (error) throw new Error(error.message)
  return mapProfile(data as ProfileRow)
}
import { mapFeedRow, type FeedRow } from '../../../src/lib/community/feedRow.js'
import { mapDraft, type DraftRow } from '../../../src/lib/supabase/mappers.js'
import { mapArtistProfileRow, type ArtistProfileRow } from '../../../src/lib/artist-profile/profileRow.js'
import { filterDiscoverProfiles } from '../../../src/lib/artist-profile/profileVisibility.js'
import type { ArtistProfile } from '../../../src/lib/artist-profile/types.js'
import type { CollabBoardPost, CollabResponse } from '../../../src/lib/collab/types.js'
import type { CrewLeaderboardEntry } from '../../../src/lib/community/crewTypes.js'
import type { SceneEvent } from '../../../src/lib/events/types.js'
import type { AcademyProgressSnapshot } from '../../../src/lib/academy/typesProgress.js'
import type { EarLabMode } from '../../../src/lib/academy/earLab.js'
import type {
  EditorApplication,
  EditorApplicationWithProfile,
  SubmitEditorApplicationInput,
} from '../../../src/lib/editor-applications/types.js'
import { repoAwardDb, type AwardDbInput } from '../../../src/lib/community/awardRepository.js'

function mapCollabBoardRow(row: Record<string, unknown>): CollabBoardPost {
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

function mapCollabResponseRow(row: Record<string, unknown>): CollabResponse {
  return {
    id: String(row.id),
    message: String(row.message),
    status: row.status as CollabResponse['status'],
    createdAt: String(row.created_at),
    responderId: String(row.responder_id),
    displayName: String(row.display_name),
    handle: String(row.handle),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    communityRank: String(row.community_rank),
  }
}

export async function repoCollabPostGet(
  supabase: SupabaseClient,
  postId: string,
): Promise<CollabBoardPost | null> {
  const { data, error } = await supabase.rpc('collab_post_get', { p_post_id: postId })
  if (error) throw new Error(error.message)
  const row = (data ?? [])[0] as Record<string, unknown> | undefined
  return row ? mapCollabBoardRow(row) : null
}

export async function repoCollabRespond(
  supabase: SupabaseClient,
  postId: string,
  message: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('collab_respond', {
    p_post_id: postId,
    p_message: message,
  })
  if (error) throw new Error(error.message)
  return String(data)
}

export async function repoCollabPostResponses(
  supabase: SupabaseClient,
  postId: string,
): Promise<CollabResponse[]> {
  const { data, error } = await supabase.rpc('collab_post_responses', { p_post_id: postId })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => mapCollabResponseRow(row))
}

export async function repoCollabAcceptResponse(
  supabase: SupabaseClient,
  responseId: string,
): Promise<void> {
  const { error } = await supabase.rpc('collab_accept_response', { p_response_id: responseId })
  if (error) throw new Error(error.message)
}

export async function repoCollabConfirmComplete(
  supabase: SupabaseClient,
  postId: string,
): Promise<void> {
  const { error } = await supabase.rpc('collab_confirm_complete', { p_post_id: postId })
  if (error) throw new Error(error.message)
}

export async function repoCollabProfileSkills(
  supabase: SupabaseClient,
  handle: string,
): Promise<string[]> {
  const { data, error } = await supabase.rpc('collab_profile_skills', { p_handle: handle })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: { skill_slug: string }) => row.skill_slug)
}

export async function repoCollabSetProfileSkills(
  supabase: SupabaseClient,
  skillSlugs: string[],
): Promise<void> {
  const { error } = await supabase.rpc('collab_set_profile_skills', { p_skill_slugs: skillSlugs })
  if (error) throw new Error(error.message)
}

export async function repoCollabCompletedCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('collab_completed_count', { p_user_id: userId })
  if (error) return 0
  return Number(data ?? 0)
}

export async function repoCrewWeeklyLeaderboard(
  supabase: SupabaseClient,
  limit: number,
): Promise<CrewLeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('community_crew_weekly_leaderboard', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map(
    (row: {
      crew_id: string
      crew_name: string
      crew_slug: string
      tagline: string | null
      genre_slug: string | null
      invite_code: string
      member_count: number
      weekly_db: number | string
    }) => ({
      crewId: row.crew_id,
      name: row.crew_name,
      slug: row.crew_slug,
      tagline: row.tagline ?? undefined,
      genreSlug: row.genre_slug ?? undefined,
      inviteCode: row.invite_code,
      memberCount: row.member_count,
      weeklyDb: Number(row.weekly_db),
    }),
  )
}

export async function repoEventsByScene(
  supabase: SupabaseClient,
  citySlug: string,
  genreSlug: string,
  limit: number,
): Promise<SceneEvent[]> {
  const { data, error } = await supabase.rpc('events_by_scene', {
    p_city_slug: citySlug,
    p_genre_slug: genreSlug,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
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
  }))
}

export async function repoGlobalSearch(
  supabase: SupabaseClient,
  query: string,
  limit: number,
): Promise<
  {
    category: 'user' | 'editor' | 'music'
    refId: string
    title: string
    subtitle: string | null
    imageUrl: string | null
    handle: string | null
  }[]
> {
  const { data, error } = await supabase.rpc('global_search', {
    p_query: query,
    p_limit: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
    category: row.category as 'user' | 'editor' | 'music',
    refId: String(row.ref_id),
    title: String(row.title),
    subtitle: row.subtitle ? String(row.subtitle) : null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    handle: row.handle ? String(row.handle) : null,
  }))
}

interface AcademyProgressRow {
  user_id: string
  completed_lessons: string[]
  quiz_scores: Record<string, number>
  ear_lab: Partial<Record<EarLabMode, number>>
  certificate_name: string | null
}

function rowToAcademySnapshot(row: AcademyProgressRow): AcademyProgressSnapshot {
  return {
    completedLessons: Array.isArray(row.completed_lessons) ? row.completed_lessons : [],
    quizScores: row.quiz_scores && typeof row.quiz_scores === 'object' ? row.quiz_scores : {},
    earLab: row.ear_lab && typeof row.ear_lab === 'object' ? row.ear_lab : {},
    certificateName: row.certificate_name?.trim() ?? '',
  }
}

export async function repoGetAcademyProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<AcademyProgressSnapshot | null> {
  const { data, error } = await supabase
    .from('academy_progress')
    .select('user_id, completed_lessons, quiz_scores, ear_lab, certificate_name')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return rowToAcademySnapshot(data as AcademyProgressRow)
}

export async function repoPushAcademyProgress(
  supabase: SupabaseClient,
  userId: string,
  snapshot: AcademyProgressSnapshot,
): Promise<void> {
  const { error } = await supabase.from('academy_progress').upsert(
    {
      user_id: userId,
      completed_lessons: snapshot.completedLessons,
      quiz_scores: snapshot.quizScores,
      ear_lab: snapshot.earLab,
      certificate_name: snapshot.certificateName.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (error) throw new Error(error.message)
}

export async function repoGrantBadge(
  supabase: SupabaseClient,
  slug: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('community_grant_badge', { p_badge_slug: slug })
  if (error) throw new Error(error.message)
  return data === true
}

export { repoAwardDb, type AwardDbInput }

export async function repoListPublishedArtistProfiles(
  supabase: SupabaseClient,
): Promise<ArtistProfile[]> {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('published', true)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return filterDiscoverProfiles((data as ArtistProfileRow[]).map(mapArtistProfileRow))
}

export async function repoListArtistProfilesForEditor(
  supabase: SupabaseClient,
): Promise<ArtistProfile[]> {
  const { data, error } = await supabase.from('artist_profiles').select('*').order('display_name')
  if (error) throw new Error(error.message)
  return (data as ArtistProfileRow[]).map(mapArtistProfileRow)
}

export async function repoInsertArtistAnalyticsEvent(
  supabase: SupabaseClient,
  profileId: string,
  eventType: 'profile_view' | 'track_click',
  trackId?: string,
): Promise<void> {
  const { error } = await supabase.from('artist_analytics_events').insert({
    profile_id: profileId,
    track_id: trackId ?? null,
    event_type: eventType,
  })
  if (error) throw new Error(error.message)
}

export async function repoFetchArtistAnalyticsEvents(
  supabase: SupabaseClient,
  profileId: string,
): Promise<
  {
    id: string
    profileId: string
    trackId?: string
    eventType: 'profile_view' | 'track_click'
    createdAt: string
  }[]
> {
  const since = new Date()
  since.setDate(since.getDate() - 90)
  const { data, error } = await supabase
    .from('artist_analytics_events')
    .select('id, profile_id, track_id, event_type, created_at')
    .eq('profile_id', profileId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(5000)
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    trackId: r.track_id ?? undefined,
    eventType: r.event_type as 'profile_view' | 'track_click',
    createdAt: r.created_at,
  }))
}

export async function repoSpinOfTheWeek(
  supabase: SupabaseClient,
): Promise<(ReturnType<typeof mapFeedRow> & { reactionScore: number }) | null> {
  const { data, error } = await supabase.rpc('community_spin_of_the_week')
  if (error) throw new Error(error.message)
  const row = (data ?? [])[0] as (FeedRow & { reaction_score?: number }) | undefined
  if (!row) return null
  return { ...mapFeedRow(row), reactionScore: Number(row.reaction_score ?? 0) }
}

export async function repoTribeRecentSpins(
  supabase: SupabaseClient,
  genreSlug: string,
  limit: number,
): Promise<ReturnType<typeof mapFeedRow>[]> {
  const { data, error } = await supabase.rpc('community_tribe_recent_spins', {
    p_genre_slug: genreSlug,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: FeedRow) => mapFeedRow(row))
}

export async function repoFridayWire(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('community_friday_wire')
  if (error) throw new Error(error.message)
  const row = (data ?? [])[0] as (FeedRow & {
    reaction_score?: number
    wire_live?: boolean
    next_wire_at?: string
    featured_friday?: string
  }) | undefined
  if (!row) return null
  return {
    post: mapFeedRow(row),
    reactionScore: Number(row.reaction_score ?? 0),
    wireLive: Boolean(row.wire_live),
    nextWireAt: row.next_wire_at ?? null,
    featuredFriday: row.featured_friday ?? null,
  }
}

export async function repoTribeWarMonthly(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('community_tribe_war_monthly')
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
    genreSlug: String(row.genre_slug),
    genreName: String(row.genre_name),
    totalDb: Number(row.total_db ?? 0),
    activeMembers: Number(row.active_members ?? 0),
    championUserId: row.champion_user_id ? String(row.champion_user_id) : undefined,
    championName: row.champion_name ? String(row.champion_name) : undefined,
    championHandle: row.champion_handle ? String(row.champion_handle) : undefined,
    championDb: Number(row.champion_db ?? 0),
    seasonLabel: String(row.season_label ?? ''),
  }))
}

export async function repoCrewWarsV2(supabase: SupabaseClient, limit: number) {
  const { data, error } = await supabase.rpc('community_crew_wars_v2', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
    crewId: String(row.crew_id),
    name: String(row.crew_name),
    slug: String(row.crew_slug),
    tagline: row.tagline ? String(row.tagline) : undefined,
    genreSlug: row.genre_slug ? String(row.genre_slug) : undefined,
    inviteCode: String(row.invite_code),
    memberCount: Number(row.member_count ?? 0),
    weeklyDb: Number(row.weekly_db ?? 0),
    prevWeeklyDb: Number(row.prev_weekly_db ?? 0),
    dbDelta: Number(row.db_delta ?? 0),
    seasonLabel: String(row.season_label ?? ''),
  }))
}

export async function repoWireDigest(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('community_wire_digest')
  if (error) throw new Error(error.message)
  const row = (data ?? [])[0] as Record<string, unknown> | undefined
  if (!row) return null
  return {
    seasonLabel: String(row.season_label ?? ''),
    spinTitle: row.spin_title ? String(row.spin_title) : undefined,
    spinHandle: row.spin_handle ? String(row.spin_handle) : undefined,
    spinPostId: row.spin_post_id ? String(row.spin_post_id) : undefined,
    editorialTitle: row.editorial_title ? String(row.editorial_title) : undefined,
    editorialSlug: row.editorial_slug ? String(row.editorial_slug) : undefined,
    editorialType: row.editorial_type ? String(row.editorial_type) : undefined,
    tribeWinnerGenre: row.tribe_winner_genre ? String(row.tribe_winner_genre) : undefined,
    tribeWinnerChampion: row.tribe_winner_champion ? String(row.tribe_winner_champion) : undefined,
    challengeTitle: String(row.challenge_title ?? 'Spin the wire'),
  }
}

export async function repoEditorWirePicks(supabase: SupabaseClient, limit: number) {
  const { data, error } = await supabase.rpc('community_editor_wire_picks', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: FeedRow & { reaction_score?: number }) => ({
    ...mapFeedRow(row),
    reactionScore: Number(row.reaction_score ?? 0),
  }))
}

type ApplicationRow = {
  id: string
  user_id: string
  portfolio_links: string
  motivation: string
  terms_version: string
  terms_accepted_at: string
  status: EditorApplication['status']
  reviewer_id: string | null
  reviewer_notes: string | null
  reviewed_at: string | null
  congrats_pending: boolean
  created_at: string
  updated_at: string
}

function mapEditorApplicationRow(row: ApplicationRow): EditorApplication {
  return {
    id: row.id,
    userId: row.user_id,
    portfolioLinks: row.portfolio_links,
    motivation: row.motivation,
    termsVersion: row.terms_version,
    termsAcceptedAt: row.terms_accepted_at,
    status: row.status,
    reviewerId: row.reviewer_id ?? undefined,
    reviewerNotes: row.reviewer_notes ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    congratsPending: row.congrats_pending,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function repoGetMyEditorApplication(
  supabase: SupabaseClient,
  userId: string,
): Promise<EditorApplication | null> {
  const { data, error } = await supabase
    .from('editor_applications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapEditorApplicationRow(data as ApplicationRow) : null
}

export async function repoSubmitEditorApplication(
  supabase: SupabaseClient,
  userId: string,
  input: SubmitEditorApplicationInput,
): Promise<EditorApplication> {
  const existing = await repoGetMyEditorApplication(supabase, userId)
  const payload = {
    portfolio_links: input.portfolioLinks.trim(),
    motivation: input.motivation.trim(),
    terms_version: input.termsVersion,
    terms_accepted_at: new Date().toISOString(),
    status: 'pending' as const,
    congrats_pending: false,
    updated_at: new Date().toISOString(),
  }
  if (existing?.status === 'rejected') {
    const { data, error } = await supabase
      .from('editor_applications')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return mapEditorApplicationRow(data as ApplicationRow)
  }
  if (existing) {
    throw new Error(
      existing.status === 'pending'
        ? 'Your application is already under review.'
        : 'You are already an approved editor.',
    )
  }
  const { data, error } = await supabase
    .from('editor_applications')
    .insert({ user_id: userId, ...payload })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapEditorApplicationRow(data as ApplicationRow)
}

export async function repoListEditorApplications(
  supabase: SupabaseClient,
): Promise<EditorApplicationWithProfile[]> {
  const { data, error } = await supabase
    .from('editor_applications')
    .select(`*, profiles!editor_applications_user_id_fkey ( name, email, username )`)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => {
    const app = mapEditorApplicationRow(row as ApplicationRow)
    const profile = row.profiles as {
      name: string
      email: string
      username: string | null
    } | null
    return {
      ...app,
      applicantName: profile?.name ?? 'Unknown',
      applicantEmail: profile?.email ?? '',
      applicantUsername: profile?.username ?? undefined,
    }
  })
}

export async function repoApproveEditorApplication(
  supabase: SupabaseClient,
  applicationId: string,
  reviewerId: string,
): Promise<void> {
  const { data: app, error: fetchErr } = await supabase
    .from('editor_applications')
    .select('user_id')
    .eq('id', applicationId)
    .single()
  if (fetchErr) throw new Error(fetchErr.message)
  const now = new Date().toISOString()
  const { error: appErr } = await supabase
    .from('editor_applications')
    .update({
      status: 'approved',
      reviewer_id: reviewerId,
      reviewed_at: now,
      congrats_pending: true,
      updated_at: now,
    })
    .eq('id', applicationId)
  if (appErr) throw new Error(appErr.message)
  const { error: roleErr } = await supabase
    .from('profiles')
    .update({ role: 'editor' })
    .eq('id', app.user_id)
  if (roleErr) throw new Error(roleErr.message)
}

export async function repoRejectEditorApplication(
  supabase: SupabaseClient,
  applicationId: string,
  reviewerId: string,
  notes?: string,
): Promise<void> {
  const { error } = await supabase
    .from('editor_applications')
    .update({
      status: 'rejected',
      reviewer_id: reviewerId,
      reviewer_notes: notes?.trim() || null,
      reviewed_at: new Date().toISOString(),
      congrats_pending: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
  if (error) throw new Error(error.message)
}

export async function repoAcknowledgeEditorCongrats(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('editor_applications')
    .update({ congrats_pending: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'approved')
  if (error) throw new Error(error.message)
}

export async function repoAnalyticsRoleCounts(supabase: SupabaseClient) {
  const countRole = async (role: string) => {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', role)
    if (error) throw new Error(error.message)
    return count ?? 0
  }
  const [listeners, artists, editors, superEditors] = await Promise.all([
    countRole('member'),
    countRole('artist'),
    countRole('editor'),
    countRole('super_editor'),
  ])
  return {
    listeners,
    artists,
    editors,
    superEditors,
    total: listeners + artists + editors + superEditors,
  }
}

export async function repoAnalyticsListArtistAccounts(supabase: SupabaseClient) {
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

export async function repoAnalyticsListRoleUsers(supabase: SupabaseClient) {
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

export async function repoAnalyticsListArtistProfileSummaries(supabase: SupabaseClient) {
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

export async function repoAnalyticsAllDrafts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('editorial_drafts')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as DraftRow[]).map(mapDraft)
}

export async function repoFetchWeeklyChallenges(
  supabase: SupabaseClient,
): Promise<WeeklyChallenge[]> {
  const { data, error } = await supabase.rpc('community_weekly_challenges')
  if (error) throw new Error(error.message)
  return (data ?? []).map(
    (row: {
      slug: string
      title: string
      description: string
      target: number
      progress: number
      reward_db: number
      completed: boolean
    }) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      target: row.target,
      progress: row.progress,
      rewardDb: row.reward_db,
      completed: row.completed,
    }),
  )
}

export async function repoEvaluateWeeklyChallenges(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.rpc('community_evaluate_weekly_challenges')
  if (error) throw new Error(error.message)
  return typeof data === 'number' ? data : 0
}

export async function repoUpdateEditorialLinkedPost(
  supabase: SupabaseClient,
  draftId: string,
  postId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('editorial_drafts')
    .update({
      linked_community_post_id: postId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', draftId)
  if (error) throw new Error(error.message)
}
