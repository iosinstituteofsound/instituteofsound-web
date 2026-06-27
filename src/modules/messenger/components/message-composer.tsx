import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { ImageIcon, Paperclip, Plus, Send, Smile, ThumbsUp } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { useSendMessengerMessage } from '@/modules/messenger/hooks/use-messenger-messages'
import { createClientMessageId } from '@/modules/messenger/lib/messenger-utils'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessageComposerProps = {
  threadId: string
}

export const MessageComposer = memo(function MessageComposer({ threadId }: MessageComposerProps) {
  const replyTo = useMessengerUiStore((s) => s.replyTo)
  const setReplyTo = useMessengerUiStore((s) => s.setReplyTo)
  const sendMessage = useSendMessengerMessage(threadId)
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<number | null>(null)

  const resizeTextarea = useCallback(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = '0px'
    node.style.height = `${Math.min(node.scrollHeight, 140)}px`
  }, [])

  useEffect(() => {
    resizeTextarea()
  }, [text, resizeTextarea])

  const notifyTyping = useCallback(() => {
    realtimeSocketClient.emitTypingStart(threadId)
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = window.setTimeout(() => {
      realtimeSocketClient.emitTypingStop(threadId)
    }, 1200)
  }, [threadId])

  const submit = useCallback(
    async (payload?: Partial<DmMessage>) => {
      const body = payload?.body ?? text.trim()
      if (!body && !payload?.mediaUrl) return

      const clientMessageId = createClientMessageId()
      sendMessage.mutate({
        threadId,
        body,
        type: payload?.type ?? 'text',
        mediaUrl: payload?.mediaUrl,
        mediaMimeType: payload?.mediaMimeType,
        mediaFileName: payload?.mediaFileName,
        replyToId: replyTo?.id,
        clientMessageId,
      })

      setText('')
      setReplyTo(null)
      realtimeSocketClient.emitTypingStop(threadId)
    },
    [replyTo?.id, sendMessage, setReplyTo, text, threadId],
  )

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void submit()
    }
  }

  const onFilesSelected = async (files: FileList | null, kind: 'image' | 'file') => {
    const file = files?.[0]
    if (!file) return
    const uploaded = await uploadMediaFile(file, file.name)
    const url = uploaded.absoluteUrl ?? uploaded.url
    const type = kind === 'image' ? 'image' : uploaded.kind === 'video' ? 'video' : 'file'
    await submit({
      body: kind === 'image' ? '' : file.name,
      type,
      mediaUrl: url,
      mediaMimeType: uploaded.mimeType,
      mediaFileName: uploaded.originalName,
    })
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

      <div className="messenger-composer__toolbar">
        <button type="button" className="messenger-icon-btn" aria-label="More actions">
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
            placeholder="Aa"
            onChange={(event) => {
              setText(event.target.value)
              notifyTyping()
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />
          <button type="button" className="messenger-icon-btn" aria-label="Emoji">
            <Smile className="h-5 w-5" />
          </button>
        </div>

        {text.trim() ? (
          <button
            type="button"
            className={cn('messenger-icon-btn', sendMessage.isPending && 'opacity-60')}
            aria-label="Send message"
            onClick={() => void submit()}
          >
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            className="messenger-icon-btn"
            aria-label="Send like"
            onClick={() => void submit({ body: '👍', type: 'text' })}
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
