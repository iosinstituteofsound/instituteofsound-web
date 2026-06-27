import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'

export interface FollowUserDto {
  id: string
  name: string
  username?: string
  avatarUrl?: string
  avatarThumbnailUrl?: string
  isVerified?: boolean
  followedAt: string
}

export interface FollowListResponse {
  users: FollowUserDto[]
  nextCursor: string | null
}

export interface FollowStatsDto {
  followerCount: number
  followingCount: number
  isFollowing?: boolean
}

export interface FollowStatusDto {
  following: boolean
}

export async function followUser(userId: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<FollowStatusDto>>(
    `${API_V1}/users/${userId}/follow`,
  )
  return data.data
}

export async function unfollowUser(userId: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<FollowStatusDto>>(
    `${API_V1}/users/${userId}/follow`,
  )
  return data.data
}

export async function getFollowStatus(userId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<FollowStatusDto>>(
    `${API_V1}/users/${userId}/follow-status`,
  )
  return data.data
}

export async function getFollowStats(userId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<FollowStatsDto>>(
    `${API_V1}/users/${userId}/follow-stats`,
  )
  return data.data
}

export async function listFollowers(userId: string, params?: { limit?: number; cursor?: string }) {
  const { data } = await apiClient.get<ApiSuccessResponse<FollowListResponse>>(
    `${API_V1}/users/${userId}/followers`,
    { params },
  )
  return data.data
}

export async function listFollowing(userId: string, params?: { limit?: number; cursor?: string }) {
  const { data } = await apiClient.get<ApiSuccessResponse<FollowListResponse>>(
    `${API_V1}/users/${userId}/following`,
    { params },
  )
  return data.data
}
