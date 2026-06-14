import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  CreateSidebarItemInput,
  SidebarMenuItemDto,
  UpdateSidebarItemInput,
} from '@/shared/types/sidebar.types'

export async function getSidebarItems() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ items: SidebarMenuItemDto[] }>>(
    `${API_V1}/me/sidebar`,
  )
  return data.data.items
}

export async function getAllSidebarItems() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ items: SidebarMenuItemDto[] }>>(
    `${API_V1}/admin/sidebar-items`,
  )
  return data.data.items
}

export async function createSidebarItem(input: CreateSidebarItemInput) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ item: SidebarMenuItemDto }>>(
    `${API_V1}/admin/sidebar-items`,
    input,
  )
  return data.data.item
}

export async function updateSidebarItem(id: string, input: UpdateSidebarItemInput) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ item: SidebarMenuItemDto }>>(
    `${API_V1}/admin/sidebar-items/${id}`,
    input,
  )
  return data.data.item
}

export async function deleteSidebarItem(id: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ ok: boolean }>>(
    `${API_V1}/admin/sidebar-items/${id}`,
  )
  return data.data
}
