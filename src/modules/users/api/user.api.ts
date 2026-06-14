import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { MeResponse, UserAuthorization } from '@/shared/types/auth.types'

export interface UserSearchResult {
  id: string
  email: string
  name: string
  username?: string
  avatarUrl?: string
  roles: string[]
}

export interface UserDetail {
  id: string
  email: string
  name: string
  username?: string
  avatarUrl?: string
  coverUrl?: string
  bio?: string
  orgLabel?: string
  linkUrl?: string
  dashboardPersona?: string
  createdAt: string
  roles: UserRoleAssignment[]
}

export interface UserRoleAssignment {
  roleId: string
  roleName: string
  roleSlug: string
  assignedAt: string
}

export async function getMe() {
  const { data } = await apiClient.get<ApiSuccessResponse<MeResponse>>(`${API_V1}/me`)
  return data.data
}

export type SetActiveRoleResponse = Pick<
  UserAuthorization,
  | 'activeRoleId'
  | 'roles'
  | 'assignedRoles'
  | 'permissions'
  | 'resourceNames'
  | 'activeLayout'
  | 'availableLayouts'
  | 'isSuperAdmin'
>

export async function setActiveRole(roleId: string) {
  const { data } = await apiClient.patch<ApiSuccessResponse<SetActiveRoleResponse>>(
    `${API_V1}/me/active-role`,
    { roleId },
  )
  return data.data
}

export async function listUsers(q?: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ users: UserSearchResult[] }>>(
    `${API_V1}/admin/users`,
    { params: q?.trim() ? { q: q.trim() } : undefined },
  )
  return data.data.users
}

export async function searchUsers(q: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ users: UserSearchResult[] }>>(
    `${API_V1}/admin/users/search`,
    { params: { q } },
  )
  return data.data.users
}

export async function getUser(userId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ user: UserDetail }>>(
    `${API_V1}/admin/users/${userId}`,
  )
  return data.data.user
}

export async function getUserRoles(userId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ roles: UserRoleAssignment[] }>>(
    `${API_V1}/admin/users/${userId}/roles`,
  )
  return data.data.roles
}

export async function assignUserRole(userId: string, roleId: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ ok: boolean }>>(
    `${API_V1}/admin/users/${userId}/roles`,
    { roleId },
  )
  return data.data
}

export async function revokeUserRole(userId: string, roleId: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ ok: boolean }>>(
    `${API_V1}/admin/users/${userId}/roles`,
    { data: { roleId } },
  )
  return data.data
}
