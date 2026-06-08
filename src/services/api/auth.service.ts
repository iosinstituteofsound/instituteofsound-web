import type { User } from '@/lib/auth/types'
import { apiFetch } from './client'

export async function getMe(): Promise<{ user: User }> {
  return apiFetch('/me')
}
