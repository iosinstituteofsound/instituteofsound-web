import { handleV1Me } from './handlers/v1Me.js'
import { handleV1ArtistProfile } from './handlers/v1ArtistProfile.js'
import { handleV1CommunityFeed } from './handlers/v1CommunityFeed.js'
import {
  handleV1CommunityDropCreate,
  handleV1CommunityDropUpdate,
  handleV1CommunityPostHide,
  handleV1CommunityReaction,
  handleV1CommunitySpinCreate,
  handleV1CommunitySpinUpdate,
} from './handlers/v1CommunityMutations.js'
import type { ApiRequest, ApiResponse } from './http.js'

/** Single Vercel function for all /api/v1/* routes (Hobby plan 12-function limit). */
export async function dispatchV1Api(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<void> {
  if (pathname === '/api/v1/me') {
    await handleV1Me(req, res)
    return
  }
  if (pathname === '/api/v1/artist/profile') {
    await handleV1ArtistProfile(req, res)
    return
  }
  if (pathname === '/api/v1/community/feed') {
    await handleV1CommunityFeed(req, res)
    return
  }
  if (pathname === '/api/v1/community/spins' && req.method === 'POST') {
    await handleV1CommunitySpinCreate(req, res)
    return
  }
  if (pathname === '/api/v1/community/drops') {
    if (req.method === 'PATCH') await handleV1CommunityDropUpdate(req, res)
    else await handleV1CommunityDropCreate(req, res)
    return
  }
  if (pathname === '/api/v1/community/spin' && req.method === 'PATCH') {
    await handleV1CommunitySpinUpdate(req, res)
    return
  }
  if (pathname === '/api/v1/community/reactions' && req.method === 'POST') {
    await handleV1CommunityReaction(req, res)
    return
  }
  if (pathname === '/api/v1/community/post' && req.method === 'DELETE') {
    await handleV1CommunityPostHide(req, res)
    return
  }

  res.status(404).json({ error: 'Not found' })
}
