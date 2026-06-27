import { useCallback, useEffect, useState } from 'react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { useMessageActions } from '@/modules/messenger/hooks/use-message-actions'
import { useSendMessengerMessage } from '@/modules/messenger/hooks/use-messenger-messages'
import { useTypingEmitter } from '@/modules/messenger/hooks/use-typing-emitter'
import { createClientMessageId } from '@/modules/messenger/lib/messenger-utils'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmMessage, DmMessageType } from '@/modules/messenger/types/messenger.types'

export function useMessageComposer(threadId: string) {
  const replyTo = useMessengerUiStore((s) => s.replyTo)
  const editingMessage = useMessengerUiStore((s) => s.editingMessage)
  const setReplyTo = useMessengerUiStore((s) => s.setReplyTo)
  const setEditingMessage = useMessengerUiStore((s) => s.setEditingMessage)
  const sendMessage = useSendMessengerMessage(threadId)
  const { editMessage } = useMessageActions(threadId)
  const [text, setText] = useState('')
  const { notifyTyping, stopTyping } = useTypingEmitter(threadId)

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.body)
      return
    }
    setText('')
  }, [editingMessage])

  const submit = useCallback(
    async (payload?: Partial<DmMessage>) => {
      const body = payload?.body ?? text.trim()
      if (!body && !payload?.mediaUrl) return

      if (editingMessage) {
        await editMessage({ messageId: editingMessage.id, body })
        setEditingMessage(null)
        setText('')
        return
      }

      sendMessage.mutate({
        threadId,
        body,
        type: payload?.type ?? 'text',
        mediaUrl: payload?.mediaUrl,
        mediaMimeType: payload?.mediaMimeType,
        mediaFileName: payload?.mediaFileName,
        replyToId: replyTo?.id,
        clientMessageId: createClientMessageId(),
      })

      setText('')
      setReplyTo(null)
      stopTyping()
    },
    [editMessage, editingMessage, replyTo?.id, sendMessage, setEditingMessage, setReplyTo, stopTyping, text, threadId],
  )

  const uploadAndSubmit = useCallback(
    async (file: File, kind: 'image' | 'file' | 'paste') => {
      const uploaded = await uploadMediaFile(
        file,
        kind === 'paste' ? file.name || 'pasted-image.png' : file.name,
      )
      const url = uploaded.absoluteUrl ?? uploaded.url
      let type: DmMessageType = 'file'
      let body = file.name

      if (kind === 'image' || kind === 'paste') {
        type = 'image'
        body = ''
      } else if (uploaded.kind === 'video') {
        type = 'video'
      }

      await submit({
        body,
        type,
        mediaUrl: url,
        mediaMimeType: uploaded.mimeType,
        mediaFileName: uploaded.originalName,
      })
    },
    [submit],
  )

  const onFilesSelected = useCallback(
    async (files: FileList | null, kind: 'image' | 'file') => {
      const file = files?.[0]
      if (!file) return
      await uploadAndSubmit(file, kind)
    },
    [uploadAndSubmit],
  )

  const onPasteImage = useCallback(
    async (file: File) => {
      await uploadAndSubmit(file, 'paste')
    },
    [uploadAndSubmit],
  )

  return {
    text,
    setText,
    replyTo,
    editingMessage,
    setReplyTo,
    setEditingMessage,
    notifyTyping,
    submit,
    onFilesSelected,
    onPasteImage,
    isPending: sendMessage.isPending,
  }
}
