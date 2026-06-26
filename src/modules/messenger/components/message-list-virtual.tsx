import { memo, useEffect, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { MessageBubble } from '@/modules/messenger/components/message-bubble'
import { groupMessagesByDate } from '@/modules/messenger/lib/messenger-utils'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'

type FlatItem =
  | { kind: 'date'; id: string; label: string }
  | { kind: 'message'; id: string; message: DmMessage }

type MessageListVirtualProps = {
  messages: DmMessage[]
  viewerId?: string | null
  otherName?: string
  otherAvatar?: string
  onReply?: (message: DmMessage) => void
}

export const MessageListVirtual = memo(function MessageListVirtual({
  messages,
  viewerId,
  otherName,
  otherAvatar,
  onReply,
}: MessageListVirtualProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const shouldStickToBottom = useRef(true)

  const items = useMemo<FlatItem[]>(() => {
    const groups = groupMessagesByDate(messages)
    const flat: FlatItem[] = []
    for (const group of groups) {
      flat.push({ kind: 'date', id: `date-${group.key}`, label: group.label })
      for (const message of group.items) {
        flat.push({ kind: 'message', id: message.id, message })
      }
    }
    return flat
  }, [messages])

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
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
              {item.kind === 'date' ? (
                <div className="messenger-date-separator">{item.label}</div>
              ) : (
                <MessageBubble
                  message={item.message}
                  isOutgoing={item.message.senderId === viewerId}
                  senderName={otherName}
                  senderAvatar={otherAvatar}
                  onReply={onReply}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
