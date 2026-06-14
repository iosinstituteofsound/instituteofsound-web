import type { User, UserAuthorization } from '@/lib/auth/types'
import { apiFetch } from './client'

export async function getMe(): Promise<{ user: User; authorization: UserAuthorization }> {
  const data = await apiFetch<{ user: User; authorization?: UserAuthorization }>('/me')
  const authorization = data.authorization ?? data.user.authorization
  if (authorization) {
    return { user: { ...data.user, authorization }, authorization }
  }
  return {
    user: data.user,
    authorization: {
      roles: [],
      permissions: [],
      attributes: {},
      isSuperAdmin: false,
    },
  }
}
