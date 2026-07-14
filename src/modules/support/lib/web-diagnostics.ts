import type { TicketDiagnostics } from '@/modules/support/types/support.types'

export function buildWebDiagnostics(extras?: {
  route?: string
  lastErrorId?: string
}): TicketDiagnostics {
  const appVersion =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_VERSION?.trim()) || 'web'

  return {
    appVersion,
    platform: 'web',
    osVersion: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 64) : 'unknown',
    route: extras?.route ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
    lastErrorId: extras?.lastErrorId,
  }
}
