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
  category?: 'all' | 'profiles' | 'releases' | 'playlists' | RoleDiscoverCategoryId
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
  isVerified?: boolean
}

export interface SearchUsersResult {
  users: SearchProfileDto[]
  total: number
}

export interface MusicSearchReleaseDto {
  kind: 'release'
  id: string
  title: string
  artistName?: string
  coverUrl?: string
  type?: string
  href: string
}

export interface MusicSearchTrackDto {
  kind: 'track'
  id: string
  title: string
  artistName?: string
  releaseId: string
  releaseTitle?: string
  coverUrl?: string
  href: string
}

export interface MusicSearchPlaylistDto {
  kind: 'playlist'
  id: string
  title: string
  slug: string
  coverUrl?: string
  href: string
}

export interface MusicSearchResult {
  releases: MusicSearchReleaseDto[]
  tracks: MusicSearchTrackDto[]
  playlists: MusicSearchPlaylistDto[]
  total: number
}

export type MusicSearchCategory = 'all' | 'releases' | 'playlists'

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

export async function searchMusic(
  q: string,
  opts?: { limit?: number; category?: MusicSearchCategory },
) {
  const { data } = await apiClient.get<ApiSuccessResponse<MusicSearchResult>>(
    `${API_V1}/search/music`,
    { params: { q, limit: opts?.limit, category: opts?.category ?? 'all' } },
  )
  return data.data
}

import type { AboutProfile } from '@/modules/profile/types/about-profile.types'
import type { ProfileTabDto } from '@/shared/types/profile-tabs.types'

export interface PublicProfileDto {
  id: string
  name: string
  username?: string
  email?: string
  avatarUrl?: string
  avatarThumbnailUrl?: string
  avatarCrop?: { x: number; y: number; r: number }
  coverUrl?: string
  coverCrop?: { x: number; y: number; z: number }
  bio?: string
  aboutProfile?: AboutProfile
  orgLabel?: string
  linkUrl?: string
  isVerified?: boolean
  profileTabs?: ProfileTabDto[]
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
