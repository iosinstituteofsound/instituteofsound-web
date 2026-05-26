import type { CommunityFeedPost, FeedReactionKind } from '@/lib/community/feedTypes'

const REACTIONS_KEY = 'ios_community_reactions'

type ReactionStore = Record<string, Record<string, FeedReactionKind>>

const KEY = 'ios_community_feed'

function read(): CommunityFeedPost[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CommunityFeedPost[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(posts: CommunityFeedPost[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(posts.slice(0, 50)))
  } catch {
    /* ignore */
  }
}

export function localListFeed(limit = 30): CommunityFeedPost[] {
  return read()
    .filter((p) => p.status === 'visible')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export function localAddFeedPost(post: CommunityFeedPost): void {
  write([post, ...read()])
}

function readReactions(): ReactionStore {
  try {
    const raw = localStorage.getItem(REACTIONS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as ReactionStore
  } catch {
    return {}
  }
}

function writeReactions(store: ReactionStore) {
  try {
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

export function localApplyReactions(posts: CommunityFeedPost[], userId?: string): CommunityFeedPost[] {
  const store = readReactions()
  return posts.map((p) => {
    const byUser = store[p.id] ?? {}
    const entries = Object.entries(byUser)
    const counts = { fire: 0, headphones: 0, bolt: 0 }
    for (const [, kind] of entries) {
      counts[kind] += 1
    }
    const myReaction = userId ? byUser[userId] ?? null : null
    return { ...p, reactions: counts, myReaction }
  })
}

export function localToggleReaction(
  postId: string,
  userId: string,
  reaction: FeedReactionKind
): FeedReactionKind | null {
  const store = readReactions()
  const byUser = { ...(store[postId] ?? {}) }
  if (byUser[userId] === reaction) {
    delete byUser[userId]
    store[postId] = byUser
    writeReactions(store)
    return null
  }
  byUser[userId] = reaction
  store[postId] = byUser
  writeReactions(store)
  return reaction
}

export function localHideFeedPost(postId: string, userId: string): boolean {
  const posts = read()
  const idx = posts.findIndex((p) => p.id === postId && p.userId === userId)
  if (idx < 0) return false
  posts[idx] = { ...posts[idx]!, status: 'hidden' }
  write(posts)
  return true
}
