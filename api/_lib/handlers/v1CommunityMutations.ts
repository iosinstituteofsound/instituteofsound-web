import {
  repoHideOwnPost,
  repoTogglePostReaction,
  repoUpdateOwnDrop,
  repoUpdateOwnSpin,
} from '../../../src/lib/community/feedRepository.js'
import { validateSpinInput } from '../../../src/lib/community/musicLinks.js'
import type { FeedReactionKind } from '../../../src/lib/community/feedTypes.js'
import { loadPostAuthor } from '../communityAuthor.js'
import { friendlyPostError, serverCreateDropPost, serverCreateSpinPost } from '../communityPostLogic.js'
import { requireAuth, fetchMemberProfile } from '../auth.js'
import { createSupabaseUserClient } from '../supabaseServer.js'
import { methodNotAllowed, queryParam, type ApiRequest, type ApiResponse } from '../http.js'
import { parseValidatedBody, requireValidatedBody, sendValidationError } from '../validate.js'
import { zUuid } from '../schemas/v1Common.js'
import {
  communityDropCreateBody,
  communityDropUpdateBody,
  communityPostIdBody,
  communityReactionBody,
  communitySpinCreateBody,
  communitySpinUpdateBody,
} from '../schemas/v1Bodies.js'

export async function handleV1CommunitySpinCreate(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })

  const body = requireValidatedBody(res, communitySpinCreateBody, req.body)
  if (!body) return

  const supabase = createSupabaseUserClient(auth.accessToken)

  try {
    const author = await loadPostAuthor(supabase, auth.authUser.id)
    const post = await serverCreateSpinPost(supabase, author, {
      spotifyRaw: body.spotifyRaw ?? '',
      youtubeRaw: body.youtubeRaw ?? '',
      caption: body.caption,
      trackTitle: body.trackTitle,
      imageUrl: body.imageUrl,
      primaryGenreId: body.primaryGenreId,
    })
    return res.status(201).json({ post })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create spin'
    return res.status(400).json({ error: message })
  }
}

export async function handleV1CommunityDropCreate(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })

  const body = requireValidatedBody(res, communityDropCreateBody, req.body)
  if (!body) return

  const supabase = createSupabaseUserClient(auth.accessToken)

  try {
    const author = await loadPostAuthor(supabase, auth.authUser.id)
    const post = await serverCreateDropPost(supabase, author, {
      text: body.text ?? '',
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl,
      linkTitle: body.linkTitle,
      linkDescription: body.linkDescription,
      linkImageUrl: body.linkImageUrl,
      primaryGenreId: body.primaryGenreId,
    })
    return res.status(201).json({ post })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create drop'
    return res.status(400).json({ error: friendlyPostError(message) })
  }
}

export async function handleV1CommunityReaction(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })

  const body = requireValidatedBody(res, communityReactionBody, req.body)
  if (!body) return

  const supabase = createSupabaseUserClient(auth.accessToken)

  try {
    const myReaction = await repoTogglePostReaction(
      supabase,
      body.postId,
      body.reaction as FeedReactionKind,
    )
    return res.status(200).json({ myReaction })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update reaction'
    return res.status(500).json({ error: message })
  }
}

export async function handleV1CommunityDropUpdate(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH'])

  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })

  const body = requireValidatedBody(res, communityDropUpdateBody, req.body)
  if (!body) return

  await fetchMemberProfile(auth)
  const supabase = createSupabaseUserClient(auth.accessToken)

  try {
    await repoUpdateOwnDrop(supabase, body.postId, body.text ?? '')
    return res.status(200).json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update post'
    return res.status(400).json({ error: friendlyPostError(message) })
  }
}

export async function handleV1CommunitySpinUpdate(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH'])

  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })

  const body = requireValidatedBody(res, communitySpinUpdateBody, req.body)
  if (!body) return

  const { spotify, youtube, error: validationError } = validateSpinInput(
    body.spotifyRaw ?? '',
    body.youtubeRaw ?? '',
  )
  if (validationError) return res.status(400).json({ error: validationError })

  await fetchMemberProfile(auth)
  const supabase = createSupabaseUserClient(auth.accessToken)

  try {
    await repoUpdateOwnSpin(supabase, body.postId, {
      p_body: body.caption?.trim().slice(0, 280) || '',
      p_track_title: body.trackTitle?.trim().slice(0, 120) || '',
      p_spotify_url: spotify?.url ?? '',
      p_youtube_url: youtube?.url ?? '',
    })
    return res.status(200).json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update post'
    return res.status(400).json({ error: message })
  }
}

export async function handleV1CommunityPostHide(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'DELETE') return methodNotAllowed(res, ['DELETE'])

  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })

  let postId: string | null = null
  const fromBody = parseValidatedBody(communityPostIdBody, req.body)
  if (fromBody.ok) {
    postId = fromBody.data.postId
  } else {
    const q = queryParam(req, 'postId')
    const qParsed = zUuid.safeParse(q)
    if (!qParsed.success) {
      return sendValidationError(res, 'postId required')
    }
    postId = qParsed.data
  }

  const supabase = createSupabaseUserClient(auth.accessToken)

  try {
    const ok = await repoHideOwnPost(supabase, postId)
    if (!ok) return res.status(404).json({ error: 'Post not found or already removed.' })
    return res.status(200).json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to remove post'
    return res.status(500).json({ error: message })
  }
}
