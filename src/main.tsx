import '@/polyfill-crypto'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers/AppProviders'
import { loadStudioOverrideIfEnabled } from '@/shared/lib/studio-override-loader'
import '@/styles/globals.css'

void loadStudioOverrideIfEnabled().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
})
