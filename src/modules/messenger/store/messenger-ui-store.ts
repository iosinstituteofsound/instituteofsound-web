import { create } from 'zustand'
import type { DmMessage, MessengerFilter } from '@/modules/messenger/types/messenger.types'

type MessengerUiState = {
  activeThreadId: string | null
  filter: MessengerFilter
  searchQuery: string
  showInfoPanel: boolean
  replyTo: DmMessage | null
  editingMessage: DmMessage | null
  forwardFrom: DmMessage | null
  typingByThread: Record<string, string[]>
  setActiveThreadId: (threadId: string | null) => void
  setFilter: (filter: MessengerFilter) => void
  setSearchQuery: (query: string) => void
  setShowInfoPanel: (show: boolean) => void
  setReplyTo: (message: DmMessage | null) => void
  setEditingMessage: (message: DmMessage | null) => void
  setForwardFrom: (message: DmMessage | null) => void
  setTyping: (threadId: string, userId: string, isTyping: boolean) => void
}

export const useMessengerUiStore = create<MessengerUiState>((set) => ({
  activeThreadId: null,
  filter: 'all',
  searchQuery: '',
  showInfoPanel: true,
  replyTo: null,
  editingMessage: null,
  forwardFrom: null,
  typingByThread: {},
  setActiveThreadId: (threadId) =>
    set({ activeThreadId: threadId, replyTo: null, editingMessage: null }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setShowInfoPanel: (showInfoPanel) => set({ showInfoPanel }),
  setReplyTo: (replyTo) => set({ replyTo, editingMessage: null }),
  setEditingMessage: (editingMessage) => set({ editingMessage, replyTo: null }),
  setForwardFrom: (forwardFrom) => set({ forwardFrom }),
  setTyping: (threadId, userId, isTyping) =>
    set((state) => {
      const current = state.typingByThread[threadId] ?? []
      const next = isTyping
        ? current.includes(userId)
          ? current
          : [...current, userId]
        : current.filter((id) => id !== userId)
      return {
        typingByThread: {
          ...state.typingByThread,
          [threadId]: next,
        },
      }
    }),
}))
