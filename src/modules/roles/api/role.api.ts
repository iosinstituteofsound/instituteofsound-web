import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'

export interface RoleDto {
  id: string
  name: string
  slug: string
  description?: string
  layoutId: string
  featureIds: string[]
  extraScopeIds: string[]
  extraResourceIds: string[]
  sidebarItemIds: string[]
  isSystem?: boolean
}

export interface CreateRoleInput {
  name: string
  description?: string
  slug?: string
  layoutId: string
  featureIds?: string[]
  extraScopeIds?: string[]
  extraResourceIds?: string[]
  sidebarItemIds?: string[]
}

export interface UpdateRoleInput {
  name?: string
  description?: string
  layoutId?: string
  featureIds?: string[]
  extraScopeIds?: string[]
  extraResourceIds?: string[]
  sidebarItemIds?: string[]
  permissionSlugs?: string[]
}

export async function getRoles() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ roles: RoleDto[] }>>(
    `${API_V1}/admin/roles`,
  )
  return data.data.roles
}

export async function createRole(input: CreateRoleInput) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ role: RoleDto }>>(
    `${API_V1}/admin/roles`,
    input,
  )
  return data.data.role
}

export async function updateRole(id: string, input: UpdateRoleInput) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ role: RoleDto }>>(
    `${API_V1}/admin/roles/${id}`,
    input,
  )
  return data.data.role
}

export async function deleteRole(id: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ ok: boolean }>>(
    `${API_V1}/admin/roles/${id}`,
  )
  return data.data
}
