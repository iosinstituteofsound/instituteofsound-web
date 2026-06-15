import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { MeResponse } from '@/shared/types/auth.types'
import type { UpdateProfileInput } from '@/modules/profile/types/profile.types'

export async function updateProfile(input: UpdateProfileInput) {
  const { data } = await apiClient.patch<ApiSuccessResponse<MeResponse>>(`${API_V1}/me`, input)
  return data.data
}
