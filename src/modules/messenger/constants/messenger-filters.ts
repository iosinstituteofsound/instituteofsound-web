import type { MessengerFilter } from '@/modules/messenger/types/messenger.types'

export const MESSENGER_SIDEBAR_FILTERS: Array<{ id: MessengerFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'groups', label: 'Groups' },
  { id: 'communities', label: 'Communities' },
]

export const MESSENGER_POPOVER_FILTERS: Array<{ id: MessengerFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'requests', label: 'Requests' },
  { id: 'groups', label: 'Groups' },
  { id: 'communities', label: 'Communities' },
]
