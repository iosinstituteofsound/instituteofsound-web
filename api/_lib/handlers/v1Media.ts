import { requireAuth } from '../auth.js'
import {
  createCloudinaryUploadSignature,
  isCloudinaryServerConfigured,
  type CloudinaryResourceType,
} from '../cloudinarySign.js'
import { parseJsonBody, type ApiRequest, type ApiResponse } from '../http.js'

function send(res: ApiResponse, status: number, body: unknown): true {
  res.status(status).json(body)
  return true
}

export async function handleV1Media(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  if (pathname !== '/api/v1/media/sign' || req.method !== 'POST') return false

  if (!isCloudinaryServerConfigured()) {
    return send(res, 503, { error: 'Cloudinary signing is not configured on the server' })
  }

  const auth = await requireAuth(req)
  if ('error' in auth) return send(res, auth.status, { error: auth.error })

  const body = parseJsonBody<{ folder?: string; resourceType?: CloudinaryResourceType }>(req)
  if (!body?.folder?.trim()) return send(res, 400, { error: 'folder required' })

  const resourceType: CloudinaryResourceType = body.resourceType === 'raw' ? 'raw' : 'image'

  try {
    const sign = createCloudinaryUploadSignature(body.folder.trim(), resourceType)
    return send(res, 200, { sign })
  } catch (err) {
    return send(res, 400, { error: err instanceof Error ? err.message : 'Invalid upload request' })
  }
}
