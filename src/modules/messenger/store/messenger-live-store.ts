import { create } from 'zustand'

type MessengerLiveState = {
  unreadCount: number
  ready: boolean
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  reset: () => void
}

export const useMessengerLiveStore = create<MessengerLiveState>((set) => ({
  unreadCount: 0,
  ready: false,
  setUnreadCount: (count) => set({ unreadCount: count, ready: true }),
  incrementUnread: () =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
      ready: true,
    })),
  reset: () => set({ unreadCount: 0, ready: false }),
}))
