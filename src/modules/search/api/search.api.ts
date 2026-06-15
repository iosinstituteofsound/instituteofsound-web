import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { RoleDiscoverCategoryId } from '@/shared/data/role-discover-categories'
import type { ApiSuccessResponse } from '@/shared/types/api.types'

export interface DiscoverableRoleDto {
  id: string
  slug: string
  name: string
  description?: string
  discoverCategory: RoleDiscoverCategoryId
}

export interface DiscoverRoleSearchResult {
  roles: DiscoverableRoleDto[]
  categories: Array<{ id: RoleDiscoverCategoryId; label: string; count: number }>
  total: number
}

export interface DiscoverRoleSearchParams {
  q?: string
  category?: 'all' | 'profiles' | RoleDiscoverCategoryId
  limit?: number
}

export interface SearchProfileDto {
  id: string
  name: string
  username?: string
  email?: string
  avatarUrl?: string
  roles: string[]
  clickPath?: string | null
}

export interface SearchUsersResult {
  users: SearchProfileDto[]
  total: number
}

export async function searchDiscoverableRoles(params: DiscoverRoleSearchParams = {}) {
  const { category, ...rest } = params
  const roleCategory = category === 'profiles' ? 'all' : category

  const { data } = await apiClient.get<ApiSuccessResponse<DiscoverRoleSearchResult>>(
    `${API_V1}/search/roles`,
    { params: { ...rest, category: roleCategory } },
  )
  return data.data
}

export async function searchProfiles(q: string, limit = 24) {
  const { data } = await apiClient.get<ApiSuccessResponse<SearchUsersResult>>(
    `${API_V1}/search/users`,
    { params: { q, limit } },
  )
  return data.data
}

export interface PublicProfileDto {
  id: string
  name: string
  username?: string
  email?: string
  avatarUrl?: string
  avatarCrop?: { x: number; y: number; r: number }
  coverUrl?: string
  coverCrop?: { x: number; y: number; z: number }
  bio?: string
  orgLabel?: string
  linkUrl?: string
  isVerified?: boolean
  privacySettings?: {
    showEmail: boolean
    showBio: boolean
    showListeningActivity: boolean
    allowDirectMessages: boolean
  }
}

export async function getPublicProfile(userId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ profile: PublicProfileDto }>>(
    `${API_V1}/search/profile/${userId}`,
  )
  return data.data.profile
}
