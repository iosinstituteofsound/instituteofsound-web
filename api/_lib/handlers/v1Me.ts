import { requireAuth, fetchMemberProfile } from '../auth.js'
import { methodNotAllowed, type ApiRequest, type ApiResponse } from '../http.js'

export async function handleV1Me(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const auth = await requireAuth(req)
  if ('error' in auth) {
    return res.status(auth.status).json({ error: auth.error })
  }

  try {
    const user = await fetchMemberProfile(auth)
    return res.status(200).json({ user })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load profile'
    return res.status(500).json({ error: message })
  }
}
