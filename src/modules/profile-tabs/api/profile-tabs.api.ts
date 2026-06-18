import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  CreateProfileTabInput,
  ProfileTabDto,
  UpdateProfileTabInput,
} from '@/shared/types/profile-tabs.types'

export async function getAllProfileTabs() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ tabs: ProfileTabDto[] }>>(
    `${API_V1}/admin/profile-tabs`,
  )
  return data.data.tabs
}

export async function createProfileTab(input: CreateProfileTabInput) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ tab: ProfileTabDto }>>(
    `${API_V1}/admin/profile-tabs`,
    input,
  )
  return data.data.tab
}

export async function updateProfileTab(id: string, input: UpdateProfileTabInput) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ tab: ProfileTabDto }>>(
    `${API_V1}/admin/profile-tabs/${id}`,
    input,
  )
  return data.data.tab
}

export async function deleteProfileTab(id: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ ok: boolean }>>(
    `${API_V1}/admin/profile-tabs/${id}`,
  )
  return data.data
}

