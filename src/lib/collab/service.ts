import { isSupabaseConfigured } from '@/lib/supabase/client'
import { v1CreateCollabPost, v1GetCollabBoard } from '@/api/v1Phase4Client'
import {
  v1AcceptCollabResponse,
  v1ConfirmCollabComplete,
  v1GetCollabCompletedCount,
  v1GetCollabPost,
  v1GetCollabProfileSkills,
  v1GetCollabResponses,
  v1RespondCollabPost,
  v1SetCollabProfileSkills,
} from '@/api/v1Phase5Client'
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

export async function fetchCollabPost(postId: string): Promise<CollabBoardPost | null> {
  if (!isSupabaseConfigured()) {
    return localListCollabPosts({}, 200).find((p) => p.id === postId) ?? null
  }

  const { post } = await v1GetCollabPost(postId)
  return post
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

  const { posts } = await v1GetCollabBoard({
    kind: filters.kind || undefined,
    city: filters.city,
    genreSlug: filters.genreSlug,
    skill: filters.skill,
    limit,
  })
  return posts
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

  const { id } = await v1CreateCollabPost(input)
  return id
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

  const { id } = await v1RespondCollabPost({ postId, message })
  return id
}

export async function fetchCollabResponses(postId: string): Promise<CollabResponse[]> {
  if (!isSupabaseConfigured()) return localListResponses(postId)

  const { responses } = await v1GetCollabResponses(postId)
  return responses
}

export async function acceptCollabResponse(responseId: string): Promise<void> {
  if (!isSupabaseConfigured()) return

  await v1AcceptCollabResponse(responseId)
}

export async function confirmCollabComplete(postId: string): Promise<void> {
  if (!isSupabaseConfigured()) return

  await v1ConfirmCollabComplete(postId)
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

  const { skills } = await v1GetCollabProfileSkills(h)
  return skills
}

export async function setProfileCollabSkills(skillSlugs: string[], userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localSetProfileSkills(userId, skillSlugs)
    return
  }

  await v1SetCollabProfileSkills(skillSlugs)
}

export async function fetchCollabCompletedCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  const { count } = await v1GetCollabCompletedCount(userId)
  return count
}
