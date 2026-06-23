import type { DexModuleId, DexProviderProps, DexShellProps } from '@/modules/dex/types/dex.types'

/** No-op DEX shell — replaced at build time when instituteofsound-dex is available. */
export function DexShell(_props: DexShellProps) {
  return null
}

export function DexProvider({ children }: DexProviderProps) {
  return children
}

export function openDexForPlayback(_module?: DexModuleId) {}

export function closeDex() {}
