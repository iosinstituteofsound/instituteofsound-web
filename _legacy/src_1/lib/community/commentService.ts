import { isSupabaseConfigured } from '@/lib/api/liveMode'
import {
  v1AddPostComment,
  v1DeletePostComment,
  v1ListPostComments,
} from '@/api/v1Phase4Client'
import type { PostComment } from '@/lib/community/commentTypes'
import {
  localAddComment,
  localDeleteComment,
  localListComments,
} from '@/lib/community/localComments'
import { localAddNotification } from '@/lib/community/localNotifications'
import { COMMUNITY_NOTIFICATION_EVENT } from '@/lib/community/notificationService'

export const COMMENT_EVENT = 'ios-community-comments-change'

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

  const { comments } = await v1ListPostComments(postId, limit)
  return comments
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
      localAddNotification(
        {
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
        },
        notifyUserId
      )
      window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
    }

    notifyChange()
    return comment
  }

  const { id } = await v1AddPostComment({
    postId: input.postId,
    body: text,
    parentId: input.parentId,
  })
  notifyChange()
  const comments = await listPostComments(input.postId, 200)
  const found = comments.find((c) => c.id === id)
  if (found) return found
  return {
    id,
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

  await v1DeletePostComment(commentId)
  notifyChange()
}
