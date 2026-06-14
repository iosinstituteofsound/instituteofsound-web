import { Link, Outlet } from 'react-router-dom'
import { useAuthSession } from '@/modules/auth/hooks/use-auth'
import { useLayoutStore, resolvePublicConfig } from '@/app/stores/layout-store'
import { env } from '@/shared/config/env'
import { Button } from '@/shared/components/ui/button'
import { DEFAULT_LAYOUT_CONFIG } from '@/shared/types/layout.types'

export function PublicLayout() {
  const { authorization } = useAuthSession()
  const activeLayout = useLayoutStore((state) => state.activeLayout)
  const publicConfig = resolvePublicConfig(activeLayout ?? authorization?.activeLayout)

  if (!publicConfig.enabled) {
    return (
      <div className="min-h-screen bg-background">
        <main>
          <Outlet />
        </main>
      </div>
    )
  }

  const brand = publicConfig.header.brandTitle?.trim() || env.appName

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="font-semibold">
            {brand}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {publicConfig.header.navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
            {publicConfig.header.showAuthButtons ? (
              <div className="flex gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      {publicConfig.footer.enabled ? (
        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-6">
            {publicConfig.footer.copyright ? (
              <p className="text-sm text-muted-foreground">{publicConfig.footer.copyright}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{DEFAULT_LAYOUT_CONFIG.public.footer.copyright}</p>
            )}
            {publicConfig.footer.linkGroups.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {publicConfig.footer.linkGroups.map((group) => (
                  <div key={group.title}>
                    <p className="text-sm font-medium">{group.title}</p>
                    <ul className="mt-2 space-y-1">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground">
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
        </footer>
      ) : null}
    </div>
  )
}
