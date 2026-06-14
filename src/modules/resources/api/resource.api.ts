import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { ResourceSummary } from '@/shared/types/auth.types'

export type ResourceDto = ResourceSummary

export interface CreateResourceInput {
  type: 'PAGE' | 'COMPONENT'
  name: string
  path: string
}

export interface UpdateResourceInput {
  type?: 'PAGE' | 'COMPONENT'
  name?: string
  path?: string
  isActive?: boolean
}

export async function getResources() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ resources: ResourceDto[] }>>(
    `${API_V1}/admin/resources`,
  )
  return data.data.resources
}

export async function createResource(input: CreateResourceInput) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ resource: ResourceDto }>>(
    `${API_V1}/admin/resources`,
    input,
  )
  return data.data.resource
}

export async function updateResource(id: string, input: UpdateResourceInput) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ resource: ResourceDto }>>(
    `${API_V1}/admin/resources/${id}`,
    input,
  )
  return data.data.resource
}

export async function deleteResource(id: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ ok: boolean }>>(
    `${API_V1}/admin/resources/${id}`,
  )
  return data.data
}
