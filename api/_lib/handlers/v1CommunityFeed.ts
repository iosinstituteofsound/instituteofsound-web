import { repoFetchCommunityFeed, repoFetchCommunityPostById } from '../../../src/lib/community/feedRepository.js'
import { resolveSupabaseForRequest } from '../auth.js'
import { methodNotAllowed, queryParam, type ApiRequest, type ApiResponse } from '../http.js'

function parseFeedQuery(req: ApiRequest) {
  const limit = Math.min(50, Math.max(1, Number(queryParam(req, 'limit') ?? 30) || 30))
  const kindRaw = queryParam(req, 'kind')
  const kind = kindRaw === 'spin' || kindRaw === 'drop' ? kindRaw : null
  return {
    limit,
    kind,
    genreSlug: queryParam(req, 'genreSlug') || null,
    followingOnly: queryParam(req, 'followingOnly') === 'true',
    cursorCreatedAt: queryParam(req, 'cursorCreatedAt') || null,
    cursorId: queryParam(req, 'cursorId') || null,
    postId: queryParam(req, 'postId') || null,
  }
}

export async function handleV1CommunityFeed(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const resolved = await resolveSupabaseForRequest(req)
  if ('error' in resolved) {
    return res.status(resolved.status).json({ error: resolved.error })
  }

  const parsed = parseFeedQuery(req)

  try {
    if (parsed.postId) {
      const post = await repoFetchCommunityPostById(resolved.supabase, parsed.postId)
      return res.status(200).json({ post })
    }

    const posts = await repoFetchCommunityFeed(resolved.supabase, {
      limit: parsed.limit,
      kind: parsed.kind as 'spin' | 'drop' | null,
      genreSlug: parsed.genreSlug,
      followingOnly: parsed.followingOnly,
      cursorCreatedAt: parsed.cursorCreatedAt,
      cursorId: parsed.cursorId,
    })
    return res.status(200).json({ posts })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load feed'
    return res.status(500).json({ error: message })
  }
}
