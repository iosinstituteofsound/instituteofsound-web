export type ProfileViewTab = 'posts' | 'about' | 'photos'

export type UpdateProfileInput = {
  name?: string
  username?: string | null
  bio?: string | null
  avatarUrl?: string | null
  avatarCrop?: import('@/shared/types/auth.types').AvatarCrop | null
  coverUrl?: string | null
  coverCrop?: import('@/shared/types/auth.types').CoverCrop | null
  linkUrl?: string | null
  privacySettings?: Partial<import('@/shared/types/auth.types').PrivacySettings>
}

export type ProfileAvatarSelection = {
  avatarUrl: string
  avatarCrop: import('@/shared/types/auth.types').AvatarCrop
}

export type ProfileCoverSelection = {
  coverUrl: string
  coverCrop: import('@/shared/types/auth.types').CoverCrop
}
