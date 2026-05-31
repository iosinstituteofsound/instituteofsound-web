import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  MESSENGER_OPEN_EVENT,
  useMessengerPopup,
  type MessengerOpenDetail,
} from '@/context/MessengerPopupContext'
import { MessengerChatWindow } from '@/components/messenger/MessengerChatWindow'
import { isMessagingAvailable } from '@/lib/dm/service'

export function MessengerDock() {
  const { user } = useAuth()
  const { windows, openChat } = useMessengerPopup()

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<MessengerOpenDetail>).detail
      if (detail) void openChat(detail)
    }
    window.addEventListener(MESSENGER_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(MESSENGER_OPEN_EVENT, onOpen)
  }, [openChat])

  if (!user || !isMessagingAvailable() || windows.length === 0) return null

  return (
    <div className="v2-messenger-dock hidden lg:flex" aria-label="Open conversations">
      {windows.map((w) => (
        <MessengerChatWindow key={w.key} threadId={w.threadId} minimized={w.minimized} />
      ))}
    </div>
  )
}
