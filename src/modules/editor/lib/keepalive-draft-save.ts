import { API_V1, apiUrl } from '@/shared/config/env'
import { tokenStorage } from '@/shared/services/api/token-storage'

export function sendKeepaliveDraftSave(articleId: string, payload: Record<string, unknown>) {
  const token = tokenStorage.getAccessToken()
  if (!token || !articleId) return

  const url = apiUrl(`${API_V1}/editor/articles/${articleId}`)
  void fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}
