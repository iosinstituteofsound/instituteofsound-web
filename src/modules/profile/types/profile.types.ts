export type ProfileViewTab = 'all' | 'posts' | 'about' | 'photos'

export type UpdateProfileInput = {
  name?: string
  username?: string | null
  bio?: string | null
  avatarUrl?: string | null
  avatarThumbnailUrl?: string | null
  avatarCrop?: import('@/shared/types/auth.types').AvatarCrop | null
  coverUrl?: string | null
  coverCrop?: import('@/shared/types/auth.types').CoverCrop | null
  linkUrl?: string | null
  aboutProfile?: import('@/modules/profile/types/about-profile.types').AboutProfile
  privacySettings?: Partial<import('@/shared/types/auth.types').PrivacySettings>
}

export type ProfileAvatarSelection = {
  avatarUrl: string
  avatarThumbnailUrl: string
  avatarCrop: import('@/shared/types/auth.types').AvatarCrop
}

export type ProfileCoverSelection = {
  coverUrl: string
  coverCrop: import('@/shared/types/auth.types').CoverCrop
}
