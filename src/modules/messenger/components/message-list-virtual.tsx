import { memo, useEffect, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { MessageBubble } from '@/modules/messenger/components/message-bubble'
import { formatMessageDaySeparator } from '@/modules/messenger/lib/messenger-utils'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type FlatItem =
  | { kind: 'day'; id: string; label: string }
  | { kind: 'system'; id: string; body: string }
  | {
      kind: 'message'
      id: string
      message: DmMessage
      isStacked: boolean
      isTail: boolean
      showAvatar: boolean
    }

type MessageListVirtualProps = {
  threadId: string
  messages: DmMessage[]
  viewerId?: string | null
  otherName?: string
  otherAvatar?: string
  showSenderName?: boolean
}

export const MessageListVirtual = memo(function MessageListVirtual({
  threadId,
  messages,
  viewerId,
  otherName,
  otherAvatar,
  showSenderName,
}: MessageListVirtualProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const shouldStickToBottom = useRef(true)

  const items = useMemo<FlatItem[]>(() => {
    const flat: FlatItem[] = []
    let lastDayKey = ''

    for (let index = 0; index < messages.length; index += 1) {
      const message = messages[index]!
      const dayKey = message.createdAt.slice(0, 10)

      if (dayKey !== lastDayKey) {
        lastDayKey = dayKey
        flat.push({ kind: 'day', id: `day-${dayKey}`, label: formatMessageDaySeparator(message.createdAt) })
      }

      if (message.type === 'system') {
        flat.push({ kind: 'system', id: message.id, body: message.body })
        continue
      }

      const prev = index > 0 ? messages[index - 1] : null
      const next = index < messages.length - 1 ? messages[index + 1] : null
      const isOutgoing = message.senderId === viewerId
      const isStacked = Boolean(
        prev &&
          prev.type !== 'system' &&
          prev.senderId === message.senderId &&
          prev.createdAt.slice(0, 10) === dayKey &&
          prev.reactions.length === 0,
      )
      const isTail =
        !next ||
        next.type === 'system' ||
        next.senderId !== message.senderId ||
        next.createdAt.slice(0, 10) !== dayKey
      const showAvatar = !isOutgoing && !isStacked

      flat.push({
        kind: 'message',
        id: message.id,
        message,
        isStacked,
        isTail,
        showAvatar,
      })
    }

    return flat
  }, [messages, viewerId])

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 12,
  })

  useEffect(() => {
    if (!shouldStickToBottom.current || !items.length) return
    virtualizer.scrollToIndex(items.length - 1, { align: 'end' })
  }, [items.length, virtualizer])

  useEffect(() => {
    const node = parentRef.current
    if (!node) return
    const onScroll = () => {
      const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight
      shouldStickToBottom.current = distanceFromBottom < 120
    }
    node.addEventListener('scroll', onScroll, { passive: true })
    return () => node.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={parentRef} className="messenger-messages">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index]
          if (!item) return null
          return (
            <div
              key={item.id}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {item.kind === 'day' ? (
                <div className="messenger-date-separator">{item.label}</div>
              ) : item.kind === 'system' ? (
                <p className="messenger-system-message">{item.body}</p>
              ) : (
                <div
                  className={cn(
                    'messenger-message-block',
                    item.message.reactions.length > 0 && 'has-reactions',
                  )}
                >
                  <MessageBubble
                    message={item.message}
                    threadId={threadId}
                    isOutgoing={item.message.senderId === viewerId}
                    senderName={item.message.senderName ?? otherName}
                    senderAvatar={otherAvatar}
                    showAvatar={item.showAvatar}
                    showSenderLabel={showSenderName}
                    isTail={item.isTail}
                    isStacked={item.isStacked}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
