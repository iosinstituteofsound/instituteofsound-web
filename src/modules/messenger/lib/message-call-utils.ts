import type { DmCallData } from '@/modules/messenger/types/messenger.types'

export function formatCallDuration(durationSec?: number): string | null {
  if (durationSec == null || !Number.isFinite(durationSec) || durationSec < 0) return null
  const total = Math.floor(durationSec)
  if (total < 60) return `${total} sec${total === 1 ? '' : 's'}`
  const mins = Math.floor(total / 60)
  const secs = total % 60
  if (mins < 60) {
    if (secs === 0) return `${mins} min${mins === 1 ? '' : 's'}`
    return `${mins} min ${secs} sec`
  }
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  if (remMins === 0) return `${hours} hr${hours === 1 ? '' : 's'}`
  return `${hours} hr ${remMins} min`
}

export function getCallBubbleTitle(callData: DmCallData, viewerId?: string | null): string {
  const isVideo = callData.mediaMode === 'video'
  const isInitiator = Boolean(viewerId && callData.initiatorId === viewerId)

  switch (callData.status) {
    case 'completed':
      return isVideo ? 'Video call' : 'Voice call'
    case 'missed':
      if (isInitiator) return 'No answer'
      return isVideo ? 'Missed video call' : 'Missed voice call'
    case 'declined':
      return 'Declined'
    case 'cancelled':
      return 'Cancelled'
    case 'busy':
      return 'Busy'
    case 'failed':
      return 'Call failed'
  }
}

export function getCallBubbleSubtitle(callData: DmCallData): string | null {
  if (callData.status === 'completed') {
    return formatCallDuration(callData.durationSec) ?? 'Ended'
  }
  return null
}

export function isMissedCallStatus(status: DmCallData['status']): boolean {
  return status === 'missed' || status === 'failed'
}
