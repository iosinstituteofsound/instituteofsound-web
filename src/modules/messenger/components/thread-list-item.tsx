import { memo } from 'react'
import { ThreadListRow } from '@/modules/messenger/components/thread-list-row'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'

type ThreadListItemProps = {
  thread: DmThreadSummary
  active: boolean
  onSelect: (threadId: string) => void
}

export const ThreadListItem = memo(function ThreadListItem({
  thread,
  active,
  onSelect,
}: ThreadListItemProps) {
  return (
    <ThreadListRow variant="sidebar" thread={thread} active={active} onSelect={onSelect} />
  )
})
