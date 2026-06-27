import { memo, useEffect, useMemo, useRef } from 'react'
import { ChevronDown, Minus, Phone, Video, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { MessengerPopupComposer } from '@/modules/messenger/components/messenger-popup-composer'
import { useMessengerMessages } from '@/modules/messenger/hooks/use-messenger-messages'
import { useMessengerThreads } from '@/modules/messenger/hooks/use-messenger-threads'
import { formatMessageDateSeparator, getThreadAvatarUrl, getThreadDisplayName } from '@/modules/messenger/lib/messenger-utils'
import { useMessengerPopupStore } from '@/modules/messenger/store/messenger-popup-store'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { useAuthStore } from '@/app/stores/auth-store'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { cn } from '@/shared/lib/cn'
import '@/modules/messenger/styles/messenger-chat-window.css'

function receiptLabel(message: DmMessage) {
  if (message.optimistic) return 'Sending…'
  if (message.failed) return 'Failed'
  if (message.readAt) return 'Seen'
  if (message.deliveredAt) return 'Delivered'
  return 'Sent'
}

type MessengerChatWindowProps = {
  threadId: string
  minimized: boolean
}

export const MessengerChatWindow = memo(function MessengerChatWindow({
  threadId,
  minimized,
}: MessengerChatWindowProps) {
  const viewerId = useAuthStore((s) => s.userId)
  const { threads } = useMessengerThreads()
  const closeChat = useMessengerPopupStore((s) => s.closeChat)
  const toggleMinimize = useMessengerPopupStore((s) => s.toggleMinimize)
  const focusChat = useMessengerPopupStore((s) => s.focusChat)
  const typingByThread = useMessengerUiStore((s) => s.typingByThread)

  const thread = useMemo(
    () => threads.find((entry) => entry.threadId === threadId) ?? null,
    [threadId, threads],
  )

  const messagesQuery = useMessengerMessages(threadId)
  const messages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [],
    [messagesQuery.data?.pages],
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const typingUsers = (typingByThread[threadId] ?? []).filter((id) => id !== viewerId)
  const lastOutgoingId = [...messages].reverse().find((message) => message.senderId === viewerId)?.id

  useEffect(() => {
    if (minimized || !messages.length) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, minimized, messages])

  useEffect(() => {
    if (minimized || !messages.length) return
    const last = messages[messages.length - 1]
    if (!last || last.senderId === viewerId) return
    void messengerApi.markThreadRead(threadId, last.id)
  }, [messages, minimized, threadId, viewerId])

  const grouped = useMemo(() => {
    const rows: Array<{ kind: 'day'; label: string } | { kind: 'message'; message: DmMessage }> = []
    let lastDay = ''
    for (const message of messages) {
      const dayKey = new Date(message.createdAt).toDateString()
      if (dayKey !== lastDay) {
        lastDay = dayKey
        rows.push({ kind: 'day', label: formatMessageDateSeparator(message.createdAt) })
      }
      rows.push({ kind: 'message', message })
    }
    return rows
  }, [messages])

  return (
    <div
      className={cn('messenger-chat-window', minimized && 'messenger-chat-window--minimized')}
      onMouseDown={() => focusChat(threadId)}
    >
      <header className="messenger-chat-window__head">
        <Link
          to={thread?.otherUserId ? `/profile/${thread.otherUserId}` : '#'}
          className="messenger-chat-window__who"
          onClick={(event) => {
            if (!thread?.otherUserId) event.preventDefault()
          }}
        >
          <span className="messenger-chat-window__avatar-wrap">
            <FeedUserAvatar
              name={getThreadDisplayName(thread)}
              avatarUrl={getThreadAvatarUrl(thread)}
              className="h-8 w-8"
            />
            {thread?.otherIsOnline ? <span className="messenger-chat-window__online" /> : null}
          </span>
          <span className="messenger-chat-window__meta">
            <span className="messenger-chat-window__name-row">
              <span className="messenger-chat-window__name">{getThreadDisplayName(thread)}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--primary)]" />
            </span>
            <span className="messenger-chat-window__status">
              {typingUsers.length ? (
                'Typing…'
              ) : thread?.otherIsOnline ? (
                <>
                  <span className="messenger-chat-window__status-dot" />
                  Active now
                </>
              ) : (
                'Offline'
              )}
            </span>
          </span>
        </Link>

        <div
          className="messenger-chat-window__actions"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button type="button" className="messenger-chat-window__icon" aria-label="Voice call">
            <Phone className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="messenger-chat-window__icon" aria-label="Video call">
            <Video className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="messenger-chat-window__icon"
            aria-label="Minimize"
            onClick={() => toggleMinimize(threadId)}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="messenger-chat-window__icon"
            aria-label="Close"
            onClick={() => closeChat(threadId)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {!minimized ? (
        <>
          <div className="messenger-chat-window__body">
            <div ref={scrollRef} className="messenger-chat-window__scroll">
              {messages.length <= 2 ? (
                <div className="messenger-chat-window__hero">
                  <FeedUserAvatar
                    name={getThreadDisplayName(thread)}
                    avatarUrl={getThreadAvatarUrl(thread)}
                    className="h-16 w-16"
                  />
                  <div className="messenger-chat-window__hero-name">{getThreadDisplayName(thread)}</div>
                </div>
              ) : null}

              {grouped.map((row, index) => {
                if (row.kind === 'day') {
                  return (
                    <p key={`day-${row.label}-${index}`} className="messenger-chat-window__day">
                      {row.label}
                    </p>
                  )
                }

                const mine = row.message.senderId === viewerId
                const isLastOutgoing = mine && row.message.id === lastOutgoingId

                return (
                  <div
                    key={row.message.id}
                    className={cn('messenger-chat-window__message', mine && 'is-mine')}
                  >
                    <div className={cn('messenger-chat-window__bubble', mine && 'is-mine', isLastOutgoing && 'is-last')}>
                      {row.message.type === 'image' && row.message.mediaUrl ? (
                        <img src={row.message.mediaUrl} alt="" className="max-w-[180px] rounded-lg" />
                      ) : (
                        <span>{row.message.body}</span>
                      )}
                    </div>
                    {isLastOutgoing ? (
                      <p className="messenger-chat-window__receipt">{receiptLabel(row.message)}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>

            {typingUsers.length ? (
              <p className="messenger-chat-window__typing">{getThreadDisplayName(thread)} is typing…</p>
            ) : null}
          </div>

          <MessengerPopupComposer threadId={threadId} />
        </>
      ) : null}
    </div>
  )
})
