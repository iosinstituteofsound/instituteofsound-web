import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  authMode,
  getAuthConfigHint,
  getCurrentUser,
  logout as authLogout,
  signInWithGoogle as authSignInWithGoogle,
  subscribeAuth,
} from '@/lib/auth/provider'
import { isEditorStaff, isSuperEditor } from '@/lib/auth/roles'
import type { User, UserRole } from '@/lib/auth/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  mode: 'supabase' | 'local'
  configHint: string | null
  signInWithGoogle: (intent?: 'artist' | 'desk') => Promise<void>
  logout: () => Promise<void>
  isEditor: boolean
  isSuperEditor: boolean
  isArtist: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const mode = authMode()
  const configHint = getAuthConfigHint()

  useEffect(() => {
    let cancelled = false

    getCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const unsubscribe = subscribeAuth((u) => {
      if (!cancelled) setUser(u)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const signInWithGoogle = useCallback(async (intent: 'artist' | 'desk' = 'artist') => {
    await authSignInWithGoogle(intent)
  }, [])

  const logout = useCallback(async () => {
    await authLogout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      mode,
      configHint,
      signInWithGoogle,
      logout,
      isEditor: user ? isEditorStaff(user.role) : false,
      isSuperEditor: user ? isSuperEditor(user.role) : false,
      isArtist: user?.role === 'artist',
    }),
    [user, loading, mode, configHint, signInWithGoogle, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useRequiredRole(role: UserRole) {
  const { user, loading } = useAuth()
  const allowed =
    role === 'editor'
      ? user && isEditorStaff(user.role)
      : user?.role === role
  return { user, loading, hasRole: Boolean(allowed) }
}
