import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type MessageScrollToBottomButtonProps = {
  visible: boolean
  unreadCount?: number
  onClick: () => void
  className?: string
}

export function MessageScrollToBottomButton({
  visible,
  unreadCount = 0,
  onClick,
  className,
}: MessageScrollToBottomButtonProps) {
  if (!visible) return null

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <button
      type="button"
      className={cn('messenger-scroll-to-bottom', className)}
      aria-label={
        unreadCount > 0 ? `Jump to latest messages, ${unreadCount} new` : 'Jump to latest messages'
      }
      onClick={onClick}
    >
      <ChevronDown className="h-5 w-5" aria-hidden />
      {unreadCount > 0 ? (
        <span className="messenger-scroll-to-bottom__badge">{badgeLabel}</span>
      ) : null}
    </button>
  )
}
