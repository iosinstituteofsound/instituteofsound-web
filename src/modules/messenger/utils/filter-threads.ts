import { getThreadDisplayName } from '@/modules/messenger/lib/messenger-utils'
import type { DmThreadSummary, MessengerFilter } from '@/modules/messenger/types/messenger.types'

export function filterThreads(
  threads: DmThreadSummary[],
  filter: MessengerFilter,
  search: string,
) {
  let list = threads
  const needle = search.trim().toLowerCase()

  if (filter === 'unread') {
    list = list.filter((thread) => thread.unreadCount > 0)
  } else if (filter === 'groups') {
    list = list.filter((thread) => thread.kind === 'group' || thread.isGroup)
  } else if (filter === 'communities') {
    list = list.filter((thread) => thread.kind === 'community')
  } else if (filter === 'alliances') {
    list = list.filter((thread) => thread.kind === 'alliance')
  } else if (filter === 'requests') {
    list = list.filter((thread) => thread.isPendingRequest)
  }

  if (needle) {
    list = list.filter(
      (thread) =>
        getThreadDisplayName(thread).toLowerCase().includes(needle) ||
        thread.subtitle?.toLowerCase().includes(needle) ||
        thread.otherHandle?.toLowerCase().includes(needle) ||
        thread.lastMessageBody?.toLowerCase().includes(needle),
    )
  }

  return list
}
