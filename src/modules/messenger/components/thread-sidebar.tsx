import { memo } from 'react'
import { MoreHorizontal, PenSquare, Search } from 'lucide-react'
import { ThreadListItem } from '@/modules/messenger/components/thread-list-item'
import { MESSENGER_SIDEBAR_FILTERS } from '@/modules/messenger/constants/messenger-filters'
import { useMessengerThreads } from '@/modules/messenger/hooks/use-messenger-threads'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import { cn } from '@/shared/lib/cn'

type ThreadSidebarProps = {
  activeThreadId?: string | null
  className?: string
}

export const ThreadSidebar = memo(function ThreadSidebar({
  activeThreadId,
  className,
}: ThreadSidebarProps) {
  const filter = useMessengerUiStore((s) => s.filter)
  const setFilter = useMessengerUiStore((s) => s.setFilter)
  const searchQuery = useMessengerUiStore((s) => s.searchQuery)
  const setSearchQuery = useMessengerUiStore((s) => s.setSearchQuery)
  const setActiveThreadId = useMessengerUiStore((s) => s.setActiveThreadId)

  const { threads, isLoading } = useMessengerThreads()

  return (
    <aside className={cn('messenger-panel messenger-sidebar', className)}>
      <div className="messenger-sidebar__header">
        <h1 className="messenger-sidebar__title">Chats</h1>
        <div className="flex items-center gap-1">
          <button type="button" className="messenger-icon-btn" aria-label="More options">
            <MoreHorizontal className="h-5 w-5" />
          </button>
          <button type="button" className="messenger-icon-btn" aria-label="New message">
            <PenSquare className="h-5 w-5" />
          </button>
        </div>
      </div>

      <label className="messenger-sidebar__search">
        <Search className="h-4 w-4 text-[var(--messenger-muted)]" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search Messenger"
          aria-label="Search Messenger"
        />
      </label>

      <div className="messenger-filters" role="tablist" aria-label="Chat filters">
        {MESSENGER_SIDEBAR_FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={filter === entry.id}
            className={cn('messenger-filter', filter === entry.id && 'is-active')}
            onClick={() => setFilter(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="messenger-thread-list">
        {isLoading ? (
          <p className="px-3 py-6 text-sm text-[var(--messenger-muted)]">Loading chats…</p>
        ) : threads.length ? (
          threads.map((thread) => (
            <ThreadListItem
              key={thread.threadId}
              thread={thread}
              active={activeThreadId === thread.threadId}
              onSelect={setActiveThreadId}
            />
          ))
        ) : (
          <p className="px-3 py-6 text-sm text-[var(--messenger-muted)]">
            {filter === 'groups' || filter === 'communities'
              ? 'No conversations in this category yet.'
              : 'No chats yet. Visit a profile and start messaging.'}
          </p>
        )}
      </div>
    </aside>
  )
})
