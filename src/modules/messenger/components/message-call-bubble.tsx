import { memo } from 'react'
import { Phone, PhoneOff, Video, VideoOff } from 'lucide-react'
import {
  getCallBubbleSubtitle,
  getCallBubbleTitle,
  isMissedCallStatus,
} from '@/modules/messenger/lib/message-call-utils'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessageCallBubbleProps = {
  message: DmMessage
  isOutgoing: boolean
  viewerId?: string | null
}

/** Call-log body only — rendered inside the shared messenger bubble. */
export const MessageCallBubble = memo(function MessageCallBubble({
  message,
  isOutgoing,
  viewerId,
}: MessageCallBubbleProps) {
  const callData = message.callData
  if (!callData) return null

  const title = getCallBubbleTitle(callData, viewerId)
  const subtitle = getCallBubbleSubtitle(callData)
  const missed = isMissedCallStatus(callData.status)
  const isVideo = callData.mediaMode === 'video'
  const Icon = missed
    ? isVideo
      ? VideoOff
      : PhoneOff
    : isVideo
      ? Video
      : Phone

  return (
    <div className={cn('messenger-call-bubble__row', isOutgoing && 'is-outgoing')}>
      <span
        className={cn(
          'messenger-call-bubble__icon',
          missed && 'messenger-call-bubble__icon--missed',
        )}
        aria-hidden
      >
        <Icon />
      </span>
      <span className="messenger-call-bubble__text">
        <span className="messenger-call-bubble__title">{title}</span>
        {subtitle ? <span className="messenger-call-bubble__subtitle">{subtitle}</span> : null}
      </span>
    </div>
  )
})
