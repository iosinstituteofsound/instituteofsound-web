import { v1Fetch } from '@/api/v1Client'
import type { CloudinaryFolder } from '@/lib/cloudinary/upload'

export interface CloudinaryUploadSign {
  cloudName: string
  apiKey: string
  uploadPreset: string
  folder: string
  timestamp: number
  signature: string
  resourceType: 'image' | 'raw'
}

export async function v1GetMediaUploadSign(input: {
  folder: CloudinaryFolder
  resourceType: 'image' | 'raw'
}): Promise<{ sign: CloudinaryUploadSign }> {
  return v1Fetch('/media/sign', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
