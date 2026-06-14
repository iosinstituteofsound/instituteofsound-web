import type { CollabBoardPost, CollabResponse, CreateCollabPostInput } from '@/lib/collab/types'

const POSTS_KEY = 'ios_collab_posts'
const RESPONSES_KEY = 'ios_collab_responses'
const SKILLS_KEY = 'ios_collab_skills'

function readPosts(): CollabBoardPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CollabBoardPost[]
  } catch {
    return []
  }
}

function writePosts(items: CollabBoardPost[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(items))
}

function readResponsesRaw(): (CollabResponse & { postId: string })[] {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as (CollabResponse & { postId: string })[]
  } catch {
    return []
  }
}

function writeResponsesRaw(items: (CollabResponse & { postId: string })[]) {
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(items))
}

export function localListCollabPosts(
  filters: {
    kind?: string
    city?: string
    genreSlug?: string
    skill?: string
  },
  limit = 40
): CollabBoardPost[] {
  return readPosts()
    .filter((p) => p.status === 'open')
    .filter((p) => !filters.kind || p.kind === filters.kind)
    .filter((p) => !filters.city || p.sceneCity?.toLowerCase() === filters.city.toLowerCase())
    .filter((p) => !filters.genreSlug || p.sceneGenreSlug === filters.genreSlug)
    .filter((p) => !filters.skill || p.skillSlugs.includes(filters.skill))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}

export function localCreateCollabPost(
  userId: string,
  profile: { displayName: string; handle: string; avatarUrl?: string; rank: string },
  input: CreateCollabPostInput
): string {
  const id = crypto.randomUUID()
  const post: CollabBoardPost = {
    id,
    kind: input.kind,
    title: input.title.trim(),
    body: input.body.trim(),
    sceneCity: input.sceneCity,
    sceneGenreSlug: input.sceneGenreSlug,
    skillSlugs: input.skillSlugs,
    status: 'open',
    responseCount: 0,
    createdAt: new Date().toISOString(),
    userId,
    displayName: profile.displayName,
    handle: profile.handle,
    avatarUrl: profile.avatarUrl,
    communityRank: profile.rank,
  }
  writePosts([post, ...readPosts()])
  return id
}

export function localRespondCollab(
  postId: string,
  responder: {
    id: string
    displayName: string
    handle: string
    avatarUrl?: string
    rank: string
  },
  message: string
): string {
  const id = crypto.randomUUID()
  const row = {
    postId,
    id,
    message: message.trim(),
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    responderId: responder.id,
    displayName: responder.displayName,
    handle: responder.handle,
    avatarUrl: responder.avatarUrl,
    communityRank: responder.rank,
  }
  writeResponsesRaw([...readResponsesRaw(), row])
  const posts = readPosts().map((p) =>
    p.id === postId ? { ...p, responseCount: p.responseCount + 1 } : p
  )
  writePosts(posts)
  return id
}

export function localListResponses(postId: string): CollabResponse[] {
  return readResponsesRaw()
    .filter((r) => r.postId === postId)
    .map(({ postId: _, ...r }) => r)
}

export function localGetProfileSkills(userId: string): string[] {
  try {
    const raw = localStorage.getItem(SKILLS_KEY)
    if (!raw) return []
    const map = JSON.parse(raw) as Record<string, string[]>
    return map[userId] ?? []
  } catch {
    return []
  }
}

export function localSetProfileSkills(userId: string, slugs: string[]) {
  try {
    const raw = localStorage.getItem(SKILLS_KEY)
    const map = raw ? (JSON.parse(raw) as Record<string, string[]>) : {}
    map[userId] = slugs
    localStorage.setItem(SKILLS_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}
