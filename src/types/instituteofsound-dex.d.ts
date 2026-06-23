declare module '@instituteofsound/dex' {
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

  export function DexShell(props: DexShellProps): ReactNode
  export function DexProvider(props: {
    children: ReactNode
    config?: DexConfig
  }): ReactNode
  export function openDexForPlayback(module?: DexModuleId): void
}

declare module '@instituteofsound/dex/styles/dex.css' {
  const content: string
  export default content
}
