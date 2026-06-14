import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import { requiresAuthForNavigation } from '@/lib/auth/publicAccess'

type LoginGateContextValue = {
  open: boolean
  openLoginGate: (hint?: string) => void
  closeLoginGate: () => void
  hint: string | null
  /** Returns true if action may proceed (user signed in or path is public). */
  requireAuth: (href?: string) => boolean
}

const LoginGateContext = createContext<LoginGateContextValue | null>(null)

const DEFAULT_HINT =
  'Home, Academy, and Toolkit stay open. Everything else on the wire needs your operator account.'

export function LoginGateProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const [hint, setHint] = useState<string | null>(null)

  const openLoginGate = useCallback((nextHint?: string) => {
    setHint(nextHint ?? DEFAULT_HINT)
    setOpen(true)
  }, [])

  const closeLoginGate = useCallback(() => {
    setOpen(false)
  }, [])

  const requireAuth = useCallback(
    (href?: string) => {
      if (loading || user) return true
      if (href) {
        try {
          const path = href.startsWith('http')
            ? new URL(href).pathname
            : href.split('?')[0]?.split('#')[0] ?? href
          if (!requiresAuthForNavigation(path)) return true
        } catch {
          /* fall through */
        }
      }
      openLoginGate()
      return false
    },
    [loading, user, openLoginGate]
  )

  const value = useMemo(
    () => ({ open, openLoginGate, closeLoginGate, hint, requireAuth }),
    [open, openLoginGate, closeLoginGate, hint, requireAuth]
  )

  return <LoginGateContext.Provider value={value}>{children}</LoginGateContext.Provider>
}

export function useLoginGate() {
  const ctx = useContext(LoginGateContext)
  if (!ctx) throw new Error('useLoginGate must be used within LoginGateProvider')
  return ctx
}
