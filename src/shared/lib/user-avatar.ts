import type { AvatarCrop } from '@/shared/types/auth.types'

export function getUserAvatarThumbnailUrl(user: {
  avatarThumbnailUrl?: string | null
  avatarUrl?: string | null
}): string | undefined {
  return user.avatarThumbnailUrl?.trim() || user.avatarUrl?.trim() || undefined
}

export function getUserAvatarFullUrl(user: {
  avatarUrl?: string | null
}): string | undefined {
  return user.avatarUrl?.trim() || undefined
}

/** Thumbnail URL when available; otherwise original + crop for CSS rendering. */
export function getUserAvatarDisplay(user: {
  avatarThumbnailUrl?: string | null
  avatarUrl?: string | null
  avatarCrop?: AvatarCrop | null
}): { src?: string; crop?: AvatarCrop | null } {
  if (user.avatarThumbnailUrl?.trim()) {
    return { src: user.avatarThumbnailUrl.trim(), crop: null }
  }
  if (user.avatarUrl?.trim()) {
    return { src: user.avatarUrl.trim(), crop: user.avatarCrop ?? null }
  }
  return {}
}
