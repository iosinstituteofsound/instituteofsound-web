import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { applyThemePalette } from '@/lib/theme/applyThemePalette'
import { themeMetaColors } from '@/lib/theme/design-tokens'
import {
  readStoredThemeMode,
  themeColorScheme,
  themeModeHints,
  themeModeLabels,
  themeModes,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '@/lib/theme/palettes'

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  isBright: boolean
  isMetallic: boolean
  isDark: boolean
  colorScheme: 'light' | 'dark'
  labels: typeof themeModeLabels
  hints: typeof themeModeHints
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyThemeMode(mode: ThemeMode) {
  const root = document.documentElement
  root.dataset.theme = mode
  root.style.colorScheme = themeColorScheme(mode)
  applyThemePalette(mode)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', themeMetaColors[mode])
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredThemeMode())

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
  }, [])

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      const index = themeModes.indexOf(current)
      return themeModes[(index + 1) % themeModes.length] ?? 'dark'
    })
  }, [])

  useLayoutEffect(() => {
    applyThemeMode(mode)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch {
      /* private browsing */
    }
  }, [mode])

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      isBright: mode === 'bright',
      isMetallic: mode === 'metallic',
      isDark: themeColorScheme(mode) === 'dark',
      colorScheme: themeColorScheme(mode),
      labels: themeModeLabels,
      hints: themeModeHints,
    }),
    [mode, setMode, toggleMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
