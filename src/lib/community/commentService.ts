import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { PostComment } from '@/lib/community/commentTypes'
import {
  localAddComment,
  localDeleteComment,
  localListComments,
} from '@/lib/community/localComments'
import { localAddNotification } from '@/lib/community/localNotifications'
import { COMMUNITY_NOTIFICATION_EVENT } from '@/lib/community/notificationService'

export const COMMENT_EVENT = 'ios-community-comments-change'

type CommentRow = {
  id: string
  post_id: string
  user_id: string
  parent_id?: string | null
  body: string
  created_at: string
  display_name: string
  handle: string
  avatar_url: string | null
}

function mapRow(row: CommentRow): PostComment {
  const handle = row.handle.startsWith('@') ? row.handle : `@${row.handle}`
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    parentId: row.parent_id ?? undefined,
    body: row.body,
    createdAt: row.created_at,
    displayName: row.display_name,
    handle,
    avatarUrl: row.avatar_url ?? undefined,
  }
}

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COMMENT_EVENT))
  }
}

export async function listPostComments(postId: string, limit = 100): Promise<PostComment[]> {
  if (!postId) return []

  if (!isSupabaseConfigured()) {
    return localListComments(postId, limit)
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_post_comments_list', {
    p_post_id: postId,
    lim: limit,
  })

  if (error) {
    console.warn('[community] comments list', error.message)
    return []
  }

  return (data ?? []).map((row: CommentRow) => mapRow(row))
}

export interface AddCommentInput {
  postId: string
  body: string
  parentId?: string
  parentAuthorUserId?: string
  authorUserId: string
  authorDisplayName: string
  authorHandle: string
  authorAvatarUrl?: string
  postOwnerUserId: string
}

export async function addPostComment(input: AddCommentInput): Promise<PostComment> {
  const text = input.body.trim()
  if (text.length < 1) throw new Error('Write a comment first.')
  if (text.length > 500) throw new Error('Max 500 characters.')

  if (!isSupabaseConfigured()) {
    const comment = localAddComment(input.postId, {
      userId: input.authorUserId,
      body: text,
      displayName: input.authorDisplayName,
      handle: input.authorHandle,
      avatarUrl: input.authorAvatarUrl,
    })

    const notifyUserId = input.parentId
      ? input.parentAuthorUserId
      : input.postOwnerUserId
    if (notifyUserId && notifyUserId !== input.authorUserId) {
      localAddNotification({
        kind: 'post_comment',
        title: input.parentId
          ? `${input.authorDisplayName} replied to your comment`
          : `${input.authorDisplayName} commented on your post`,
        body: text.slice(0, 120),
        href: `/feed/${input.postId}`,
        actorId: input.authorUserId,
        actorName: input.authorDisplayName,
        actorHandle: input.authorHandle,
        actorAvatarUrl: input.authorAvatarUrl,
      })
      window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
    }

    notifyChange()
    return comment
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_post_comments_add', {
    p_post_id: input.postId,
    p_body: text,
    p_parent_id: input.parentId ?? null,
  })

  if (error) throw new Error(error.message)

  notifyChange()

  const comments = await listPostComments(input.postId, 200)
  const found = comments.find((c) => c.id === data)
  if (found) return found

  return {
    id: String(data),
    postId: input.postId,
    userId: input.authorUserId,
    parentId: input.parentId,
    body: text,
    createdAt: new Date().toISOString(),
    displayName: input.authorDisplayName,
    handle: input.authorHandle,
    avatarUrl: input.authorAvatarUrl,
  }
}

export async function deletePostComment(
  postId: string,
  commentId: string,
  userId: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    if (!localDeleteComment(postId, commentId, userId)) {
      throw new Error('Comment not found')
    }
    notifyChange()
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase.rpc('community_post_comments_delete', {
    p_comment_id: commentId,
  })

  if (error) throw new Error(error.message)
  notifyChange()
}
