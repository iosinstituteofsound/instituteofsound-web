import { useEffect } from 'react'
import { MessengerChatWindow } from '@/modules/messenger/components/messenger-chat-window'
import { MessengerDockStack } from '@/modules/messenger/components/messenger-dock-stack'
import {
  MESSENGER_OPEN_EVENT,
  selectDockedWindows,
  selectStackedWindows,
  useMessengerPopupStore,
  type MessengerOpenDetail,
} from '@/modules/messenger/store/messenger-popup-store'
import { useAuthStore } from '@/app/stores/auth-store'

export function MessengerDock() {
  const userId = useAuthStore((s) => s.userId)
  const windows = useMessengerPopupStore((s) => s.windows)
  const openChat = useMessengerPopupStore((s) => s.openChat)

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<MessengerOpenDetail>).detail
      if (detail) void openChat(detail)
    }
    window.addEventListener(MESSENGER_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(MESSENGER_OPEN_EVENT, onOpen)
  }, [openChat])

  if (!userId || windows.length === 0) return null

  const dockedWindows = selectDockedWindows(windows)
  const stackedWindows = selectStackedWindows(windows)

  return (
    <div className="messenger-dock" aria-label="Open conversations">
      {stackedWindows.length ? (
        <MessengerDockStack threadIds={stackedWindows.map((window) => window.threadId)} />
      ) : null}
      {[...dockedWindows].reverse().map((window) => (
        <MessengerChatWindow
          key={window.key}
          threadId={window.threadId}
          minimized={window.minimized}
        />
      ))}
    </div>
  )
}
