import { useEffect } from 'react'
import { closeDex, DexShell } from '@/modules/dex/dex-runtime'
import '@/modules/dex/dex-runtime.css'
import { useAuthStore } from '@/app/stores/auth-store'
import { env } from '@/shared/config/env'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { useDexContext } from '@/modules/dex/hooks/use-dex-context'
import { useDexAutoOpen } from '@/modules/dex/hooks/use-dex-auto-open'

export function DexIntegration() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const context = useDexContext()
  useDexAutoOpen()

  useEffect(() => {
    if (!isAuthenticated) closeDex()
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <DexShell
      apiBaseUrl={env.apiBaseUrl}
      getAccessToken={() => tokenStorage.getAccessToken()}
      context={context}
    />
  )
}
