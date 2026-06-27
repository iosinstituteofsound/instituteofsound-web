import { memo, useRef } from 'react'
import { ImageIcon, Mic, Smile, Square, Sticker, ThumbsUp, X } from 'lucide-react'
import { useMessageComposer } from '@/modules/messenger/hooks/use-message-composer'
import { cn } from '@/shared/lib/cn'

type MessengerPopupComposerProps = {
  threadId: string
}

export const MessengerPopupComposer = memo(function MessengerPopupComposer({
  threadId,
}: MessengerPopupComposerProps) {
  const {
    text,
    setText,
    replyTo,
    editingMessage,
    setReplyTo,
    setEditingMessage,
    notifyTyping,
    submit,
    onFilesSelected,
    isPending,
  } = useMessageComposer(threadId)

  const imageInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="messenger-chat-window__composer">
      {replyTo ? (
        <div className="messenger-composer__reply flex items-center justify-between px-2 py-1 text-xs">
          <span className="truncate">Replying to: {replyTo.body || 'Attachment'}</span>
          <button type="button" className="messenger-icon-btn" aria-label="Cancel reply" onClick={() => setReplyTo(null)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {editingMessage ? (
        <div className="messenger-composer__reply flex items-center justify-between px-2 py-1 text-xs">
          <span className="truncate">Editing: {editingMessage.body}</span>
          <button type="button" className="messenger-icon-btn" aria-label="Cancel edit" onClick={() => setEditingMessage(null)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div className="messenger-chat-window__composer-row">
        <div className="messenger-chat-window__tools">
          <button type="button" className="messenger-chat-window__tool messenger-icon-btn--stub" aria-label="Voice message" disabled title="Coming soon">
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="messenger-chat-window__tool"
            aria-label="Photo"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button type="button" className="messenger-chat-window__tool messenger-icon-btn--stub" aria-label="Stickers" disabled title="Coming soon">
            <Sticker className="h-4 w-4" />
          </button>
          <button type="button" className="messenger-chat-window__tool messenger-icon-btn--stub" aria-label="GIF" disabled title="Coming soon">
            <Square className="h-3.5 w-3.5" />
            <span className="sr-only">GIF</span>
          </button>
        </div>

        <div className="messenger-chat-window__input-wrap">
          <textarea
            className="messenger-chat-window__input"
            rows={1}
            value={text}
            placeholder={editingMessage ? 'Edit message' : 'Aa'}
            onChange={(event) => {
              setText(event.target.value)
              notifyTyping()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void submit()
              }
              if (event.key === 'Escape' && editingMessage) {
                setEditingMessage(null)
              }
            }}
          />
          <button type="button" className="messenger-chat-window__tool messenger-icon-btn--stub" aria-label="Emoji" disabled title="Coming soon">
            <Smile className="h-4 w-4" />
          </button>
        </div>

        {text.trim() ? (
          <button
            type="button"
            className={cn('messenger-chat-window__tool', isPending && 'opacity-60')}
            aria-label={editingMessage ? 'Save edit' : 'Send'}
            onClick={() => void submit()}
          >
            <span className="text-xs font-semibold">{editingMessage ? 'Save' : 'Send'}</span>
          </button>
        ) : (
          <button
            type="button"
            className="messenger-chat-window__tool"
            aria-label="Send like"
            onClick={() => void submit({ body: '👍' })}
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void onFilesSelected(event.target.files, 'image')}
      />
    </div>
  )
})
