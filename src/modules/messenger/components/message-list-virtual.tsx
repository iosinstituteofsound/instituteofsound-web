import { memo, useCallback, useEffect, useMemo, useRef } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'

import { MessageBubble } from '@/modules/messenger/components/message-bubble'

import { useChatSearch } from '@/modules/messenger/hooks/use-chat-search'

import { groupMessagesByDate } from '@/modules/messenger/lib/messenger-utils'

import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'

import type { DmMessage } from '@/modules/messenger/types/messenger.types'



type FlatItem =

  | { kind: 'date'; id: string; label: string }

  | { kind: 'message'; id: string; message: DmMessage }



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

  const highlightedMessageId = useMessengerUiStore((s) => s.highlightedMessageId)

  const { needle, matchingMessageIds } = useChatSearch(messages)



  const visibleMessages = useMemo(() => {

    if (!needle) return messages

    return messages.filter((message) => matchingMessageIds.includes(message.id) || message.type === 'system')

  }, [matchingMessageIds, messages, needle])



  const items = useMemo<FlatItem[]>(() => {

    const groups = groupMessagesByDate(visibleMessages)

    const flat: FlatItem[] = []

    for (const group of groups) {

      flat.push({ kind: 'date', id: `date-${group.key}`, label: group.label })

      for (const message of group.items) {

        flat.push({ kind: 'message', id: message.id, message })

      }

    }

    return flat

  }, [visibleMessages])



  const virtualizer = useVirtualizer({

    count: items.length,

    getScrollElement: () => parentRef.current,

    estimateSize: () => 72,

    overscan: 12,

  })



  const scrollToMessage = useCallback(

    (messageId: string) => {

      const index = items.findIndex((item) => item.kind === 'message' && item.id === messageId)

      if (index >= 0) {

        shouldStickToBottom.current = false

        virtualizer.scrollToIndex(index, { align: 'center' })

      }

    },

    [items, virtualizer],

  )



  useEffect(() => {

    if (!highlightedMessageId) return

    scrollToMessage(highlightedMessageId)

  }, [highlightedMessageId, scrollToMessage])



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

      {needle && !matchingMessageIds.length ? (

        <p className="messenger-empty-search">No messages match your search.</p>

      ) : null}

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

                  threadId={threadId}

                  isOutgoing={item.message.senderId === viewerId}

                  senderName={showSenderName ? item.message.senderName ?? otherName : otherName}

                  senderAvatar={otherAvatar}

                  highlighted={highlightedMessageId === item.message.id}

                />

              )}

            </div>

          )

        })}

      </div>

    </div>

  )

})


