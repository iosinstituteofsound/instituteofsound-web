import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getOrCreateThread, isMessagingAvailable } from '@/lib/dm/service'

export const MESSENGER_OPEN_EVENT = 'ios:messenger-open'

export type MessengerOpenDetail = {
  userId?: string
  threadId?: string
}

export type MessengerWindowState = {
  key: string
  threadId: string
  minimized: boolean
}

interface MessengerPopupContextValue {
  windows: MessengerWindowState[]
  openChat: (detail: MessengerOpenDetail) => Promise<void>
  closeChat: (threadId: string) => void
  toggleMinimize: (threadId: string) => void
  focusChat: (threadId: string) => void
}

const MessengerPopupContext = createContext<MessengerPopupContextValue | null>(null)

const MAX_WINDOWS = 3

export function MessengerPopupProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<MessengerWindowState[]>([])

  const openChat = useCallback(async (detail: MessengerOpenDetail) => {
    if (!isMessagingAvailable()) return

    let threadId = detail.threadId
    if (!threadId && detail.userId) {
      threadId = await getOrCreateThread(detail.userId)
    }
    if (!threadId) return

    setWindows((prev) => {
      const existing = prev.find((w) => w.threadId === threadId)
      if (existing) {
        return [
          { ...existing, minimized: false },
          ...prev.filter((w) => w.threadId !== threadId),
        ]
      }

      const next: MessengerWindowState[] = [
        { key: threadId!, threadId: threadId!, minimized: false },
        ...prev,
      ]
      return next.slice(0, MAX_WINDOWS)
    })
  }, [])

  const closeChat = useCallback((threadId: string) => {
    setWindows((prev) => prev.filter((w) => w.threadId !== threadId))
  }, [])

  const toggleMinimize = useCallback((threadId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.threadId === threadId ? { ...w, minimized: !w.minimized } : w)),
    )
  }, [])

  const focusChat = useCallback((threadId: string) => {
    setWindows((prev) => {
      const hit = prev.find((w) => w.threadId === threadId)
      if (!hit) return prev
      return [hit, ...prev.filter((w) => w.threadId !== threadId)]
    })
  }, [])

  const value = useMemo(
    () => ({ windows, openChat, closeChat, toggleMinimize, focusChat }),
    [windows, openChat, closeChat, toggleMinimize, focusChat],
  )

  return <MessengerPopupContext.Provider value={value}>{children}</MessengerPopupContext.Provider>
}

export function useMessengerPopup() {
  const ctx = useContext(MessengerPopupContext)
  if (!ctx) {
    throw new Error('useMessengerPopup must be used within MessengerPopupProvider')
  }
  return ctx
}

export function useMessengerPopupOptional() {
  return useContext(MessengerPopupContext)
}

/** Fire from anywhere (e.g. hooks) to open the floating chat. */
export function dispatchOpenMessenger(detail: MessengerOpenDetail) {
  window.dispatchEvent(new CustomEvent<MessengerOpenDetail>(MESSENGER_OPEN_EVENT, { detail }))
}
