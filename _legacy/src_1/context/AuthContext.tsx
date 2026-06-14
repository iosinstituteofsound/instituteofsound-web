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
  fetchUserProfile,
} from '@/lib/auth/provider'
import {
  hasArtistAccess,
  hasEditorialAccess,
  hasPermission,
  hasAnyPermission,
  isSuperAdmin,
} from '@/lib/auth/permissions'
import { isLiveApiMode } from '@/lib/api/liveMode'
import type { User, UserAuthorization } from '@/lib/auth/types'

interface AuthContextValue {
  user: User | null
  authorization: UserAuthorization | undefined
  loading: boolean
  mode: 'api' | 'local'
  configHint: string | null
  signInWithGoogle: (intent?: 'member' | 'artist' | 'desk' | 'editor_apply') => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  hasPermission: (slug: string) => boolean
  hasAnyPermission: (slugs: string[]) => boolean
  isSuperAdmin: boolean
  /** @deprecated Use isSuperAdmin */
  isSuperEditor: boolean
  /** @deprecated Use hasEditorialAccess via authorization */
  isEditor: boolean
  /** @deprecated Use hasArtistAccess via authorization */
  isArtist: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const mode = authMode()
  const configHint = getAuthConfigHint()
  const authorization = user?.authorization

  useEffect(() => {
    let cancelled = false

    const authTimeout = window.setTimeout(() => {
      if (!cancelled) {
        console.warn('[auth] Session check timed out — continuing without blocking the UI')
        setLoading(false)
      }
    }, 12_000)

    getCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.warn('[auth] getCurrentUser failed:', err)
      })
      .finally(() => {
        window.clearTimeout(authTimeout)
        if (!cancelled) setLoading(false)
      })

    const unsubscribe = subscribeAuth((u) => {
      if (!cancelled) setUser(u)
    })

    return () => {
      cancelled = true
      window.clearTimeout(authTimeout)
      unsubscribe()
    }
  }, [])

  const signInWithGoogle = useCallback(
    async (intent: 'member' | 'artist' | 'desk' | 'editor_apply' = 'member') => {
      await authSignInWithGoogle(intent)
    },
    [],
  )

  const logout = useCallback(async () => {
    await authLogout()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!user?.id || !isLiveApiMode()) {
      const u = await getCurrentUser()
      setUser(u)
      return
    }
    try {
      const u = await fetchUserProfile(user.id)
      setUser(u)
    } catch {
      const u = await getCurrentUser()
      setUser(u)
    }
  }, [user?.id])

  const value = useMemo(
    () => ({
      user,
      authorization,
      loading,
      mode,
      configHint,
      signInWithGoogle,
      logout,
      refreshUser,
      hasPermission: (slug: string) => hasPermission(authorization, slug),
      hasAnyPermission: (slugs: string[]) => hasAnyPermission(authorization, slugs),
      isSuperAdmin: isSuperAdmin(authorization),
      isSuperEditor: isSuperAdmin(authorization),
      isEditor: hasEditorialAccess(authorization),
      isArtist: hasArtistAccess(authorization),
    }),
    [user, authorization, loading, mode, configHint, signInWithGoogle, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useRequiredPermission(permission: string) {
  const { user, loading, hasPermission: check } = useAuth()
  return { user, loading, hasPermission: check(permission) }
}
