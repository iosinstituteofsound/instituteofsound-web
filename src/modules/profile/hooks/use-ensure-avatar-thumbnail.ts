import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/modules/auth/hooks/use-auth'
import { ensureAvatarThumbnail } from '@/modules/profile/lib/ensure-avatar-thumbnail'
import type { UserDto } from '@/shared/types/auth.types'

export function useEnsureAvatarThumbnail(user?: UserDto) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?.avatarUrl || user.avatarThumbnailUrl || !user.avatarCrop) return

    let cancelled = false

    void (async () => {
      await ensureAvatarThumbnail(user)
      if (!cancelled) {
        await queryClient.invalidateQueries({ queryKey: meQueryKey })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, queryClient])
}
