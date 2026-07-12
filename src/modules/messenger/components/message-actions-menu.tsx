import { memo, useEffect, useRef, useState } from 'react'
import { Forward, MoreHorizontal, Pencil, Reply, Smile, Trash2 } from 'lucide-react'
import { ReactionPickerIcon } from '@/shared/components/reactions'
import { REACTION_OPTIONS } from '@/shared/lib/reactions/reaction-options'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessageActionsMenuProps = {
  message: DmMessage
  isOutgoing: boolean
  compact?: boolean
  onReply: () => void
  onForward: () => void
  onEdit: () => void
  onDelete: () => void
  onReact: (emoji: string) => void
}

export const MessageActionsMenu = memo(function MessageActionsMenu({
  message,
  isOutgoing,
  compact = false,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onReact,
}: MessageActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const canEdit = isOutgoing && message.type === 'text' && !message.deletedAt
  const canDelete = isOutgoing && !message.deletedAt

  useEffect(() => {
    if (!open && !showReactions) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setShowReactions(false)
      }
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [open, showReactions])

  if (message.type === 'system' || message.type === 'call' || message.deletedAt) return null

  const variantClass = compact
    ? 'messenger-message-actions--compact'
    : 'messenger-message-actions--inline'

  return (
    <div
      className={cn('messenger-message-actions', variantClass, isOutgoing && 'is-outgoing')}
      ref={rootRef}
    >
      {showReactions ? (
        <div className="messenger-message-actions__reactions is-visible">
          {REACTION_OPTIONS.map((reaction) => (
            <button
              key={reaction.kind}
              type="button"
              className="messenger-message-actions__emoji"
              aria-label={`React ${reaction.label}`}
              onClick={() => {
                onReact(reaction.emoji)
                setShowReactions(false)
              }}
            >
              <ReactionPickerIcon
                kind={reaction.kind}
                label={reaction.label}
                size="inline"
              />
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="messenger-message-actions__compact-btn"
        aria-label="React"
        onClick={() => setShowReactions((value) => !value)}
      >
        <Smile className="h-4 w-4" />
      </button>
      <button type="button" className="messenger-message-actions__compact-btn" aria-label="Reply" onClick={onReply}>
        <Reply className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="messenger-message-actions__compact-btn"
        aria-label="More actions"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div className="messenger-message-actions__menu" role="menu">
          <button type="button" role="menuitem" onClick={() => { onForward(); setOpen(false) }}>
            <Forward className="h-4 w-4" /> Forward
          </button>
          {canEdit ? (
            <button type="button" role="menuitem" onClick={() => { onEdit(); setOpen(false) }}>
              <Pencil className="h-4 w-4" /> Edit
            </button>
          ) : null}
          {canDelete ? (
            <button type="button" role="menuitem" onClick={() => { void onDelete(); setOpen(false) }}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
})
