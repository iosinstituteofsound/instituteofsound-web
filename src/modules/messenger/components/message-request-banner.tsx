import { memo } from 'react'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { Button } from '@/shared/components/ui/button'

type MessageRequestBannerProps = {
  thread: DmThreadSummary
  viewerId?: string | null
  myMessageCount: number
  onChanged: () => void
}

export const MessageRequestBanner = memo(function MessageRequestBanner({
  thread,
  viewerId,
  myMessageCount,
  onChanged,
}: MessageRequestBannerProps) {
  if (thread.kind !== 'direct' || thread.status !== 'pending') return null

  const isRecipient = thread.isPendingRequest
  const isRequester = thread.isRequester
  const blockedByRequest = isRequester && myMessageCount >= 1

  const respond = async (status: 'accepted' | 'declined') => {
    await messengerApi.setThreadStatus(thread.threadId, status)
    onChanged()
  }

  if (isRecipient) {
    return (
      <div className="messenger-request-banner">
        <p className="text-sm">
          <strong>{thread.otherName ?? 'Someone'}</strong> wants to send you a message.
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => void respond('accepted')}>
            Accept
          </Button>
          <Button size="sm" variant="outline" onClick={() => void respond('declined')}>
            Decline
          </Button>
        </div>
      </div>
    )
  }

  if (isRequester && blockedByRequest) {
    return (
      <div className="messenger-request-banner">
        <p className="text-sm text-[var(--messenger-muted)]">
          Your message request is pending. You can send more messages after{' '}
          {thread.otherName ?? 'they'} accept.
        </p>
      </div>
    )
  }

  if (isRequester && viewerId) {
    return (
      <div className="messenger-request-banner">
        <p className="text-sm text-[var(--messenger-muted)]">
          Waiting for {thread.otherName ?? 'them'} to accept your message request.
        </p>
      </div>
    )
  }

  return null
})

export function isComposerBlockedByRequest(thread: DmThreadSummary, myMessageCount: number) {
  return thread.kind === 'direct' && thread.status === 'pending' && thread.isRequester && myMessageCount >= 1
}
