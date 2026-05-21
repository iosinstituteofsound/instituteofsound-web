import { getCloudinaryCloudName, getCloudinaryUploadPreset, isCloudinaryConfigured } from './config'

export type CloudinaryFolder =
  | 'ios/submissions'
  | 'ios/editorial'
  | 'ios/artists'
  | 'ios/tracks'
  | 'ios/albums'
  | 'ios/playlists'
  | 'ios/features'

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  width: number
  height: number
  bytes: number
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Use JPG, PNG, WebP, GIF, or AVIF.'
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be under 10MB.'
  }
  return null
}

export async function uploadImageToCloudinary(
  file: File,
  folder: CloudinaryFolder
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env'
    )
  }

  const validation = validateImageFile(file)
  if (validation) throw new Error(validation)

  const cloudName = getCloudinaryCloudName()
  const preset = getCloudinaryUploadPreset()

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', preset)
  body.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })

  const data = (await res.json()) as {
    error?: { message?: string }
    secure_url?: string
    public_id?: string
    width?: number
    height?: number
    bytes?: number
  }

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `Upload failed (${res.status})`)
  }

  if (!data.secure_url || !data.public_id) {
    throw new Error('Invalid Cloudinary response')
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width ?? 0,
    height: data.height ?? 0,
    bytes: data.bytes ?? file.size,
  }
}
