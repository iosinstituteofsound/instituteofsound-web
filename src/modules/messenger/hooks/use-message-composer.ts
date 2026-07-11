import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [text, setTextState] = useState('')
  const { notifyTyping, stopTyping, cancelPendingTyping } = useTypingEmitter(
    threadId,
    replyTo ? 'replying' : 'typing',
  )
  const draftRef = useRef(text)

  // If draft already has text, re-broadcast so mobile sees typing → replying (or back).
  useEffect(() => {
    if (!draftRef.current.trim()) return
    notifyTyping()
  }, [replyTo?.id, notifyTyping])

  /** Single path for draft changes — keeps web→mobile typing/stop in sync. */
  const setText = useCallback(
    (value: string) => {
      const prev = draftRef.current
      draftRef.current = value
      setTextState(value)

      if (!value.trim()) {
        stopTyping()
        return
      }

      // Backspace / delete must NOT re-trigger typing — only content growth does.
      if (value.length > prev.length) {
        notifyTyping()
        return
      }

      if (value.length < prev.length) {
        cancelPendingTyping()
      }
    },
    [cancelPendingTyping, notifyTyping, stopTyping],
  )

  useEffect(() => {
    if (editingMessage) {
      draftRef.current = editingMessage.body
      setTextState(editingMessage.body)
      return
    }
    draftRef.current = ''
    setTextState('')
    stopTyping()
  }, [editingMessage, stopTyping])

  const submit = useCallback(
    async (payload?: Partial<DmMessage>) => {
      const body = payload?.body ?? text.trim()
      if (!body && !payload?.mediaUrl) return

      if (editingMessage) {
        await editMessage({ messageId: editingMessage.id, body })
        setEditingMessage(null)
        draftRef.current = ''
        setTextState('')
        stopTyping()
        return
      }

      await sendMessage.mutateAsync({
        threadId,
        body,
        type: payload?.type ?? 'text',
        mediaUrl: payload?.mediaUrl,
        mediaMimeType: payload?.mediaMimeType,
        mediaFileName: payload?.mediaFileName,
        replyToId: replyTo?.id,
        clientMessageId: payload?.clientMessageId ?? createClientMessageId(),
      })

      draftRef.current = ''
      setTextState('')
      setReplyTo(null)
      stopTyping()
    },
    [
      editMessage,
      editingMessage,
      replyTo?.id,
      sendMessage,
      setEditingMessage,
      setReplyTo,
      stopTyping,
      text,
      threadId,
    ],
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
    stopTyping,
    submit,
    onFilesSelected,
    onPasteImage,
    isPending: sendMessage.isPending,
  }
}
