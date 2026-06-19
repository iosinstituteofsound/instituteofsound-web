import { Outlet } from 'react-router-dom'
import { useAuthSession } from '@/modules/auth/hooks/use-auth'
import { useLayoutStore, resolvePublicConfig } from '@/app/stores/layout-store'
import { PublicHeader } from '@/app/layouts/public-header'
import { PublicFooter } from '@/app/layouts/public-footer'
import { env } from '@/shared/config/env'
import { DEFAULT_LAYOUT_CONFIG } from '@/shared/types/layout.types'
import '@/styles/public-layout.css'

export function PublicLayout() {
  const { authorization } = useAuthSession()
  const activeLayout = useLayoutStore((state) => state.activeLayout)
  const publicConfig = resolvePublicConfig(activeLayout ?? authorization?.activeLayout)

  if (!publicConfig.enabled) {
    return (
      <div className="min-h-screen bg-background">
        <main className="ios-public-main">
          <Outlet />
        </main>
      </div>
    )
  }

  const brand = publicConfig.header.brandTitle?.trim() || env.appName
  const copyright: string =
    publicConfig.footer.copyright?.trim() ||
    DEFAULT_LAYOUT_CONFIG.public.footer.copyright ||
    '© Institute of Sound'

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader
        brand={brand}
        navLinks={publicConfig.header.navLinks}
        showAuthButtons={publicConfig.header.showAuthButtons}
      />
      <main className="ios-public-main">
        <Outlet />
      </main>
      {publicConfig.footer.enabled ? (
        <PublicFooter
          brand={brand}
          copyright={copyright}
          linkGroups={publicConfig.footer.linkGroups}
        />
      ) : null}
    </div>
  )
}
