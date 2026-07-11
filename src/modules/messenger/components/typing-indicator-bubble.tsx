import { memo } from 'react'
import {
  getMessengerStatusColor,
  getMessengerStatusIcon,
  getMessengerStatusTone,
} from '@/modules/messenger/lib/messenger-status-visuals'
import type { TypingPeerPhase } from '@/modules/messenger/store/messenger-live-store'
import { cn } from '@/shared/lib/cn'

type TypingIndicatorBubbleProps = {
  phase?: TypingPeerPhase | null
  className?: string
}

export const TypingIndicatorBubble = memo(function TypingIndicatorBubble({
  phase = 'typing',
  className,
}: TypingIndicatorBubbleProps) {
  const resolved = phase ?? 'typing'
  const Icon = getMessengerStatusIcon(resolved)
  const tone = getMessengerStatusTone(resolved)
  const color = getMessengerStatusColor(resolved)

  return (
    <div
      className={cn(
        'messenger-typing-bubble',
        `messenger-typing-bubble--${tone}`,
        resolved === 'confused' && 'messenger-typing-bubble--confused',
        className,
      )}
      style={{ color }}
      aria-label={
        resolved === 'confused'
          ? 'Peer cleared their message'
          : resolved === 'thinking'
            ? 'Peer is thinking'
            : resolved === 'replying'
              ? 'Peer is replying'
              : 'Peer is typing'
      }
    >
      <Icon className="messenger-typing-bubble__icon" aria-hidden />
      <span className="messenger-typing-bubble__dots" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </div>
  )
})
