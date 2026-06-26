import { create } from 'zustand'
import * as messengerApi from '@/modules/messenger/api/messenger.api'

export type MessengerPopupWindow = {
  key: string
  threadId: string
  minimized: boolean
  stacked: boolean
}

export type MessengerOpenDetail = {
  threadId?: string
  userId?: string
}

export const MAX_DOCKED_WINDOWS = 3

type MessengerPopupState = {
  windows: MessengerPopupWindow[]
  openChat: (detail: MessengerOpenDetail) => Promise<void>
  closeChat: (threadId: string) => void
  toggleMinimize: (threadId: string) => void
  focusChat: (threadId: string) => void
  promoteFromStack: (threadId: string) => void
}

function applyStacking(windows: MessengerPopupWindow[]): MessengerPopupWindow[] {
  return windows.map((window, index) => ({
    ...window,
    stacked: index >= MAX_DOCKED_WINDOWS,
  }))
}

function moveToFront(windows: MessengerPopupWindow[], threadId: string): MessengerPopupWindow[] {
  const hit = windows.find((window) => window.threadId === threadId)
  if (!hit) return windows
  const rest = windows.filter((window) => window.threadId !== threadId)
  return applyStacking([{ ...hit, minimized: false, stacked: false }, ...rest])
}

export const useMessengerPopupStore = create<MessengerPopupState>((set) => ({
  windows: [],
  openChat: async (detail) => {
    let threadId = detail.threadId
    if (!threadId && detail.userId) {
      const thread = await messengerApi.createThread(detail.userId)
      threadId = thread.threadId
    }
    if (!threadId) return

    set((state) => {
      const existing = state.windows.find((window) => window.threadId === threadId)
      if (existing) {
        return { windows: moveToFront(state.windows, threadId!) }
      }
      const next: MessengerPopupWindow[] = [
        { key: threadId!, threadId: threadId!, minimized: false, stacked: false },
        ...state.windows,
      ]
      return { windows: applyStacking(next) }
    })
  },
  closeChat: (threadId) =>
    set((state) => ({ windows: applyStacking(state.windows.filter((window) => window.threadId !== threadId)) })),
  toggleMinimize: (threadId) =>
    set((state) => ({
      windows: state.windows.map((window) =>
        window.threadId === threadId && !window.stacked
          ? { ...window, minimized: !window.minimized }
          : window,
      ),
    })),
  focusChat: (threadId) =>
    set((state) => ({ windows: moveToFront(state.windows, threadId) })),
  promoteFromStack: (threadId) =>
    set((state) => ({ windows: moveToFront(state.windows, threadId) })),
}))

export const MESSENGER_OPEN_EVENT = 'ios:messenger-open'

export function dispatchOpenMessenger(detail: MessengerOpenDetail) {
  window.dispatchEvent(new CustomEvent<MessengerOpenDetail>(MESSENGER_OPEN_EVENT, { detail }))
}

export function selectDockedWindows(windows: MessengerPopupWindow[]) {
  return windows.filter((window) => !window.stacked)
}

export function selectStackedWindows(windows: MessengerPopupWindow[]) {
  return windows.filter((window) => window.stacked)
}
