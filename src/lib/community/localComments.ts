import type { PostComment } from '@/lib/community/commentTypes'

const KEY = 'ios_community_comments'

type Store = Record<string, PostComment[]>

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Store
  } catch {
    return {}
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

export function localListComments(postId: string, limit = 100): PostComment[] {
  return (read()[postId] ?? [])
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, limit)
}

export function localAddComment(
  postId: string,
  input: Omit<PostComment, 'id' | 'postId' | 'createdAt'>
): PostComment {
  const comment: PostComment = {
    id: crypto.randomUUID(),
    postId,
    createdAt: new Date().toISOString(),
    ...input,
  }
  const store = read()
  const list = store[postId] ?? []
  store[postId] = [...list, comment]
  write(store)
  return comment
}

export function localDeleteComment(postId: string, commentId: string, userId: string): boolean {
  const store = read()
  const list = store[postId] ?? []
  const next = list.filter((c) => !(c.id === commentId && c.userId === userId))
  if (next.length === list.length) return false
  store[postId] = next
  write(store)
  return true
}

export function localCommentCount(postId: string): number {
  return (read()[postId] ?? []).length
}
