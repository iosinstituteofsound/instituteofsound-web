import { memo, useEffect, useMemo, useRef } from 'react'
import { ChevronDown, Minus, Phone, Video, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { ForwardMessageModal } from '@/modules/messenger/components/forward-message-modal'
import { GroupAvatarStack } from '@/modules/messenger/components/group-avatar-stack'
import { MessageBubble } from '@/modules/messenger/components/message-bubble'
import { MessengerPopupComposer } from '@/modules/messenger/components/messenger-popup-composer'
import {
  isComposerBlockedByRequest,
  MessageRequestBanner,
} from '@/modules/messenger/components/message-request-banner'
import { useMessengerMessages } from '@/modules/messenger/hooks/use-messenger-messages'
import { messengerThreadsQueryKey, useMessengerThreads } from '@/modules/messenger/hooks/use-messenger-threads'
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
  const queryClient = useQueryClient()
  const { threads } = useMessengerThreads()
  const closeChat = useMessengerPopupStore((s) => s.closeChat)
  const toggleMinimize = useMessengerPopupStore((s) => s.toggleMinimize)
  const focusChat = useMessengerPopupStore((s) => s.focusChat)
  const forwardFrom = useMessengerUiStore((s) => s.forwardFrom)
  const setForwardFrom = useMessengerUiStore((s) => s.setForwardFrom)
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

  const myMessageCount = useMemo(
    () => messages.filter((m) => m.senderId === viewerId && m.type !== 'system').length,
    [messages, viewerId],
  )

  const composerBlocked = thread ? isComposerBlockedByRequest(thread, myMessageCount) : false
  const isDirect = thread?.kind === 'direct' || !thread?.isGroup
  const displayName = getThreadDisplayName(thread)

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

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
    void messagesQuery.refetch()
  }

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
            {isDirect ? (
              <FeedUserAvatar
                name={displayName}
                avatarUrl={getThreadAvatarUrl(thread)}
                className="h-8 w-8"
              />
            ) : (
              <GroupAvatarStack
                members={thread?.memberPreview}
                title={displayName}
                avatarUrl={thread?.avatarUrl}
                size="sm"
              />
            )}
            {isDirect && thread?.otherIsOnline ? <span className="messenger-chat-window__online" /> : null}
          </span>
          <span className="messenger-chat-window__meta">
            <span className="messenger-chat-window__name-row">
              <span className="messenger-chat-window__name">{displayName}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--primary)]" />
            </span>
            <span className="messenger-chat-window__status">
              {typingUsers.length ? (
                'Typing…'
              ) : isDirect && thread?.otherIsOnline ? (
                <>
                  <span className="messenger-chat-window__status-dot" />
                  Active now
                </>
              ) : (
                thread?.subtitle ?? (isDirect ? 'Offline' : `${thread?.memberCount ?? 0} members`)
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
            {thread ? (
              <MessageRequestBanner
                thread={thread}
                viewerId={viewerId}
                myMessageCount={myMessageCount}
                onChanged={invalidate}
              />
            ) : null}

            <div ref={scrollRef} className="messenger-chat-window__scroll">
              {messages.length <= 2 ? (
                <div className="messenger-chat-window__hero">
                  {isDirect ? (
                    <FeedUserAvatar
                      name={displayName}
                      avatarUrl={getThreadAvatarUrl(thread)}
                      className="h-16 w-16"
                    />
                  ) : (
                    <GroupAvatarStack
                      members={thread?.memberPreview}
                      title={displayName}
                      avatarUrl={thread?.avatarUrl}
                      size="lg"
                    />
                  )}
                  <div className="messenger-chat-window__hero-name">{displayName}</div>
                </div>
              ) : null}

              {(() => {
                const chatMessages = grouped
                  .filter((row): row is { kind: 'message'; message: DmMessage } => row.kind === 'message')
                  .map((row) => row.message)

                return grouped.map((row, index) => {
                if (row.kind === 'day') {
                  return (
                    <p key={`day-${row.label}-${index}`} className="messenger-chat-window__day">
                      {row.label}
                    </p>
                  )
                }

                const mine = row.message.senderId === viewerId
                const isLastOutgoing = mine && row.message.id === lastOutgoingId
                const msgIndex = chatMessages.findIndex((m) => m.id === row.message.id)
                const prev = msgIndex > 0 ? chatMessages[msgIndex - 1] : null
                const next = msgIndex >= 0 && msgIndex < chatMessages.length - 1 ? chatMessages[msgIndex + 1] : null
                const isStacked = Boolean(prev && prev.senderId === row.message.senderId)
                const isTail = !next || next.senderId !== row.message.senderId
                const showAvatar = !mine && !isStacked

                if (row.message.type === 'system') {
                  return (
                    <p key={row.message.id} className="messenger-system-message">
                      {row.message.body}
                    </p>
                  )
                }

                return (
                  <div
                    key={row.message.id}
                    className={cn('messenger-chat-window__message-wrap', mine && 'is-mine', isStacked && 'is-stacked')}
                  >
                    <MessageBubble
                      message={row.message}
                      threadId={threadId}
                      isOutgoing={mine}
                      viewerId={viewerId}
                      otherName={displayName}
                      compact
                      showAvatar={showAvatar}
                      isTail={isTail}
                      isStacked={isStacked}
                      senderName={displayName}
                      senderAvatar={getThreadAvatarUrl(thread)}
                    />
                    {isLastOutgoing && isTail ? (
                      <p className="messenger-chat-window__receipt">{receiptLabel(row.message)}</p>
                    ) : null}
                  </div>
                )
              })
              })()}
            </div>

            {typingUsers.length ? (
              <p className="messenger-chat-window__typing">{displayName} is typing…</p>
            ) : null}
          </div>

          {!composerBlocked && thread?.status !== 'declined' ? (
            <MessengerPopupComposer threadId={threadId} />
          ) : thread?.status === 'declined' ? (
            <p className="px-3 py-2 text-xs text-[var(--messenger-muted)]">This conversation was declined.</p>
          ) : null}
        </>
      ) : null}

      <ForwardMessageModal message={forwardFrom} onClose={() => setForwardFrom(null)} />
    </div>
  )
})
