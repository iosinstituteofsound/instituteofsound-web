import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { getRouteMeta, type RouteMeta } from '@/lib/nav/routeModes'

type ShellContextValue = {
  meta: RouteMeta
  commandOpen: boolean
  openCommand: () => void
  closeCommand: () => void
  toggleCommand: () => void
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function ShellProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [commandOpen, setCommandOpen] = useState(false)

  const meta = useMemo(() => getRouteMeta(pathname), [pathname])

  const openCommand = useCallback(() => setCommandOpen(true), [])
  const closeCommand = useCallback(() => setCommandOpen(false), [])
  const toggleCommand = useCallback(() => setCommandOpen((o) => !o), [])

  const value = useMemo(
    () => ({ meta, commandOpen, openCommand, closeCommand, toggleCommand }),
    [meta, commandOpen, openCommand, closeCommand, toggleCommand],
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useShell must be used within ShellProvider')
  return ctx
}
