import { apiUrl } from '@/shared/config/env'

export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined

  const value = url.trim()
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) {
    return value
  }

  if (value.startsWith('/')) {
    return apiUrl(value)
  }

  return value
}
