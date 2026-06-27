import type { QueryClient } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import {
  messengerMessagesQueryKey,
  messengerThreadsQueryKey,
} from '@/modules/messenger/lib/messenger-cache'
import { createClientMessageId } from '@/modules/messenger/lib/messenger-utils'
import { openMessengerPopup } from '@/modules/messenger/lib/messenger-popup-open'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'

export function buildForwardMessageInput(source: DmMessage, targetThreadId: string) {
  const body =
    source.type === 'text'
      ? source.body
      : source.type === 'image'
        ? 'Photo'
        : source.body || 'Forwarded message'

  return {
    threadId: targetThreadId,
    body,
    type: source.type === 'system' ? ('text' as const) : source.type,
    mediaUrl: source.mediaUrl,
    mediaMimeType: source.mediaMimeType,
    mediaFileName: source.mediaFileName,
    forwardFromId: source.id,
    shareData: source.shareData,
    clientMessageId: createClientMessageId(),
  }
}

export async function forwardMessage(
  queryClient: QueryClient,
  source: DmMessage,
  targetThreadId: string,
  options?: { openPopup?: boolean },
) {
  await messengerApi.sendMessage(buildForwardMessageInput(source, targetThreadId))

  void queryClient.invalidateQueries({ queryKey: messengerMessagesQueryKey(targetThreadId) })
  void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })

  if (options?.openPopup) {
    void openMessengerPopup({ threadId: targetThreadId })
  }
}
