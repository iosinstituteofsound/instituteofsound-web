import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { LayoutDto } from '@/shared/types/layout.types'

export async function listLayouts() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ layouts: LayoutDto[] }>>(
    `${API_V1}/admin/layouts`,
  )
  return data.data.layouts
}

export async function createLayout(payload: {
  slug: string
  name: string
  defaultSidebarItemId?: string | null
  shell?: string
  config?: LayoutDto['config']
  sidebarItemIds?: string[]
  isActive?: boolean
}) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ layout: LayoutDto }>>(
    `${API_V1}/admin/layouts`,
    payload,
  )
  return data.data.layout
}

export async function updateLayout(
  id: string,
  payload: Partial<{
    name: string
    shell: string
    defaultSidebarItemId: string | null
    config: LayoutDto['config']
    sidebarItemIds: string[]
    isActive: boolean
  }>,
) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ layout: LayoutDto }>>(
    `${API_V1}/admin/layouts/${id}`,
    payload,
  )
  return data.data.layout
}

export async function deleteLayout(id: string) {
  await apiClient.delete(`${API_V1}/admin/layouts/${id}`)
}
