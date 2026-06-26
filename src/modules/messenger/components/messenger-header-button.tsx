import {
  memo,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { openMessengerPopup } from '@/modules/messenger/lib/messenger-popup-open'
import { useQuery } from '@tanstack/react-query'
import { Maximize2, MoreHorizontal, PenSquare, Search } from 'lucide-react'
import { MessengerChatSettings } from '@/modules/messenger/components/messenger-chat-settings'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { MessengerIcon } from '@/modules/messenger/components/messenger-icon'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { messengerThreadsQueryKey, useMessengerUnread } from '@/modules/messenger/hooks/use-messenger-threads'
import { useMessengerLiveStore } from '@/modules/messenger/store/messenger-live-store'
import { formatMessengerTime } from '@/modules/messenger/lib/messenger-utils'
import type { DmThreadSummary, MessengerFilter } from '@/modules/messenger/types/messenger.types'
import { getUserAvatarThumbnailUrl } from '@/shared/lib/user-avatar'
import { cn } from '@/shared/lib/cn'
import '@/modules/messenger/styles/messenger-header-button.css'
import '@/modules/messenger/styles/messenger-dropdown.css'

const FILTERS: Array<{ id: MessengerFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'groups', label: 'Groups' },
  { id: 'communities', label: 'Communities' },
]

function filterThreads(
  threads: DmThreadSummary[],
  filter: MessengerFilter,
  search: string,
) {
  let list = threads
  const needle = search.trim().toLowerCase()

  if (filter === 'unread') {
    list = list.filter((thread) => thread.unreadCount > 0)
  } else if (filter === 'groups') {
    list = list.filter((thread) => thread.isGroup)
  } else if (filter === 'communities') {
    list = []
  }

  if (needle) {
    list = list.filter(
      (thread) =>
        thread.otherName.toLowerCase().includes(needle) ||
        thread.otherHandle?.toLowerCase().includes(needle) ||
        thread.lastMessageBody?.toLowerCase().includes(needle),
    )
  }

  return list
}

const PopoverThreadItem = memo(function PopoverThreadItem({
  thread,
  viewerId,
  viewerAvatar,
  onSelect,
}: {
  thread: DmThreadSummary
  viewerId?: string
  viewerAvatar?: string
  onSelect: (threadId: string) => void
}) {
  const sentByViewer = Boolean(viewerId && thread.lastSenderId === viewerId)

  return (
    <li>
      <button
        type="button"
        className={cn('ios-messenger-popover__item', thread.unreadCount > 0 && 'is-unread')}
        onClick={() => onSelect(thread.threadId)}
      >
        <FeedUserAvatar
          name={thread.otherName}
          avatarUrl={thread.otherAvatarThumbnailUrl ?? thread.otherAvatarUrl}
          className="h-[52px] w-[52px]"
        />
        <div className="ios-messenger-popover__copy">
          <div className="ios-messenger-popover__name">{thread.otherName}</div>
          <div className="ios-messenger-popover__preview-row">
            <span className="ios-messenger-popover__preview">
              {thread.lastMessageBody || 'Start a conversation'}
            </span>
            {thread.lastMessageAt ? (
              <span
                className={cn(
                  'ios-messenger-popover__time',
                  thread.unreadCount > 0 && 'is-unread',
                )}
              >
                · {formatMessengerTime(thread.lastMessageAt)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="ios-messenger-popover__side">
          {sentByViewer && viewerAvatar ? (
            <img
              src={viewerAvatar}
              alt=""
              className="ios-messenger-popover__read-avatar"
            />
          ) : thread.unreadCount > 0 ? (
            <span className="ios-messenger-popover__unread-dot" aria-label="Unread" />
          ) : null}
        </div>
      </button>
    </li>
  )
})

function useMessengerPanelPosition(open: boolean, triggerRef: React.RefObject<HTMLButtonElement | null>) {
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({})

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect()
      const gap = 8
      const width = Math.min(360, window.innerWidth - 24)
      const right = Math.max(12, window.innerWidth - rect.right)
      const top = rect.bottom + gap
      const maxHeight = Math.min(560, window.innerHeight - top - 12)

      setPanelStyle({
        top,
        right,
        width,
        maxHeight: Math.max(240, maxHeight),
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, triggerRef])

  return panelStyle
}

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
    queryKey: messengerThreadsQueryKey,
    queryFn: messengerApi.listThreads,
    staleTime: 15_000,
    enabled: open,
  })

  const filteredThreads = useMemo(
    () => filterThreads(threads, filter, deferredSearch),
    [deferredSearch, filter, threads],
  )

  const isMessengerRoute = location.pathname.startsWith('/messenger')
  const panelStyle = useMessengerPanelPosition(open, triggerRef)

  useEffect(() => {
    if (!open) {
      setSettingsOpen(false)
      return
    }

    void refetch()

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
      setSettingsOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (settingsOpen) {
          setSettingsOpen(false)
          return
        }
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, refetch, settingsOpen])

  const toggleSettings = () => {
    setSettingsOpen((value) => !value)
  }

  const openThread = (threadId: string) => {
    setOpen(false)
    setSettingsOpen(false)
    void openMessengerPopup({ threadId })
  }

  const panel = open ? (
        <div
          ref={panelRef}
          className="ios-messenger-popover__panel"
          style={panelStyle}
          role="dialog"
          aria-label="Messenger"
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
            {FILTERS.map((entry) => (
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
                <PopoverThreadItem
                  key={thread.threadId}
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
        </div>
      ) : null

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

      {panel ? createPortal(panel, document.body) : null}
    </div>
  )
}
