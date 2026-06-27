import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { ImageIcon, Mic, Paperclip, Plus, Send, Smile, Square, Sticker, ThumbsUp } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { useMessageComposer } from '@/modules/messenger/hooks/use-message-composer'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'
import '@/modules/messenger/styles/messenger.css'

const MAX_INPUT_HEIGHT = 140

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

  const [isFocused, setIsFocused] = useState(false)
  const [isMultiline, setIsMultiline] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const isActive = isFocused || text.length > 0

  const resizeTextarea = useCallback(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = '0px'
    const nextHeight = Math.min(node.scrollHeight, MAX_INPUT_HEIGHT)
    node.style.height = `${nextHeight}px`
    setIsMultiline(nextHeight > 34)
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
        <div className="messenger-composer__banner">
          <div>
            <div className="messenger-composer__banner-title">Replying</div>
            <div className="messenger-composer__banner-body">{replyTo.body || 'Attachment'}</div>
          </div>
          <button type="button" className="messenger-icon-btn" onClick={() => setReplyTo(null)}>
            ×
          </button>
        </div>
      ) : null}

      {editingMessage ? (
        <div className="messenger-composer__banner">
          <div>
            <div className="messenger-composer__banner-title">Editing message</div>
            <div className="messenger-composer__banner-body">{editingMessage.body}</div>
          </div>
          <button type="button" className="messenger-icon-btn" onClick={() => setEditingMessage(null)}>
            ×
          </button>
        </div>
      ) : null}

      <div
        className={cn(
          'messenger-composer__row',
          isActive && 'is-active',
          isMultiline && 'is-multiline',
        )}
      >
        <button type="button" className="messenger-composer__tool messenger-composer__tool--plus" aria-label="More">
          <Plus className="messenger-composer__icon" />
        </button>

        <div className="messenger-composer__tools-extra" aria-hidden={isActive || undefined}>
          <button type="button" className="messenger-composer__tool" aria-label="Voice message">
            <Mic className="messenger-composer__icon" />
          </button>
          <button
            type="button"
            className="messenger-composer__tool"
            aria-label="Upload image"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon className="messenger-composer__icon" />
          </button>
          <button
            type="button"
            className="messenger-composer__tool"
            aria-label="Upload file"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="messenger-composer__icon" />
          </button>
          <button type="button" className="messenger-composer__tool" aria-label="Stickers">
            <Sticker className="messenger-composer__icon" />
          </button>
          <button type="button" className="messenger-composer__tool" aria-label="GIF">
            <Square className="messenger-composer__icon messenger-composer__icon--gif" />
            <span className="sr-only">GIF</span>
          </button>
        </div>

        <div className={cn('messenger-composer__input-wrap', isMultiline && 'is-multiline')}>
          <textarea
            ref={textareaRef}
            className="messenger-composer__input"
            rows={1}
            value={text}
            placeholder="Aa"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(event) => {
              setText(event.target.value)
              notifyTyping()
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />
          <button
            type="button"
            className="messenger-composer__tool messenger-composer__tool--emoji"
            aria-label="Emoji"
          >
            <Smile className="messenger-composer__icon" />
          </button>
        </div>

        {text.trim() ? (
          <button
            type="button"
            className={cn(
              'messenger-composer__tool messenger-composer__tool--send',
              isPending && 'opacity-60',
            )}
            aria-label={editingMessage ? 'Save edit' : 'Send message'}
            onClick={() => void submit()}
          >
            <Send className="messenger-composer__icon" />
          </button>
        ) : (
          <button
            type="button"
            className="messenger-composer__tool messenger-composer__tool--like"
            aria-label="Send like"
            onClick={() => void submit({ body: '👍', type: 'text' } as Partial<DmMessage>)}
          >
            <ThumbsUp className="messenger-composer__icon" />
          </button>
        )}
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        aria-label="Upload image"
        onChange={(event) => void onFilesSelected(event.target.files, 'image')}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        aria-label="Upload file"
        onChange={(event) => void onFilesSelected(event.target.files, 'file')}
      />
    </div>
  )
})
