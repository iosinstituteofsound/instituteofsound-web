import { create } from 'zustand'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { resetNotificationsRealtime } from '@/modules/notifications/lib/init-notifications-realtime'

interface AuthState {
  userId: string | null
  email: string | null
  isAuthenticated: boolean
  setSession: (userId: string, email: string) => void
  clearSession: () => void
  syncFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  isAuthenticated: tokenStorage.hasSession(),
  setSession: (userId, email) =>
    set({ userId, email, isAuthenticated: true }),
  clearSession: () => {
    tokenStorage.clear()
    resetNotificationsRealtime()
    set({ userId: null, email: null, isAuthenticated: false })
  },
  syncFromStorage: () =>
    set({ isAuthenticated: tokenStorage.hasSession() }),
}))
