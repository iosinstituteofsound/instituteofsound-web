export interface PostComment {
  id: string
  postId: string
  userId: string
  parentId?: string
  body: string
  createdAt: string
  displayName: string
  handle: string
  avatarUrl?: string
}

export interface CommentThreadNode {
  comment: PostComment
  replies: CommentThreadNode[]
}

/** Flat API rows → nested thread (preserves chronological order within each level). */
export function buildCommentThread(comments: PostComment[]): CommentThreadNode[] {
  const nodes = new Map<string, CommentThreadNode>()
  const roots: CommentThreadNode[] = []

  for (const comment of comments) {
    nodes.set(comment.id, { comment, replies: [] })
  }

  for (const comment of comments) {
    const node = nodes.get(comment.id)!
    if (comment.parentId && nodes.has(comment.parentId)) {
      nodes.get(comment.parentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
