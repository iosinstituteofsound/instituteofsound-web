import { AlertCircle, Check, CheckCheck, Clock3 } from 'lucide-react'
import type { MessageDeliveryStatus } from '@/modules/messenger/utils/message-delivery-utils'
import { cn } from '@/shared/lib/cn'

type ThreadListDeliveryTicksProps = {
  status: MessageDeliveryStatus
  className?: string
}

export function ThreadListDeliveryTicks({ status, className }: ThreadListDeliveryTicksProps) {
  if (status === 'sending') {
    return <Clock3 className={cn('messenger-thread-item__tick is-pending', className)} aria-hidden />
  }

  if (status === 'failed') {
    return <AlertCircle className={cn('messenger-thread-item__tick is-failed', className)} aria-hidden />
  }

  if (status === 'sent') {
    return <Check className={cn('messenger-thread-item__tick', className)} aria-hidden />
  }

  return (
    <CheckCheck
      className={cn('messenger-thread-item__tick', status === 'read' && 'is-read', className)}
      aria-hidden
    />
  )
}
