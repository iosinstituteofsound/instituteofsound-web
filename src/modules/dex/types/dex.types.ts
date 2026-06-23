import type { ReactNode } from 'react'

export type DexModuleId =
  | 'now-playing'
  | 'identity'
  | 'dex-chat'
  | 'artist-scan'
  | 'signal-archive'
  | 'lyrics-database'
  | 'network-intel'

export interface DexContext {
  trackId?: string
  releaseId?: string
  artistProfileId?: string
  userId?: string
}

export interface DexConfig {
  apiBaseUrl?: string
  getAccessToken?: () => string | null | undefined
}

export interface DexShellProps extends DexConfig {
  context?: DexContext
  className?: string
}

export interface DexProviderProps {
  children: ReactNode
  config?: DexConfig
}
