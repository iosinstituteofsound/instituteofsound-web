import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Phone, Video } from 'lucide-react'
import { meQueryKey } from '@/modules/auth/hooks/use-auth'
import { messengerCallController } from '@/modules/messenger/lib/messenger-call-controller'
import { getThreadAvatarUrl, getThreadDisplayName, isDirectThread } from '@/modules/messenger/lib/messenger-utils'
import type { CallMediaMode } from '@/modules/messenger/types/call.types'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { IconButton } from '@/shared/components/ui/icon-button'
import { toast } from '@/shared/components/ui/sonner'
import type { MeResponse } from '@/shared/types/auth.types'
import { cn } from '@/shared/lib/cn'

type MessengerCallActionsProps = {
  thread: DmThreadSummary | null | undefined
  className?: string
  iconClassName?: string
  compact?: boolean
}

function canCallThread(thread: DmThreadSummary | null | undefined): thread is DmThreadSummary {
  if (!thread || !isDirectThread(thread)) return false
  if (thread.isPendingRequest || thread.status === 'declined') return false
  return Boolean(thread.otherUserId)
}

export function MessengerCallActions({ thread, className, iconClassName, compact }: MessengerCallActionsProps) {
  const queryClient = useQueryClient()
  const callable = canCallThread(thread)

  const startCall = useCallback(
    (mediaMode: CallMediaMode) => {
      if (!callable) {
        toast.error('Calls are only available in accepted direct chats')
        return
      }

      const me = queryClient.getQueryData<MeResponse>(meQueryKey)
      if (!me?.user.id) {
        toast.error('Sign in to place a call')
        return
      }

      void messengerCallController.startCall(
        {
          threadId: thread.threadId,
          remoteUserId: thread.otherUserId!,
          remoteName: getThreadDisplayName(thread),
          remoteAvatarUrl: getThreadAvatarUrl(thread),
        },
        mediaMode,
        {
          userId: me.user.id,
          displayName: me.user.name,
          avatarUrl: me.user.avatarThumbnailUrl ?? me.user.avatarUrl,
        },
      )
    },
    [callable, queryClient, thread],
  )

  if (!callable) return null

  const iconSize = compact ? 'h-3.5 w-3.5' : 'h-5 w-5'

  return (
    <div className={cn(className)} onMouseDown={(event) => event.stopPropagation()}>
      <IconButton
        className={iconClassName}
        aria-label="Voice call"
        onClick={() => startCall('voice')}
      >
        <Phone className={iconSize} />
      </IconButton>
      <IconButton
        className={iconClassName}
        aria-label="Video call"
        onClick={() => startCall('video')}
      >
        <Video className={iconSize} />
      </IconButton>
    </div>
  )
}
