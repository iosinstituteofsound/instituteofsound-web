import { MessageDeliveryTicks } from '@/modules/messenger/components/message-delivery-ticks'
import {
  formatMessageBubbleTime,
  getMessageDeliveryStatus,
} from '@/modules/messenger/utils/message-delivery-utils'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessageBubbleMetaProps = {
  message: DmMessage
  isOutgoing: boolean
  className?: string
}

export function MessageBubbleMeta({ message, isOutgoing, className }: MessageBubbleMetaProps) {
  const timeLabel = formatMessageBubbleTime(message.createdAt)
  const status = getMessageDeliveryStatus(message)

  return (
    <div className={cn('messenger-bubble__meta', className)}>
      <span className="messenger-bubble__time">{timeLabel}</span>
      {isOutgoing ? <MessageDeliveryTicks status={status} /> : null}
    </div>
  )
}
