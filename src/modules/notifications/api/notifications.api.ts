import { apiClient } from '@/shared/services/api/api-client'
import { API_V1 } from '@/shared/config/env'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { NotificationDto, NotificationListDto } from '@/modules/notifications/types/notification.types'

export async function getNotifications(limit = 40) {
  const { data } = await apiClient.get<ApiSuccessResponse<NotificationListDto>>(
    `${API_V1}/me/notifications`,
    { params: { limit } },
  )
  return data.data
}

export async function getUnreadNotificationCount() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ count: number }>>(
    `${API_V1}/me/notifications/unread-count`,
  )
  return data.data.count
}

export async function markNotificationRead(id: string) {
  const { data } = await apiClient.patch<ApiSuccessResponse<NotificationDto>>(
    `${API_V1}/me/notifications/${id}/read`,
  )
  return data.data
}

export async function markAllNotificationsRead() {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ count: number }>>(
    `${API_V1}/me/notifications/read-all`,
  )
  return data.data.count
}
