import type { DmMessage } from '@/modules/messenger/types/messenger.types'

export function isVoiceMessage(message: Pick<DmMessage, 'type' | 'mediaMimeType' | 'mediaFileName' | 'mediaUrl'>): boolean {
  if (message.type !== 'file') return false
  if (message.mediaMimeType?.startsWith('audio/')) return true
  if (message.mediaFileName === 'Voice message') return true
  return Boolean(message.mediaUrl?.endsWith('.m4a'))
}

export function isImageMessage(message: Pick<DmMessage, 'type' | 'mediaMimeType'>): boolean {
  if (message.type === 'image') return true
  if (message.type === 'file' && message.mediaMimeType?.startsWith('image/')) return true
  return false
}

export function isVideoMessage(message: Pick<DmMessage, 'type' | 'mediaMimeType'>): boolean {
  if (message.type === 'video') return true
  if (message.type === 'file' && message.mediaMimeType?.startsWith('video/')) return true
  return false
}
