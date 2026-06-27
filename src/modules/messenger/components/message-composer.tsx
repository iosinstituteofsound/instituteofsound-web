import { memo, useCallback, useEffect, useRef } from 'react'
import { ImageIcon, Paperclip, Plus, Send, Smile, ThumbsUp } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { useMessageComposer } from '@/modules/messenger/hooks/use-message-composer'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessageComposerProps = {
  threadId: string
}

export const MessageComposer = memo(function MessageComposer({ threadId }: MessageComposerProps) {
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

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const resizeTextarea = useCallback(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = '0px'
    node.style.height = `${Math.min(node.scrollHeight, 140)}px`
  }, [])

  useEffect(() => {
    resizeTextarea()
  }, [text, resizeTextarea])

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void submit()
    }
    if (event.key === 'Escape' && editingMessage) {
      setEditingMessage(null)
    }
  }

  const onPaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const image = [...event.clipboardData.items].find((item) => item.type.startsWith('image/'))
    if (!image) return
    event.preventDefault()
    const file = image.getAsFile()
    if (!file) return
    const uploaded = await uploadMediaFile(file, file.name || 'pasted-image.png')
    await submit({
      type: 'image',
      mediaUrl: uploaded.absoluteUrl ?? uploaded.url,
      mediaMimeType: uploaded.mimeType,
      mediaFileName: uploaded.originalName,
    })
  }

  return (
    <div
      className="messenger-composer"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        void onFilesSelected(event.dataTransfer.files, 'file')
      }}
    >
      {replyTo ? (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-[var(--messenger-panel-2)] px-3 py-2 text-sm">
          <div>
            <div className="font-semibold">Replying</div>
            <div className="text-[var(--messenger-muted)]">{replyTo.body || 'Attachment'}</div>
          </div>
          <button type="button" className="messenger-icon-btn" onClick={() => setReplyTo(null)}>
            ×
          </button>
        </div>
      ) : null}

      {editingMessage ? (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-[var(--messenger-panel-2)] px-3 py-2 text-sm">
          <div>
            <div className="font-semibold">Editing message</div>
            <div className="text-[var(--messenger-muted)]">{editingMessage.body}</div>
          </div>
          <button type="button" className="messenger-icon-btn" onClick={() => setEditingMessage(null)}>
            ×
          </button>
        </div>
      ) : null}

      <div className="messenger-composer__toolbar">
        <button type="button" className="messenger-icon-btn messenger-icon-btn--stub" aria-label="More actions" disabled title="Coming soon">
          <Plus className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="messenger-icon-btn"
          aria-label="Upload image"
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="messenger-icon-btn"
          aria-label="Upload file"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <div className="messenger-composer__input-wrap">
          <textarea
            ref={textareaRef}
            className="messenger-composer__input"
            rows={1}
            value={text}
            placeholder={editingMessage ? 'Edit message' : 'Aa'}
            onChange={(event) => {
              setText(event.target.value)
              notifyTyping()
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />
          <button type="button" className="messenger-icon-btn messenger-icon-btn--stub" aria-label="Emoji" disabled title="Coming soon">
            <Smile className="h-5 w-5" />
          </button>
        </div>

        {text.trim() ? (
          <button
            type="button"
            className={cn('messenger-icon-btn', isPending && 'opacity-60')}
            aria-label={editingMessage ? 'Save edit' : 'Send message'}
            onClick={() => void submit()}
          >
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            className="messenger-icon-btn"
            aria-label="Send like"
            onClick={() => void submit({ body: '👍', type: 'text' } as Partial<DmMessage>)}
          >
            <ThumbsUp className="h-5 w-5" />
          </button>
        )}
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(event) => void onFilesSelected(event.target.files, 'image')}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => void onFilesSelected(event.target.files, 'file')}
      />
    </div>
  )
})
