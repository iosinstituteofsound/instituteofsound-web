import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1CreateCollabPost, v1GetCollabBoard } from '@/api/v1Phase4Client'
import {
  localCreateCollabPost,
  localGetProfileSkills,
  localListCollabPosts,
  localListResponses,
  localRespondCollab,
  localSetProfileSkills,
} from '@/lib/collab/localCollab'
import type {
  CollabBoardFilters,
  CollabBoardPost,
  CollabResponse,
  CreateCollabPostInput,
} from '@/lib/collab/types'
import { localAddNotification } from '@/lib/community/localNotifications'

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

function mapResponseRow(row: Record<string, unknown>): CollabResponse {
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

export async function fetchCollabPost(postId: string): Promise<CollabBoardPost | null> {
  if (!isSupabaseConfigured()) {
    return localListCollabPosts({}, 200).find((p) => p.id === postId) ?? null
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('collab_post_get', { p_post_id: postId })

  if (error) {
    console.warn('[collab] post', error.message)
    return null
  }

  const row = (data ?? [])[0] as Record<string, unknown> | undefined
  return row ? mapBoardRow(row) : null
}

export async function fetchCollabBoard(
  filters: CollabBoardFilters,
  limit = 40
): Promise<CollabBoardPost[]> {
  if (!isSupabaseConfigured()) {
    return localListCollabPosts(
      {
        kind: filters.kind || undefined,
        city: filters.city,
        genreSlug: filters.genreSlug,
        skill: filters.skill,
      },
      limit
    )
  }

  return viaV1Api(
    async () => {
      const { posts } = await v1GetCollabBoard({
        kind: filters.kind || undefined,
        city: filters.city,
        genreSlug: filters.genreSlug,
        skill: filters.skill,
        limit,
      })
      return posts
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('collab_board', {
        p_kind: filters.kind || null,
        p_city: filters.city || null,
        p_genre_slug: filters.genreSlug || null,
        p_skill: filters.skill || null,
        lim: limit,
      })

      if (error) {
        console.warn('[collab] board', error.message)
        return []
      }

      return (data ?? []).map((row: Record<string, unknown>) => mapBoardRow(row))
    },
  )
}

export async function createCollabPost(
  input: CreateCollabPostInput,
  localProfile?: {
    userId: string
    displayName: string
    handle: string
    avatarUrl?: string
    rank: string
  }
): Promise<string> {
  if (!isSupabaseConfigured()) {
    if (!localProfile) throw new Error('Sign in required')
    return localCreateCollabPost(localProfile.userId, localProfile, input)
  }

  return viaV1Api(
    async () => {
      const { id } = await v1CreateCollabPost(input)
      return id
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('collab_create_post', {
        p_kind: input.kind,
        p_title: input.title,
        p_body: input.body,
        p_scene_city: input.sceneCity ?? null,
        p_scene_genre_slug: input.sceneGenreSlug ?? null,
        p_skill_slugs: input.skillSlugs,
      })

      if (error) throw new Error(error.message)
      return String(data)
    },
  )
}

export async function respondToCollabPost(
  postId: string,
  message: string,
  localResponder?: {
    id: string
    displayName: string
    handle: string
    avatarUrl?: string
    rank: string
  },
  ownerUserId?: string
): Promise<string> {
  if (!isSupabaseConfigured()) {
    if (!localResponder) throw new Error('Sign in required')
    const id = localRespondCollab(postId, localResponder, message)
    if (ownerUserId && ownerUserId !== localResponder.id) {
      localAddNotification({
        kind: 'collab_response',
        title: 'New collab response',
        body: message.slice(0, 120),
        href: `/collab?post=${postId}`,
        actorId: localResponder.id,
        actorName: localResponder.displayName,
        actorHandle: localResponder.handle,
      })
    }
    return id
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('collab_respond', {
    p_post_id: postId,
    p_message: message,
  })

  if (error) throw new Error(error.message)
  return String(data)
}

export async function fetchCollabResponses(postId: string): Promise<CollabResponse[]> {
  if (!isSupabaseConfigured()) return localListResponses(postId)

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('collab_post_responses', { p_post_id: postId })

  if (error) {
    console.warn('[collab] responses', error.message)
    return []
  }

  return (data ?? []).map((row: Record<string, unknown>) => mapResponseRow(row))
}

export async function acceptCollabResponse(responseId: string): Promise<void> {
  if (!isSupabaseConfigured()) return

  const supabase = getSupabase()
  const { error } = await supabase.rpc('collab_accept_response', { p_response_id: responseId })
  if (error) throw new Error(error.message)
}

export async function confirmCollabComplete(postId: string): Promise<void> {
  if (!isSupabaseConfigured()) return

  const supabase = getSupabase()
  const { error } = await supabase.rpc('collab_confirm_complete', { p_post_id: postId })
  if (error) throw new Error(error.message)
}

export async function fetchProfileCollabSkills(
  handle: string,
  userId?: string
): Promise<string[]> {
  const h = handle.replace(/^@/, '')
  if (!isSupabaseConfigured()) {
    if (userId) return localGetProfileSkills(userId)
    const posts = localListCollabPosts({}, 200)
    const match = posts.find((p) => p.handle.replace(/^@/, '') === h)
    if (match) return localGetProfileSkills(match.userId)
    return []
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('collab_profile_skills', { p_handle: h })

  if (error) {
    console.warn('[collab] skills', error.message)
    return []
  }

  return (data ?? []).map((row: { skill_slug: string }) => row.skill_slug)
}

export async function setProfileCollabSkills(skillSlugs: string[], userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localSetProfileSkills(userId, skillSlugs)
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase.rpc('collab_set_profile_skills', {
    p_skill_slugs: skillSlugs,
  })
  if (error) throw new Error(error.message)
}

export async function fetchCollabCompletedCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('collab_completed_count', { p_user_id: userId })

  if (error) return 0
  return Number(data ?? 0)
}
