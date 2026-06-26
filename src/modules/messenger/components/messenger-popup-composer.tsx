import { memo, useCallback, useRef, useState } from 'react'
import { ImageIcon, Mic, Smile, Square, Sticker, ThumbsUp } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { useSendMessengerMessage } from '@/modules/messenger/hooks/use-messenger-messages'
import { createClientMessageId } from '@/modules/messenger/lib/messenger-utils'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import { cn } from '@/shared/lib/cn'

type MessengerPopupComposerProps = {
  threadId: string
}

export const MessengerPopupComposer = memo(function MessengerPopupComposer({
  threadId,
}: MessengerPopupComposerProps) {
  const sendMessage = useSendMessengerMessage(threadId)
  const [text, setText] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<number | null>(null)

  const notifyTyping = useCallback(() => {
    realtimeSocketClient.emitTypingStart(threadId)
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = window.setTimeout(() => {
      realtimeSocketClient.emitTypingStop(threadId)
    }, 1200)
  }, [threadId])

  const submit = useCallback(
    async (body: string, type: 'text' | 'image' = 'text', media?: { url: string; mimeType?: string; name?: string }) => {
      const trimmed = body.trim()
      if (!trimmed && !media?.url) return

      sendMessage.mutate({
        threadId,
        body: trimmed,
        type,
        mediaUrl: media?.url,
        mediaMimeType: media?.mimeType,
        mediaFileName: media?.name,
        clientMessageId: createClientMessageId(),
      })
      setText('')
      realtimeSocketClient.emitTypingStop(threadId)
    },
    [sendMessage, threadId],
  )

  const onImageSelected = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    const uploaded = await uploadMediaFile(file, file.name)
    await submit('', 'image', {
      url: uploaded.absoluteUrl ?? uploaded.url,
      mimeType: uploaded.mimeType,
      name: uploaded.originalName,
    })
  }

  return (
    <div className="messenger-chat-window__composer">
      <div className="messenger-chat-window__composer-row">
        <div className="messenger-chat-window__tools">
          <button type="button" className="messenger-chat-window__tool" aria-label="Voice message">
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
          <button type="button" className="messenger-chat-window__tool" aria-label="Stickers">
            <Sticker className="h-4 w-4" />
          </button>
          <button type="button" className="messenger-chat-window__tool" aria-label="GIF">
            <Square className="h-3.5 w-3.5" />
            <span className="sr-only">GIF</span>
          </button>
        </div>

        <div className="messenger-chat-window__input-wrap">
          <textarea
            className="messenger-chat-window__input"
            rows={1}
            value={text}
            placeholder="Aa"
            onChange={(event) => {
              setText(event.target.value)
              notifyTyping()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void submit(text)
              }
            }}
          />
          <button type="button" className="messenger-chat-window__tool" aria-label="Emoji">
            <Smile className="h-4 w-4" />
          </button>
        </div>

        {text.trim() ? (
          <button
            type="button"
            className={cn('messenger-chat-window__tool', sendMessage.isPending && 'opacity-60')}
            aria-label="Send"
            onClick={() => void submit(text)}
          >
            <span className="text-xs font-semibold">Send</span>
          </button>
        ) : (
          <button
            type="button"
            className="messenger-chat-window__tool"
            aria-label="Send like"
            onClick={() => void submit('👍')}
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
        onChange={(event) => void onImageSelected(event.target.files)}
      />
    </div>
  )
})
