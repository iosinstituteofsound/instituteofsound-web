import { memo } from 'react'
import { UserAvatar } from '@/shared/components/user'
import { GroupAvatarStack } from '@/shared/components/user'
import { MessageBubble } from '@/modules/messenger/components/message-bubble'
import { useMessageList } from '@/modules/messenger/hooks/use-message-list'
import { getMessageReceiptLabel } from '@/modules/messenger/utils/message-list-utils'
import type { DmMessage, ThreadMemberPreview } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'
import '@/modules/messenger/styles/messenger.css'

export type MessageListHeroProps = {
  name: string
  avatarUrl?: string
  isDirect: boolean
  memberPreview?: ThreadMemberPreview[]
  groupAvatarUrl?: string
}

type MessageListProps = {
  threadId: string
  messages: DmMessage[]
  viewerId?: string | null
  otherName?: string
  otherAvatar?: string
  showSenderName?: boolean
  hero?: MessageListHeroProps | null
  className?: string
  autoScroll?: boolean
}

export const MessageList = memo(function MessageList({
  threadId,
  messages,
  viewerId,
  otherName,
  otherAvatar,
  showSenderName = false,
  hero = null,
  className,
  autoScroll = true,
}: MessageListProps) {
  const { scrollRef, rows, lastOutgoingId } = useMessageList({
    messages,
    viewerId,
    autoScroll,
  })

  const showHero = Boolean(hero && messages.length <= 2)

  return (
    <div ref={scrollRef} className={cn('messenger-message-list', className)}>
      {showHero && hero ? (
        <div className="messenger-message-list__hero">
          {hero.isDirect ? (
            <UserAvatar name={hero.name} avatarUrl={hero.avatarUrl} className="h-16 w-16" />
          ) : (
            <GroupAvatarStack
              members={hero.memberPreview}
              title={hero.name}
              avatarUrl={hero.groupAvatarUrl}
              size="lg"
            />
          )}
          <div className="messenger-message-list__hero-name">{hero.name}</div>
        </div>
      ) : null}

      {rows.map((row) => {
        if (row.kind === 'day') {
          return (
            <p key={row.id} className="messenger-message-list__day">
              {row.label}
            </p>
          )
        }

        if (row.kind === 'system') {
          return (
            <p key={row.id} className="messenger-system-message">
              {row.body}
            </p>
          )
        }

        const mine = row.message.senderId === viewerId
        const isLastOutgoing = mine && row.message.id === lastOutgoingId

        return (
          <div
            key={row.id}
            className={cn(
              'messenger-message-list__wrap',
              mine && 'is-mine',
              row.isStacked && 'is-stacked',
            )}
          >
            <MessageBubble
              message={row.message}
              threadId={threadId}
              isOutgoing={mine}
              viewerId={viewerId}
              otherName={otherName}
              compact
              showAvatar={row.showAvatar}
              isTail={row.isTail}
              isStacked={row.isStacked}
              senderName={row.message.senderName ?? otherName}
              senderAvatar={otherAvatar}
              showSenderLabel={showSenderName}
            />
            {isLastOutgoing && row.isTail ? (
              <p className="messenger-message-list__receipt">{getMessageReceiptLabel(row.message)}</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
})
