import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { updateProfile } from '@/modules/profile/api/profile.api'
import { generateAvatarThumbnailBlobFromCrop } from '@/modules/profile/lib/profile-crop-utils'
import type { UserDto } from '@/shared/types/auth.types'

let ensureThumbnailPromise: Promise<void> | null = null

export async function ensureAvatarThumbnail(user: UserDto): Promise<UserDto | null> {
  if (!user.avatarUrl?.trim() || user.avatarThumbnailUrl?.trim() || !user.avatarCrop) {
    return null
  }

  if (ensureThumbnailPromise) {
    await ensureThumbnailPromise
    return null
  }

  ensureThumbnailPromise = (async () => {
    try {
      const blob = await generateAvatarThumbnailBlobFromCrop(user.avatarUrl!, user.avatarCrop!)
      const uploaded = await uploadMediaFile(blob, `avatar-thumb-${Date.now()}.jpg`)
      const avatarThumbnailUrl = uploaded.absoluteUrl ?? uploaded.url
      await updateProfile({ avatarThumbnailUrl })
    } catch {
      // Non-blocking: legacy crop fallback still works in profile UI
    }
  })()

  try {
    await ensureThumbnailPromise
    return null
  } finally {
    ensureThumbnailPromise = null
  }
}
