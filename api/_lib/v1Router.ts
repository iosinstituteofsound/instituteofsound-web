import type { ApiRequest, ApiResponse } from './http.js'

/** Lazy-load handlers so cold start does not import browser-only `@/` modules. */
export async function dispatchV1Api(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<void> {
  if (pathname === '/api/v1/me') {
    const { handleV1Me } = await import('./handlers/v1Me.js')
    await handleV1Me(req, res)
    return
  }
  if (pathname === '/api/v1/artist/profile') {
    const { handleV1ArtistProfile } = await import('./handlers/v1ArtistProfile.js')
    await handleV1ArtistProfile(req, res)
    return
  }
  {
    const { handleV1ArtistStudio } = await import('./handlers/v1ArtistStudio.js')
    if (await handleV1ArtistStudio(req, res, pathname)) return
  }
  if (pathname === '/api/v1/community/feed') {
    const { handleV1CommunityFeed } = await import('./handlers/v1CommunityFeed.js')
    await handleV1CommunityFeed(req, res)
    return
  }
  if (pathname === '/api/v1/community/spins' && req.method === 'POST') {
    const { handleV1CommunitySpinCreate } = await import('./handlers/v1CommunityMutations.js')
    await handleV1CommunitySpinCreate(req, res)
    return
  }
  if (pathname === '/api/v1/community/drops') {
    const { handleV1CommunityDropCreate, handleV1CommunityDropUpdate } = await import(
      './handlers/v1CommunityMutations.js'
    )
    if (req.method === 'PATCH') await handleV1CommunityDropUpdate(req, res)
    else await handleV1CommunityDropCreate(req, res)
    return
  }
  if (pathname === '/api/v1/community/spin' && req.method === 'PATCH') {
    const { handleV1CommunitySpinUpdate } = await import('./handlers/v1CommunityMutations.js')
    await handleV1CommunitySpinUpdate(req, res)
    return
  }
  if (pathname === '/api/v1/community/reactions' && req.method === 'POST') {
    const { handleV1CommunityReaction } = await import('./handlers/v1CommunityMutations.js')
    await handleV1CommunityReaction(req, res)
    return
  }
  if (pathname === '/api/v1/community/post' && req.method === 'DELETE') {
    const { handleV1CommunityPostHide } = await import('./handlers/v1CommunityMutations.js')
    await handleV1CommunityPostHide(req, res)
    return
  }

  {
    const { handleV1Verification } = await import('./handlers/v1Verification.js')
    if (await handleV1Verification(req, res, pathname)) return
  }
  {
    const { handleV1PlaylistCurator } = await import('./handlers/v1PlaylistCurator.js')
    if (await handleV1PlaylistCurator(req, res, pathname)) return
  }
  {
    const { handleV1ArtistRecovery } = await import('./handlers/v1ArtistRecovery.js')
    if (await handleV1ArtistRecovery(req, res, pathname)) return
  }
  {
    const { handleV1Network } = await import('./handlers/v1Network.js')
    if (await handleV1Network(req, res, pathname)) return
  }
  {
    const { handleV1Phase4Community } = await import('./handlers/v1Phase4Community.js')
    if (await handleV1Phase4Community(req, res, pathname)) return
  }
  {
    const { handleV1Phase4Content } = await import('./handlers/v1Phase4Content.js')
    if (await handleV1Phase4Content(req, res, pathname)) return
  }
  {
    const { handleV1Phase4Platform } = await import('./handlers/v1Phase4Platform.js')
    if (await handleV1Phase4Platform(req, res, pathname)) return
  }
  {
    const { handleV1Phase5 } = await import('./handlers/v1Phase5.js')
    if (await handleV1Phase5(req, res, pathname)) return
  }
  {
    const { handleV1Media } = await import('./handlers/v1Media.js')
    if (await handleV1Media(req, res, pathname)) return
  }

  res.status(404).json({ error: 'Not found' })
}
