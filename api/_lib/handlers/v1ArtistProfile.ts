import type { UpsertArtistProfileInput } from '../../../src/lib/artist-profile/types.js'
import { repoGetArtistProfileByUserId, repoUpsertArtistProfile } from '../../../src/lib/artist-profile/profileRepository.js'
import { requireAuth, fetchMemberProfile } from '../auth.js'
import { createSupabaseUserClient } from '../supabaseServer.js'
import { methodNotAllowed, parseJsonBody, type ApiRequest, type ApiResponse } from '../http.js'

export async function handleV1ArtistProfile(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) {
    return res.status(auth.status).json({ error: auth.error })
  }

  const supabase = createSupabaseUserClient(auth.accessToken)

  if (req.method === 'GET') {
    try {
      const profile = await repoGetArtistProfileByUserId(supabase, auth.authUser.id)
      return res.status(200).json({ profile })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load artist profile'
      return res.status(500).json({ error: message })
    }
  }

  if (req.method === 'PUT') {
    const body = parseJsonBody<{ profile?: UpsertArtistProfileInput }>(req.body)
    const input = body?.profile
    if (!input?.displayName?.trim()) {
      return res.status(400).json({ error: 'profile.displayName is required' })
    }

    try {
      const user = await fetchMemberProfile(auth)
      const stamp = new Date().toISOString()
      const profile = await repoUpsertArtistProfile(supabase, user, {
        ...input,
        lastActivityAt: stamp,
        pageRefreshedAt: stamp,
      })
      return res.status(200).json({ profile })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save artist profile'
      return res.status(500).json({ error: message })
    }
  }

  return methodNotAllowed(res, ['GET', 'PUT'])
}
