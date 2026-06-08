import { v1GetMediaUploadSign } from '@/api/v1MediaClient'
import { isLiveApiMode } from '@/lib/api/liveMode'
import { getCloudinaryCloudName, isCloudinaryConfigured } from './config'

export type CloudinaryFolder =
  | 'ios/submissions'
  | 'ios/editorial'
  | 'ios/editors'
  | 'ios/artists'
  | 'ios/tracks'
  | 'ios/albums'
  | 'ios/playlists'
  | 'ios/features'
  | 'ios/press-kits'
  | 'ios/community'
  | 'ios/support'

const MAX_BYTES = 10 * 1024 * 1024
const MAX_PDF_BYTES = 15 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const ALLOWED_PDF_TYPES = ['application/pdf']

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

export function validatePdfFile(file: File): string | null {
  if (!ALLOWED_PDF_TYPES.includes(file.type)) {
    return 'Use a PDF file.'
  }
  if (file.size > MAX_PDF_BYTES) {
    return 'PDF must be under 15MB.'
  }
  return null
}

async function resolveUploadSign(folder: CloudinaryFolder, resourceType: 'image' | 'raw') {
  if (!isLiveApiMode()) {
    throw new Error('Sign in and start instituteofsound-api to upload files securely.')
  }
  try {
    const { sign } = await v1GetMediaUploadSign({ folder, resourceType })
    return sign
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload sign failed'
    if (/sign in required/i.test(message)) {
      throw new Error('Sign in to upload files.')
    }
    if (/503|not configured/i.test(message)) {
      throw new Error('Image upload is temporarily unavailable. Try again later or paste a URL.')
    }
    throw new Error(message)
  }
}

function appendSignedFields(
  body: FormData,
  sign: Awaited<ReturnType<typeof resolveUploadSign>>,
): void {
  body.append('api_key', sign.apiKey)
  body.append('timestamp', String(sign.timestamp))
  body.append('signature', sign.signature)
  body.append('upload_preset', sign.uploadPreset)
  body.append('folder', sign.folder)
}

export async function uploadPdfToCloudinary(
  file: File,
  folder: CloudinaryFolder
): Promise<{ url: string; publicId: string; bytes: number }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME to .env')
  }

  const validation = validatePdfFile(file)
  if (validation) throw new Error(validation)

  const sign = await resolveUploadSign(folder, 'raw')
  const cloudName = sign.cloudName || getCloudinaryCloudName()

  const body = new FormData()
  body.append('file', file)
  appendSignedFields(body, sign)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body,
  })

  const data = (await res.json()) as {
    error?: { message?: string }
    secure_url?: string
    public_id?: string
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
    bytes: data.bytes ?? file.size,
  }
}

export async function uploadImageToCloudinary(
  file: File,
  folder: CloudinaryFolder
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME to .env')
  }

  const validation = validateImageFile(file)
  if (validation) throw new Error(validation)

  const sign = await resolveUploadSign(folder, 'image')
  const cloudName = sign.cloudName || getCloudinaryCloudName()

  const body = new FormData()
  body.append('file', file)
  appendSignedFields(body, sign)

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