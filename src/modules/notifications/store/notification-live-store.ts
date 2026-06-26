import { create } from 'zustand'
import type { NotificationDto } from '@/modules/notifications/types/notification.types'

type NotificationLiveState = {
  unreadCount: number
  items: NotificationDto[]
  ready: boolean
  syncFromApi: (data: { items: NotificationDto[]; unreadCount: number }) => void
  pushLive: (notification: NotificationDto) => void
  markReadLocal: (id: string) => void
  markAllReadLocal: () => void
  reset: () => void
}

export const useNotificationLiveStore = create<NotificationLiveState>((set, get) => ({
  unreadCount: 0,
  items: [],
  ready: false,
  syncFromApi: (data) =>
    set({
      items: data.items,
      unreadCount: data.unreadCount,
      ready: true,
    }),
  pushLive: (notification) => {
    const state = get()
    if (state.items.some((item) => item.id === notification.id)) return
    set({
      items: [notification, ...state.items].slice(0, 40),
      unreadCount: state.unreadCount + 1,
      ready: true,
    })
  },
  markReadLocal: (id) => {
    const state = get()
    const target = state.items.find((item) => item.id === id)
    if (!target || target.readAt) return
    set({
      items: state.items.map((item) =>
        item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })
  },
  markAllReadLocal: () => {
    const readAt = new Date().toISOString()
    set((state) => ({
      unreadCount: 0,
      items: state.items.map((item) => (item.readAt ? item : { ...item, readAt })),
    }))
  },
  reset: () => set({ unreadCount: 0, items: [], ready: false }),
}))
