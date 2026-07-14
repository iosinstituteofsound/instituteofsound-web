export type DexModuleId = 'artist' | 'editor' | 'curator' | 'listener' | 'producer'

export interface DexProfileDto {
  source: string
  version: string
  updatedAt: string
  profile: {
    userId: string
    name: string
    role: string
    rank: string
    level: number
    xp: { current: number; target: number }
    dbScore: number
    lifetimeEarned?: number
    avatarUrl?: string
    username?: string
    bio?: string
    isVerified?: boolean
    orgLabel?: string
    linkUrl?: string
    memberSince?: string
  }
  modules: DexModuleDto[]
  theme: {
    slug: string
    name: string
    tokens: Record<string, unknown>
  }
  authorization: {
    activeRoleId?: string
    assignedRoles: Array<{ id: string; slug: string; name: string }>
    isSuperAdmin: boolean
    permissions: string[]
  }
}

export interface DexModuleDto {
  id: DexModuleId
  name: string
  icon: string
  sync: number
  discoveries: number
  connections: number
  achievements: number
  artifacts: number
  tone: string
  description: string
  locked: boolean
  roleSlug?: string
}
