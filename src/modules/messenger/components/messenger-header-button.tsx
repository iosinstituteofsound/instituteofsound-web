import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { openMessengerPopup } from '@/modules/messenger/lib/messenger-popup-open'
import { useQuery } from '@tanstack/react-query'
import { Maximize2, MoreHorizontal, PenSquare, Search } from 'lucide-react'
import { MessengerChatSettings } from '@/modules/messenger/components/messenger-chat-settings'
import { ThreadListRow } from '@/modules/messenger/components/thread-list-row'
import { MESSENGER_POPOVER_FILTERS } from '@/modules/messenger/constants/messenger-filters'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { MessengerIcon } from '@/modules/messenger/components/messenger-icon'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { messengerThreadsQueryKey } from '@/modules/messenger/lib/messenger-cache'
import { useMessengerUnread } from '@/modules/messenger/hooks/use-messenger-threads'
import { useMessengerLiveStore } from '@/modules/messenger/store/messenger-live-store'
import type { MessengerFilter } from '@/modules/messenger/types/messenger.types'
import { filterThreads } from '@/modules/messenger/utils/filter-threads'
import { getUserAvatarThumbnailUrl } from '@/shared/lib/user-avatar'
import { HeaderPopover } from '@/shared/components/navigation/header-popover'
import { cn } from '@/shared/lib/cn'
import '@/modules/messenger/styles/messenger-header-button.css'
import '@/modules/messenger/styles/messenger-dropdown.css'

export function MessengerHeaderButton() {
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [filter, setFilter] = useState<MessengerFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)

  const unreadCount = useMessengerLiveStore((s) => s.unreadCount)
  const liveReady = useMessengerLiveStore((s) => s.ready)
  const { data: apiUnread = 0 } = useMessengerUnread()
  const displayUnread = liveReady ? unreadCount : apiUnread
  const { data: meData } = useMe()
  const viewerId = meData?.user.id
  const viewerAvatar = meData?.user ? getUserAvatarThumbnailUrl(meData.user) : undefined

  const { data: threads = [], isLoading, refetch } = useQuery({
    queryKey: [...messengerThreadsQueryKey, undefined],
    queryFn: () => messengerApi.listThreads(),
    staleTime: 15_000,
    enabled: open,
  })

  const filteredThreads = useMemo(
    () => filterThreads(threads, filter, deferredSearch),
    [deferredSearch, filter, threads],
  )

  const isMessengerRoute = location.pathname.startsWith('/messenger')

  useEffect(() => {
    if (!open) {
      setSettingsOpen(false)
      return
    }

    void refetch()
  }, [open, refetch])

  const toggleSettings = () => {
    setSettingsOpen((value) => !value)
  }

  const openThread = (threadId: string) => {
    setOpen(false)
    setSettingsOpen(false)
    void openMessengerPopup({ threadId })
  }

  return (
    <div className="ios-messenger-popover" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'dashboard-header-utility ios-messenger-header-btn ios-messenger-popover__trigger',
          (open || isMessengerRoute) && 'is-open',
        )}
        aria-label={displayUnread > 0 ? `Messenger, ${displayUnread} unread` : 'Messenger'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MessengerIcon className="h-[22px] w-[22px]" />
        {displayUnread > 0 ? (
          <span className="ios-messenger-header-btn__badge">
            {displayUnread > 9 ? '9+' : displayUnread}
          </span>
        ) : null}
      </button>

      <HeaderPopover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setSettingsOpen(false)
        }}
        rootRef={rootRef}
        triggerRef={triggerRef}
        panelRef={panelRef}
        panelClassName="ios-messenger-popover__panel"
        ariaLabel="Messenger"
        positionOptions={{ width: 360, maxHeight: 560, minHeight: 240 }}
        onEscape={() => {
          if (settingsOpen) {
            setSettingsOpen(false)
            return
          }
          setOpen(false)
        }}
      >
          <div className="ios-messenger-popover__head">
            {!settingsOpen ? <h2 className="ios-messenger-popover__title">Chats</h2> : <span aria-hidden />}
            <div className="ios-messenger-popover__actions">
              <button
                type="button"
                className={cn('ios-messenger-popover__action', settingsOpen && 'is-active')}
                aria-label="Chat settings"
                aria-pressed={settingsOpen}
                onClick={toggleSettings}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              <Link
                to="/messenger"
                className="ios-messenger-popover__action"
                aria-label="Open Messenger"
                onClick={() => setOpen(false)}
              >
                <Maximize2 className="h-4 w-4" />
              </Link>
              <Link
                to="/messenger"
                className="ios-messenger-popover__action"
                aria-label="New message"
                onClick={() => setOpen(false)}
              >
                <PenSquare className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {settingsOpen ? (
            <MessengerChatSettings />
          ) : (
            <>
          <label className="ios-messenger-popover__search-wrap">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search Messenger"
              aria-label="Search Messenger"
            />
          </label>

          <div className="ios-messenger-popover__filters" role="tablist" aria-label="Chat filters">
            {MESSENGER_POPOVER_FILTERS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={filter === entry.id}
                className={cn(
                  'ios-messenger-popover__filter',
                  filter === entry.id && 'is-active',
                )}
                onClick={() => setFilter(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="ios-messenger-popover__empty">Loading chats…</p>
          ) : filteredThreads.length ? (
            <ul className="ios-messenger-popover__list">
              {filteredThreads.map((thread) => (
                <ThreadListRow
                  key={thread.threadId}
                  variant="popover"
                  thread={thread}
                  viewerId={viewerId}
                  viewerAvatar={viewerAvatar}
                  onSelect={openThread}
                />
              ))}
            </ul>
          ) : (
            <p className="ios-messenger-popover__empty">
              {filter === 'groups' || filter === 'communities'
                ? 'No conversations in this category yet.'
                : 'No chats yet. Start messaging from a profile.'}
            </p>
          )}

          <div className="ios-messenger-popover__footer">
            <Link
              to="/messenger"
              className="ios-messenger-popover__see-all"
              onClick={() => setOpen(false)}
            >
              See all in Messenger
            </Link>
          </div>
            </>
          )}
      </HeaderPopover>
    </div>
  )
}
