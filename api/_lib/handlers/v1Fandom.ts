import { requireAuth, resolveSupabaseForRequest } from '../auth.js'
import { queryParam, type ApiRequest, type ApiResponse } from '../http.js'
import { createSupabaseUserClient } from '../supabaseServer.js'
import {
  repoFetchArtistContentChampions,
  repoFetchArtistDiscoveryDrivers,
  repoFetchArtistRecentSupport,
  repoFetchArtistSupporters,
  repoFetchDiscoverFromMyFandom,
  repoFetchDiscoverRisingArtists,
  repoFetchMyFandom,
  repoLogPostShare,
} from '../../../src/lib/fandom/fandomRepository.js'
import { requireValidatedBody } from '../validate.js'
import { communityPostIdBody } from '../schemas/v1Bodies.js'
import type { FandomWindow } from '../../../src/lib/fandom/types.js'

function parseWindow(req: ApiRequest): FandomWindow {
  const w = queryParam(req, 'window')
  return w === 'all' ? 'all' : '90d'
}

export async function handleV1Fandom(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  if (pathname === '/api/v1/fandom/my-artists' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) {
      res.status(auth.status).json({ error: auth.error })
      return true
    }
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const artists = await repoFetchMyFandom(supabase, parseWindow(req))
      res.status(200).json({ artists })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' })
    }
    return true
  }

  if (pathname === '/api/v1/fandom/artist' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) {
      res.status(auth.status).json({ error: auth.error })
      return true
    }
    const supabase = createSupabaseUserClient(auth.accessToken)
    const window = parseWindow(req)
    try {
      const [supporters, recent, champions] = await Promise.all([
        repoFetchArtistSupporters(supabase, window),
        repoFetchArtistRecentSupport(supabase),
        repoFetchArtistContentChampions(supabase, window),
      ])
      res.status(200).json({ supporters, recent, champions })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' })
    }
    return true
  }

  if (pathname === '/api/v1/fandom/discover' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) {
      res.status(resolved.status).json({ error: resolved.error })
      return true
    }
    try {
      const rising = await repoFetchDiscoverRisingArtists(resolved.supabase)
      let forYou: Awaited<ReturnType<typeof repoFetchDiscoverFromMyFandom>> = []
      if ('auth' in resolved && resolved.auth) {
        forYou = await repoFetchDiscoverFromMyFandom(resolved.supabase)
      }
      res.status(200).json({ rising, forYou })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' })
    }
    return true
  }

  if (pathname === '/api/v1/fandom/share' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) {
      res.status(auth.status).json({ error: auth.error })
      return true
    }
    const body = requireValidatedBody(res, communityPostIdBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoLogPostShare(supabase, body.postId)
      res.status(200).json({ ok: true })
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed' })
    }
    return true
  }

  return false
}
