import { DexShell } from '@instituteofsound/dex'
import '@instituteofsound/dex/styles/dex.css'
import { env } from '@/shared/config/env'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { useDexContext } from '@/modules/dex/hooks/use-dex-context'
import { useDexAutoOpen } from '@/modules/dex/hooks/use-dex-auto-open'

export function DexIntegration() {
  const context = useDexContext()
  useDexAutoOpen()

  return (
    <DexShell
      apiBaseUrl={env.apiBaseUrl}
      getAccessToken={() => tokenStorage.getAccessToken()}
      context={context}
    />
  )
}
