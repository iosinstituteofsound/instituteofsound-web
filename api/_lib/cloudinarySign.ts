import { createHash } from 'crypto'
import { env, requireEnv } from './env.js'

/** Must match `CloudinaryFolder` in src/lib/cloudinary/upload.ts */
export const ALLOWED_CLOUDINARY_FOLDERS = new Set([
  'ios/submissions',
  'ios/editorial',
  'ios/editors',
  'ios/artists',
  'ios/tracks',
  'ios/albums',
  'ios/playlists',
  'ios/features',
  'ios/press-kits',
  'ios/community',
  'ios/support',
])

export type CloudinaryResourceType = 'image' | 'raw'

export interface CloudinaryUploadSignResult {
  cloudName: string
  apiKey: string
  uploadPreset: string
  folder: string
  timestamp: number
  signature: string
  resourceType: CloudinaryResourceType
}

export function isCloudinaryServerConfigured(): boolean {
  return Boolean(
    env('CLOUDINARY_CLOUD_NAME', 'VITE_CLOUDINARY_CLOUD_NAME') &&
      env('CLOUDINARY_API_KEY') &&
      env('CLOUDINARY_API_SECRET') &&
      env('CLOUDINARY_UPLOAD_PRESET', 'VITE_CLOUDINARY_UPLOAD_PRESET'),
  )
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string): string {
  const toSign =
    Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&') + apiSecret
  return createHash('sha1').update(toSign).digest('hex')
}

export function createCloudinaryUploadSignature(
  folder: string,
  resourceType: CloudinaryResourceType,
): CloudinaryUploadSignResult {
  if (!ALLOWED_CLOUDINARY_FOLDERS.has(folder)) {
    throw new Error('Upload folder not allowed')
  }
  if (resourceType !== 'image' && resourceType !== 'raw') {
    throw new Error('Invalid resource type')
  }

  const cloudName = requireEnv('CLOUDINARY_CLOUD_NAME', 'VITE_CLOUDINARY_CLOUD_NAME')
  const apiKey = requireEnv('CLOUDINARY_API_KEY')
  const apiSecret = requireEnv('CLOUDINARY_API_SECRET')
  const uploadPreset = requireEnv('CLOUDINARY_UPLOAD_PRESET', 'VITE_CLOUDINARY_UPLOAD_PRESET')
  const timestamp = Math.floor(Date.now() / 1000)

  const params: Record<string, string> = {
    folder,
    timestamp: String(timestamp),
    upload_preset: uploadPreset,
  }

  return {
    cloudName,
    apiKey,
    uploadPreset,
    folder,
    timestamp,
    signature: signCloudinaryParams(params, apiSecret),
    resourceType,
  }
}
