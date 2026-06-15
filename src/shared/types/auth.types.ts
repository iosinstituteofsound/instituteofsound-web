export type DashboardPersona = 'event_promoter' | 'artist_manager' | 'label' | 'brand'

export type ScopeType = 'global' | 'organization' | 'region' | 'tribe' | 'resource'

export interface PrivacySettings {
  showEmail: boolean
  showBio: boolean
  showListeningActivity: boolean
  allowDirectMessages: boolean
}

export interface CoverCrop {
  x: number
  y: number
  z: number
}

export interface AvatarCrop {
  x: number
  y: number
  r: number
}

export interface AuthzRoleInfo {
  id: string
  slug: string
  name: string
  scopes: { type: ScopeType; refId?: string; label: string }[]
}

import type { LayoutConfig } from '@/shared/types/layout.types'

export interface LayoutSummary {
  id: string
  slug: string
  name: string
  shell: string
  navGroups: { title: string; items: { id: string; label: string; resourceName?: string }[] }[]
  defaultRoute: string
  defaultSidebarItemId?: string
  config: LayoutConfig
  sidebarItemIds: string[]
  isActive?: boolean
}

export interface ScopeSummary {
  id: string
  slug: string
  name: string
  kind: 'permission' | 'http'
  permissionSlug?: string
  httpMethod?: string
  pathPattern?: string
}

export interface ResourceSummary {
  id: string
  type: 'PAGE' | 'COMPONENT'
  name: string
  path: string
  isActive?: boolean
}

export interface UserAuthorization {
  roles: AuthzRoleInfo[]
  assignedRoles: AuthzRoleInfo[]
  activeRoleId: string
  permissions: string[]
  attributes: Record<string, string>
  isSuperAdmin: boolean
  scopes?: ScopeSummary[]
  resources?: ResourceSummary[]
  scopeSlugs?: string[]
  resourceNames?: string[]
  availableLayouts?: LayoutSummary[]
  preferredLayoutId?: string
  activeLayout?: LayoutSummary
}

export interface UserDto {
  id: string
  email: string
  name: string
  dashboardPersona?: DashboardPersona
  avatarUrl?: string
  avatarCrop?: AvatarCrop
  coverUrl?: string
  coverCrop?: CoverCrop
  orgLabel?: string
  linkUrl?: string
  username?: string
  bio?: string
  isVerified?: boolean
  privacySettings?: PrivacySettings
  createdAt: string
  authorization?: UserAuthorization
}

export interface MeResponse {
  user: UserDto
  authorization: UserAuthorization
}
