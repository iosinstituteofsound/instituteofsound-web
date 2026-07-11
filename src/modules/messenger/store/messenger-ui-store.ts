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
  setActiveThreadId: (threadId: string | null) => void
  setFilter: (filter: MessengerFilter) => void
  setSearchQuery: (query: string) => void
  setShowInfoPanel: (show: boolean) => void
  setReplyTo: (message: DmMessage | null) => void
  setEditingMessage: (message: DmMessage | null) => void
  setForwardFrom: (message: DmMessage | null) => void
}

export const useMessengerUiStore = create<MessengerUiState>((set) => ({
  activeThreadId: null,
  filter: 'all',
  searchQuery: '',
  showInfoPanel: true,
  replyTo: null,
  editingMessage: null,
  forwardFrom: null,
  setActiveThreadId: (threadId) =>
    set((state) => {
      // Same thread re-focus (input click / popup focus) must NOT wipe reply/edit.
      if (state.activeThreadId === threadId) {
        return { activeThreadId: threadId }
      }
      return { activeThreadId: threadId, replyTo: null, editingMessage: null }
    }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setShowInfoPanel: (showInfoPanel) => set({ showInfoPanel }),
  setReplyTo: (replyTo) => set({ replyTo, editingMessage: null }),
  setEditingMessage: (editingMessage) => set({ editingMessage, replyTo: null }),
  setForwardFrom: (forwardFrom) => set({ forwardFrom }),
}))
