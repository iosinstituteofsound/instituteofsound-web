import { Link, Outlet } from 'react-router-dom'
import { useAuthSession } from '@/modules/auth/hooks/use-auth'
import { useLayoutStore, resolvePublicConfig } from '@/app/stores/layout-store'
import { PublicHeader } from '@/app/layouts/public-header'
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
  const copyright =
    publicConfig.footer.copyright?.trim() || DEFAULT_LAYOUT_CONFIG.public.footer.copyright

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
        <footer className="public-footer">
          <div className="public-footer__inner">
            <div className="public-footer__top">
              <div>
                <Link to="/" className="public-footer__brand">
                  <img src="/pwa/icon-master.svg" alt="" className="public-header__logo" />
                  <div>
                    <p className="public-footer__brand-mark">IOS</p>
                    <p className="public-footer__brand-name">{brand}</p>
                  </div>
                </Link>
                <p className="public-footer__tagline">
                  Underground music magazine and platform — culture built, not posted.
                </p>
              </div>
              {publicConfig.footer.linkGroups.length > 0 ? (
                <div className="public-footer__groups">
                  {publicConfig.footer.linkGroups.map((group) => (
                    <div key={group.title}>
                      <p className="public-footer__group-title">{group.title}</p>
                      <ul className="public-footer__links">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link to={link.href} className="public-footer__link">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <p className="public-footer__copy">{copyright}</p>
          </div>
        </footer>
      ) : null}
    </div>
  )
}
