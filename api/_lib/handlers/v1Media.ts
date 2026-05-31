import { requireAuth } from '../auth.js'
import {
  createCloudinaryUploadSignature,
  isCloudinaryServerConfigured,
  type CloudinaryResourceType,
} from '../cloudinarySign.js'
import type { ApiRequest, ApiResponse } from '../http.js'
import { requireValidatedBody } from '../validate.js'
import { mediaSignBody } from '../schemas/v1Bodies.js'

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

  const body = requireValidatedBody(res, mediaSignBody, req.body)
  if (!body) return true

  const resourceType: CloudinaryResourceType = body.resourceType === 'raw' ? 'raw' : 'image'

  try {
    const sign = createCloudinaryUploadSignature(body.folder, resourceType)
    return send(res, 200, { sign })
  } catch (err) {
    return send(res, 400, { error: err instanceof Error ? err.message : 'Invalid upload request' })
  }
}
