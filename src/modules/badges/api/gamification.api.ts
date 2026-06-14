import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'

import type { ThemeTokens } from '@/shared/design-tokens/theme-tokens'

export type { ThemeTokens }

export interface ThemeDto {
  id: string
  slug: string
  name: string
  isDefault?: boolean
  tokens: ThemeTokens
}

export interface BadgeDto {
  id: string
  slug: string
  name: string
  description?: string
  themeId: string
  theme?: ThemeDto
}

export interface AchievementDto {
  id: string
  slug: string
  name: string
  description?: string
  criteria?: Record<string, unknown>
  badgeId?: string
}

export interface GamificationCatalog {
  badges: BadgeDto[]
  achievements: AchievementDto[]
  themes: ThemeDto[]
}

export interface UserGamificationProgress {
  badges: Array<{ badgeId: string; earnedAt: string }>
  achievements: Array<{ achievementId: string; unlockedAt: string; progress?: number }>
}

export interface UserThemeState {
  source: 'default' | 'badge'
  activeTheme: ThemeDto | null
  badge: { id: string; slug: string; name: string } | null
}

export async function getGamificationCatalog() {
  const { data } = await apiClient.get<ApiSuccessResponse<GamificationCatalog>>(
    `${API_V1}/gamification/catalog`,
  )
  return data.data
}

export async function getMyGamificationProgress() {
  const { data } = await apiClient.get<ApiSuccessResponse<UserGamificationProgress>>(
    `${API_V1}/gamification/me`,
  )
  return data.data
}

export async function getMyTheme() {
  const { data } = await apiClient.get<ApiSuccessResponse<UserThemeState>>(
    `${API_V1}/gamification/me/theme`,
  )
  return data.data
}

export async function listThemes() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ themes: ThemeDto[] }>>(
    `${API_V1}/admin/gamification/themes`,
  )
  return data.data.themes
}

export async function createTheme(input: {
  slug: string
  name: string
  tokens?: ThemeTokens
  isDefault?: boolean
}) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ theme: ThemeDto }>>(
    `${API_V1}/admin/gamification/themes`,
    input,
  )
  return data.data.theme
}

export async function updateTheme(
  id: string,
  input: Partial<{ slug: string; name: string; tokens: ThemeTokens; isDefault: boolean }>,
) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ theme: ThemeDto }>>(
    `${API_V1}/admin/gamification/themes/${id}`,
    input,
  )
  return data.data.theme
}

export async function deleteTheme(id: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ ok: boolean }>>(
    `${API_V1}/admin/gamification/themes/${id}`,
  )
  return data.data
}

export async function listBadges() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ badges: BadgeDto[] }>>(
    `${API_V1}/admin/gamification/badges`,
  )
  return data.data.badges
}

export async function createBadge(input: {
  slug: string
  name: string
  description?: string
  themeId: string
}) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ badge: BadgeDto }>>(
    `${API_V1}/admin/gamification/badges`,
    input,
  )
  return data.data.badge
}

export async function updateBadge(
  id: string,
  input: Partial<{ slug: string; name: string; description: string; themeId: string }>,
) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ badge: BadgeDto }>>(
    `${API_V1}/admin/gamification/badges/${id}`,
    input,
  )
  return data.data.badge
}

export async function deleteBadge(id: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ ok: boolean }>>(
    `${API_V1}/admin/gamification/badges/${id}`,
  )
  return data.data
}
