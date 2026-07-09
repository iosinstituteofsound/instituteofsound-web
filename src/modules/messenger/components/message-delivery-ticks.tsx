import { AlertCircle, Check, CheckCheck, Clock3 } from 'lucide-react'
import type { MessageDeliveryStatus } from '@/modules/messenger/utils/message-delivery-utils'
import { cn } from '@/shared/lib/cn'

type MessageDeliveryTicksProps = {
  status: MessageDeliveryStatus
  className?: string
}

export function MessageDeliveryTicks({ status, className }: MessageDeliveryTicksProps) {
  if (status === 'sending') {
    return <Clock3 className={cn('messenger-bubble__tick is-pending', className)} aria-hidden />
  }

  if (status === 'failed') {
    return <AlertCircle className={cn('messenger-bubble__tick is-failed', className)} aria-hidden />
  }

  if (status === 'sent') {
    return <Check className={cn('messenger-bubble__tick', className)} aria-hidden />
  }

  return (
    <CheckCheck
      className={cn('messenger-bubble__tick', status === 'read' && 'is-read', className)}
      aria-hidden
    />
  )
}
